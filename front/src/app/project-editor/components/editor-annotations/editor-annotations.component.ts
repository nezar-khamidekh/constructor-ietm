import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { SceneService } from 'src/app/scene/services/scene.service';
import { AnnotationI } from 'src/app/shared/models/annotation.interface';

@Component({
  selector: 'app-editor-annotations',
  templateUrl: './editor-annotations.component.html',
  styleUrls: ['./editor-annotations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorAnnotationsComponent implements OnInit {
  @Input() annotations: AnnotationI[] = [];
  @Input() currentAnnotation: any;
  @Input() step: number;
  @Output() applyAnnotation = new EventEmitter();
  @Output() saveAnnotation = new EventEmitter();
  @Output() deleteAnnotation = new EventEmitter();
  @Output() hideAnnotation = new EventEmitter();
  @Output() changedStep = new EventEmitter();

  @ViewChild('buttonApplyAnnotation', { static: false }) buttonApplyAnnotationRef: ElementRef;

  constructor(public sceneService: SceneService) {}

  ngOnInit(): void {}

  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    if (!this.buttonApplyAnnotationRef.nativeElement.contains(event.target)) {
      this.applyAnnotation.emit(false);
    }
  }

  onSaveAnnotation() {
    this.saveAnnotation.emit();
  }
}
