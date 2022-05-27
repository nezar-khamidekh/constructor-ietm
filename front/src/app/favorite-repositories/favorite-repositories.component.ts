import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubSink } from 'subsink';
import { RepositoryI } from '../shared/models/repository.interface';
import { DataStoreService } from '../shared/services/data-store.service';
import { RepositoryService } from '../shared/services/repository.service';

@Component({
  selector: 'app-favorite-repositories',
  templateUrl: './favorite-repositories.component.html',
  styleUrls: ['./favorite-repositories.component.scss'],
})
export class FavoriteRepositoriesComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  repositories: RepositoryI[] = [];

  constructor(
    private route: ActivatedRoute,
    private repositoryService: RepositoryService,
    private dataStore: DataStoreService,
  ) {}

  ngOnInit(): void {
    this.repositories = this.route.snapshot.data.repositories.map(
      (favoriteRepository: any) => favoriteRepository.repository,
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onRemoveFromFavorite(repositoryId: string) {
    this.subs.add(
      this.repositoryService
        .removeFromFavorite(repositoryId, this.dataStore.getUserValue()!._id)
        .subscribe((res) => {
          this.repositories = this.repositories.filter(
            (repository) => repository._id !== repositoryId,
          );
        }),
    );
  }
}
