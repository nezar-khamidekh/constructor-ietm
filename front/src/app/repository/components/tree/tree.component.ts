import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TreeStructureI } from 'src/app/shared/models/treeStructure.interface';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss'],
})
export class TreeComponent implements OnInit {
  tree: TreeStructureI;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.tree = this.route.snapshot.parent?.data.repository.modelTree;

    if (!this.tree) this.router.navigate(['..'], { relativeTo: this.route });
  }
}
