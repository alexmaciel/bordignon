import { 
    Component, 
    EventEmitter, 
    HostBinding, 
    HostListener, 
    ViewChild, 
    ElementRef, 
    ChangeDetectorRef,
    ViewEncapsulation, OnInit, AfterViewInit
} from '@angular/core';
import { EventService } from './event.service';
import { LightboxCommonComponent } from './lightbox-common.component';

@Component({
    selector: '[ngx-lightbox], ngx-lightbox',
    templateUrl: './lightbox.component.html',
    encapsulation: ViewEncapsulation.None,
})

export class LightboxComponent extends LightboxCommonComponent implements OnInit, AfterViewInit {
    prevIndex!: number;
    spinnerHeight = 30;
    isZoomIn?: boolean;
    minTimeout = 30;
    preloaderTimeout = 100;
    spinnerStyles: any = {
        transform: ''
    };
    configThumbnailPreloader = true;

    swipeState = {
        phase: 'init',
        direction: 'none',
        swipeType: 'none',
        startX: 0,
        startY: 0,
        distance: 0,
        distanceX: 0,
        distanceY: 0,
        threshold: 150, // required min distance traveled to be considered swipe
        restraint: 100, // maximum distance allowed at the same time in perpendicular direction
        allowedTime: 500, // maximum time allowed to travel that distance
        elapsedTime: 0,
        startTime: 0,
    };

    events = new EventEmitter();

    @HostBinding('class.lightbox') hostLightbox = true;
    @HostBinding('class.lightbox-shown') hostShown = false;
    @HostBinding('class.lightbox-hide-controls') hideControls = false;
    @HostBinding('class.lightbox-animation') hostAnimation?: boolean;
    @HostBinding('class.lightbox-simple-mode')
    get simpleMode(){
        return this.properties?.simpleMode;
    }

    @HostBinding('class.lightbox-light') get hostLightTheme(){
        return this.properties?.backgroundColor === 'white';
    }

    @HostBinding('style.backgroundColor') override hostStyleBackgroundColor!: string;

    @ViewChild('prevImageElem') prevImageElem!: ElementRef;
    @ViewChild('lightboxContainer') lightboxContainerElem!: ElementRef;

    get currImagePath(){
        const image = this.images[this.index];
        let path;

        if (!image){
            return false;
        }

        if (image.fullImage && image.fullImage.path){
            path =  image.fullImage.path;
        } else if (image.thumbnailImage && image.thumbnailImage.path) {
            path = image.thumbnailImage.path;
        } else if (image.path){
            path = image.path;
        }

        return path;
    }

    get prevImagePath(){
        return this.images[this.prevIndex];
    }

     
    set prevImagePath(value: any ){
        this.images[this.prevIndex] = value;
    }

    get isHiddenPrevArrow(){
        return this.isFirstImage && !this.properties?.loop || this.isZoomIn;
    }
    get isHiddenNextArrow(){
        return this.isLastImage && !this.properties?.loop || this.isZoomIn;
    }

    get isPreloader(){
        return this.animationMode === 'zoom-preloader' && 
           this.showState != 'animation-end' && 
           this.currImageLoadingState === 'loading';
    }

    get imageOrientation():'vertical' | 'horizontal' {
        if (this.thumbnailImage.naturalWidth > this.thumbnailImage.naturalHeight){
            return 'horizontal';
        } else {
            return 'vertical';
        }
    }

    @HostListener('window:scroll') scrolling(){
        if (this.showState === 'initial-thumbnail-image' ||
            this.showState === 'initial-virtual-image' ||
            this.closingState === 'animation'){
            this.updateThumbnailPosition();
        }
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: any) {
        switch(event.key) {
            case 'ArrowLeft':
                this.prev();
                break;
            case 'ArrowRight':
                this.next();
                break;
            case 'Escape':
                this.closeLightbox();
                break;
        }
    }

    @HostListener("mouseenter", ['$event'])
     
