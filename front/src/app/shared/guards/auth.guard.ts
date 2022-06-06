import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { DataStoreService } from '../services/data-store.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private dataStore: DataStoreService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    if (this.dataStore.getUserValue()) {
      if (state.url.startsWith('/auth')) {
        this.router.navigate(['/main']);
        return of(false);
      }
      return of(true);
    } else {
      return this.authService.isAuthenticated().pipe(
        map((isAuthenticated: boolean) => {
          if (state.url.startsWith('/auth')) {
            this.router.navigate(['/main']);
            return false;
          }
          return true;
        }),
        catchError((err) => {
          console.log(err);
          if (state.url.startsWith('/auth')) {
            return of(true);
          } else {
            this.router.navigate(['/main']);
            return of(false);
          }
        }),
      );
    }
  }
}
