import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { ParticipantI, ParticipantRole } from 'src/app/shared/models/participant.interface';
import { PARTICIPANT_ROLES } from 'src/app/shared/models/participantRoles';

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
  @Output() removeParticipant = new EventEmitter();

  displayedColumns: string[] = ['user', 'role', 'actions'];
  displayedColumnsViewMode: string[] = ['user', 'role'];

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
