import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Renderer2,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import * as Croppie from 'croppie';

@Component({
  selector: 'app-dialog-choose-image',
  templateUrl: './dialog-choose-image.component.html',
  styleUrls: ['./dialog-choose-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogChooseImageComponent implements OnInit {
  croppieObj: any;
  fileReader = new FileReader();
  previewImage: any;
  previewImageUrl!: string;

  @ViewChild('croppie') croppie!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<DialogChooseImageComponent>,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {}

  onFileChange(event: any) {
    if (event.target.files[0].size > 5242880) {
      //snackbar
      event.target.value = '';
      return;
    }

    if (this.croppie && this.croppie.nativeElement.className === 'croppie-container') {
      this.croppieObj.destroy();
    }

    this.croppieObj = new Croppie(this.croppie.nativeElement, {
      enableExif: true,
      viewport: {
        width: 100,
        height: 100,
        type: 'circle',
      },
      boundary: {
        width: 150,
        height: 200,
      },
      mouseWheelZoom: false,
      enableOrientation: true,
    });

    this.fileReader.onload = (e1: any) => {
      this.cdr.detectChanges();
      this.croppieObj
        .bind({
          url: e1.target.result,
        })
        .then(() => {
          event.target.value = '';
          this.updateImageResult();
          this.renderer.listen(this.croppie.nativeElement, 'update', () => {
            this.updateImageResult();
          });
        });
    };

    this.fileReader.readAsDataURL(event.target.files[0]);
  }

  updateImageResult() {
    this.croppieObj.result({ type: 'base64', size: 'viewport' }).then((crop: any) => {
      this.previewImage = this.sanitizer.bypassSecurityTrustResourceUrl(crop);
      this.previewImageUrl = crop;
      this.cdr.detectChanges();
    });
  }
}
