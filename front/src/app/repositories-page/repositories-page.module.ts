import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepositoriesPageComponent } from './repositories-page.component';
import { RepositoriesPageRoutingModule } from './repositories-page-routing.module';

@NgModule({
  declarations: [RepositoriesPageComponent],
  imports: [CommonModule, RepositoriesPageRoutingModule],
})
export class RepositoriesPageModule {}
