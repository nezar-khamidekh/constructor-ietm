import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

enum InstructionStep {
  ListInstructions,
  ListSteps,
  Step,
}

interface InstructionI {
  id: number;
  title: string;
  description: string;
  steps: StepI[];
}

interface StepI {
  id: number;
  description: string;
  actions: ActionI[];
}

interface ActionI {
  id: number;
  type: string;
}

@Component({
  selector: 'app-editor-instructions',
  templateUrl: './editor-instructions.component.html',
  styleUrls: ['./editor-instructions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorInstructionsComponent implements OnInit {
  instructions: InstructionI[] = [
    {
      id: 0,
      title: 'инструкция 1',
      description: 'описание 1',
      steps: [
        { id: 0, description: 'описание', actions: [{ id: 0, type: '0' }] },
        { id: 1, description: 'описание', actions: [] },
      ],
    },
    {
      id: 1,
      title: 'инструкция 2',
      description: 'описание 2',
      steps: [
        { id: 0, description: 'описание', actions: [] },
        { id: 1, description: 'описание', actions: [] },
      ],
    },
  ];

  instructionStep = InstructionStep.ListInstructions;

  titleInstruction = '';
  descriptionInstruction = '';

  descriptionStep = '';

  indexInstruction = 0;
  indexStep = 0;

  constructor() {}

  ngOnInit(): void {}

  getInsructionStep() {
    return InstructionStep;
  }

  addInstruction() {
    this.indexInstruction = this.instructions.length;
    this.titleInstruction = '';
    this.descriptionInstruction = '';
    this.instructions.push({
      id: this.instructions.length,
      title: '',
      description: '',
      steps: [],
    });
    this.instructionStep = InstructionStep.ListSteps;
  }

  editInstruction(instruction: InstructionI, index: number) {
    this.indexInstruction = index;
    this.titleInstruction = instruction.title;
    this.descriptionInstruction = instruction.description;
    this.instructionStep = InstructionStep.ListSteps;
  }

  deleteInstruction(instruction: InstructionI) {
    this.instructions = this.instructions.filter((el) => el.id !== instruction.id);
  }

  backToInstructions() {
    this.instructionStep = InstructionStep.ListInstructions;
    this.instructions[this.indexInstruction].title = this.titleInstruction;
    this.instructions[this.indexInstruction].description = this.descriptionInstruction;
  }

  addStep() {
    this.descriptionStep = '';
    this.indexStep = this.instructions[this.indexInstruction].steps.length;
    this.instructions[this.indexInstruction].steps.push({
      id: this.instructions[this.indexInstruction].steps.length,
      description: '',
      actions: [],
    });
    this.instructionStep = InstructionStep.Step;
  }

  editStep(step: StepI, index: number) {
    this.indexStep = index;
    this.descriptionStep = step.description;
    this.instructionStep = InstructionStep.Step;
  }

  deleteStep(step: StepI) {
    this.instructions[this.indexInstruction].steps = this.instructions[
      this.indexInstruction
    ].steps.filter((el) => el.id !== step.id);
  }

  backToSteps() {
    this.instructions[this.indexInstruction].steps[this.indexStep].description =
      this.descriptionStep;
    this.instructionStep = InstructionStep.ListSteps;
  }

  startRecordingAction() {}

  stopRecordingAction() {}

  editAction(action: ActionI, index: number) {}

  deleteAction(action: ActionI) {}
}
