import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepositoryRoutingModule } from './repository-routing.module';
import { RepositoryComponent } from './repository.component';
import { SceneModule } from '../scene/scene.module';
import { ImageSanitizedModule } from '../shared/directives/image-sanitized/image-sanitized.module';
import { SummaryComponent } from './components/summary/summary.component';
import { MatButtonModule } from '@angular/material/button';
import { TreeComponent } from './components/tree/tree.component';
import { TreeStructureModule } from '../tree-structure/tree-structure.module';
import { HasRoleModule } from '../shared/directives/has-role/has-role.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DialogConfirmActionModule } from '../dialogs/dialog-confirm-action/dialog-confirm-action.module';
import { InstructionsComponent } from './components/instructions/instructions.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [RepositoryComponent, SummaryComponent, TreeComponent, InstructionsComponent],
  imports: [
    CommonModule,
    RepositoryRoutingModule,
    SceneModule,
    ImageSanitizedModule,
    MatButtonModule,
    TreeStructureModule,
    DialogConfirmActionModule,
    HasRoleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
})
export class RepositoryModule {}
