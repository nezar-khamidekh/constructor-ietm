import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SecurityContext,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: '[appImageSanitized]',
})
export class ImageSanitizedDirective implements OnInit, OnChanges {
  constructor(
    private element: ElementRef,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer,
  ) {}

  @Input() imagePath = '';
  @Input() defaultImage = '';

  ngOnInit(): void {
    this.setImageFromImagePath();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.imagePath && !changes.imagePath.firstChange) {
      this.setImageFromImagePath();
    }
    if (changes.defaultImage && !changes.defaultImage.firstChange && !this.imagePath) {
      this.setImageFromImagePath();
    }
  }

  setImageFromImagePath() {
    if (this.imagePath) {
      const image = this.sanitizer.bypassSecurityTrustResourceUrl(this.imagePath);
      this.setImageSrc(this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, image)!);
    } else this.setImageSrc(this.defaultImage);
  }

  setImageSrc(imageSrc: string) {
    this.renderer.setAttribute(this.element.nativeElement, 'src', imageSrc);
  }
}
