import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepositoryRoutingModule } from './repository-routing.module';
import { RepositoryComponent } from './repository.component';
import { SceneModule } from '../scene/scene.module';

@NgModule({
  declarations: [RepositoryComponent],
  imports: [CommonModule, RepositoryRoutingModule, SceneModule],
})
export class RepositoryModule {}
