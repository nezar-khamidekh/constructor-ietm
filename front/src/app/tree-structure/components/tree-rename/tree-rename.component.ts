import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TreeStructureI } from 'src/app/shared/models/treeStructure.interface';

interface DIALOG_DATA {
  node: TreeStructureI;
}

@Component({
  selector: 'app-tree-rename',
  templateUrl: './tree-rename.component.html',
  styleUrls: ['./tree-rename.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeRenameComponent implements OnInit {
  updatedName = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DIALOG_DATA,
    private dialogRef: MatDialogRef<TreeRenameComponent>,
  ) {}

  ngOnInit(): void {
    this.updatedName = this.data.node.viewName ?? this.data.node.name;
  }

  saveName() {
    if (this.updatedName) this.dialogRef.close({ ...this.data.node, viewName: this.updatedName });
    else this.dialogRef.close();
  }

  cancel() {
    this.dialogRef.close();
  }
}
