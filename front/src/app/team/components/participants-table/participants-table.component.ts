import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ParticipantI } from 'src/app/shared/models/participant.interface';
import { ParticipantRole, PARTICIPANT_ROLES } from 'src/app/shared/models/participantRole';

@Component({
  selector: 'app-participants-table',
  templateUrl: './participants-table.component.html',
  styleUrls: ['./participants-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParticipantsTableComponent implements OnInit {
  @Input() participants: ParticipantI[] = [];
  @Input() userIsAuthor = false;
  @Input() viewMode = false;

  displayedColumns: string[] = ['user', 'role', 'actions'];

  constructor() {}

  ngOnInit(): void {}

  getParticipantRoles() {
    return PARTICIPANT_ROLES;
  }

  getParticipantRoleEnum() {
    return ParticipantRole;
  }

  isAuthorRole(role: number) {
    return role === ParticipantRole.Author;
  }
}
