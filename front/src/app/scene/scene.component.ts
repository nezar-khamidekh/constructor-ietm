import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvas: ElementRef;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const fov = 75;
    const width = window.innerWidth * 0.8;
    const height = window.innerHeight;
    const aspect = width / height;
    const near = 0.1;
    const far = 100000;
    const camera_pos = { x: 2000, y: 1000, z: -2000 };
    const spotlight_pos = { x: 5000, y: 5000, z: 5000 };
    var scene = new THREE.Scene();
    scene.background = new THREE.Color('white');
    var camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    var renderer = new THREE.WebGLRenderer({
      canvas: this.canvas.nativeElement,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    var controls = new OrbitControls(camera, renderer.domElement);
    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x2929e7 });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 5;

    var animate = function () {
      requestAnimationFrame(animate);

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();
  }
}
