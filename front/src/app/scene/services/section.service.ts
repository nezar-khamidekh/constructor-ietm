import { Injectable } from '@angular/core';
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SECTION_DEFAULT_CONSTANT } from 'src/app/shared/models/viewerConstants';

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
    let longestSide = Math.max(this.size.y, this.size.x, this.size.z);

    this.planes = [
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), this.boundBox.min.x),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), this.boundBox.min.y),
      new THREE.Plane(new THREE.Vector3(0, 0, -1), this.boundBox.min.z),
    ];

    let bufGeoms: any = [];
    model.traverse((n: any) => {
      if (n.type === 'Mesh' && n.material !== undefined) {
        let bufGeom = n.geometry.clone();
        n.updateWorldMatrix(true, true);
        n.renderOrder = 6;
        n.material.clippingPlanes = this.planes;
        bufGeom.applyMatrix4(n.matrixWorld);
        bufGeoms.push(bufGeom);
      } else if (n.type === 'LineSegments') {
        n.material.clippingPlanes = this.planes;
      }
    });
    let solidGeom = BufferGeometryUtils.mergeBufferGeometries(bufGeoms);

    let stencilGroups = new THREE.Group();

    stencilGroups.name = '__StencilGroups';
    scene.add(stencilGroups);

    let planeGeom = new THREE.PlaneBufferGeometry(longestSide * 2, longestSide * 2);
    planeGeom.translate(0, 0, 0);

    for (let i = 0; i < 3; i++) {
      let poGroup = new THREE.Group();
      let plane = this.planes[i];
      let stencilGroup = this.createPlaneStencilGroup(solidGeom, plane, i + 1);
      stencilGroup.name = '__StencilGroup' + i;

      // plane is clipped by the other clipping planes
      let planeMat = new THREE.MeshStandardMaterial({
        color: 0xe91e63,
        metalness: 0.1,
        roughness: 0.75,
        clippingPlanes: this.planes.filter((p) => p !== plane),
        stencilWrite: true,
        stencilRef: 0,
        stencilFunc: THREE.NotEqualStencilFunc,
        stencilFail: THREE.ReplaceStencilOp,
        stencilZFail: THREE.ReplaceStencilOp,
        stencilZPass: THREE.ReplaceStencilOp,
      });
      let po = new THREE.Mesh(planeGeom, planeMat);
      po.onAfterRender = (renderer) => {
        renderer.clearStencil();
      };
      po.renderOrder = i + 1.1;
      stencilGroups.add(stencilGroup);
      poGroup.add(po);
      poGroup.name = '__Caps' + i;
      this.planeObjects.push(po);
      this.crossSectionObject.add(poGroup);
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

  buildHelpers() {
    this.clearHelpers();
    let planeMat = new THREE.MeshBasicMaterial({
      color: '#007ef2',
      transparent: true,
      opacity: 0.05,
      side: THREE.DoubleSide,
    });
    // let planeLineMat = new THREE.LineBasicMaterial({ color: 'black' });

    let planeXYGeom = new THREE.PlaneBufferGeometry(this.size.x, this.size.y);
    planeXYGeom.translate(this.size.x / 2, this.size.y / 2, 0);
    let planeXYMesh = new THREE.Mesh(planeXYGeom, planeMat);
    this.planeXYHelper.add(planeXYMesh);

    // const verticesXY = [
    //   new THREE.Vector3(0, 0, 0),
    //   new THREE.Vector3(this.size.x, 0, 0),
    //   new THREE.Vector3(this.size.x, this.size.y, 0),
    //   new THREE.Vector3(0, this.size.y, 0),
    //   new THREE.Vector3(0, 0, 0),
    // ];
    // let planeXYLineGeom = new THREE.BufferGeometry().setFromPoints(verticesXY);
    // let planeXYLine = new THREE.Line(planeXYLineGeom, planeLineMat);
    // this.planeXYHelper.add(planeXYLine);

    // const verticesYZ = [
    //   new THREE.Vector3(0, 0, 0),
    //   new THREE.Vector3(0, 0, this.size.z),
    //   new THREE.Vector3(0, this.size.y, this.size.z),
    //   new THREE.Vector3(0, this.size.y, 0),
    //   new THREE.Vector3(0, 0, 0),
    // ];
    // let planeYZLineGeom = new THREE.BufferGeometry().setFromPoints(verticesYZ);
    // let planeYZLine = new THREE.Line(planeYZLineGeom, planeLineMat);
    // this.planeYZHelper.add(planeYZLine);

    // const verticesXZ = [
    //   new THREE.Vector3(0, 0, 0),
    //   new THREE.Vector3(0, 0, this.size.z),
    //   new THREE.Vector3(this.size.x, 0, this.size.z),
    //   new THREE.Vector3(this.size.x, 0, 0),
    //   new THREE.Vector3(0, 0, 0),
    // ];
    // let planeXZLineGeom = new THREE.PlaneBufferGeometry().setFromPoints(verticesXZ);
    // let planeXZLine = new THREE.Line(planeXZLineGeom, planeLineMat);
    // this.planeXZHelper.add(planeXZLine);

    let planeYZGeom = new THREE.PlaneBufferGeometry(this.size.z, this.size.y);
    planeYZGeom.translate(this.size.z / 2, this.size.y / 2, 0);
    planeYZGeom.rotateY(-Math.PI / 2);
    let planeYZMesh = new THREE.Mesh(planeYZGeom, planeMat);
    this.planeYZHelper.add(planeYZMesh);

    let planeXZGeom = new THREE.PlaneBufferGeometry(this.size.x, this.size.z);
    planeXZGeom.translate(this.size.x / 2, this.size.z / 2, 0);
    planeXZGeom.rotateX(Math.PI / 2);
    let planeXZMesh = new THREE.Mesh(planeXZGeom, planeMat);

    this.planeXZHelper.add(planeXZMesh);

    this.moveXY(SECTION_DEFAULT_CONSTANT);
    this.moveXZ(SECTION_DEFAULT_CONSTANT);
    this.moveYZ(SECTION_DEFAULT_CONSTANT);
  }

  clearHelpers() {
    if (this.planeXYHelper.children.length)
      this.planeXYHelper.remove(this.planeXYHelper.children[0]);
    if (this.planeYZHelper.children.length)
      this.planeYZHelper.remove(this.planeYZHelper.children[0]);
    if (this.planeXZHelper.children.length)
      this.planeXZHelper.remove(this.planeXZHelper.children[0]);
  }

  createPlaneStencilGroup(geometry: any, plane: any, renderOrder: any) {
    let group = new THREE.Group();
    let baseMat = new THREE.MeshBasicMaterial();
    baseMat.depthWrite = false;
    baseMat.depthTest = false;
    baseMat.colorWrite = false;
    baseMat.stencilWrite = true;
    baseMat.stencilFunc = THREE.AlwaysStencilFunc;

    // back faces
    let mat0 = baseMat.clone();
    mat0.side = THREE.BackSide;
    mat0.clippingPlanes = [plane];
    mat0.stencilFail = THREE.IncrementStencilOp;
    mat0.stencilZFail = THREE.IncrementStencilOp;
    mat0.stencilZPass = THREE.IncrementStencilOp;

    let mesh0 = new THREE.Mesh(geometry, mat0);
    mesh0.renderOrder = renderOrder;

    group.add(mesh0);

    // front faces
    let mat1 = baseMat.clone();
    mat1.side = THREE.FrontSide;
    mat1.clippingPlanes = [plane];
    mat1.stencilFail = THREE.DecrementStencilOp;
    mat1.stencilZFail = THREE.DecrementStencilOp;
    mat1.stencilZPass = THREE.DecrementStencilOp;

    let mesh1 = new THREE.Mesh(geometry, mat1);
    mesh1.renderOrder = renderOrder;

    group.add(mesh1);

    return group;
  }

  updatePlanes() {
    for (let i = 0; i < this.planeObjects.length; i++) {
      let plane = this.planes[i];
      let po = this.planeObjects[i];
      plane.coplanarPoint(po.position);
      po.lookAt(
        po.position.x - plane.normal.x,
        po.position.y - plane.normal.y,
        po.position.z - plane.normal.z,
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
