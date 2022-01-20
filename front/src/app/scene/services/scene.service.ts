import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import MainScene from 'src/app/shared/classes/MainScene';
import { ViewerI, VIEWER_STATE } from 'src/app/shared/models/viewer.interface';
import {
  CAMERA_ANIM_DUR,
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  CAMERA_POSITION_RATE,
  CLICKED_OBJ_MATERIAL,
  GRID_HELPER_DIVISIONS,
  GRID_HELPER_SIZE_RATE,
  OUTLINE_PASS_EDGE_STRENGTH,
  OUTLINE_PASS_EDGE_THICKNESS,
  OUTLINE_PASS_HIDDEN_EDGE_COLOR,
  OUTLINE_PASS_VISIBLE_EDGE_COLOR,
  RENDERER_CLEAR_COLOR,
  RENDERER_PIXEL_RATIO,
  TRANSPARENT_OBJ_MATERIAL,
} from 'src/app/shared/models/viewerConstants';
import { environment } from 'src/environments/environment';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { VIEWER_MOUSE_MODE } from 'src/app/project-editor/components/editor-viewer/editor-viewer.component';

@Injectable({
  providedIn: 'root',
})
export class SceneService {
  private apiUrl: string = environment.baseUrl;

  viewer!: ViewerI;

  effectFXAA = new ShaderPass(FXAAShader);
  canvasRect: any;
  modelLongestSide = 0;

  selectedObj: any = null;
  hoveredObj: any = null;
  hiddenObjects$ = new BehaviorSubject<any[]>([]);
  annotations$ = new BehaviorSubject<any[]>([]);

  animations: any[] = [];

  constructor(private http: HttpClient) {}

  loadDefaultModel(): Observable<any> {
    return this.http.get(`${this.apiUrl}/viewer/default`, { withCredentials: true });
  }

  shadeColor(hexadecimalColor: number, percent: number) {
    let color = hexadecimalColor.toString(16);

    color = color.replace(/^#/, '');
    if (color.length === 3) color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];

    const match = color.match(/.{2}/g);
    let [r, g, b]: any[] = [];
    if (match) [r, g, b] = match;
    [r, g, b] = [parseInt(r, 16) + percent, parseInt(g, 16) + percent, parseInt(b, 16) + percent];

    r = Math.max(Math.min(255, r), 0).toString(16);
    g = Math.max(Math.min(255, g), 0).toString(16);
    b = Math.max(Math.min(255, b), 0).toString(16);

    const rr = (r.length < 2 ? '0' : '') + r;
    const gg = (g.length < 2 ? '0' : '') + g;
    const bb = (b.length < 2 ? '0' : '') + b;

    return parseInt(rr + gg + bb, 16);
  }

  createViewer() {
    this.viewer = {
      scene: new MainScene(),
      renderer: new THREE.WebGLRenderer(),
      composer: null,
      outlinePass: {},
      labelRenderer: null,
      camera: new THREE.PerspectiveCamera(),
      controls: {},
      modelBoundingBox: {},
      raycaster: new THREE.Raycaster(),
      clock: new THREE.Clock(),
      actions: [],
      time: 0,
      isPlaying: false,
      model: new THREE.Object3D(),
      plant: new THREE.Vector3(),
      state: VIEWER_STATE.Default,
    };
  }

  getViewer() {
    return this.viewer;
  }

  getHiddenObjects() {
    return this.hiddenObjects$.asObservable();
  }

  setHiddenObjects(hiddenObjects: any[]) {
    this.hiddenObjects$.next(hiddenObjects);
  }

  getModel() {
    return this.viewer.model;
  }

  getAnnotations() {
    return this.annotations$.asObservable();
  }

  setAnnotations(annotations: any[]) {
    this.annotations$.next([...annotations]);
  }

