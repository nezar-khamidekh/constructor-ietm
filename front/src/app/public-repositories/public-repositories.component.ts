import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { skip, switchMap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { RepositoryI } from '../shared/models/repository.interface';
import { RepositoryService } from '../shared/services/repository.service';

@Component({
  selector: 'app-public-repositories',
  templateUrl: './public-repositories.component.html',
  styleUrls: ['./public-repositories.component.scss'],
})
export class PublicRepositoriesComponent implements OnInit, OnDestroy {
  private subs = new SubSink();

  repositories: RepositoryI[] = [];

  constructor(private route: ActivatedRoute, private repositoryService: RepositoryService) {}

  ngOnInit(): void {
    this.repositories = this.route.snapshot.data.repositories;

    this.subs.add(
      this.route.queryParams
        .pipe(
          skip(1),
          switchMap((queryParams) => {
            if (queryParams.searchQuery) {
              return this.repositoryService.find(queryParams.searchQuery);
            } else {
              return this.repositoryService.getAll();
            }
          }),
        )
        .subscribe((repositories) => {
          this.repositories = repositories;
        }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
