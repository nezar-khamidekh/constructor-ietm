import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-editor-annotations',
  templateUrl: './editor-annotations.component.html',
  styleUrls: ['./editor-annotations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorAnnotationsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
