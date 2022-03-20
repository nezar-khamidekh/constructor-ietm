import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamI } from 'src/app/shared/models/team.interface';
import { DataStoreService } from 'src/app/shared/services/data-store.service';

@Component({
  selector: 'app-teams-list',
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsListComponent implements OnInit {
  teams: TeamI[] = [];

  constructor(
    private route: ActivatedRoute,
    public dataStore: DataStoreService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.teams = this.route.snapshot.data.teams;
  }

  onNavigateToTeam(teamId: string) {
    this.router.navigate(['/team', teamId]);
  }

  onLeaveTeam(e: any) {
    e.stopPropagation();
  }
}
