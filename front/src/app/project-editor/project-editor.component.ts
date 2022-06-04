import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';
import { Settings } from '../scene/classes/Settings';
import { InstructionI } from '../shared/models/insruction.interface';
import { RepositoryI } from '../shared/models/repository.interface';
import { TreeStructureI } from '../shared/models/treeStructure.interface';
import { DataStoreService } from '../shared/services/data-store.service';
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
  repositoryToEdit: RepositoryI | null = null;
  hasAccess = false;

  constructor(
    private repositoryService: RepositoryService,
    private router: Router,
    private route: ActivatedRoute,
    private dataStore: DataStoreService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.data.repository) {
      this.repositoryToEdit = this.route.snapshot.data.repository;

      const roles: number[] = this.route.snapshot.data.roles;
      const userRole = this.repositoryToEdit!.participants?.find(
        (participant) => participant.user._id === this.dataStore.getUserValue()!._id,
      )?.role;

      if (typeof userRole === 'undefined' || !roles.includes(userRole)) {
        this.router.navigate(['/main']);
        this.snackBar.open('Недостаточно прав', '', {
          duration: 5000,
          panelClass: 'errorSnack',
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      } else this.hasAccess = true;
    }
    this.hasAccess = true;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  changeStep(step: number) {
    this.step = step;
  }

  onRepositoryCreated(data: { nextStep: number; repositoryId: string }) {
    if (this.repositoryToEdit) {
      this.changeStep(3);
    } else {
      this.changeStep(data.nextStep);
      this.repositoryId = data.repositoryId;
    }
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
