import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ResolveEnd, ResolveStart, Router } from '@angular/router';
import { merge, Observable } from 'rxjs';
import { filter, mapTo } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { UserI } from '../shared/models/user.interface';
import { DataStoreService } from '../shared/services/data-store.service';
import { LoadingService } from '../shared/services/loading.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
})
export class PageComponent implements OnInit {
  private subs = new SubSink();
  private _showLoaderEvents$: Observable<boolean>;
  private _hideLoaderEvents$: Observable<boolean>;

  user: UserI | null = null;

  isLoadingBar$!: Observable<boolean>;

  constructor(
    private dataStore: DataStoreService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.dataStore.getUser().subscribe((user) => {
        this.user = user;
        this.cdr.detectChanges();
      }),
    );

    this._showLoaderEvents$ = this.router.events.pipe(
      filter((e) => e instanceof ResolveStart),
      mapTo(true),
    );

    this._hideLoaderEvents$ = this.router.events.pipe(
      filter((e) => e instanceof ResolveEnd),
      mapTo(false),
    );

    this.isLoadingBar$ = merge(this._hideLoaderEvents$, this._showLoaderEvents$);
  }
}
