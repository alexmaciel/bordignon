import { afterNextRender, AfterViewInit, Component, ContentChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import { SwiperContainer } from 'swiper/element/bundle';
import { SwiperOptions } from 'swiper/types';

@Component({
  selector: '[ngx-swiper], ngx-swiper',
  templateUrl: './swiper.component.html',
  styleUrl: './swiper.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SwiperComponent implements AfterViewInit {
  @ContentChild('swiper') swiperRef!: ElementRef<SwiperContainer>;

  @Input() swiperContainerId = '';
  @Input() config?: SwiperOptions;
  
  index = 0;
  slidePerView = 1;
  initialized = false;

  constructor() { 
    afterNextRender(() => {
      Object.assign(this.swiperRef.nativeElement, this.config);
       
      this.swiperRef.nativeElement?.initialize();           
      
      document.addEventListener("resize", () => this.swiperRef.nativeElement?.initialize(), true);  
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        document
          .getElementById(this.swiperContainerId)
          ?.getElementsByClassName('slider')[0]?.shadowRoot
          ?.firstChild as HTMLElement;
      }
    }, 300);
  }

  changeSlide(prevOrNext: number): void {
    if (prevOrNext === -1) {
      this.swiperRef.nativeElement.swiper.slidePrev();
    } else {
      this.swiperRef.nativeElement.swiper.slideNext();
    }
  }

}
