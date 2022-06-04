import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  ChangeDetectorRef,
  EventEmitter,
  Renderer2,
} from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { InstructionsService } from 'src/app/scene/services/instructions.service';
import { SceneService } from 'src/app/scene/services/scene.service';
import { SettingsService } from 'src/app/scene/services/settings.service';
import { AnnotationI } from 'src/app/shared/models/annotation.interface';
import { RepositoryI } from 'src/app/shared/models/repository.interface';
import { TreeStructureI } from 'src/app/shared/models/treeStructure.interface';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { TreeStructureService } from 'src/app/tree-structure/services/tree-structure.service';
import { SubSink } from 'subsink';
export const enum VIEWER_MOUSE_MODE {
  Default,
  ApplyAnnotation,
}

interface CurrentAnnotationI {
  title: string;
  text: string;
  position: null | {
    x: number;
    y: number;
    z: number;
  };
  attachedObject: THREE.Object3D | null;
}

@Component({
  selector: 'app-editor-viewer',
  templateUrl: './editor-viewer.component.html',
  styleUrls: ['./editor-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorViewerComponent implements OnInit {
  private subs = new SubSink();

  @Input() step: number;
  @Input() repositoryId: string;
  @Input() modelId: string;
  @Input() repositoryToEdit: RepositoryI | null = null;
  @Output() saveInteractiveData = new EventEmitter();

  tree: TreeStructureI;

  annotations: AnnotationI[] = [];

  currentAnnotation: CurrentAnnotationI = {
    title: '',
    text: '',
    position: null,
    attachedObject: null,
  };

  viewerMouseMode = VIEWER_MOUSE_MODE.Default;

  constructor(
    private sceneService: SceneService,
    private treeStructureService: TreeStructureService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private loadingService: LoadingService,
    private settingsService: SettingsService,
    private instructionsService: InstructionsService,
  ) {}

  ngOnInit(): void {
    this.initAnnotations();
  }

  initAnnotations() {
    this.sceneService.setAnnotations(this.annotations);
    this.subs.add(
      this.sceneService.getAnnotations().subscribe((annotations) => {
        this.annotations = annotations;
        this.cdr.detectChanges();
      }),
    );
  }

  changeTab(currentTab: MatTabChangeEvent) {
    if (currentTab.index === 1 || currentTab.index === 2) {
      this.sceneService.setIsRecording(false);
      this.sceneService.actions = [];
      this.sceneService.resetAction();
    }
    if (this.annotations.length) {
      if (currentTab.index === 1) {
        for (let i = 0; i < this.annotations.length; i++) {
          this.sceneService.toggleAnnotationsVisibility(this.annotations[i].id, true);
        }
      }
      if (currentTab.index === 0 || currentTab.index === 2) {
        for (let i = 0; i < this.annotations.length; i++) {
          this.sceneService.toggleAnnotationsVisibility(this.annotations[i].id, false);
        }
      }
    }
  }

  onApplyAnnotation(status: boolean) {
    this.viewerMouseMode = status ? VIEWER_MOUSE_MODE.ApplyAnnotation : VIEWER_MOUSE_MODE.Default;
  }

  onSaveAnnotation(dataAnnotation?: any) {
    if (dataAnnotation) {
      const annotation = this.annotations.find(
        (annotation) => annotation.id === dataAnnotation.editedAnnotation.id,
      );
      annotation!.description = dataAnnotation.text;
      annotation!.descriptionDomElement!.innerText = dataAnnotation.text;
      annotation!.title = dataAnnotation.title;
      annotation!.labelDomElement!.innerText = dataAnnotation.title;
      this.renderer.appendChild(annotation!.labelDomElement, annotation!.descriptionDomElement);
      this.sceneService.setAnnotations(this.annotations);
    } else {
      this.sceneService.setAnnotations([
        ...this.annotations,
        {
          id: this.annotations.length + 1,
          title: this.currentAnnotation.title,
          description: this.currentAnnotation.text,
          position: {
            x: this.currentAnnotation.position!.x,
            y: this.currentAnnotation.position!.y,
            z: this.currentAnnotation.position!.z,
          },
          attachedObject: this.currentAnnotation.attachedObject,
        },
      ]);
    }
    this.currentAnnotation = {
      title: '',
      text: '',
      position: null,
      attachedObject: null,
    };
  }

  onDeleteAnnotation(deletedAnnotation: AnnotationI) {
    this.sceneService.deleteAnnotation(deletedAnnotation);
    this.sceneService.setAnnotations(
      this.annotations.filter((annotation) => annotation.id !== deletedAnnotation.id),
    );
  }

  onApplyAnnotationPosition(value: any) {
    this.currentAnnotation = {
      title: value.title,
      text: value.text,
      position: value.coords,
      attachedObject: value.attachedObject,
    };
    this.onSaveAnnotation();
  }

  onViewerIsReady() {
    if (this.repositoryToEdit?.modelTree) this.tree = this.repositoryToEdit.modelTree;
    else this.tree = this.treeStructureService.generate(this.sceneService.getModel());
    this.loadingService.setIsLoading(false);
  }

  onSaveInteractiveData() {
    this.saveInteractiveData.emit({
      modelTree: this.tree,
      settings: this.settingsService.getSettings(),
      instructions: this.instructionsService.getIntructions(),
    });
  }

  onUpdateTree(tree: TreeStructureI) {
    this.tree = { ...tree };
  }
}
