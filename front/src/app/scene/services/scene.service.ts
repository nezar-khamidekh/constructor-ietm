import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import MainScene from 'src/app/shared/classes/MainScene';
import { ViewerI } from 'src/app/shared/models/viewer.interface';
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
  hiddenObjects: any = [];

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
    };
  }

  getViewer() {
    return this.viewer;
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
    const clips = model.animations;
    console.log(clips);

    /*  clips.forEach((clip) => {
        const action = this.viewer.mixer!.clipAction(clip);
        console.log(action);
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
        action.play();
      }); */
  }

  setModel(model: any) {
    this.viewer.model = model.scene.children[0];
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
      0,
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
    this.canvasRect = canvas.nativeElement.getBoundingClientRect();
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
      0,
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
    if (this.selectedObj && isolateIsActive) return;
    this.viewer.raycaster.setFromCamera(mouseCoords, this.viewer.camera);
    const intersects = this.viewer.raycaster.intersectObjects(this.viewer.model.children, true);
    if (intersects.length > 0) {
      const filteredIntersects = intersects.filter(
        (intersection: any) => !this.objectByUuidIsHidden(intersection.object.uuid),
      );
      if (filteredIntersects.length > 0) {
        switch (mouseMode) {
          case VIEWER_MOUSE_MODE.ApplyAnnotation:
            // this.coordsAnnotation.emit(filteredIntersects[0].point);
            break;
          default:
            break;
        }
        this.viewer.outlinePass.selectedObjects = [filteredIntersects[0].object];
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
    } else {
      if (this.selectedObj) {
        this.viewer.outlinePass.selectedObjects = [];
        this.selectedObj.material = this.selectedObj.defaultMaterial.clone();
        this.selectedObj = null;
      }
    }
  }

  setHoveredObj(isolateIsActive: boolean, mouseCoords: any) {
    if (isolateIsActive) return;
    this.viewer.raycaster.setFromCamera(mouseCoords, this.viewer.camera);
    const intersects = this.viewer.raycaster.intersectObjects(this.viewer.model.children, true);
    if (intersects.length > 0) {
      const filteredIntersects = intersects.filter(
        (intersection: any) => !this.objectByUuidIsHidden(intersection.object.uuid),
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

  isolateObject() {
    if (this.selectedObj) {
      this.resetSelectedObjView();
      this.viewer.model.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.uuid !== this.selectedObj.uuid) {
          child.material = TRANSPARENT_OBJ_MATERIAL.clone();
        }
      });
    }
  }

  resetObjectIsolation() {
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
      this.hiddenObjects.push(this.selectedObj);
      this.selectedObj = null;
    }
  }

  objectByUuidIsHidden(uuid: any) {
    return this.hiddenObjects.some((obj: any) => obj.uuid === uuid);
  }

  restoreView() {
    if (this.hiddenObjects.length) {
      this.hiddenObjects.forEach((obj: any) => {
        obj.visible = true;
      });
      this.hiddenObjects = [];
      this.viewer.outlinePass.selectedObjects = [];
    }
  }

  getModel() {
    return this.viewer.model;
  }
}
