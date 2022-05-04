import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { RepositoryI } from '../shared/models/repository.interface';
import { RepositoryType } from '../shared/models/repositoryTypeEnum';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
  styleUrls: ['./repositories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepositoriesComponent implements OnInit {
  @Input() repositories: RepositoryI[] = [];

  constructor() {}

  ngOnInit(): void {}

  getRepositoryTypeEnum() {
    return RepositoryType;
  }
}
