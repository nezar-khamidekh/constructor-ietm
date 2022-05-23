import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    component: SigninComponent,
    data: {
      title: 'Вход в аккаунт',
    },
  },
  {
    path: 'registration',
    component: SignupComponent,
    data: {
      title: 'Регистрация',
    },
  },
  {
    path: '**',
    redirectTo: '../login',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
