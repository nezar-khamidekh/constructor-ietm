import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { RepositoryI } from 'src/app/shared/models/repository.interface';
import { RepositoryService } from 'src/app/shared/services/repository.service';

@Injectable({
  providedIn: 'root',
})
export class PublicRepositoriesResolverService implements Resolve<any> {
  constructor(private repositoryService: RepositoryService) {}

  resolve(): Observable<RepositoryI[]> {
    return this.repositoryService.getAll();
  }
}
