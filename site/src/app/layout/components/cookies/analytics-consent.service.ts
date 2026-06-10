import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsConsentService {
  private renderer: Renderer2;
  private gaScriptEl?: HTMLScriptElement;
  private gaConfigId?: string;

  private fbScriptEl?: HTMLScriptElement;
  private fbNoScriptEl?: HTMLIFrameElement;
  private fbPixelId?: string;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /** Carrega GA4 somente após consentimento */
  enableGA4(measurementId: string) {
    if (this.gaScriptEl) return; // já carregado
    this.gaConfigId = measurementId;

    // dataLayer e gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); } as any;

    // (Opcional) Timestamp inicial
    window.gtag('js', new Date());

    // Injeta script gtag.js
    const s = this.renderer.createElement('script') as HTMLScriptElement;
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    this.renderer.appendChild(document.head, s);
    this.gaScriptEl = s;

    // Config GA4
    window.gtag('config', measurementId, { anonymize_ip: true });
  }

  /** Remove GA4 (não remove hits já enviados) */
  disableGA4() {
    if (this.gaScriptEl?.parentNode) {
      this.gaScriptEl.parentNode.removeChild(this.gaScriptEl);
    }
    this.gaScriptEl = undefined;
    this.gaConfigId = undefined;
    // Opcional: limpar dataLayer/gtag (cautela se usa GTM)
    // window.dataLayer = [];
    // delete window.gtag;
  }

  /** Carrega Meta Pixel somente após consentimento */
  enableMetaPixel(pixelId: string) {
    if (this.fbScriptEl) return; // já carregado
    this.fbPixelId = pixelId;

    // Boot do fbq
    (function (f: any, b: Document, e: string, v?: any, n?: any, t?: HTMLScriptElement, s?: HTMLScriptElement) {
    if ((f as any).fbq) return;
    n = (f as any).fbq = function () {
        (n as any).callMethod ? (n as any).callMethod.apply(n, arguments) : (n as any).queue.push(arguments);
    };
    if (!(f as any)._fbq) (f as any)._fbq = n;
    (n as any).push = n;
    (n as any).loaded = true;
    (n as any).version = '2.0';
    (n as any).queue = [];
    t = b.createElement(e) as HTMLScriptElement; t.async = true;
    t.src = 'https://connect.facebook.net/en_US/fbevents.js';
    s = b.getElementsByTagName(e)[0] as HTMLScriptElement;
    s.parentNode!.insertBefore(t, s);
    })(window, document, 'script');

    // Inicializa e track PageView
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');

    // Guardar referência ao script inserido para desligar depois
    // (o snippet do Meta insere o <script> antes do primeiro script do doc)
    // não é trivial pegar o handle; alternativa: deixar como está e só não chamar mais fbq.
  }

  /** Desabilita Meta Pixel (não remove histórico) */
  disableMetaPixel() {
    // Não há API oficial para "descarregar" fbq.
    // Estratégia mínima: sobrescrever fbq por um no-op para impedir futuros envios.
    (window as any).fbq = (..._args: any[]) => {};
    this.fbScriptEl = undefined;
    this.fbPixelId = undefined;
  }
}
