import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRepositoriesRoutingModule } from './public-repositories-routing.module';
import { PublicRepositoriesComponent } from './public-repositories.component';
import { RepositoriesPageModule } from '../repositories-page/repositories-page.module';

@NgModule({
  declarations: [PublicRepositoriesComponent],
  imports: [CommonModule, PublicRepositoriesRoutingModule, RepositoriesPageModule],
})
export class PublicRepositoriesModule {}
