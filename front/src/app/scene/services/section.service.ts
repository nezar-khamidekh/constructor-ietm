import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  PLANE_HELPER_MATERIAL,
  PLANE_INTERSECTION_COLOR,
  SECTION_DEFAULT_CONSTANT,
} from 'src/app/shared/models/viewerConstants';

export enum SectionPlanes {
  YZ,
  XZ,
  XY,
}

@Injectable({
  providedIn: 'root',
})
export class SectionService {
  private boundBox: THREE.Box3 = new THREE.Box3();
  private plane: THREE.Plane;
  private planeGroup: any;
  private planeHelper: THREE.Group = new THREE.Group();
  private size: THREE.Vector3 = new THREE.Vector3();

  constructor() {}

  createSection(
    model: any,
    scene: THREE.Scene,
    indexPlane: number,
    constantSection: number,
    inverted: boolean,
  ) {
    this.clearPreviousSection(scene);
    this.boundBox.setFromObject(model);
    this.boundBox.getSize(this.size);
    const longestSide = Math.max(this.size.y, this.size.x, this.size.z);

    switch (indexPlane) {
      case SectionPlanes.YZ:
        this.plane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), this.boundBox.min.x);
        break;
      case SectionPlanes.XZ:
        this.plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), this.boundBox.min.y);
        break;
      case SectionPlanes.XY:
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), this.boundBox.min.z);
        break;
      default:
        break;
    }

    if (inverted) {
      this.plane.negate();
      (this.plane as any)._negated = true;
    }

    const bufferGeometries: any = [];
    model.traverse((node: any) => {
      if (node.type === 'Mesh' && node.material !== undefined) {
        const bufferGeometry = node.geometry.clone();
        node.updateWorldMatrix(true, true);
        node.renderOrder = 6;
        node.material.clippingPlanes = [this.plane];
        bufferGeometry.applyMatrix4(node.matrixWorld);
        bufferGeometries.push(bufferGeometry);
      }
    });

    const solidGeometry = BufferGeometryUtils.mergeBufferGeometries(bufferGeometries);
    const stencilGroups = new THREE.Group();
    stencilGroups.name = '__StencilGroups';
    scene.add(stencilGroups);

    const planeGeometry = new THREE.PlaneBufferGeometry(longestSide * 2, longestSide * 2);
    this.createClippingPlane(solidGeometry, indexPlane, planeGeometry, stencilGroups, scene);

    this.updatePlane();
    this.buildHelper(indexPlane);
    this.movePlane(indexPlane, constantSection);
    const helpers = new THREE.Group();
    helpers.add(this.planeHelper);
    helpers.name = '__Helpers';
    helpers.position.copy(this.boundBox.min);

    scene.add(helpers);
  }

  clearPreviousSection(scene: THREE.Scene) {
    const stencilGroups = scene.getObjectByName('__StencilGroups');
    const helpers = scene.getObjectByName('__Helpers');
    const planeGroup = scene.getObjectByName('__PlaneGroup');
    if (stencilGroups) scene.remove(stencilGroups);
    if (helpers) scene.remove(helpers);
    if (planeGroup) scene.remove(planeGroup);

    for (var i = this.planeHelper.children.length - 1; i >= 0; i--) {
      this.planeHelper.remove(this.planeHelper.children[i]);
    }
  }

  createClippingPlane(
    solidGeometry: THREE.BufferGeometry,
    index: number,
    planeGeometry: THREE.PlaneBufferGeometry,
    stencilGroups: THREE.Group,
    scene: THREE.Scene,
  ) {
    const planeGroup = new THREE.Group();
    const stencilGroup = this.createPlaneStencilGroup(solidGeometry, this.plane, index + 1);
    stencilGroup.name = '__StencilGroup' + index;

    const planeMaterial = new THREE.MeshStandardMaterial({
      color: PLANE_INTERSECTION_COLOR,
      // clippingPlanes: this.planes.filter((p) => p !== plane),
      roughness: 0.8,
      metalness: 0.3,
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
    planeGroup.name = '__PlaneGroup';
    this.planeGroup = planeGroup.clone();
    scene.add(this.planeGroup);
  }

  buildHelper(indexPlane: number) {
    const helperLineMat = new THREE.LineBasicMaterial({ color: 'black' });
    switch (indexPlane) {
      case SectionPlanes.YZ:
        const planeYZGeometry = new THREE.PlaneBufferGeometry(this.size.z, this.size.y);
        planeYZGeometry.translate(this.size.z / 2, this.size.y / 2, 0);
        planeYZGeometry.rotateY(-Math.PI / 2);
        const planeYZMesh = new THREE.Mesh(planeYZGeometry, PLANE_HELPER_MATERIAL);
        this.planeHelper.position.set(0, 0, 0);
        this.planeHelper.add(planeYZMesh);
        this.drawHelperBorder(
          helperLineMat,
          [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, this.size.z),
            new THREE.Vector3(0, this.size.y, this.size.z),
            new THREE.Vector3(0, this.size.y, 0),
            new THREE.Vector3(0, 0, 0),
          ],
          this.planeHelper,
        );
        break;
      case SectionPlanes.XZ:
        const planeXZGeometry = new THREE.PlaneBufferGeometry(this.size.x, this.size.z);
        planeXZGeometry.translate(this.size.x / 2, this.size.z / 2, 0);
        planeXZGeometry.rotateX(Math.PI / 2);
        const planeXZMesh = new THREE.Mesh(planeXZGeometry, PLANE_HELPER_MATERIAL);
        this.planeHelper.position.set(0, 0, 0);
        this.planeHelper.add(planeXZMesh);
        this.drawHelperBorder(
          helperLineMat,
          [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, this.size.z),
            new THREE.Vector3(this.size.x, 0, this.size.z),
            new THREE.Vector3(this.size.x, 0, 0),
            new THREE.Vector3(0, 0, 0),
          ],
          this.planeHelper,
        );
        break;
      case SectionPlanes.XY:
        const planeXYGeometry = new THREE.PlaneBufferGeometry(this.size.x, this.size.y);
        planeXYGeometry.translate(this.size.x / 2, this.size.y / 2, 0);
        const planeXYMesh = new THREE.Mesh(planeXYGeometry, PLANE_HELPER_MATERIAL);
        this.planeHelper.position.set(0, 0, 0);
        this.planeHelper.add(planeXYMesh);
        this.drawHelperBorder(
          helperLineMat,
          [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(this.size.x, 0, 0),
            new THREE.Vector3(this.size.x, this.size.y, 0),
            new THREE.Vector3(0, this.size.y, 0),
            new THREE.Vector3(0, 0, 0),
          ],
          this.planeHelper,
        );
        break;
      default:
        break;
    }
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

  updatePlane() {
    this.plane.coplanarPoint(this.planeGroup.position);
    this.planeGroup.lookAt(
      this.planeGroup.position.x - this.plane.normal.x,
      this.planeGroup.position.y - this.plane.normal.y,
      this.planeGroup.position.z - this.plane.normal.z,
    );
  }

  movePlane(index: number, scale: number) {
    switch (index) {
      case SectionPlanes.YZ:
        if (scale > 1) scale = 1;
        if (scale < 0) scale = 0;
        if (!(this.plane as any)._negated) {
          this.plane.constant = scale * this.size.x + this.boundBox.min.x;
        } else {
          this.plane.constant = (1 - scale) * this.size.x - this.boundBox.max.x;
        }
        this.planeHelper.position.x = this.size.x * scale;
        break;
      case SectionPlanes.XZ:
        if (scale > 1) scale = 1;
        if (scale < 0) scale = 0;
        if (!(this.plane as any)._negated) {
          this.plane.constant = scale * this.size.y + this.boundBox.min.y;
        } else {
          this.plane.constant = (1 - scale) * this.size.y - this.boundBox.max.y;
        }
        this.planeHelper.position.y = this.size.y * scale;
        break;
      case SectionPlanes.XY:
        if (scale > 1) scale = 1;
        if (scale < 0) scale = 0;
        if (!(this.plane as any)._negated) {
          this.plane.constant = scale * this.size.z + this.boundBox.min.z;
        } else {
          this.plane.constant = (1 - scale) * this.size.z - this.boundBox.max.z;
        }
        this.planeHelper.position.z = this.size.z * scale;
        break;

      default:
        break;
    }
    this.updatePlane();
  }

  invertPlane(checked: boolean) {
    this.plane.negate();
    (this.plane as any)._negated = checked;
    this.updatePlane();
  }
}
