import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserI } from '../models/user.interface';
import { DataStoreService } from '../services/data-store.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class UserResolverService implements Resolve<any> {
  constructor(private userService: UserService, private dataStore: DataStoreService) {}

  resolve(): Observable<UserI | null> {
    if (!this.dataStore.getUserValue())
      return this.userService.getUser().pipe(
        switchMap((user) => {
          this.dataStore.setUser(user);
          return of(user);
        }),
        catchError((err) => {
          return of(null);
        }),
      );
    else return of(null);
  }
}
