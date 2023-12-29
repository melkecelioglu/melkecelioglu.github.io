var cacheName = 'bird';

var filesToCache = ['./', 'index.html', 'style.css', 'app.js'];

self.addEventListener('install', async (event) => {
  const cacheStorage = await caches.open(cacheName);
  await cacheStorage.addAll(filesToCache);
  return self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', async (event) => {
  const request = event.request;
  const requestURL = new URL(request.url);

  if (requestURL.origin === location.origin) {
    event.respondWith(handleLocalCache(request));
  } else {
    event.respondWith(handleNetworkRequest(request));
  }
});

async function handleLocalCache(request) {
  const cacheStorage = await caches.open(cacheName);
  const responseFromCache = await cacheStorage.match(request);
  return responseFromCache || fetch(request);
}

async function handleNetworkRequest(request) {
  const cacheStorage = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    await cacheStorage.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const responseFromCache = await cacheStorage.match(request);
    return responseFromCache;
  }
}
