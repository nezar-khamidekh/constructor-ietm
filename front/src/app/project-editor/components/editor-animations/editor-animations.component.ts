import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { SceneService } from 'src/app/scene/services/scene.service';

@Component({
  selector: 'app-editor-animations',
  templateUrl: './editor-animations.component.html',
  styleUrls: ['./editor-animations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorAnimationsComponent implements OnInit {
  isPlaying = false;

  constructor(private sceneService: SceneService) {}

  ngOnInit(): void {}

  play() {
    this.isPlaying = true;
    this.sceneService.playAnimation();
  }

  pause() {
    this.isPlaying = false;
    this.sceneService.pauseAnimation();
  }

  stop() {
    this.isPlaying = false;
    this.sceneService.stopAnimation();
  }
}
