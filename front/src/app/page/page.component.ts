import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserI } from '../shared/models/user.interface';
import { DataStoreService } from '../shared/services/data-store.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageComponent implements OnInit {
  user: UserI | null = null;

  constructor(private route: ActivatedRoute, private dataStore: DataStoreService) {}

  ngOnInit(): void {
    this.user = this.route.snapshot.data.user;
    this.dataStore.setUser(this.user);
  }
}
