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

  constructor(private sceneService: SceneService) {}

  ngAfterViewInit(): void {
    this.subs.add(
      this.sceneService.loadDefaultModel().subscribe((file) => {
        const loader = new GLTFLoader();
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('white');
        scene.add(new THREE.AmbientLight(0xfafafa, 0.9));
        let spotLight = new THREE.SpotLight(0x606060);
        spotLight.position.set(this.spotlight_pos.x, this.spotlight_pos.y, this.spotlight_pos.z);
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 0.1;
        spotLight.shadow.camera.far = 100000;
        spotLight.shadow.camera.fov = 75;
        scene.add(spotLight);
        const camera = new THREE.PerspectiveCamera(
          75,
          this.viewerWrapper.nativeElement.clientWidth /
            this.viewerWrapper.nativeElement.clientHeight,
          0.1,
          1000,
        );
        const renderer = new THREE.WebGLRenderer({
          canvas: this.canvas.nativeElement,
        });

        this.renderer = renderer;
        this.camera = camera;

        renderer.setSize(
          this.viewerWrapper.nativeElement.clientWidth,
          this.viewerWrapper.nativeElement.clientHeight,
        );
        const controls = new OrbitControls(camera, renderer.domElement);

        loader.parse(JSON.stringify(file), '', (gltf) => {
          scene.add(gltf.scene);

          //Перенести в model load
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

          const homeViewCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 10000);
          const offset = longestSide / (2.0 * Math.tan(homeViewCamera.fov * (Math.PI / 360.0)));

          const manualCameraObj = gltf.scene.getObjectByName('ManualCamera');
          if (manualCameraObj) {
            homeViewCamera.position.copy(manualCameraObj.position.clone());
            homeViewCamera.rotation.copy(manualCameraObj.rotation.clone());
            homeViewCamera.quaternion.copy(manualCameraObj.quaternion.clone());
          } else {
            homeViewCamera.position.set(offset, offset, offset);
          }

          homeViewCamera.name = '__MainCamera';

          const homeViewTarget = new THREE.Object3D();
          homeViewTarget.position.copy(center.clone());
          homeViewTarget.name = '__MainTarget';

          scene.add(homeViewCamera, homeViewTarget);

          camera.position.z = 5;
        });

        var animate = function () {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  resizeCanvas() {
    const box = this.viewerWrapper.nativeElement.getBoundingClientRect();
    this.renderer.setSize(box.width, box.height);
    this.camera.aspect = box.width / box.height;
    this.camera.updateProjectionMatrix();
  }
}
