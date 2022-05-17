import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
import { ParticipantRole } from '../shared/models/participant.interface';
import { ManageTeamComponent } from './components/manage-team/manage-team.component';
import { TeamPageComponent } from './components/team-page/team-page.component';
import { TeamsListComponent } from './components/teams-list/teams-list.component';
import { TeamRepositoriesResolverService } from './resolvers/team-repositories-resolver.service';
import { TeamResolverService } from './resolvers/team-resolver.service';
import { UserTeamsResolverService } from './resolvers/user-teams.service';
import { TeamComponent } from './team.component';

const routes: Routes = [
  {
    path: '',
    component: TeamComponent,
    children: [
      {
        path: 'create',
        component: ManageTeamComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Новая команда',
        },
      },
      {
        path: 'edit/:teamId',
        component: ManageTeamComponent,
        canActivate: [AuthGuard],
        resolve: { team: TeamResolverService },
        data: {
          roles: [ParticipantRole.Author],
        },
      },
      {
        path: 'user-teams',
        component: TeamsListComponent,
        canActivate: [AuthGuard],
        resolve: { teams: UserTeamsResolverService },
        data: {
          title: 'Команды',
        },
      },
      {
        path: ':teamId',
        component: TeamPageComponent,
        resolve: { team: TeamResolverService, repositories: TeamRepositoriesResolverService },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamRoutingModule {}
