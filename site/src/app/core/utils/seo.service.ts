import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { SettingService } from '../services';

export interface SeoSocialShareData {
  title?: string;
  keywords?: string;
  description?: string;
  image?: string;
  imageAuxData?: ImageAuxData;
  url?: string;
  type?: string;
  author?: string;
  section?: string;
  published?: string;
  modified?: string;
}

export interface ImageAuxData {
  width?: number;
  height?: number;
  secureUrl?: string;
  mimeType?: string;
  alt?: string;
}

export enum seoMetaTagAttr {
  name = 'name',
  property = 'property'
}

export interface SeoMetaTag {
  attr: seoMetaTagAttr;
  attrValue: string;
  value?: string;
}
const app_separate = ' - ';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  company_name = 'Bordignon & Bordignon';

  constructor(
    private readonly metaService: Meta,
    private readonly titleService: Title,
    private readonly setting: SettingService,

    @Inject(DOCUMENT) private document: any,    
    @Inject(PLATFORM_ID) platformId: any,
  ) { 
    this.company_name = this.setting.settingsValue?.company_name ? 
      this.setting.settingsValue?.company_name :
      this.company_name;
  }

  public setData(data: SeoSocialShareData): void {
    this.removeAllKnownTags();
    this.setSection(data.section);
    this.setKeywords(data.keywords);
    this.setTitle(data.title + app_separate + this.company_name);
    this.setType(data.type);
    this.setDescription(data.description);
    this.setImage(data.image, data.imageAuxData);
    this.setUrl(this.getCanonicalUrl());
    this.setPublished(data.published);
    this.setModified(data.modified);
    this.setAuthor(data.author);
  } 

  public setKeywords(keywords = ''): void {
    if (keywords) {
      this.metaService.updateTag({ name: 'keywords', content: keywords });
    } else {
      this.metaService.removeTag(`name='keywords'`);
    }
  }

  public setSection(section = ''): void {
    if (section) {
      this.metaService.updateTag({ name: 'article:section', content: section });
    } else {
      this.metaService.removeTag(`name='article:section'`);
    }
  }

  public setPageTitle(title = ''): void {
    if (title) {
      this.titleService.setTitle(title + app_separate + this.company_name);
    }
  }  

  public setTitle(title = ''): void {
    this.titleService.setTitle(title);
    if (title && title.length) {
      this.metaService.updateTag({ name: 'twitter:title', content: title });
      this.metaService.updateTag({ name: 'twitter:image:alt', content: title });
      this.metaService.updateTag({ property: 'og:image:alt', content: title });
      this.metaService.updateTag({ property: 'og:title', content: title });
      this.metaService.updateTag({ name: 'title', content: title });
      this.metaService.updateTag({ itemprop: 'name', content: title });
    } else {
      this.metaService.removeTag(`name='twitter:title'`);
      this.metaService.removeTag(`name='twitter:image:alt'`);
      this.metaService.removeTag(`property='og:image:alt'`);
      this.metaService.removeTag(`property='og:title'`);
      this.metaService.removeTag(`name='title'`);
      this.metaService.removeTag(`itemprop='name'`);
    }
  }

  public setType(type?: string): void {
    if (type && type.length) {
      this.metaService.updateTag({ property: 'og:type', content: type });
    } else {
      this.metaService.removeTag(`property='og:type'`);
    }
  }

  public setDescription(description?: string): void {
    if (description && description.length) {
      this.metaService.updateTag({ name: 'twitter:description', content: description });
      this.metaService.updateTag({ property: 'og:description', content: description });
      this.metaService.updateTag({ name: 'description', content: description });
      this.metaService.updateTag({ itemprop: 'description', content: description });
    } else {
      this.metaService.removeTag(`name='twitter:description'`);
      this.metaService.removeTag(`property='og:description'`);
      this.metaService.removeTag(`name='description'`);
      this.metaService.removeTag(`itemprop='description'`);
    }
  }

  public setImage(image?: string, auxData?: ImageAuxData): void {
    if (image && image.length) {
      this.metaService.updateTag({ name: 'twitter:image', content: image });
      this.metaService.updateTag({ itemprop: 'image', content: image });
      this.metaService.updateTag({ property: 'og:image', content: image });

      if (auxData && auxData.height) {
        this.metaService.updateTag({ property: 'og:image:height', content: auxData.height.toString() });
      } else {
        this.metaService.removeTag(`property='og:image:height'`);
      }

      if (auxData && auxData.width) {
        this.metaService.updateTag({ property: 'og:image:width', content: auxData.width.toString() });
      } else {
        this.metaService.removeTag(`property='og:image:width'`);
      }

      if (auxData && auxData.alt) {
        this.metaService.updateTag({ property: 'og:image:alt', content: auxData.alt });
        this.metaService.updateTag({ property: 'twitter:image:alt', content: auxData.alt });
      } else {
        this.metaService.removeTag(`property='og:image:alt'`);
        this.metaService.removeTag(`property='twitter:image:alt'`);
      }

      if (auxData && auxData.mimeType) {
        this.metaService.updateTag({ property: 'og:image:type', content: auxData.mimeType });
      } else {
        this.metaService.removeTag(`property='og:image:type'`);
      }

      if (auxData && auxData.secureUrl) {
        this.metaService.updateTag({ property: 'og:image:secure_url', content: auxData.secureUrl });
      } else {
        this.metaService.removeTag(`property='og:image:secure_url'`);
      }

    } else {
      this.metaService.removeTag(`name='twitter:image'`);
      this.metaService.removeTag(`property='twitter:image:alt'`);
      this.metaService.removeTag(`property='og:image'`);
      this.metaService.removeTag(`property='og:image:height'`);
      this.metaService.removeTag(`property='og:image:secure_url'`);
      this.metaService.removeTag(`property='og:image:type'`);
      this.metaService.removeTag(`property='og:image:alt'`);
      this.metaService.removeTag(`property='og:image:width'`);
      this.metaService.removeTag(`itemprop='image'`);
    }
  }

  public setUrl(url?: string): void {
    if (url && url.length) {
      this.metaService.updateTag({ property: 'og:url', content: url });
    } else {
      this.metaService.removeTag(`property='og:url'`);
    }
    this.setCanonicalUrl(url);
  }

  public setPublished(publishedDateString?: string): void {
    if (publishedDateString) {
      const publishedDate = new Date(publishedDateString);
      this.metaService.updateTag({ name: 'article:published_time', content: publishedDate.toISOString() });
      this.metaService.updateTag({ name: 'published_date', content: publishedDate.toISOString() });
    } else {
      this.metaService.removeTag(`name='article:published_time'`);
      this.metaService.removeTag(`name='publication_date'`);
    }
  }

  public setModified(modifiedDateString?: string): void {
    if (modifiedDateString) {
      const modifiedDate = new Date(modifiedDateString);
      this.metaService.updateTag({ name: 'article:modified_time', content: modifiedDate.toISOString() });
      this.metaService.updateTag({ name: 'og:updated_time', content: modifiedDate.toISOString() });
    } else {
      this.metaService.removeTag(`name='article:modified_time'`);
      this.metaService.removeTag(`name='og:updated_time'`);
    }
  }

  public setAuthor(author?: string): void {
    if (author && author.length) {
      this.metaService.updateTag({ name: 'article:author', content: author });
      this.metaService.updateTag({ name: 'author', content: author });
    } else {
      this.metaService.removeTag(`name='article:author'`);
      this.metaService.removeTag(`name='author'`);
    }
  }

  public setTwitterSiteCreator(site = ''): void {
    if (site) {
      this.metaService.updateTag({ name: 'twitter:site', content: site });
      this.metaService.updateTag({ name: 'twitter:creator', content: site });
    } else {
      this.metaService.removeTag(`name='twitter:site'`);
      this.metaService.removeTag(`name='twitter:creator'`);
    }
  }

  public setTwitterCard(card = ''): void {
    if (card) {
      this.metaService.updateTag({ name: 'twitter:card', content: card });
    } else {
      this.metaService.removeTag(`name='twitter:card'`);
    }
  }

  public setFbAppId(appId: string): void {
    if (appId) {
      this.metaService.updateTag({ property: 'fb:app_id', content: appId });
    } else {
      this.metaService.removeTag(`property='fb:app_id'`);
    }
  }

  public setMetaTag(metaTag: SeoMetaTag): void {
    if (metaTag.value) {
      const metaTagObject: any = {
        [metaTag.attr]: metaTag.attrValue,
        content: metaTag.value,
      };
      this.metaService.updateTag(metaTagObject);
    } else {
      const selector = `${metaTag.attr}='${metaTag.attrValue}'`;
      this.metaService.removeTag(selector);
    }
  }

  public setMetaTags(metaTags: SeoMetaTag[]): void {
    for (const metaTag of metaTags) {
      this.setMetaTag(metaTag);
    }
  }

  public setLanguageAlternativeUrl(lang: string, url?: string): void {
    // first remove potential previous url
    const selector = `link[rel='alternate'][hreflang='${lang}']`;
    const languageAlternativeElement = this.document.head.querySelector(selector);
    if (languageAlternativeElement) {
      this.document.head.removeChild(languageAlternativeElement);
    }

    if (url && url.length) {
      const link: HTMLLinkElement = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', url);
      this.document.head.appendChild(link);
    }
  }

  public setCanonicalUrl(url?: string): void {
    // first remove potential previous url
    const selector = `link[rel='canonical']`;
    const canonicalElement = this.document.head.querySelector(selector);
    if (canonicalElement) {
      this.document.head.removeChild(canonicalElement);
    }

    if (url && url.length) {
      const link: HTMLLinkElement = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', url);
      this.document.head.appendChild(link);
    }
  }

  public removeAllKnownTags() {
    this.metaService.removeTag(`property='og:title'`);
    this.metaService.removeTag(`name='twitter:title'`);
    this.metaService.removeTag(`name='description'`);
    this.metaService.removeTag(`property='og:description'`);
    this.metaService.removeTag(`name='twitter:description'`);
    this.metaService.removeTag(`property='og:image'`);
    this.metaService.removeTag(`property='og:image:width'`);
    this.metaService.removeTag(`property='og:image:height'`);
    this.metaService.removeTag(`name='twitter:image'`);
    this.metaService.removeTag(`name='twitter:card'`);
    this.metaService.removeTag(`name='twitter:site'`);
    this.metaService.removeTag(`property='og:url'`);
    this.metaService.removeTag(`property='og:locale'`);
    //this.metaService.removeTag(`property='og:type'`);
    //this.metaService.removeTag(`property='fb:app_id'`);
  }  

  private getCanonicalUrl(): string {
    return this.document.location.origin + this.document.location.pathname;
  }  

}
