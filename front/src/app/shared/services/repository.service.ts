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

  getPublic(): Observable<RepositoryI[]> {
    return this.http.get<RepositoryI[]>(`${this.apiUrl}/repository/all-public`, {
      withCredentials: true,
    });
  }

  getById(id: string): Observable<RepositoryI> {
    return this.http.get<RepositoryI>(`${this.apiUrl}/repository/one/${id}`, {
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

  getByTeamPublic(teamId: string): Observable<RepositoryI[]> {
    return this.http.get<RepositoryI[]>(`${this.apiUrl}/repository/team-public/${teamId}`, {
      withCredentials: true,
    });
  }

  getFavorite(userId: string): Observable<RepositoryI[]> {
    return this.http.get<RepositoryI[]>(`${this.apiUrl}/repository/favorite/user/${userId}`, {
      withCredentials: true,
    });
  }

  update(data: any) {
    return this.http.post(`${this.apiUrl}/repository/update`, data, {
      withCredentials: true,
    });
  }

  remove(repoId: string) {
    return this.http.get(`${this.apiUrl}/repository/delete/${repoId}`, {
      withCredentials: true,
    });
  }

  addToFavorite(repoId: string, userId: string) {
    return this.http.post(
      `${this.apiUrl}/repository/favorite/add`,
      { repoId: repoId, userId: userId },
      {
        withCredentials: true,
      },
    );
  }

  removeFromFavorite(repoId: string, userId: string) {
    return this.http.post(
      `${this.apiUrl}/repository/favorite/remove`,
      { repoId: repoId, userId: userId },
      {
        withCredentials: true,
      },
    );
  }

  checkIsInFavorite(repoId: string, userId: string): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.apiUrl}/repository/favorite/check`,
      { repoId: repoId, userId: userId },
      {
        withCredentials: true,
      },
    );
  }

  find(query: string): Observable<RepositoryI[]> {
    return this.http.post<RepositoryI[]>(
      `${this.apiUrl}/repository/search`,
      { queryStr: query },
      {
        withCredentials: true,
      },
    );
  }
}
