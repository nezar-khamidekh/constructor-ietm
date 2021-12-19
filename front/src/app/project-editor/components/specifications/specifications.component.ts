import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-specifications',
  templateUrl: './specifications.component.html',
  styleUrls: ['./specifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpecificationsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
