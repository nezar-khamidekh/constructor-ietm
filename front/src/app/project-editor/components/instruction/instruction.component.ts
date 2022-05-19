import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
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

  constructor() {}

  ngOnInit(): void {}
}
