import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { UserI } from 'src/app/shared/models/user.interface';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent implements OnInit {
  @Input() user!: UserI;

  constructor() {}

  ngOnInit(): void {}
}
