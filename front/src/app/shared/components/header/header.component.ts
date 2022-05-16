import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { UserI } from '../../models/user.interface';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  @Input() user: UserI | null = null;

  searchValue = '';

  constructor(
    private authService: AuthService,
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.queryParams.searchQuery) {
      this.searchValue = this.route.snapshot.queryParams.searchQuery;
    }
  }

  openSettings() {
    this.dialog.open(SettingsComponent, {
      data: {
        user: this.user,
      },
    });
  }

  logout() {
    this.authService.logout().subscribe((res) => {
      window.location.reload();
    });
  }

  onSearchRepositories() {
    this.router.navigate(['/main'], {
      queryParams: this.searchValue ? { searchQuery: this.searchValue } : null,
    });
  }
}
