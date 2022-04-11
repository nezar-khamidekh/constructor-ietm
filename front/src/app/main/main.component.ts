import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { RepositoryI } from '../shared/models/repository.interface';
import { UserI } from '../shared/models/user.interface';
import { DataStoreService } from '../shared/services/data-store.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  private subs = new SubSink();

  user: UserI;
  accountRepositories: RepositoryI[] = [];

  constructor(
    private dataStore: DataStoreService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.dataStore
        .getUser()
        .pipe(filter((value) => value !== null))
        .subscribe((user) => {
          this.user = user;
          this.cdr.detectChanges();
        }),
    );

    this.accountRepositories = this.route.snapshot.data.repositories;
    console.log(this.accountRepositories);
  }
}
