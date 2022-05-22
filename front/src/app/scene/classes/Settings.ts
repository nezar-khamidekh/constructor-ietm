import { RENDERER_CLEAR_COLOR } from 'src/app/shared/models/viewerConstants';

export class Settings {
  grid = true;
  background = '#' + RENDERER_CLEAR_COLOR.getHexString();
  resetBackground: () => void;
  cameraPosition: {
    x: number;
    y: number;
    z: number;
  };
  acceptPosition: () => void;
  resetPosition: () => void;

  constructor(acceptPosition: () => void, resetPosition: () => void) {
    this.cameraPosition = { x: 0, y: 0, z: 0 };
    this.resetBackground = () => {
      this.background = '#' + RENDERER_CLEAR_COLOR.getHexString();
    };

    this.acceptPosition = acceptPosition;
    this.resetPosition = resetPosition;
  }
}
