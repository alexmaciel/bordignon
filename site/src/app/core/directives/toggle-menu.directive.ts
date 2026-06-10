import { Directive, HostListener, Renderer2, ElementRef, OnDestroy, OnInit, Inject, AfterViewInit, afterRender } from '@angular/core';
import { NavigationCancel, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import gsap from "gsap";

@Directive({
  selector: '[data-toggle]'
})
export class ToggleMenuDirective implements AfterViewInit, OnDestroy {
  element!: HTMLElement;

  aside!: HTMLElement | null;
  asideMenu!: HTMLElement | null;
  asideContent!: HTMLElement | null;
  asideGrid!: HTMLElement | null;
  asideBackdrop!: HTMLElement | null | any;

  body!: HTMLElement;

  clicked?: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(ElementRef) private _element: ElementRef,
    @Inject(Renderer2) private _renderer: Renderer2,
    // Router  
    private router: Router, 
  ) { 
    //afterRender(() => this.handlers())
  }

  ngAfterViewInit(): void {
    this.element = this._element.nativeElement;

    if (typeof document !== 'undefined') {
      this.aside = document.querySelector('.app-aside');
      this.asideMenu = document.querySelector('.app-aside-menu');
      this.asideContent = document.querySelector('.app-aside-content');
      this.asideGrid = document.querySelector('.app-aside-grid');
      this.asideBackdrop = document.querySelector('.app-aside-backdrop');

      this.body = document.body;
    }

    const sb = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.hide();
      }
    });
    this.subscriptions.push(sb);      
  }

  @HostListener('click', ['$event']) onClick(ev: Event): void {
    ev.preventDefault();   
    return this.toggle();
  }

  handlers() {
    this.asideBackdrop.addEventListener("click", () => {
      return this.hide()
    });  
  }

  toggle(): void {
    return this.clicked ? this.hide() : this.show();
  }

  private show() {
    this.clicked = true;

    this._renderer.setAttribute(this.body, "data-mv-app-aside-minimize", "on"); 
    this.open();    
  }

  private hide() {
    this.clicked = false;

    setTimeout(() => {
      this._renderer.removeAttribute(this.body, "data-mv-app-aside-minimize");
    }, 500)
    this.close();    
  }

  /**
   * Toggle this sidenav. This is equivalent to calling open() when it's already opened, or close() when it's closed.
   */  
  private open() {
    const tl =  gsap.timeline();
    const change = [this.asideBackdrop, this.asideContent, this.asideGrid];
    tl.set(change, {
      willChange: "transform,opacity,background-color"
    }).fromTo(this.asideBackdrop, {
        opacity: 0
    }, {
        opacity: 1,
        duration: .3
    }, 0).fromTo(this.asideContent, {
        x: "100%"
    }, {
        x: "0%",
        ease: "expo.out",
        duration: 1
    }, 0).fromTo(this.asideGrid, {
        x: "-35%"
    }, {
        x: "0%",
        ease: "expo.out",
        duration: 1
    }, 0).fromTo(this.asideGrid, {
        opacity: 0
    }, {
        opacity: 1,
        duration: .3
    }, .1).set(change, {
        willChange: "auto"
    });
  } 

  /**
   * Close this sidenav, and return a Promise that will resolve when it's fully closed (or get rejected if it didn't).
   *
   * @returns Promise<any>
   */  
  private close() {
    const tl =  gsap.timeline();
    const change = [this.asideBackdrop, this.asideContent, this.asideGrid];    
    tl.set(change, {
      willChange: "transform,opacity"
    }).fromTo(this.asideBackdrop, {
      opacity: 1
    }, {
      opacity: 0,
      duration: .3
    }, 0).fromTo(this.asideGrid, {
      opacity: 1
    }, {
        opacity: 0,
        duration: .2
    }, 0).fromTo(this.asideContent, {
      x: "0%"
    }, {
      x: "100%",
      duration: .3
    }, 0).set(change, {
      willChange: "auto"
    });    
  }     

  ngOnDestroy(): void {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }  
}
