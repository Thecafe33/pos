<script>
// ═══════════════════════════════════════════════════════
//  STICKER ENGINE — Render tem 320×240px
// ═══════════════════════════════════════════════════════

var stickerConfig = {
    logoMode:   'text',
    logoImgURL: null,
    footerText: 'Thank you so much\nluv u',
    fontName:   34,   // 28 × 1.2 ≈ 34
    fontFooter: 19    // 16 × 1.2 ≈ 19
};
var stickerFontTimer = null;
var stickerSelectedPreviewItem = null;  // { name, size, price } — dùng để preview

// ── Load config từ Firestore khi tab sticker active ──
function stickerLoadConfig() {
    fstore.collection('config').doc('sticker_config').get().then(function(doc) {
        var cfg = doc.exists ? doc.data() : null;
        if (cfg) {
            if (cfg.logoMode)    stickerConfig.logoMode    = cfg.logoMode;
            if (cfg.logoImgURL)  stickerConfig.logoImgURL  = cfg.logoImgURL;
            if (cfg.footerText !== undefined) stickerConfig.footerText = cfg.footerText;
            if (cfg.fontName)    stickerConfig.fontName    = cfg.fontName;
            if (cfg.fontFooter)  stickerConfig.fontFooter  = cfg.fontFooter;
        }
        stickerApplyConfigToUI();
        stickerRefreshPreview();
    }).catch(function(err) {
        console.error('stickerLoadConfig Firestore error:', err);
        stickerApplyConfigToUI();
        stickerRefreshPreview();
    });
}
// Alias for backward compat
function stickerRenderList() { stickerLoadConfig(); }

function stickerApplyConfigToUI() {
    var ta = document.getElementById('stk-footer-text');
    if (ta) ta.value = stickerConfig.footerText;
    var dn = document.getElementById('stk-font-name-disp');
    if (dn) dn.textContent = stickerConfig.fontName;
    var df = document.getElementById('stk-font-footer-disp');
    if (df) df.textContent = stickerConfig.fontFooter;
    stickerSetLogoMode(stickerConfig.logoMode, true);
}

function stickerPreviewItem(itemJsonStr) {
    var item = JSON.parse(itemJsonStr);
    stickerSelectedPreviewItem = item;

    // Active row
    document.querySelectorAll('.sticker-menu-row').forEach(function(el) {
        el.style.background = 'transparent'; el.style.borderColor = 'transparent';
    });
    // Re-render preview
    stickerRefreshPreview();
}

// ── Render canvas 320×240 ──
function stickerRefreshPreview() {
    var cv = document.getElementById('sticker-layout-preview');
    if (!cv) return;
    var item = stickerSelectedPreviewItem || { name: 'Sữa gạo matcha', priceM: 35000, priceL: 40000 };
    var size  = 'M';
    var price = item.priceM || item.priceL || 0;
    var footer = (document.getElementById('stk-footer-text') ? document.getElementById('stk-footer-text').value : stickerConfig.footerText) || stickerConfig.footerText;
    stickerDrawCanvas(cv, item.name, size, price, footer, '10/03/2026 14:30');
}

function stickerDrawCanvas(cv, itemName, size, price, footerText, orderTime) {
    var W = 320, H = 240;
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    var y = 14;

    if (stickerConfig.logoMode === 'img' && stickerConfig.logoImgURL) {
        var logoImg = new Image();
        logoImg.onload = function() {
            var maxW = 160, maxH = 40;
            var scale = Math.min(maxW/logoImg.width, maxH/logoImg.height);
            var lw = logoImg.width*scale, lh = logoImg.height*scale;
            ctx.drawImage(logoImg, (W-lw)/2, y, lw, lh);
            stickerDrawCanvasBody(ctx, W, H, y + maxH + 6, itemName, size, price, footerText, orderTime);
        };
        logoImg.onerror = function() { stickerDrawCanvasBody(ctx, W, H, y + 46, itemName, size, price, footerText, orderTime); };
        logoImg.src = stickerConfig.logoImgURL;
    } else {
        // Brand font: League Spartan bold — giống hệt POS
        ctx.font = 'bold 22px "League Spartan", "Arial Black", sans-serif';
        ctx.fillStyle = '#111111';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.letterSpacing = '-1px';
        ctx.fillText('The cafe 33', 14, y);
        ctx.letterSpacing = '0px';
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(14, y + 30); ctx.lineTo(W - 14, y + 30);
        ctx.stroke();
        stickerDrawCanvasBody(ctx, W, H, y + 38, itemName, size, price, footerText, orderTime);
    }
}

