import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserI } from '../models/user.interface';
import { UserUpdateI } from '../models/userUpdate.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getUser(): Observable<UserI> {
    return this.http.get<UserI>(`${this.apiUrl}/user`, { withCredentials: true });
  }

  updateUser(user: UserUpdateI) {
    return this.http.post(`${this.apiUrl}/user/update`, user, { withCredentials: true });
  }
}
