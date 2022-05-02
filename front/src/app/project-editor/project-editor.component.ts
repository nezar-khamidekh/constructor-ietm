import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-project-editor',
  templateUrl: './project-editor.component.html',
  styleUrls: ['./project-editor.component.scss'],
})
export class ProjectEditorComponent implements OnInit {
  step: number = 1;
  repositoryId = '';
  newModelId = '';

  constructor() {}

  ngOnInit(): void {}

  onRepositoryCreated(data: { nextStep: number; repositoryId: string }) {
    this.changeStep(data.nextStep);
    this.repositoryId = data.repositoryId;
  }

  onModelLoaded(data: { nextStep: number; modelId: string }) {
    this.changeStep(data.nextStep);
    this.newModelId = data.modelId;
  }

  onChangeStep(step: number) {
    this.step = step;
  }

  changeStep(step: number) {
    this.step = step;
  }
}
