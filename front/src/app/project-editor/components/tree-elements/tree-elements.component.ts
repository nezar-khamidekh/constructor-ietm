import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-tree-elements',
  templateUrl: './tree-elements.component.html',
  styleUrls: ['./tree-elements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeElementsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
