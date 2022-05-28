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
    this.repositoryGroup = this.fb.group({
      author: new FormControl(this.dataStore.getUserValue()?._id, [Validators.required]),
      team: new FormControl('', []),
      title: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      preview: new FormControl('', []),
      //participants,
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
      width: '450px',
      height: '450px',
      autoFocus: false,
      data: {
        type: 'square',
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
}
