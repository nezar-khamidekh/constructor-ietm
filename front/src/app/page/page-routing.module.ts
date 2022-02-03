import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageComponent } from './page.component';

const routes: Routes = [
  {
    path: '',
    component: PageComponent,
    children: [
      {
        path: 'editor',
        loadChildren: () =>
          import('../project-editor/project-editor.module').then((m) => m.ProjectEditorModule),
      },
      {
        path: 'editor/:model',
        loadChildren: () =>
          import('../project-editor/project-editor.module').then((m) => m.ProjectEditorModule),
      },
      {
        path: '**',
        redirectTo: 'editor',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PageRoutingModule {}
