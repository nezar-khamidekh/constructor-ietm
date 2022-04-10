import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RepositoryI } from 'src/app/shared/models/repository.interface';
import { RepositoryType } from 'src/app/shared/models/repositoryTypeEnum';
import { UserI } from 'src/app/shared/models/user.interface';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent {
  @Input() user!: UserI;
  @Input() repositories: RepositoryI[] = [];

  constructor() {}

  getRepositoryType() {
    return RepositoryType;
  }
}
