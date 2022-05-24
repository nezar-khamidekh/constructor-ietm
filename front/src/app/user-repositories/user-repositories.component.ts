import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RepositoryI } from '../shared/models/repository.interface';

@Component({
  selector: 'app-user-repositories',
  templateUrl: './user-repositories.component.html',
  styleUrls: ['./user-repositories.component.scss'],
})
export class UserRepositoriesComponent implements OnInit {
  repositories: RepositoryI[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.repositories = this.route.snapshot.data.repositories;
  }
}