function stickerDrawCanvasBody(ctx, W, H, startY, itemName, size, price, footerText, orderTime) {
    // +20% so với default: fontName default=28→34, fontFooter default=16→19
    var fontName   = Math.round((stickerConfig.fontName   || 34) * 1.0);
    var fontFooter = Math.round((stickerConfig.fontFooter || 19) * 1.0);
    var fontPrice  = Math.round(fontName * 0.75);  // Giá & Size: 75% tên món, đậm
    var y = startY;

    // ── Tên món ──
    ctx.font = 'bold ' + fontName + 'px "Google Sans", "Roboto", Arial, sans-serif';
    ctx.fillStyle = '#111111';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var words = itemName.split(' '), lines = [], line = '';
    words.forEach(function(w) {
        var test = line + (line ? ' ' : '') + w;
        if (ctx.measureText(test).width > W - 28 && line) { lines.push(line); line = w; }
        else { line = test; }
    });
    if (line) lines.push(line);
    lines.forEach(function(l) { ctx.fillText(l, 14, y); y += fontName * 1.2; });
    y += 6;

    // ── Giá + Size — to và đậm ──
    ctx.font = 'bold ' + fontPrice + 'px "Google Sans", "Roboto", Arial, sans-serif';
    ctx.fillStyle = '#222222';
    ctx.textBaseline = 'top';
    // Giá bên trái
    ctx.textAlign = 'left';
    var priceStr = price ? Number(price).toLocaleString() + 'đ' : '...........';
    ctx.fillText(priceStr, 14, y);
    // Size bên phải
    ctx.textAlign = 'right';
    ctx.fillText('Size: ' + (size || '....'), W - 14, y);
    y += fontPrice * 1.3;
    y += 4;

    // ── Đường kẻ ──
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, y); ctx.lineTo(W - 14, y);
    ctx.stroke();
    y += 8;

    // ── Thời gian order ──
    if (orderTime) {
        ctx.font = '500 12px "Google Sans", "Roboto", Arial, sans-serif';
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(orderTime, W/2, y);
        y += 17;
    }

    // ── Footer ──
    ctx.font = 'italic ' + fontFooter + 'px "Google Sans", "Roboto", Arial, sans-serif';
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var fLines = (footerText || 'Thank you so much\nluv u').split('\n');
    fLines.forEach(function(fl) {
        ctx.fillText(fl.trim(), W/2, y);
        y += fontFooter * 1.35;
    });
}

// ── Tạo canvas tem cho 1 item để gửi BLE ──
function stickerBuildCanvas(itemName, size, price) {
    var cv = document.createElement('canvas');
    cv.width = 320; cv.height = 240;
    var footerText = stickerConfig.footerText;
    stickerDrawCanvas(cv, itemName, size, price, footerText);
    return cv;
}

// Async version (logo img có thể cần await load)
function stickerBuildCanvasAsync(itemName, size, price, orderTime) {
    return new Promise(function(resolve) {
        var cv = document.createElement('canvas');
        cv.width = 320; cv.height = 240;
        var W = 320, H = 240;
        var ctx = cv.getContext('2d');
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,W,H);
        var footerText = stickerConfig.footerText;
        var startY = 14;

        var drawBody = function(afterLogoY) {
            stickerDrawCanvasBody(ctx, W, H, afterLogoY, itemName, size, price, footerText, orderTime);
            resolve(cv);
        };

        if (stickerConfig.logoMode === 'img' && stickerConfig.logoImgURL) {
            var logoImg = new Image();
            logoImg.onload = function() {
                var maxW=160, maxH=40, scale=Math.min(maxW/logoImg.width, maxH/logoImg.height);
                var lw=logoImg.width*scale, lh=logoImg.height*scale;
                ctx.drawImage(logoImg, (W-lw)/2, startY, lw, lh);
                drawBody(startY + maxH + 6);
            };
            logoImg.onerror = function() { drawBody(startY + 46); };
            logoImg.src = stickerConfig.logoImgURL;
        } else {
            ctx.font = 'bold 22px "League Spartan", "Arial Black", sans-serif';
            ctx.fillStyle = '#111111'; ctx.textAlign='left'; ctx.textBaseline='top';
            ctx.fillText('The cafe 33', 14, startY);
            ctx.strokeStyle='#e5e7eb'; ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(14,startY+30); ctx.lineTo(W-14,startY+30); ctx.stroke();
            drawBody(startY + 38);
        }
    });
}

