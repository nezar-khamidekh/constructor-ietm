import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { SceneService } from 'src/app/scene/services/scene.service';
import { InstructionI } from 'src/app/shared/models/insruction.interface';

@Component({
  selector: 'app-instruction',
  templateUrl: './instruction.component.html',
  styleUrls: ['./instruction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructionComponent implements OnInit {
  @Input() instruction: InstructionI;

  @Output() saveInstruction = new EventEmitter();
  @Output() backToInstructions = new EventEmitter();
  @Output() addStep = new EventEmitter();
  @Output() editStep = new EventEmitter();
  @Output() deleteStep = new EventEmitter();

  // instructionSaved = false;

  constructor(public sceneService: SceneService) {}

  ngOnInit(): void {}

  hasInstructionId() {
    return typeof this.instruction.index === 'number';
  }
}
