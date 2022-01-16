import { Component, OnInit, ChangeDetectionStrategy, Input, Output } from '@angular/core';
import { SceneService } from 'src/app/scene/services/scene.service';
import { AnnotationI } from 'src/app/shared/models/annotation.interface';
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
  @Input() model: any;

  annotations: AnnotationI[] = [
    {
      title: '1',
      description: 'Bathroom Sink is good for washing your hands',
      position: {
        x: 0.8807755104286317,
        y: 0.009937415637652509,
        z: 0.5152293842824673,
      },
    },
    {
      title: '2',
      description: 'Bathroom Sink is good for washing your hands',
      position: {
        x: 0.9807755104286317,
        y: 0.009937415637652509,
        z: 0.5152293842824673,
      },
    },
    {
      title: '3',
      description: 'Bathroom Sink is good for washing your hands',
      position: {
        x: 0.6807755104286317,
        y: 0.009937415637652509,
        z: 0.5152293842824673,
      },
    },
  ];

  currentAnnotation: CurrentAnnotationI = {
    text: '',
    position: null,
  };

  viewerMouseMode = VIEWER_MOUSE_MODE.Default;

  constructor(private sceneService: SceneService) {}

  ngOnInit(): void {}

  onApplyAnnotation(status: boolean) {
    this.viewerMouseMode = status ? VIEWER_MOUSE_MODE.ApplyAnnotation : VIEWER_MOUSE_MODE.Default;
  }

  onSaveAnnotation() {
    this.annotations = [
      ...this.annotations,
      {
        title: (this.annotations.length + 1).toString(),
        description: this.currentAnnotation.text,
        position: {
          x: this.currentAnnotation.position!.x,
          y: this.currentAnnotation.position!.y,
          z: this.currentAnnotation.position!.z,
        },
      },
    ];
    console.log(this.annotations);
    this.currentAnnotation = {
      text: '',
      position: null,
    };
  }

  onCoordsAnnotation(coords: any) {
    console.log(coords);
    this.currentAnnotation = {
      text: this.currentAnnotation.text,
      position: coords,
    };
  }

  onViewerIsReady() {
    this.model = this.sceneService.getModel();
  }
}
