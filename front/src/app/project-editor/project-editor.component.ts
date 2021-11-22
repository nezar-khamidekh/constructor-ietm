import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-project-editor',
  templateUrl: './project-editor.component.html',
  styleUrls: ['./project-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectEditorComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
