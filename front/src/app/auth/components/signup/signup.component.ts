import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserCreateI } from 'src/app/shared/interfaces/userCreate.interface';
import { SubSink } from 'subsink';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent implements OnInit {
  private subs = new SubSink();

  hidePass = true;
  registrationFormGroup: FormGroup;

  constructor(private router: Router, private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    this.initializeRegistrationForm();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  /**
   * Регистрация пользователя
   */
  onSubmit() {
    if (this.registrationFormGroup.valid) {
      const user: UserCreateI = {
        email: String(this.registrationFormGroup.get('email')?.value).toLowerCase(),
        login: String(this.registrationFormGroup.get('login')?.value).toLowerCase(),
        username: String(this.registrationFormGroup.get('login')?.value).toLowerCase(),
        password: String(this.registrationFormGroup.get('password')?.value),
      };
      this.authService.register(user).subscribe(
        (user: any) => {
          console.log(user);
          this.router.navigate(['/messenger']);
        },
        (err: any) => {
          console.log(err);
        },
      );
    }
  }

  /**
   * Инициализация формы регистрации
   */
  initializeRegistrationForm() {
    this.registrationFormGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      login: ['', [Validators.required, Validators.pattern('[a-zA-Z\\d]+[_a-zA-Z\\d]*')]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$'),
        ],
      ],
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
