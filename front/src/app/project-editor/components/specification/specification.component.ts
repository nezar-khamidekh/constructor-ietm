import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { SceneService } from 'src/app/scene/services/scene.service';

const LEVEL_PADDING_LEFT = 10;

@Component({
  selector: 'app-specification',
  templateUrl: './specification.component.html',
  styleUrls: ['./specification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecificationComponent implements OnInit {
  @Input() model: any;

  specification: any[] = [];

  constructor(public sceneService: SceneService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.model && !changes.model.firstChange) {
      this.sceneService.setItemStructureLevels([this.model]);
      this.specification = this.sceneService.getItemStructureTabular([this.model]);
      console.log(this.specification);
      this.cdr.detectChanges();
    }
  }

  getLevelPaddingLeft() {
    return LEVEL_PADDING_LEFT;
  }

  itemHasChild(itemId: number) {
    return this.specification.some((item: any) => {
      return item.parent.id === itemId;
    });
  }

  toggleItemIsExpanded(itemId: number) {
    const node = this.specification.find((node: any) => node.id === itemId);
    node.isExpanded = !node.isExpanded;
    this.toggleExpandChildren(node.children, node.isExpanded);
    this.specification = [...this.specification];
  }

  toggleExpandChildren(nodes: any[], isVisible: boolean) {
    nodes.forEach((node: any) => {
      node.isExpanded = false;
      node.isVisibleInSpec = isVisible;
      if (!isVisible && node.children?.length) this.toggleExpandChildren(node.children, isVisible);
    });
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
