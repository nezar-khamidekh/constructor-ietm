import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RepositoryResolverService } from '../repository/resolvers/repository-resolver.service';
import { ParticipantRole } from '../shared/models/participant.interface';
import { UserTeamsResolverService } from '../team/resolvers/user-teams.service';
import { ProjectEditorComponent } from './project-editor.component';

const routes: Routes = [
  {
    path: 'create',
    component: ProjectEditorComponent,
    resolve: {
      teams: UserTeamsResolverService,
    },
  },
  {
    path: 'edit/:repoId',
    component: ProjectEditorComponent,
    data: {
      roles: [ParticipantRole.Author, ParticipantRole.Editor],
    },
    resolve: {
      teams: UserTeamsResolverService,
      repository: RepositoryResolverService,
    },
  },
  {
    path: '**',
    redirectTo: 'create',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectEditorRoutingModule {}
