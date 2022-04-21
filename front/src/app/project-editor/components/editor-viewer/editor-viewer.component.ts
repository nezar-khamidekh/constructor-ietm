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
import { SceneService } from 'src/app/scene/services/scene.service';
import { AnnotationI } from 'src/app/shared/models/annotation.interface';
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
  @Input() modelName: string;
  @Output() changeStep = new EventEmitter();

  model: any = null;

  annotations: AnnotationI[] = [];

  currentAnnotation: CurrentAnnotationI = {
    title: '',
    text: '',
    position: null,
    attachedObject: null,
  };

  viewerMouseMode = VIEWER_MOUSE_MODE.Default;
  previousTabIndex = 0;

  constructor(
    private sceneService: SceneService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
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
    if (this.annotations.length) {
      if (currentTab.index === 0) {
        for (let i = 0; i < this.annotations.length; i++) {
          this.sceneService.toggleAnnotationsVisibility(this.annotations[i].id, true);
        }
      }
      if ((currentTab.index === 1 || currentTab.index === 2) && this.previousTabIndex === 0) {
        for (let i = 0; i < this.annotations.length; i++) {
          this.sceneService.toggleAnnotationsVisibility(this.annotations[i].id, false);
        }
      }
      this.previousTabIndex = currentTab.index;
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

  onHideAnnotation(hideAnnotation: AnnotationI) {
    this.sceneService.toggleAnnotationsVisibility(hideAnnotation.id);
  }

  onApplyAnnotationPosition(value: any) {
    this.currentAnnotation = {
      title: this.currentAnnotation.title,
      text: this.currentAnnotation.text,
      position: value.coords,
      attachedObject: value.attachedObject,
    };
  }

  onViewerIsReady() {
    setTimeout(() => {
      this.model = this.sceneService.getModel();
      this.cdr.detectChanges();
    }, 1000);
  }
}
