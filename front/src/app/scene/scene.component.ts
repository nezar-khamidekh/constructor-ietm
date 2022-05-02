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
  ViewChild,
} from '@angular/core';
import { SubSink } from 'subsink';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { SceneService } from './services/scene.service';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { ViewerI } from '../shared/models/viewer.interface';
import { AnnotationI } from '../shared/models/annotation.interface';
import * as TWEEN from '@tweenjs/tween.js';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { VIEWER_MOUSE_MODE } from '../project-editor/components/editor-viewer/editor-viewer.component';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  CAMERA_ROTATE_SPEED,
  SECTION_DEFAULT_CONSTANT,
  EXPLODE_POWER,
} from '../shared/models/viewerConstants';
import { SectionPlanes } from './services/section.service';
import { LoadingService } from '../shared/services/loading.service';
import { ViewCubeComponent } from './components/view-cube/view-cube.component';
import { MatDialog } from '@angular/material/dialog';
import { ViewerSettingsComponent } from './components/viewer-settings/viewer-settings.component';

export enum VIEWER_BUTTONS {
  Default,
  Home,
  RotateAnimation,
  Explode,
  RestoreView,
  Hide,
  Isolate,
  StopAnimation,
  PlayAnimation,
  PauseAnimation,
  Cut,
}

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss'],
})
export class SceneComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs = new SubSink();

  @Input() viewerMouseMode = VIEWER_MOUSE_MODE.Default;
  @Input() repositoryId: string;
  @Input() filename: string;
  @Output() applyAnnotationPosition = new EventEmitter();
  @Output() viewerIsReady = new EventEmitter();

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('viewerWrapper') viewerWrapper: ElementRef;
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger: MatMenuTrigger;
  @ViewChild('viewerContextMenuInner') viewerContextMenuInnerRef: ElementRef;
  @ViewChild(ViewCubeComponent) cube: ViewCubeComponent;

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
  sectionDefaultContant = SECTION_DEFAULT_CONSTANT;
  activeBtnIndex = VIEWER_BUTTONS.Default;
  btnIsInAction = false;

  mouseCoords: any = new THREE.Vector2(-1, 1);
  mouseDownPos: any;
  mouseUpPos: any;

  annotations: AnnotationI[] = [];

  contextMenuPosition = { x: '0', y: '0' };
  contextMenuIsOpened = false;
  contextMenuClickedOutside = false;
  contextMenuFirstOpen = true;

  viewer!: ViewerI;

  constantSectionYZ = SECTION_DEFAULT_CONSTANT;
  constantSectionXZ = SECTION_DEFAULT_CONSTANT;
  constantSectionXY = SECTION_DEFAULT_CONSTANT;
  currentPlane: number | null = null;

  constructor(
    public sceneService: SceneService,
    private renderer: Renderer2,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadingService.setIsLoading(false);

    this.subs.add(
      this.matMenuTrigger.menuClosed.subscribe((v) => {
        if (!this.contextMenuClickedOutside) {
          this.contextMenuIsOpened = true;
          this.matMenuTrigger.openMenu();
        }
      }),
    );

    this.subs.add(
      this.sceneService.getAnnotations().subscribe((annotations) => {
        if (annotations.length) {
          this.annotations = annotations;
          if (this.viewerInitialized) {
            this.renderAnnotations(this.annotations);
            this.cdr.detectChanges();
          }
        }
      }),
    );
  }

  ngAfterViewInit(): void {
    if (this.filename)
      this.subs.add(
        this.sceneService
          .getRepositoryModel({ repoId: this.repositoryId, filename: this.filename })
          .subscribe((file) => {
            this.setUpViewer(file);
          }),
      );
    else
      this.subs.add(
        this.sceneService.loadDefaultModel().subscribe((file) => {
          this.setUpViewer(file);
        }),
      );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setUpViewer(file: any) {
    console.log(file);

    this.sceneService.createViewer();
    this.viewer = this.sceneService.getViewer();
    const loader = new GLTFLoader();

    this.sceneService.setCanvasRect(this.canvas.nativeElement.getBoundingClientRect());

    loader.setDRACOLoader(
      new DRACOLoader().setDecoderPath(
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/',
      ),
    );

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
      console.log(gltf);
      this.sceneService.setModel(gltf);
      this.sceneService.setMixer(gltf);
      this.sceneService.setMeshesDefaultMaterial();
      this.sceneService.setGridHelper(gltf);
      this.sceneService.setLight();
      this.sceneService.setCameraPosition();
      this.sceneService.setBackgroundColorScene();
      if (this.annotations.length) this.renderAnnotations(this.annotations);
      this.viewerInitialized = true;
      this.viewerIsReady.emit();
      this.cdr.detectChanges();
    });

    this.animate();
  }

  getViewerButtonsEnum() {
    return VIEWER_BUTTONS;
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

  animate() {
    TWEEN.update();
    window.requestAnimationFrame(() => this.animate());
    this.setHoveredObj();
    this.sceneService.animateScene();
    if (this.cube) this.cube.positionSettingsCube();
  }

  setMouseCoords(e: MouseEvent) {
    this.mouseCoords = { ...this.getMouseCoorsByMouseEvent(e) };
  }

  setSelectedObj() {
    const filteredIntersects = this.sceneService.setSelectedObj(
      this.activeBtnIndex === VIEWER_BUTTONS.Isolate,
      this.mouseCoords,
      this.viewerMouseMode,
    );
    if (filteredIntersects)
      if (filteredIntersects.length > 0) {
        switch (this.viewerMouseMode) {
          case VIEWER_MOUSE_MODE.ApplyAnnotation:
            this.applyAnnotationPosition.emit({
              coords: filteredIntersects[0].point,
              attachedObject: filteredIntersects[0].object,
            });
            break;
          default:
            break;
        }
        this.viewer.outlinePass.selectedObjects = [filteredIntersects[0].object];
        this.sceneService.selectObject(filteredIntersects);
      }
  }

  setHoveredObj() {
    this.sceneService.setHoveredObj(
      this.activeBtnIndex === VIEWER_BUTTONS.Isolate,
      this.mouseCoords,
    );
  }

  renderAnnotations(annotations: AnnotationI[]) {
    const circleTexture = new THREE.TextureLoader().load('assets/png/circle.png');
    const vector = new THREE.Vector3();
    const annotationMarkers: THREE.Sprite[] = [];
    annotations.forEach((annotation) => {
      if (annotation.rendered) return;
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
      annotationSprite.userData.id = annotation.id;
      annotationSprite.name = 'annotationSprite_' + annotation.id;
      annotation.attachedObject.attach(annotationSprite);
      annotationMarkers.push(annotationSprite);

      const annotationDiv = this.renderer.createElement('div');
      this.renderer.addClass(annotationDiv, 'annotation-label');
      this.renderer.setProperty(annotationDiv, 'innerHTML', annotation.title);
      const annotationLabel = new CSS2DObject(annotationDiv);
      annotationLabel.position.copy(
        vector.set(annotation.position.x, annotation.position.y, annotation.position.z),
      );
      annotationLabel.name = 'annotationLabel_' + annotation.id;
      annotation.labelDomElement = annotationDiv;
      annotationSprite.attach(annotationLabel);

      annotation.rendered = true;

      if (annotation.description) {
        const annotationDescriptionDiv = this.renderer.createElement('div');
        this.renderer.addClass(annotationDescriptionDiv, 'annotation-description');
        this.renderer.setProperty(annotationDescriptionDiv, 'innerHTML', annotation.description);
        this.renderer.appendChild(annotationDiv, annotationDescriptionDiv);
        annotation.descriptionDomElement = annotationDescriptionDiv;
      }
    });
    this.sceneService.setAnnotationMarkers(annotationMarkers);
  }

  resetPrevBtnAction(newButtonIndex: number) {
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
      case VIEWER_BUTTONS.PlayAnimation:
        if (newButtonIndex !== VIEWER_BUTTONS.PauseAnimation) this.sceneService.stopAnimation();
        break;
      case VIEWER_BUTTONS.PauseAnimation:
        if (newButtonIndex !== VIEWER_BUTTONS.PlayAnimation) this.sceneService.stopAnimation();
        break;
      case VIEWER_BUTTONS.Cut:
        this.stopCuttingModel();
        this.resetCamera();
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

  resetContextMenu() {
    this.contextMenuIsOpened = false;
    this.contextMenuClickedOutside = true;
    this.contextMenuFirstOpen = true;
    this.matMenuTrigger.closeMenu();
  }

  createSectionPlane(data: any) {
    this.currentPlane = data.indexPlane;
    this.sceneService.createSectionPlane(data);
  }

  changeConstantSection(data: any) {
    switch (data.index) {
      case SectionPlanes.YZ:
        this.constantSectionYZ = data.value;
        break;
      case SectionPlanes.XZ:
        this.constantSectionXZ = data.value;
        break;
      case SectionPlanes.XY:
        this.constantSectionXY = data.value;
        break;
      default:
        break;
    }
  }

  stopCuttingModel() {
    this.btnIsInAction = false;
    this.sceneService.removePlane();
  }

  moveYZ(value: number) {
    this.sceneService.moveYZ(value);
  }

  moveXZ(value: number) {
    this.sceneService.moveXZ(value);
  }

  moveXY(value: number) {
    this.sceneService.moveXY(value);
  }

  onViewerBtnClicked(activeBtnIndex: number) {
    if (this.activeBtnIndex !== activeBtnIndex) this.resetPrevBtnAction(activeBtnIndex);
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
      case VIEWER_BUTTONS.StopAnimation:
        this.sceneService.stopAnimation();
        break;
      case VIEWER_BUTTONS.PlayAnimation:
        this.sceneService.playAnimation();
        break;
      case VIEWER_BUTTONS.PauseAnimation:
        this.sceneService.pauseAnimation();
        break;
      case VIEWER_BUTTONS.Cut:
        if (!this.btnIsInAction) {
          this.currentPlane = null;
          this.constantSectionYZ = SECTION_DEFAULT_CONSTANT;
          this.constantSectionXZ = SECTION_DEFAULT_CONSTANT;
          this.constantSectionXY = SECTION_DEFAULT_CONSTANT;
          this.btnIsInAction = true;
        } else this.stopCuttingModel();
        break;
      default:
        break;
    }
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

  openViewerSettings() {
    this.dialog.open(ViewerSettingsComponent);
  }
}
