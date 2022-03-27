import { ParticipantI } from './participant.interface';

export interface TeamI {
  title: string;
  avatar: string;
  description: string;
  participants?: ParticipantI[];
  _id: string;
}
