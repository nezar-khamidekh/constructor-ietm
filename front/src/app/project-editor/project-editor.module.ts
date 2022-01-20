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
import { FormsModule } from '@angular/forms';
import { MatTreeModule } from '@angular/material/tree';

@NgModule({
  declarations: [
    ProjectEditorComponent,
    EditorStepComponent,
    EditorViewerComponent,
    EditorAnimationsComponent,
    EditorAnnotationsComponent,
    SpecificationComponent,
    TreeElementsComponent,
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
  ],
})
export class ProjectEditorModule {}
