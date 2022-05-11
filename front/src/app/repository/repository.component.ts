import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SubSink } from 'subsink';
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
    this.subs.add(
      this.repositoryService.remove(this.repository._id).subscribe((res) => {
        this.router.navigate(['/main']);
      }),
    );
  }
}
