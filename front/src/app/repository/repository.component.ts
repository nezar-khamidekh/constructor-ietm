import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { DialogDeleteItemComponent } from '../dialogs/dialog-delete-item/dialog-delete-item.component';
import { SceneService } from '../scene/services/scene.service';
import { ParticipantRole } from '../shared/models/participant.interface';
import { RepositoryI } from '../shared/models/repository.interface';
import { RepositoryType } from '../shared/models/repositoryTypeEnum';
import { UserI } from '../shared/models/user.interface';
import { DataStoreService } from '../shared/services/data-store.service';
import { RepositoryService } from '../shared/services/repository.service';

@Component({
  selector: 'app-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss'],
})
export class RepositoryComponent implements OnInit {
  private subs = new SubSink();

  repository!: RepositoryI;
  isInFavorite = false;
  isInSubscriptions = false;

  user: UserI | null = null;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private repositoryService: RepositoryService,
    private dataStore: DataStoreService,
    private titleService: Title,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = this.dataStore.getUserValue()!;
    this.repository = this.route.snapshot.data.repository;
    this.isInFavorite = this.route.snapshot.data.isInFavorite;

    this.titleService.setTitle(
      `Репозиторий "${this.repository.title}" | Конструктор интерактивных инструкций`,
    );
  }

  getRepositoryTypeEnum() {
    return RepositoryType;
  }

  getParticipantRoleEnum() {
    return ParticipantRole;
  }

  getAuthorLastFirsName(author: UserI) {
    return `(${author.lastName[0].toUpperCase()}${author.lastName.slice(
      1,
    )} ${author.firstName[0].toUpperCase()}${author.firstName.slice(1)})`;
  }

  onToggleFavorite() {
    if (this.isInFavorite) {
      this.subs.add(
        this.repositoryService
          .removeFromFavorite(this.repository._id, this.user!._id)
          .subscribe((res) => {
            this.isInFavorite = !this.isInFavorite;
            this.cdr.detectChanges();
          }),
      );
    } else {
      this.subs.add(
        this.repositoryService
          .addToFavorite(this.repository._id, this.user!._id)
          .subscribe((res) => {
            this.isInFavorite = !this.isInFavorite;
            this.cdr.detectChanges();
          }),
      );
    }
  }

  onEdit() {}

  onDelete() {
    const dialogRef = this.dialog.open(DialogDeleteItemComponent, {
      width: '450px',
      data: { message: `Вы действительно хотите удалить репозиторий "${this.repository.title}"?` },
      autoFocus: false,
    });

    this.subs.add(
      dialogRef
        .afterClosed()
        .pipe(
          switchMap((result: { status: boolean }) => {
            if (result.status) return this.repositoryService.remove(this.repository._id);
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res !== null) this.router.navigate(['/main']);
        }),
    );
  }
}
