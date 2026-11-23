/* Web de prueba · común a las dos páginas.
   Carga GTM, simula el banner de consentimiento (la CMP) y recuerda la elección.
   No hace falta tocarlo: tu configuración va en config.js. */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  // 1. GTM: el fragmento estándar, con el origen configurable.
  var id = window.DEMO_GTM_ID;
  var host = (window.DEMO_GTM_HOST || 'https://www.googletagmanager.com').replace(/\/+$/, '');
  if (!id || id === 'GTM-XXXXXXX') {
    console.warn('[web de prueba] Pon el ID de tu contenedor web en config.js');
  } else {
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = host + '/gtm.js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
  }

  // 2. Banner de consentimiento. Solo hace la actualización: el estado por
  //    defecto lo tiene que poner tu contenedor.
  var CLAVE = 'demo_consentimiento';
  var ESTADOS = {
    todo: { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' },
    analitica: { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' },
    nada: { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' }
  };
  var TEXTOS = { todo: 'Aceptar todo', analitica: 'Solo analítica', nada: 'Rechazar todo' };

  function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(CLAVE, v); } catch (e) { /* sin almacenamiento */ } }
  function borrar() { try { localStorage.removeItem(CLAVE); } catch (e) { /* sin almacenamiento */ } }

  function aplicar(eleccion, origen) {
    if (!ESTADOS[eleccion]) return;
    window.gtag('consent', 'update', ESTADOS[eleccion]);
    window.dataLayer.push({ event: 'cmp_consent_update', consent_choice: eleccion, consent_origin: origen });
  }

  // La elección de una visita anterior se vuelve a aplicar al cargar, como hace la CMP.
  var guardada = leer();
  if (guardada) aplicar(guardada, 'guardada');

  function pintarBanner() {
    var viejo = document.getElementById('cmp');
    if (viejo) viejo.remove();
    var b = document.createElement('div');
    b.id = 'cmp';
    b.className = 'cmp';
    b.innerHTML = '<p><strong>Cookies.</strong> Usamos cookies propias y de terceros para analizar la web y medir nuestras campañas.</p><div class="cmp-botones"></div>';
    var botones = b.querySelector('.cmp-botones');
    ['nada', 'analitica', 'todo'].forEach(function (k) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = TEXTOS[k];
      if (k === 'todo') btn.className = 'primario';
      btn.addEventListener('click', function () {
        guardar(k);
        aplicar(k, 'banner');
        b.remove();
        pintarEstado();
      });
      botones.appendChild(btn);
    });
    document.body.appendChild(b);
  }

  function pintarEstado() {
    var e = document.getElementById('cmp-estado');
    if (!e) {
      e = document.createElement('button');
      e.id = 'cmp-estado';
      e.type = 'button';
      e.className = 'cmp-estado';
      e.addEventListener('click', function () { borrar(); pintarBanner(); pintarEstado(); });
      document.body.appendChild(e);
    }
    var g = leer();
    e.textContent = g ? 'Consentimiento: ' + TEXTOS[g] + ' · cambiar' : 'Consentimiento: sin elegir';
    e.style.display = document.getElementById('cmp') ? 'none' : '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!leer()) pintarBanner();
    pintarEstado();
  });
})();
