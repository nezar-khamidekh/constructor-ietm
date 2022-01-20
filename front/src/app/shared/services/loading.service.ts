import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private isLoading = new BehaviorSubject<boolean>(false);

  constructor() {}

  getIsLoading(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  setIsLoading(value: boolean) {
    this.isLoading.next(value);
  }
}
