import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageRoutingModule } from './page-routing.module';
import { PageComponent } from './page.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../shared/components/header/header.component';

@NgModule({
  declarations: [PageComponent, HeaderComponent],
  imports: [CommonModule, PageRoutingModule, MatToolbarModule, MatButtonModule],
})
export class PageModule {}
