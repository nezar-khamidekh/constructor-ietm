import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRepositoriesRoutingModule } from './user-repositories-routing.module';
import { UserRepositoriesComponent } from './user-repositories.component';
import { RepositoriesPageModule } from '../repositories-page/repositories-page.module';
import { PageStatusModule } from '../shared/modules/page-status/page-status.module';

@NgModule({
  declarations: [UserRepositoriesComponent],
  imports: [CommonModule, UserRepositoriesRoutingModule, RepositoriesPageModule, PageStatusModule],
})
export class UserRepositoriesModule {}
