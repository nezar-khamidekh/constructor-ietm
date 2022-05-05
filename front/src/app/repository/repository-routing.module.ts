import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SummaryComponent } from './components/summary/summary.component';
import { RepositoryComponent } from './repository.component';
import { RepositoryIsInFavoriteResolverService } from './resolvers/repository-is-in-favorite-resolver.service';
import { RepositoryResolverService } from './resolvers/repository-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: RepositoryComponent,
    resolve: {
      repository: RepositoryResolverService,
      isInFavorite: RepositoryIsInFavoriteResolverService,
    },
    children: [
      {
        path: '',
        component: SummaryComponent,
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepositoryRoutingModule {}
