import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-editor-viewer',
  templateUrl: './editor-viewer.component.html',
  styleUrls: ['./editor-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorViewerComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
