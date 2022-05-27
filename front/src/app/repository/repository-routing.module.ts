import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstructionsComponent } from './components/instructions/instructions.component';
import { SummaryComponent } from './components/summary/summary.component';
import { TreeComponent } from './components/tree/tree.component';
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
      {
        path: 'tree',
        component: TreeComponent,
      },
      {
        path: 'instructions',
        component: InstructionsComponent,
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
