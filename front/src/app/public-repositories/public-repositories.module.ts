import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRepositoriesRoutingModule } from './public-repositories-routing.module';
import { PublicRepositoriesComponent } from './public-repositories.component';
import { RepositoriesPageModule } from '../repositories-page/repositories-page.module';
import { PageStatusModule } from '../shared/modules/page-status/page-status.module';

@NgModule({
  declarations: [PublicRepositoriesComponent],
  imports: [
    CommonModule,
    PublicRepositoriesRoutingModule,
    RepositoriesPageModule,
    PageStatusModule,
  ],
})
export class PublicRepositoriesModule {}
