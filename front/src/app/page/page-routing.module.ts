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
          import('../repositories-page/repositories-page.module').then(
            (m) => m.RepositoriesPageModule,
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
