import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserRepositoriesResolverService } from '../shared/resolvers/user-repositories-resolver';
import { MainComponent } from './main.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    resolve: {
      repositories: UserRepositoriesResolverService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
