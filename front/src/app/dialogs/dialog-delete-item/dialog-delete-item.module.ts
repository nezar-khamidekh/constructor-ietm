import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogDeleteItemComponent } from './dialog-delete-item.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [DialogDeleteItemComponent],
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  exports: [DialogDeleteItemComponent],
})
export class DialogDeleteItemModule {}
