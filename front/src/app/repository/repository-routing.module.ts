import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepositoryComponent } from './repository.component';
import { RepositoryResolverService } from './resolvers/repository-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: RepositoryComponent,
    resolve: {
      repository: RepositoryResolverService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepositoryRoutingModule {}
