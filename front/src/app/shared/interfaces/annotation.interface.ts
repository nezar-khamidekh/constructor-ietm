export interface AnnotationI {
  title: string;
  description: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  descriptionDomElement?: HTMLElement;
}
