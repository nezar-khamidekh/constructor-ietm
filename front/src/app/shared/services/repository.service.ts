import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CreateRepositoryDto } from '../models/createRepositoryDto.interface';
import { RepositoryI } from '../models/repository.interface';

@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  private apiUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  create(createRepositoryDto: CreateRepositoryDto): Observable<RepositoryI> {
    return this.http.post<RepositoryI>(`${this.apiUrl}/repository/create`, createRepositoryDto, {
      withCredentials: true,
    });
  }

  getAll(): Observable<RepositoryI[]> {
    return this.http.get<RepositoryI[]>(`${this.apiUrl}/repository/all`, {
      withCredentials: true,
    });
  }

  getByUser(userId: string): Observable<RepositoryI[]> {
    return this.http.get<RepositoryI[]>(`${this.apiUrl}/repository/user/${userId}`, {
      withCredentials: true,
    });
  }

  getByTeam(teamId: string): Observable<RepositoryI[]> {
    return this.http.get<RepositoryI[]>(`${this.apiUrl}/repository/team/${teamId}`, {
      withCredentials: true,
    });
  }
}
