import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { RepositoryI } from 'src/app/shared/models/repository.interface';
import { RepositoryService } from 'src/app/shared/services/repository.service';
@Injectable({
  providedIn: 'root',
})
export class RepositoryResolverService implements Resolve<any> {
  constructor(private repositoryService: RepositoryService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<RepositoryI | null> {
    return this.repositoryService.getById(route.paramMap.get('repoId')!).pipe(
      catchError((err) => {
        this.router.navigate(['main']);
        return of(null);
      }),
    );
  }
}
