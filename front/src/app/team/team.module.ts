import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamRoutingModule } from './team-routing.module';
import { TeamComponent } from './team.component';
import { ManageTeamComponent } from './components/manage-team/manage-team.component';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [TeamComponent, ManageTeamComponent],
  imports: [CommonModule, TeamRoutingModule, MatButtonModule, ReactiveFormsModule],
})
export class TeamModule {}
