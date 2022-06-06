import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { LoadingService } from 'src/app/shared/services/loading.service';

@Component({
  selector: 'app-editor-step',
  templateUrl: './editor-step.component.html',
  styleUrls: ['./editor-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorStepComponent {
  @Input() title = '';
  @Input() subtitle = '';

  constructor(public loadingService: LoadingService) {}
}
