import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { SubSink } from 'subsink';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SceneService } from './services/scene.service';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { ViewerI } from '../shared/models/viewer.interface';
import { AnnotationI } from '../shared/models/annotation.interface';
import MainScene from '../shared/classes/MainScene';
import * as TWEEN from '@tweenjs/tween.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { VIEWER_MOUSE_MODE } from '../project-editor/components/editor-viewer/editor-viewer.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { CAMERA_ROTATE_SPEED, EXPLODE_POWER } from '../shared/models/viewerConstants';

export enum VIEWER_BUTTONS {
  Default,
  Home,
  RotateAnimation,
  Explode,
  RestoreView,
  Hide,
  Isolate,
}

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs = new SubSink();
  @Input() annotations: AnnotationI[] = [];
  @Input() viewerMouseMode = VIEWER_MOUSE_MODE.Default;
  @Output() coordsAnnotation = new EventEmitter();

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('viewerWrapper') viewerWrapper: ElementRef;
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger: MatMenuTrigger;
  @ViewChild('viewerContextMenuInner') viewerContextMenuInnerRef: ElementRef;

  @HostListener('window:resize', ['$event']) onResize($event: any) {
    this.sceneService.resizeCanvas(
      this.viewerWrapper.nativeElement.getBoundingClientRect(),
      this.canvas.nativeElement,
    );
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    if (!this.viewerContextMenuInnerRef.nativeElement.contains(event.target)) {
      this.resetContextMenu();
    }
  }

  viewerInitialized = false;
  rotateAnimationBtnIsActive = false;
  rotateSpeedValue = CAMERA_ROTATE_SPEED;
  explodePowerValue = EXPLODE_POWER;
  activeBtnIndex = VIEWER_BUTTONS.Default;
  btnIsInAction = false;

  mouseCoords: any = new THREE.Vector2(-1, 1);
  mouseDownPos: any;
  mouseUpPos: any;

  annotationMarkers: THREE.Sprite[] = [];

  contextMenuPosition = { x: '0', y: '0' };
  contextMenuIsOpened = false;
  contextMenuClickedOutside = false;
  contextMenuFirstOpen = true;

  viewer!: ViewerI;

  constructor(
    public sceneService: SceneService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.matMenuTrigger.menuClosed.subscribe((v) => {
        if (!this.contextMenuClickedOutside) {
          this.contextMenuIsOpened = true;
          this.matMenuTrigger.openMenu();
        }
      }),
    );
  }

  ngAfterViewInit(): void {
    this.subs.add(
      this.sceneService.loadDefaultModel().subscribe((file) => {
        this.setUpViewer(file);
      }),
    );
    this.sceneService.setCanvasRect(this.canvas.nativeElement.getBoundingClientRect());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.annotations && !changes.annotations.firstChange) {
      this.setAnnotations();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setUpViewer(file: any) {
    this.sceneService.createViewer();
    this.viewer = this.sceneService.getViewer();
    const loader = new GLTFLoader();
    loader.setDRACOLoader(new DRACOLoader().setDecoderPath('/draco/'));

    this.sceneService.setCamera(
      this.viewerWrapper.nativeElement.clientWidth / this.viewerWrapper.nativeElement.clientHeight,
    );

    this.sceneService.setRenderer(
      this.canvas.nativeElement,
      this.viewerWrapper.nativeElement,
      window.devicePixelRatio,
    );

    this.sceneService.setLabelRenderer(this.viewerWrapper.nativeElement);
    this.renderer.appendChild(
      this.viewerWrapper.nativeElement,
      this.viewer.labelRenderer.domElement,
    );
    this.sceneService.setComposer();

    this.sceneService.setControls();

    loader.parse(JSON.stringify(file), '', (gltf) => {
      this.sceneService.setMixer(gltf);
      this.sceneService.setModel(gltf);
      this.sceneService.setMeshesDefaultMaterial();
      this.sceneService.setGridHelper(gltf);
      this.sceneService.setLight();
      this.sceneService.setCameraPosition();

      this.viewerInitialized = true;
      // this.setAnnotations();
      this.cdr.detectChanges();
    });

    var animate = () => {
      TWEEN.update();
      requestAnimationFrame(animate);
      this.setHoveredObj();
      this.sceneService.animateScene();
    };
    animate();
  }

  getViewerButtonsEnum() {
    return VIEWER_BUTTONS;
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
      case VIEWER_BUTTONS.RestoreView:
        this.resetContextMenu();
        this.sceneService.restoreView();
        break;
      case VIEWER_BUTTONS.Hide:
        this.resetContextMenu();
        this.sceneService.hideObject();
        break;
      case VIEWER_BUTTONS.Isolate:
        this.resetContextMenu();
        this.sceneService.isolateObject();
        break;
      default:
        break;
    }
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
      case VIEWER_BUTTONS.Isolate:
        this.sceneService.resetObjectIsolation();
        break;
      default:
        break;
    }
  }

  resetCamera() {
    this.sceneService.moveCameraWithAnimation(() => {
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

  explode() {
    this.btnIsInAction = true;
    this.sceneService.explodeModel(this.viewer.model, this.explodePowerValue);
  }

  stopExplodingModel() {
    this.btnIsInAction = false;
    this.sceneService.explodeModel(this.viewer.model, 0);
  }

  onExplodePowerChanged(explodeValue: any) {
    this.explodePowerValue = explodeValue;
    this.sceneService.explodeModel(this.viewer.model, this.explodePowerValue);
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
      this.setSelectedObj();
    }
  }

  getMouseCoorsByMouseEvent(e: MouseEvent) {
    return {
      x:
        ((e.clientX - this.sceneService.canvasRect.left) / this.sceneService.canvasRect.width) * 2 -
        1,
      y:
        -((e.clientY - this.sceneService.canvasRect.top) / this.sceneService.canvasRect.height) *
          2 +
        1,
    };
  }

  setMouseCoords(e: MouseEvent) {
    this.mouseCoords = { ...this.getMouseCoorsByMouseEvent(e) };
  }

  setSelectedObj() {
    this.sceneService.setSelectedObj(
      this.activeBtnIndex === VIEWER_BUTTONS.Isolate,
      this.mouseCoords,
      this.viewerMouseMode,
    );
  }

  setHoveredObj() {
    this.sceneService.setHoveredObj(
      this.activeBtnIndex === VIEWER_BUTTONS.Isolate,
      this.mouseCoords,
    );
  }

  setAnnotations() {
    const circleTexture = new THREE.TextureLoader().load('assets/png/circle.png');
    const vector = new THREE.Vector3();
    this.annotations.forEach((annotation) => {
      const annotationSpriteMaterial = new THREE.SpriteMaterial({
        map: circleTexture,
        depthTest: false,
        depthWrite: false,
        sizeAttenuation: false,
      });
      const annotationSprite = new THREE.Sprite(annotationSpriteMaterial);
      annotationSprite.scale.set(0.066, 0.066, 0.066);
      annotationSprite.position.copy(
        vector.set(annotation.position.x, annotation.position.y, annotation.position.z),
      );
      annotationSprite.userData.id = annotation.title;
      this.viewer.scene.add(annotationSprite);
      this.annotationMarkers.push(annotationSprite);

      const annotationDiv = this.renderer.createElement('div');
      this.renderer.addClass(annotationDiv, 'annotationLabel');
      this.renderer.setProperty(annotationDiv, 'innerHTML', annotation.title);
      const annotationLabel = new CSS2DObject(annotationDiv);
      annotationLabel.position.copy(
        vector.set(annotation.position.x, annotation.position.y, annotation.position.z),
      );
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

  onRightClick(event: MouseEvent) {
    this.contextMenuClickedOutside = false;
    event.preventDefault();
    if (this.sceneService.selectedObj) {
      this.sceneService.resetSelectedObjView();
      this.sceneService.selectedObj = null;
    }
    this.setMouseCoords(event);
    this.setSelectedObj();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenuIsOpened) {
      this.contextMenuIsOpened = false;
      this.matMenuTrigger.closeMenu();
    }
    if (this.contextMenuFirstOpen) {
      this.contextMenuIsOpened = true;
      this.contextMenuFirstOpen = false;
      this.matMenuTrigger.openMenu();
    }
  }

  resetContextMenu() {
    this.contextMenuIsOpened = false;
    this.contextMenuClickedOutside = true;
    this.contextMenuFirstOpen = true;
    this.matMenuTrigger.closeMenu();
  }
}
