import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { RepositoryI } from '../models/repository.interface';
import { DataStoreService } from '../services/data-store.service';
import { RepositoryService } from '../services/repository.service';

@Injectable({
  providedIn: 'root',
})
export class UserRepositoriesResolverService implements Resolve<any> {
  constructor(private repositoryService: RepositoryService, private dataStore: DataStoreService) {}

  resolve(): Observable<RepositoryI[]> {
    const user = this.dataStore.getUserValue();
    if (user) return this.repositoryService.getByUser(user._id);
    else return of([]);
  }
}
