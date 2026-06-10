import { Directive, ElementRef, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// typical import
import gsap from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

@Directive({
  selector: '[data-link-scroll]'
})
export class LinkScrollDirective implements OnInit {

  private getEl: HTMLElement | any | null;
  private getBody: HTMLElement | any | null; 
  private getLinks: HTMLElement | any | null; 

  deltaY = 0;

  constructor(
    private readonly el: ElementRef, 
    @Inject(PLATFORM_ID) private platformId: object,
  ) {
    // import gsap from "gsap"
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);     
  }

  ngOnInit(): void {
    this.init();
  }

  init() {
     if (isPlatformBrowser(this.platformId)) {
      Object.assign(this.getEl = this.el.nativeElement);

      if (typeof document !== 'undefined') {
        this.getLinks = this.getEl.querySelectorAll('.app-link-scroll');
      }      

      const timer = 0;
      this.throttle(timer, () => {
        this.initLinks();
        this.initScrolling();
      });	  
    }
  }

  private initScrolling() {}

  private initLinks() {
    this.getLinks.forEach((link: any) => {   
      link.addEventListener("click", (e: Event) => {
        const hash = link.hash.replace('#', '');
        const url: any = document.getElementById(hash);
        link.setAttribute('href', `/#${hash}`);
        link.setAttribute('fragment', `${hash}`);
        //link.setAttribute('routerlink', `/${this.slug}`);
        e.preventDefault();
        gsap.to(document.body, {
            duration: 1,
            scrollTo:{
              y: url,
              autoKill: false
          },
          ease: "power2.out"          
        });
      });           
    });    
  }

	// Throttle function: Input as function which needs to be throttled and delay is the time interval in milliseconds
	throttle(timer: number | undefined, func: Function, delay?: number) {
		// If setTimeout is already scheduled, no need to do anything
		if (timer) {
			return
		}
	
		// Schedule a setTimeout after delay seconds
		timer = window.setTimeout(function () {
			func()
			// Once setTimeout function execution is finished, timerId = undefined so that in <br>
			// the next scroll event function execution can be scheduled by the setTimeout
			timer = undefined
		}, delay)
	}	   
}
