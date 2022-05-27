export enum InstructionStep {
  ListInstructions,
  Instruction,
  Step,
}

export enum ActionType {
  Camera,
  Rotation,
  Explode,
  Section,
  Hide,
  Annotation,
  RestoreView,
  FitToView,
}

export interface InstructionI {
  index?: number;
  title: string;
  description: string;
  steps: StepI[];
}

export interface StepI {
  index?: number;
  description: string;
  actions: ActionI[];
}

export interface ActionI {
  index: number;
  type: number;
  value: any;
}
