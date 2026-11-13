/* Service worker: lưu đệm để mở app nhanh, đỡ tốn dữ liệu, dùng được khi mạng yếu.
   - Mã nguồn (html/js/css): lấy bản mới từ mạng trước, mạng chậm/mất thì dùng bản đã lưu.
   - Dữ liệu nặng (font, nét chữ, gói bài, icon): dùng bản đã lưu ngay, cập nhật ngầm.
   Khi sửa app, tăng số VERSION để xóa bộ nhớ đệm cũ. */
const VERSION = 'xiaobu-v4';
const CORE = ['./', 'index.html', 'css/style.css', 'js/packs.js', 'js/data.js', 'js/data-phim.js', 'js/memo.js', 'js/app.js',
  'js/vendor/hanzi-writer.min.js', 'manifest.webmanifest', 'icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const isCode = url => url.origin === location.origin && /(\.html|\.js|\.css|\/)$/.test(url.pathname) && !url.pathname.includes('/packs/');
const isAsset = url => url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) || url.hostname === 'cdn.jsdelivr.net';

function networkFirst(req) {
  return caches.open(VERSION).then(cache => {
    const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; });
    const timeout = new Promise(r => setTimeout(r, 3000)).then(() => cache.match(req));
    return Promise.race([net.catch(() => cache.match(req)), timeout.then(r => r || net)])
      .then(r => r || net);
  });
}
function staleWhileRevalidate(req) {
  return caches.open(VERSION).then(cache => cache.match(req).then(hit => {
    const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (isCode(url)) e.respondWith(networkFirst(e.request));
  else if (isAsset(url)) e.respondWith(staleWhileRevalidate(e.request));
});
