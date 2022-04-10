import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataStoreService } from 'src/app/shared/services/data-store.service';
import { LoadingService } from 'src/app/shared/services/loading.service';

@Component({
  selector: 'app-init-repository',
  templateUrl: './init-repository.component.html',
  styleUrls: ['./init-repository.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitRepositoryComponent implements OnInit {
  @Input() step: number;
  @Output() changeStep = new EventEmitter();

  repositoryGroup: FormGroup;

  constructor(
    public dataStore: DataStoreService,
    private fb: FormBuilder,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.repositoryGroup = this.fb.group({
      author: new FormControl('', [Validators.required]),
      team: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      preview: new FormControl('', [Validators.required]),
      //participants,
      //models
    });
  }

  createRepository(step: number) {
    this.loadingService.setIsLoading(true);
    this.changeStep.emit(step);
  }
}
