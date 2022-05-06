import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { DataStoreService } from 'src/app/shared/services/data-store.service';
import { RepositoryService } from 'src/app/shared/services/repository.service';
@Injectable({
  providedIn: 'root',
})
export class RepositoryIsInFavoriteResolverService implements Resolve<any> {
  constructor(private repositoryService: RepositoryService, private dataStore: DataStoreService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.dataStore.getUserValue()
      ? this.repositoryService.checkIsInFavorite(
          route.paramMap.get('repoId')!,
          this.dataStore.getUserValue()?._id!,
        )
      : of(false);
  }
}
