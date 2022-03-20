import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageSanitizedDirective } from './image-sanitized.directive';

@NgModule({
  declarations: [ImageSanitizedDirective],
  imports: [CommonModule],
  exports: [ImageSanitizedDirective],
})
export class ImageSanitizedModule {}
