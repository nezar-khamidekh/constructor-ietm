import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { RepositoryI } from 'src/app/shared/models/repository.interface';
import { RepositoryType } from 'src/app/shared/models/repositoryTypeEnum';
import { TeamI } from 'src/app/shared/models/team.interface';
import { UserI } from 'src/app/shared/models/user.interface';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent implements OnChanges {
  @Input() user!: UserI;
  @Input() selectedAccount: any;
  @Input() userTeams: TeamI[] = [];
  @Input() repositories: RepositoryI[] = [];
  @Output() selecAccount = new EventEmitter();

  searchRepositoryValue = '';

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.selectedAccount &&
      !changes.selectedAccount.firstChange &&
      this.searchRepositoryValue
    )
      this.searchRepositoryValue = '';
  }

  getRepositoryType() {
    return RepositoryType;
  }

  isSelectedAccountUser() {
    return this.selectedAccount._id === this.user._id;
  }
}
