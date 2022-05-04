import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRepositoriesResolverService } from '../shared/resolvers/user-repositories-resolver';
import { UserRepositoriesComponent } from './user-repositories.component';

const routes: Routes = [
  {
    path: '',
    component: UserRepositoriesComponent,
    resolve: {
      repositories: UserRepositoriesResolverService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRepositoriesRoutingModule {}
