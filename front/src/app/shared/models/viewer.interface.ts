import MainScene from '../classes/MainScene';

export interface ViewerI {
  scene: MainScene;
  renderer: THREE.WebGLRenderer;
  composer: any;
  outlinePass: any;
  labelRenderer: any;
  camera: THREE.PerspectiveCamera;
  controls: any;
  modelBoundingBox: any;
  raycaster: THREE.Raycaster;
  mixer?: THREE.AnimationMixer;
  clock: THREE.Clock;
  actions: any;
  time: number;
  isPlaying: boolean;
  model: THREE.Object3D;
  plant: THREE.Vector3;
  state: VIEWER_STATE;
}

export enum VIEWER_STATE {
  Default,
  Isolated,
}
