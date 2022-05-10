import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { SceneService } from '../scene/services/scene.service';
import { TreeStructureI } from '../shared/models/treeStructure.interface';

@Component({
  selector: 'app-tree-structure',
  templateUrl: './tree-structure.component.html',
  styleUrls: ['./tree-structure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeStructureComponent implements OnInit {
  @Input() tree: TreeStructureI;

  treeControl = new NestedTreeControl((node: any) => node.children);
  dataSource = new MatTreeNestedDataSource<TreeStructureI>();

  hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;

  constructor(public sceneService: SceneService) {}

  ngOnInit(): void {
    this.dataSource.data = [this.tree];
  }

  objectIsHidden(name: string, hiddenObjects: any[]) {
    return hiddenObjects.some((obj) => obj.name === this.sceneService.replacedNameNode(name));
  }

  toggleObjectVisibility(node: any) {
    this.sceneService.toggleObjectVisibilityById(node.name);
  }

  fitToObject(node: any) {
    this.sceneService.fitToView(node.name, () => {});
  }
}
