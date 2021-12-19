import MainScene from '../classes/MainScene';

export interface ViewerI {
  scene: MainScene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  controls: any;
  modelBoundingBox: any;
  raycaster: any;
  mixer?: THREE.AnimationMixer;
  clock: THREE.Clock;
  actions: any;
  time: number;
  isPlaying: boolean;
  model: THREE.Object3D;
  plant: THREE.Vector3;
}
