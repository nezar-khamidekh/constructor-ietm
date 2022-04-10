import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserTeamsResolverService } from '../team/resolvers/user-teams.service';
import { ProjectEditorComponent } from './project-editor.component';

const routes: Routes = [
  {
    path: '',
    component: ProjectEditorComponent,
    resolve: {
      teams: UserTeamsResolverService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectEditorRoutingModule {}
