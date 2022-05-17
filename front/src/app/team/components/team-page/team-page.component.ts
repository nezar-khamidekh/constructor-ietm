import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RepositoryI } from 'src/app/shared/models/repository.interface';
import { TeamI } from 'src/app/shared/models/team.interface';
import { DataStoreService } from 'src/app/shared/services/data-store.service';
import { SubSink } from 'subsink';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-team-page',
  templateUrl: './team-page.component.html',
  styleUrls: ['./team-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPageComponent implements OnInit {
  private subs = new SubSink();

  team!: TeamI;
  teamRepositories: RepositoryI[] = [];

  constructor(
    public dataStore: DataStoreService,
    private route: ActivatedRoute,
    private teamService: TeamService,
    private router: Router,
    private titleService: Title,
  ) {}

  ngOnInit(): void {
    console.log(this.route.snapshot.data.repositories);

    this.team = this.route.snapshot.data.team;
    this.teamRepositories = this.route.snapshot.data.repositories;

    this.titleService.setTitle(
      `Команда "${this.team.title}" | Конструктор интерактивных инструкций`,
    );
  }

  leaveFromTeam() {
    this.subs.add(
      this.teamService
        .removeParticipant({ teamId: this.team._id, userId: this.dataStore.getUserValue()!._id })
        .subscribe((res) => {
          this.router.navigate(['team', 'user-teams']);
        }),
    );
  }
}
