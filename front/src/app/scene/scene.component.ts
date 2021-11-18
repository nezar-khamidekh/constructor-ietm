import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
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

  spotlight_pos = { x: 5000, y: 5000, z: 5000 };
  model: any;

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
          window.innerWidth / window.innerHeight,
          0.1,
          1000,
        );
        const renderer = new THREE.WebGLRenderer({
          canvas: this.canvas.nativeElement,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        const controls = new OrbitControls(camera, renderer.domElement);

        loader.parse(JSON.stringify(file), '', (gltf) => {
          scene.add(gltf.scene);
        });

        camera.position.z = 5;

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
}
