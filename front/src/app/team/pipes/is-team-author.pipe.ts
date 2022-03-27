import { Pipe, PipeTransform } from '@angular/core';
import { ParticipantI, ParticipantRole } from 'src/app/shared/models/participant.interface';

@Pipe({
  name: 'isTeamAuthor',
})
export class IsTeamAuthorPipe implements PipeTransform {
  transform(participants: ParticipantI[], userId: string): boolean {
    return participants.some(
      (participant) =>
        participant.user._id === userId && participant.role === ParticipantRole.Author,
    );
  }
}
