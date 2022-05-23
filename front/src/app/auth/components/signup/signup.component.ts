import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserCreateI } from 'src/app/shared/models/userCreate.interface';
import { SubSink } from 'subsink';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupComponent implements OnInit, OnDestroy {
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

  getErrorMessage(control: any, error: string) {
    if (control.hasError('required')) {
      return 'Обязательное поле';
    }
    if (control.hasError('email')) {
      return 'Некорректный email';
    }
    return control.hasError('pattern') ? error : '';
  }

  initializeRegistrationForm() {
    this.registrationFormGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      login: [
        '',
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
          Validators.required,
          Validators.pattern(
            '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*#?&])[a-zA-Z0-9@$!%*#?&]+',
          ),
          Validators.minLength(8),
          Validators.maxLength(30),
        ],
      ],
      firstName: ['', []],
      lastName: ['', []],
    });
  }

  onSubmit() {
    if (this.registrationFormGroup.valid) {
      const user: UserCreateI = {
        email: String(this.registrationFormGroup.get('email')?.value).toLowerCase(),
        login: String(this.registrationFormGroup.get('login')?.value).toLowerCase(),
        password: String(this.registrationFormGroup.get('password')?.value),
        firstName: String(this.registrationFormGroup.get('firstName')?.value),
        lastName: String(this.registrationFormGroup.get('lastName')?.value),
      };
      this.authService.register(user).subscribe(
        (user: any) => {
          this.router.navigate(['main']);
        },
        (err: any) => {
          console.log(err);
        },
      );
    }
  }
}
