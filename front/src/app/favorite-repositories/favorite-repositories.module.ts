import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FavoriteRepositoriesRoutingModule } from './favorite-repositories-routing.module';
import { FavoriteRepositoriesComponent } from './favorite-repositories.component';
import { RepositoriesPageModule } from '../repositories-page/repositories-page.module';
import { PageStatusModule } from '../shared/modules/page-status/page-status.module';

@NgModule({
  declarations: [FavoriteRepositoriesComponent],
  imports: [
    CommonModule,
    FavoriteRepositoriesRoutingModule,
    RepositoriesPageModule,
    PageStatusModule,
  ],
})
export class FavoriteRepositoriesModule {}
