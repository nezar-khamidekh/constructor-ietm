import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRepositoriesResolverService } from '../shared/resolvers/user-repositories-resolver';
import { UserTeamsResolverService } from '../team/resolvers/user-teams.service';
import { MainComponent } from './main.component';
import { PublicRepositoriesResolverService } from './resolvers/public-repositories-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    resolve: {
      userRepositories: UserRepositoriesResolverService,
      userTeams: UserTeamsResolverService,
      publicRepositories: PublicRepositoriesResolverService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
