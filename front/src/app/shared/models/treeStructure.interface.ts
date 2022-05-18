export interface TreeStructureI {
  id: number;
  objectId: string;
  name: string;
  children: TreeStructureI[];
  type: string;
  parent: {
    type: string;
  };
  isRoot?: boolean;
  viewName?: string;
}
