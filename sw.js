/* Service worker : coquille applicative en cache, reseau pour l'API */
var CACHE = "cqjm-v2";
var SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;
  var url = new URL(req.url);
  if(url.hostname === "api.anthropic.com") return;            // jamais en cache
  if(url.hostname.indexOf("openfoodfacts.org") !== -1) return; // toujours frais
  if(url.origin !== self.location.origin && url.hostname.indexOf("fonts.g") !== 0) {
    // polices Google : cache apres premier chargement, le reste passe au reseau
  }
  e.respondWith(
    caches.match(req).then(function(hit){
      if(hit) return hit;
      return fetch(req).then(function(res){
        if(res && res.status === 200 && (url.origin === self.location.origin || url.hostname.indexOf("fonts.g") === 0)){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){
        if(req.mode === "navigate") return caches.match("./index.html");
        throw new Error("hors ligne");
      });
    })
  );
});
