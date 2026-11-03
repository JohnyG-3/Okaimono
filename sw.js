// オフラインでも開けるようにするための仕組み。ネットにつながるときは毎回サーバーに確認して最新を読み込む
const CACHE="okaimono-v2";
const FILES=["./","index.html","manifest.json","icon-180.png","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  const same=new URL(e.request.url).origin===location.origin;
  const req=same?new Request(e.request,{cache:"no-cache"}):e.request;   // 古い版が出続けないよう、毎回確認する
  e.respondWith(fetch(req).then(r=>{
    if(r.ok&&same){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));}
    return r;
  }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("./"))));
});
