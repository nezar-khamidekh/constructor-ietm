import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Inject,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Renderer2,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { SubSink } from 'subsink';
import { UserI } from '../../models/user.interface';
import { UserUpdateI } from '../../models/userUpdate.interface';
import { DataStoreService } from '../../services/data-store.service';
import { UserService } from '../../services/user.service';
import * as Croppie from 'croppie';
import { MatSnackBar } from '@angular/material/snack-bar';

interface DIALOG_DATA {
  user: UserI;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  hidePass = true;
  userFormGroup: FormGroup;
  imageLoadFailed = false;
  croppieObj: any;
  fileReader = new FileReader();
  previewImage: any;
  previewImageUrl!: string;

  @ViewChild('croppie') croppie!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DIALOG_DATA,
    private fb: FormBuilder,
    private userService: UserService,
    private dataStore: DataStoreService,
    private dialogRef: MatDialogRef<SettingsComponent>,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.initializeUserForm();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getErrorMessage(control: any, error: string) {
    if (control.hasError('required')) {
      return 'Обязательное поле';
    }
    if (control.hasError('email')) {
      return 'Некорректный email';
    }
    return control.hasError('pattern') ? error : '';
  }

  initializeUserForm() {
    this.userFormGroup = this.fb.group({
      email: [this.data.user.email, [Validators.required, Validators.email]],
      login: [
        { value: this.data.user.login, disabled: true },
        [
          Validators.required,
          Validators.pattern('[a-zA-Z]+[a-zA-Z\\d]*'),
          Validators.minLength(6),
          Validators.maxLength(20),
        ],
      ],
      password: [
        '',
        [
          Validators.pattern(
            '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*#?&])[a-zA-Z0-9@$!%*#?&]+',
          ),
          Validators.minLength(8),
          Validators.maxLength(30),
        ],
      ],
      firstName: [this.data.user.firstName, []],
      lastName: [this.data.user.lastName, []],
    });
  }

  onSubmit() {
    if (this.userFormGroup.valid) {
      const user: UserUpdateI = {
        _id: this.data.user._id!,
        email: String(this.userFormGroup.get('email')?.value).toLowerCase(),
        firstName: String(this.userFormGroup.get('firstName')?.value),
        lastName: String(this.userFormGroup.get('lastName')?.value),
        avatar: this.previewImageUrl || this.data.user.avatar || '',
      };
      if (this.userFormGroup.get('password')?.value) {
        user.password = String(this.userFormGroup.get('password')?.value);
      }
      this.subs.add(
        this.userService.updateUser(user).subscribe(
          (res: any) => {
            this.dataStore.setUser({ ...user, login: this.data.user.login });
            this.dialogRef.close();
          },
          (err: any) => {
            console.log(err);
          },
        ),
      );
    } else
      this.snackBar.open('Проверьте корректность введенных данных', 'Ошибка', {
        duration: 5000,
        panelClass: 'errorSnack',
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
  }

  updateImageResult() {
    this.croppieObj.result({ type: 'base64', size: 'viewport' }).then((crop: any) => {
      this.previewImage = this.sanitizer.bypassSecurityTrustResourceUrl(crop);
      this.previewImageUrl = crop;
      this.cdr.detectChanges();
    });
  }

  onFileChange(event: any) {
    if (event.target.files[0].size > 5242880) {
      this.imageLoadFailed = true;
      event.target.value = '';
      return;
    }

    this.imageLoadFailed = false;

    if (this.croppie && this.croppieObj) {
      this.previewImage = '';
      this.previewImageUrl = '';
      this.croppieObj.destroy();
    }

    this.croppieObj = new Croppie(this.croppie.nativeElement, {
      enableExif: true,
      viewport: {
        width: 100,
        height: 100,
        type: 'circle',
      },
      boundary: {
        width: 150,
        height: 200,
      },
      mouseWheelZoom: false,
      enableOrientation: true,
    });

    this.fileReader.onload = (e1: any) => {
      this.cdr.detectChanges();
      this.croppieObj
        .bind({
          url: e1.target.result,
        })
        .then(() => {
          event.target.value = '';
          this.updateImageResult();
          this.renderer.listen(this.croppie.nativeElement, 'update', () => {
            this.updateImageResult();
          });
        });
    };

    this.fileReader.readAsDataURL(event.target.files[0]);
  }
}
