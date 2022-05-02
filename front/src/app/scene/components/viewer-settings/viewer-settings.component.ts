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

interface ModeVisibleGridHelperI {
  value: number;
  viewValue: string;
}

interface ModeDefualtPositionCameraI {
  value: number;
  viewValue: string;
}

@Component({
  selector: 'app-viewer-settings',
  templateUrl: './viewer-settings.component.html',
  styleUrls: ['./viewer-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerSettingsComponent implements OnInit {
  modesVisibleGridHelper: ModeVisibleGridHelperI[] = [
    { value: 0, viewValue: 'Включен' },
    { value: 1, viewValue: 'Выключен' },
  ];
  selectedModeVisibleGridHelper = this.modesVisibleGridHelper[0].value;
  modesDefualtPositionCamera: ModeDefualtPositionCameraI[] = [
    { value: 0, viewValue: 'Между спереди и справа' },
    { value: 1, viewValue: 'Между справа и сзади' },
    { value: 2, viewValue: 'Между сзади и слева' },
    { value: 3, viewValue: 'Между слева и спереди' },
  ];
  selectedModeDefualtPositionCamera = this.modesDefualtPositionCamera[0].value;

  constructor(private sceneService: SceneService) {}

  ngOnInit(): void {
    const modeVisible = localStorage.getItem('visibleGridHelper') || '';
    const modeDefualtPos = localStorage.getItem('defualtPositionCamera') || '';
    if (modeVisible) {
      this.selectedModeVisibleGridHelper = this.modesVisibleGridHelper[Number(modeVisible)].value;
    }

    if (modeDefualtPos) {
      this.selectedModeDefualtPositionCamera =
        this.modesDefualtPositionCamera[Number(modeDefualtPos)].value;
    }
  }

  getModeVisibleGridHelper() {
    return ModeVisibleGridHelper;
  }

  getModeDefualtPositionCamera() {
    return DefualtPositionCamera;
  }

  changeVisibleGridHelper(value: any) {
    localStorage.setItem('visibleGridHelper', value);
    this.sceneService.setVisibleGridHelper();
  }

  changeDefualtPositionCamera(value: any) {
    localStorage.setItem('defualtPositionCamera', value);
    this.sceneService.setCameraPosition();
  }
}
