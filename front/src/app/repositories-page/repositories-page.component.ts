import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-repositories-page',
  templateUrl: './repositories-page.component.html',
  styleUrls: ['./repositories-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RepositoriesPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
