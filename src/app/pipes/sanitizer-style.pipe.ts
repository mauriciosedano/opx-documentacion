import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'sanitizerStyle'
})
export class SanitizerStylePipe implements PipeTransform {

  constructor(private domSanitizer: DomSanitizer) { }

  transform(url: string): any {
    return this.domSanitizer.bypassSecurityTrustStyle(url);
  }

}
