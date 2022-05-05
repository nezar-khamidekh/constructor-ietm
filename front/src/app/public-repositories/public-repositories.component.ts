import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RepositoryI } from '../shared/models/repository.interface';

@Component({
  selector: 'app-public-repositories',
  templateUrl: './public-repositories.component.html',
  styleUrls: ['./public-repositories.component.scss'],
})
export class PublicRepositoriesComponent implements OnInit {
  repositories: RepositoryI[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.repositories = this.route.snapshot.data.repositories;
  }
}
