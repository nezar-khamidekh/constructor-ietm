import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogDeleteItemComponent } from './dialog-delete-item.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [DialogDeleteItemComponent],
  imports: [CommonModule, MatDialogModule],
  exports: [DialogDeleteItemComponent],
})
export class DialogDeleteItemModule {}
