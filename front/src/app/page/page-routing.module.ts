import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../shared/guards/auth.guard';
import { PageComponent } from './page.component';

const routes: Routes = [
  {
    path: '',
    component: PageComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'main',
      },
      {
        path: 'main',
        loadChildren: () => import('../main/main.module').then((m) => m.MainModule),
        canActivate: [AuthGuard],
        data: {
          title: 'Главная',
        },
      },
      {
        path: 'repositories',
        loadChildren: () =>
          import('../public-repositories/public-repositories.module').then(
            (m) => m.PublicRepositoriesModule,
          ),
        data: {
          title: 'Репозитории',
        },
      },
      {
        path: 'favorite',
        loadChildren: () =>
          import('../favorite-repositories/favorite-repositories.module').then(
            (m) => m.FavoriteRepositoriesModule,
          ),
        canActivate: [AuthGuard],
        data: {
          title: 'Избранное',
        },
      },
      {
        path: 'user-repositories',
        loadChildren: () =>
          import('../user-repositories/user-repositories.module').then(
            (m) => m.UserRepositoriesModule,
          ),
        canActivate: [AuthGuard],
        data: {
          title: 'Личные репозитории',
        },
      },
      {
        path: 'team',
        loadChildren: () => import('../team/team.module').then((m) => m.TeamModule),
      },
      {
        path: 'editor',
        loadChildren: () =>
          import('../project-editor/project-editor.module').then((m) => m.ProjectEditorModule),
        canActivate: [AuthGuard],
        data: {
          title: 'Редактор',
        },
      },
      {
        path: 'repository/:repoId',
        loadChildren: () =>
          import('../repository/repository.module').then((m) => m.RepositoryModule),
      },
      {
        path: '**',
        redirectTo: 'repositories',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PageRoutingModule {}
