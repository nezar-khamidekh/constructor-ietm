export enum ParticipantRole {
  Author,
  Editor,
  Reader,
}

export const PARTICIPANT_ROLES = [
  { title: 'Автор', disabled: true },
  { title: 'Редактор', disabled: false },
  { title: 'Читатель', disabled: false },
];
