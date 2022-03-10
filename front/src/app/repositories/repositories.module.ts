import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepositoriesComponent } from './repositories.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [RepositoriesComponent],
  imports: [CommonModule, MatButtonModule, RouterModule],
  exports: [RepositoriesComponent],
})
export class RepositoriesModule {}
