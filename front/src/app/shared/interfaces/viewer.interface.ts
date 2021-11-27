export interface ViewerI {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.Camera;
  controls: any;
  modelBoundingBox: any;
  raycaster: any;
  clock: THREE.Clock;
  actions: any;
  time: number;
  isPlaying: boolean;
  model: THREE.Object3D;
  plant: THREE.Vector3;
}
