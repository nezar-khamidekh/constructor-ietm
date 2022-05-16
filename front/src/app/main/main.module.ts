import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { MatButtonModule } from '@angular/material/button';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ImageSanitizedModule } from '../shared/directives/image-sanitized/image-sanitized.module';
import { FormsModule } from '@angular/forms';
import { RepositoryByTitlePipe } from './pipes/repository-by-title.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { RepositoriesPageModule } from '../repositories-page/repositories-page.module';
import { PageStatusModule } from '../shared/modules/page-status/page-status.module';

@NgModule({
  declarations: [MainComponent, SidenavComponent, RepositoryByTitlePipe],
  imports: [
    CommonModule,
    MainRoutingModule,
    MatButtonModule,
    ImageSanitizedModule,
    FormsModule,
    MatMenuModule,
    RepositoriesPageModule,
    PageStatusModule,
  ],
})
export class MainModule {}
