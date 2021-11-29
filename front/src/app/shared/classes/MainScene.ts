import * as THREE from 'three';
import { AmbientLight, DirectionalLight } from 'three';

class MainScene extends THREE.Scene {
  private _ambientLight: AmbientLight;
  private _keyLight: DirectionalLight;
  private _fillLight: DirectionalLight;
  private _backLight: DirectionalLight;

  constructor() {
    super();

    this._ambientLight = new THREE.AmbientLight(0xebebeb, 0.7);

    this._keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 0.3);
    this._keyLight.position.set(-100, 0, 100);

    this._fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.3);
    this._fillLight.position.set(100, 0, 100);

    this._backLight = new THREE.DirectionalLight(0xebebeb, 0.5);
    this._backLight.position.set(100, 0, -100).normalize();

    this.background = new THREE.Color('#fbfbfb');

    this.add(this._ambientLight);
    this.add(this._keyLight);
    this.add(this._fillLight);
    this.add(this._backLight);
  }

  add(obj: any) {
    if (!(obj instanceof THREE.Object3D))
      throw new Error('Added object must be instance of THREE.Object3D');
    obj.traverse((node: any) => {
      if (node.type === 'LineSegments') {
        if (node.material !== undefined) {
          let mat = node.material.clone();
          node.material = mat.clone();
        }
      }
      if (node.type === 'Mesh') {
        if (node.name !== 'cubeMesh') {
          if (typeof node.material !== 'undefined') {
            node.material.polygonOffset = true;
            node.material.polygonOffsetFactor = 0.5;
            node.material.polygonOffsetUnits = 1;
            node.material.color.convertSRGBToLinear();

            let mat = node.material.clone();
            node.material = mat.clone();
          }
        }
      }
    });
    return super.add(obj);
  }
}

export default MainScene;
