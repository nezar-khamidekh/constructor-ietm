import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SceneService } from '../../services/scene.service';

export enum ModeVisibleGridHelper {
  SwitchedOn,
  SwitchedOff,
}

export enum DefualtPositionCamera {
  FrontRight,
  RightBack,
  BackLeft,
  LeftFront,
}

@Component({
  selector: 'app-viewer-settings',
  templateUrl: './viewer-settings.component.html',
  styleUrls: ['./viewer-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerSettingsComponent implements OnInit {
  modeVisibleGridHelper = 0;
  modeDefualtPositionCamera = 0;

  constructor(private sceneService: SceneService) {}

  ngOnInit(): void {
    const modeVisible = localStorage.getItem('visibleGridHelper') || '';
    const modeDefualtPos = localStorage.getItem('defualtPositionCamera') || '';
    if (modeVisible) {
      if (Number(modeVisible) === this.getModeVisibleGridHelper().SwitchedOn) {
        this.modeVisibleGridHelper = Number(modeVisible);
      } else {
        this.modeVisibleGridHelper = Number(modeVisible);
      }
    }

    if (modeDefualtPos) {
      switch (Number(modeDefualtPos)) {
        case this.getModeDefualtPositionCamera().FrontRight:
          this.modeDefualtPositionCamera = 0;
          break;
        case this.getModeDefualtPositionCamera().RightBack:
          this.modeDefualtPositionCamera = 1;
          break;
        case this.getModeDefualtPositionCamera().BackLeft:
          this.modeDefualtPositionCamera = 2;
          break;
        case this.getModeDefualtPositionCamera().LeftFront:
          this.modeDefualtPositionCamera = 3;
          break;
        default:
          break;
      }
    }
  }

  getModeVisibleGridHelper() {
    return ModeVisibleGridHelper;
  }

  getModeDefualtPositionCamera() {
    return DefualtPositionCamera;
  }

  changeVisibleGridHelper(e: any) {
    localStorage.setItem('visibleGridHelper', e.value);
    this.sceneService.setVisibleGridHelper();
  }

  changeDefualtPositionCamera(e: any) {
    localStorage.setItem('defualtPositionCamera', e.value);
    this.sceneService.setCameraPosition();
  }
}
