<script>
// ── PWA Service Worker — chỉ đăng ký tại đúng pos.html ──
(function() {
  if (!('serviceWorker' in navigator)) return;

  // Double-check: chỉ chạy nếu đang ở đúng URL pos.html
  if (!location.pathname.endsWith('/pos.html') && location.pathname !== '/') return;

  navigator.serviceWorker.register('/pos-sw.js', {
    scope: '/pos.html'
  }).then(function(reg) {
    console.log('[PWA] SW registered, scope:', reg.scope);
  }).catch(function(err) {
    console.warn('[PWA] SW failed:', err);
  });

  // ── Install prompt: chỉ hiện khi ở đúng pos.html ──
  var deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', function(e) {
    // Chặn prompt tự động
    e.preventDefault();
    deferredPrompt = e;
    // Hiện nút install tuỳ chỉnh (nếu muốn)
    var btn = document.getElementById('pwa-install-btn');
    if (btn) btn.style.display = 'flex';
  });

  window.addEventListener('appinstalled', function() {
    deferredPrompt = null;
    var btn = document.getElementById('pwa-install-btn');
    if (btn) btn.style.display = 'none';
  });

  // Export để nút install có thể gọi
  window.triggerPwaInstall = function() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(result) {
      deferredPrompt = null;
      var btn = document.getElementById('pwa-install-btn');
      if (btn) btn.style.display = 'none';
    });
  };
})();
</script>

