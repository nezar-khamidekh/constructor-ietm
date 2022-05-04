import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepositoriesPageComponent } from './repositories-page.component';
import { RepositoriesModule } from '../repositories/repositories.module';

@NgModule({
  declarations: [RepositoriesPageComponent],
  imports: [CommonModule, RepositoriesModule],
  exports: [RepositoriesPageComponent],
})
export class RepositoriesPageModule {}
