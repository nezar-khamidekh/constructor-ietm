import * as THREE from 'three';

export const CAMERA_FOV = 75;
export const CAMERA_NEAR = 0.1;
export const CAMERA_FAR = 10000;
export const CAMERA_POSITION_RATE = 0.9;
export const RENDERER_PIXEL_RATIO = 2;
export const GRID_HELPER_SIZE_RATE = 3;
export const GRID_HELPER_DIVISIONS = 20;
export const CAMERA_ANIM_DUR = 300;
export const RENDERER_CLEAR_COLOR = new THREE.Color(0xffffff);
export const OUTLINE_PASS_EDGE_STRENGTH = 2;
export const OUTLINE_PASS_EDGE_THICKNESS = 1;
export const OUTLINE_PASS_VISIBLE_EDGE_COLOR = '#0159d3';
export const OUTLINE_PASS_HIDDEN_EDGE_COLOR = '#0159d3';
export const HIGHLIGHT_COLOR = 0xffff00;
export const CAMERA_ROTATE_SPEED = 2;
export const EXPLODE_POWER = 0;
export const SECTION_DEFAULT_CONSTANT = 0.5;
export const CLICKED_OBJ_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0x7092d4,
  roughness: 1.0,
  metalness: 0.0,
  side: THREE.DoubleSide,
  opacity: 0.75,
  transparent: true,
});

export const TRANSPARENT_OBJ_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0x757575,
  roughness: 1.0,
  metalness: 0.0,
  side: THREE.DoubleSide,
  opacity: 0.3,
  transparent: true,
});
export const PLANE_INTERSECTION_COLOR = '#fcfcfc';
export const PLANE_HELPER_MATERIAL = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  side: THREE.DoubleSide,
});
