import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RepositoryI } from '../shared/models/repository.interface';

@Component({
  selector: 'app-favorite-repositories',
  templateUrl: './favorite-repositories.component.html',
  styleUrls: ['./favorite-repositories.component.scss'],
})
export class FavoriteRepositoriesComponent implements OnInit {
  repositories: RepositoryI[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.repositories = this.route.snapshot.data.repositories.map(
      (favoriteRepository: any) => favoriteRepository.repository,
    );
  }
}
