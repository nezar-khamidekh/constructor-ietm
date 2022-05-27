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
import { ActionI, ActionType, StepI } from 'src/app/shared/models/insruction.interface';
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

  getNameByType(type: number) {
    switch (type) {
      case ActionType.Camera:
        return 'Камера';
      case ActionType.Rotation:
        return 'Поворот';
      case ActionType.Explode:
        return 'Разнесение';
      case ActionType.Section:
        return 'Сечение';
      case ActionType.Hide:
        return 'Скрытие';
      case ActionType.RestoreView:
        return 'Восстановление';
      case ActionType.FitToView:
        return 'Приближение';
      default:
        return '';
    }
  }

  getValue(action: ActionI) {
    switch (action.type) {
      case ActionType.Camera:
        return 'Позиция: ' + JSON.stringify(action.value);
      case ActionType.Rotation:
        return 'Скорость: ' + action.value;
      case ActionType.Explode:
        return 'Сила: ' + action.value;
      case ActionType.Section:
        return 'Значение: ' + JSON.stringify(action.value);
      case ActionType.Hide:
        return 'Элемент: ' + action.value.name;
      case ActionType.RestoreView:
        return '';
      case ActionType.FitToView:
        return 'Элемент: ' + action.value.name;
      default:
        return '';
    }
  }

  hasStepId() {
    return typeof this.step.index === 'number';
  }

  startRecording() {
    this.sceneService.setIsRecording(true);
  }

  stopRecording() {
    this.sceneService.setIsRecording(false);
  }
}
