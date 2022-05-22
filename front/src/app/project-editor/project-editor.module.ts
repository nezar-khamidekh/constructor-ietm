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
import { EditorAnnotationsComponent } from './components/editor-annotations/editor-annotations.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTreeModule } from '@angular/material/tree';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UploadModelComponent } from './components/upload-model/upload-model.component';
import { StepButtonsComponent } from './components/step-buttons/step-buttons.component';
import { InitRepositoryComponent } from './components/init-repository/init-repository.component';
import { LoaderModule } from '../shared/loader/loader.module';
import { DialogChooseImageModule } from '../dialogs/dialog-choose-image/dialog-choose-image.module';
import { DndDirective } from './directives/dnd.directive';
import { EditorManualComponent } from './components/editor-manual/editor-manual.component';
import { TreeStructureModule } from '../tree-structure/tree-structure.module';
import { EditorInstructionsComponent } from './components/editor-instructions/editor-instructions.component';
import { InstructionComponent } from './components/instruction/instruction.component';
import { StepActionComponent } from './components/step-action/step-action.component';

@NgModule({
  declarations: [
    ProjectEditorComponent,
    EditorStepComponent,
    EditorViewerComponent,
    EditorAnnotationsComponent,
    UploadModelComponent,
    StepButtonsComponent,
    InitRepositoryComponent,
    DndDirective,
    EditorManualComponent,
    EditorInstructionsComponent,
    InstructionComponent,
    StepActionComponent,
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
    MatTreeModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    LoaderModule,
    DialogChooseImageModule,
    TreeStructureModule,
  ],
})
export class ProjectEditorModule {}
