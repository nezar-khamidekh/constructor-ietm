import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-editor-animations',
  templateUrl: './editor-animations.component.html',
  styleUrls: ['./editor-animations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorAnimationsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
