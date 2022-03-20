import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { MatButtonModule } from '@angular/material/button';
import { SidenavComponent } from './components/sidenav/sidenav.component';
import { ActivityComponent } from './components/activity/activity.component';
import { ImageSanitizedModule } from '../shared/directives/image-sanitized/image-sanitized.module';

@NgModule({
  declarations: [MainComponent, SidenavComponent, ActivityComponent],
  imports: [CommonModule, MainRoutingModule, MatButtonModule, ImageSanitizedModule],
})
export class MainModule {}
