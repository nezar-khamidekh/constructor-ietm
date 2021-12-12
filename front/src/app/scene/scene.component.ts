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
const CAMERA_ROTATE_SPEED = 2;
const EXPLODE_POWER = 0;

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

  spotlight_pos = { x: 5000, y: 5000, z: 5000 };
  viewerInitialized = false;
  modelLongestSide = 0;
  rotateAnimationBtnIsActive = false;
  rotateAnimationCameraSpeed = -CAMERA_ROTATE_SPEED;
  explodeBtnIsActive = false;
  explodePower = EXPLODE_POWER;

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
    const cameraHelper = new THREE.CameraHelper(this.viewer.camera);
    this.viewer.scene.add(cameraHelper);
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
      this.viewer.renderer.render(this.viewer.scene, this.viewer.camera);
      this.viewer.controls.update();
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

  onResetCamera() {
    this.moveCameraWithAnimation(() => {
      this.viewer.controls.enabled = true;
    });
  }

  onRotateCamera() {
    if (this.rotateAnimationBtnIsActive) {
      this.rotateAnimationBtnIsActive = false;
      this.viewer.controls.autoRotate = false;
    } else {
      this.rotateAnimationBtnIsActive = true;
      this.viewer.controls.autoRotate = true;
      this.viewer.controls.autoRotateSpeed = this.rotateAnimationCameraSpeed;
      this.viewer.controls.target = new THREE.Vector3(0, 0, 0);
    }
  }

  onRotateCameraSpeedChanged(valueSpeed: any) {
    this.rotateAnimationCameraSpeed = -valueSpeed;
    this.viewer.controls.autoRotateSpeed = this.rotateAnimationCameraSpeed;
  }

  explodeModel(distance: number) {
    const centers: any = [];
    this.viewer.model.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.computeBoundingSphere();
        centers.push(child.geometry.boundingSphere.center);
      }
    });

    let center = new THREE.Vector3();
    centers.forEach((vec: THREE.Vector3) => {
      center = center.add(vec);
    });
    center.x /= centers.length;
    center.y /= centers.length;
    center.z /= centers.length;

    this.viewer.model.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        let childCenter = child.geometry.boundingSphere.center.clone();
        let direction = childCenter.sub(center);
        child.translateOnAxis(direction, distance);
      }
    });
  }

  onExplode(distance: number) {
    if (!this.explodeBtnIsActive) {
      this.explodeBtnIsActive = true;
      this.explodeModel(distance);
    } else {
      this.explodeBtnIsActive = false;
      this.explodeModel(EXPLODE_POWER - distance);
    }
  }

  onExplodePowerChanged(explodeValue: any) {
    this.explodePower =
      explodeValue > this.explodePower
        ? Math.abs(explodeValue - this.explodePower)
        : -Math.abs(explodeValue - this.explodePower);
    this.explodeModel(this.explodePower);
  }
}
