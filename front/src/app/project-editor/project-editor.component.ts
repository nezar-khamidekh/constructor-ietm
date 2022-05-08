import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SubSink } from 'subsink';
import { AnnotationI } from '../shared/models/annotation.interface';
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

  onSaveInstructions(data: { annotations: AnnotationI[]; modelTree: TreeStructureI }) {
    this.subs.add(
      this.repositoryService
        .update({
          _id: this.repositoryId,
          annotationGroups: [
            {
              assinedModel: this.newModelId,
              annotations: data.annotations.map((annotation) => {
                return {
                  title: annotation.title,
                  description: annotation.description,
                  position: annotation.position,
                  attachedObjectId: annotation.attachedObject.uuid,
                };
              }),
            },
          ],
          modelTree: data.modelTree,
        })
        .subscribe((res) => {
          console.log(res);
          this.router.navigate(['/repository', this.repositoryId]);
        }),
    );
  }
}
