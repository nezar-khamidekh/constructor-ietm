import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { SubSink } from 'subsink';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { SceneService } from './services/scene.service';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { ViewerI } from '../shared/interfaces/viewer.interface';
import MainScene from '../shared/classes/MainScene';
import * as TWEEN from '@tweenjs/tween.js';

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

export enum VIEWER_BUTTONS {
  Default,
  Home,
  RotateAnimation,
  Explode,
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

  viewerInitialized = false;
  modelLongestSide = 0;
  rotateAnimationBtnIsActive = false;
  rotateSpeedValue = CAMERA_ROTATE_SPEED;
  explodePowerValue = EXPLODE_POWER;
  activeBtnIndex = VIEWER_BUTTONS.Default;
  btnIsInAction = false;

  viewer: ViewerI = {
    scene: new MainScene(),
    renderer: new THREE.WebGLRenderer(),
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

  constructor(private sceneService: SceneService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    this.subs.add(
      this.sceneService.loadDefaultModel().subscribe((file) => {
        this.setUpViewer(file);
      }),
    );
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
    this.viewer.controls = new OrbitControls(this.viewer.camera, this.viewer.renderer.domElement);

    loader.parse(JSON.stringify(file), '', (gltf) => {
      this.viewer.model = gltf.scene.children[0];

      this.viewer.scene.add(gltf.scene);
      this.setGridHelper(gltf);
      this.viewer.scene.setLight(this.modelLongestSide);
      this.setCamera(this.modelLongestSide);
      this.viewerInitialized = true;
      this.cdr.detectChanges();
    });

    var animate = () => {
      TWEEN.update();
      requestAnimationFrame(animate);
      this.viewer.controls.update();
      this.viewer.renderer.render(this.viewer.scene, this.viewer.camera);
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
    });
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
    this.viewer.camera.aspect = box.width / box.height;
    this.viewer.camera.updateProjectionMatrix();
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
      default:
        break;
    }
  }
}
