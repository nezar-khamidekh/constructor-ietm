import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepositoriesComponent } from './repositories.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { ImageSanitizedModule } from '../shared/directives/image-sanitized/image-sanitized.module';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [RepositoriesComponent],
  imports: [CommonModule, MatButtonModule, RouterModule, ImageSanitizedModule, MatTooltipModule],
  exports: [RepositoriesComponent],
})
export class RepositoriesModule {}
