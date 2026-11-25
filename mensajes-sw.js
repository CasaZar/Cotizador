/* Avisos de la bandeja de mensajes (25-11-2026). Solo recibe notificaciones y abre el chat al tocarlas.
   No intercepta páginas ni guarda nada en caché: no tiene manejador de «fetch».
   Se registra desde mensajes.html con alcance ./mensajes, así que no toca el cotizador público. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function(e){
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = {}; }
  var chat = Number(d.c) > 0 ? Number(d.c) : 0;
  e.waitUntil(self.registration.showNotification(String(d.t || 'Mensajes · Casa Zaru'), {
    body: String(d.b || 'Hay un mensaje esperando respuesta.'),
    tag: chat ? 'chat-' + chat : 'mensajes-' + String(d.k || 'aviso'),
    renotify: true,
    icon: 'fotos/icono-mensajes-192.png',
    badge: 'fotos/icono-mensajes-192.png',
    data: { chat: chat }
  }));
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var chat = (e.notification.data && Number(e.notification.data.chat)) || 0;
  var destino = new URL('mensajes.html' + (chat ? '?chat=' + chat : ''), self.location.href).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(lista){
    for (var i = 0; i < lista.length; i++) {
      if (lista[i].url.indexOf('/mensajes') !== -1 && 'focus' in lista[i]) {
        lista[i].postMessage({ abrirChat: chat });
        return lista[i].focus();
      }
    }
    return self.clients.openWindow(destino);
  }));
});
