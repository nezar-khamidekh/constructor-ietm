import * as THREE from 'three';
import { AmbientLight, DirectionalLight } from 'three';

const AMBIENT_LIGHT_COLOR = '#D6D6D6';
const AMBIENT_LIGHT_INTENSITY = 0.5;
const DIRECTIONAL_LIGHT_COLOR = '#A9A7A0';
const DIRECTIONAL_LIGHT_INTENSITY = 0.5;
const DIRECTIONAL_LIGHT_KOEF = 5;
const BACKGROUND_COLOR = '#FCFCFC';

class MainScene extends THREE.Scene {
  private _ambientLight: AmbientLight;
  private _leftFrontLight: DirectionalLight;
  private _rightFrontLight: DirectionalLight;
  private _leftBackLight: DirectionalLight;
  private _rightBackLight: DirectionalLight;

  constructor() {
    super();
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
            let mat = node.material.clone();
            node.material = mat.clone();
          }
        }
      }
    });
    return super.add(obj);
  }

  setLight(longestSide: number) {
    this._ambientLight = new THREE.AmbientLight(AMBIENT_LIGHT_COLOR, AMBIENT_LIGHT_INTENSITY);

    this._leftFrontLight = new THREE.DirectionalLight(
      new THREE.Color(DIRECTIONAL_LIGHT_COLOR),
      DIRECTIONAL_LIGHT_INTENSITY,
    );
    this._leftFrontLight.position.set(
      -longestSide * DIRECTIONAL_LIGHT_KOEF,
      0,
      longestSide * DIRECTIONAL_LIGHT_KOEF,
    );

    this._rightFrontLight = new THREE.DirectionalLight(
      new THREE.Color(DIRECTIONAL_LIGHT_COLOR),
      DIRECTIONAL_LIGHT_INTENSITY,
    );
    this._rightFrontLight.position.set(
      longestSide * DIRECTIONAL_LIGHT_KOEF,
      0,
      longestSide * DIRECTIONAL_LIGHT_KOEF,
    );

    this._leftBackLight = new THREE.DirectionalLight(
      new THREE.Color(DIRECTIONAL_LIGHT_COLOR),
      DIRECTIONAL_LIGHT_INTENSITY,
    );
    this._leftBackLight.position.set(
      -longestSide * DIRECTIONAL_LIGHT_KOEF,
      0,
      -longestSide * DIRECTIONAL_LIGHT_KOEF,
    );

    this._rightBackLight = new THREE.DirectionalLight(
      new THREE.Color(DIRECTIONAL_LIGHT_COLOR),
      DIRECTIONAL_LIGHT_INTENSITY,
    );
    this._rightBackLight.position.set(
      longestSide * DIRECTIONAL_LIGHT_KOEF,
      0,
      -longestSide * DIRECTIONAL_LIGHT_KOEF,
    );

    this.background = new THREE.Color(BACKGROUND_COLOR);

    this.add(this._ambientLight);
    this.add(this._leftFrontLight);
    this.add(this._rightFrontLight);
    this.add(this._leftBackLight);
    this.add(this._rightBackLight);
  }
}

export default MainScene;
