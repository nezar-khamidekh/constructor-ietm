import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamRoutingModule } from './team-routing.module';
import { TeamComponent } from './team.component';
import { ManageTeamComponent } from './components/manage-team/manage-team.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamsListComponent } from './components/teams-list/teams-list.component';
import { TeamPageComponent } from './components/team-page/team-page.component';
import { DialogChooseImageModule } from '../dialogs/dialog-choose-image/dialog-choose-image.module';
import { MatDialogModule } from '@angular/material/dialog';
import { ImageSanitizedModule } from '../shared/directives/image-sanitized/image-sanitized.module';
import { ParticipantRolePipe } from './pipes/participant-role.pipe';
import { ParticipantsTableComponent } from './components/participants-table/participants-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RepositoriesModule } from '../repositories/repositories.module';
import { HasRoleModule } from '../shared/directives/has-role/has-role.module';
import { IsTeamAuthorPipe } from './pipes/is-team-author.pipe';
import { DialogConfirmActionModule } from '../dialogs/dialog-confirm-action/dialog-confirm-action.module';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    TeamComponent,
    ManageTeamComponent,
    TeamsListComponent,
    TeamPageComponent,
    ParticipantRolePipe,
    ParticipantsTableComponent,
    IsTeamAuthorPipe,
  ],
  imports: [
    CommonModule,
    TeamRoutingModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    DialogChooseImageModule,
    MatDialogModule,
    ImageSanitizedModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    RepositoriesModule,
    HasRoleModule,
    DialogConfirmActionModule,
    MatTooltipModule,
  ],
})
export class TeamModule {}
