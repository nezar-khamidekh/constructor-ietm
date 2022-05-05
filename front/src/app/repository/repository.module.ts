import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepositoryRoutingModule } from './repository-routing.module';
import { RepositoryComponent } from './repository.component';
import { SceneModule } from '../scene/scene.module';
import { ImageSanitizedModule } from '../shared/directives/image-sanitized/image-sanitized.module';
import { SummaryComponent } from './components/summary/summary.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [RepositoryComponent, SummaryComponent],
  imports: [
    CommonModule,
    RepositoryRoutingModule,
    SceneModule,
    ImageSanitizedModule,
    MatButtonModule,
  ],
})
export class RepositoryModule {}
