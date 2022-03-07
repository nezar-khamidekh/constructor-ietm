import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { UserI } from '../../models/user.interface';
import { UserCreateI } from '../../models/userCreate.interface';
import { DataStoreService } from '../../services/data-store.service';
import { UserService } from '../../services/user.service';

interface DIALOG_DATA {
  user: UserI;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  private subs = new SubSink();

  hidePass = true;
  userFormGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dataStore: DataStoreService,
    @Inject(MAT_DIALOG_DATA) private data: DIALOG_DATA,
  ) {}

  ngOnInit(): void {
    this.initializeUserForm();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  onSubmit() {
    if (this.userFormGroup.valid) {
      const user: UserCreateI = {
        email: String(this.userFormGroup.get('email')?.value).toLowerCase(),
        login: String(this.userFormGroup.get('login')?.value).toLowerCase(),
        username: String(this.userFormGroup.get('login')?.value),
        password: String(this.userFormGroup.get('password')?.value),
        firstName: String(this.userFormGroup.get('firstName')?.value),
        lastName: String(this.userFormGroup.get('lastName')?.value),
      };
      /*  this.userService.updateUser(user).subscribe(
        (res: any) => {
          this.dataStore.setUser(user);
        },
        (err: any) => {
          console.log(err);
        },
      ); */
    }
  }

  /**
   * Инициализация формы регистрации
   */
  initializeUserForm() {
    this.userFormGroup = this.fb.group({
      email: [this.data.user.email, [Validators.required, Validators.email]],
      login: [
        this.data.user.email,
        [
          Validators.required,
          Validators.pattern('[a-zA-Z]+[a-zA-Z\\d]*'),
          Validators.minLength(6),
          Validators.maxLength(20),
        ],
      ],
      username: [
        this.data.user.username,
        [Validators.required, Validators.pattern('[a-zA-Z]+[a-zA-Z\\d]*'), Validators.minLength(6)],
      ],
      password: [
        '',
        [
          Validators.required,
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

  /**
   * Получение сообщений об ошибках элементы формы
   * @param control Элемент управления формы
   * @param error Ошибка валидности элемента формы
   * @returns Сообщение об ошибки, либо ничего
   */
  getErrorMessage(control: any, error: string) {
    if (control.hasError('required')) {
      return 'Обязательное поле';
    }
    if (control.hasError('email')) {
      return 'Некорректный email';
    }
    return control.hasError('pattern') ? error : '';
  }
}
