import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-project-editor',
  templateUrl: './project-editor.component.html',
  styleUrls: ['./project-editor.component.scss'],
})
export class ProjectEditorComponent implements OnInit {
  step: number = 3;

  constructor() {}

  ngOnInit(): void {}

  onChangeStep(step: number) {
    this.step = step;
  }
}
