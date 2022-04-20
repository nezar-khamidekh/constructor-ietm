import { RepositoryType } from './repositoryTypeEnum';
import { ParticipantI } from './participant.interface';
import { ModelI } from './model.interface';
import { UserI } from './user.interface';

export interface RepositoryI {
  _id: string;
  author: UserI;
  team?: string;
  title: string;
  type: RepositoryType;
  description: string;
  preview?: string;
  participants: ParticipantI[];
  models: ModelI[];
  createdAt?: string;
  updatedAt?: string;
}
