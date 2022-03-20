import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { TeamI } from 'src/app/shared/models/team.interface';
import { TeamService } from '../services/team.service';

@Injectable({
  providedIn: 'root',
})
export class TeamResolverService implements Resolve<any> {
  constructor(private teamService: TeamService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<TeamI> {
    return this.teamService.getTeamById(route.paramMap.get('teamId')!);
  }
}
