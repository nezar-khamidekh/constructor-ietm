import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectEditorRoutingModule } from './project-editor-routing.module';
import { SceneModule } from '../scene/scene.module';
import { ProjectEditorComponent } from './project-editor.component';
import { EditorStepComponent } from './components/editor-step/editor-step.component';
import { EditorViewerComponent } from './components/editor-viewer/editor-viewer.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatRippleModule } from '@angular/material/core';
import { EditorAnimationsComponent } from './components/editor-animations/editor-animations.component';
import { EditorAnnotationsComponent } from './components/editor-annotations/editor-annotations.component';
import { SpecificationComponent } from './components/specification/specification.component';
import { TreeElementsComponent } from './components/tree-elements/tree-elements.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTreeModule } from '@angular/material/tree';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UploadModelComponent } from './components/upload-model/upload-model.component';
import { StepButtonsComponent } from './components/step-buttons/step-buttons.component';
import { InitRepositoryComponent } from './components/init-repository/init-repository.component';
import { LoaderModule } from '../shared/loader/loader.module';

@NgModule({
  declarations: [
    ProjectEditorComponent,
    EditorStepComponent,
    EditorViewerComponent,
    EditorAnimationsComponent,
    EditorAnnotationsComponent,
    SpecificationComponent,
    TreeElementsComponent,
    UploadModelComponent,
    StepButtonsComponent,
    InitRepositoryComponent,
  ],
  imports: [
    CommonModule,
    ProjectEditorRoutingModule,
    SceneModule,
    MatTabsModule,
    MatSelectModule,
    MatSliderModule,
    MatRippleModule,
    MatButtonModule,
    FormsModule,
    MatTreeModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    LoaderModule,
  ],
})
export class ProjectEditorModule {}
