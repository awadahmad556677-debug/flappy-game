const CACHE_NAME = 'flappy-game-v3'; // غيرنا الاسم عشان نجبر المتصفح يرمي القديم ويقرا الجديد
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './flap.mp3',   // ضفنا صوت الطيران
  './hit.mp3',    // ضفنا صوت الخسارة
  './point.mp3',  // ضفنا صوت النقطة
  './icon-192.png', // ضفنا الأيقونات عشان تظهر برة على الشاشة
  './icon-512.png'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  // استراتيجية Network First مع الـ Fallback للكاش عشان التحديثات تبان علطول
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
