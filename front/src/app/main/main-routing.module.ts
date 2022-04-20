import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRepositoriesResolverService } from '../shared/resolvers/user-repositories-resolver';
import { UserTeamsResolverService } from '../team/resolvers/user-teams.service';
import { MainComponent } from './main.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    resolve: {
      repositories: UserRepositoriesResolverService,
      teams: UserTeamsResolverService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
