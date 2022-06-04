import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { skip } from 'rxjs/operators';
import { InstructionsService } from 'src/app/scene/services/instructions.service';
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

  constructor(
    private sceneService: SceneService,
    private instructionService: InstructionsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.subs.add(
      this.sceneService
        .getActions()
        .pipe(skip(1))
        .subscribe((actions) => {
          this.currentInstructionStep.actions = [...actions];
        }),
    );

    if (this.route.snapshot.data.repository?.instructions.length)
      this.instructions = [...this.route.snapshot.data.repository?.instructions];
    this.instructionService.setInstructions(this.instructions);
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
    this.instructions = this.instructions.filter((el) => el.index !== instruction.index);
    this.instructionService.setInstructions(this.instructions);
  }

  backToInstructions() {
    this.sceneService.resetAction();
    this.instructionStep = InstructionStep.ListInstructions;
    this.currentInstruction = {
      title: '',
      description: '',
      steps: [],
    };
  }

  saveInstruction(instruction: InstructionI) {
    if (typeof instruction.index === 'number') {
      const instructionInArray = this.instructions.find((el) => el.index === instruction.index);
      if (instructionInArray) {
        instructionInArray.title = instruction.title;
        instructionInArray.description = instruction.description;
      }
    } else {
      this.currentInstruction = { ...this.currentInstruction, index: this.instructions.length };
      this.instructions.push({
        index: this.instructions.length,
        title: instruction.title,
        description: instruction.description,
        steps: instruction.steps,
      });
    }
  }

  addStep() {
    this.currentInstructionStep = {
      description: '',
      actions: [],
    };
    this.sceneService.resetAction();
    this.instructionStep = InstructionStep.Step;
  }

  saveStep(step: StepI) {
    if (typeof step.index === 'number') {
      const stepInArray = this.currentInstruction.steps.find((el) => el.index === step.index);
      if (stepInArray) {
        stepInArray.description = step.description;
        stepInArray.actions = [...step.actions];
      }
    } else {
      this.currentInstructionStep = {
        ...this.currentInstructionStep,
        index: this.currentInstruction.steps.length,
      };
      this.currentInstruction.steps.push({
        index: this.currentInstruction.steps.length,
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
    this.currentInstruction.steps = this.currentInstruction.steps.filter(
      (el) => el.index !== step.index,
    );
  }

  backToSteps() {
    this.currentInstructionStep = {
      description: '',
      actions: [],
    };
    this.sceneService.actions = [];
    this.sceneService.setIsRecording(false);
    this.sceneService.resetAction();
    this.instructionStep = InstructionStep.Instruction;
  }

  deleteAction(action: ActionI) {
    this.currentInstructionStep.actions = this.currentInstructionStep.actions.filter(
      (el) => el.index !== action.index,
    );
  }
}