  setCamera(aspect: number) {
    this.viewer.camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, CAMERA_NEAR, CAMERA_FAR);
  }

  setRenderer(canvas: any, wrapper: any, pixelRatio: number) {
    this.viewer.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      powerPreference: 'high-performance',
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: true,
    });
    this.viewer.renderer.shadowMap.enabled = true;
    this.viewer.renderer.setClearColor(0xffffff, 0);
    this.viewer.renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    this.viewer.renderer.setPixelRatio(
      pixelRatio > RENDERER_PIXEL_RATIO ? RENDERER_PIXEL_RATIO : pixelRatio,
    );
    this.viewer.renderer.setClearColor(RENDERER_CLEAR_COLOR);
    this.viewer.renderer.outputEncoding = THREE.GammaEncoding;
  }

  setLabelRenderer(wrapper: any) {
    this.viewer.labelRenderer = new CSS2DRenderer();
    this.viewer.labelRenderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    this.viewer.labelRenderer.domElement.style.position = 'absolute';
    this.viewer.labelRenderer.domElement.style.top = '0px';
    this.viewer.labelRenderer.domElement.style.pointerEvents = 'none';
  }

  setCanvasRect(canvasRect: any) {
    this.canvasRect = canvasRect;
  }

  setComposer() {
    this.viewer.composer = new EffectComposer(this.viewer.renderer);
    const renderPass = new RenderPass(this.viewer.scene, this.viewer.camera);
    this.viewer.composer.addPass(renderPass);
    this.effectFXAA = new ShaderPass(FXAAShader);
    this.effectFXAA.uniforms['resolution'].value.set(
      1 / this.canvasRect.width,
      1 / this.canvasRect.height,
    );
    this.viewer.composer.addPass(this.effectFXAA);
    this.viewer.outlinePass = new OutlinePass(
      new THREE.Vector2(this.canvasRect.width, this.canvasRect.height),
      this.viewer.scene,
      this.viewer.camera,
    );
    this.viewer.outlinePass.edgeStrength = OUTLINE_PASS_EDGE_STRENGTH;
    this.viewer.outlinePass.edgeThickness = OUTLINE_PASS_EDGE_THICKNESS;
    this.viewer.outlinePass.visibleEdgeColor.set(OUTLINE_PASS_VISIBLE_EDGE_COLOR);
    this.viewer.outlinePass.hiddenEdgeColor.set(OUTLINE_PASS_HIDDEN_EDGE_COLOR);
    this.viewer.composer.addPass(this.viewer.outlinePass);
  }

  setControls() {
    this.viewer.controls = new OrbitControls(this.viewer.camera, this.viewer.renderer.domElement);
  }

  setMixer(model: any) {
    this.viewer.mixer = new THREE.AnimationMixer(model.scene);
    this.animations = model.animations;
  }

  setModel(model: any) {
    this.viewer.model = model.scene.children[0];
    (this.viewer.model as any).isRoot = true;
    this.viewer.scene.add(model.scene);
  }

  setMeshesDefaultMaterial() {
    this.viewer.model.traverse((child: any) => {
      if ((child instanceof THREE.Mesh) as any) {
        child.defaultMaterial = child.material.clone();
      }
    });
  }

  setGridHelper(gltf: any) {
    const boundBox = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    boundBox.getSize(size);
    this.modelLongestSide = Math.max(size.x, size.y, size.z);
    const gridHelper = new THREE.GridHelper(
      this.modelLongestSide * GRID_HELPER_SIZE_RATE,
      GRID_HELPER_DIVISIONS,
    );

    const center = new THREE.Vector3();
    boundBox.getCenter(center);
    gridHelper.position.set(center.x, boundBox.min.y, center.z);
    gridHelper.name = '__Grid';
    gltf.scene.add(gridHelper);
  }

  setLight() {
    this.viewer.scene.setLight(this.modelLongestSide);
  }

  setCameraPosition() {
    this.viewer.camera.position.set(
      this.modelLongestSide * CAMERA_POSITION_RATE,
      (this.modelLongestSide * CAMERA_POSITION_RATE) / 2,
      this.modelLongestSide * CAMERA_POSITION_RATE,
    );
    this.viewer.controls.update();
  }

  resizeCanvas(box: any, canvas: any) {
    this.viewer.renderer.setSize(box.width, box.height);
    const pixelRatio = this.viewer.renderer.getPixelRatio();
    if (this.viewer.composer) this.viewer.composer.setSize(box.width, box.height);
    this.effectFXAA.uniforms['resolution'].value.set(
      (1 / box.width) * pixelRatio,
      (1 / box.height) * pixelRatio,
    );
    this.viewer.camera.aspect = box.width / box.height;
    this.viewer.camera.updateProjectionMatrix();
    this.canvasRect = canvas.getBoundingClientRect();
    if (this.viewer.labelRenderer) this.viewer.labelRenderer.setSize(box.width, box.height);
  }

  animateScene() {
    this.viewer.mixer?.update(this.viewer.clock.getDelta() / 3);
    this.viewer.controls.update();
    // this.viewer.renderer.render(this.viewer.scene, this.viewer.camera);
    if (this.viewer.composer) this.viewer.composer.render();
    if (this.viewer.labelRenderer)
      this.viewer.labelRenderer.render(this.viewer.scene, this.viewer.camera);
  }

  moveCameraWithAnimation(onCompleteCallback: () => void) {
    this.viewer.controls.enabled = false;
    const oldCameraPos = this.viewer.camera.position.clone();
    const newCameraPos = new THREE.Vector3(
      this.modelLongestSide * CAMERA_POSITION_RATE,
      (this.modelLongestSide * CAMERA_POSITION_RATE) / 2,
      this.modelLongestSide * CAMERA_POSITION_RATE,
    );
    const tween = new TWEEN.Tween(oldCameraPos)
      .to(newCameraPos, CAMERA_ANIM_DUR)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(() => {
        this.viewer.camera.position.set(oldCameraPos.x, oldCameraPos.y, oldCameraPos.z);
        this.viewer.camera.lookAt(new THREE.Vector3(0, 0, 0));
      })
      .onComplete(onCompleteCallback)
      .start();
  }

  explodeModel(node: any, power = 0, plant = new THREE.Vector3(), level = 0) {
    if (!node) return;

    if (!node._originalPosition) {
      node.updateWorldMatrix(true, true);
      node._originalPosition = node.position.clone();
    }

    const toVec = new THREE.Vector3();
    if (level === 0) toVec.copy(node._originalPosition.clone());
    else if (level === 1) {
      const plantLocal = node.parent.worldToLocal(plant.clone());
      toVec.copy(node._originalPosition.clone().sub(plantLocal).multiplyScalar(3));
    }
    node._explode = { from: node._originalPosition.clone(), to: toVec };
    const explodeVec = node._explode.from.clone();
    explodeVec.lerp(node._explode.to, power);
    node.position.copy(explodeVec);
    node.children.forEach((child: any) => {
      if (
        node.children.length > 1 &&
        node.children[0].type !== 'Mesh' &&
        node.children[0].type !== 'LineSegments'
      )
        this.explodeModel(child, power, plant, level + 1);
    });
  }

  setSelectedObj(isolateIsActive: boolean, mouseCoords: any, mouseMode: number) {
    if ((this.selectedObj && isolateIsActive) || this.viewer.state === VIEWER_STATE.Isolated)
      return null;
    this.viewer.raycaster.setFromCamera(mouseCoords, this.viewer.camera);
    const intersects = this.viewer.raycaster.intersectObjects(this.viewer.model.children, true);
    if (intersects.length > 0) {
      const filteredIntersects = intersects.filter(
        (intersection: any) => !this.objectByIdIsHidden(intersection.object.id),
      );
      return filteredIntersects;
    } else {
      if (this.selectedObj) {
        this.viewer.outlinePass.selectedObjects = [];
        this.selectedObj.material = this.selectedObj.defaultMaterial.clone();
        this.selectedObj = null;
      }
    }
    return null;
  }

  selectObject(filteredIntersects: THREE.Intersection[]) {
    if (this.selectedObj) {
      this.selectedObj.material = this.selectedObj.defaultMaterial.clone();
      if (this.selectedObj?.uuid === filteredIntersects[0].object.uuid) {
        this.selectedObj = null;
      } else {
        this.selectedObj = filteredIntersects[0].object;
        this.selectedObj.material = CLICKED_OBJ_MATERIAL;
      }
    } else {
      this.selectedObj = filteredIntersects[0].object;
      this.selectedObj.material = CLICKED_OBJ_MATERIAL;
    }
  }

  setHoveredObj(isolateIsActive: boolean, mouseCoords: any) {
    if (isolateIsActive || this.viewer.state === VIEWER_STATE.Isolated) return;
    this.viewer.raycaster.setFromCamera(mouseCoords, this.viewer.camera);
    const intersects = this.viewer.raycaster.intersectObjects(this.viewer.model.children, true);
    if (intersects.length > 0) {
      const filteredIntersects = intersects.filter(
        (intersection: any) => !this.objectByIdIsHidden(intersection.object.id),
      );
      if (filteredIntersects.length > 0) {
        if (this.hoveredObj && this.hoveredObj.uuid !== this.selectedObj?.uuid) {
          this.hoveredObj.material.color.setHex(this.hoveredObj.defaultMaterial.color.getHex());
        }
        this.hoveredObj = filteredIntersects[0].object;
        if (this.hoveredObj.uuid !== this.selectedObj?.uuid) {
          this.hoveredObj.material.color.setHex(
            this.shadeColor(this.hoveredObj.defaultMaterial.color.getHex(), 40),
          );
        }
      }
    } else {
      if (this.hoveredObj && this.hoveredObj.uuid !== this.selectedObj?.uuid) {
        this.hoveredObj.material.color.setHex(this.hoveredObj.defaultMaterial.color.getHex());
      }
    }
  }

  resetSelectedObjView() {
    this.selectedObj.material = this.selectedObj.defaultMaterial.clone();
    this.viewer.outlinePass.selectedObjects = [];
  }

  isolateObject(obj?: any) {
    this.viewer.state = VIEWER_STATE.Isolated;
    if (obj) {
      this.viewer.model.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.uuid !== obj.uuid) {
          child.material = TRANSPARENT_OBJ_MATERIAL.clone();
        }
      });
      obj.traverse((child: any) => {
        if ((child instanceof THREE.Mesh) as any) {
          child.material = child.defaultMaterial.clone();
        }
      });
    } else if (this.selectedObj) {
      this.resetSelectedObjView();
      this.viewer.model.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.uuid !== this.selectedObj.uuid) {
          child.material = TRANSPARENT_OBJ_MATERIAL.clone();
        }
      });
    }
  }

  resetObjectIsolation() {
    this.viewer.state = VIEWER_STATE.Default;
    this.viewer.model.traverse((child: any) => {
      if ((child instanceof THREE.Mesh) as any) {
        child.material = child.defaultMaterial.clone();
      }
    });
  }

  hideObject() {
    if (this.selectedObj) {
      this.resetSelectedObjView();
      this.selectedObj.visible = false;
      this.setHiddenObjects([...this.hiddenObjects$.value, this.selectedObj]);
      this.selectedObj = null;
    }
  }

  toggleObjectVisibilityById(id: number) {
    const obj = this.viewer.scene.getObjectById(id)!;
    obj.visible = !obj.visible;
    if (obj.visible)
      this.setHiddenObjects(this.hiddenObjects$.value.filter((obj: any) => obj.id !== id));
    else this.setHiddenObjects([...this.hiddenObjects$.value, obj]);
  }

  objectByIdIsHidden(id: number) {
    return this.hiddenObjects$.value.some((obj: any) => obj.id === id);
  }

  restoreView() {
    if (this.hiddenObjects$.value.length) {
      this.hiddenObjects$.value.forEach((obj: any) => {
        obj.visible = true;
      });
      this.setHiddenObjects([]);
      this.viewer.outlinePass.selectedObjects = [];
    }
    if (this.viewer.state === VIEWER_STATE.Isolated) this.resetObjectIsolation();
  }

  fitToView(id: number) {
    const obj = this.viewer.model.getObjectById(id)!;
    this.resetObjectIsolation();
    this.isolateObject(obj);

    /*  const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(obj);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    const offset = 1.5;

    const fov = this.viewer.camera.fov * (Math.PI / 180);
    const fovh = 2 * Math.atan(Math.tan(fov / 2) * this.viewer.camera.aspect);
    let dx = size.z / 2 + Math.abs(size.x / 2 / Math.tan(fovh / 2));
    let dy = size.z / 2 + Math.abs(size.y / 2 / Math.tan(fov / 2));
    let cameraZ = Math.max(dx, dy);
    cameraZ *= offset;

    this.viewer.camera.position.set(0, 0, cameraZ);
    const minZ = boundingBox.min.z;
    const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;

    this.viewer.camera.far = cameraToFarEdge * 3;
    this.viewer.camera.updateProjectionMatrix();

    if (this.viewer.controls !== undefined) {
      this.viewer.controls.target = new THREE.Vector3(0, 0, 0);
      this.viewer.controls.maxDistance = cameraToFarEdge * 2;
    } */
  }

  setItemStructureLevels(nodes: any[], level = 0) {
    nodes.forEach((node: any) => {
      node._specLevel = level;
      if (node.children?.length) this.setItemStructureLevels(node.children, level + 1);
    });
  }

  getItemStructureTabular(nodes: any) {
    const structure: any = [];
    structure.push({ ...nodes[0], specificationCount: 1 });
    this.getStructureByNodes(nodes[0].children, structure);
    this.showRootStructureNode(structure);
    return structure;
  }

  getStructureByNodes(nodes: any, structure: any) {
    nodes.forEach((node: any) => {
      if (node instanceof THREE.Mesh) {
        const obj = structure.find(
          (el: any) => el.userData.name === node.userData.name.split('.')[0],
        );
        if (obj) {
          ++obj.specificationCount;
        } else
          structure.push({
            ...node,
            userData: { name: node.userData.name.split('.')[0] },
            specificationCount: 1,
          });
      } else if (node.children?.length) {
        this.getStructureByNodes(node.children, structure);
      }
    });
  }

  showRootStructureNode(structure: any[]) {
    structure[0].isVisibleInSpec = true;
    structure[0].isExpanded = true;
    structure
      .filter((node: any) => node.parent.id === structure[0].id)
      .forEach((node: any) => {
        node.isVisibleInSpec = true;
        node.isExpanded = false;
      });
  }

  playAnimation() {
    this.animations.forEach((clip: any) => {
      const action = this.viewer.mixer!.clipAction(clip);
      if (action.paused) action.paused = false;
      else {
        action.timeScale = 3;
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
        action.play();
      }
    });
  }

  pauseAnimation() {
    this.animations.forEach((clip: any) => {
      const action = this.viewer.mixer!.clipAction(clip);
      if (action.isRunning()) action.paused = true;
    });
  }

  stopAnimation() {
    this.viewer.mixer?.stopAllAction();
  }
}
