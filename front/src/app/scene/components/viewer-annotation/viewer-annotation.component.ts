import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface DIALOG_DATA {
  position: any;
}

@Component({
  selector: 'app-viewer-annotation',
  templateUrl: './viewer-annotation.component.html',
  styleUrls: ['./viewer-annotation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerAnnotationComponent implements OnInit {
  title = '';
  text = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DIALOG_DATA,
    private dialogRef: MatDialogRef<ViewerAnnotationComponent>,
  ) {}

  ngOnInit(): void {}

  saveAnnotation() {
    this.dialogRef.close({ title: this.title, text: this.text });
  }

  cancel() {
    this.dialogRef.close();
  }
}
