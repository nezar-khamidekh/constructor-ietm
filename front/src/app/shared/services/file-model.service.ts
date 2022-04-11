import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RepositoryI } from '../models/repository.interface';

@Injectable({
  providedIn: 'root',
})
export class FileModelService {
  private apiUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  upload(data: any): Observable<RepositoryI> {
    return this.http.post<RepositoryI>(`${this.apiUrl}/repository/model/add`, data, {
      withCredentials: true,
    });
  }
}
