self.addEventListener('install', event => {
	self.skipWaiting();
});

self.addEventListener('activate', event => {
	return self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.url.indexOf('covidactnow') < 0 && event.request.url.indexOf('basemap') < 0) return;

  event.respondWith(async function() {
    const cache = await caches.open('covid-act-now');
    const response = await cache.match(event.request);

    if (response) {
      const fetched = response.headers.get('sw-fetched-on');

      if (fetched && (new Date().getTime() < (parseFloat(fetched) + 86400))) {
        return response;
      }
    }

    return fetch(event.request)
    .then((response) => {
      const copy = response.clone();
      const headers = new Headers(copy.headers);
      headers.append('sw-fetched-on', new Date().getTime());

      copy.blob().then((body) => {
        cache.put(event.request, new Response(body, {
          status: copy.status,
          statusText: copy.statusText,
          headers: headers
        }));
      });

      return response;
    })
  }());
});
