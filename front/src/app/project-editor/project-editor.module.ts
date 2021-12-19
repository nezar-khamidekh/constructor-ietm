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
import { SpecificationsComponent } from './components/specifications/specifications.component';
import { TreeElementsComponent } from './components/tree-elements/tree-elements.component';

@NgModule({
  declarations: [ProjectEditorComponent, EditorStepComponent, EditorViewerComponent, EditorAnimationsComponent, EditorAnnotationsComponent, SpecificationsComponent, TreeElementsComponent],
  imports: [
    CommonModule,
    ProjectEditorRoutingModule,
    SceneModule,
    MatTabsModule,
    MatSelectModule,
    MatSliderModule,
    MatRippleModule,
  ],
})
export class ProjectEditorModule {}
