import {
  AfterViewInit,
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

const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;
const CAMERA_POSITION_Z_RATE = 1.2;
const RENDERER_PIXEL_RATIO = 2;
const GRID_HELPER_SIZE_RATE = 2;
const GRID_HELPER_DIVISIONS = 10;

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
  model: any;

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

  constructor(private sceneService: SceneService) {}

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

    this.viewer.scene = new MainScene();
    this.viewer.camera = new THREE.PerspectiveCamera(
      CAMERA_FOV,
      this.viewerWrapper.nativeElement.clientWidth / this.viewerWrapper.nativeElement.clientHeight,
      CAMERA_NEAR,
      CAMERA_FAR,
    );
    this.setRenderer();
    this.viewer.controls = new OrbitControls(this.viewer.camera, this.viewer.renderer.domElement);

    //Вращение
    /* this.viewer.controls.autoRotate = true;
    this.viewer.controls.autoRotateSpeed = -1;
    this.viewer.controls.target = new THREE.Vector3(0, 0, 0); */

    loader.parse(JSON.stringify(file), '', (gltf) => {
      this.viewer.scene.add(gltf.scene);
      this.setGridHelper(gltf);
    });

    var animate = () => {
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
    const longestSide = Math.max(size.x, size.y, size.z);
    const gridHelper = new THREE.GridHelper(
      longestSide * GRID_HELPER_SIZE_RATE,
      GRID_HELPER_DIVISIONS,
    );

    const center = new THREE.Vector3();
    boundBox.getCenter(center);
    gridHelper.position.set(center.x, boundBox.min.y, center.z);
    gridHelper.name = '__Grid';
    gltf.scene.add(gridHelper);

    this.setCamera(longestSide);
  }

  resizeCanvas() {
    const box = this.viewerWrapper.nativeElement.getBoundingClientRect();
    this.viewer.renderer.setSize(box.width, box.height);
    this.viewer.camera.aspect = box.width / box.height;
    this.viewer.camera.updateProjectionMatrix();
  }

  setCamera(translateValue: number) {
    this.viewer.camera.position.x = translateValue * CAMERA_POSITION_Z_RATE;
    this.viewer.camera.position.z = translateValue * CAMERA_POSITION_Z_RATE;
    this.viewer.controls.update();
  }
}
