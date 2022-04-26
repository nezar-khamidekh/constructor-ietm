import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RepositoryI } from '../shared/models/repository.interface';

@Component({
  selector: 'app-repository',
  templateUrl: './repository.component.html',
  styleUrls: ['./repository.component.scss'],
})
export class RepositoryComponent implements OnInit {
  repository!: RepositoryI;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.repository = this.route.snapshot.data.repository;
  }
}
