import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SceneService } from 'src/app/scene/services/scene.service';
import {
  ActionI,
  InstructionI,
  InstructionStep,
  StepI,
} from 'src/app/shared/models/insruction.interface';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-editor-instructions',
  templateUrl: './editor-instructions.component.html',
  styleUrls: ['./editor-instructions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorInstructionsComponent implements OnInit {
  private subs = new SubSink();

  instructions: InstructionI[] = [];

  instructionStep = InstructionStep.ListInstructions;

  currentInstruction: InstructionI = {
    title: '',
    description: '',
    steps: [],
  };

  currentInstructionStep: StepI = {
    description: '',
    actions: [],
  };

  actions: ActionI[];

  constructor(private sceneService: SceneService) {}

  ngOnInit(): void {
    this.subs.add(
      this.sceneService.getActions().subscribe((actions) => {
        this.actions = actions;
      }),
    );
  }

  getInsructionStep() {
    return InstructionStep;
  }

  addInstruction() {
    this.instructionStep = InstructionStep.Instruction;
  }

  editInstruction(instruction: InstructionI) {
    this.currentInstruction = { ...instruction };
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
      this.currentInstruction = { ...this.currentInstruction, id: this.instructions.length };
      this.instructions.push({
        id: this.instructions.length,
        title: instruction.title,
        description: instruction.description,
        steps: instruction.steps,
      });
    }
  }

  addStep() {
    this.instructionStep = InstructionStep.Step;
  }

  saveStep(step: StepI) {
    if (typeof step.id === 'number') {
      const stepInArray = this.currentInstruction.steps.find((el) => el.id === step.id);
      if (stepInArray) {
        stepInArray.description = step.description;
        stepInArray.actions = [...step.actions];
      }
    } else {
      this.currentInstructionStep = {
        ...this.currentInstructionStep,
        id: this.currentInstruction.steps.length,
      };
      this.currentInstruction.steps.push({
        id: this.currentInstruction.steps.length,
        description: step.description,
        actions: step.actions,
      });
    }
  }

  editStep(step: StepI) {
    this.currentInstructionStep = { ...step };
    this.instructionStep = InstructionStep.Step;
  }

  deleteStep(step: StepI) {
    this.currentInstruction.steps = this.currentInstruction.steps.filter((el) => el.id !== step.id);
  }

  backToSteps() {
    this.currentInstructionStep = {
      description: '',
      actions: [],
    };
    this.instructionStep = InstructionStep.Instruction;
  }

  startRecordingAction() {}

  stopRecordingAction() {}

  deleteAction(action: ActionI) {}
}
