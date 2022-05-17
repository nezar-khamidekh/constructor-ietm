import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { RepositoryI } from 'src/app/shared/models/repository.interface';
import { RepositoryService } from 'src/app/shared/services/repository.service';

@Injectable({
  providedIn: 'root',
})
export class PublicRepositoriesResolverService implements Resolve<any> {
  constructor(private repositoryService: RepositoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<RepositoryI[]> {
    if (route.queryParams.searchQuery) {
      return this.repositoryService.find(route.queryParams.searchQuery);
    }
    return this.repositoryService.getPublic();
  }
}
