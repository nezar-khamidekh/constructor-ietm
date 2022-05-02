import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { ViewerSettingsComponent } from './viewer-settings.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [ViewerSettingsComponent],
  imports: [CommonModule, MatRadioModule, MatSelectModule],
  exports: [ViewerSettingsComponent],
})
export class ViewerSettingsModule {}
