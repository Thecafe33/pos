function renderDiscountList() {
    var listEl = document.getElementById('discount-list');
    var countEl = document.getElementById('discount-count');
    if (!listEl) return;
    listEl.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;padding:48px 0;opacity:0.35;"><span style="font-size:2rem;margin-bottom:8px;">⏳</span><p style="font-size:0.8rem;font-weight:700;color:#9ca3af;">Đang tải...</p></div>';

    fstore.collection('rewards').get().then(function(snapshot) {
        var data = {};
        snapshot.forEach(function(doc) { data[doc.id] = doc.data(); });
        var keys = Object.keys(data);
        if (countEl) countEl.innerText = keys.length + ' quà';

        if (keys.length === 0) {
            listEl.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;padding:64px 0;opacity:0.4;"><span style="font-size:3rem;margin-bottom:12px;">🎁</span><p style="font-size:0.9rem;font-weight:800;color:#6b7280;margin-bottom:4px;">Chưa có quà nào</p><p style="font-size:0.75rem;color:#9ca3af;">Tạo quà đầu tiên →</p></div>';
            return;
        }

        listEl.innerHTML = '';
        var typeLabels = { item: 'Theo món', order: 'Toàn đơn', percent: 'Phần trăm (%)', item_free: 'Miễn phí 1 ly', item_upsize: 'Up size M→L' };
        var typeBg = { item: '#EDE9FE', order: '#DBEAFE', percent: '#FEF3C7', item_free: '#DCFCE7', item_upsize: '#FEF9C3' };
        var typeClr = { item: '#7C3AED', order: '#1D4ED8', percent: '#D97706', item_free: '#16a34a', item_upsize: '#ca8a04' };

        keys.forEach(function(k) {
            var d = data[k];
            var valueText = d.type === 'percent'
                ? ('−' + d.value + '%')
                : (d.value ? '−' + Number(d.value).toLocaleString() + 'đ' : '★ ' + (d.cost || 0) + ' điểm');
            var isOff = d.active === false;

            var row = document.createElement('div');
            row.style.cssText = 'background:' + (isOff ? '#FAFAFA' : 'white') + ';border-radius:24px;padding:14px 16px;border:2px solid ' + (isOff ? '#f3f4f6' : '#f9fafb') + ';cursor:pointer;transition:all 0.18s;opacity:' + (isOff ? '0.55' : '1') + ';box-shadow:0 1px 6px rgba(0,0,0,0.04);display:flex;align-items:center;gap:12px;';
            row.onmouseover = function() { this.style.borderColor = '#006241'; this.style.boxShadow = '0 4px 16px rgba(0,98,65,0.12)'; };
            row.onmouseout = function() { this.style.borderColor = isOff ? '#f3f4f6' : '#f9fafb'; this.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)'; };

            var imgEl = document.createElement('div');
            imgEl.style.cssText = 'width:48px;height:48px;border-radius:20px;overflow:hidden;flex-shrink:0;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:1.4rem;';
            if (d.img) {
                var im = document.createElement('img');
                im.src = d.img;
                im.style.cssText = 'width:100%;height:100%;object-fit:cover;';
                imgEl.appendChild(im);
            } else {
                imgEl.innerText = '🎁';
            }

            var tBg = typeBg[d.type] || '#f3f4f6';
            var tClr = typeClr[d.type] || '#374151';
            var statusHtml = isOff
                ? '<span style="font-size:0.6rem;font-weight:900;background:#FEE2E2;color:#EF4444;padding:2px 8px;border-radius:999px;">TẮT</span>'
                : '<span style="font-size:0.6rem;font-weight:900;background:#D1FAE5;color:#059669;padding:2px 8px;border-radius:999px;">BẬT</span>';

            var info = document.createElement('div');
            info.style.cssText = 'flex:1;min-width:0;';
            info.innerHTML =
                '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">' +
                    (d.code ? '<span style="font-family:monospace;font-weight:900;font-size:0.95rem;color:#006241;letter-spacing:0.06em;">' + d.code + '</span>' : '') +
                    (d.type ? '<span style="font-size:0.6rem;font-weight:800;background:' + tBg + ';color:' + tClr + ';padding:2px 8px;border-radius:999px;">' + (typeLabels[d.type] || d.type) + '</span>' : '') +
                    statusHtml +
                '</div>' +
                '<p style="font-size:0.875rem;font-weight:700;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0 0 4px 0;">' + (d.label || d.name || '') + '</p>' +
                (d.targetItem ? '<p style="font-size:0.7rem;color:#9ca3af;margin:0 0 2px 0;">📦 <b style="color:#6b7280;">' + d.targetItem + '</b></p>' : '') +
                '<span style="font-size:0.85rem;font-weight:900;color:#EF4444;">' + valueText + '</span>';

            row.appendChild(imgEl);
            row.appendChild(info);
            row.appendChild(Object.assign(document.createElement('span'), { innerText: '›', style: { fontSize: '1.2rem', opacity: '0.3' } }));
            row.addEventListener('click', function() { discountFormLoad(k, d); });
            listEl.appendChild(row);
        });
    }).catch(function(err) {
        listEl.innerHTML = '<div style="padding:24px;text-align:center;color:#ef4444;"><p style="font-size:0.72rem;font-weight:700;">Lỗi tải rewards: ' + err.message + '</p></div>';
    });
}

function discountFormLoad(key, d) {
    document.getElementById('df-editing-key').value = key;
    document.getElementById('df-code').value = d.code || '';
    document.getElementById('df-label').value = d.label || d.name || '';
    document.getElementById('df-img').value = d.img || '';
    document.getElementById('df-desc').value = d.desc || '';
    document.getElementById('df-value').value = d.value || '';
    document.getElementById('df-cost').value = d.cost || 0;
    document.getElementById('df-limit').value = d.usageLimit || 0;
    dfPreviewImg(d.img || '');
    var s = document.getElementById('df-target-search');
    var h = document.getElementById('df-target');
    if (s) s.value = d.targetItem || '';
    if (h) h.value = d.targetItem || '';
    dfShowSelectedItem(d.targetItem || '');
    _dfType = d.type || 'item';
    _dfActive = d.active !== false;
    dfSetType(_dfType);
    dfRenderActiveToggle();
    var condCat = document.getElementById('df-cond-category');
    var condMax = document.getElementById('df-cond-maxprice');
    var condMin = document.getElementById('df-cond-minprice');
    if (condCat) {
        dfLoadCategoryOptions(condCat);
        setTimeout(function() { condCat.value = d.conditionCategory || ''; }, 200);
    }
    if (condMax) condMax.value = d.conditionMaxPrice || '';
    if (condMin) condMin.value = d.conditionMinPrice || '';
    document.getElementById('discount-form-title').innerText = '✏️ Chỉnh sửa';
    document.getElementById('df-delete-btn').style.display = 'block';
}

