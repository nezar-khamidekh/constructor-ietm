import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function loadGLTF(path) {
  let model;
  const loader = new GLTFLoader();
  loader.load(path, (gltf) => {
    model = { ...gltf };
  });
  return model;
}

export function parseGLTF(data, path) {
  let model;
  const loader = new GLTFLoader();
  loader.parse(data, path, (gltf) => {
    model = { ...gltf };
  });
  return model;
}
