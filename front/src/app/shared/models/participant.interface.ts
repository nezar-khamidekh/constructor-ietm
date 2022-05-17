export interface ParticipantI {
  login: string;
  role: ParticipantRole;
  user: {
    avatar: string;
    email: string;
    firstName: string;
    lastName: string;
    _id: string;
  };
}

export enum ParticipantRole {
  Author,
  Editor,
  Reader,
}
