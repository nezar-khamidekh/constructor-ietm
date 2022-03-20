import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogChooseImageComponent } from './dialog-choose-image.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [DialogChooseImageComponent],
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  exports: [DialogChooseImageComponent],
})
export class DialogChooseImageModule {}
