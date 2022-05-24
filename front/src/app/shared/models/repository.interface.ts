import { RepositoryType } from './repositoryTypeEnum';
import { ParticipantI } from './participant.interface';
import { ModelI } from './model.interface';
import { UserI } from './user.interface';
import { TeamI } from './team.interface';
import { TreeStructureI } from './treeStructure.interface';
import { SceneSettingsI } from './sceneSettingsI.interface';

export interface RepositoryI {
  _id: string;
  author: UserI;
  team?: TeamI;
  title: string;
  type: number;
  description: string;
  preview?: string;
  participants: ParticipantI[];
  models: ModelI[];
  modelTree: TreeStructureI | null;
  createdAt?: string;
  updatedAt?: string;
  sceneSettings: SceneSettingsI;
}
