import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamRoutingModule } from './team-routing.module';
import { TeamComponent } from './team.component';
import { ManageTeamComponent } from './components/manage-team/manage-team.component';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { TeamsListComponent } from './components/teams-list/teams-list.component';
import { TeamPageComponent } from './components/team-page/team-page.component';
import { DialogChooseImageModule } from '../dialogs/dialog-choose-image/dialog-choose-image.module';
import { MatDialogModule } from '@angular/material/dialog';
import { ImageSanitizedModule } from '../shared/directives/image-sanitized/image-sanitized.module';
import { ParticipantRolePipe } from './pipes/participant-role.pipe';

@NgModule({
  declarations: [TeamComponent, ManageTeamComponent, TeamsListComponent, TeamPageComponent, ParticipantRolePipe],
  imports: [
    CommonModule,
    TeamRoutingModule,
    MatButtonModule,
    ReactiveFormsModule,
    DialogChooseImageModule,
    MatDialogModule,
    ReactiveFormsModule,
    ImageSanitizedModule,
  ],
})
export class TeamModule {}
