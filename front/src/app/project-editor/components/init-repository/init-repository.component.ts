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
import { DialogChooseImageComponent } from 'src/app/dialogs/dialog-choose-image/dialog-choose-image.component';
import { RepositoryType } from 'src/app/shared/models/repositoryTypeEnum';
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

  constructor(
    public dataStore: DataStoreService,
    private fb: FormBuilder,
    private loadingService: LoadingService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private repositoryService: RepositoryService,
  ) {}

  ngOnInit(): void {
    this.repositoryGroup = this.fb.group({
      author: new FormControl(this.dataStore.getUserValue()?._id, [Validators.required]),
      team: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      preview: new FormControl('', [Validators.required]),
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
    });

    this.subs.add(
      dialogRef.afterClosed().subscribe((result: { imageUrl: string; image: any }) => {
        if (result) {
          this.cdr.detectChanges();
        }
      }),
    );
  }

  create(step: number) {
    this.loadingService.setIsLoading(true);
    this.subs.add(
      this.repositoryService.create(this.repositoryGroup.value).subscribe((res) => {
        this.changeStep.emit(step);
        this.loadingService.setIsLoading(false);
      }),
    );
  }
}
