import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-viewer-toolbar',
  templateUrl: './viewer-toolbar.component.html',
  styleUrls: ['./viewer-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerToolbarComponent implements OnInit {
  @Input() rotateAnimationBtnIsActive = false;
  @Input() explodeBtnIsActive = false;
  @Output() resetCamera = new EventEmitter();
  @Output() rotateCamera = new EventEmitter();
  @Output() rotateCameraSpeedChanged = new EventEmitter();
  @Output() explode = new EventEmitter();
  @Output() explodePowerChanged = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
