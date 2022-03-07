import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserI } from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class DataStoreService {
  private user: BehaviorSubject<any>;

  constructor() {
    this.user = new BehaviorSubject(null);
  }

  getUser(): Observable<UserI> {
    return this.user.asObservable();
  }

  getUserValue(): UserI | null {
    return this.user.value;
  }

  setUser(user: UserI | null) {
    this.user.next(user);
  }
}
