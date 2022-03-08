import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { filter } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { UserI } from '../shared/models/user.interface';
import { DataStoreService } from '../shared/services/data-store.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent implements OnInit {
  private subs = new SubSink();

  user: UserI;

  constructor(private dataStore: DataStoreService, private cdr: ChangeDetectorRef) {}

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
  }
}
