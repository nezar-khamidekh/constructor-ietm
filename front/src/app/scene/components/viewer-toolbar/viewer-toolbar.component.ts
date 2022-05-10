import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  CAMERA_ROTATE_SPEED,
  SECTION_DEFAULT_CONSTANT,
  EXPLODE_POWER,
} from 'src/app/shared/models/viewerConstants';
import { VIEWER_BUTTONS } from '../../scene.component';
import { SectionPlanes } from '../../services/section.service';

@Component({
  selector: 'app-viewer-toolbar',
  templateUrl: './viewer-toolbar.component.html',
  styleUrls: ['./viewer-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerToolbarComponent implements OnInit {
  @Input() activeBtnIndex!: number;
  @Input() rotateAnimationSliderValue = CAMERA_ROTATE_SPEED;
  @Input() explodeSliderValue = EXPLODE_POWER;
  @Input() sections: any;
  @Input() currentPlane: number | null = null;
  @Input() viewMode: boolean;
  @Output() viewerBtnClicked = new EventEmitter<number>();
  @Output() rotateCameraSpeedChanged = new EventEmitter<number>();
  @Output() explodePowerChanged = new EventEmitter<number>();
  @Output() moveSectionYZ = new EventEmitter();
  @Output() moveSectionXZ = new EventEmitter();
  @Output() moveSectionXY = new EventEmitter();
  @Output() createPlane = new EventEmitter();
  @Output() changeConstantSection = new EventEmitter();
  @Output() changeInvertSection = new EventEmitter();

  rotateAnimationSliderMinValue = CAMERA_ROTATE_SPEED;
  rotateAnimationSliderMaxValue = 20;
  rotateAnimationSliderStep = 1;
  explodeSliderMinValue = EXPLODE_POWER;
  explodeSliderMaxValue = 1.5;
  explodeSliderStep = 0.1;

  constructor(public router: Router) {}

  ngOnInit(): void {}

  rotateAnimationBtnIsActive() {
    return this.activeBtnIndex === VIEWER_BUTTONS.RotateAnimation;
  }

  explodeBtnIsActive() {
    return this.activeBtnIndex === VIEWER_BUTTONS.Explode;
  }

  resetCamera() {
    this.viewerBtnClicked.emit(VIEWER_BUTTONS.Home);
  }

  rotateCamera() {
    this.viewerBtnClicked.emit(VIEWER_BUTTONS.RotateAnimation);
  }

  explode() {
    this.viewerBtnClicked.emit(VIEWER_BUTTONS.Explode);
  }

  stopAnimation() {
    this.viewerBtnClicked.emit(VIEWER_BUTTONS.StopAnimation);
  }

  playAnimation() {
    this.viewerBtnClicked.emit(VIEWER_BUTTONS.PlayAnimation);
  }

  pauseAnimation() {
    this.viewerBtnClicked.emit(VIEWER_BUTTONS.PauseAnimation);
  }

  isPlayingAnimation() {
    return this.activeBtnIndex === VIEWER_BUTTONS.PlayAnimation;
  }

  cutModel() {
    this.viewerBtnClicked.emit(VIEWER_BUTTONS.Cut);
  }

  hideAnnotation() {
    this.viewerBtnClicked.emit(VIEWER_BUTTONS.HideAnnotations);
  }

  cutModelBtnIsActive() {
    return this.activeBtnIndex === VIEWER_BUTTONS.Cut;
  }

  changePlane(index: any) {
    switch (index) {
      case SectionPlanes.YZ:
        this.createPlane.emit({
          indexPlane: index,
          constantSection: this.sections[0].value,
          inverted: this.sections[0].inverted,
        });
        break;
      case SectionPlanes.XZ:
        this.createPlane.emit({
          indexPlane: index,
          constantSection: this.sections[1].value,
          inverted: this.sections[1].inverted,
        });
        break;
      case SectionPlanes.XY:
        this.createPlane.emit({
          indexPlane: index,
          constantSection: this.sections[2].value,
          inverted: this.sections[2].inverted,
        });
        break;
      default:
        break;
    }
  }
}
