function openSplitModal() {
    if (typeof cart === 'undefined' || !Array.isArray(cart) || cart.length === 0) {
        if (typeof showAppModal === 'function') showAppModal("Thông báo", "Giỏ hàng đang trống!", "⚠️");
        return;
    }
    _syncSplitCart();
    splitSelected.clear();
    renderSplitView('list');
    document.getElementById('split-payment-modal').classList.remove('hidden');
}

// Sync expandedCart từ cart: chỉ APPEND món mới, không rebuild
function _syncSplitCart() {
    const paidIds = new Set(splitGroups.flatMap(g => g.ids));
    // Rebuild từ cart
    const newExpanded = [];
    let ci = 0;
    cart.forEach(item => {
        for (let i = 0; i < (item.qty || 1); i++) {
            newExpanded.push({
                stableId: `${item.name}__${item.size}__${ci}`,
                name: item.name || 'Món không tên',
                size: item.size || '',
                price: item.price || 0,
            });
            ci++;
        }
    });
    // Giữ lại các món đã paid (kể cả không còn trong cart)
    const paidItems = splitExpandedCart.filter(it => paidIds.has(it.stableId));
    const paidStableIds = new Set(paidItems.map(it => it.stableId));
    // Merge: paid items + các item mới từ cart chưa paid
    const merged = [...paidItems];
    newExpanded.forEach(it => {
        if (!paidStableIds.has(it.stableId)) merged.push(it);
    });
    splitExpandedCart = merged;
}

function closeSplitModal() {
    if (splitQRListening) {
        try { db.ref('payment_events').off(); } catch(e){}
        splitQRListening = false;
    }
    document.getElementById('split-payment-modal').classList.add('hidden');
    splitSelected.clear();
}

function resetSplitState() {
    splitExpandedCart = [];
    splitSelected.clear();
    splitGroups = [];
    splitQRListening = false;
    _splitQRUnsubscribe = null;
    _splitOrderMeta = null;
}

function _getPaidIds() {
    return new Set(splitGroups.flatMap(g => g.ids));
}

// ─── RENDER ROUTER ────────────────────────────────────────────
function renderSplitView(view) {
    const container = document.getElementById('split-modal-body');
    if (!container) return;
    if (view === 'list')    _renderSplitList(container);
    else if (view === 'cash')    _renderSplitCash(container);
    else if (view === 'qr')      _renderSplitQR(container);
    else if (view === 'summary') _renderSplitSummary(container);
}

