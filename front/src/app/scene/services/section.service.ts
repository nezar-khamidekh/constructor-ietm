import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  PLANE_HELPER_MATERIAL,
  PLANE_INTERSECTION_COLOR,
  SECTION_DEFAULT_CONSTANT,
} from 'src/app/shared/models/viewerConstants';

@Injectable({
  providedIn: 'root',
})
export class SectionService {
  private crossSectionObject: THREE.Object3D = new THREE.Object3D();
  private boundBox: THREE.Box3 = new THREE.Box3();
  private planes: THREE.Plane[] = [];
  private planeObjects: any[] = [];
  private size: THREE.Vector3 = new THREE.Vector3();
  private planeXYHelper: THREE.Group = new THREE.Group();
  private planeYZHelper: THREE.Group = new THREE.Group();
  private planeXZHelper: THREE.Group = new THREE.Group();

  constructor() {}

  createSection(model: any, scene: any): THREE.Object3D {
    this.crossSectionObject.name = '__CrossSection';
    this.boundBox.setFromObject(model);
    this.boundBox.getSize(this.size);
    const longestSide = Math.max(this.size.y, this.size.x, this.size.z);

    this.planes = [
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), this.boundBox.min.x),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), this.boundBox.min.y),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), this.boundBox.min.z),
    ];

    const bufferGeometries: any = [];
    model.traverse((node: any) => {
      if (node.type === 'Mesh' && node.material !== undefined) {
        const bufferGeometry = node.geometry.clone();
        node.updateWorldMatrix(true, true);
        node.renderOrder = 6;
        node.material.clippingPlanes = this.planes;
        node.material.clipIntersection = true;
        bufferGeometry.applyMatrix4(node.matrixWorld);
        bufferGeometries.push(bufferGeometry);
      }
    });

    const solidGeometry = BufferGeometryUtils.mergeBufferGeometries(bufferGeometries);
    const stencilGroups = new THREE.Group();
    stencilGroups.name = '__StencilGroups';
    scene.add(stencilGroups);

    const planeGeometry = new THREE.PlaneBufferGeometry(longestSide * 2, longestSide * 2);
    for (let i = 0; i < 3; i++) {
      this.createClippingPlane(solidGeometry, i, planeGeometry, stencilGroups);
    }

    this.updatePlanes();
    this.buildHelpers();
    const helpers = new THREE.Group();
    helpers.add(this.planeXYHelper, this.planeXZHelper, this.planeYZHelper);
    helpers.position.copy(this.boundBox.min);
    this.crossSectionObject.add(helpers);
    this.crossSectionObject.visible = true;

    return this.crossSectionObject;
  }

  createClippingPlane(
    solidGeometry: THREE.BufferGeometry,
    index: number,
    planeGeometry: THREE.PlaneBufferGeometry,
    stencilGroups: THREE.Group,
  ) {
    const planeGroup = new THREE.Group();
    const plane = this.planes[index];
    const stencilGroup = this.createPlaneStencilGroup(solidGeometry, plane, index + 1);
    stencilGroup.name = '__StencilGroup' + index;

    const planeMaterial = new THREE.MeshStandardMaterial({
      color: PLANE_INTERSECTION_COLOR,
      clippingPlanes: this.planes.filter((p) => p !== plane),
      stencilWrite: true,
      stencilRef: 0,
      stencilFunc: THREE.NotEqualStencilFunc,
      stencilFail: THREE.ReplaceStencilOp,
      stencilZFail: THREE.ReplaceStencilOp,
      stencilZPass: THREE.ReplaceStencilOp,
    });

    const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    planeMesh.onAfterRender = (renderer) => {
      renderer.clearStencil();
    };
    planeMesh.renderOrder = index + 1.1;
    stencilGroups.add(stencilGroup);
    planeGroup.add(planeMesh);
    planeGroup.name = '__Caps' + index;
    this.planeObjects.push(planeGroup);
    this.crossSectionObject.add(planeGroup);
  }

  buildHelpers() {
    const planeYZGeometry = new THREE.PlaneBufferGeometry(this.size.z, this.size.y);
    planeYZGeometry.translate(this.size.z / 2, this.size.y / 2, 0);
    planeYZGeometry.rotateY(-Math.PI / 2);
    const planeYZMesh = new THREE.Mesh(planeYZGeometry, PLANE_HELPER_MATERIAL);
    this.planeYZHelper.add(planeYZMesh);

    const planeXZGeometry = new THREE.PlaneBufferGeometry(this.size.x, this.size.z);
    planeXZGeometry.translate(this.size.x / 2, this.size.z / 2, 0);
    planeXZGeometry.rotateX(Math.PI / 2);
    const planeXZMesh = new THREE.Mesh(planeXZGeometry, PLANE_HELPER_MATERIAL);
    this.planeXZHelper.add(planeXZMesh);

    const planeXYGeometry = new THREE.PlaneBufferGeometry(this.size.x, this.size.y);
    planeXYGeometry.translate(this.size.x / 2, this.size.y / 2, 0);
    const planeXYMesh = new THREE.Mesh(planeXYGeometry, PLANE_HELPER_MATERIAL);
    this.planeXYHelper.add(planeXYMesh);

    this.moveHelpersToDefault();
    this.drawHelpersBorder();
  }

  drawHelpersBorder() {
    const helperLineMat = new THREE.LineBasicMaterial({ color: 'black' });

    this.drawHelperBorder(
      helperLineMat,
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, this.size.z),
        new THREE.Vector3(0, this.size.y, this.size.z),
        new THREE.Vector3(0, this.size.y, 0),
        new THREE.Vector3(0, 0, 0),
      ],
      this.planeYZHelper,
    );

    this.drawHelperBorder(
      helperLineMat,
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, this.size.z),
        new THREE.Vector3(this.size.x, 0, this.size.z),
        new THREE.Vector3(this.size.x, 0, 0),
        new THREE.Vector3(0, 0, 0),
      ],
      this.planeXZHelper,
    );

    this.drawHelperBorder(
      helperLineMat,
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(this.size.x, 0, 0),
        new THREE.Vector3(this.size.x, this.size.y, 0),
        new THREE.Vector3(0, this.size.y, 0),
        new THREE.Vector3(0, 0, 0),
      ],
      this.planeXYHelper,
    );
  }

  drawHelperBorder(
    borderMaterial: THREE.LineBasicMaterial,
    vertices: THREE.Vector3[],
    helper: THREE.Group,
  ) {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const line = new THREE.Line(lineGeometry, borderMaterial);
    helper.add(line);
  }

  moveHelpersToDefault() {
    this.moveYZ(SECTION_DEFAULT_CONSTANT);
    this.moveXZ(SECTION_DEFAULT_CONSTANT);
    this.moveXY(SECTION_DEFAULT_CONSTANT);
  }

  createPlaneStencilGroup(geometry: any, plane: any, renderOrder: any) {
    const stencilGroup = new THREE.Group();
    const baseMaterial = new THREE.MeshBasicMaterial({
      depthWrite: false,
      depthTest: false,
      colorWrite: false,
      stencilWrite: true,
      stencilFunc: THREE.AlwaysStencilFunc,
    });

    const backMaterial = baseMaterial.clone();
    backMaterial.side = THREE.BackSide;
    backMaterial.clippingPlanes = [plane];
    backMaterial.stencilFail = THREE.IncrementStencilOp;
    backMaterial.stencilZFail = THREE.IncrementStencilOp;
    backMaterial.stencilZPass = THREE.IncrementStencilOp;

    const backMesh = new THREE.Mesh(geometry, backMaterial);
    backMesh.renderOrder = renderOrder;
    stencilGroup.add(backMesh);

    const frontMaterial = baseMaterial.clone();
    frontMaterial.side = THREE.FrontSide;
    frontMaterial.clippingPlanes = [plane];
    frontMaterial.stencilFail = THREE.DecrementStencilOp;
    frontMaterial.stencilZFail = THREE.DecrementStencilOp;
    frontMaterial.stencilZPass = THREE.DecrementStencilOp;

    const frontMesh = new THREE.Mesh(geometry, frontMaterial);
    frontMesh.renderOrder = renderOrder;
    stencilGroup.add(frontMesh);

    return stencilGroup;
  }

  updatePlanes() {
    for (let i = 0; i < this.planeObjects.length; i++) {
      const plane = this.planes[i];
      const planeObject = this.planeObjects[i];
      plane.coplanarPoint(planeObject.position);
      planeObject.lookAt(
        planeObject.position.x - plane.normal.x,
        planeObject.position.y - plane.normal.y,
        planeObject.position.z - plane.normal.z,
      );
    }
  }

  moveYZ(scale: number) {
    if (scale > 1) scale = 1;
    if (scale < 0) scale = 0;
    this.planes[0].constant = scale * this.size.x + this.boundBox.min.x;
    this.moveHelperYZ(scale);
    this.updatePlanes();
  }

  moveXZ(scale: number) {
    if (scale > 1) scale = 1;
    if (scale < 0) scale = 0;
    this.planes[1].constant = scale * this.size.y + this.boundBox.min.y;
    this.moveHelperXZ(scale);
    this.updatePlanes();
  }

  moveXY(scale: number) {
    if (scale > 1) scale = 1;
    if (scale < 0) scale = 0;
    this.planes[2].constant = scale * this.size.z + this.boundBox.min.z;
    this.moveHelperXY(scale);
    this.updatePlanes();
  }

  moveHelperYZ(scale: number) {
    this.planeYZHelper.position.x = this.size.x * scale;
  }

  moveHelperXZ(scale: number) {
    this.planeXZHelper.position.y = this.size.y * scale;
  }

  moveHelperXY(scale: number) {
    this.planeXYHelper.position.z = this.size.z * scale;
  }
}
