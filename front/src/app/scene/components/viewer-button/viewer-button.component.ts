import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-viewer-button',
  templateUrl: './viewer-button.component.html',
  styleUrls: ['./viewer-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerButtonComponent implements OnInit {
  @Input() iconPath = '';
  @Input() buttonName = '';
  @Output() btnClicked = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
