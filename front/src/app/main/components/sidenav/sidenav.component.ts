import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UserI } from 'src/app/shared/models/user.interface';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent {
  @Input() user!: UserI;

  constructor() {}
}
