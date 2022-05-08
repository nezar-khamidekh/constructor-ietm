import { Injectable } from '@angular/core';
import { TreeStructureI } from 'src/app/shared/models/treeStructure.interface';

@Injectable()
export class TreeStructureService {
  constructor() {}

  generate(model: THREE.Object3D): TreeStructureI {
    const tree: TreeStructureI = {
      id: model.id,
      uuid: model.uuid,
      name: model.userData.name || model.name,
      children: [],
      type: model.type,
      parent: {
        type: model.parent?.type!,
      },
      isRoot: true,
    };
    model.children
      .filter((child) => child.type !== 'Sprite')
      .forEach((child) => {
        tree.children.push(this.generateNode(child));
      });
    return tree;
  }

  generateNode(node: any): TreeStructureI {
    const treeNode: TreeStructureI = {
      id: node.id,
      uuid: node.uuid,
      name: node.userData.name || node.name,
      children: [],
      type: node.type,
      parent: {
        type: node.parent?.type!,
      },
    };
    if (node.children.length) {
      node.children
        .filter((child: any) => child.type !== 'Sprite')
        .forEach((child: any) => {
          treeNode.children.push(this.generateNode(child));
        });
    }
    return treeNode;
  }
}
