var CACHE = 'tradelog-pro-v6';
var ASSETS = [
  '/tradelog-pro/',
  '/tradelog-pro/index.html',
  '/tradelog-pro/manifest.json',
  '/tradelog-pro/icon-192.png',
  '/tradelog-pro/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
];

self.addEventListener('install', function(e) {
  // Force immediate activation - skip waiting
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return Promise.allSettled(ASSETS.map(function(url) {
        return cache.add(url).catch(function() {});
      }));
    })
  );
});

self.addEventListener('activate', function(e) {
  // Delete ALL old caches immediately
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // Network first for HTML - always get fresh version
  if (e.request.url.indexOf('.html') >= 0 || e.request.url.endsWith('/tradelog-pro/') || e.request.url.endsWith('/tradelog-pro')) {
    e.respondWith(
      fetch(e.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE).then(function(cache){ cache.put(e.request, clone); });
        return response;
      }).catch(function() {
        return caches.match(e.request);
      })
    );
    return;
  }
  // Cache first for other assets
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache){ cache.put(e.request, clone); });
        }
        return response;
      }).catch(function() { return cached; });
    })
  );
});
