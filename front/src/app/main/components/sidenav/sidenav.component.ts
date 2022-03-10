import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { UserI } from 'src/app/shared/models/user.interface';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent implements OnInit, OnChanges {
  @Input() user!: UserI;
  userAvatarPath!: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (this.user)
      this.userAvatarPath = this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpg;base64,' + this.user.avatar,
      );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user && !changes.user.firstChange && this.user) {
      this.userAvatarPath = this.sanitizer.bypassSecurityTrustResourceUrl(
        'data:image/jpg;base64,' + this.user.avatar,
      );
    }
  }
}
