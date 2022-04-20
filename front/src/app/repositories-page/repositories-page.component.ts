import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RepositoryI } from '../shared/models/repository.interface';

@Component({
  selector: 'app-repositories-page',
  templateUrl: './repositories-page.component.html',
  styleUrls: ['./repositories-page.component.scss'],
})
export class RepositoriesPageComponent implements OnInit {
  repositories: RepositoryI[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.repositories = this.route.snapshot.data.repositories;
  }
}
