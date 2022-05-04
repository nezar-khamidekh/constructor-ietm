import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserRepositoriesRoutingModule } from './user-repositories-routing.module';
import { UserRepositoriesComponent } from './user-repositories.component';
import { RepositoriesPageModule } from '../repositories-page/repositories-page.module';

@NgModule({
  declarations: [UserRepositoriesComponent],
  imports: [CommonModule, UserRepositoriesRoutingModule, RepositoriesPageModule],
})
export class UserRepositoriesModule {}
