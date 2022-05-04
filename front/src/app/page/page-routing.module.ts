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
        path: 'main',
        loadChildren: () => import('../main/main.module').then((m) => m.MainModule),
        data: {
          checkUser: true,
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'repositories',
        loadChildren: () =>
          import('../public-repositories/public-repositories.module').then(
            (m) => m.PublicRepositoriesModule,
          ),
      },
      {
        path: 'user-repositories',
        loadChildren: () =>
          import('../user-repositories/user-repositories.module').then(
            (m) => m.UserRepositoriesModule,
          ),
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
          checkUser: true,
        },
      },
      {
        path: 'editor/:model',
        loadChildren: () =>
          import('../project-editor/project-editor.module').then((m) => m.ProjectEditorModule),
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
