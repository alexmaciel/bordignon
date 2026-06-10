import { Directive, HostBinding, ContentChildren, QueryList } from '@angular/core';

import { EventService } from './event.service';
import { LightboxDirective } from'./lightbox.directive' 
import { NgxLightbox } from'./lightbox.service';
import { Properties, ImageExtended } from './interfaces';

@Directive({
    selector: '[lightbox-group]'
})

export class LightboxGroupDirective {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    thumbnailImageElement: any | undefined;
    thumbnailLightboxDirective!: LightboxDirective;
    thumbnailImageIndex!: number | any | undefined;
    thumbnailImages: any[] = [];
    images: any[] = [];
    properties: Properties = {}; 
    globalEventsSubscription;
    /* eslint-disable @typescript-eslint/no-explicit-any */

    get lightboxDirectiveList(){
        if (this._lightboxDirectiveList){
            return this._lightboxDirectiveList.toArray();
        } else {
            return [];
        }
    }

    @HostBinding('class.lightbox-group') hostLightboxGroup = true;
    @ContentChildren(LightboxDirective, {descendants: true}) _lightboxDirectiveList!: QueryList<LightboxDirective>; 
    constructor(
        private eventService: EventService,
        private lightbox: NgxLightbox) {

        this.globalEventsSubscription = this.eventService.emitter.subscribe(
            (event) => {
                this.handleGlobalEvents(event); 
            }
        );
    }

    handleGlobalEvents(event: any){
        if (event.type === 'thumbnail:click'){
            this.thumbnailImageElement = event.elementRef.nativeElement;
            this.thumbnailImages = this.getThumbnailImages();
            this.thumbnailImageIndex = this.getThumbnailImageIndex(this.thumbnailImageElement);

            if (this.thumbnailImageIndex == undefined){
                return;
            }

            this.thumbnailLightboxDirective = this.getThumbnailLightboxDirective(this.thumbnailImageIndex);
            this.images = this.getImages();
            this.properties = event.properties;
            this.properties.index = this.thumbnailImageIndex;

            this.lightbox.open({
                images: this.images,
                //index: this.thumbnailImageIndex,
                properties: this.properties
            });
        }
    }

    getThumbnailImageIndex(element: any){
        const images = this.thumbnailImages;
        for (let i = 0; i < images.length; i++) {
            if (element === images[i]){
                return i;
            }
        }
        return;
    }

    getThumbnailLightboxDirective(index: number){
        return this.lightboxDirectiveList[index];
    }

    getThumbnailImages(){
        const thumbnailImages: any = [];
        this.lightboxDirectiveList.forEach(el => {
            thumbnailImages.push(el['elementRef'].nativeElement);
        });
        return thumbnailImages;
    }

    getImages(){
        const images: any = [];
        this.lightboxDirectiveList.forEach(el => {
            const image: ImageExtended = {};
            const nativeElement = el['elementRef'].nativeElement;

            if (el.fullImage){
                image.fullImage = el.fullImage;
            }

            image.thumbnailImage = {
                path: nativeElement.src,
                height: nativeElement.naturalHeight,
                width: nativeElement.naturalWidth
            }

            image.nativeElement = nativeElement;
            images.push(image);
        });

        return images;
    }
}
