import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
import { ManageTeamComponent } from './components/manage-team/manage-team.component';
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
