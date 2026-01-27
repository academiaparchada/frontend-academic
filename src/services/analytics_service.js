// src/services/analytics_service.js

const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

class AnalyticsService {
  _enabled() {
    return Boolean(GA_ID);
  }

  init() {
    if (!this._enabled()) return;
    if (typeof window === 'undefined') return;

    // Evitar inyectar 2 veces
    if (document.getElementById('ga4-gtag')) return;

    // 1) Cargar gtag.js
    const script = document.createElement('script');
    script.id = 'ga4-gtag';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // 2) Inicializar dataLayer/gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };

    window.gtag('js', new Date());

    // SPA: desactivar envío automático del page_view
    window.gtag('config', GA_ID, { send_page_view: false });
  }

  pageView(path) {
    if (!this._enabled()) return;
    if (typeof window === 'undefined') return;
    if (!window.gtag) return;

    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: path
    });
  }

  event(name, params = {}) {
    if (!this._enabled()) return;
    if (typeof window === 'undefined') return;
    if (!window.gtag) return;

    window.gtag('event', name, params);
  }
}

export default new AnalyticsService();
