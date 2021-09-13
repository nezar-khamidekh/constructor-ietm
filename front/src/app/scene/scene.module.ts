import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SceneRoutingModule } from './scene-routing.module';
import { SceneComponent } from './scene.component';

@NgModule({
  declarations: [SceneComponent],
  imports: [CommonModule, SceneRoutingModule],
})
export class SceneModule {}
