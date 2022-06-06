import { Location } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogChooseImageComponent } from 'src/app/dialogs/dialog-choose-image/dialog-choose-image.component';
import { isEmail } from 'src/app/shared/helpers/helpers';
import { AddParticipantDto } from 'src/app/shared/models/addParticipantDto.interface';
import { ParticipantRole } from 'src/app/shared/models/participant.interface';
import { PARTICIPANT_ROLES } from 'src/app/shared/models/participantRoles';
import { TeamI } from 'src/app/shared/models/team.interface';
import { UserI } from 'src/app/shared/models/user.interface';
import { DataStoreService } from 'src/app/shared/services/data-store.service';
import { SubSink } from 'subsink';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'app-manage-team',
  templateUrl: './manage-team.component.html',
  styleUrls: ['./manage-team.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageTeamComponent implements OnInit {
  private subs = new SubSink();

  teamFormGroup: FormGroup;
  teamAvatar: string;
  editMode = false;
  teamToEdit: TeamI | null = null;

  user!: UserI;
  hasAccess = false;

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private teamService: TeamService,
    private dataStore: DataStoreService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private titleService: Title,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.data.team) {
      this.editMode = true;
      this.teamToEdit = this.route.snapshot.data.team;
      this.teamAvatar = this.teamToEdit?.avatar || '';

      this.titleService.setTitle(
        `Редактирование команды "${this.teamToEdit!.title}" | Конструктор интерактивных инструкций`,
      );
    }

    this.subs.add(
      this.dataStore.getUser().subscribe((user) => {
        this.user = user;

        if (this.editMode) {
          const roles: number[] = this.route.snapshot.data.roles;
          const userRole = this.teamToEdit!.participants?.find(
            (participant) => participant.user._id === this.user._id,
          )?.role;

          if (typeof userRole === 'undefined' || !roles.includes(userRole)) {
            this.router.navigate(['/main']);
            this.snackBar.open('Недостаточно прав', '', {
              duration: 5000,
              panelClass: 'errorSnack',
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
          } else this.hasAccess = true;
        } else this.hasAccess = true;
      }),
    );

    this.teamFormGroup = this.fb.group({
      team: this.fb.group({
        title: [
          !this.editMode ? '' : this.teamToEdit?.title,
          [Validators.required, Validators.maxLength(200)],
        ],
        avatar: [!this.editMode ? '' : this.teamToEdit?.avatar, []],
        description: [
          !this.editMode ? '' : this.teamToEdit?.description,
          [Validators.required, Validators.maxLength(2000)],
        ],
      }),
      newParticipant: this.fb.group({
        username: ['', Validators.required],
        role: ['', Validators.required],
      }),
      participants: this.fb.array(!this.editMode ? [] : this.teamToEdit?.participants!),
    });
  }

  getParticipantRoles() {
    return PARTICIPANT_ROLES.slice(1, PARTICIPANT_ROLES.length);
  }

  getParticipantRoleEnum() {
    return ParticipantRole;
  }

  openDialogChooseImage(): void {
    const dialogRef = this.dialog.open(DialogChooseImageComponent, {
      width: '530px',
      height: '450px',
      autoFocus: false,
      data: {
        viewport: {
          width: 128,
          height: 128,
          type: 'circle',
        },
        boundary: {
          width: 180,
          height: 230,
        },
      },
    });

    this.subs.add(
      dialogRef.afterClosed().subscribe((result: { imageUrl: string; image: any }) => {
        if (result) {
          this.teamAvatar = result.image;
          this.teamFormGroup.get('team')?.patchValue({
            avatar: result.imageUrl,
          });
          this.cdr.detectChanges();
        }
      }),
    );
  }

  sendInvitation() {
    if (this.teamFormGroup.get('newParticipant')?.valid) {
      const username = this.teamFormGroup.get(['newParticipant', 'username'])?.value;
      const email = isEmail(username) ? username : null;
      const sendInvitationData: AddParticipantDto = {
        teamId: this.teamToEdit?._id!,
        role: this.teamFormGroup.get(['newParticipant', 'role'])?.value,
      };
      if (email) {
        sendInvitationData.email = email;
      } else {
        sendInvitationData.login = email ? '' : username;
      }

      this.subs.add(
        this.teamService.sendInvitation(sendInvitationData).subscribe((addedParticipant) => {
          const newParticipant = {
            login: addedParticipant.login,
            role: this.teamFormGroup.get(['newParticipant', 'role'])?.value,
            user: {
              avatar: addedParticipant.avatar || '',
              email: addedParticipant.email,
              firstName: addedParticipant.firstName,
              lastName: addedParticipant.lastName,
              _id: addedParticipant._id,
            },
          };
          this.teamFormGroup.get('newParticipant')?.setValue({
            username: '',
            role: '',
          });
          this.teamToEdit!.participants = [...this.teamToEdit!.participants!, newParticipant];
          (<FormArray>this.teamFormGroup.get('participants'))?.push(
            this.fb.control(newParticipant),
          );
          this.cdr.detectChanges();
        }),
      );
    } else
      this.snackBar.open('Проверьте корректность введенных данных', 'Ошибка', {
        duration: 5000,
        panelClass: 'errorSnack',
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
  }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    const teamGroup = this.teamFormGroup.get('team')!;
    if (teamGroup.valid) {
      if (!this.editMode)
        this.subs.add(
          this.teamService
            .createTeam({ ...teamGroup.value, creatorId: this.user._id })
            .subscribe((res) => {
              this.router.navigate(['/team', res._id]);
            }),
        );
      else {
        this.subs.add(
          this.teamService
            .updateTeam({
              _id: this.teamToEdit?._id,
              ...teamGroup.value,
            })
            .subscribe((res) => {
              this.teamToEdit!.title = teamGroup.get('title')!.value;
              this.cdr.detectChanges();
            }),
        );
      }
    } else
      this.snackBar.open('Проверьте корректность введенных данных', 'Ошибка', {
        duration: 5000,
        panelClass: 'errorSnack',
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
  }

  onRemoveParticipant(userId: string) {
    this.subs.add(
      this.teamService
        .removeParticipant({ teamId: this.teamToEdit?._id!, userId: userId })
        .subscribe((res) => {
          this.teamToEdit!.participants = this.teamToEdit!.participants!.filter(
            (participant) => participant.user._id !== userId,
          );
          this.teamFormGroup.setControl(
            'participants',
            this.fb.array(this.teamToEdit!.participants),
          );
          this.cdr.detectChanges();
        }),
    );
  }

  onUpdateParticipant(data: { userId: string; role: number }) {
    this.subs.add(
      this.teamService
        .updateParticipant({ ...data, teamId: this.teamToEdit?._id! })
        .subscribe((res) => {}),
    );
  }
}
