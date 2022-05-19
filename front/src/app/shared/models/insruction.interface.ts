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
  Isolate,
  Annotation,
}

export interface InstructionI {
  id?: number;
  title: string;
  description: string;
  steps: StepI[];
}

export interface StepI {
  id?: number;
  description: string;
  actions: ActionI[];
}

export interface ActionI {
  id: number;
  type: number;
  value: any;
}
