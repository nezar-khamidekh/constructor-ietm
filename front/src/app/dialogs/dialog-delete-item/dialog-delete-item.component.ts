import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-delete-item',
  templateUrl: './dialog-delete-item.component.html',
  styleUrls: ['./dialog-delete-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogDeleteItemComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogDeleteItemComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
