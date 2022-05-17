import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RepositoryI } from 'src/app/shared/models/repository.interface';
import { DataStoreService } from 'src/app/shared/services/data-store.service';
import { RepositoryService } from 'src/app/shared/services/repository.service';

@Injectable({
  providedIn: 'root',
})
export class TeamRepositoriesResolverService implements Resolve<any> {
  constructor(private repositoryService: RepositoryService, private dataStore: DataStoreService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<RepositoryI[]> {
    if (this.dataStore.getUserValue())
      return this.repositoryService.getByTeam(route.paramMap.get('teamId')!);
    return this.repositoryService.getByTeamPublic(route.paramMap.get('teamId')!);
  }
}
