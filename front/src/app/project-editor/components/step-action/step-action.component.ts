import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { StepI } from 'src/app/shared/models/insruction.interface';

@Component({
  selector: 'app-step-action',
  templateUrl: './step-action.component.html',
  styleUrls: ['./step-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepActionComponent implements OnInit {
  @Input() step: StepI;

  @Output() saveStep = new EventEmitter();
  @Output() backToSteps = new EventEmitter();

  @Output() startRecordingAction = new EventEmitter();
  @Output() stopRecordingAction = new EventEmitter();

  @Output() deleteAction = new EventEmitter();

  isRecording = false;

  constructor() {}

  ngOnInit(): void {}

  hasStepId() {
    return typeof this.step.id === 'number';
  }

  startRecording() {
    this.isRecording = true;
    this.startRecordingAction.emit();
  }

  stopRecording() {
    this.isRecording = false;
    this.stopRecordingAction.emit();
  }
}
