import { Pipe, PipeTransform } from '@angular/core';
import { RepositoryI } from 'src/app/shared/models/repository.interface';

@Pipe({
  name: 'repositoryByTitle',
})
export class RepositoryByTitlePipe implements PipeTransform {
  transform(repositories: RepositoryI[], title: string): RepositoryI[] {
    if (!title) return repositories;
    return repositories.filter((repository) =>
      repository.title.toLowerCase().includes(title.toLowerCase()),
    );
  }
}
