import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  ChangeDetectorRef,
  EventEmitter,
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
  text: string;
  position: null | {
    x: number;
    y: number;
    z: number;
  };
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
  @Output() changedStep = new EventEmitter();
  model: any = null;

  annotations: AnnotationI[] = [];

  currentAnnotation: CurrentAnnotationI = {
    text: '',
    position: null,
  };

  viewerMouseMode = VIEWER_MOUSE_MODE.Default;
  previousTabIndex = 0;

  constructor(private sceneService: SceneService, private cdr: ChangeDetectorRef) {}

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
          this.sceneService.refreshAnnotationsInViewer(this.annotations[i].id, true);
        }
      }
      if ((currentTab.index === 1 || currentTab.index === 2) && this.previousTabIndex === 0) {
        for (let i = 0; i < this.annotations.length; i++) {
          this.sceneService.refreshAnnotationsInViewer(this.annotations[i].id, false);
        }
      }
      this.previousTabIndex = currentTab.index;
    }
  }

  onApplyAnnotation(status: boolean) {
    this.viewerMouseMode = status ? VIEWER_MOUSE_MODE.ApplyAnnotation : VIEWER_MOUSE_MODE.Default;
  }

  onSaveAnnotation(dataAnnotation?: any) {
    if (dataAnnotation.editedAnnotation) {
      this.annotations.find(
        (annotation) => annotation.id === dataAnnotation.editedAnnotation.id,
      )!.description = dataAnnotation.currentAnnotationText;
      this.annotations.find(
        (annotation) => annotation.id === dataAnnotation.editedAnnotation.id,
      )!.descriptionDomElement!.innerText = dataAnnotation.currentAnnotationText;
      this.sceneService.setAnnotations(this.annotations);
    } else {
      this.sceneService.setAnnotations([
        ...this.annotations,
        {
          id: this.annotations.length + 1,
          description: this.currentAnnotation.text,
          position: {
            x: this.currentAnnotation.position!.x,
            y: this.currentAnnotation.position!.y,
            z: this.currentAnnotation.position!.z,
          },
        },
      ]);
    }
    this.currentAnnotation = {
      text: '',
      position: null,
    };
  }

  onDeleteAnnotation(deletedAnnotation: AnnotationI) {
    this.sceneService.setAnnotations(
      this.annotations.filter((annotation) => annotation.id !== deletedAnnotation.id),
    );
    this.sceneService.refreshAnnotationsInViewer(deletedAnnotation.id);
  }

  onHideAnnotation(hideAnnotation: AnnotationI) {
    this.sceneService.refreshAnnotationsInViewer(hideAnnotation.id);
  }

  onCoordsAnnotation(coords: any) {
    this.currentAnnotation = {
      text: this.currentAnnotation.text,
      position: coords,
    };
  }

  onViewerIsReady() {
    setTimeout(() => {
      this.model = this.sceneService.getModel();
      this.cdr.detectChanges();
    }, 1000);
  }
}
