const CACHE='micro-lab-fusion-v3-1-dark-tour';
const ASSETS=['./','./index.html','./app.js','./animation-controller.js','./visuals.js','./source-guide.js','./source-pages.js','./glossary.js','./onboarding.js','./data.js','./tickets.js','./trainer.js','./manifest.json','./icon.svg','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./discovery.js','./discovery.css','./fusion.css','./fusion.js'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('micro-lab-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET'||url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy))}return res}).catch(()=>caches.match('./index.html')));return;
 }
 event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return res})));
});
