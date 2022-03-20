import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamI } from 'src/app/shared/models/team.interface';

@Component({
  selector: 'app-team-page',
  templateUrl: './team-page.component.html',
  styleUrls: ['./team-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPageComponent implements OnInit {
  team!: TeamI;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.team = this.route.snapshot.data.team;
  }
}
