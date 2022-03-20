import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { TeamI } from 'src/app/shared/models/team.interface';
import { DataStoreService } from 'src/app/shared/services/data-store.service';
import { TeamService } from '../services/team.service';

@Injectable({
  providedIn: 'root',
})
export class UserTeamsResolverService implements Resolve<any> {
  constructor(private teamService: TeamService, private dataStore: DataStoreService) {}

  resolve(): Observable<TeamI[]> {
    return this.teamService.getUserTeams({ userId: this.dataStore.getUserValue()?._id });
  }
}
