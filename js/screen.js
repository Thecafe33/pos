function screenShowAddForm() {
    var ta = document.getElementById('slide-new-url');
    if (ta) ta.focus();
}

function screenLoadSlides() {
    var listEl  = document.getElementById('slide-list');
    var countEl = document.getElementById('slide-count');
    if (!listEl) return;
    listEl.innerHTML = '<div style="padding:24px;text-align:center;opacity:0.4;"><p style="font-size:0.72rem;font-weight:700;color:#9ca3af;">Đang tải...</p></div>';
    fstore.collection('config').doc('screen_slides').get().then(function(doc) {
        _screenSlides = (doc.exists && doc.data().slides) ? doc.data().slides : [];
        if (countEl) countEl.innerText = _screenSlides.length;
        screenRenderList();
    }).catch(function(err) {
        console.error('screenLoadSlides Firestore error:', err);
        _screenSlides = [];
        screenRenderList();
    });
}

function screenRenderList() {
    var listEl  = document.getElementById('slide-list');
    var countEl = document.getElementById('slide-count');
    if (!listEl) return;
    if (countEl) countEl.innerText = _screenSlides.length;
    if (_screenSlides.length === 0) {
        listEl.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;padding:40px 0;opacity:0.3;"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" style="margin-bottom:8px;"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg><p style="font-size:0.72rem;font-weight:700;color:#9ca3af;margin:0;">Chưa có slide</p></div>';
        return;
    }
    listEl.innerHTML = '';
    _screenSlides.forEach(function(slide, idx) {
        var row = document.createElement('div');
        row.style.cssText = 'background:white;border-radius:20px;padding:8px 10px;display:flex;align-items:center;gap:8px;border:1.5px solid #f3f4f6;cursor:pointer;margin-bottom:4px;transition:border-color 0.15s;';
        row.onmouseenter = function(){ this.style.borderColor='#006241'; };
        row.onmouseleave = function(){ this.style.borderColor='#f3f4f6'; };
        row.onclick = function(){ screenEditSlide(idx); };
        var thumb = document.createElement('div');
        thumb.style.cssText = 'width:44px;height:28px;border-radius:7px;background:#f3f4f6;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;';
        if (slide.url) {
            var img = document.createElement('img');
            img.src = slide.url; img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            img.onerror = function(){ thumb.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'; };
            thumb.appendChild(img);
        } else { thumb.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'; }
        var info = document.createElement('div');
        info.style.cssText = 'flex:1;min-width:0;';
        var urlShort = (slide.url||'').length > 26 ? slide.url.substring(0,26)+'…' : (slide.url||'(trống)');
        info.innerHTML = '<p style="font-size:0.7rem;font-weight:700;color:#374151;margin:0 0 1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + urlShort + '</p><p style="font-size:0.62rem;color:#9ca3af;margin:0;">' + (slide.duration||8) + 's</p>';
        var btnUp = document.createElement('button');
        btnUp.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
        btnUp.style.cssText = 'background:#f3f4f6;border:none;border-radius:7px;padding:4px 6px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;';
        btnUp.onclick = function(e){ e.stopPropagation(); screenMoveSlide(idx,-1); };
        var btnDel = document.createElement('button');
        btnDel.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
        btnDel.style.cssText = 'background:#fee2e2;border:none;border-radius:7px;padding:4px 6px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;';
        btnDel.onclick = function(e){ e.stopPropagation(); screenRemoveSlide(idx); };
        row.appendChild(thumb); row.appendChild(info);
        if (idx > 0) row.appendChild(btnUp);
        row.appendChild(btnDel);
        listEl.appendChild(row);
    });
}

function screenEditSlide(idx) {
    var slide = _screenSlides[idx];
    if (!slide) return;
    var ta  = document.getElementById('slide-new-url');
    var dur = document.getElementById('slide-new-duration');
    var btn = document.getElementById('screen-add-btn');
    var title = document.getElementById('screen-form-title');
    if (ta)  ta.value  = slide.url || '';
    if (dur) dur.value = slide.duration || 8;
    if (title) title.innerText = 'Chỉnh sửa slide #' + (idx+1);
    if (btn) btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg> Cập nhật slide';
    window._screenEditIdx = idx;
    screenPreviewSlide();
}

function screenMoveSlide(idx, dir) {
    var ni = idx + dir;
    if (ni < 0 || ni >= _screenSlides.length) return;
    var tmp = _screenSlides[idx]; _screenSlides[idx] = _screenSlides[ni]; _screenSlides[ni] = tmp;
    screenRenderList();
}

function screenRemoveSlide(idx) {
    if (!confirm('Xóa slide ' + (idx+1) + '?')) return;
    _screenSlides.splice(idx, 1);
    if (window._screenEditIdx === idx) {
        window._screenEditIdx = null;
        var ta = document.getElementById('slide-new-url');
        if (ta) ta.value = '';
        var preview = document.getElementById('slide-preview-box');
        if (preview) preview.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
        var btn = document.getElementById('screen-add-btn');
        if (btn) btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> Thêm vào danh sách';
        var title = document.getElementById('screen-form-title');
        if (title) title.innerText = 'Thêm slide mới';
    }
    screenRenderList();
}

function screenPreviewSlide() {
    var url = (document.getElementById('slide-new-url').value || '').trim();
    var box = document.getElementById('slide-preview-box');
    if (!box) return;
    if (url) {
        var img = document.createElement('img');
        img.src = url; img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        img.onerror = function(){ box.innerHTML = '<p style="font-size:0.75rem;color:#9ca3af;font-weight:700;">Không tải được ảnh</p>'; };
        box.innerHTML = ''; box.appendChild(img);
    } else {
        box.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
    }
}

function screenAddSlide() {
    var url = (document.getElementById('slide-new-url').value || '').trim();
    var dur = parseInt(document.getElementById('slide-new-duration').value) || 8;
    if (!url) { alert('Vui lòng nhập URL ảnh!'); return; }
    if (window._screenEditIdx != null && window._screenEditIdx < _screenSlides.length) {
        _screenSlides[window._screenEditIdx] = { url: url, duration: dur };
        window._screenEditIdx = null;
    } else {
        _screenSlides.push({ url: url, duration: dur });
    }
    document.getElementById('slide-new-url').value = '';
    var preview = document.getElementById('slide-preview-box');
    if (preview) preview.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
    var btn = document.getElementById('screen-add-btn');
    if (btn) btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg> Thêm vào danh sách';
    var title = document.getElementById('screen-form-title');
    if (title) title.innerText = 'Thêm slide mới';
    screenRenderList();
}

function screenSaveSlides() {
    fstore.collection('config').doc('screen_slides').set({ slides: _screenSlides }).then(function() {
        alert('Đã lưu ' + _screenSlides.length + ' slides!');
    }).catch(function(err) {
        alert('Lỗi: ' + err.message);
    });
}