function discountFormClear() {
    ['df-editing-key','df-code','df-label','df-img','df-desc','df-value','df-target-search','df-target','df-cond-category','df-cond-maxprice','df-cond-minprice'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('df-cost').value = '0';
    document.getElementById('df-limit').value = '0';
    dfShowSelectedItem('');
    dfPreviewImg('');
    _dfType = 'item'; _dfActive = true;
    dfSetType('item');
    dfRenderActiveToggle();
    document.getElementById('discount-form-title').innerText = '✦ Thêm quà mới';
    document.getElementById('df-delete-btn').style.display = 'none';
}

function dfPreviewImg(url) {
    var prev = document.getElementById('df-img-preview');
    if (!prev) return;
    if (url && url.startsWith('http')) {
        var img = document.createElement('img');
        img.src = url;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        prev.innerHTML = '';
        prev.appendChild(img);
    } else {
        prev.innerHTML = '🖼';
    }
}

function dfShowMenuDropdown() {
    dfFilterMenu(document.getElementById('df-target-search').value || '');
    var dd = document.getElementById('df-menu-dropdown');
    if (dd) dd.style.display = 'block';
}
function dfHideMenuDropdown() {
    var dd = document.getElementById('df-menu-dropdown');
    if (dd) dd.style.display = 'none';
}
function dfFilterMenu(q) {
    var dd = document.getElementById('df-menu-dropdown');
    if (!dd) return;
    var items = (typeof menu !== 'undefined' ? menu : []);
    var fil = q.trim() === '' ? items : items.filter(function(m) {
        return m.name && m.name.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    });
    dd.innerHTML = '';
    if (fil.length === 0) {
        dd.innerHTML = '<div style="padding:14px;text-align:center;color:#9ca3af;font-size:0.85rem;">Không tìm thấy</div>';
    } else {
        fil.slice(0, 40).forEach(function(m) {
            var row = document.createElement('div');
            row.style.cssText = 'padding:11px 18px;cursor:pointer;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;';
            row.onmouseover = function() { this.style.background = '#F0FDF4'; };
            row.onmouseout = function() { this.style.background = ''; };
            var nm = document.createElement('span');
            nm.style.cssText = 'font-weight:600;font-size:0.9rem;color:#1f2937;';
            nm.innerText = m.name;
            var pr = document.createElement('span');
            pr.style.cssText = 'font-size:0.75rem;color:#9ca3af;font-weight:700;';
            pr.innerText = m.priceM ? m.priceM.toLocaleString() + 'đ' : '';
            row.appendChild(nm);
            row.appendChild(pr);
            row.addEventListener('click', function() { dfSelectMenuItem(m.name); });
            dd.appendChild(row);
        });
    }
    dd.style.display = 'block';
}
function dfSelectMenuItem(name) {
    document.getElementById('df-target-search').value = name;
    document.getElementById('df-target').value = name;
    dfHideMenuDropdown();
    dfShowSelectedItem(name);
    document.getElementById('df-target-search').style.borderColor = 'transparent';
}
function dfShowSelectedItem(name) {
    var row = document.getElementById('df-selected-item');
    var nameEl = document.getElementById('df-selected-item-name');
    if (!row || !nameEl) return;
    if (name) {
        nameEl.innerText = '✓ ' + name;
        row.style.display = 'flex';
    } else {
        row.style.display = 'none';
    }
}
function dfClearSelectedItem() {
    document.getElementById('df-target-search').value = '';
    document.getElementById('df-target').value = '';
    dfShowSelectedItem('');
}

function dfSetType(type) {
    _dfType = type;
    var icons = { item: 'Theo món', order: 'Toàn đơn', percent: 'Phần trăm (%)', item_free: 'Miễn phí 1 ly', item_upsize: 'Up size M→L' };
    ['item', 'order', 'percent', 'item_free', 'item_upsize'].forEach(function(t) {
        var btn = document.getElementById('df-type-' + t);
        if (!btn) return;
        btn.innerHTML = icons[t];
        if (t === type) {
            btn.style.background = '#006241'; btn.style.color = 'white';
            btn.style.boxShadow = '0 2px 10px rgba(0,98,65,0.35)';
        } else {
            btn.style.background = 'transparent'; btn.style.color = '#9ca3af';
            btn.style.boxShadow = 'none';
        }
    });
    var targetRow = document.getElementById('df-target-row');
    if (targetRow) targetRow.style.display = (type === 'item') ? 'block' : 'none';
    var condRow = document.getElementById('df-condition-row');
    if (condRow) condRow.style.display = (type === 'item_free' || type === 'item_upsize') ? 'block' : 'none';
    var valLabel = document.getElementById('df-value-label');
    var valInput = document.getElementById('df-value');
    if (type === 'percent') {
        if (valLabel) valLabel.innerText = 'Phần trăm giảm (%)';
        if (valInput) { valInput.placeholder = '10'; valInput.closest('div').style.display = 'block'; }
    } else if (type === 'item_free') {
        if (valLabel) valLabel.innerText = 'Giá trị miễn phí tối đa (đ, 0 = bất kỳ)';
        if (valInput) { valInput.placeholder = '0'; valInput.closest('div').style.display = 'block'; }
    } else if (type === 'item_upsize') {
        if (valLabel) valLabel.innerText = 'Phụ thu up size (đ, 0 = miễn phí hoàn toàn)';
        if (valInput) { valInput.placeholder = '0'; valInput.closest('div').style.display = 'block'; }
    } else {
        if (valLabel) valLabel.innerText = 'Số tiền giảm (đ)';
        if (valInput) { valInput.placeholder = '5000'; valInput.closest('div').style.display = 'block'; }
    }
}
function dfLoadCategoryOptions(selectEl) {
    if (selectEl.dataset.loaded) return;
    selectEl.dataset.loaded = '1';
    var cats = [];
    var menuArr = window._menuData || [];
    menuArr.forEach(function(m) { if (m.type && cats.indexOf(m.type) < 0) cats.push(m.type); });
    if (cats.length > 0) {
        cats.sort();
        var current = selectEl.value;
        while (selectEl.options.length > 1) selectEl.remove(1);
        cats.forEach(function(c) {
            var opt = document.createElement('option');
            opt.value = c; opt.text = c;
            selectEl.appendChild(opt);
        });
        if (current) selectEl.value = current;
    } else {
        db.ref('menu').once('value', function(snap) {
            var data = snap.val() || {};
            var arr = Array.isArray(data) ? data : Object.values(data);
            arr.forEach(function(m) { if (m.type && cats.indexOf(m.type) < 0) cats.push(m.type); });
            cats.sort();
            var current = selectEl.value;
            while (selectEl.options.length > 1) selectEl.remove(1);
            cats.forEach(function(c) {
                var opt = document.createElement('option');
                opt.value = c; opt.text = c;
                selectEl.appendChild(opt);
            });
            if (current) selectEl.value = current;
        });
    }
}

function dfToggleActive() { _dfActive = !_dfActive; dfRenderActiveToggle(); }
function dfRenderActiveToggle() {
    var btn = document.getElementById('df-active-toggle');
    if (!btn) return;
    if (_dfActive) {
        btn.style.background = '#006241';
        btn.innerHTML = '<span style="position:absolute;top:3px;right:3px;width:24px;height:24px;background:white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></span>';
    } else {
        btn.style.background = '#d1d5db';
        btn.innerHTML = '<span style="position:absolute;top:3px;left:3px;width:24px;height:24px;background:white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></span>';
    }
}

function discountFormSave() {
    var code  = (document.getElementById('df-code').value || '').trim().toUpperCase();
    var label = (document.getElementById('df-label').value || '').trim();
    var img   = (document.getElementById('df-img').value || '').trim();
    var desc  = (document.getElementById('df-desc').value || '').trim();
    var target = (document.getElementById('df-target').value || '').trim().toLowerCase();
    var value  = parseFloat(document.getElementById('df-value').value) || 0;
    var cost   = parseInt(document.getElementById('df-cost').value) || 0;
    var limit  = parseInt(document.getElementById('df-limit').value) || 0;
    var editKey = document.getElementById('df-editing-key').value;

    if (!label) return alert('Vui lòng nhập tên quà!');
    if (_dfType === 'item' && !target) return alert('Vui lòng chọn món áp dụng!');

    var condCategory = (document.getElementById('df-cond-category') || {}).value || '';
    var condMaxPrice = parseInt((document.getElementById('df-cond-maxprice') || {}).value) || 0;
    var condMinPrice = parseInt((document.getElementById('df-cond-minprice') || {}).value) || 0;

    var record = {
        code:       code || null,
        label:      label,
        name:       label,
        img:        img || '',
        desc:       desc || '',
        type:       _dfType,
        value:      value || 0,
        cost:       cost || 0,
        active:     _dfActive,
        usageLimit: limit,
        usedCount:  0
    };
    if (_dfType === 'item' || _dfType === 'item_free' || _dfType === 'item_upsize') {
        if (target) record.targetItem = target;
    }
    if (_dfType === 'item_free' || _dfType === 'item_upsize') {
        if (condCategory) record.conditionCategory = condCategory;
        if (condMaxPrice > 0) record.conditionMaxPrice = condMaxPrice;
        if (condMinPrice > 0) record.conditionMinPrice = condMinPrice;
    }

    var isNew = !editKey;
    var key = isNew ? ('gift_' + (code || Date.now())) : editKey;

    if (!isNew && _dfType === 'item' && !target) {
        var cached = _discountCache[editKey];
        if (cached && cached.targetItem) {
            target = cached.targetItem;
            var hEl = document.getElementById('df-target');
            if (hEl) hEl.value = target;
        }
    }

    var save = function(usedCount, existingData) {
        record.usedCount = usedCount || 0;
        if (!isNew && existingData) {
            if (!record.targetItem && existingData.targetItem)
                record.targetItem = existingData.targetItem;
            if (!record.conditionCategory && existingData.conditionCategory)
                record.conditionCategory = existingData.conditionCategory;
            if (!record.conditionMaxPrice && existingData.conditionMaxPrice)
                record.conditionMaxPrice = existingData.conditionMaxPrice;
            if (!record.conditionMinPrice && existingData.conditionMinPrice)
                record.conditionMinPrice = existingData.conditionMinPrice;
        }
        fstore.collection('rewards').doc(key).set(record).then(function() {
            // Mirror to RT for customer app (index.html) to read without Firestore auth
            db.ref('rewards_mirror/' + key).set(Object.assign({}, record, {_docId: key}));
            showAppModal(isNew ? 'Đã tạo' : 'Đã lưu', 'Quà <b>' + label + '</b> ' + (isNew ? 'đã được tạo!' : 'đã được cập nhật!'), '🎁');
            discountFormClear();
            renderDiscountList();
            _discountCache[key] = record;
        }).catch(function(err) { alert('Lỗi: ' + err.message); });
    };
    if (!isNew) {
        fstore.collection('rewards').doc(editKey).get().then(function(doc) {
            var existing = doc.exists ? doc.data() : {};
            save(existing.usedCount || 0, existing);
        });
    } else {
        save(0, null);
    }
}

function discountFormDelete() {
    var editKey = document.getElementById('df-editing-key').value;
    var label = document.getElementById('df-label').value;
    if (!editKey || !confirm('Xóa "' + label + '"?')) return;
    fstore.collection('rewards').doc(editKey).delete().then(function() {
        // Remove from RT mirror too
        db.ref('rewards_mirror/' + editKey).remove();
        showAppModal('Đã xóa', 'Đã xóa <b>' + label + '</b>!', '🗑️');
        discountFormClear();
        renderDiscountList();
        delete _discountCache[editKey];
    }).catch(function(err) { alert('Lỗi: ' + err.message); });
}
</script>
<div id="modal-cleaning-fee" class="fixed inset-0 bg-black/40 z-[9999] hidden flex items-center justify-center p-6 backdrop-blur-[4px]">
    <div class="bg-white/95 backdrop-blur-2xl w-full max-w-[340px] rounded-[35px] shadow-[0_30px_70px_rgba(0,0,0,0.3)] text-center border border-white/60 p-8 transform scale-100 transition-all">

        <div class="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-red-100">
            <span class="text-2xl">🧹</span>
        </div>

        <h3 class="text-lg font-black text-gray-800 uppercase tracking-wide mb-1">Phí Vệ Sinh</h3>
        <p class="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-6">Chọn mức phí lưu nợ lần sau</p>

        <div class="grid grid-cols-3 gap-3 mb-6">
            <button onclick="submitCleaningFee(20000)" class="py-4 bg-white border border-gray-100 rounded-[20px] text-gray-700 font-black text-xs shadow-sm active:scale-95 transition-all hover:border-red-500 hover:text-red-500 hover:shadow-md">
                20K
            </button>
            <button onclick="submitCleaningFee(30000)" class="py-4 bg-white border border-gray-100 rounded-[20px] text-gray-700 font-black text-xs shadow-sm active:scale-95 transition-all hover:border-red-500 hover:text-red-500 hover:shadow-md">
                30K
            </button>
            <button onclick="submitCleaningFee(50000)" class="py-4 bg-white border border-gray-100 rounded-[20px] text-gray-700 font-black text-xs shadow-sm active:scale-95 transition-all hover:border-red-500 hover:text-red-500 hover:shadow-md">
                50K
            </button>
        </div>

        <button onclick="document.getElementById('modal-cleaning-fee').classList.add('hidden')"
            class="text-gray-400 font-bold text-xs hover:text-gray-600 underline decoration-dashed underline-offset-4">
            Đóng
        </button>
    </div>
</div>
<div id="ios-confirm-modal" class="hidden fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[4px] transition-opacity duration-300 p-6">
    <div class="bg-white/90 backdrop-blur-2xl w-full max-w-[320px] rounded-[35px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] text-center overflow-hidden border border-white/40">

        <div class="p-8 pb-6">
            <h3 class="text-xl font-black text-[#006241] mb-2 tracking-wide">Xác Nhận</h3>
            <p id="ios-modal-message" class="text-sm text-gray-600 font-medium leading-relaxed">
                Nội dung xác nhận...
            </p>
        </div>

        <div class="grid grid-cols-2 gap-0 border-t border-gray-200/50 bg-white/50">
            <button onclick="closeIOSModal()"
                class="py-5 text-sm text-gray-500 font-bold hover:bg-gray-100 transition-colors border-r border-gray-200/50">
                Hủy bỏ
            </button>
            <button id="ios-confirm-btn"
                class="py-5 text-sm text-[#006241] font-black hover:bg-green-50 transition-colors">
                Đồng ý
            </button>
        </div>
    </div>
</div>
<div id="qr-modal" class="fixed inset-0 bg-black/80 z-[100000] hidden flex items-center justify-center p-6 backdrop-blur-md">
    <div class="bg-white rounded-[30px] p-8 max-w-sm w-full text-center shadow-2xl relative">
        <button onclick="closeQRModal()" class="absolute top-4 right-4 text-gray-400 text-2xl">✕</button>
        <h3 class="text-[#006241] font-black text-xl uppercase mb-6">Quét mã thanh toán</h3>
        <img id="vietqr-img" src="" class="w-64 h-64 mx-auto mb-4 rounded-xl border border-gray-100">
        <div class="bg-yellow-50 p-3 rounded-xl mb-4">
            <p class="text-[10px] text-gray-500 font-bold uppercase">Nội dung chuyển khoản</p>
            <p id="qr-content" class="text-xl font-black text-[#006241]">--</p>
        </div>
        <div id="qr-status" class="text-gray-400 font-bold text-xs animate-pulse">Đang đợi tiền về...</div>
    </div>
</div>
<div id="modal-cancel-reason" class="hidden fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[4px] transition-opacity duration-300 p-6">
    <div class="bg-white/95 backdrop-blur-xl w-full max-w-[340px] rounded-[35px] shadow-[0_30px_70px_rgba(0,0,0,0.25)] text-center transform scale-100 transition-all border border-white/50 p-8">

        <div class="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-red-100">
            <span class="text-2xl">🗑️</span>
        </div>

        <h3 class="text-lg font-black text-gray-800 uppercase tracking-wide mb-1">Hủy Lịch Này?</h3>
        <p class="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-6">Vui lòng chọn lý do hủy</p>

        <div class="space-y-3 mb-6">
            <button onclick="submitCancelBooking('customer_self')"
                class="w-full py-4 bg-white border border-gray-100 rounded-[20px] text-gray-700 font-bold text-xs uppercase shadow-sm active:scale-95 transition-all hover:border-amber-400 hover:text-amber-600 hover:shadow-md flex items-center justify-center gap-2">
                <span>📱</span> Khách tự hủy qua app
                <span class="text-[9px] text-amber-500 font-black">(-2đ Rep)</span>
            </button>
            <button onclick="submitCancelBooking('customer')"
                class="w-full py-4 bg-white border border-gray-100 rounded-[20px] text-gray-700 font-bold text-xs uppercase shadow-sm active:scale-95 transition-all hover:border-red-400 hover:text-red-500 hover:shadow-md flex items-center justify-center gap-2">
                <span>👤</span> Khách báo hủy (quán ghi nhận)
                <span class="text-[9px] text-red-400 font-black">(-8đ Rep)</span>
            </button>
            <button onclick="submitCancelBooking('store')"
                class="w-full py-4 bg-white border border-gray-100 rounded-[20px] text-gray-700 font-bold text-xs uppercase shadow-sm active:scale-95 transition-all hover:border-[#006241] hover:text-[#006241] hover:shadow-md flex items-center justify-center gap-2">
                <span>🏪</span> Quán hủy (System)
                <span class="text-[9px] text-gray-400 font-black">(0đ Rep)</span>
            </button>
        </div>

        <button onclick="document.getElementById('modal-cancel-reason').classList.add('hidden')"
            class="text-gray-400 font-bold text-xs hover:text-gray-600 underline decoration-dashed underline-offset-4">
            Đóng, không hủy nữa
        </button>
    </div>
</div>
    <div id="mobile-bottom-bar" class="hidden md:hidden fixed bottom-6 left-4 right-4 h-24 bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-white/60 flex items-center justify-between p-2 z-[9000] transition-all duration-300">

    <div onclick="openCartModal()" class="flex-1 h-full pl-6 flex flex-col justify-center cursor-pointer group">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 group-active:text-[#006241]">Tổng tạm tính</p>
        <div class="flex items-center gap-2">
            <p id="mob-bar-total" class="brand-font text-2xl text-[#1e3932] font-black tracking-tight">0đ</p>
            <span class="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full group-active:bg-green-100 group-active:text-[#006241]">^</span>
        </div>
    </div>

    <button onclick="switchView('payment')" class="h-full px-10 bg-[#006241] text-white rounded-[2.5rem] font-bold uppercase text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2 hover:bg-[#004f32]">
        <span>Thanh toán</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    </button>
</div>
<div id="split-payment-modal" class="hidden fixed inset-0 z-[100000] flex items-end md:items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all duration-300">
    <div id="split-modal-inner"
         class="bg-white w-full md:max-w-[500px] h-[92vh] md:h-auto md:max-h-[85vh] rounded-t-[40px] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        <!-- Header — clone từ modal đặt bed -->
        <div class="px-8 pt-8 pb-5 flex justify-between items-start bg-white shrink-0 border-b border-gray-100">
            <div>
                <h2 class="text-3xl font-black text-[#1e3932] tracking-tighter uppercase leading-none">Thu tiền riêng</h2>
                <p class="text-sm font-bold text-gray-400 mt-1">Chọn món rồi chọn phương thức</p>
            </div>
            <button onclick="closeSplitModal()"
                    class="w-12 h-12 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors active:scale-90">
                <span class="material-symbols-outlined text-2xl font-bold">close</span>
            </button>
        </div>
        <!-- Dynamic body -->
        <div id="split-modal-body" class="flex flex-col flex-1 overflow-hidden min-h-0 bg-white"></div>
    </div>
</div>
    <div id="modal-date-range" class="fixed inset-0 z-[100000] hidden flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
    <div class="bg-white w-[90%] max-w-[340px] rounded-[30px] p-6 shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-2 bg-[#006241]"></div>

        <h3 class="text-xl font-black text-[#1e3932] uppercase text-center mb-6 tracking-tight">Chọn Khoảng Thời Gian</h3>

        <div class="space-y-4">
            <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Từ ngày</label>
                <div class="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center">
                    <span class="material-symbols-outlined text-gray-400 mr-2">date_range</span>
                    <input type="date" id="filter-start-date" class="bg-transparent w-full text-sm font-bold text-[#1e3932] outline-none">
                </div>
            </div>

            <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Đến ngày</label>
                <div class="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center">
                    <span class="material-symbols-outlined text-gray-400 mr-2">event</span>
                    <input type="date" id="filter-end-date" class="bg-transparent w-full text-sm font-bold text-[#1e3932] outline-none">
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3 mt-8">
            <button onclick="document.getElementById('modal-date-range').classList.add('hidden')" class="py-3.5 rounded-xl bg-gray-100 text-gray-500 font-bold text-xs uppercase hover:bg-gray-200 transition-all">
                Đóng
            </button>
            <button onclick="submitDateFilter()" class="py-3.5 rounded-xl bg-[#006241] text-white font-bold text-xs uppercase shadow-lg shadow-green-900/20 active:scale-95 transition-all">
                Áp dụng
            </button>
        </div>
    </div>
</div>
    <div id="modal-item-select" class="fixed inset-0 z-[100001] hidden flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
    <div class="bg-white w-[90%] max-w-[360px] rounded-[30px] flex flex-col max-h-[85vh] shadow-2xl relative overflow-hidden">

        <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
            <div>
                <h3 class="text-lg font-black text-[#1e3932] uppercase">Chọn món theo dõi</h3>
                <p class="text-[10px] text-gray-400 font-bold" id="item-select-count">Đã chọn: 0/10</p>
            </div>
            <button onclick="document.getElementById('modal-item-select').classList.add('hidden')" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">✕</button>
        </div>

        <div class="p-4 bg-gray-50 border-b border-gray-100">
            <input type="text" oninput="filterItemSelectionList(this.value)" placeholder="Tìm tên món..." class="w-full bg-white px-4 py-3 rounded-xl text-sm font-bold border border-gray-200 focus:border-[#006241] outline-none">
        </div>

        <div id="item-select-list" class="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-white">
            </div>

        <div class="p-4 border-t border-gray-100 bg-white z-10">
            <div class="grid grid-cols-2 gap-3">
                <button onclick="resetItemSelection()" class="py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs uppercase">Mặc định (Top 10)</button>
                <button onclick="applyItemSelection()" class="py-3 rounded-xl bg-[#006241] text-white font-bold text-xs uppercase shadow-lg shadow-green-900/20 active:scale-95 transition-all">Xem kết quả</button>
            </div>
        </div>
    </div>
</div>
    <div id="modal-cancel-list" class="fixed inset-0 z-[100002] hidden flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
    <div class="bg-white w-[90%] max-w-[360px] rounded-[30px] flex flex-col max-h-[80vh] shadow-2xl relative overflow-hidden">

        <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50">
            <div>
                <h3 class="text-lg font-black text-red-600 uppercase">Lịch sử hủy Bed</h3>
                <p class="text-[10px] text-red-400 font-bold">Danh sách chi tiết</p>
            </div>
            <button onclick="document.getElementById('modal-cancel-list').classList.add('hidden')" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500 font-bold shadow-sm">✕</button>
        </div>

        <div id="cancel-list-content" class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white">
            </div>
    </div>
</div>
    <div id="view-history-mobile" class="hidden fixed inset-0 z-[9999] flex flex-col bg-white animate-fade-in">

    <div class="px-5 pt-12 pb-4 bg-white shadow-sm border-b border-gray-100 shrink-0 sticky top-0 z-20">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-3xl font-black text-[#1e3932] tracking-tighter uppercase">Lịch sử đơn</h1>

            <button onclick="switchView('menu')" class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 active:scale-90 transition-transform shadow-sm">
                <span class="material-symbols-outlined text-xl font-bold">close</span>
            </button>
        </div>

        <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-[20px]">search</span>
            <input type="text" id="mob-history-search" oninput="filterHistoryMobile(this.value)" placeholder="Tìm theo số tiền, SĐT..."
                   class="w-full bg-gray-50 pl-10 pr-4 py-3 rounded-xl text-sm font-bold text-gray-700 outline-none focus:bg-white focus:ring-2 focus:ring-[#006241]/20 transition-all border border-transparent focus:border-[#006241]/20">
        </div>
    </div>

    <div id="mob-history-list" class="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar pb-32">
        <div class="text-center text-gray-400 mt-10 text-xs">Đang tải dữ liệu...</div>
    </div>
</div>
<div id="sheet-history-detail" class="fixed inset-0 z-[100002] hidden flex items-end justify-center">
    <div onclick="closeHistoryDetailMobile()" class="absolute inset-0 bg-black/40 backdrop-blur-[4px] transition-opacity duration-300" id="sheet-backdrop"></div>

    <div id="sheet-content-main" class="mt-auto h-[94vh] w-full bg-white rounded-t-[32px] shadow-2xl flex flex-col relative z-10 overflow-hidden transform translate-y-full transition-transform duration-300 touch-none">

        <div class="px-5 pt-4 pb-2 flex items-center justify-between shrink-0 z-20 bg-white">
            <button onclick="closeHistoryDetailMobile()" class="flex items-center text-[#006B44] font-bold active:opacity-60 transition-opacity p-2 -ml-2">
                <span class="material-symbols-outlined text-[26px]">chevron_left</span>
                <span class="text-[16px] leading-none pb-0.5">Quay lại</span>
            </button>
            <div class="absolute left-1/2 -translate-x-1/2 top-3 w-10 h-1 bg-gray-200 rounded-full opacity-60"></div>

            <button onclick="closeHistoryDetailMobile()" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors">
                <span class="material-symbols-outlined text-gray-500 text-[20px]">close</span>
            </button>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar px-6 pt-0 pb-6 flex flex-col bg-white" id="sheet-scroll-body">

            <div class="mb-4 shrink-0 mt-2">
                <h1 class="text-[30px] font-black text-[#006B44] tracking-tight leading-tight">The cafe 33</h1>
                <div class="flex items-center gap-2 mt-1">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <p class="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Hóa đơn điện tử</p>
                </div>
            </div>

            <div id="detail-mob-items-list" class="flex-1 flex flex-col justify-start">
                </div>

            <div class="h-6"></div>

            <div class="mt-2 bg-[#F9FAFB] rounded-2xl p-4 shrink-0 border border-gray-100">
                <div class="flex items-center justify-between text-xs divide-x divide-gray-200">
                    <div class="px-2 flex-1 flex flex-col gap-1 first:pl-0">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thời gian</span>
                        <span id="detail-mob-time" class="font-bold text-gray-800 truncate">--:--</span>
                    </div>
                    <div class="px-4 flex-1 flex flex-col gap-1 items-center">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Khách</span>
                        <span id="detail-mob-cust" class="font-bold text-gray-800 truncate max-w-[90px]">--</span>
                    </div>
                    <div class="px-2 flex-1 flex flex-col gap-1 items-end last:pr-0">
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Thanh toán</span>
                        <span id="detail-mob-method" class="font-black text-[#006B44] truncate uppercase">--</span>
                    </div>
                </div>
            </div>

        </div>

        <div class="shrink-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 pt-4 pb-10 z-20">
            <div class="flex items-end justify-between">
                <button id="btn-cancel-order-mobile" class="w-14 h-14 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-transform group">
                    <span class="material-symbols-outlined text-[26px] group-active:rotate-12 transition-transform">delete</span>
                </button>

                <div class="text-right flex flex-col items-end">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Tổng Bill</span>
                    <div class="flex items-baseline gap-1 text-[#006B44]">
                        <span id="detail-mob-total" class="text-[42px] font-black tracking-tighter leading-none">0</span>
                        <span class="text-xl font-bold">đ</span>
                    </div>
                    <span id="detail-item-count" class="text-[11px] font-bold text-gray-400 mt-1">Số lượng: 0 món</span>
                    <div id="detail-mob-paid-row" class="hidden mt-2 pt-2 border-t border-dashed border-gray-200 flex flex-col items-end gap-1">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-bold text-gray-400 uppercase">Khách đưa</span>
                            <span id="detail-mob-paid" class="text-sm font-black text-gray-700">0đ</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-bold text-gray-400 uppercase">Tiền thừa</span>
                            <span id="detail-mob-change" class="text-sm font-black text-blue-600">0đ</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
    <div id="modal-smart-checkout" class="hidden fixed inset-0 z-[100000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all duration-300 opacity-0 scale-95" style="transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);">

    <div class="bg-white w-full max-w-[420px] rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/50">

        <div class="bg-gradient-to-br from-[#065F46] to-[#044e39] p-8 text-center relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div class="relative z-10">
                <p class="text-[10px] font-black text-emerald-200 uppercase tracking-[0.3em] mb-2">XÁC NHẬN TRẢ BED</p>
                <h2 id="sco-bed-name" class="text-4xl font-black text-white tracking-tighter mb-1">BED 01</h2>
                <p id="sco-customer" class="text-emerald-100 font-bold text-sm">Khách hàng: Nguyễn Văn A</p>
            </div>
        </div>

        <div class="p-6 bg-[#F2F4F7]">

            <div class="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 mb-6 flex items-center justify-between">
                <div>
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">THỜI GIAN LỐ</p>
                    <p id="sco-overtime" class="text-2xl font-black text-red-500">0 phút</p>
                </div>
                <div class="text-right">
                    <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">DỰ KIẾN PHẠT</p>
                    <p id="sco-fee" class="text-xl font-black text-slate-800">0 giờ</p>
                </div>
            </div>

            <div class="space-y-3">
                <button onclick="confirmCheckoutAuto()" class="w-full py-4 bg-[#065F46] text-white rounded-2xl font-black text-sm uppercase shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 group hover:bg-[#044e39]">
                    <span class="material-symbols-outlined group-hover:animate-bounce">auto_fix_high</span>
                    Tính phí tự động
                </button>

                <button onclick="confirmCheckoutManual()" class="w-full py-4 bg-white text-amber-600 border border-amber-100 rounded-2xl font-black text-sm uppercase shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-amber-50">
                    <span class="material-symbols-outlined">touch_app</span>
                    Tự chọn phí
                </button>

                <button onclick="confirmCheckoutFree()" class="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold text-xs uppercase hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2">
                    Không tính thêm (Xí xóa)
                </button>
            </div>

            <button onclick="closeSmartCheckout()" class="w-full mt-4 text-center text-xs font-bold text-gray-400 hover:text-gray-600 py-2">
                Quay lại
            </button>
        </div>
    </div>
</div>
    <div id="modal-move-bed" class="hidden fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
    <div class="bg-[#F2F4F7] w-full max-w-[380px] rounded-[32px] shadow-2xl overflow-hidden flex flex-col relative border border-white/50">

        <div class="bg-[#f59e0b] px-6 py-5 flex justify-between items-center relative overflow-hidden">
            <div class="absolute -right-6 -top-6 text-white opacity-20">
                <span class="material-symbols-outlined text-[100px]">bed_time</span>
            </div>
            <div class="relative z-10">
                <h3 class="text-white text-xl font-black uppercase tracking-wide">Chuyển Bed</h3>
                <p class="text-amber-50 font-bold text-xs mt-1" id="move-bed-subtitle">Chọn vị trí mới</p>
            </div>
            <button onclick="document.getElementById('modal-move-bed').classList.add('hidden')"
                class="relative z-10 w-9 h-9 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/30 transition-all">
                <span class="material-symbols-outlined text-xl">close</span>
            </button>
        </div>

        <div class="p-5 overflow-y-auto max-h-[60vh]">
            <div id="move-bed-grid" class="grid grid-cols-2 gap-3">
                </div>
        </div>

        <div class="p-4 bg-white text-center border-t border-gray-200">
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Hệ thống sẽ lưu lại lịch sử chuyển</p>
        </div>
    </div>
</div>

<div id="modal-extend-time" class="hidden fixed inset-0 z-[200000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fade-in">
    <div class="bg-white w-full max-w-[520px] rounded-[36px] shadow-2xl overflow-hidden flex flex-col relative">

        <div class="bg-[#006241] px-8 pt-8 pb-7 flex justify-between items-center">
            <div>
                <p class="text-[11px] text-green-200 uppercase tracking-[0.25em] font-bold mb-2">Gia hạn thời gian</p>
                <h3 class="text-white font-black text-2xl leading-tight" id="extend-modal-title">Khách hàng</h3>
            </div>
            <div class="text-right bg-white/10 rounded-2xl px-5 py-3">
                <p class="text-[10px] text-green-200 uppercase tracking-widest mb-1">Hết giờ lúc</p>
                <p class="text-white font-black text-3xl tracking-tight" id="extend-current-end">--:--</p>
            </div>
        </div>

        <div class="px-8 pt-6 pb-2 bg-[#F9FAF7]">
            <div class="bg-gray-100 p-1.5 rounded-[18px] flex">
                <button onclick="switchExtendMode('duration')" id="extend-tab-duration"
                    class="flex-1 py-3 rounded-[14px] text-sm font-black uppercase tracking-wider bg-white text-[#006241] shadow-sm transition-all">
                    Thêm Tiếng
                </button>
                <button onclick="switchExtendMode('endtime')" id="extend-tab-endtime"
                    class="flex-1 py-3 rounded-[14px] text-sm font-black uppercase tracking-wider text-gray-400 transition-all">
                    Chọn Giờ Về
                </button>
            </div>
        </div>

        <div class="px-8 pb-6 pt-4 bg-[#F9FAF7]">

            <div id="extend-mode-duration">
                <div class="flex gap-3">
                    <button onclick="selectExtendDuration(1)" id="btn-extend-1h"
                        class="extend-btn flex-1 h-20 rounded-[32px] border-2 border-gray-200 bg-white flex flex-col items-center justify-center transition-all active:scale-95">
                        <span class="text-3xl font-black text-[#006241]">+1H</span>
                        <span class="text-xs text-gray-400 font-bold mt-1">1 giờ</span>
                    </button>
                    <button onclick="selectExtendDuration(2)" id="btn-extend-2h"
                        class="extend-btn flex-1 h-20 rounded-[32px] border-2 border-gray-200 bg-white flex flex-col items-center justify-center transition-all active:scale-95">
                        <span class="text-3xl font-black text-[#006241]">+2H</span>
                        <span class="text-xs text-gray-400 font-bold mt-1">2 giờ</span>
                    </button>
                    <button onclick="selectExtendDuration(3)" id="btn-extend-3h"
                        class="extend-btn flex-1 h-20 rounded-[32px] border-2 border-gray-200 bg-white flex flex-col items-center justify-center transition-all active:scale-95">
                        <span class="text-3xl font-black text-[#006241]">+3H</span>
                        <span class="text-xs text-gray-400 font-bold mt-1">3 giờ</span>
                    </button>
                </div>
            </div>

            <div id="extend-mode-endtime" class="hidden">
                <div class="flex items-center gap-4">
                    <div class="relative flex-1">
                        <input type="tel" id="extend-custom-hour" maxlength="2" placeholder="--"
                            oninput="formatExtendTimeInput(this); calcExtendFromTime()"
                            class="w-full h-24 bg-white border-2 border-gray-200 rounded-[32px] text-5xl font-black text-[#006241] text-center focus:border-[#006241] outline-none shadow-sm transition-all placeholder:text-gray-200">
                        <span class="absolute top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">Giờ</span>
                    </div>
                    <span class="text-5xl font-black text-gray-300 pb-2">:</span>
                    <div class="relative flex-1">
                        <input type="tel" id="extend-custom-minute" maxlength="2" placeholder="--"
                            oninput="formatExtendTimeInput(this); calcExtendFromTime()"
                            class="w-full h-24 bg-white border-2 border-gray-200 rounded-[32px] text-5xl font-black text-[#006241] text-center focus:border-[#006241] outline-none shadow-sm transition-all placeholder:text-gray-200">
                        <span class="absolute top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">Phút</span>
                    </div>
                </div>
                <p class="text-center text-xs font-bold text-gray-400 mt-3 uppercase tracking-widest" id="extend-time-hint">Nhập giờ khách muốn về</p>
            </div>

            <div id="extend-preview-box" class="hidden bg-[#006241] rounded-[32px] p-5 mt-5 text-center">
                <p class="text-[11px] text-green-200 uppercase tracking-widest font-bold mb-1">Giờ ra mới</p>
                <p class="text-5xl font-black text-white tracking-tight" id="extend-new-end">--:--</p>
            </div>
        </div>

        <div class="px-8 pb-8 bg-white flex gap-4 pt-5 border-t border-gray-100">
            <button onclick="skipExtendAndOrder()"
                class="flex-1 h-16 rounded-[22px] border-2 border-gray-200 text-gray-500 font-black text-sm uppercase tracking-wider transition-all active:scale-95 hover:bg-gray-50">
                Bỏ qua
            </button>
            <button onclick="confirmExtendTime()" id="btn-confirm-extend"
                class="flex-[2] h-16 rounded-[22px] bg-[#006241] text-white font-black text-sm uppercase tracking-wider transition-all active:scale-95 opacity-40 cursor-not-allowed" disabled>
                Xác nhận gia hạn
            </button>
        </div>
    </div>
</div>

<div id="modal-bed-closing" class="hidden fixed inset-0 z-[200000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6 animate-fade-in">
    <div class="bg-white w-full max-w-[420px] rounded-[36px] shadow-2xl overflow-hidden">
        <div class="bg-[#006241] px-8 pt-8 pb-7">
            <p class="text-[11px] text-green-200 uppercase tracking-[0.25em] font-bold mb-2">Cài đặt</p>
            <h3 class="text-white font-black text-2xl">Giờ đóng cửa Bed</h3>
            <p class="text-green-200 text-xs mt-2">Hệ thống tự động dừng tất cả lịch lúc 21:30 (giờ cứng). Giờ này chỉ hiển thị thông báo cho khách.</p>
        </div>
        <div class="px-8 py-7 bg-[#F9FAF7]">
            <p class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Chọn giờ đóng cửa Bed</p>
            <div class="flex items-center gap-4 justify-center">
                <div class="relative">
                    <input type="tel" id="closing-hour" maxlength="2" placeholder="20"
                        class="w-32 h-24 bg-white border-2 border-gray-200 rounded-[32px] text-5xl font-black text-[#006241] text-center focus:border-[#006241] outline-none shadow-sm transition-all placeholder:text-gray-200">
                    <span class="absolute top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">Giờ</span>
                </div>
                <span class="text-5xl font-black text-gray-300">:</span>
                <div class="relative">
                    <input type="tel" id="closing-minute" maxlength="2" placeholder="50"
                        class="w-32 h-24 bg-white border-2 border-gray-200 rounded-[32px] text-5xl font-black text-[#006241] text-center focus:border-[#006241] outline-none shadow-sm transition-all placeholder:text-gray-200">
                    <span class="absolute top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">Phút</span>
                </div>
            </div>
            <p class="text-center text-xs font-bold text-[#006241] mt-4">Giờ cứng tự động tắt luôn là 21:30</p>
        </div>
        <div class="px-8 pb-8 bg-white flex gap-4 pt-5 border-t border-gray-100">
            <button onclick="document.getElementById('modal-bed-closing').classList.add('hidden')"
                class="flex-1 h-14 rounded-[20px] border-2 border-gray-200 text-gray-500 font-black text-sm uppercase tracking-wider active:scale-95">
                Hủy
            </button>
            <button onclick="saveBedClosingTime()"
                class="flex-[2] h-14 rounded-[20px] bg-[#006241] text-white font-black text-sm uppercase tracking-wider active:scale-95">
                Lưu Giờ Đóng
            </button>
        </div>
    </div>
</div>

<div id="modal-bed-autostop" class="hidden fixed inset-0 z-[300000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 animate-fade-in">
    <div class="bg-white w-full max-w-[440px] rounded-[36px] shadow-2xl overflow-hidden">
        <div class="bg-red-600 px-8 pt-8 pb-7 text-center">
            <p class="text-white font-black text-3xl mb-2">HẾT GIỜ PHỤC VỤ</p>
            <p class="text-red-200 text-sm font-bold">Tất cả lịch Bed đã được tự động kết thúc</p>
        </div>
        <div class="px-8 py-7 text-center bg-[#F9FAF7]">
            <p class="text-6xl font-black text-red-600 tracking-tight" id="autostop-time-display">21:30</p>
            <p class="text-gray-500 font-bold text-sm mt-3">Hệ thống đã tắt <span id="autostop-count" class="text-red-600 font-black">0</span> lịch đang hoạt động</p>
        </div>
        <div class="px-8 pb-8 bg-white pt-5 border-t border-gray-100">
            <button onclick="document.getElementById('modal-bed-autostop').classList.add('hidden')"
                class="w-full h-14 rounded-[20px] bg-red-600 text-white font-black text-sm uppercase tracking-wider active:scale-95">
                Đã hiểu
            </button>
        </div>
    </div>
</div>

    <script>

