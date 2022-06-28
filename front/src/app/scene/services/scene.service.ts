import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  CAMERA_ANIM_DUR,
  CAMERA_POSITION_RATE,
  CLICKED_OBJ_MATERIAL,
  GRID_HELPER_DIVISIONS,
  GRID_HELPER_SIZE_RATE,
  HIGHLIGHT_COLOR,
  TRANSPARENT_OBJ_MATERIAL,
} from 'src/app/shared/models/viewerConstants';
import { environment } from 'src/environments/environment';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { AnnotationI } from 'src/app/shared/models/annotation.interface';
import { SectionPlanes, SectionService } from './section.service';
import { RepositoryModelDto } from 'src/app/shared/models/repositoryModelDto.interface';
import {
  AxisAngleOrientationI,
  OffsetFactorOrientationI,
} from '../components/view-cube/view-cube.component';
import { Viewer } from '../classes/Viewer';
import { VIEWER_STATE } from '../models/viewerState.enum';
import { ActionI, ActionType } from 'src/app/shared/models/insruction.interface';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class SceneService {
  private apiUrl: string = environment.baseUrl;

  viewer: Viewer;

  effectFXAA = new ShaderPass(FXAAShader);
  canvasRect: any;
  modelLongestSide = 0;

  selectedObj: any = null;
  hoveredObj: any = null;
  hiddenObjects$ = new BehaviorSubject<any[]>([]);
  annotations$ = new BehaviorSubject<any[]>([]);
  isRecording$ = new BehaviorSubject<boolean>(false);
  actions$ = new BehaviorSubject<ActionI[]>([]);
  annotationMarkers: THREE.Sprite[] = [];
  animations: any[] = [];
  crossSectionObject: any;
  preAnnotationId: number | null = null;
  actions: ActionI[] = [];

  targetPosition: any;

  constructor(
    private http: HttpClient,
    private sectionService: SectionService,
    private settingsService: SettingsService,
  ) {}

  loadDefaultModel(): Observable<any> {
    return this.http.get(`${this.apiUrl}/viewer/default`, { withCredentials: true });
  }

  /*   loadModel(modelName: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/viewer/${modelName}`, { withCredentials: true });
  } */

  getRepositoryModel(data: RepositoryModelDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/repository/model/take`, data, { withCredentials: true });
  }

  shadeColor(hexadecimalColor: number, percent: number) {
    let color = hexadecimalColor.toString(16);

    color = color.replace(/^#/, '');
    if (color.length === 3) color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];

    const match = color.match(/.{2}/g);
    let [r, g, b]: any[] = [];
    if (match) [r, g, b] = match;
    [r, g, b] = [parseInt(r, 16) + percent, parseInt(g, 16) + percent, parseInt(b, 16) + percent];

    r = Math.max(Math.min(255, r), 0).toString(16);
    g = Math.max(Math.min(255, g), 0).toString(16);
    b = Math.max(Math.min(255, b), 0).toString(16);

    const rr = (r.length < 2 ? '0' : '') + r;
    const gg = (g.length < 2 ? '0' : '') + g;
    const bb = (b.length < 2 ? '0' : '') + b;

    return parseInt(rr + gg + bb, 16);
  }

  setViewer(viewer: Viewer) {
    this.viewer = viewer;
  }

  getHiddenObjects() {
    return this.hiddenObjects$.asObservable();
  }

  setHiddenObjects(hiddenObjects: any[]) {
    this.hiddenObjects$.next(hiddenObjects);
  }

  getModel() {
    return this.viewer.model;
  }

  getAnnotations() {
    return this.annotations$.asObservable();
  }

  setAnnotations(annotations: any[]) {
    this.annotations$.next([...annotations]);
  }

  getIsRecording() {
    return this.isRecording$.asObservable();
  }

  setIsRecording(isRecording: boolean) {
    this.isRecording$.next(isRecording);
  }

  getActions() {
    return this.actions$.asObservable();
  }

  setActions(actions: any[]) {
    this.actions$.next(actions);
  }

  setObjectsCustomProperties() {
    this.viewer.model.traverse((child: any) => {
      if ((child instanceof THREE.Mesh) as any) {
        child.defaultMaterial = child.material.clone();
      }
      child.objectId = child.userData.uuid;
    });
  }

  setLongestSide(gltf: any) {
    const boundBox = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    boundBox.getSize(size);
    this.modelLongestSide = Math.max(size.x, size.y, size.z);
  }

  setGridHelper(gltf: any) {
    const boundBox = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    boundBox.getSize(size);
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

  setGridHelperVisibility(visibility: boolean) {
    const grid = this.viewer.scene.getObjectByName('__Grid');
    if (grid) {
      grid.visible = visibility;
    }
  }

  setLight() {
    this.viewer.scene.setLight(this.modelLongestSide);
  }

  setCameraDefaultPosition(position?: { x: number; y: number; z: number }) {
    const posCamera = position ?? {
      x: this.modelLongestSide * CAMERA_POSITION_RATE,
      y: (this.modelLongestSide * CAMERA_POSITION_RATE) / 2,
      z: this.modelLongestSide * CAMERA_POSITION_RATE,
    };
    this.viewer.camera.position.set(posCamera.x, posCamera.y, posCamera.z);
    console.log(this.viewer.camera.position);
    this.viewer.controls.update();
  }

  setDefaultTarget(name: string) {
    const obj = this.viewer.model.getObjectByName(name)!;

    const boundingBox = new THREE.Box3().setFromObject(obj);
    const vector = new THREE.Vector3();

    const center = boundingBox.getCenter(vector);
    this.viewer.controls.target = new THREE.Vector3(center.x, center.y, center.z);

    this.targetPosition = center;

    this.viewer.camera.updateProjectionMatrix();
    this.viewer.controls.update();
  }

  setBackgroundColorScene(color: string) {
    this.viewer.scene.background = new THREE.Color(color);
  }

  animateScene() {
    this.viewer.mixer?.update(this.viewer.clock.getDelta() / 3);
    this.viewer.controls.update();
    if (this.viewer.composer) this.viewer.composer.render();
    if (this.viewer.labelRenderer)
      this.viewer.labelRenderer.render(this.viewer.scene, this.viewer.camera);
  }

  epsilon(value: number) {
    return Math.abs(value) < 1e-10 ? 0 : value;
  }

  getCameraCSSMatrix() {
    const matrix = new THREE.Matrix4();
    matrix.extractRotation(this.viewer.camera.matrixWorldInverse);
    return `matrix3d(
      ${this.epsilon(matrix.elements[0])},
      ${this.epsilon(-matrix.elements[1])},
      ${this.epsilon(matrix.elements[2])},
      ${this.epsilon(matrix.elements[3])},
      ${this.epsilon(matrix.elements[4])},
      ${this.epsilon(-matrix.elements[5])},
      ${this.epsilon(matrix.elements[6])},
      ${this.epsilon(matrix.elements[7])},
      ${this.epsilon(matrix.elements[8])},
      ${this.epsilon(-matrix.elements[9])},
      ${this.epsilon(matrix.elements[10])},
      ${this.epsilon(matrix.elements[11])},
      ${this.epsilon(matrix.elements[12])},
      ${this.epsilon(-matrix.elements[13])},
      ${this.epsilon(matrix.elements[14])},
      ${this.epsilon(matrix.elements[15])}
    )`;
  }

  rotationCameraByClickOnSideOfCube(
    offsetFactor: OffsetFactorOrientationI,
    axisAngle: AxisAngleOrientationI,
  ) {
    // this.viewer.controls.target = new THREE.Vector3(
    //   this.targetPosition.x,
    //   this.targetPosition.y,
    //   this.targetPosition.z,
    // );
    // const offsetUnit = this.viewer.camera.position.length();
    // const offset = new THREE.Vector3(
    //   offsetUnit * offsetFactor.x,
    //   offsetUnit * offsetFactor.y,
    //   offsetUnit * offsetFactor.z,
    // );

    // const center = new THREE.Vector3();
    // const finishPosition = center.add(offset);

    // this.viewer.camera.position.set(finishPosition.x, finishPosition.y, finishPosition.z);

    this.viewer.controls.target = new THREE.Vector3(
      this.targetPosition.x,
      this.targetPosition.y,
      this.targetPosition.z,
    );

    const oldCamPos = this.viewer.camera.position.clone();

    const lengthVec = Math.sqrt(
      Math.pow(oldCamPos.x - this.targetPosition.x, 2) +
        Math.pow(oldCamPos.y - this.targetPosition.y, 2) +
        Math.pow(oldCamPos.z - this.targetPosition.z, 2),
    );

    const offsetUnit = lengthVec;
    const offset = new THREE.Vector3(
      offsetUnit * offsetFactor.x,
      offsetUnit * offsetFactor.y,
      offsetUnit * offsetFactor.z,
    );

    const center = new THREE.Vector3(
      this.targetPosition.x,
      this.targetPosition.y,
      this.targetPosition.z,
    );
    const finishPosition = center.add(offset);

    this.viewer.camera.position.set(finishPosition.x, finishPosition.y, finishPosition.z);

    // const positionTween = new TWEEN.Tween(this.viewer.camera.position)
    //   .to(finishPosition, 300)
    //   .easing(TWEEN.Easing.Linear.None);

    // const euler = new THREE.Euler(axisAngle.x, axisAngle.y, axisAngle.z);

    // const finishQuaternion = new THREE.Quaternion()
    //   .copy(this.viewer.camera.quaternion)
    //   .setFromEuler(euler);

    // const quaternionTween = new TWEEN.Tween(this.viewer.camera.quaternion)
    //   .to(finishQuaternion, 300)
    //   .easing(TWEEN.Easing.Linear.None);

    // positionTween.start();
    // quaternionTween.start();
  }

  moveCameraToDefaultPosition(onCompleteCallback: () => void) {
    // const posCamera = JSON.parse(localStorage.getItem('positionCamera')!) || '';
    this.viewer.controls.enabled = false;
    const oldCameraPos = this.viewer.camera.position.clone();

    const settings = this.settingsService.getSettings();

    const newCameraPos = new THREE.Vector3(
      settings.cameraPosition.x,
      settings.cameraPosition.y,
      settings.cameraPosition.z,
    );

    this.moveCameraWithAnimation(oldCameraPos, newCameraPos, onCompleteCallback);
    // this.viewer.controls.reset();
    this.viewer.controls.target = new THREE.Vector3(
      this.targetPosition.x,
      this.targetPosition.y,
      this.targetPosition.z,
    );
  }

  moveCameraWithAnimation(
    oldPosition: THREE.Vector3,
    newPosition: THREE.Vector3,
    onCompleteCallback: () => void,
  ) {
    new TWEEN.Tween(oldPosition)
      .to(newPosition, CAMERA_ANIM_DUR)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate(() => {
        this.viewer.camera.position.set(oldPosition.x, oldPosition.y, oldPosition.z);
        this.viewer.camera.lookAt(new THREE.Vector3(0, 0, 0));
      })
      .onComplete(onCompleteCallback)
      .start();
  }

  explodeModel(node: any, power = 0, plant = new THREE.Vector3(), level = 0) {
    if (!node) return;

    if (!node._originalPosition) {
      node.updateWorldMatrix(true, true);
      node._originalPosition = node.position.clone();
    }

    const toVec = new THREE.Vector3();
    if (level === 0) toVec.copy(node._originalPosition.clone());
    else if (level === 1) {
      const plantLocal = node.parent.worldToLocal(plant.clone());
      toVec.copy(node._originalPosition.clone().sub(plantLocal).multiplyScalar(3));
    }
    node._explode = { from: node._originalPosition.clone(), to: toVec };
    const explodeVec = node._explode.from.clone();
    explodeVec.lerp(node._explode.to, power);
    node.position.copy(explodeVec);
    node.children.forEach((child: any) => {
      if (
        node.children.length > 1 &&
        node.children[0].type !== 'Mesh' &&
        node.children[0].type !== 'LineSegments'
      )
        this.explodeModel(child, power, plant, level + 1);
    });
  }

  playAction(actions: ActionI[]) {
    this.resetAction();
    actions.forEach((action) => {
      switch (action.type) {
        case ActionType.Camera:
          this.viewer.controls.target = new THREE.Vector3(
            action.value.target.x,
            action.value.target.y,
            action.value.target.z,
          );
          this.moveCameraWithAnimation(
            this.viewer.camera.position,
            action.value.position,
            () => {},
          );
          break;
        case ActionType.Rotation:
          this.rotateCamera(action.value);
          break;
        case ActionType.Explode:
          this.explodeModel(this.viewer.model, action.value);
          break;
        case ActionType.Section:
          this.createSectionPlane({
            indexPlane: action.value.indexPlane,
            constantSection: action.value.constantSection,
            inverted: action.value.inverted,
          });
          break;
        case ActionType.Hide:
          this.toggleObjectVisibilityById(action.value.objectId);
          break;
        case ActionType.RestoreView:
          this.restoreView();
          break;
        case ActionType.FitToView:
          this.fitToView(action.value.objectId, () => {});
          break;
        default:
          break;
      }
    });
  }

  resetAction() {
    this.viewer.controls.target = new THREE.Vector3(
      this.targetPosition.x,
      this.targetPosition.y,
      this.targetPosition.z,
    );
    this.stopRotatingCamera();
    this.explodeModel(this.viewer.model, 0);
    this.removePlane();
    this.restoreView();
    this.resetObjectIsolation();
    this.moveCameraToDefaultPosition(() => {
      this.viewer.controls.enabled = true;
    });
  }

  rotateCamera(rotateSpeedValue: number) {
    this.viewer.controls.enabled = false;
    this.viewer.controls.autoRotate = true;
    this.viewer.controls.autoRotateSpeed = rotateSpeedValue;
    this.viewer.controls.target = new THREE.Vector3(
      this.targetPosition.x,
      this.targetPosition.y,
      this.targetPosition.z,
    );
  }

  stopRotatingCamera() {
    this.viewer.controls.enabled = true;
    this.viewer.controls.autoRotate = false;
  }

  onRotateCameraSpeedChanged(valueSpeed: any) {
    this.viewer.controls.autoRotateSpeed = -valueSpeed;
  }

  setSelectedObj(isolateIsActive: boolean, mouseCoords: any, mouseMode: number) {
    this.annotations$.value.forEach((annotation) => {
      if (annotation.description) annotation.descriptionDomElement!.style.display = 'none';
    });
    if ((this.selectedObj && isolateIsActive) || this.viewer.state === VIEWER_STATE.Isolated)
      return null;
    this.viewer.raycaster.setFromCamera(mouseCoords, this.viewer.camera);
    const intersects = this.viewer.raycaster.intersectObjects(this.viewer.model.children, true);
    const intersectedAnnotations = this.viewer.raycaster.intersectObjects(
      this.annotationMarkers,
      true,
    );
    if (intersectedAnnotations.length) {
      const annotation: AnnotationI = this.annotations$.value.find(
        (annotation: any) => annotation.id == intersectedAnnotations[0].object.userData.id,
      );
      if (annotation && annotation.description)
        annotation.descriptionDomElement!.style.display = 'block';
    } else if (intersects.length > 0) {
      const filteredIntersects = intersects.filter(
        (intersection: any) => !this.objectByIdIsHidden(intersection.object.id),
      );
      return filteredIntersects;
    } else {
      if (this.selectedObj) {
        this.viewer.outlinePass.selectedObjects = [];
        this.selectedObj.material = this.selectedObj.defaultMaterial.clone();
        this.selectedObj = null;
      }
    }
    return null;
  }

  showAnnotationDesciption(curAnnotation: AnnotationI) {
    if (this.preAnnotationId === curAnnotation.id) {
      this.annotations$.value.forEach((annotation) => {
        if (annotation.description) annotation.descriptionDomElement!.style.display = 'none';
      });
      this.preAnnotationId = null;
    } else {
      this.annotations$.value.forEach((annotation) => {
        if (annotation.description) annotation.descriptionDomElement!.style.display = 'none';
      });
      const annotation: AnnotationI = this.annotations$.value.find(
        (annotation: any) => annotation.id === curAnnotation.id,
      );
      if (annotation.description) annotation.descriptionDomElement!.style.display = 'block';
      this.preAnnotationId = curAnnotation.id;
    }
  }

  selectObject(filteredIntersects: THREE.Intersection[]) {
    if (this.selectedObj) {
      this.selectedObj.material = this.selectedObj.defaultMaterial.clone();
      if (this.selectedObj?.uuid === filteredIntersects[0].object.uuid) {
        this.selectedObj = null;
      } else {
        this.selectedObj = filteredIntersects[0].object;
        this.selectedObj.material = CLICKED_OBJ_MATERIAL;
      }
    } else {
      this.selectedObj = filteredIntersects[0].object;
      this.selectedObj.material = CLICKED_OBJ_MATERIAL;
    }
  }

  setHoveredObj(isolateIsActive: boolean, mouseCoords: any) {
    if (isolateIsActive || this.viewer.state === VIEWER_STATE.Isolated) return;
    this.viewer.raycaster.setFromCamera(mouseCoords, this.viewer.camera);
    const intersects = this.viewer.raycaster
      .intersectObjects(this.viewer.model.children, true)
      .filter((intersection) => intersection.object.type !== 'Sprite');
    if (intersects.length > 0) {
      const filteredIntersects = intersects.filter(
        (intersection: any) => !this.objectByIdIsHidden(intersection.object.id),
      );
      if (filteredIntersects.length > 0) {
        if (this.hoveredObj && this.hoveredObj.uuid !== this.selectedObj?.uuid) {
          this.hoveredObj.material.color.setHex(this.hoveredObj.defaultMaterial.color.getHex());
        }
        this.hoveredObj = filteredIntersects[0].object;
        if (this.hoveredObj.uuid !== this.selectedObj?.uuid) {
          this.hoveredObj.material.color.setHex(
            this.shadeColor(this.hoveredObj.defaultMaterial.color.getHex(), 40),
          );
        }
      }
    } else {
      if (this.hoveredObj && this.hoveredObj.uuid !== this.selectedObj?.uuid) {
        this.hoveredObj.material.color.setHex(this.hoveredObj.defaultMaterial.color.getHex());
        this.hoveredObj = null;
      }
    }
  }

  setHighLightObj(node: any, typeEvent: string) {
    switch (typeEvent) {
      case 'mouseenter':
        this.checkChildrenNodeForFillColor(node, 'mouseenter');
        break;
      case 'mouseleave':
        this.checkChildrenNodeForFillColor(node, 'mouseleave');
        break;
      default:
        break;
    }
  }

  checkChildrenNodeForFillColor(node: any, typeEvent: string) {
    if (!node.children.length) {
      this.highlightElement(typeEvent, node);
    } else {
      node.children.forEach((child: any) => {
        if (child.children.length > 0) {
          this.checkChildrenNodeForFillColor(child, typeEvent);
        } else {
          this.highlightElement(typeEvent, child);
        }
      });
    }
  }

  highlightElement(typeEvent: string, node: any) {
    if (
      node.objectId !== this.selectedObj?.objectId &&
      node.parent.type !== 'Sprite' &&
      node.type !== 'Sprite'
    ) {
      const mesh = this.viewer.scene.getObjectByProperty('objectId', node.objectId) as any;
      if (mesh.material) {
        switch (typeEvent) {
          case 'mouseenter':
            mesh.material.color.setHex(HIGHLIGHT_COLOR);
            break;
          case 'mouseleave':
            mesh.material.color.setHex(mesh.defaultMaterial.color.getHex());
            break;
          default:
            break;
        }
      }
    }
  }

  resetSelectedObjView() {
    this.selectedObj.material = this.selectedObj.defaultMaterial.clone();
    this.viewer.outlinePass.selectedObjects = [];
  }

  isolateObject(obj?: any) {
    this.viewer.state = VIEWER_STATE.Isolated;
    if (obj) {
      this.viewer.model.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.uuid !== obj.uuid) {
          child.material = TRANSPARENT_OBJ_MATERIAL.clone();
        }
      });
      obj.traverse((child: any) => {
        if ((child instanceof THREE.Mesh) as any) {
          child.material = child.defaultMaterial.clone();
        }
      });
      if (this.isRecording$.value)
        this.recordAction(ActionType.FitToView, {
          objectId: this.selectedObj.objectId,
          name: this.selectedObj.userData.name || this.selectedObj.name,
        });
    } else if (this.selectedObj) {
      this.resetSelectedObjView();
      this.viewer.model.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.uuid !== this.selectedObj.uuid) {
          child.material = TRANSPARENT_OBJ_MATERIAL.clone();
        }
      });
    }
  }

  resetObjectIsolation() {
    this.viewer.state = VIEWER_STATE.Default;
    this.viewer.model.traverse((child: any) => {
      if ((child instanceof THREE.Mesh) as any) {
        child.material = child.defaultMaterial.clone();
      }
    });
  }

  hideObject() {
    if (this.selectedObj) {
      this.resetSelectedObjView();
      this.selectedObj.visible = false;
      this.setHiddenObjects([...this.hiddenObjects$.value, this.selectedObj]);
      if (this.isRecording$.value)
        this.recordAction(ActionType.Hide, {
          objectId: this.selectedObj.objectId,
          name: this.selectedObj.userData.name || this.selectedObj.name,
        });
      this.selectedObj = null;
    }
  }

  recordAction(type: number, value: any) {
    const existingAction = this.actions.find((action) => action.type === type);
    if (type !== ActionType.Hide && existingAction) {
      existingAction.value = value;
    } else {
      this.actions.push({
        index: this.actions.length,
        type: type,
        value: value,
      });
    }
  }

  toggleObjectVisibilityById(objectId: string) {
    const obj = this.viewer.scene.getObjectByProperty('objectId', objectId)!;
    obj.visible = !obj.visible;
    if (obj.visible)
      this.setHiddenObjects(
        this.hiddenObjects$.value.filter((obj: any) => obj.objectId !== objectId),
      );
    else {
      this.setHiddenObjects([...this.hiddenObjects$.value, obj]);
    }
  }

  objectByIdIsHidden(id: number) {
    return this.hiddenObjects$.value.some((obj: any) => obj.id === id);
  }

  restoreView() {
    if (this.hiddenObjects$.value.length) {
      this.hiddenObjects$.value.forEach((obj: any) => {
        obj.visible = true;
      });
      this.setHiddenObjects([]);
      this.viewer.outlinePass.selectedObjects = [];
      if (this.isRecording$.value) this.recordAction(ActionType.RestoreView, '');
    }
    if (this.viewer.state === VIEWER_STATE.Isolated) this.resetObjectIsolation();
  }

  fitToView(objectId: string, onCompleteCallback: () => void) {
    const obj = this.viewer.model.getObjectByProperty('objectId', objectId)!;
    this.resetObjectIsolation();
    this.isolateObject(obj);

    const boundingBox = new THREE.Box3().setFromObject(obj);
    const vector = new THREE.Vector3();
    const size = boundingBox.getSize(vector);
    const offset = 1.5;

    const fov = this.viewer.camera.fov * (Math.PI / 180);
    const fovh = 2 * Math.atan(Math.tan(fov / 2) * this.viewer.camera.aspect);
    let dx = size.z / 2 + Math.abs(size.x / 2 / Math.tan(fovh / 2));
    let dy = size.z / 2 + Math.abs(size.y / 2 / Math.tan(fov / 2));
    let cameraZ = Math.max(dx, dy);
    cameraZ *= offset;

    if (this.viewer.controls !== undefined) {
      const center = boundingBox.getCenter(vector);
      this.viewer.controls.target = new THREE.Vector3(center.x, center.y, center.z);
      const oldCameraPos = this.viewer.camera.position.clone();
      const tween = new TWEEN.Tween(oldCameraPos)
        .to(new THREE.Vector3(cameraZ, center.y, cameraZ), CAMERA_ANIM_DUR)
        .easing(TWEEN.Easing.Linear.None)
        .onUpdate(() => {
          this.viewer.camera.position.set(oldCameraPos.x, oldCameraPos.y, oldCameraPos.z);
          this.viewer.camera.lookAt(new THREE.Vector3(0, 0, 0));
        })
        .onComplete(onCompleteCallback)
        .start();
      this.viewer.camera.updateProjectionMatrix();
      this.viewer.controls.update();
    }
  }

  replacedNameNode(name: string) {
    let nameNode = '';
    if (name.includes(' ') && name.includes('.')) {
      nameNode = name.replace(' ', '_');
      nameNode = nameNode.replace('.', '');
    } else if (name.includes(' ')) {
      nameNode = name.replace(' ', '_');
    } else if (name.includes('.')) {
      nameNode = name.replace('.', '');
    } else {
      nameNode = name;
    }
    return nameNode;
  }

  playAnimation() {
    this.animations.forEach((clip: any) => {
      const action = this.viewer.mixer!.clipAction(clip);
      if (action.paused) action.paused = false;
      else {
        action.timeScale = 3;
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
        action.play();
      }
    });
  }

  pauseAnimation() {
    this.animations.forEach((clip: any) => {
      const action = this.viewer.mixer!.clipAction(clip);
      if (action.isRunning()) action.paused = true;
    });
  }

  stopAnimation() {
    this.viewer.mixer?.stopAllAction();
  }

  setAnnotationMarkers(annotationMarkers: any[]) {
    this.annotationMarkers = [...this.annotationMarkers, ...annotationMarkers];
  }

  toggleAnnotationsVisibility(lastModifiedAnnotationId: number, visibleAnnotation: boolean) {
    const annotationMarker = this.annotationMarkers.find(
      (marker) => marker.userData.id === lastModifiedAnnotationId,
    );
    const annotationLabel = this.viewer.scene.getObjectByName(
      'annotationLabel_' + lastModifiedAnnotationId,
    );
    if (this.annotations$.value.some((annotation) => annotation.id === lastModifiedAnnotationId)) {
      if (annotationMarker?.visible && !visibleAnnotation) {
        annotationMarker!.visible = false;
        annotationLabel!.visible = false;
      }
      if (!annotationMarker?.visible && visibleAnnotation) {
        annotationMarker!.visible = true;
        annotationLabel!.visible = true;
      }
    }
  }

  deleteAnnotation(deletedAnnotation: AnnotationI) {
    const annotationMarker = this.annotationMarkers.find(
      (marker) => marker.userData.id === deletedAnnotation.id,
    )!;
    const annotationLabel = this.viewer.scene.getObjectByName(
      'annotationLabel_' + deletedAnnotation.id,
    )!;
    annotationMarker.remove(annotationLabel);
    deletedAnnotation.attachedObject.remove(annotationMarker);
    this.annotationMarkers = this.annotationMarkers.filter(
      (marker) => marker.userData.id !== deletedAnnotation.id,
    );
  }

  createSectionPlane(data: { indexPlane: number; constantSection: number; inverted: boolean }) {
    this.sectionService.createSection(
      this.viewer.model,
      this.viewer.scene,
      data.indexPlane,
      data.constantSection,
      data.inverted,
    );
    if (this.isRecording$.value)
      this.recordAction(ActionType.Section, {
        indexPlane: data.indexPlane,
        constantSection: data.constantSection,
        inverted: data.inverted,
      });
  }

  removePlane() {
    this.viewer.model.traverse((n: any) => {
      if (n.type === 'Mesh' && n.material !== undefined) {
        n.material.clippingPlanes = [];
      } else if (n.type === 'LineSegments') {
        n.material.clippingPlanes = [];
      }
    });
    this.sectionService.clearPreviousSection(this.viewer.scene);
  }

  moveYZ(value: number) {
    this.sectionService.movePlane(SectionPlanes.YZ, value);
  }

  moveXZ(value: number) {
    this.sectionService.movePlane(SectionPlanes.XZ, value);
  }

  moveXY(value: number) {
    this.sectionService.movePlane(SectionPlanes.XY, value);
  }

  invertCurrentPlane(checked: boolean) {
    this.sectionService.invertPlane(checked);
  }

  clearScene() {
    this.viewer.scene.traverse((object: any) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (object.material.isMaterial) this.cleanMaterial(object.material);
        else for (const material of object.material) this.cleanMaterial(material);
      }
    });
    this.viewer.scene.children.forEach((child) => {
      this.viewer.scene.remove(child);
    });
    this.viewer.model.traverse((object: any) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (object.material.isMaterial) this.cleanMaterial(object.material);
        else for (const material of object.material) this.cleanMaterial(material);
      }
    });
    this.viewer.model.children = [];

    this.viewer.renderer.dispose();
  }

  cleanMaterial(material: any) {
    material.dispose();

    for (const key of Object.keys(material)) {
      const value = material[key];
      if (value && typeof value === 'object' && 'minFilter' in value) {
        value.dispose();
      }
    }
  }
}
