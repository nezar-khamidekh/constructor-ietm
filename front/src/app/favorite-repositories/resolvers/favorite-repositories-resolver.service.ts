import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { RepositoryI } from 'src/app/shared/models/repository.interface';
import { DataStoreService } from 'src/app/shared/services/data-store.service';
import { RepositoryService } from 'src/app/shared/services/repository.service';

@Injectable({
  providedIn: 'root',
})
export class FavoriteRepositoriesResolverService implements Resolve<any> {
  constructor(private repositoryService: RepositoryService, private dataStore: DataStoreService) {}

  resolve(): Observable<RepositoryI[]> {
    return this.repositoryService.getFavorite(this.dataStore.getUserValue()?._id!);
  }
}
