import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-confirm-action',
  templateUrl: './dialog-confirm-action.component.html',
  styleUrls: ['./dialog-confirm-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogConfirmActionComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogConfirmActionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string },
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
