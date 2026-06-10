// Angular
import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ 
    name: 'datelocale', 
    pure: false 
})
export class DateLocalePipe implements PipeTransform {

    constructor(private translate: TranslateService) { }

    /**
     * 
     * @param value string
     * @param format date
     * @returns 
     */
    transform(value: Date | string | number, format = 'longDate'): string {
        if (!value) return '';

        const lang = this.translate.currentLang || 'pt-BR';

        const localeMap: any = {
        pt: 'pt-BR',
        en: 'en-US',
        es: 'es-ES'
        };

        const locale = localeMap[lang] || lang;

        return formatDate(value, format, locale);
    }    
}