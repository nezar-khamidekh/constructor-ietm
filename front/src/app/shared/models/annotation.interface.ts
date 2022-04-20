export interface AnnotationI {
  id: number;
  title: string;
  description: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  descriptionDomElement?: HTMLElement;
  labelDomElement?: HTMLElement;
  rendered?: boolean;
  attachedObject: THREE.Object3D;
}
