import MainScene from './MainScene';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Raycaster } from 'three';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { VIEWER_STATE } from '../models/viewerState.enum';
import {
  CAMERA_FAR,
  CAMERA_FOV,
  CAMERA_NEAR,
  OUTLINE_PASS_EDGE_STRENGTH,
  OUTLINE_PASS_EDGE_THICKNESS,
  OUTLINE_PASS_HIDDEN_EDGE_COLOR,
  OUTLINE_PASS_VISIBLE_EDGE_COLOR,
  RENDERER_CLEAR_COLOR,
  RENDERER_PIXEL_RATIO,
} from 'src/app/shared/models/viewerConstants';
import { Renderer2 } from '@angular/core';

export class Viewer {
  scene: MainScene;
  renderer: THREE.WebGLRenderer;
  composer: any;
  outlinePass: any;
  camera: THREE.PerspectiveCamera;
  labelRenderer: any;
  controls: any;
  raycaster: THREE.Raycaster;
  model: THREE.Object3D;
  state = VIEWER_STATE.Default;
  effectFXAA = new ShaderPass(FXAAShader);
  canvasRect: any;
  animations: any;
  mixer: THREE.AnimationMixer;
  clock: THREE.Clock;

  constructor(
    canvas: any,
    pixelRatio: number,
    canvasRect: any,
    wrapper: any,
    aspect: any,
    model: any,
    renderer2: Renderer2,
  ) {
    this.setScene();
    this.setCamera(aspect);
    this.setCanvasRect(canvasRect);
    this.setRenderer(canvas, wrapper, pixelRatio);
    this.setLabelRenderer(wrapper, renderer2);
    this.setComposer(canvasRect);
    this.setControls();
    this.setRaycaster();
    this.setModel(model);
    // this.setMixer(model);
  }

  resize(box: any, canvas: any) {
    this.renderer.setSize(box.width, box.height);
    const pixelRatio = this.renderer.getPixelRatio();
    this.composer.setSize(box.width, box.height);
    this.effectFXAA.uniforms['resolution'].value.set(
      (1 / box.width) * pixelRatio,
      (1 / box.height) * pixelRatio,
    );
    this.camera.aspect = box.width / box.height;
    this.camera.updateProjectionMatrix();
    this.canvasRect = canvas.getBoundingClientRect();
  }

  setScene() {
    this.scene = new MainScene();
  }

  setCamera(aspect: any) {
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, aspect, CAMERA_NEAR, CAMERA_FAR);
  }

  setCanvasRect(canvasRect: any) {
    this.canvasRect = canvasRect;
  }

  setRenderer(canvas: any, wrapper: any, pixelRatio: any) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      powerPreference: 'high-performance',
      antialias: true,
      logarithmicDepthBuffer: true,
      alpha: true,
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    this.renderer.setPixelRatio(
      pixelRatio > RENDERER_PIXEL_RATIO ? RENDERER_PIXEL_RATIO : pixelRatio,
    );
    this.renderer.setClearColor(RENDERER_CLEAR_COLOR);
    this.renderer.localClippingEnabled = true;
  }

  setLabelRenderer(wrapper: any, renderer2: any) {
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0px';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    renderer2.appendChild(wrapper, this.labelRenderer.domElement);
  }

  setComposer(canvasRect: any) {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    this.effectFXAA.uniforms['resolution'].value.set(1 / canvasRect.width, 1 / canvasRect.height);
    this.composer.addPass(this.effectFXAA);
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(canvasRect.width, canvasRect.height),
      this.scene,
      this.camera,
    );
    this.outlinePass.edgeStrength = OUTLINE_PASS_EDGE_STRENGTH;
    this.outlinePass.edgeThickness = OUTLINE_PASS_EDGE_THICKNESS;
    this.outlinePass.visibleEdgeColor.set(OUTLINE_PASS_VISIBLE_EDGE_COLOR);
    this.outlinePass.hiddenEdgeColor.set(OUTLINE_PASS_HIDDEN_EDGE_COLOR);
    this.composer.addPass(this.outlinePass);
    this.composer.renderTarget1.stencilBuffer = true;
    this.composer.renderTarget2.stencilBuffer = true;
  }

  setControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  setRaycaster() {
    this.raycaster = new Raycaster();
  }

  setModel(model: any) {
    this.model = model.scene.children[0];
    (this.model as any).isRoot = true;
    this.scene.add(model.scene);
  }

  setMixer(model: any) {
    this.mixer = new THREE.AnimationMixer(model.scene);
    this.animations = model.animations;
  }
}
