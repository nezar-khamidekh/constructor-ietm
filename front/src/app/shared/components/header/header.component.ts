import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from 'src/app/auth/services/auth.service';
import { UserI } from '../../models/user.interface';
import { SettingsComponent } from '../settings/settings.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnChanges {
  @Input() user: UserI | null = null;
  userAvatarPath!: SafeResourceUrl;

  constructor(
    private authService: AuthService,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    if (this.user)
      this.userAvatarPath = this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpg;base64,' + this.user.avatar,
      );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user && !changes.user.firstChange && this.user)
      this.userAvatarPath = this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpg;base64,' + this.user.avatar,
      );
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
}
