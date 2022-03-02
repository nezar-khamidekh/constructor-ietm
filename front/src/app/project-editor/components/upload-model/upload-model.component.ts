import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-upload-model',
  templateUrl: './upload-model.component.html',
  styleUrls: ['./upload-model.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadModelComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
