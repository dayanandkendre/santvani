const CACHE_NAME = 'santvani-cache-v1';

// सुरुवातीलाच कॅश करायच्या मुख्य फाईल्स
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/images/icon-512.png'
];

// १. Install: सुरुवातीच्या फाईल्स सेव्ह करा
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// २. Activate: जुना कॅश साफ करा
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ३. Fetch: Stale-While-Revalidate (ऑफलाइन फास्ट उघडेल + बॅकग्राउंडमध्ये ऑटो अपडेट होईल)
self.addEventListener('fetch', (event) => {
  // फक्त GET रिक्वेस्टसाठी कॅश वापरा (Google Ads किंवा बाहेरील ट्रॅकिंग सोडून)
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);

  // AdSense किंवा ॲनालिटिक्सच्या रिक्वेस्ट कॅश करू नका
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // बॅकग्राउंड नेटवर्क फेच (ऑटो-अपडेटसाठी)
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // नेट नसेल तर काही प्रॉब्लेम नाही, कॅश आधीच दिलेला असेल
      });

      // कॅश उपलब्ध असल्यास लगेच दाखवा, नसेल तर नेटवर्कवरून आणा
      return cachedResponse || fetchPromise;
    })
  );
});
