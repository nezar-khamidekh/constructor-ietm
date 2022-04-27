import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Renderer2,
  ViewChild,
  ElementRef,
} from '@angular/core';
import * as THREE from 'three';
import { SceneService } from '../../services/scene.service';

@Component({
  selector: 'app-view-cube',
  templateUrl: './view-cube.component.html',
  styleUrls: ['./view-cube.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewCubeComponent implements OnInit {
  @ViewChild('cube') cube!: ElementRef;

  constructor(private renderer: Renderer2, private sceneService: SceneService) {}

  ngOnInit(): void {}

  positionSettingsCube() {
    this.renderer.setStyle(
      this.cube.nativeElement,
      'transform',
      'translateZ(-500px)' + ' ' + `${this.sceneService.getCameraCSSMatrix()}`,
    );
  }
}
