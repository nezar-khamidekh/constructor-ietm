import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FavoriteRepositoriesComponent } from './favorite-repositories.component';
import { FavoriteRepositoriesResolverService } from './resolvers/favorite-repositories-resolver.service';

const routes: Routes = [
  {
    path: '',
    component: FavoriteRepositoriesComponent,
    resolve: {
      repositories: FavoriteRepositoriesResolverService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FavoriteRepositoriesRoutingModule {}
