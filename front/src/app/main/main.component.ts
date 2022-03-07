import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { UserI } from '../shared/models/user.interface';
import { DataStoreService } from '../shared/services/data-store.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  user: UserI;

  constructor(private dataStore: DataStoreService) {}

  ngOnInit(): void {
    this.dataStore
      .getUser()
      .pipe(filter((value) => value !== null))
      .subscribe((user) => {
        this.user = user;
      });
  }
}
