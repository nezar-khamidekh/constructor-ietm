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
  renderer!: THREE.WebGLRenderer;
  camera!: THREE.PerspectiveCamera;

  viewer: ViewerI = {
    scene: new THREE.Scene(),
    renderer: new THREE.WebGLRenderer(),
    camera: new THREE.Camera(),
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

    this.viewer.scene = new THREE.Scene();
    this.viewer.scene.background = new THREE.Color('white');

    this.setLight();

    this.viewer.camera = new THREE.PerspectiveCamera(
      75,
      this.viewerWrapper.nativeElement.clientWidth / this.viewerWrapper.nativeElement.clientHeight,
      0.1,
      1000,
    );

    this.setRenderer();

    this.viewer.controls = new OrbitControls(this.viewer.camera, this.viewer.renderer.domElement);

    loader.parse(JSON.stringify(file), '', (gltf) => {
      this.viewer.scene.add(gltf.scene);
      this.setGridHelper(gltf);
      this.viewer.camera.position.z = 5;
    });

    var animate = () => {
      requestAnimationFrame(animate);
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
    });
    this.viewer.renderer.setSize(
      this.viewerWrapper.nativeElement.clientWidth,
      this.viewerWrapper.nativeElement.clientHeight,
    );
    this.viewer.renderer.setPixelRatio(window.devicePixelRatio > 2 ? 2 : window.devicePixelRatio);
    this.viewer.renderer.setClearColor(new THREE.Color(0xffffff));
    this.viewer.renderer.outputEncoding = THREE.GammaEncoding;
  }

  setLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 0.3);
    keyLight.position.set(-100, 0, 100);
    const fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.3);
    fillLight.position.set(100, 0, 100);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(100, 0, -100).normalize();

    this.viewer.scene.add(ambientLight, keyLight, fillLight, backLight);
  }

  setGridHelper(gltf: any) {
    const boundBox = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    boundBox.getSize(size);
    const longestSide = Math.max(size.x, size.y, size.z);

    const gridHelper = new THREE.GridHelper(longestSide * 2, 10);

    const center = new THREE.Vector3();
    boundBox.getCenter(center);
    gridHelper.position.set(center.x, boundBox.min.y, center.z);
    gridHelper.name = '__Grid';
    gltf.scene.add(gridHelper);
  }

  resizeCanvas() {
    const box = this.viewerWrapper.nativeElement.getBoundingClientRect();
    this.renderer.setSize(box.width, box.height);
    this.camera.aspect = box.width / box.height;
    this.camera.updateProjectionMatrix();
  }
}
