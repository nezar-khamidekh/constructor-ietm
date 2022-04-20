import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-project-editor',
  templateUrl: './project-editor.component.html',
  styleUrls: ['./project-editor.component.scss'],
})
export class ProjectEditorComponent implements OnInit {
  step: number = 3;
  repositoryId = '';
  modelName = '';

  constructor() {}

  ngOnInit(): void {}

  onRepositoryCreated(data: { nextStep: number; repositoryId: string }) {
    this.changeStep(data.nextStep);
    this.repositoryId = data.repositoryId;
  }

  onModelLoaded(data: { nextStep: number; modelName: string }) {
    this.changeStep(data.nextStep);
    this.modelName = data.modelName;
  }

  onChangeStep(step: number) {
    this.step = step;
  }

  changeStep(step: number) {
    this.step = step;
  }
}
