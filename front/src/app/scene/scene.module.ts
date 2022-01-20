import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SceneRoutingModule } from './scene-routing.module';
import { SceneComponent } from './scene.component';
import { MatButtonModule } from '@angular/material/button';
import { ViewerToolbarComponent } from './components/viewer-toolbar/viewer-toolbar.component';
import { ViewerButtonComponent } from './components/viewer-button/viewer-button.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [SceneComponent, ViewerToolbarComponent, ViewerButtonComponent],
  imports: [
    CommonModule,
    SceneRoutingModule,
    MatButtonModule,
    MatSliderModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  exports: [SceneComponent],
})
export class SceneModule {}
