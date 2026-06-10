import { 
	Injectable, 
	Injector, 
	ComponentFactoryResolver, 
	EmbeddedViewRef, 
	ApplicationRef, 
} from '@angular/core';

import { LightboxComponent } from './lightbox.component';
import { DefaultProperties } from './default-properties';
import { Properties, LightboxData } from './interfaces';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface AdComponent {
	lightboxData: LightboxData; 
	events: any;
}

@Injectable()
export class NgxLightbox {
	isMobile?: boolean;
	_defaultProperties!: Properties;

	constructor(
		private componentFactoryResolver: ComponentFactoryResolver,
		private appRef: ApplicationRef,
		private injector: Injector
	) {}
 
	/* eslint-disable @typescript-eslint/no-explicit-any */
	appendComponentToBody(component: any, lightboxData: LightboxData) {		
        const componentRef = this.componentFactoryResolver
            .resolveComponentFactory(component)
            .create(this.injector);

		(componentRef.instance as AdComponent).lightboxData = lightboxData;

		this.appRef.attachView(componentRef.hostView);
		const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

		// Add to body
		document.body.appendChild(domElem);
		
        (componentRef.instance as AdComponent).events.subscribe((event: any) => {
        	if (event.type === 'close'){
				this.appRef.detachView(componentRef.hostView);
				componentRef.destroy();
			}
        });
	}
	/* eslint-disable @typescript-eslint/no-explicit-any */
	open(lightboxData: LightboxData){
		lightboxData.properties = this.applyPropertieDefaults(DefaultProperties, lightboxData.properties);
        const component = this.getLightboxComponent();
		this.appendComponentToBody(component, lightboxData);
	}

	getLightboxComponent(){
		return LightboxComponent;
	}

	applyPropertieDefaults(defaultProperties: any, properties: any){
		if (!properties) {
			properties = {};
		}

		if (!properties.index){ 
			properties.index = 0;
		}
		this._defaultProperties = Object.assign({}, defaultProperties);
		return Object.assign(this._defaultProperties, properties);
	}
}