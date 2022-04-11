import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { FileModelService } from 'src/app/shared/services/file-model.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-upload-model',
  templateUrl: './upload-model.component.html',
  styleUrls: ['./upload-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadModelComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  @Input() step: number;
  @Input() repositoryId: string;
  @Output() changeStep = new EventEmitter();

  file: any;

  @ViewChild('fileDropRef', { static: false }) fileDropEl: ElementRef;

  constructor(
    private fileModelService: FileModelService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  uploadFile(file: any) {
    this.loadingService.setIsLoading(true);
    const uploadData = new FormData();
    uploadData.append('model', file, file.name);
    uploadData.append('repoId', this.repositoryId);
    this.subs.add(
      this.fileModelService.upload(uploadData).subscribe((repository) => {
        this.changeStep.emit({
          nextStep: this.step + 1,
          modelName: repository.models[repository.models.length - 1].name,
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
