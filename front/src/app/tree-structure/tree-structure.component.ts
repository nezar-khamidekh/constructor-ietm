import { NestedTreeControl } from '@angular/cdk/tree';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  SimpleChanges,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { SubSink } from 'subsink';
import { SceneService } from '../scene/services/scene.service';
import { TreeStructureI } from '../shared/models/treeStructure.interface';
import { TreeRenameComponent } from './components/tree-rename/tree-rename.component';
import { TreeStructureService } from './services/tree-structure.service';

@Component({
  selector: 'app-tree-structure',
  templateUrl: './tree-structure.component.html',
  styleUrls: ['./tree-structure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeStructureComponent implements OnInit {
  private subs = new SubSink();

  @Input() tree: TreeStructureI;
  @Input() viewMode: boolean;

  @Output() updateTree = new EventEmitter();

  @ViewChildren('treeNode') treeNodesRef: QueryList<ElementRef>;

  treeControl = new NestedTreeControl((node: any) => node.children);
  dataSource = new MatTreeNestedDataSource<TreeStructureI>();
  expandedNodes: any = [];

  selectedTreeNodeObjectId = '';

  hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;

  constructor(
    public sceneService: SceneService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private treeStructure: TreeStructureService,
  ) {}

  ngOnInit(): void {
    this.dataSource.data = [this.tree];
    this.treeControl.expand(this.dataSource.data[0]);
  }

  ngAfterViewInit(): void {
    this.subs.add(
      this.treeStructure.getSelectedTreeNodeObjectId().subscribe((res) => {
        this.selectedTreeNodeObjectId = res;
        if (this.selectedTreeNodeObjectId) {
          const node = this.treeNodesRef
            .toArray()
            .find((el) => el.nativeElement.id === this.selectedTreeNodeObjectId);
          this.expand(this.dataSource.data, this.selectedTreeNodeObjectId);
          setTimeout(() => {
            node?.nativeElement.scrollIntoView({ behavior: 'smooth' });
          }, 0);
          this.cdr.detectChanges();
        }
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tree && !changes.tree.firstChange) {
      this.dataSource.data = [this.tree];
      this.treeControl.expand(this.dataSource.data[0]);
      this.cdr.detectChanges();
    }
  }

  objectIsHidden(objectId: string, hiddenObjects: any[]) {
    return hiddenObjects.some((obj) => obj.objectId === objectId);
  }

  toggleObjectVisibility(node: any) {
    this.sceneService.toggleObjectVisibilityById(node.objectId);
  }

  fitToObject(node: any) {
    this.sceneService.fitToView(node.objectId, () => {});
  }

  renameElement(node: TreeStructureI) {
    const dialogRef = this.dialog.open(TreeRenameComponent, {
      width: '300px',
      data: { node: node },
    });
    this.subs.add(
      dialogRef.afterClosed().subscribe((result: TreeStructureI) => {
        if (result) {
          const treeNode = this.treeStructure.findNode(result, this.tree)!;
          treeNode.viewName = result.viewName;
          this.expandedNodes = [];
          this.dataSource.data.forEach((node: any) => {
            if (node.expandable && this.treeControl.isExpanded(node)) {
              this.expandedNodes.push(node);
            }
          });
          this.updateTree.emit(this.tree);
        }
      }),
    );
  }

  expand(data: TreeStructureI[], objectId: string): any {
    data.forEach((node) => {
      if (node.children && node.children.find((c) => c.objectId === objectId)) {
        this.treeControl.expand(node);
        this.expand(this.dataSource.data, node.objectId);
      } else if (node.children && node.children.find((c) => c.children)) {
        this.expand(node.children, objectId);
      }
    });
  }
}
