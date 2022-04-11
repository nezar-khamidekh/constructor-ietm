import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appDnd]',
})
export class DndDirective {
  @Output() fileDropped = new EventEmitter<any>();

  @HostListener('drop', ['$event']) public ondrop(e: any) {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];

    if (file) {
      this.fileDropped.emit(file);
    }
  }
}
