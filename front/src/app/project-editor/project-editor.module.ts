import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectEditorRoutingModule } from './project-editor-routing.module';
import { SceneModule } from '../scene/scene.module';
import { ProjectEditorComponent } from './project-editor.component';
import { EditorStepComponent } from './components/editor-step/editor-step.component';
import { EditorViewerComponent } from './components/editor-viewer/editor-viewer.component';

@NgModule({
  declarations: [ProjectEditorComponent, EditorStepComponent, EditorViewerComponent],
  imports: [CommonModule, ProjectEditorRoutingModule, SceneModule],
})
export class ProjectEditorModule {}
