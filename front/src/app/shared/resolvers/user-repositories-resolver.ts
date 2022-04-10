import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { RepositoryI } from '../models/repository.interface';
import { DataStoreService } from '../services/data-store.service';
import { RepositoryService } from '../services/repository.service';

@Injectable({
  providedIn: 'root',
})
export class UserRepositoriesResolverService implements Resolve<any> {
  constructor(private repositoryService: RepositoryService, private dataStore: DataStoreService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<RepositoryI[]> {
    return this.repositoryService.getByUser(this.dataStore.getUserValue()?._id!);
  }
}
