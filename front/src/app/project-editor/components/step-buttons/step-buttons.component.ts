import { Location } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-step-buttons',
  templateUrl: './step-buttons.component.html',
  styleUrls: ['./step-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepButtonsComponent {
  @Input() step: number;
  @Input() nextBtnText = '';
  @Output() buttonClick = new EventEmitter();

  constructor(private location: Location) {}

  navigateBack() {
    this.location.back();
  }
}
