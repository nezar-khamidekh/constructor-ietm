import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';

@Component({
  selector: 'app-upload-model',
  templateUrl: './upload-model.component.html',
  styleUrls: ['./upload-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadModelComponent implements OnInit {
  @Input() step: number;
  @Input() repositoryId: string;
  @Output() changeStep = new EventEmitter();

  file: any;

  @ViewChild('fileDropRef', { static: false }) fileDropEl: ElementRef;

  constructor() {}

  ngOnInit(): void {}

  uploadFile(file: any) {
    const uploadData = new FormData();
    uploadData.append('upload_file', file, file.name);
    //upload with api
  }

  onFileDropped(e: any) {
    console.log(e);
    this.uploadFile(e);
  }

  onFileChanged(e: any) {
    if (e.target.files[0]) this.uploadFile(e.target.files[0]);
  }
}
