import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeStructureService } from './services/tree-structure.service';
import { TreeStructureComponent } from './tree-structure.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { TreeRenameComponent } from './components/tree-rename/tree-rename.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [TreeStructureComponent, TreeRenameComponent],
  imports: [
    CommonModule,
    MatTreeModule,
    MatTooltipModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [TreeStructureComponent],
  providers: [TreeStructureService],
})
export class TreeStructureModule {}
