import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepositoriesPageComponent } from './repositories-page.component';
import { RepositoriesResolverService } from './resolvers/repositories-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: RepositoriesPageComponent,
    resolve: {
      repositories: RepositoriesResolverService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepositoriesPageRoutingModule {}
