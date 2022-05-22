import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DialogConfirmActionComponent } from 'src/app/dialogs/dialog-confirm-action/dialog-confirm-action.component';
import { ParticipantRole } from 'src/app/shared/models/participant.interface';
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
export class TeamPageComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  team!: TeamI;
  teamRepositories: RepositoryI[] = [];

  constructor(
    public dataStore: DataStoreService,
    private route: ActivatedRoute,
    private teamService: TeamService,
    private router: Router,
    private titleService: Title,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.team = this.route.snapshot.data.team;
    this.teamRepositories = this.route.snapshot.data.repositories;

    this.titleService.setTitle(
      `Команда "${this.team.title}" | Конструктор интерактивных инструкций`,
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getParticipantRoleEnum() {
    return ParticipantRole;
  }

  removeTeam() {
    const dialogRef = this.dialog.open(DialogConfirmActionComponent, {
      width: '450px',
      data: { message: `Вы действительно хотите удалить команду "${this.team.title}"?` },
      autoFocus: false,
    });

    this.subs.add(
      dialogRef
        .afterClosed()
        .pipe(
          switchMap((result: { status: boolean }) => {
            if (result.status) return this.teamService.removeTeam(this.team._id);
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res !== null) {
            this.router.navigate(['team', 'user-teams']);
          }
        }),
    );
  }

  leaveFromTeam() {
    const dialogRef = this.dialog.open(DialogConfirmActionComponent, {
      width: '450px',
      data: { message: `Вы действительно хотите покинуть команду "${this.team.title}"?` },
      autoFocus: false,
    });

    this.subs.add(
      dialogRef
        .afterClosed()
        .pipe(
          switchMap((result: { status: boolean }) => {
            if (result.status)
              return this.teamService.removeParticipant({
                teamId: this.team._id,
                userId: this.dataStore.getUserValue()!._id,
              });
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res !== null) {
            this.router.navigate(['team', 'user-teams']);
          }
        }),
    );
  }
}
