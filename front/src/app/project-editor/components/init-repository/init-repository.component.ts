import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DialogChooseImageComponent } from 'src/app/dialogs/dialog-choose-image/dialog-choose-image.component';
import { CreateRepositoryDto } from 'src/app/shared/models/createRepositoryDto.interface';
import { RepositoryI } from 'src/app/shared/models/repository.interface';
import { RepositoryType } from 'src/app/shared/models/repositoryTypeEnum';
import { TeamI } from 'src/app/shared/models/team.interface';
import { DataStoreService } from 'src/app/shared/services/data-store.service';
import { LoadingService } from 'src/app/shared/services/loading.service';
import { RepositoryService } from 'src/app/shared/services/repository.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-init-repository',
  templateUrl: './init-repository.component.html',
  styleUrls: ['./init-repository.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitRepositoryComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  @Input() step: number;
  @Output() changeStep = new EventEmitter();

  repositoryGroup: FormGroup;
  repositoryPreview = '';
  userTeams: TeamI[] = [];
  repositoryToEdit: RepositoryI | null = null;
  editMode = false;

  constructor(
    public dataStore: DataStoreService,
    public dialog: MatDialog,
    private loadingService: LoadingService,
    private fb: FormBuilder,
    private repositoryService: RepositoryService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.userTeams = this.route.snapshot.data.teams;
    if (this.route.snapshot.data.repository) {
      this.repositoryToEdit = this.route.snapshot.data.repository;
      this.editMode = true;
      this.repositoryPreview = this.repositoryToEdit?.preview ?? '';
    }

    this.repositoryGroup = this.fb.group({
      author: new FormControl(
        {
          value: !this.editMode
            ? this.dataStore.getUserValue()?._id
            : this.repositoryToEdit?.author._id,
          disabled: this.editMode,
        },
        [Validators.required],
      ),
      team: new FormControl(!this.editMode ? '' : this.repositoryToEdit?.team?._id, []),
      title: new FormControl(!this.editMode ? '' : this.repositoryToEdit?.title, [
        Validators.required,
      ]),
      type: new FormControl(!this.editMode ? '' : this.repositoryToEdit?.type, [
        Validators.required,
      ]),
      description: new FormControl(!this.editMode ? '' : this.repositoryToEdit?.description, [
        Validators.required,
        Validators.maxLength(1000),
      ]),
      preview: new FormControl(!this.editMode ? '' : this.repositoryToEdit?.preview, []),
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getType() {
    return RepositoryType;
  }

  openDialogChooseImage(): void {
    const dialogRef = this.dialog.open(DialogChooseImageComponent, {
      width: '600px',
      height: '600px',
      autoFocus: false,
      data: {
        viewport: {
          width: 220,
          height: 220,
          type: 'square',
        },
        boundary: {
          width: 250,
          height: 300,
        },
      },
    });

    this.subs.add(
      dialogRef.afterClosed().subscribe((result: { imageUrl: string; image: any }) => {
        if (result) {
          this.repositoryPreview = result.image;
          this.repositoryGroup.patchValue({
            preview: result.imageUrl,
          });
          this.cdr.detectChanges();
        }
      }),
    );
  }

  create(nextStep: number) {
    if (this.repositoryGroup.valid) {
      this.loadingService.setIsLoading(true);
      const newRepository: CreateRepositoryDto = {
        ...this.repositoryGroup.value,
      };
      if (newRepository.author !== this.dataStore.getUserValue()?._id) {
        newRepository.team = newRepository.author;
        newRepository.author = this.dataStore.getUserValue()!._id;
      }
      if (!newRepository.team) delete newRepository.team;
      if (!newRepository.preview) delete newRepository.preview;

      this.subs.add(
        this.repositoryService.create(newRepository).subscribe(
          (res) => {
            this.changeStep.emit({ nextStep: nextStep, repositoryId: res._id });
            this.loadingService.setIsLoading(false);
          },
          (err) => {
            this.loadingService.setIsLoading(false);
          },
        ),
      );
    } else
      this.snackBar.open('Проверьте корректность введенных данных', 'Ошибка', {
        duration: 5000,
        panelClass: 'errorSnack',
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
  }

  update() {
    if (this.repositoryGroup.valid) {
      this.subs.add(
        this.repositoryService
          .update({ _id: this.repositoryToEdit?._id, ...this.repositoryGroup.value })
          .subscribe((res) => {
            this.changeStep.emit();
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
}
