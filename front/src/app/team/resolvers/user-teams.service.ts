import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TeamI } from 'src/app/shared/models/team.interface';
import { DataStoreService } from 'src/app/shared/services/data-store.service';
import { TeamService } from '../services/team.service';

@Injectable({
  providedIn: 'root',
})
export class UserTeamsResolverService implements Resolve<any> {
  constructor(private teamService: TeamService, private dataStore: DataStoreService) {}

  resolve(): Observable<TeamI[]> {
    const user = this.dataStore.getUserValue();
    if (user) return this.teamService.getUserTeams({ userId: user._id });
    else return of([]);
  }
}
