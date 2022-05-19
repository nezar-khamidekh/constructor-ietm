import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  ActionI,
  InstructionI,
  InstructionStep,
  StepI,
} from 'src/app/shared/models/insruction.interface';

@Component({
  selector: 'app-editor-instructions',
  templateUrl: './editor-instructions.component.html',
  styleUrls: ['./editor-instructions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorInstructionsComponent implements OnInit {
  instructions: InstructionI[] = [];

  instructionStep = InstructionStep.ListInstructions;

  currentInstruction: InstructionI = {
    title: '',
    description: '',
    steps: [],
  };

  constructor() {}

  ngOnInit(): void {}

  getInsructionStep() {
    return InstructionStep;
  }

  addInstruction() {
    this.instructionStep = InstructionStep.Instruction;
  }

  editInstruction(instruction: InstructionI) {
    console.log(this.currentInstruction);
    this.instructionStep = InstructionStep.Instruction;
  }

  deleteInstruction(instruction: InstructionI) {
    this.instructions = this.instructions.filter((el) => el.id !== instruction.id);
  }

  backToInstructions() {
    this.instructionStep = InstructionStep.ListInstructions;
    this.currentInstruction = {
      title: '',
      description: '',
      steps: [],
    };
  }

  saveInstruction(instruction: InstructionI) {
    if (typeof instruction.id === 'number') {
      const instructionInArray = this.instructions.find((el) => el.id === instruction.id);
      if (instructionInArray) {
        instructionInArray.title = instruction.title;
        instructionInArray.description = instruction.description;
      }
    } else {
      this.instructions.push({
        id: this.instructions.length,
        title: instruction.title,
        description: instruction.description,
        steps: instruction.steps,
      });
    }
  }

  addStep() {
    // this.descriptionStep = '';
    // this.indexStep = this.instructions[this.indexInstruction].steps.length;
    // this.instructions[this.indexInstruction].steps.push({
    //   id: this.instructions[this.indexInstruction].steps.length,
    //   description: '',
    //   actions: [],
    // });
    // this.instructionStep = InstructionStep.Step;
  }

  editStep(step: StepI, index: number) {
    // this.indexStep = index;
    // this.descriptionStep = step.description;
    // this.instructionStep = InstructionStep.Step;
  }

  deleteStep(step: StepI) {
    // this.instructions[this.indexInstruction].steps = this.instructions[
    //   this.indexInstruction
    // ].steps.filter((el) => el.id !== step.id);
  }

  backToSteps() {
    // this.instructions[this.indexInstruction].steps[this.indexStep].description =
    //   this.descriptionStep;
    // this.instructionStep = InstructionStep.Instruction;
  }

  startRecordingAction() {}

  stopRecordingAction() {}

  deleteAction(action: ActionI) {}
}
