import { Pipe, PipeTransform } from '@angular/core';
import { ParticipantI } from 'src/app/shared/models/participant.interface';
import { PARTICIPANT_ROLES } from 'src/app/shared/models/participantRole';

@Pipe({
  name: 'participantRole',
})
export class ParticipantRolePipe implements PipeTransform {
  transform(participants: ParticipantI[], userId: string): string {
    const userTeamRoleIndex = participants.find(
      (participant) => participant.userId === userId,
    )?.role;
    return PARTICIPANT_ROLES[userTeamRoleIndex!];
  }
}
