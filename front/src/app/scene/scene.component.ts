import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { SubSink } from 'subsink';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SceneService } from './services/scene.service';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { ViewerI } from '../shared/interfaces/viewer.interface';
import { AnnotationI } from '../shared/interfaces/annotation.interface';
import MainScene from '../shared/classes/MainScene';
import * as TWEEN from '@tweenjs/tween.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;
const CAMERA_POSITION_RATE = 0.9;
const RENDERER_PIXEL_RATIO = 2;
const GRID_HELPER_SIZE_RATE = 3;
const GRID_HELPER_DIVISIONS = 20;
const CAMERA_ANIM_DUR = 300;
export const CAMERA_ROTATE_SPEED = 2;
export const EXPLODE_POWER = 0;
const CLICKED_OBJ_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0x7092d4,
  roughness: 1.0,
  metalness: 0.0,
  side: THREE.DoubleSide,
  opacity: 0.75,
  transparent: true,
});

export enum VIEWER_BUTTONS {
  Default,
  Home,
  RotateAnimation,
  Explode,
  Hide,
  RestoreView,
}

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent implements AfterViewInit, OnDestroy {
  private subs = new SubSink();

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('viewerWrapper') viewerWrapper: ElementRef;

  @HostListener('window:resize', ['$event']) onResize($event: any) {
    this.resizeCanvas();
  }

  canvasRect: any;

  viewerInitialized = false;
  modelLongestSide = 0;
  rotateAnimationBtnIsActive = false;
  rotateSpeedValue = CAMERA_ROTATE_SPEED;
  explodePowerValue = EXPLODE_POWER;
  activeBtnIndex = VIEWER_BUTTONS.Default;
  btnIsInAction = false;

  mouseCoords: any = new THREE.Vector2(-1, 1);
  mouseDownPos: any;
  mouseUpPos: any;

  selectedObj: any = null;
  hoveredObj: any = null;

  effectFXAA = new ShaderPass(FXAAShader);

  hiddenObjects: any = [];

  annotations: AnnotationI[] = [
    {
      title: '1',
      description: '<p>Bathroom Sink is good for washing your hands</p>',
      position: new THREE.Vector3(0.8807755104286317, 0.009937415637652509, 0.5152293842824673),
    },
  ];
  annotationMarkers: THREE.Sprite[] = [];

  viewer: ViewerI = {
    scene: new MainScene(),
    renderer: new THREE.WebGLRenderer(),
    composer: null,
    outlinePass: {},
    labelRenderer: null,
    camera: new THREE.PerspectiveCamera(),
    controls: {},
    modelBoundingBox: {},
    raycaster: {},
    clock: new THREE.Clock(),
    actions: [],
    time: 0,
    isPlaying: false,
    model: new THREE.Object3D(),
    plant: new THREE.Vector3(),
  };

  constructor(
    private sceneService: SceneService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    this.subs.add(
      this.sceneService.loadDefaultModel().subscribe((file) => {
        this.setUpViewer(file);
      }),
    );
    this.canvasRect = this.canvas.nativeElement.getBoundingClientRect();
  }

  setUpViewer(file: any) {
    const loader = new GLTFLoader();
    loader.setDRACOLoader(new DRACOLoader().setDecoderPath('/draco/'));

    this.viewer.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      this.viewerWrapper.nativeElement.clientWidth / this.viewerWrapper.nativeElement.clientHeight,
      CAMERA_NEAR,
      CAMERA_FAR,
    );
    this.setRenderer();
    this.setComposer();
    this.viewer.controls = new OrbitControls(this.viewer.camera, this.viewer.renderer.domElement);
    this.viewer.raycaster = new THREE.Raycaster();

    loader.parse(JSON.stringify(file), '', (gltf) => {
      this.viewer.mixer = new THREE.AnimationMixer(gltf.scene);
      const clips = gltf.animations;

      console.log(clips);

      /*  clips.forEach((clip) => {
        const action = this.viewer.mixer!.clipAction(clip);
        console.log(action);
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
        action.play();
      }); */

      this.viewer.model = gltf.scene.children[0];

      this.viewer.scene.add(gltf.scene);
      this.setGridHelper(gltf);
      this.viewer.scene.setLight(this.modelLongestSide);
      this.setCamera(this.modelLongestSide);
      this.viewerInitialized = true;
      this.setAnnotations();
      this.cdr.detectChanges();
    });

    var animate = () => {
      TWEEN.update();
      requestAnimationFrame(animate);
      this.setHoveredObjColor();
      this.viewer.mixer?.update(this.viewer.clock.getDelta() / 3);
      this.viewer.controls.update();
      // this.viewer.renderer.render(this.viewer.scene, this.viewer.camera);
      if (this.viewer.composer) this.viewer.composer.render();
      if (this.viewer.labelRenderer)
        this.viewer.labelRenderer.render(this.viewer.scene, this.viewer.camera);
    };
    animate();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setRenderer() {
    this.viewer.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas.nativeElement,
      powerPreference: 'high-performance',
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: true,
    });
    this.viewer.renderer.shadowMap.enabled = true;
    this.viewer.renderer.setClearColor(0xffffff, 0);
    this.viewer.renderer.setSize(
      this.viewerWrapper.nativeElement.clientWidth,
      this.viewerWrapper.nativeElement.clientHeight,
    );
    this.viewer.renderer.setPixelRatio(
      window.devicePixelRatio > RENDERER_PIXEL_RATIO
        ? RENDERER_PIXEL_RATIO
        : window.devicePixelRatio,
    );
    this.viewer.renderer.setClearColor(new THREE.Color(0xffffff));
    this.viewer.renderer.outputEncoding = THREE.GammaEncoding;

    this.viewer.labelRenderer = new CSS2DRenderer();
    this.viewer.labelRenderer.setSize(
      this.viewerWrapper.nativeElement.clientWidth,
      this.viewerWrapper.nativeElement.clientHeight,
    );
    this.viewer.labelRenderer.domElement.style.position = 'absolute';
    this.viewer.labelRenderer.domElement.style.top = '0px';
    this.viewer.labelRenderer.domElement.style.pointerEvents = 'none';
    this.renderer.appendChild(
      this.viewerWrapper.nativeElement,
      this.viewer.labelRenderer.domElement,
    );
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
    this.viewer.outlinePass.edgeStrength = 2;
    this.viewer.outlinePass.edgeThickness = 1;
    this.viewer.outlinePass.visibleEdgeColor.set('#0159d3');
    this.viewer.outlinePass.hiddenEdgeColor.set('#0159d3');
    this.viewer.composer.addPass(this.viewer.outlinePass);
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

  resizeCanvas() {
    const box = this.viewerWrapper.nativeElement.getBoundingClientRect();
    this.viewer.renderer.setSize(box.width, box.height);
    const pixelRatio = this.viewer.renderer.getPixelRatio();
    if (this.viewer.composer) this.viewer.composer.setSize(box.width, box.height);
    this.effectFXAA.uniforms['resolution'].value.set(
      (1 / box.width) * pixelRatio,
      (1 / box.height) * pixelRatio,
    );
    this.viewer.camera.aspect = box.width / box.height;
    this.viewer.camera.updateProjectionMatrix();
    this.canvasRect = this.canvas.nativeElement.getBoundingClientRect();
    if (this.viewer.labelRenderer) this.viewer.labelRenderer.setSize(box.width, box.height);
  }

  setCamera(translateValue: number) {
    this.viewer.camera.position.set(
      translateValue * CAMERA_POSITION_RATE,
      0,
      translateValue * CAMERA_POSITION_RATE,
    );
    this.viewer.controls.update();
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

  onViewerBtnClicked(activeBtnIndex: number) {
    if (this.activeBtnIndex !== activeBtnIndex) this.resetPrevBtnAction();
    this.activeBtnIndex = this.btnIsInAction ? VIEWER_BUTTONS.Default : activeBtnIndex;
    switch (activeBtnIndex) {
      case VIEWER_BUTTONS.Home:
        this.resetCamera();
        break;
      case VIEWER_BUTTONS.RotateAnimation:
        if (!this.btnIsInAction) this.rotateCamera();
        else this.stopRotatingCamera();
        break;
      case VIEWER_BUTTONS.Explode:
        if (!this.btnIsInAction) this.explode();
        else this.stopExplodingModel();
        break;
      case VIEWER_BUTTONS.Hide:
        this.hideObject();
        break;
      case VIEWER_BUTTONS.RestoreView:
        this.restoreView();
        break;
      default:
        break;
    }
  }

  resetCamera() {
    this.moveCameraWithAnimation(() => {
      this.viewer.controls.enabled = true;
    });
  }

  rotateCamera() {
    this.btnIsInAction = true;
    this.viewer.controls.enabled = false;
    this.viewer.controls.autoRotate = true;
    this.viewer.controls.autoRotateSpeed = -this.rotateSpeedValue;
    this.viewer.controls.target = new THREE.Vector3(0, 0, 0);
  }

  stopRotatingCamera() {
    this.btnIsInAction = false;
    this.viewer.controls.enabled = true;
    this.viewer.controls.autoRotate = false;
  }

  onRotateCameraSpeedChanged(valueSpeed: any) {
    this.rotateSpeedValue = valueSpeed;
    this.viewer.controls.autoRotateSpeed = -this.rotateSpeedValue;
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

  explode() {
    this.btnIsInAction = true;
    this.explodeModel(this.viewer.model, this.explodePowerValue);
  }

  stopExplodingModel() {
    this.btnIsInAction = false;
    this.explodeModel(this.viewer.model, 0);
  }

  hideObject() {
    if (this.selectedObj) {
      this.selectedObj.material = this.selectedObj.defaultMaterial.clone();
      this.viewer.outlinePass.selectedObjects = [];
      this.selectedObj.visible = false;
      this.hiddenObjects.push(this.selectedObj);
      this.selectedObj = null;
    }
  }

  restoreView() {
    if (this.hiddenObjects.length) {
      // this.viewer.model.traverse((child: any) => {
      //   if (child instanceof THREE.Mesh && this.objectByUuidIsHidden(child.uuid)) {
      //     child.visible = true;
      //   }
      // });
      this.hiddenObjects.forEach((obj: any) => {
        obj.visible = true;
      });
      this.hiddenObjects = [];
      this.viewer.outlinePass.selectedObjects = [];
    }
  }

  onExplodePowerChanged(explodeValue: any) {
    this.explodePowerValue = explodeValue;
    this.explodeModel(this.viewer.model, this.explodePowerValue);
  }

  resetPrevBtnAction() {
    switch (this.activeBtnIndex) {
      case VIEWER_BUTTONS.RotateAnimation:
        this.stopRotatingCamera();
        this.rotateSpeedValue = CAMERA_ROTATE_SPEED;
        this.resetCamera();
        break;
      case VIEWER_BUTTONS.Explode:
        this.stopExplodingModel();
        this.explodePowerValue = EXPLODE_POWER;
        this.resetCamera();
        break;
      case VIEWER_BUTTONS.Hide:
        this.restoreView();
        break;
      default:
        break;
    }
  }

  onMouseUp(e: MouseEvent) {
    this.mouseUpPos = { ...this.getMouseCoorsByMouseEvent(e) };
  }

  onMouseDown(e: MouseEvent) {
    this.mouseDownPos = { ...this.getMouseCoorsByMouseEvent(e) };
  }

  onMouseClick(e: MouseEvent) {
    if (this.mouseDownPos.x === this.mouseUpPos.x && this.mouseDownPos.y === this.mouseUpPos.y) {
      this.setMouseCoords(e);
      this.setClickedObjColor();
    }
  }

  getMouseCoorsByMouseEvent(e: MouseEvent) {
    return {
      x: ((e.clientX - this.canvasRect.left) / this.canvasRect.width) * 2 - 1,
      y: -((e.clientY - this.canvasRect.top) / this.canvasRect.height) * 2 + 1,
    };
  }

  setMouseCoords(e: MouseEvent) {
    this.mouseCoords = { ...this.getMouseCoorsByMouseEvent(e) };
  }

  setClickedObjColor() {
    this.viewer.raycaster.setFromCamera(this.mouseCoords, this.viewer.camera);
    const intersects = this.viewer.raycaster.intersectObjects(this.viewer.model.children, true);
    if (intersects.length > 0) {
      const filteredIntersects = intersects.filter(
        (intersection: any) => !this.objectByUuidIsHidden(intersection.object.uuid),
      );
      if (filteredIntersects.length > 0) {
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

  setHoveredObjColor() {
    this.viewer.raycaster.setFromCamera(this.mouseCoords, this.viewer.camera);
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
        if (!this.hoveredObj.defaultMaterial)
          this.hoveredObj.defaultMaterial = filteredIntersects[0].object.material.clone();
        if (this.hoveredObj.uuid !== this.selectedObj?.uuid) {
          this.hoveredObj.material.color.setHex(
            this.sceneService.shadeColor(this.hoveredObj.defaultMaterial.color.getHex(), 40),
          );
        }
      }
    } else {
      if (this.hoveredObj && this.hoveredObj.uuid !== this.selectedObj?.uuid) {
        this.hoveredObj.material.color.setHex(this.hoveredObj.defaultMaterial.color.getHex());
      }
    }
  }

  objectByUuidIsHidden(uuid: any) {
    return this.hiddenObjects.some((obj: any) => obj.uuid === uuid);
  }

  setAnnotations() {
    const circleTexture = new THREE.TextureLoader().load('assets/png/circle.png');
    this.annotations.forEach((annotation) => {
      const annotationSpriteMaterial = new THREE.SpriteMaterial({
        map: circleTexture,
        depthTest: false,
        depthWrite: false,
        sizeAttenuation: false,
      });
      const annotationSprite = new THREE.Sprite(annotationSpriteMaterial);
      annotationSprite.scale.set(0.066, 0.066, 0.066);
      annotationSprite.position.copy(annotation.position);
      annotationSprite.userData.id = annotation.title;
      this.viewer.scene.add(annotationSprite);
      this.annotationMarkers.push(annotationSprite);

      const annotationDiv = this.renderer.createElement('div');
      this.renderer.addClass(annotationDiv, 'annotationLabel');
      this.renderer.setProperty(annotationDiv, 'innerHTML', annotation.title);
      const annotationLabel = new CSS2DObject(annotationDiv);
      annotationLabel.position.copy(annotation.position);
      this.viewer.scene.add(annotationLabel);

      if (annotation.description) {
        const annotationDescriptionDiv = this.renderer.createElement('div');
        this.renderer.addClass(annotationDescriptionDiv, 'annotationDescription');
        this.renderer.setProperty(annotationDescriptionDiv, 'innerHTML', annotation.description);
        this.renderer.appendChild(annotationDiv, annotationDescriptionDiv);
        annotation.descriptionDomElement = annotationDescriptionDiv;
      }
    });
  }
}
