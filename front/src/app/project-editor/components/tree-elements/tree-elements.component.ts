import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, ChangeDetectionStrategy, Input, SimpleChanges } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { SceneService } from 'src/app/scene/services/scene.service';

@Component({
  selector: 'app-tree-elements',
  templateUrl: './tree-elements.component.html',
  styleUrls: ['./tree-elements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeElementsComponent implements OnInit {
  @Input() model: any;

  treeControl = new NestedTreeControl((node: any) => node.children);
  dataSource = new MatTreeNestedDataSource();

  hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;

  constructor(public sceneService: SceneService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.model && !changes.model.firstChange) {
      this.dataSource.data = [this.model];
    }
  }

  objectIsHidden(id: number, hiddenObjects: any[]) {
    return hiddenObjects.some((obj) => obj.id === id);
  }

  toggleObjectVisibility(node: any) {
    this.sceneService.toggleObjectVisibilityById(node.id);
  }

  fitToObject(node: any) {
    this.sceneService.fitToView(node.id);
  }
}
