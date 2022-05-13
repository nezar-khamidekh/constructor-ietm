import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RepositoryI } from 'src/app/shared/models/repository.interface';
import { RepositoryService } from 'src/app/shared/services/repository.service';

@Injectable({
  providedIn: 'root',
})
export class TeamRepositoriesResolverService implements Resolve<any> {
  constructor(private repositoryService: RepositoryService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<RepositoryI[]> {
    return this.repositoryService.getByTeam(route.paramMap.get('teamId')!);
  }
}