// ─── VIEW: CHỌN MÓN ──────────────────────────────────────────
function _renderSplitList(container) {
    const paidIds = _getPaidIds();
    const allPaid = splitExpandedCart.length > 0 &&
                    splitExpandedCart.every(it => paidIds.has(it.stableId));

    let listHTML = '';
    splitExpandedCart.forEach(it => {
        const isPaid = paidIds.has(it.stableId);
        const isSel  = splitSelected.has(it.stableId);
        const grp    = splitGroups.find(g => g.ids.includes(it.stableId));
        const badgeColor = grp ? (grp.method === 'cash' ? '#16a34a' : '#1e3932') : '';
        const badgeText  = grp ? (grp.method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản') : '';
        const badgeHTML  = grp
            ? `<span style="display:inline-block;margin-top:5px;font-size:11px;font-weight:900;color:${badgeColor};text-transform:uppercase;letter-spacing:.04em;">${badgeText}</span>`
            : '';
        const rowBg     = isPaid ? '#f9fafb' : isSel ? '#f0fdf4' : '#ffffff';
        const rowBorder = isPaid ? '2px solid #f3f4f6' : isSel ? '2px solid #006241' : '2px solid #f3f4f6';
        const rowOpacity= isPaid ? '0.5' : '1';
        const checkBg   = isSel ? '#006241' : 'transparent';
        const checkBdr  = isSel ? '#006241' : '#d1d5db';
        const checkMark = isSel
            ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`
            : '';
        listHTML += `
        <div onclick="${isPaid ? '' : `toggleSplitItem('${it.stableId}')`}"
             style="display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-radius:20px;border:${rowBorder};background:${rowBg};opacity:${rowOpacity};margin-bottom:10px;cursor:${isPaid?'default':'pointer'};">
            <div style="flex:1;min-width:0;">
                <p style="margin:0;font-size:1.05rem;font-weight:900;color:#1e3932;">${it.name}</p>
                <p style="margin:3px 0 0;font-size:0.88rem;font-weight:800;color:#006241;">${it.size ? it.size+' &middot; ' : ''}${(it.price||0).toLocaleString()}đ</p>
                ${badgeHTML}
            </div>
            ${!isPaid ? `<div style="width:24px;height:24px;border-radius:50%;border:2px solid ${checkBdr};background:${checkBg};flex-shrink:0;margin-left:14px;display:flex;align-items:center;justify-content:center;">${checkMark}</div>` : ''}
        </div>`;
    });

    let selTotal = 0;
    splitSelected.forEach(id => {
        const it = splitExpandedCart.find(x => x.stableId === id);
        if (it) selTotal += (it.price || 0);
    });
    const hasSel = splitSelected.size > 0;

    const btnArea = hasSel ? `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-size:0.95rem;font-weight:800;color:#374151;">Đã chọn ${splitSelected.size} món:</span>
            <span style="font-size:1.4rem;font-weight:900;color:#006241;">${selTotal.toLocaleString()}đ</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <button onclick="renderSplitView('cash')"
                style="padding:16px;background:#006241;color:white;border:none;border-radius:20px;font-size:0.9rem;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:.04em;transition:opacity .15s;"
                onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">Tiền mặt</button>
            <button onclick="_initSplitQR()"
                style="padding:16px;background:#1e3932;color:white;border:none;border-radius:20px;font-size:0.9rem;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:.04em;transition:opacity .15s;"
                onmouseover="this.style.opacity='.8'" onmouseout="this.style.opacity='1'">Chuyển khoản</button>
        </div>` : `<p style="text-align:center;color:#9ca3af;font-size:0.9rem;font-weight:700;padding:6px 0;">Nhấn vào từng món để chọn</p>`;

    const completeBtn = allPaid ? `
        <button onclick="renderSplitView('summary')"
            style="width:100%;margin-top:12px;padding:16px;background:#f59e0b;color:white;border:none;border-radius:20px;font-size:1rem;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:.04em;box-shadow:0 4px 16px rgba(245,158,11,.3);transition:opacity .15s;"
            onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">Xem tổng kết &amp; Hoàn tất</button>` : '';

    container.innerHTML = `
        <div style="flex:1;overflow-y:auto;padding:20px 24px 8px;">${listHTML}</div>
        <div style="padding:16px 24px 24px;border-top:1px solid #f3f4f6;flex-shrink:0;background:white;">
            ${btnArea}${completeBtn}
        </div>`;
}

function toggleSplitItem(stableId) {
    if (splitSelected.has(stableId)) splitSelected.delete(stableId);
    else splitSelected.add(stableId);
    renderSplitView('list');
}

function _renderSplitCash(container) {
    let subtotal = 0;
    const selItems = [];
    splitSelected.forEach(id => {
        const it = splitExpandedCart.find(x => x.stableId === id);
        if (it) { subtotal += it.price || 0; selItems.push(it); }
    });

    // Dùng lại hàm gợi ý mệnh giá thông minh từ updateSuggestions
    function getSmartSuggestions(total) {
        const denominations = [10000, 20000, 50000, 100000, 200000, 500000];
        if (!total || total <= 0) return [50000, 100000, 200000, 500000];
        const suggestions = new Set();
        for (const denom of denominations) {
            const rounded = Math.ceil(total / denom) * denom;
            if (rounded > total && rounded <= total * 3) suggestions.add(rounded);
        }
        for (const denom of [100000, 200000, 500000]) {
            if (denom > total) suggestions.add(denom);
        }
        return [...suggestions].sort((a, b) => a - b).slice(0, 5);
    }

    const smartVals = getSmartSuggestions(subtotal);

    const itemRows = selItems.map(it => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:11px 0;border-bottom:1px solid #f3f4f6;">
            <div>
                <p style="margin:0;font-size:0.95rem;font-weight:800;color:#1e3932;">${it.name}</p>
                ${it.size ? `<p style="margin:1px 0 0;font-size:0.75rem;font-weight:700;color:#9ca3af;">${it.size}</p>` : ''}
            </div>
            <span style="font-size:1rem;font-weight:900;color:#006241;">${(it.price||0).toLocaleString()}đ</span>
        </div>`).join('');

    // Suggestions đồng bộ style với cash-suggestions-mobile
    const suggestionBtns = smartVals.map(v =>
        `<button onclick="quickSplitCash(${v},${subtotal})"
            class="w-full py-4 bg-white text-[#006241] rounded-2xl text-lg font-black shadow-sm border border-gray-100 active:bg-[#006241] active:text-white active:scale-95 transition-all hover:border-[#006241]">
            ${(v/1000).toFixed(0)}k
        </button>`
    ).join('');

    container.innerHTML = `
        <div style="flex:1;overflow-y:auto;padding:20px 24px 8px;">

            <!-- Danh sách món -->
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Các món thu lần này</p>
            <div class="bg-[#F2F4F7] rounded-[24px] px-4 py-1 mb-5">
                ${itemRows}
                <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0 8px;">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Cần thu</span>
                    <span style="font-size:1.5rem;font-weight:900;color:#1a4d2e;">${subtotal.toLocaleString()}đ</span>
                </div>
            </div>

            <!-- Input tiền khách đưa — clone từ mob-step-2 -->
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Tiền khách đưa</p>
            <div class="bg-[#F2F4F6] rounded-2xl p-4 border border-gray-200/50 shadow-inner mb-4">
                <input id="split-cash-input" type="tel" inputmode="numeric"
                       value="${subtotal.toLocaleString('en-US')}"
                       oninput="formatSplitCashInput(this); _calcSplitChange(${subtotal})"
                       class="w-full bg-transparent border-none text-center text-5xl font-black text-gray-900 p-0 outline-none focus:ring-0 h-auto leading-none">
            </div>

            <!-- Gợi ý mệnh giá thông minh -->
            <div style="display:grid;grid-template-columns:repeat(${smartVals.length},1fr);gap:10px;" class="mb-4">
                ${suggestionBtns}
            </div>

            <!-- Tiền thừa -->
            <div class="glass-card rounded-[2rem] px-6 py-4 flex justify-between items-center">
                <span class="text-gray-400 text-xs font-bold uppercase tracking-wider">Tiền thừa</span>
                <span id="split-change-display" class="text-amber-500 text-4xl font-black tracking-tight leading-none">0đ</span>
            </div>

        </div>
        <div style="padding:16px 24px 24px;border-top:1px solid #f3f4f6;display:flex;gap:12px;flex-shrink:0;background:white;">
            <button onclick="renderSplitView('list')"
                    class="py-4 px-6 border-2 border-gray-100 bg-white text-gray-500 rounded-[20px] text-sm font-black cursor-pointer hover:bg-gray-50 transition-all active:scale-95">
                Quay lại
            </button>
            <button onclick="_confirmSplitCash(${subtotal})"
                    class="flex-1 py-4 bg-[#1a4d2e] text-white rounded-[20px] text-base font-black uppercase tracking-wide shadow-lg shadow-[#1a4d2e]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                Xác nhận
                <span class="material-symbols-outlined font-bold text-xl">check_circle</span>
            </button>
        </div>`;
    _calcSplitChange(subtotal);
}

function formatSplitCashInput(el) {
    const raw = el.value.replace(/[^0-9]/g,'');
    el.value = raw ? Number(raw).toLocaleString('en-US') : '';
}
function _calcSplitChange(subtotal) {
    const raw = (document.getElementById('split-cash-input')?.value||'').replace(/,/g,'');
    const change = Math.max(0, (Number(raw)||0) - subtotal);
    const el = document.getElementById('split-change-display');
    if (el) { el.innerText = change.toLocaleString()+'đ'; el.style.color = change > 0 ? '' : '#d1d5db'; }
}
function quickSplitCash(val, subtotal) {
    const el = document.getElementById('split-cash-input');
    if (el) { el.value = val.toLocaleString('en-US'); _calcSplitChange(subtotal); }
}
function _confirmSplitCash(subtotal) {
    const raw = (document.getElementById('split-cash-input')?.value||'').replace(/,/g,'');
    const paid = Number(raw) || subtotal;
    if (paid < subtotal) { alert('Tiền khách đưa chưa đủ!'); return; }
    splitGroups.push({ ids: Array.from(splitSelected), method:'cash', subtotal, paid, change:Math.max(0,paid-subtotal) });
    splitSelected.clear();
    _checkSplitAllPaid();
}

// ─── CHECK ALL PAID ───────────────────────────────────────────
function _checkSplitAllPaid() {
    const paidIds = _getPaidIds();
    const allPaid = splitExpandedCart.length > 0 &&
                    splitExpandedCart.every(it => paidIds.has(it.stableId));
    if (allPaid) renderSplitView('summary');
    else renderSplitView('list');
}

// ─── QR FLOW ──────────────────────────────────────────────────
function _initSplitQR() {
    let subtotal = 0;
    const pendingIds = Array.from(splitSelected);
    pendingIds.forEach(id => {
        const it = splitExpandedCart.find(x => x.stableId === id);
        if (it) subtotal += it.price || 0;
    });
    renderSplitView('qr');
    _startSplitQR(subtotal, pendingIds);
}

function _startSplitQR(subtotal, pendingIds) {
    const API_URL = "https://us-central1-the-cafe-33.cloudfunctions.net/createPayment";
    fetch(API_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ amount: subtotal }) })
    .then(r => r.json())
    .then(result => {
        if (result.status === 'success') {
            const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=' + encodeURIComponent(result.qrCode);
            const wrap = document.getElementById('split-qr-img-wrap');
            if (wrap) wrap.innerHTML = '<img src="'+qrUrl+'" style="width:100%;height:100%;object-fit:contain;border-radius:18px;">';
            const codeEl = document.getElementById('split-qr-code-text');
            if (codeEl) codeEl.textContent = result.orderCodeFull || '';
            _listenSplitQR(subtotal, pendingIds, result.orderCodeFull);
        } else {
            const s = document.getElementById('split-qr-status');
            if (s) s.innerHTML = '<span style="color:#ef4444;">Lỗi tạo QR — thử lại!</span>';
        }
    })
    .catch(() => {
        const s = document.getElementById('split-qr-status');
        if (s) s.innerHTML = '<span style="color:#ef4444;">Lỗi kết nối!</span>';
    });
}

function _listenSplitQR(subtotal, pendingIds, code) {
    if (_splitQRUnsubscribe) { try { db.ref('payment_events').off(); } catch(e){} }
    splitQRListening = true;
    _splitQRUnsubscribe = db.ref('payment_events').limitToLast(5).on('value', snap => {
        if (!snap.val()) return;
        Object.values(snap.val()).forEach(data => {
            const amt = Number(data.amount || 0);
            const dc  = String(data.orderCode || '').trim();
            const isCodeMatch = code
                ? (dc === code || (data.description||'').includes(code) || (data.content||'').includes(code))
                : amt >= subtotal;
            if (isCodeMatch && amt >= subtotal) _onSplitQRSuccess(subtotal, pendingIds);
        });
    });
}

function _onSplitQRSuccess(subtotal, pendingIds) {
    if (!splitQRListening) return;
    splitQRListening = false;
    try { db.ref('payment_events').off(); } catch(e){}
    _splitQRUnsubscribe = null;
    splitGroups.push({ ids: pendingIds, method: 'bank', subtotal, paid: subtotal, change: 0 });
    const s = document.getElementById('split-qr-status');
    if (s) { s.style.color = '#16a34a'; s.textContent = 'Da nhan tien!'; }
    splitSelected.clear();
    setTimeout(_checkSplitAllPaid, 1200);
}

function _cancelSplitQR() {
    splitQRListening = false;
    try { db.ref('payment_events').off(); } catch(e){}
    _splitQRUnsubscribe = null;
    renderSplitView('list');
}

function _renderSplitQR(container) {
    let subtotal = 0;
    splitSelected.forEach(id => {
        const it = splitExpandedCart.find(x => x.stableId === id);
        if (it) subtotal += it.price || 0;
    });
    container.innerHTML = `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px;gap:20px;">
            <p style="margin:0;font-size:0.72rem;font-weight:900;color:#9ca3af;text-transform:uppercase;letter-spacing:.12em;">Chuyển khoản &middot; ${subtotal.toLocaleString()}đ</p>
            <div id="split-qr-img-wrap"
                 style="width:200px;height:200px;border-radius:24px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid #e5e7eb;">
                <div style="width:32px;height:32px;border:4px solid #e5e7eb;border-top-color:#006241;border-radius:50%;animation:spin .7s linear infinite;"></div>
            </div>
            <p id="split-qr-code-text" style="margin:0;font-size:0.72rem;font-family:monospace;color:#9ca3af;letter-spacing:.1em;">Đang tạo mã...</p>
            <div id="split-qr-status" style="font-size:0.95rem;font-weight:800;color:#f59e0b;">Đang chờ thanh toán...</div>
        </div>
        <div style="padding:16px 24px 24px;border-top:1px solid #f3f4f6;flex-shrink:0;background:white;">
            <button onclick="_cancelSplitQR()"
                style="width:100%;padding:16px;border:2px solid #e5e7eb;background:white;color:#6b7280;border-radius:20px;font-size:0.9rem;font-weight:900;cursor:pointer;transition:all .15s;"
                onmouseover="this.style.background='#f9fafb';" onmouseout="this.style.background='white';">Huỷ, chọn lại</button>
        </div>`;
}

function _renderSplitSummary(container) {
    let grandTotal = 0;
    const usedMethods = new Set();
    splitGroups.forEach(g => { grandTotal += g.subtotal; usedMethods.add(g.method); });
    const methodLabel = usedMethods.size === 2 ? 'Tiền mặt + Chuyển khoản'
                      : usedMethods.has('bank') ? 'Chuyển khoản' : 'Tiền mặt';

    let groupsHTML = '';
    splitGroups.forEach((g, gi) => {
        const isCash    = g.method === 'cash';
        const accentClr = isCash ? '#16a34a' : '#1e3932';
        const lightBg   = isCash ? '#f0fdf4'  : '#f8fafc';
        const borderClr = isCash ? '#bbf7d0'  : '#e2e8f0';
        const label     = isCash ? 'Tiền mặt' : 'Chuyển khoản';

        const itemsHTML = g.ids.map(id => {
            const it = splitExpandedCart.find(x => x.stableId === id);
            return it ? `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px dashed #f3f4f6;">
                <span style="font-size:0.92rem;font-weight:800;color:#1e3932;">${it.name}${it.size ? ` <span style="font-size:0.78rem;color:#9ca3af;font-weight:700;">${it.size}</span>` : ''}</span>
                <span style="font-size:0.92rem;font-weight:900;color:#006241;">${(it.price||0).toLocaleString()}đ</span>
            </div>` : '';
        }).join('');

        const footerHTML = isCash ? `
            <div style="display:flex;justify-content:space-between;padding:10px 16px;background:#f0fdf4;border-top:1px solid #bbf7d0;">
                <span style="font-size:0.82rem;font-weight:700;color:#6b7280;">Nhận: <strong style="color:#1e3932;">${g.paid.toLocaleString()}đ</strong></span>
                <span style="font-size:0.82rem;font-weight:700;color:#6b7280;">Thừa: <strong style="color:${g.change>0?'#2563eb':'#9ca3af'};">${g.change.toLocaleString()}đ</strong></span>
            </div>` : '';

        groupsHTML += `
        <div style="border:2px solid ${borderClr};border-radius:20px;overflow:hidden;margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:${lightBg};border-bottom:1px solid ${borderClr};">
                <span style="font-size:0.72rem;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:${accentClr};">${label} &mdash; Nhóm ${gi+1}</span>
                <span style="font-size:1.1rem;font-weight:900;color:${accentClr};">${g.subtotal.toLocaleString()}đ</span>
            </div>
            <div style="padding:4px 16px;">${itemsHTML}</div>
            ${footerHTML}
        </div>`;
    });

    container.innerHTML = `
        <div style="flex:1;overflow-y:auto;padding:20px 24px 8px;">
            <p style="font-size:0.68rem;font-weight:900;color:#9ca3af;text-transform:uppercase;letter-spacing:.12em;margin:0 0 16px;">Chi tiết thanh toán</p>
            ${groupsHTML}
            <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 4px 4px;border-top:2.5px solid #006241;margin-top:4px;">
                <span style="font-size:0.9rem;font-weight:900;color:#374151;text-transform:uppercase;letter-spacing:.04em;">Tổng cộng</span>
                <span style="font-size:1.8rem;font-weight:900;color:#006241;">${grandTotal.toLocaleString()}đ</span>
            </div>
        </div>
        <div style="padding:16px 24px 24px;border-top:1px solid #f3f4f6;display:flex;gap:12px;flex-shrink:0;background:white;">
            <button onclick="renderSplitView('list')"
                style="padding:16px 20px;border:2px solid #e5e7eb;background:white;color:#6b7280;border-radius:20px;font-size:0.9rem;font-weight:900;cursor:pointer;transition:all .15s;"
                onmouseover="this.style.background='#f9fafb';" onmouseout="this.style.background='white';">Sửa</button>
            <button onclick="_completeSplitPayment('${methodLabel}')"
                style="flex:1;padding:16px;background:#f59e0b;color:white;border:none;border-radius:20px;font-size:0.95rem;font-weight:900;cursor:pointer;text-transform:uppercase;letter-spacing:.04em;box-shadow:0 4px 16px rgba(245,158,11,.25);transition:opacity .15s;"
                onmouseover="this.style.opacity='.85';" onmouseout="this.style.opacity='1';">Hoàn tất &amp; Lưu đơn</button>
        </div>`;
}
function _completeSplitPayment(methodLabel) {
    let cashPaid = currentTotal, cashChange = 0;
    const cashGrps = splitGroups.filter(g => g.method === 'cash');
    if (cashGrps.length) {
        cashPaid  = cashGrps.reduce((s,g) => s+g.paid,   0);
        cashChange = cashGrps.reduce((s,g) => s+g.change, 0);
    }
    _splitOrderMeta = {
        isSplit: true,
        groups: splitGroups.map(g => ({
            method:   g.method,
            subtotal: g.subtotal,
            paid:     g.paid,
            change:   g.change,
            items:    g.ids.map(id => {
                const it = splitExpandedCart.find(x => x.stableId === id);
                return it ? { name: it.name, size: it.size, price: it.price } : null;
            }).filter(Boolean)
        }))
    };
    closeSplitModal();
    resetSplitState();
    saveOrderToFirebase(methodLabel, cashPaid, cashChange);
}


