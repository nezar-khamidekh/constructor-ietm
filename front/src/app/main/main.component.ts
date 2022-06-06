import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, skip, switchMap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { RepositoryI } from '../shared/models/repository.interface';
import { TeamI } from '../shared/models/team.interface';
import { UserI } from '../shared/models/user.interface';
import { DataStoreService } from '../shared/services/data-store.service';
import { RepositoryService } from '../shared/services/repository.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  user: UserI;
  selectedAccount: any;
  userTeams: TeamI[] = [];
  accountRepositories: RepositoryI[] = [];

  repositories: RepositoryI[] = [];

  constructor(
    private dataStore: DataStoreService,
    private route: ActivatedRoute,
    private repositoryService: RepositoryService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.accountRepositories = this.route.snapshot.data.userRepositories;
    this.userTeams = this.route.snapshot.data.userTeams;
    this.repositories = this.route.snapshot.data.publicRepositories;

    this.subs.add(
      this.dataStore
        .getUser()
        .pipe(filter((value) => value !== null))
        .subscribe((user) => {
          this.user = user;
          if (!this.selectedAccount || this.selectedAccount._id === user._id)
            this.selectedAccount = user;
          this.cdr.detectChanges();
        }),
    );

    this.subs.add(
      this.route.queryParams
        .pipe(
          skip(1),
          switchMap((queryParams) => {
            if (queryParams.searchQuery) {
              return this.repositoryService.find(queryParams.searchQuery);
            } else {
              return this.repositoryService.getPublic();
            }
          }),
        )
        .subscribe((repositories) => {
          this.repositories = repositories;
        }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onSelectAccount(account: any) {
    this.selectedAccount = account;
    if (this.selectedAccount._id === this.user._id)
      this.accountRepositories = this.route.snapshot.data.userRepositories;
    else
      this.subs.add(
        this.repositoryService.getByTeam(this.selectedAccount._id).subscribe((repositories) => {
          this.accountRepositories = repositories;
        }),
      );
  }
}
