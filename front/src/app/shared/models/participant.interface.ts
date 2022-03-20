export interface ParticipantI {
  userId: string;
  login: string;
  role: ParticipantRole;
}

export enum ParticipantRole {
  'Author',
  'Editor',
  'Reader',
}