    /* eslint-disable @typescript-eslint/no-explicit-any */
    onMouseEnter(event?: any) {
        this.hideControls = false;
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */

    @HostListener('transitionend', ['$event'])
    transitionEnd(event: any) {
        if (event.propertyName === "transform" && this.hostAnimation){
            this.hostAnimation = false;
        }
    }

    constructor(
        private ref: ChangeDetectorRef,
        private elementRef: ElementRef,
        public override eventService: EventService
    ) {
        super(eventService);
    }

    ngOnInit(){
        this.currentImageIndex = this.properties?.index;
        this.initialLightbox();
        this.initialSwipeToClose(this.properties?.gestureEnable);
    }

    ngAfterViewInit() {
        setTimeout(() => {
            if (this.currImageLoadingState === 'not-loaded'){
                this.currImageLoadingState = 'loading';
            }
        }, this.preloaderTimeout);

        // Mode: default
        if (this.animationMode === 'default'){ 
            setTimeout(() => {
                this.showLightboxAnimation();
            }, this.minTimeout);
        }
    }

    onImageLoaded(){
        // When opening lightbox
        if (this.animationMode === 'zoom-preloader' && 
            this.showState === 'initial-thumbnail-image'){
            this.initialLightboxVirtualImage();
            setTimeout(() => {
                this.currImageLoadingState = 'uploaded';
                this.showLightboxAnimation();
                if (this.properties?.hideThumbnail){
                    this.hideThumbnailImage();
                }
            }, this.minTimeout);
        }

        // When opening next / previous image
        if (this.showState === 'animation-end'){
            this.currImageLoadingState = 'uploaded';
            if (this.properties?.hideThumbnail){
                this.hideThumbnailImage();
            }
        }

        this.ref.detectChanges();
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    onImageError(event?: any){
        this.currImageLoadingState = 'error';
        this.initialLightboxDefault();

        setTimeout(() => {
            this.showLightboxAnimation();
        }, this.minTimeout);
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */

    onContainerClick(event: any){
        if (event.target === this.lightboxContainerElem.nativeElement || this.simpleMode){
            this.closeLightbox();
        }
    }

    initialLightbox(){
        //this.setMaxDimensions();
        this.setAnimationDuration();

        switch (this.animationMode) {
            case 'zoom-preloader':
                this.initialLightboxThumbnailImage();
                break;
            case 'default':
                this.initialLightboxDefault();
                break;
        }
    }

    initialLightboxDefault(){
        this.showState = 'initial-default';
        this.containerStyles = {
            transform: 'translate3d(0, 0, 0)',
            height: '100%',
            width: '100%',
            opacity: '0'
        }
        // next step: AfterViewInit
    }

    initialLightboxVirtualImage(){
        this.setShowState('initial-virtual-image');
        this.containerStyles = {
            transform: this.containerInitialPosition,
            height: this.virtualImageDimension.height + 'px',
            width: this.virtualImageDimension.width + 'px'
        }
        // next step: onImageLoaded() -> showLightboxAnimation()
    }

    initialLightboxThumbnailImage(){
        this.setShowState('initial-thumbnail-image');
        this.containerStyles = {
            transform: this.containerInitialPosition,
            height: this.thumbnailImagePosition.height + 'px',
            width: this.thumbnailImagePosition.width + 'px'
        }
        // next step: onImageLoaded()
    }

    initialSwipeToClose(isActive = true) {
        if (!isActive) {
          return;
        }

        const el: HTMLElement = this.elementRef.nativeElement;
        el.addEventListener('mousedown', (event: any) => this.swipeStart(event), true)
        el.addEventListener('mousemove', (event) => this.swipeMove(event), true);
        el.addEventListener('mouseup', (event) => this.swipeEnd(event), true);
        el.addEventListener('touchstart', (event) => this.swipeStart(event), true);
        el.addEventListener('touchmove', (event) => this.swipeMove(event), true);
        el.addEventListener('touchend', (event) => this.swipeEnd(event), true);        
    }   
    
    swipeStart(event: any) {
        const { pageX, pageY } = event.type === 'touchstart' ? event.changedTouches[0] : event;

        this.swipeState = {
            ...this.swipeState,
            phase: 'start',
            direction: 'none',
            distance: 0,
            startX: pageX,
            startY: pageY,
            startTime: new Date().getTime(),
        };        
    }    

    swipeMove(event: any) {
        if (this.swipeState.phase === 'none') {
          return;
        }
        const { pageX, pageY } = event.type === 'touchmove' ? event.changedTouches[0] : event;
        // get horizontal dist traveled by finger while in contact with surface
        const distanceX = pageX - this.swipeState.startX;
        // get vertical dist traveled by finger while in contact with surface
        const distanceY = pageY - this.swipeState.startY;
        let direction;
        let distance;
    
        if (Math.abs(distanceX) > Math.abs(distanceY)) {
          // if distance traveled horizontally is greater than vertically, consider this a horizontal swipe
          direction = distanceX < 0 ? 'left' : 'right';
          distance = distanceX;
        } else {
          // else consider this a vertical swipe
          direction = distanceY < 0 ? 'up' : 'down';
          distance = distanceY;
        }
        this.swipeState = {
          ...this.swipeState,
          phase: 'move',
          direction,
          distance,
          distanceX,
          distanceY,
        };
        event.preventDefault();
    }   
    
    swipeEnd(event: any) {
        if (this.swipeState.phase === 'none') {
          return;
        }
        const { allowedTime, direction, restraint, startTime, threshold, distanceX, distanceY } = this.swipeState;
        let swipeType: any;
    
        const elapsedTime = new Date().getTime() - startTime; // get time elapsed
        if (elapsedTime <= allowedTime) {
          // first condition for a swipe met
          if (Math.abs(distanceX) >= threshold && Math.abs(distanceY) <= restraint) {
            // 2nd condition for horizontal swipe met
            swipeType = direction; // set swipeType to either "left" or "right"
          } else if (Math.abs(distanceY) >= threshold && Math.abs(distanceX) <= restraint) {
            // 2nd condition for vertical swipe met
            swipeType = direction; // set swipeType to either "top" or "down"
          }
        }
    
        this.swipeState = {
          ...this.swipeState,
          phase: 'end',
          swipeType,
        };
    
        if (swipeType === 'down') {
          return this.closeLightbox();
        }
    }    

    showLightboxAnimation(){
        this.hostAnimation = true;
        this.setShowState('animation');
        this.hostShown = true;
        this.setBackgroundColor();
        this.setAnimationDuration();
        
        // Mode: zoom preloader
        if (this.animationMode === 'zoom-preloader' &&
            this.currImageLoadingState !== 'error'){ 
            this.containerStyles.transform = this.containerFullscreenPosition;
        } 

        // Mode: default
        if (this.animationMode === 'default'){
            this.containerStyles.opacity = '1';
        }
        // next step: handleLightboxTransitionEnd
    }

    showLightboxAnimationEnd(){
        this.setShowState('animation-end');
        this.containerStyles = {
            transform: 'translate3d(0, 0, 0)',
            height: '100%',
            width: '100%',
        }
    }

    closeLightbox(){
        this.setClosingState('initial');
        this.hostShown = false;
        this.closeLightboxInitial();
    }

    closeLightboxInitial(){
        this.setClosingState('initial-styles');

        // Mode: zoom preloader
        if (this.animationMode === 'zoom-preloader'){
            this.containerStyles = {
                transform: this.containerFullscreenPosition,
                height: this.virtualImageDimension.height + 'px',
                width: this.virtualImageDimension.width + 'px',
            }
        }

        // Mode: default
        if (this.animationMode === 'default'){
            this.containerStyles.opacity = '1';
        }

        setTimeout(() => {
            this.closeLightboxAnimation();
        }, this.minTimeout);
    }

    closeLightboxAnimation(){
        this.setClosingState('animation');

        // Mode: zoom preloader
        if (this.animationMode === 'zoom-preloader'){
            this.hostAnimation = true;
            this.containerStyles = {
                transform: this.containerInitialPosition,
                height: this.getContainerHeight(),
                width: this.getContainerWidth(),
            }

            this.hostStyleBackgroundColor = '';
        }

        // Mode: default
        if (this.animationMode === 'default'){
            this.hostAnimation = true;
            this.containerStyles.opacity = '0';
            this.hostStyleBackgroundColor = '';
        }

        this.setAnimationDuration();
        // next step: handleLightboxTransitionEnd

        if (this.animationDuration === 0){ // in the future, change to a type conversion getter
            this.closeLightboxAnimationEnd();
        }
    }

    closeLightboxAnimationEnd(){
        this.setClosingState('animation-end');
        this.events.emit({type: 'close'});

        // Mode: zoom preloader
        if (this.animationMode === 'zoom-preloader'){
            this.showThumbnailImage();
        }
    }

    /*
     * Transition End
     */
     
    handleLightboxTransitionEnd(event: any){
        if (this.showState === 'animation'){
            this.showLightboxAnimationEnd();
        }

        // Last close step
        if (this.closingState === 'animation'){
            this.closeLightboxAnimationEnd();
        }
    }

    next(event?: Event){
        if (this.animationMode === 'zoom-preloader'){
            this.showThumbnailImage();
        }

        if (this.isLastImage){
            if (this.properties?.loop){
                this.currentImageIndex = 0;
            } else {
                return;
            }
        } else {
            this.currentImageIndex++;
            this.currImageLoadingState = 'loading';
        }

        setTimeout(() => {
            if (this.currImageLoadingState !== 'uploaded'){
                this.currImageLoadingState = 'loading';
            }
        }, this.preloaderTimeout);
    }

    prev(event?: Event){
        if (this.animationMode === 'zoom-preloader'){
            this.showThumbnailImage();
        }

        if (this.isFirstImage){
            if (this.properties?.loop){
                this.currentImageIndex = this.latestImageIndex;
            } else {
                return;
            }
        } else {
            this.currentImageIndex--;
            this.currImageLoadingState = 'loading';
        }

        setTimeout(() => {
            if (this.currImageLoadingState !== 'uploaded'){
                this.currImageLoadingState = 'loading';
            }
        }, this.preloaderTimeout);
    }

    setMaxDimensions(){
        this.lightboxImage.nativeElement.style.maxHeight = 'calc(' + this.properties?.imageMaxHeight + ')';
        this.lightboxImage.nativeElement.style.maxWidth = this.properties?.imageMaxWidth;
    }

     
    handlePinchZoomEvents(event: any){
        if (event.type === "zoom-in"){
            this.isZoomIn = true;
        }

        if (event.type === "zoom-out"){
            this.isZoomIn = false;
        }
    }

    getContainerWidth():string {
        return this.thumbnailImagePosition.width / this.containerScale + 'px';
    }
} 