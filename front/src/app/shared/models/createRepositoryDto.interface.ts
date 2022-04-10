import { RepositoryType } from './repositoryTypeEnum';

export interface CreateRepositoryDto {
  author: string;
  team?: string;
  title: string;
  type: RepositoryType;
  description?: string;
  preview?: string;
}
