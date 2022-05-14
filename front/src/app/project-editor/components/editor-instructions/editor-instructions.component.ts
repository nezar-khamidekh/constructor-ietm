import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

enum InstructionStep {
  ListInstructions,
  ListSlides,
  Slide,
}

@Component({
  selector: 'app-editor-instructions',
  templateUrl: './editor-instructions.component.html',
  styleUrls: ['./editor-instructions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorInstructionsComponent implements OnInit {
  instructions = [
    {
      id: 0,
      title: 'инструкция 1',
      slides: [
        { id: 0, title: 'слайд 1', description: 'описание' },
        { id: 1, title: 'слайд 2', description: 'описание' },
        { id: 2, title: 'слайд 3', description: 'описание' },
      ],
    },
    {
      id: 1,
      title: 'инструкция 2',
      slides: [
        { id: 0, title: 'слайд 1', description: 'описание' },
        { id: 1, title: 'слайд 2', description: 'описание' },
        { id: 2, title: 'слайд 3', description: 'описание' },
      ],
    },
    {
      id: 2,
      title: 'инструкция 3',
      slides: [
        { id: 0, title: 'слайд 1', description: 'описание' },
        { id: 1, title: 'слайд 2', description: 'описание' },
        { id: 2, title: 'слайд 3', description: 'описание' },
      ],
    },
  ];

  instructionStep = InstructionStep.ListInstructions;

  constructor() {}

  ngOnInit(): void {}

  getInsructionStep() {
    return InstructionStep;
  }

  addInstruction() {
    this.instructionStep = InstructionStep.ListSlides;
  }

  editInstruction() {
    this.instructionStep = InstructionStep.ListSlides;
  }

  deleteInstruction() {
    console.log('instruction is deleted');
  }

  addSlide() {
    this.instructionStep = InstructionStep.Slide;
  }

  editSlide() {
    this.instructionStep = InstructionStep.Slide;
  }

  deleteSlide() {
    console.log('slide is deleted');
  }

  backToInstructions() {
    this.instructionStep = InstructionStep.ListInstructions;
  }

  saveInstruction() {
    this.instructionStep = InstructionStep.ListInstructions;
  }

  backToSlides() {
    this.instructionStep = InstructionStep.ListSlides;
  }

  saveSlide() {
    this.instructionStep = InstructionStep.ListSlides;
  }
}
