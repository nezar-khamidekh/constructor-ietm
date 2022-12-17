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
import { AnnotationI } from '../shared/models/annotation.interface';
import * as TWEEN from '@tweenjs/tween.js';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { VIEWER_MOUSE_MODE } from '../project-editor/components/editor-viewer/editor-viewer.component';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  CAMERA_ROTATE_SPEED,
  SECTION_DEFAULT_CONSTANT,
  EXPLODE_POWER,
  RENDERER_CLEAR_COLOR,
  CAMERA_POSITION_RATE,
} from '../shared/models/viewerConstants';
import { SectionPlanes } from './services/section.service';
import { ViewCubeComponent } from './components/view-cube/view-cube.component';
import { MatDialog } from '@angular/material/dialog';
import * as dat from 'dat.gui';
import { ViewerAnnotationComponent } from './components/viewer-annotation/viewer-annotation.component';
import { Viewer } from './classes/Viewer';
import { TreeStructureService } from '../tree-structure/services/tree-structure.service';
import { ActionType } from '../shared/models/insruction.interface';
import { skip } from 'rxjs/operators';
import { Settings } from './classes/Settings';
import { SettingsService } from './services/settings.service';
import { SceneSettingsI } from '../shared/models/sceneSettingsI.interface';

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
  HideAnnotations,
  AddAnnotation,
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
  @Input() modelId: string;
  @Input() viewMode: boolean;
  @Input() initialSettings: SceneSettingsI | null = null;
  @Output() applyAnnotationPosition = new EventEmitter();
  @Output() viewerIsReady = new EventEmitter();

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('viewerWrapper') viewerWrapper: ElementRef;
  @ViewChild(MatMenuTrigger, { static: true }) matMenuTrigger: MatMenuTrigger;
  @ViewChild('viewerContextMenuInner') viewerContextMenuInnerRef: ElementRef;
  @ViewChild(ViewCubeComponent) cube: ViewCubeComponent;

  @HostListener('window:resize', ['$event']) onResize($event: any) {
    this.viewer.resize(
      this.viewerWrapper?.nativeElement.getBoundingClientRect(),
      this.canvas?.nativeElement,
    );
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    if (!this.viewerContextMenuInnerRef?.nativeElement.contains(event.target)) {
      this.resetContextMenu();
    }
  }

  showError = false;
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

  coordsAnnotation: any;
  attachedObject: any;

  viewer: Viewer;

  animateRequestId: number;

  isRecording = false;

  sections = [
    {
      value: SECTION_DEFAULT_CONSTANT,
      inverted: false,
    },
    {
      value: SECTION_DEFAULT_CONSTANT,
      inverted: false,
    },
    {
      value: SECTION_DEFAULT_CONSTANT,
      inverted: false,
    },
  ];
  currentPlane: number | null = null;

  gui = new dat.GUI({ name: 'Настройки сцены', autoPlace: false });

  settings: Settings;

  constructor(
    public sceneService: SceneService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private treeStructureService: TreeStructureService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.settings = new Settings(
      () => {
        // localStorage.setItem(
        //   'positionCamera',
        //   JSON.stringify({
        //     x: this.settings.cameraPosition.x,
        //     y: this.settings.cameraPosition.y,
        //     z: this.settings.cameraPosition.z,
        //   }),
        // );
        this.viewer.camera.position.set(
          this.settings.cameraPosition.x,
          this.settings.cameraPosition.y,
          this.settings.cameraPosition.z,
        );
      },
      () => {
        this.settings.cameraPosition.x = this.sceneService.modelLongestSide * CAMERA_POSITION_RATE;
        this.settings.cameraPosition.y =
          (this.sceneService.modelLongestSide * CAMERA_POSITION_RATE) / 2;
        this.settings.cameraPosition.z = this.sceneService.modelLongestSide * CAMERA_POSITION_RATE;
        // localStorage.setItem(
        //   'positionCamera',
        //   JSON.stringify({
        //     x: this.sceneService.modelLongestSide * CAMERA_POSITION_RATE,
        //     y: (this.sceneService.modelLongestSide * CAMERA_POSITION_RATE) / 2,
        //     z: this.sceneService.modelLongestSide * CAMERA_POSITION_RATE,
        //   }),
        // );
        this.viewer.camera.position.set(
          this.settings.cameraPosition.x,
          this.settings.cameraPosition.y,
          this.settings.cameraPosition.z,
        );
        for (let i = 0; i < 3; i++) {
          this.gui.__folders['Положение камеры по умолчанию'].__controllers[i].updateDisplay();
        }
      },
    );
    // if (!this.viewMode) {
    //   const visibleGridHelper = localStorage.getItem('visibleGridHelper') || '';
    //   if (visibleGridHelper) this.settings.grid = visibleGridHelper === 'true' ? true : false;
    //   const backgroundColorScene = localStorage.getItem('backgroundColorScene') || '';
    //   if (backgroundColorScene) this.settings.background = backgroundColorScene;
    //   const cameraPosition = JSON.parse(localStorage.getItem('positionCamera')!) || '';
    //   if (cameraPosition) {
    //     this.settings.cameraPosition.x = cameraPosition.x;
    //     this.settings.cameraPosition.y = cameraPosition.y;
    //     this.settings.cameraPosition.z = cameraPosition.z;
    //   }
    // }
    if (this.initialSettings) {
      this.settings.grid = this.initialSettings.grid;
      this.settings.background = this.initialSettings.background;
      this.settings.cameraPosition = this.initialSettings.cameraPosition;
    }

    console.log(this.settings);

    this.settingsService.setSettings(this.settings);

    this.subs.add(
      this.matMenuTrigger?.menuClosed.subscribe((v) => {
        if (!this.contextMenuClickedOutside) {
          this.contextMenuIsOpened = true;
          this.matMenuTrigger?.openMenu();
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

    this.subs.add(
      this.sceneService
        .getIsRecording()
        .pipe(skip(1))
        .subscribe((isRecording) => {
          this.isRecording = isRecording;
          if (isRecording === false) {
            this.sceneService.setActions([
              ...this.sceneService.actions,
              {
                id: this.sceneService.actions.length,
                type: ActionType.Camera,
                value: {
                  position: this.viewer.camera.position.clone(),
                  target: this.viewer.controls.target.clone(),
                },
              },
            ]);
          } else {
            this.sceneService.actions = [];
          }
        }),
    );
  }

  ngAfterViewInit(): void {
    if (this.modelId)
      this.subs.add(
        this.sceneService
          .getRepositoryModel({ repoId: this.repositoryId, modelId: this.modelId })
          .subscribe({
            next: (file) => {
              this.initializeViewer(file);
            },
            error: (err) => {
              console.error(err);
              this.initializeViewer();
            },
          }),
      );
    else
      this.subs.add(
        this.sceneService.loadDefaultModel().subscribe((file) => {
          this.initializeViewer(file);
        }),
      );
  }

  ngOnDestroy(): void {
    if (this.viewer) this.sceneService.clearScene();
    if (this.animateRequestId) window.cancelAnimationFrame(this.animateRequestId);
    this.gui.destroy();
    this.subs.unsubscribe();
  }

  initializeViewer(file?: any) {
    if (!file) {
      this.showError = true;
      this.viewerInitialized = true;
      this.viewerIsReady.emit();
      this.ngOnDestroy();

      return;
    }

    console.log(file);

    const loader = new GLTFLoader();

    loader.setDRACOLoader(new DRACOLoader().setDecoderPath('./assets/draco/'));

    loader.parse(JSON.stringify(file), '', (gltf) => {
      this.onLoadModel(gltf);
    });
  }

  getViewerButtonsEnum() {
    return VIEWER_BUTTONS;
  }

  getMouseCoorsByMouseEvent(e: MouseEvent) {
    return {
      x: ((e.clientX - this.viewer.canvasRect.left) / this.viewer.canvasRect.width) * 2 - 1,
      y: -((e.clientY - this.viewer.canvasRect.top) / this.viewer.canvasRect.height) * 2 + 1,
    };
  }

  animate() {
    TWEEN.update();
    this.animateRequestId = window.requestAnimationFrame(() => this.animate());
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
        this.coordsAnnotation = filteredIntersects[0].point;
        this.attachedObject = filteredIntersects[0].object;
        this.viewer.outlinePass.selectedObjects = [filteredIntersects[0].object];
        this.sceneService.selectObject(filteredIntersects);
        if (this.sceneService.selectedObj)
          this.treeStructureService.setSelectedTreeNodeObjectId(
            this.sceneService.selectedObj.objectId,
          );
      }
  }

  setHoveredObj() {
    this.sceneService.setHoveredObj(
      this.activeBtnIndex === VIEWER_BUTTONS.Isolate,
      this.mouseCoords,
    );
  }

  setGui() {
    this.gui.closed = true;
    const guiGridFolder = this.gui.addFolder('Сетка');
    guiGridFolder
      .add(this.settings, 'grid')
      .name('Включить')
      .onChange((value) => {
        // localStorage.setItem('visibleGridHelper', value);
        this.sceneService.setGridHelperVisibility(value);
      });

    const guiSceneBackgroundFolder = this.gui.addFolder('Задний фон');
    guiSceneBackgroundFolder
      .addColor(this.settings, 'background')
      .name('Цвет')
      .listen()
      .onChange((color) => {
        // localStorage.setItem('backgroundColorScene', color);
        this.sceneService.setBackgroundColorScene(color);
      });
    guiSceneBackgroundFolder
      .add(this.settings, 'resetBackground')
      .name('Сбросить')
      .onChange(() => {
        // localStorage.setItem('backgroundColorScene', '#' + RENDERER_CLEAR_COLOR.getHexString());
        this.sceneService.setBackgroundColorScene('#' + RENDERER_CLEAR_COLOR.getHexString());
      });

    const guiCameraPositionFolder = this.gui.addFolder('Положение камеры по умолчанию');
    guiCameraPositionFolder
      .add(this.settings.cameraPosition, 'x')
      .min(-800)
      .max(800)
      .step(1)
      .name('x')
      .onChange((x) => {
        this.settings.cameraPosition.x = x;
        this.viewer.camera.position.setX(this.settings.cameraPosition.x);
      });
    guiCameraPositionFolder
      .add(this.settings.cameraPosition, 'y')
      .min(-800)
      .max(800)
      .step(1)
      .name('y')
      .onChange((y) => {
        this.settings.cameraPosition.y = y;
        this.viewer.camera.position.setY(this.settings.cameraPosition.y);
      });
    guiCameraPositionFolder
      .add(this.settings.cameraPosition, 'z')
      .min(-800)
      .max(800)
      .step(1)
      .name('z')
      .onChange((z) => {
        this.settings.cameraPosition.z = z;

        this.viewer.camera.position.setZ(this.settings.cameraPosition.z);
      });
    guiCameraPositionFolder.add(this.settings, 'acceptPosition').name('Применить');
    guiCameraPositionFolder.add(this.settings, 'resetPosition').name('Сбросить');
    this.renderer.appendChild(this.viewerWrapper.nativeElement, this.gui.domElement);
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

      const annotationDescriptionDiv = this.renderer.createElement('div');
      this.renderer.addClass(annotationDescriptionDiv, 'annotation-description');
      this.renderer.setProperty(annotationDescriptionDiv, 'innerHTML', annotation.description);
      this.renderer.appendChild(annotationDiv, annotationDescriptionDiv);
      annotation.descriptionDomElement = annotationDescriptionDiv;
    });
    this.sceneService.setAnnotationMarkers(annotationMarkers);
  }

  resetPrevBtnAction(newButtonIndex: number) {
    switch (this.activeBtnIndex) {
      case VIEWER_BUTTONS.RotateAnimation:
        this.stopRotatingCamera();
        this.resetCamera();
        break;
      case VIEWER_BUTTONS.Explode:
        this.stopExplodingModel();
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
    this.sceneService.moveCameraToDefaultPosition(() => {
      this.viewer.controls.enabled = true;
    });
  }

  rotateCamera() {
    this.btnIsInAction = true;
    this.sceneService.rotateCamera(-this.rotateSpeedValue);
    if (this.isRecording)
      this.sceneService.recordAction(ActionType.Rotation, -this.rotateSpeedValue);
  }

  stopRotatingCamera() {
    this.btnIsInAction = false;
    this.rotateSpeedValue = CAMERA_ROTATE_SPEED;
    this.sceneService.stopRotatingCamera();
  }

  onRotateCameraSpeedChanged(valueSpeed: any) {
    this.rotateSpeedValue = valueSpeed;
    this.sceneService.onRotateCameraSpeedChanged(this.rotateSpeedValue);
    if (this.isRecording)
      this.sceneService.recordAction(ActionType.Rotation, -this.rotateSpeedValue);
  }

  explode() {
    this.btnIsInAction = true;
    this.sceneService.explodeModel(this.viewer.model, this.explodePowerValue);
    if (this.isRecording)
      this.sceneService.recordAction(ActionType.Explode, this.explodePowerValue);
  }

  stopExplodingModel() {
    this.btnIsInAction = false;
    this.explodePowerValue = EXPLODE_POWER;
    this.sceneService.explodeModel(this.viewer.model, 0);
  }

  resetContextMenu() {
    this.contextMenuIsOpened = false;
    this.contextMenuClickedOutside = true;
    this.contextMenuFirstOpen = true;
    this.matMenuTrigger?.closeMenu();
  }

  createSectionPlane(data: any) {
    this.currentPlane = data.indexPlane;
    this.sceneService.createSectionPlane(data);
  }

  changeConstantSection(data: any) {
    switch (data.index) {
      case SectionPlanes.YZ:
        this.sections[0].value = data.value;
        if (this.isRecording) this.recordPlaneAction(0);
        break;
      case SectionPlanes.XZ:
        this.sections[1].value = data.value;
        if (this.isRecording) this.recordPlaneAction(1);
        break;
      case SectionPlanes.XY:
        this.sections[2].value = data.value;
        if (this.isRecording) this.recordPlaneAction(2);
        break;
      default:
        break;
    }
  }

  changeInvertPlane(data: any) {
    switch (data.index) {
      case SectionPlanes.YZ:
        this.sections[0].inverted = data.checked;
        this.sceneService.invertCurrentPlane(this.sections[0].inverted);
        if (this.isRecording) this.recordPlaneAction(0);
        break;
      case SectionPlanes.XZ:
        this.sections[1].inverted = data.checked;
        this.sceneService.invertCurrentPlane(this.sections[1].inverted);
        if (this.isRecording) this.recordPlaneAction(1);
        break;
      case SectionPlanes.XY:
        this.sections[2].inverted = data.checked;
        this.sceneService.invertCurrentPlane(this.sections[2].inverted);
        if (this.isRecording) this.recordPlaneAction(2);
        break;
      default:
        break;
    }
  }

  recordPlaneAction(indexPlane: number) {
    this.sceneService.recordAction(ActionType.Section, {
      indexPlane: indexPlane,
      constantSection: this.sections[indexPlane].value,
      inverted: this.sections[indexPlane].inverted,
    });
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
        this.sceneService.fitToView(this.sceneService.selectedObj.objectId, () => {});
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
          this.sections[0].value = SECTION_DEFAULT_CONSTANT;
          this.sections[1].value = SECTION_DEFAULT_CONSTANT;
          this.sections[2].value = SECTION_DEFAULT_CONSTANT;
          this.btnIsInAction = true;
        } else this.stopCuttingModel();
        break;
      case VIEWER_BUTTONS.HideAnnotations:
        if (this.annotations.length) {
          this.annotations.forEach((annotation) => {
            this.sceneService.toggleAnnotationsVisibility(
              annotation.id,
              this.viewMode ? false : true,
            );
          });
        }
        this.viewMode = !this.viewMode;
        break;
      case VIEWER_BUTTONS.AddAnnotation:
        const dialogRef = this.dialog.open(ViewerAnnotationComponent, { width: '300px' });
        this.resetContextMenu();
        dialogRef.afterClosed().subscribe((res: { title: string; text: string }) => {
          this.applyAnnotationPosition.emit({
            title: res.title,
            text: res.text,
            coords: this.coordsAnnotation,
            attachedObject: this.attachedObject,
          });
        });
        break;
      default:
        break;
    }
  }

  onExplodePowerChanged(explodeValue: any) {
    this.explodePowerValue = explodeValue;
    this.sceneService.explodeModel(this.viewer.model, this.explodePowerValue);
    if (this.isRecording)
      this.sceneService.recordAction(ActionType.Explode, this.explodePowerValue);
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
    this.onMouseClick(event);
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
      this.matMenuTrigger?.closeMenu();
    }
    if (this.contextMenuFirstOpen) {
      this.contextMenuIsOpened = true;
      this.contextMenuFirstOpen = false;
      this.matMenuTrigger?.openMenu();
    }
  }

  onLoadModel(gltf?: any) {
    this.viewer = new Viewer(
      this.canvas.nativeElement,
      window.devicePixelRatio,
      this.canvas.nativeElement.getBoundingClientRect(),
      this.viewerWrapper.nativeElement,
      this.viewerWrapper.nativeElement.clientWidth / this.viewerWrapper.nativeElement.clientHeight,
      gltf,
      this.renderer,
    );
    this.sceneService.setViewer(this.viewer);
    this.sceneService.setLongestSide(gltf);
    this.sceneService.setObjectsCustomProperties();
    this.sceneService.setGridHelper(gltf);
    this.sceneService.setLight();
    this.sceneService.setCameraDefaultPosition();
    this.sceneService.setDefaultTarget(gltf.scene.children[0].name);
    if (
      this.settings.cameraPosition.x === 0 &&
      this.settings.cameraPosition.y === 0 &&
      this.settings.cameraPosition.z === 0
    )
      this.settings.cameraPosition = { ...this.viewer.camera.position };
    if (this.annotations.length) this.renderAnnotations(this.annotations);
    this.sceneService.setGridHelperVisibility(this.settings.grid);
    this.sceneService.setBackgroundColorScene(this.settings.background);
    this.sceneService.setCameraDefaultPosition(this.settings.cameraPosition);
    if (!this.viewMode) {
      this.setGui();
    }

    this.viewerInitialized = true;
    this.viewerIsReady.emit();
    this.animate();
    this.cdr.detectChanges();
  }
}
