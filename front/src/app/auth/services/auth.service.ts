import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserCreateI } from 'src/app/shared/interfaces/userCreate.interface';
import { UserCredsI } from 'src/app/shared/interfaces/userCreds.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  login(user: UserCredsI) {
    return this.http.post(`${this.apiUrl}/user/login`, user, {
      observe: 'response',
      withCredentials: true,
    });
  }

  isAuthenticated(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/user/is_auth`, { withCredentials: true });
  }

  register(user: UserCreateI) {
    return this.http.post(`${this.apiUrl}/user/register`, user, {
      observe: 'response',
      withCredentials: true,
    });
  }

  logout() {
    return this.http.get(`${this.apiUrl}/user/logout`, { withCredentials: true });
  }
}