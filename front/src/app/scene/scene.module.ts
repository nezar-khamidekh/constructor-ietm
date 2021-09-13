import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SceneRoutingModule } from './scene-routing.module';
import { SceneComponent } from './scene.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [SceneComponent],
  imports: [CommonModule, SceneRoutingModule, MatButtonModule],
})
export class SceneModule {}
