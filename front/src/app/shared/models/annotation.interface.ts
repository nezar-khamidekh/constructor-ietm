export interface AnnotationI {
  id: number;
  description: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  descriptionDomElement?: HTMLElement;
  rendered?: boolean;
}
