import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SummaryComponent } from './components/summary/summary.component';
import { RepositoryComponent } from './repository.component';
import { RepositoryResolverService } from './resolvers/repository-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: RepositoryComponent,
    resolve: {
      repository: RepositoryResolverService,
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
