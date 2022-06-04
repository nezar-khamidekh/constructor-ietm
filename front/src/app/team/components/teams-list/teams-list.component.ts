import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DialogConfirmActionComponent } from 'src/app/dialogs/dialog-confirm-action/dialog-confirm-action.component';
import { ParticipantRole } from 'src/app/shared/models/participant.interface';
import { TeamI } from 'src/app/shared/models/team.interface';
import { DataStoreService } from 'src/app/shared/services/data-store.service';
import { SubSink } from 'subsink';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-teams-list',
  templateUrl: './teams-list.component.html',
  styleUrls: ['./teams-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsListComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  teams: TeamI[] = [];

  constructor(
    private route: ActivatedRoute,
    public dataStore: DataStoreService,
    private router: Router,
    public dialog: MatDialog,
    private teamService: TeamService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.teams = this.route.snapshot.data.teams;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getParticipantRoleEnum() {
    return ParticipantRole;
  }

  onNavigateToTeam(teamId: string) {
    this.router.navigate(['/team', teamId]);
  }

  onLeaveTeam(e: any, teamRemoveFrom: TeamI) {
    e.stopPropagation();

    const dialogRef = this.dialog.open(DialogConfirmActionComponent, {
      width: '450px',
      data: { message: `Вы действительно хотите покинуть команду "${teamRemoveFrom.title}"?` },
      autoFocus: false,
    });

    this.subs.add(
      dialogRef
        .afterClosed()
        .pipe(
          switchMap((result: { status: boolean }) => {
            if (result.status)
              return this.teamService.removeParticipant({
                teamId: teamRemoveFrom._id,
                userId: this.dataStore.getUserValue()!._id,
              });
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res !== null) {
            this.teams = this.teams.filter((team) => team._id !== teamRemoveFrom._id);
            this.cdr.detectChanges();
          }
        }),
    );
  }
}
