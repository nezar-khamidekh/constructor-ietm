import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm-action',
  templateUrl: './dialog-confirm-action.component.html',
  styleUrls: ['./dialog-confirm-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogConfirmActionComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogConfirmActionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
  ) {}

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
