import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { SceneService } from 'src/app/scene/services/scene.service';
import { StepI } from 'src/app/shared/models/insruction.interface';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-step-action',
  templateUrl: './step-action.component.html',
  styleUrls: ['./step-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepActionComponent implements OnInit {
  private subs = new SubSink();

  @Input() step: StepI;

  @Output() saveStep = new EventEmitter();
  @Output() backToSteps = new EventEmitter();

  @Output() deleteAction = new EventEmitter();

  isRecording = false;

  constructor(private sceneService: SceneService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subs.add(
      this.sceneService.getIsRecording().subscribe((isRecording) => {
        this.isRecording = isRecording;
        this.cdr.detectChanges();
      }),
    );
  }

  hasStepId() {
    return typeof this.step.id === 'number';
  }

  startRecording() {
    this.sceneService.setIsRecording(true);
  }

  stopRecording() {
    this.sceneService.setIsRecording(false);
  }
}
