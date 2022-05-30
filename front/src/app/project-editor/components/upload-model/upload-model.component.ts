import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { FileModelService } from 'src/app/shared/services/file-model.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { SubSink } from 'subsink';

enum MODEL_FORMAT {
  gltf,
  step,
}

enum MODEL_TYPE {
  primary,
  animation,
}

@Component({
  selector: 'app-upload-model',
  templateUrl: './upload-model.component.html',
  styleUrls: ['./upload-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadModelComponent implements OnDestroy {
  private subs = new SubSink();

  @Input() step: number;
  @Input() repositoryId: string;
  @Output() changeStep = new EventEmitter();

  file: any;

  @ViewChild('fileDropRef', { static: false }) fileDropEl: ElementRef;

  constructor(private fileModelService: FileModelService, private loadingService: LoadingService) {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  uploadFile(file: any) {
    this.loadingService.setIsLoading(true);
    const uploadData = new FormData();
    uploadData.append('model', file, file.name);
    uploadData.append('repoId', this.repositoryId);
    uploadData.append(
      'format',
      file.name.slice(file.name.lastIndexOf('.') + 1) === 'gltf'
        ? MODEL_FORMAT.gltf.toString()
        : MODEL_FORMAT.step.toString(),
    );
    uploadData.append('type', MODEL_TYPE.primary.toString());
    this.subs.add(
      this.fileModelService.upload(uploadData).subscribe((repository) => {
        this.changeStep.emit({
          nextStep: this.step + 1,
          modelId: repository.models[repository.models.length - 1]._id,
        });
      }),
    );
  }

  onFileDropped(e: any) {
    this.uploadFile(e);
  }

  onFileChanged(e: any) {
    if (e.target.files[0]) this.uploadFile(e.target.files[0]);
  }
}
