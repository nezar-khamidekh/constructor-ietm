import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageRoutingModule } from './page-routing.module';
import { PageComponent } from './page.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { HeaderComponent } from '../shared/components/header/header.component';
import { SettingsComponent } from '../shared/components/settings/settings.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageSanitizedModule } from '../shared/directives/image-sanitized/image-sanitized.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [PageComponent, HeaderComponent, SettingsComponent],
  imports: [
    CommonModule,
    PageRoutingModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatTooltipModule,
    ReactiveFormsModule,
    ImageSanitizedModule,
    FormsModule,
    MatProgressBarModule,
  ],
})
export class PageModule {}
