import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { RepositoryI } from 'src/app/shared/models/repository.interface';
import { RepositoryService } from 'src/app/shared/services/repository.service';
@Injectable({
  providedIn: 'root',
})
export class RepositoryResolverService implements Resolve<any> {
  constructor(private repositoryService: RepositoryService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<RepositoryI> {
    return this.repositoryService.getById(route.paramMap.get('repoId')!);
  }
}
