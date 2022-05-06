import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-editor-manual',
  templateUrl: './editor-manual.component.html',
  styleUrls: ['./editor-manual.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorManualComponent implements OnInit {
  animations = [
    { name: 'Анимация 1', start: '0:00', end: '0:05' },
    { name: 'Анимация 2', start: '0:00', end: '0:05' },
    { name: 'Анимация 3', start: '0:00', end: '0:05' },
    { name: 'Анимация 4', start: '0:00', end: '0:05' },
  ];
  selectedAnimation = this.animations[0].name;

  curSecondsOnTimeline = 0;
  maxDuration = 125;
  output = '00:00';

  constructor() {}

  ngOnInit(): void {}

  changeAnimation(e: any) {}

  changeTime(e: any) {
    this.curSecondsOnTimeline = e.value;
    const minutes = String(Math.floor(this.curSecondsOnTimeline / 60)).padStart(2, '0');
    const seconds = String(this.curSecondsOnTimeline % 60).padStart(2, '0');
    this.output = minutes + ':' + seconds;
  }
}
