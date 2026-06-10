import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LayoutInitService {

    reInitProps() {
        // init base layout
        this.initLayoutSettings();
        this.initHeader();
    }

    private initLayoutSettings() {
        // clear body classes
        if (typeof document !== 'undefined') {
            const bodyClasses = document.body.classList.value.split(' ');
            bodyClasses.forEach((cssClass) => document.body.classList.remove(cssClass));
            // clear body attributes
            const bodyAttributes = document.body
            .getAttributeNames()
            .filter((t) => t.indexOf('data-') > -1);
            bodyAttributes.forEach((attr) => document.body.removeAttribute(attr));
            document.body.setAttribute('style', '');
            document.body.setAttribute('id', 'mv_app_body');
            document.body.setAttribute('data-mv-name', 'bordignon');
            document.body.setAttribute('data-mv-app-header-fixed', 'true');
            document.body.setAttribute('data-mv-app-header-static', 'false');
            document.body.setAttribute('data-mv-app-header-color', 'color');
            document.body.setAttribute('data-mv-app-sidebar-enabled', 'true');
            document.body.classList.add('app-default');      
        }  
    }

    private initHeader() {
		let timer: number = 0,
            scrollPosition: number = 0,
            height: number | any = 0;

        // clear body classes
        if (typeof document !== 'undefined') {        
            document.body.addEventListener('scroll', e => {
                scrollPosition = document.body.scrollTop;
                height = document.querySelector('.app-header')?.getBoundingClientRect().height;

                if(scrollPosition > height) {
                    document.body.setAttribute('data-mv-app-header-sticky', 'true');
                } else if (scrollPosition < height) {
                    document.body.removeAttribute('data-mv-app-header-sticky');
                }

                return;
            });    
        }    
    }
}