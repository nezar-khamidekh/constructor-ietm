import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-step-buttons',
  templateUrl: './step-buttons.component.html',
  styleUrls: ['./step-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepButtonsComponent implements OnInit {
  @Input() step: number;
  @Output() changedStep = new EventEmitter();
  constructor(private router: Router) {}

  ngOnInit(): void {}

  navigateToMain() {
    this.router.navigate(['/main']);
  }
}
