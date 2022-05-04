import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RepositoryI } from '../shared/models/repository.interface';
import { RepositoryType } from '../shared/models/repositoryTypeEnum';

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

  getRepositoryTypeEnum() {
    return RepositoryType;
  }
}
