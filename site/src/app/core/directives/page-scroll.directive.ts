import { afterNextRender, AfterViewInit, Directive, ElementRef, Inject, NgZone, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// typical import
import { gsap } from 'gsap';

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";

export const instances = {
  scroll: undefined,
  slider: undefined,
};

@Directive({
  selector: '[data-page-scrolling]',
})
export class PageScrollDirective implements OnDestroy {
  
  private getEl!: ElementRef<HTMLElement>;
  private getSmoother!: HTMLElement | any;

  private getItems: any[] = [];
  private getImage: HTMLElement[] | undefined; 
  private getText: HTMLElement | any; 
  private getImageInner: HTMLElement | any | null; 
  
  private getPage: HTMLElement | null = null; 
  private getWrapper: HTMLElement | null = null; 

  private getHeader: HTMLElement | null = null; 
  private getFooter: HTMLElement | null = null; 


  private getAnims: gsap.core.Tween[] = [];
  private getFooterAnims: gsap.core.Timeline[] = [];
  private getSplitsInstances: SplitText[] = [];
  private createdTriggers: ScrollTrigger[] = [];

  private resizeObs?: ResizeObserver;

  deltaY = 0;

  private _isBrowser = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private zone: NgZone,      
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);

    if (this._isBrowser) {
      // import gsap from "gsap"
      gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, ScrollToPlugin);  
      gsap.defaults({ overwrite: 'auto' });
    }

    afterNextRender(() => {
      this.browserOnly(() => {
        this.safeInit();
      });
    });    
  }

  // Run the function only in the browser
  browserOnly(f: () => void) {
    if (this._isBrowser) {
      this.zone.runOutsideAngular(() => {
        f();
      });
    }
  }    


  ngOnDestroy(): void {
    if (!this._isBrowser) return;
    this.browserOnly(() => {
      this.killScrollTriggers();
    });
  }

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' &&
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  async safeInit() {
    this.killScrollTriggers();

    // Cache elementos
    this.getPage    = document.getElementById('app-page');
    this.getWrapper = document.getElementById('app-wrapper');
    this.getFooter  = document.getElementById('app-footer');

    if (this.getPage)    ScrollTrigger.saveStyles(this.getPage);
    if (this.getWrapper) ScrollTrigger.saveStyles(this.getWrapper);

    await new Promise<void>(r => requestAnimationFrame(() => r()));
    await this.init();

    if ('ResizeObserver' in window && !this.resizeObs && this.getWrapper) {
      let raf = 0;
      this.resizeObs = new ResizeObserver(() => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          ScrollTrigger.refresh();
        });        
      });
      this.resizeObs.observe(this.getWrapper);
    } 
    
    ScrollTrigger.refresh();
  }

  private killScrollTriggers() {
    this.getSmoother?.kill();
    this.getSmoother = null;

    this.getAnims.forEach(anim => anim.kill());
    this.getAnims = [];

    this.getFooterAnims.forEach(trigger => trigger.kill());
    this.getFooterAnims = [];    

    this.createdTriggers.forEach(trigger => trigger.kill());
    this.createdTriggers = [];

    this.getSplitsInstances.forEach(split => split.revert());  
    this.getSplitsInstances = [];
    
    //ScrollTrigger.getAll().forEach(st => st.kill());
    this.resizeObs?.disconnect();
    this.resizeObs = undefined;    
  }

  async init(): Promise<void>  {
    if (typeof document === 'undefined') return;

    // ScrollTrigger animations for scrolling
    const prev = ScrollSmoother.get();
    prev?.scrollTo(0);
    prev?.kill();

    const canSmooth = !this.prefersReducedMotion() && this.getPage && this.getWrapper;

    // Get the current ScrollSmoother instance and 'reset' it
    const previouslyCreatedSmoother = ScrollSmoother.get();  
    previouslyCreatedSmoother?.scrollTo(0);
    previouslyCreatedSmoother?.kill();

    // create the smooth scroller
    if (canSmooth) {
      this.getSmoother = ScrollSmoother.create({
        wrapper: this.getPage,
        content: this.getWrapper,
        smooth: 1.2,
        effects: true,
        //normalizeScroll: true,
        smoothTouch: 0.1,
        onUpdate: (self) => {
          let scrollPosition = 0,
              height: number | any = 0;

          scrollPosition = self.scrollTop();
          height = document.querySelector('.app-header')?.getBoundingClientRect().height;

          if(scrollPosition > height) {
            document.body.setAttribute('data-mv-app-header-sticky', 'true');
          }  else if (scrollPosition < height) {
            document.body.removeAttribute('data-mv-app-header-sticky');
          }   
        }
      });      

      this.getSmoother.scrollTo(0, false);

      this.initSplits();
      this.initFooter();
    }
  } 

  initSplits(): void {
    const splitNodes = Array.from(document.querySelectorAll<HTMLElement>('#splits'));
    if (!splitNodes) return

    splitNodes.forEach((el: Element) => {
      // const el = splitRef.nativeElement as HTMLElement;
      // Criar SplitText
      const splitInstance = new SplitText(el, {
        type: 'lines,words,chars',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        mask: 'chars',
        autoSplit: true        
      });
      this.getSplitsInstances.push(splitInstance);
      // Criar animação GSAP
      const tween = gsap.from(splitInstance.chars, {
        scrollTrigger: {
          trigger: el,
          toggleActions: 'restart pause resume reverse',
        },
        duration: this.prefersReducedMotion() ? 0 : 0.25,
        delay: this.prefersReducedMotion() ? 0 : 0.25,
        yPercent: this.prefersReducedMotion() ? 0 : 100,
        rotateZ: this.prefersReducedMotion() ? 0 : 6,
        opacity:this.prefersReducedMotion() ? 1 : 0,
        stagger: this.prefersReducedMotion() ? 0 : 0.01
      });
      this.getAnims.push(tween);

      if (tween.scrollTrigger) this.createdTriggers.push(tween.scrollTrigger);
    });
  }

  initFooter() {
    if (!this.getWrapper || !this.getFooter) return;

    const footerInner = this.getFooter?.querySelector('.app-footer-content') as HTMLElement | null;
    if (!footerInner) return;

    const trigger = gsap.timeline({
      scrollTrigger: {
        trigger: this.getWrapper,
        scrub: this.prefersReducedMotion() ? false : 1,
        start: "center bottom+=25%",
        end: "bottom bottom",
        invalidateOnRefresh: true,
      },
      defaults: {
        ease: "none"
      }
    });   
    trigger.fromTo(footerInner, {
      opacity: 0,
      yPercent: -50,
    }, {
      opacity: 1,
      yPercent: 0,
      ease: "none",
    });
    this.getFooterAnims.push(trigger);

    if (trigger.scrollTrigger) this.createdTriggers.push(trigger.scrollTrigger);
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
