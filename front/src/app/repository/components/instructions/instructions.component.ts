import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SceneService } from 'src/app/scene/services/scene.service';
import { InstructionI } from 'src/app/shared/models/insruction.interface';

enum ViewMode {
  Instructions,
  Steps,
}

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.component.html',
  styleUrls: ['./instructions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructionsComponent implements OnInit {
  viewMode = ViewMode.Instructions;
  instructions: InstructionI[] = [];
  selectedInstruction: InstructionI | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public sceneService: SceneService,
  ) {}

  ngOnInit(): void {
    this.instructions = this.route.snapshot.parent?.data.repository.instructions;

    if (!this.instructions.length) this.router.navigate(['..'], { relativeTo: this.route });
  }

  getViewMode() {
    return ViewMode;
  }

  onSelectInstruction(instruction: InstructionI) {
    this.selectedInstruction = instruction;
    this.viewMode = ViewMode.Steps;
  }

  backToInstructions() {
    this.sceneService.resetAction();
    this.selectedInstruction = null;
    this.viewMode = ViewMode.Instructions;
  }
}
