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

export interface OffsetFactorOrientationI {
  x: number;
  y: number;
  z: number;
}

export interface AxisAngleOrientationI {
  x: number;
  y: number;
  z: number;
}

@Component({
  selector: 'app-view-cube',
  templateUrl: './view-cube.component.html',
  styleUrls: ['./view-cube.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewCubeComponent implements OnInit {
  Math: any;

  @ViewChild('cube') cube!: ElementRef;

  constructor(private renderer: Renderer2, public sceneService: SceneService) {
    this.Math = Math;
  }

  ngOnInit(): void {}

  positionSettingsCube() {
    this.renderer.setStyle(
      this.cube.nativeElement,
      'transform',
      'translateZ(-500px)' + ' ' + `${this.sceneService.getCameraCSSMatrix()}`,
    );
  }
}
