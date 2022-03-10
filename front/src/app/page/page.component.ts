import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SubSink } from 'subsink';
import { UserI } from '../shared/models/user.interface';
import { DataStoreService } from '../shared/services/data-store.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageComponent implements OnInit {
  private subs = new SubSink();

  user: UserI | null = null;

  constructor(
    private route: ActivatedRoute,
    private dataStore: DataStoreService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.dataStore.setUser(this.route.snapshot.data.user);

    this.subs.add(
      this.dataStore.getUser().subscribe((user) => {
        this.user = user;
        this.cdr.detectChanges();
      }),
    );
  }
}
