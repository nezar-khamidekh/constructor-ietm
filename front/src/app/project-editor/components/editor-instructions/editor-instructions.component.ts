import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

enum InstructionStep {
  ListInstructions,
  ListSlides,
  Slide,
}

interface InstructionI {
  id: number;
  title: string;
  slides: SlideI[];
}

interface SlideI {
  id: number;
  title: string;
  description: string;
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
      slides: [
        { id: 0, title: 'слон', description: 'описание' },
        { id: 1, title: 'медведь', description: 'описание' },
      ],
    },
    {
      id: 1,
      title: 'инструкция 2',
      slides: [
        { id: 0, title: 'лиса', description: 'описание' },
        { id: 1, title: 'кот', description: 'описание' },
      ],
    },
  ];

  instructionStep = InstructionStep.ListInstructions;

  titleInstruction = '';
  titleSlide = '';
  descriptionSlide = '';

  indexInstruction = 0;
  indexSlide = 0;

  constructor() {}

  ngOnInit(): void {}

  getInsructionStep() {
    return InstructionStep;
  }

  addInstruction() {
    this.indexInstruction = this.instructions.length;
    this.titleInstruction = '';
    this.instructions.push({ id: this.instructions.length, title: '', slides: [] });
    this.instructionStep = InstructionStep.ListSlides;
  }

  editInstruction(instruction: InstructionI, index: number) {
    this.indexInstruction = index;
    this.titleInstruction = instruction.title;
    this.instructionStep = InstructionStep.ListSlides;
  }

  deleteInstruction(instruction: InstructionI) {
    this.instructions = this.instructions.filter((el) => el.id !== instruction.id);
  }

  backToInstructions() {
    this.instructionStep = InstructionStep.ListInstructions;
    this.instructions[this.indexInstruction].title = this.titleInstruction;
  }

  addSlide() {
    this.titleSlide = '';
    this.descriptionSlide = '';
    this.indexSlide = this.instructions[this.indexInstruction].slides.length;
    this.instructions[this.indexInstruction].slides.push({
      id: this.instructions[this.indexInstruction].slides.length,
      title: '',
      description: '',
    });
    this.instructionStep = InstructionStep.Slide;
  }

  editSlide(slide: SlideI, index: number) {
    this.indexSlide = index;
    this.titleSlide = slide.title;
    this.descriptionSlide = slide.description;
    this.instructionStep = InstructionStep.Slide;
  }

  deleteSlide(slide: SlideI) {
    this.instructions[this.indexInstruction].slides = this.instructions[
      this.indexInstruction
    ].slides.filter((el) => el.id !== slide.id);
  }

  backToSlides() {
    this.instructions[this.indexInstruction].slides[this.indexSlide].title = this.titleSlide;
    this.instructions[this.indexInstruction].slides[this.indexSlide].description =
      this.descriptionSlide;
    this.instructionStep = InstructionStep.ListSlides;
  }
}
