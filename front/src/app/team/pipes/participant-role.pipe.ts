import { Pipe, PipeTransform } from '@angular/core';
import { ParticipantI } from 'src/app/shared/models/participant.interface';
import { PARTICIPANT_ROLES } from 'src/app/shared/models/participantRoles';

@Pipe({
  name: 'participantRole',
})
export class ParticipantRolePipe implements PipeTransform {
  transform(participants: ParticipantI[], userId: string): any {
    const userTeamRoleIndex = participants.find(
      (participant) => participant.user._id === userId,
    )?.role;
    return PARTICIPANT_ROLES[userTeamRoleIndex!].title.toLocaleLowerCase();
  }
}
