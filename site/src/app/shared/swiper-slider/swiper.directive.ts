import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';
import { SwiperContainer } from 'swiper/element/bundle';
import { SwiperOptions } from 'swiper/types';

 
@Directive({
  selector: '[swiperElement]',
})
 
export class NgxSwiperDirective  implements AfterViewInit {
  @Input() config?: SwiperOptions;

  constructor(private el: ElementRef<SwiperContainer>) { }

  ngAfterViewInit(): void {
    setTimeout(() => {
    Object.assign(this.el.nativeElement, this.config);
     
    this.el.nativeElement?.initialize();
    }, 1000);
  }

  changeSlide(prevOrNext: number): void {
    if (prevOrNext === -1) {
      this.el.nativeElement.swiper.slidePrev();
    } else {
      this.el.nativeElement.swiper.slideNext();
    }
  }  
}
