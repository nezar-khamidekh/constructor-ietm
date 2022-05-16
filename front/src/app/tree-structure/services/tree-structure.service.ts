import { Injectable } from '@angular/core';
import { TreeStructureI } from 'src/app/shared/models/treeStructure.interface';

@Injectable()
export class TreeStructureService {
  constructor() {}

  generate(model: THREE.Object3D): TreeStructureI {
    const tree: TreeStructureI = {
      id: model.id,
      uuid: model.uuid,
      name: model.name || model.userData.name,
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
      name: node.name || node.userData.name,
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

  findNode(node: TreeStructureI, tree: TreeStructureI) {
    if (node.isRoot) return tree;
    const childNode = this.findChildNode(tree.children, node);
    return childNode ?? null;
  }

  findChildNode(array: TreeStructureI[], node: TreeStructureI): TreeStructureI | any {
    for (const child of array) {
      if (child.id === node.id) return child;
      if (child.children.length) {
        const childNode = this.findChildNode(child.children, node);
        if (childNode) return childNode;
      }
    }
  }
}
