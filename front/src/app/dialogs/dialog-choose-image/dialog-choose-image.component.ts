import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Renderer2,
  Inject,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import * as Croppie from 'croppie';
import { CropType } from 'croppie';

interface DIALOG_DATA {
  viewport: {
    width: number;
    height: number;
    type: CropType;
  };
  boundary: {
    width: number;
    height: number;
  };
}

@Component({
  selector: 'app-dialog-choose-image',
  templateUrl: './dialog-choose-image.component.html',
  styleUrls: ['./dialog-choose-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogChooseImageComponent {
  croppieObj: any;
  fileReader = new FileReader();
  previewImage: any;
  previewImageUrl!: string;

  @ViewChild('croppie') croppie!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DIALOG_DATA,
    public dialogRef: MatDialogRef<DialogChooseImageComponent>,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
  ) {}

  onFileChange(event: any) {
    if (event.target.files[0].size > 5242880) {
      event.target.value = '';
      return;
    }

    if (this.croppie && this.croppieObj) {
      this.previewImage = '';
      this.previewImageUrl = '';
      this.croppieObj.destroy();
    }

    this.croppieObj = new Croppie(this.croppie.nativeElement, {
      enableExif: true,
      viewport: {
        width: this.data.viewport.width,
        height: this.data.viewport.height,
        type: this.data.viewport.type,
      },
      boundary: {
        width: this.data.boundary.width,
        height: this.data.boundary.height,
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