// ── Logo mode ──
function stickerSetLogoMode(mode, silent) {
    stickerConfig.logoMode = mode;
    var tb = document.getElementById('stk-logo-text-btn');
    var ib = document.getElementById('stk-logo-img-btn');
    var up = document.getElementById('stk-logo-img-upload');
    var activeStyle  = 'border:1.5px solid #006241;background:#F0FDF4;color:#006241;';
    var inactiveStyle= 'border:1.5px solid #e5e7eb;background:#f9fafb;color:#374151;';
    if (tb) tb.style.cssText += mode==='text' ? activeStyle : inactiveStyle;
    if (ib) ib.style.cssText += mode==='img'  ? activeStyle : inactiveStyle;
    if (up) up.style.display  = mode==='img' ? 'block' : 'none';
    if (!silent) stickerRefreshPreview();
}

// Logo file upload
(function() {
    var fi = document.getElementById('stk-logo-file');
    if (!fi) return;
    fi.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var r = new FileReader();
        r.onload = function(ev) {
            stickerConfig.logoImgURL = ev.target.result;
            var fn = document.getElementById('stk-logo-fname');
            if (fn) fn.textContent = file.name;
            stickerRefreshPreview();
        };
        r.readAsDataURL(file);
        fi.value = '';
    });
})();

// ── Font stepper ──
function stickerStepFont(key, delta) {
    if (key === 'name') {
        stickerConfig.fontName = Math.max(14, Math.min(48, stickerConfig.fontName + delta));
        var d = document.getElementById('stk-font-name-disp');
        if (d) d.textContent = stickerConfig.fontName;
    } else {
        stickerConfig.fontFooter = Math.max(10, Math.min(24, stickerConfig.fontFooter + delta));
        var d2 = document.getElementById('stk-font-footer-disp');
        if (d2) d2.textContent = stickerConfig.fontFooter;
    }
    stickerRefreshPreview();
    stickerFontTimer = setTimeout(function() {
        stickerFontTimer = setInterval(function() { stickerStepFont(key, delta); }, 120);
    }, 400);
}
function stickerStopFont() {
    clearTimeout(stickerFontTimer); clearInterval(stickerFontTimer); stickerFontTimer = null;
}

// ── Save config ──
function stickerSaveConfig() {
    var ta = document.getElementById('stk-footer-text');
    if (ta) stickerConfig.footerText = ta.value;
    var cfg = {
        logoMode:   stickerConfig.logoMode,
        logoImgURL: stickerConfig.logoImgURL || null,
        footerText: stickerConfig.footerText,
        fontName:   stickerConfig.fontName,
        fontFooter: stickerConfig.fontFooter
    };
    fstore.collection('config').doc('sticker_config').set(cfg).then(function() {
        var btn = document.querySelector('[onclick="stickerSaveConfig()"]');
        if (btn) { var orig = btn.textContent; btn.textContent = '✓ Đã lưu'; setTimeout(function(){ btn.textContent = orig; }, 1500); }
    }).catch(function(err) {
        alert('Lỗi lưu sticker config: ' + err.message);
    });
}

// ── Test print ──
async function stickerTestPrint() {
    if (!lblIsConn) { lblLog('Chưa kết nối máy in', 'err'); return; }
    var item = stickerSelectedPreviewItem || { name: 'Sữa gạo matcha', priceM: 35000 };
    var now = new Date(); var orderTime = now.getDate().toString().padStart(2,'0')+'/'+(now.getMonth()+1).toString().padStart(2,'0')+'/'+now.getFullYear()+' '+now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
    var cv = await stickerBuildCanvasAsync(item.name, 'M', item.priceM || 0, orderTime);
    var dataURL = cv.toDataURL('image/png');
    var data = await lblImgToEscPos(dataURL);
    await lblWriteBle(data);
    lblLog('In thử xong!', 'ok');
}

// ═══════════════════════════════════════════════════════
//  MODAL IN TEM (dùng canvas render động, không cần ảnh upload)
// ═══════════════════════════════════════════════════════

var printStickerItems = [];

