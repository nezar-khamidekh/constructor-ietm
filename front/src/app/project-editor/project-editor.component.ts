import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubSink } from 'subsink';
import { Settings } from '../scene/classes/Settings';
import { InstructionI } from '../shared/models/insruction.interface';
import { TreeStructureI } from '../shared/models/treeStructure.interface';
import { RepositoryService } from '../shared/services/repository.service';

@Component({
  selector: 'app-project-editor',
  templateUrl: './project-editor.component.html',
  styleUrls: ['./project-editor.component.scss'],
})
export class ProjectEditorComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  step: number = 1;
  repositoryId = '';
  newModelId = '';

  constructor(private repositoryService: RepositoryService, private router: Router) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  changeStep(step: number) {
    this.step = step;
  }

  onRepositoryCreated(data: { nextStep: number; repositoryId: string }) {
    this.changeStep(data.nextStep);
    this.repositoryId = data.repositoryId;
  }

  onModelLoaded(data: { nextStep: number; modelId: string }) {
    this.changeStep(data.nextStep);
    this.newModelId = data.modelId;
  }

  onSaveInteractiveData(data: {
    modelTree: TreeStructureI;
    settings: Settings;
    instructions: InstructionI[];
  }) {
    this.subs.add(
      this.repositoryService
        .update({
          _id: this.repositoryId,
          modelTree: data.modelTree,
          sceneSettings: {
            grid: data.settings.grid,
            background: data.settings.background,
            cameraPosition: data.settings.cameraPosition,
          },
          instructions: data.instructions,
        })
        .subscribe((res) => {
          console.log(res);
          this.router.navigate(['/repository', this.repositoryId]);
        }),
    );
  }
}
