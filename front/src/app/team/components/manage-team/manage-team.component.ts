import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogChooseImageComponent } from 'src/app/dialogs/dialog-choose-image/dialog-choose-image.component';
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

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private teamService: TeamService,
    private dataStore: DataStoreService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.data.team) {
      this.editMode = true;
      this.teamToEdit = this.route.snapshot.data.team;
      this.teamAvatar = this.teamToEdit?.avatar || '';
    }

    this.subs.add(
      this.dataStore.getUser().subscribe((user) => {
        this.user = user;
      }),
    );

    this.teamFormGroup = this.fb.group({
      title: [
        !this.editMode ? '' : this.teamToEdit?.title,
        [Validators.required, Validators.maxLength(200)],
      ],
      avatar: [!this.editMode ? '' : this.teamToEdit?.avatar, []],
      description: [
        !this.editMode ? '' : this.teamToEdit?.description,
        [Validators.required, Validators.maxLength(2000)],
      ],
    });
  }

  openDialogChooseImage(): void {
    const dialogRef = this.dialog.open(DialogChooseImageComponent, {
      width: '450px',
      height: '450px',
      autoFocus: false,
    });

    this.subs.add(
      dialogRef.afterClosed().subscribe((result: { imageUrl: string; image: any }) => {
        if (result) {
          this.teamAvatar = result.image;
          this.teamFormGroup.patchValue({
            avatar: result.imageUrl,
          });
          this.cdr.detectChanges();
        }
      }),
    );
  }

  onSubmit() {
    if (this.teamFormGroup.valid) {
      if (!this.editMode)
        this.subs.add(
          this.teamService
            .createTeam({ ...this.teamFormGroup.value, creatorId: this.user._id })
            .subscribe((res) => {
              this.router.navigate(['/team', res._id]);
            }),
        );
      else
        this.subs.add(
          this.teamService
            .updateTeam({ ...this.teamFormGroup.value, _id: this.teamToEdit?._id })
            .subscribe((res) => {
              this.teamToEdit!.title = this.teamFormGroup.get('title')!.value;
              this.cdr.detectChanges();
            }),
        );
    }
  }
}
