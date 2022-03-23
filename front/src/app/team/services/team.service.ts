import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddParticipantDto } from 'src/app/shared/models/addParticipantDto.interface';
import { CreateTeamDto } from 'src/app/shared/models/createTeamDto.interface';
import { TeamI } from 'src/app/shared/models/team.interface';
import { UpdateTeamDto } from 'src/app/shared/models/updateTeamDto.interface';
import { UserEntryDto } from 'src/app/shared/models/userEntryDto.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  apiUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  createTeam(createTeamDto: CreateTeamDto): Observable<TeamI> {
    return this.http.post<TeamI>(`${this.apiUrl}/team/create`, createTeamDto, {
      withCredentials: true,
    });
  }

  updateTeam(updateTeamDto: UpdateTeamDto) {
    return this.http.post(`${this.apiUrl}/team/update`, updateTeamDto, {
      withCredentials: true,
    });
  }

  getUserTeams(userEntryDto: UserEntryDto): Observable<TeamI[]> {
    return this.http.post<TeamI[]>(`${this.apiUrl}/team/user`, userEntryDto, {
      withCredentials: true,
    });
  }

  getTeamById(id: string): Observable<TeamI> {
    return this.http.get<TeamI>(`${this.apiUrl}/team/one/${id}`, { withCredentials: true });
  }

  sendInvitation(addParticipantDto: AddParticipantDto) {
    return this.http.post(`${this.apiUrl}/team/participant/add`, addParticipantDto, {
      withCredentials: true,
    });
  }
}
