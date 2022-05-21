import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DialogConfirmActionComponent } from './dialog-confirm-action.component';

@NgModule({
  declarations: [DialogConfirmActionComponent],
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  exports: [DialogConfirmActionComponent],
})
export class DialogConfirmActionModule {}
