import { Injectable } from '@angular/core';
import { InstructionI } from 'src/app/shared/models/insruction.interface';

@Injectable({
  providedIn: 'root',
})
export class InstructionsService {
  private _instructions: InstructionI[] = [];

  constructor() {}

  getIntructions() {
    return this._instructions;
  }

  setInstrctions(instructions: InstructionI[]) {
    this._instructions = instructions;
  }
}
