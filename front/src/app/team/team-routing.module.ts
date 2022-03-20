import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
import { ManageTeamComponent } from './components/manage-team/manage-team.component';
import { TeamPageComponent } from './components/team-page/team-page.component';
import { TeamsListComponent } from './components/teams-list/teams-list.component';
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
          checkUser: true,
        },
      },
      {
        path: 'edit/:teamId',
        component: ManageTeamComponent,
        canActivate: [AuthGuard],
        resolve: { team: TeamResolverService },
        data: {
          checkUser: true,
        },
      },
      {
        path: 'user-teams',
        component: TeamsListComponent,
        canActivate: [AuthGuard],
        resolve: { teams: UserTeamsResolverService },
        data: {
          checkUser: true,
        },
      },
      {
        path: ':teamId',
        component: TeamPageComponent,
        canActivate: [AuthGuard],
        resolve: { team: TeamResolverService },
        data: {
          checkUser: true,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamRoutingModule {}
