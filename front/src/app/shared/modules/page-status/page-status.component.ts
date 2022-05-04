import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-page-status',
  templateUrl: './page-status.component.html',
  styleUrls: ['./page-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageStatusComponent implements OnInit {
  @Input() text = '';

  constructor() {}

  ngOnInit(): void {}
}
