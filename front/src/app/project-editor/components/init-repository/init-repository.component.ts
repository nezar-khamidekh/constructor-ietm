import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { DataStoreService } from 'src/app/shared/services/data-store.service';

@Component({
  selector: 'app-init-repository',
  templateUrl: './init-repository.component.html',
  styleUrls: ['./init-repository.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InitRepositoryComponent implements OnInit {
  @Input() step: number;
  @Output() changedStep = new EventEmitter();

  constructor(public dataStore: DataStoreService) {}

  ngOnInit(): void {}
}