function openPrintStickerModal(idx) {
    var h = historyData[idx];
    if (!h) return;

    // Nếu chưa kết nối BLE: lần đầu toast hướng dẫn, lần 2 trigger kết nối luôn
    if (!lblIsConn) {
        var now = Date.now();
        if (window._printBlePromptTime && (now - window._printBlePromptTime) < 4000) {
            // Bấm lần 2 trong 4s → kết nối luôn
            window._printBlePromptTime = null;
            lblToggleBle();
            return;
        }
        window._printBlePromptTime = now;
        // Toast thông báo
        var toast = document.createElement('div');
        toast.textContent = '🖨️ Chưa kết nối máy in — bấm lại để kết nối';
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1f2937;color:white;padding:10px 20px;border-radius:999px;font-size:0.82rem;font-weight:700;z-index:9999;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,0.3);animation:fadeInUp 0.2s ease;pointer-events:none;';
        document.body.appendChild(toast);
        setTimeout(function() { toast.style.opacity='0'; toast.style.transition='opacity 0.4s'; setTimeout(function(){ toast.remove(); }, 400); }, 3000);
        return;
    }

    var normalizedItems = [];
    if (h.itemsArray && Array.isArray(h.itemsArray) && h.itemsArray.length > 0) {
        normalizedItems = h.itemsArray.map(function(it) {
            return { nameOnly: it.name || '', sizePart: it.size || '', qty: it.qty || 1, price: it.price || 0 };
        });
    } else {
        var items = (h.items || '').split(',');
        normalizedItems = items.map(function(item) {
            var raw = item.trim();
            var lastX = raw.lastIndexOf('x');
            if (lastX === -1) return null;
            var namePartFull = raw.substring(0, lastX).trim();
            var qty = parseInt(raw.substring(lastX + 1)) || 1;
            var nameOnly = namePartFull, sizePart = '';
            if (namePartFull.includes('(')) {
                var lb = namePartFull.lastIndexOf('(');
                nameOnly = namePartFull.substring(0, lb).trim();
                sizePart = namePartFull.substring(lb + 1, namePartFull.lastIndexOf(')'));
            }
            var mi = menu.find(function(m) { return m.name.toLowerCase() === nameOnly.toLowerCase(); });
            var price = mi ? (sizePart === 'L' ? (mi.priceL || mi.priceM || 0) : (mi.priceM || 0)) : 0;
            return { nameOnly: nameOnly, sizePart: sizePart, qty: qty, price: price };
        }).filter(Boolean);
    }

    // Load sticker_config trước rồi mở modal
    fstore.collection('config').doc('sticker_config').get().then(function(doc) {
        var cfg = doc.exists ? doc.data() : null;
        if (cfg) {
            if (cfg.logoMode)    stickerConfig.logoMode    = cfg.logoMode;
            if (cfg.logoImgURL)  stickerConfig.logoImgURL  = cfg.logoImgURL;
            if (cfg.footerText !== undefined) stickerConfig.footerText = cfg.footerText;
            if (cfg.fontName)    stickerConfig.fontName    = cfg.fontName;
            if (cfg.fontFooter)  stickerConfig.fontFooter  = cfg.fontFooter;
        }

        // Tách từng ly
        var expanded = [];
        normalizedItems.forEach(function(it) {
            if (it.sizePart === 'Phí') return;
            for (var i = 0; i < it.qty; i++) {
                expanded.push({ name: it.nameOnly, size: it.sizePart, price: it.price, selected: false });
            }
        });

        printStickerItems = expanded;
        // Build orderTime string từ bill
        var _ot = '';
        if (h.fullTime) { _ot = h.fullTime; }
        else if (h.timeStr && h.dateStr) { _ot = h.dateStr.slice(0,5) + ' ' + h.timeStr; }
        window._currentPrintOrderTime = _ot;
        renderPrintStickerModal(h, _ot);
        document.getElementById('print-sticker-modal').style.display = 'flex';
    });
}

