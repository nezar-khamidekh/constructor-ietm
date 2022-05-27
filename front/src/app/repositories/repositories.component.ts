import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { RepositoryI } from '../shared/models/repository.interface';
import { RepositoryType } from '../shared/models/repositoryTypeEnum';
import { UserI } from '../shared/models/user.interface';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
  styleUrls: ['./repositories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepositoriesComponent {
  @Input() repositories: RepositoryI[] = [];
  @Input() withFavorite = false;
  @Output() removeFromFavorite = new EventEmitter();

  constructor() {}

  getRepositoryTypeEnum() {
    return RepositoryType;
  }

  getAuthorLastFirsName(author: UserI) {
    return `(${author.lastName[0].toUpperCase()}${author.lastName.slice(
      1,
    )} ${author.firstName[0].toUpperCase()}${author.firstName.slice(1)})`;
  }

  onRemoveRepository(e: any, repositoryId: string) {
    e.preventDefault();
    e.stopPropagation();
    this.removeFromFavorite.emit(repositoryId);
  }
}
