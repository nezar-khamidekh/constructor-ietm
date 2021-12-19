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
  @Input() isActive = false;
  @Input() iconPath = '';
  @Input() iconActivePath = '';
  @Input() buttonName = '';
  @Output() btnClicked = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}
}
