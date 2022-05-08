import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TeamI } from 'src/app/shared/models/team.interface';
import { TeamService } from '../services/team.service';

@Injectable({
  providedIn: 'root',
})
export class TeamResolverService implements Resolve<any> {
  constructor(private teamService: TeamService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<TeamI | null> {
    return this.teamService.getTeamById(route.paramMap.get('teamId')!).pipe(
      catchError((err) => {
        this.router.navigate(['main']);
        return of(null);
      }),
    );
  }
}
