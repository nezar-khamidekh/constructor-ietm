export interface TreeStructureI {
  id: number;
  uuid: string;
  name: string;
  children: TreeStructureI[];
  type: string;
  parent: {
    type: string;
  };
  isRoot?: boolean;
}