function renderPrintStickerModal(h, orderTime) {
    var subtitle = document.getElementById('print-modal-subtitle');
    if (subtitle) subtitle.textContent = (h.timeStr || '') + ' · ' + ((h.dateStr || '').slice(0,5));
    var list = document.getElementById('print-modal-list');
    if (!list) return;

    var html = '';
    printStickerItems.forEach(function(item, i) {
        html += '<div id="psm-row-' + i + '" onclick="printStickerToggle(' + i + ')" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:16px;border:2px solid #f3f4f6;background:white;cursor:pointer;transition:all 0.15s;" class="active:scale-95">';
        // Mini canvas preview
        html += '<canvas id="psm-cv-' + i + '" width="64" height="48" style="border-radius:8px;border:1px solid #e5e7eb;flex-shrink:0;image-rendering:pixelated;"></canvas>';
        html += '<div style="flex:1;">';
        html += '<div style="font-size:0.9rem;font-weight:800;color:#111827;">' + item.name;
        if (item.size) html += ' <span style="color:#006241;font-size:0.78rem;">[' + item.size + ']</span>';
        html += '</div>';
        if (item.price) html += '<div style="font-size:0.68rem;color:#9ca3af;font-weight:600;margin-top:1px;">' + Number(item.price).toLocaleString() + 'đ</div>';
        html += '</div>';
        html += '<div id="psm-check-' + i + '" style="width:24px;height:24px;border-radius:50%;border:2px solid #e5e7eb;background:white;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s;"></div>';
        html += '</div>';
    });
    list.innerHTML = html;

    // Render mini canvas cho từng ly
    printStickerItems.forEach(function(item, i) {
        var cv = document.getElementById('psm-cv-' + i);
        if (!cv) return;
        // Vẽ mini preview (64×48)
        var tempCv = document.createElement('canvas');
        tempCv.width = 320; tempCv.height = 240;
        stickerDrawCanvas(tempCv, item.name, item.size, item.price, stickerConfig.footerText, orderTime);
        // Scale xuống canvas nhỏ
        var ctx = cv.getContext('2d');
        ctx.drawImage(tempCv, 0, 0, 64, 48);
    });
}

function printStickerToggle(i) {
    printStickerItems[i].selected = !printStickerItems[i].selected;
    var item  = printStickerItems[i];
    var row   = document.getElementById('psm-row-' + i);
    var check = document.getElementById('psm-check-' + i);
    if (row)   { row.style.borderColor = item.selected ? '#006241' : '#f3f4f6'; row.style.background = item.selected ? '#F0FDF4' : 'white'; }
    if (check) { check.style.borderColor = item.selected ? '#006241' : '#e5e7eb'; check.style.background = item.selected ? '#006241' : 'white'; check.innerHTML = item.selected ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''; }
}

function printStickerSelectAll() {
    var allSel = printStickerItems.every(function(it) { return it.selected; });
    printStickerItems.forEach(function(item, i) {
        item.selected = !allSel;
        var row   = document.getElementById('psm-row-' + i);
        var check = document.getElementById('psm-check-' + i);
        if (row)   { row.style.borderColor = item.selected ? '#006241' : '#f3f4f6'; row.style.background = item.selected ? '#F0FDF4' : 'white'; }
        if (check) { check.style.borderColor = item.selected ? '#006241' : '#e5e7eb'; check.style.background = item.selected ? '#006241' : 'white'; check.innerHTML = item.selected ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''; }
    });
}

async function printStickerConfirm() {
    var selected = printStickerItems.filter(function(it) { return it.selected; });
    if (!selected.length) return;
    if (!lblIsConn) {
        var btn = document.getElementById('print-modal-confirm-btn');
        if (btn) { btn.textContent = 'Chưa kết nối!'; setTimeout(function(){ btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg> In tem'; }, 2000); }
        return;
    }
    var btn = document.getElementById('print-modal-confirm-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang in 0/' + selected.length + '...'; }

    for (var i = 0; i < selected.length; i++) {
        var item = selected[i];
        if (btn) btn.textContent = 'Đang in ' + (i+1) + '/' + selected.length + '...';
        try {
            var cv = await stickerBuildCanvasAsync(item.name, item.size, item.price, window._currentPrintOrderTime || '');
            var dataURL = cv.toDataURL('image/png');
            var data = await lblImgToEscPos(dataURL);
            await lblWriteBle(data);
            await new Promise(function(r) { setTimeout(r, 250); });
        } catch(e) {
            lblLog('Lỗi in ' + item.name + ': ' + e.message, 'err');
        }
    }

    if (btn) { btn.disabled=false; btn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg> In tem'; }
    closePrintStickerModal();
}

function closePrintStickerModal() {
    var m = document.getElementById('print-sticker-modal');
    if (m) m.style.display = 'none';
    printStickerItems = [];
}

document.getElementById('print-sticker-modal').addEventListener('click', function(e) {
    if (e.target === this) closePrintStickerModal();
});
</script>


<script>
