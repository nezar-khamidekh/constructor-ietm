import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicRepositoriesComponent } from './public-repositories.component';
import { PublicRepositoriesResolverService } from './resolvers/public-repositories-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: PublicRepositoriesComponent,
    resolve: {
      repositories: PublicRepositoriesResolverService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PublicRepositoriesRoutingModule {}
