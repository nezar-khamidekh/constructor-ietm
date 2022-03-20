import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/services/auth.service';
import { UserI } from '../../models/user.interface';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() user: UserI | null = null;

  constructor(private authService: AuthService, public dialog: MatDialog) {}

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
}
