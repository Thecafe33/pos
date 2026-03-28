<script>
// =============================================
// MENU EDITOR
// =============================================
var _meEditingKey = null; // Firebase key đang sửa (null = thêm mới)

var ME_COLORS = [
    '#006241','#1a7a4a',  // 2 màu xanh thương hiệu
    '#3B82F6','#8B5CF6','#EC4899','#F97316','#EAB308','#14B8A6','#64748B','#EF4444'
];

function menuEditorLoad() {
    var listEl = document.getElementById('menu-editor-list');
    var countEl = document.getElementById('menu-editor-count');
    if (!listEl) return;
    listEl.innerHTML = '<div style="padding:24px;text-align:center;opacity:0.4;"><p style="font-size:0.72rem;font-weight:700;color:#9ca3af;">Đang tải...</p></div>';

    db.ref('menu').once('value', function(snap) {
        var data = snap.val() || {};
        var items = [];
        if (Array.isArray(data)) {
            data.forEach(function(v,i){ if(v){ items.push({key:'idx_'+i, val:v}); } });
        } else {
            Object.keys(data).forEach(function(k){ items.push({key:k, val:data[k]}); });
        }
        if (countEl) countEl.innerText = items.length;
        if (items.length === 0) {
            listEl.innerHTML = '<div style="padding:24px;text-align:center;opacity:0.4;"><p style="font-size:0.72rem;font-weight:700;color:#9ca3af;">Chưa có món nào</p></div>';
            return;
        }
        listEl.innerHTML = '';
        items.forEach(function(item) {
            var m = item.val;
            var color = m.color || '#006241';
            var priceStr = m.priceM > 0 ? (m.priceM/1000)+'k' : (m.priceL > 0 ? (m.priceL/1000)+'k' : 'Nhập tay');
            var row = document.createElement('div');
            row.setAttribute('data-key', item.key);
            row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:9px 10px;border-radius:12px;cursor:pointer;margin-bottom:3px;border:1.5px solid transparent;transition:all 0.15s;';
            row.innerHTML = '<div style="width:10px;height:10px;border-radius:50%;background:'+color+';flex-shrink:0;"></div>'
                + '<div style="flex:1;min-width:0;">'
                + '<p style="font-size:0.8rem;font-weight:800;color:#111827;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+m.name+'</p>'
                + '<p style="font-size:0.65rem;color:#9ca3af;margin:0;font-weight:600;">'+m.type+' · '+priceStr+'</p>'
                + '</div>';
            row.onclick = function() {
                document.querySelectorAll('#menu-editor-list > div[data-key]').forEach(function(r){
                    r.style.background=''; r.style.borderColor='transparent';
                });
                row.style.background='#F0FDF4'; row.style.borderColor='#bbf7d0';
                menuEditorEditItem(item.key, m);
            };
            listEl.appendChild(row);
        });
        // Init form với trạng thái thêm mới
        menuEditorNewItem();
    });
    menuEditorInitColorSwatches();
}

function menuEditorInitColorSwatches() {
    var el = document.getElementById('me-color-swatches');
    if (!el) return;
    el.innerHTML = '';
    ME_COLORS.forEach(function(c) {
        var btn = document.createElement('button');
        btn.style.cssText = 'width:38px;height:38px;border-radius:12px;background:'+c+';border:3px solid transparent;cursor:pointer;transition:all 0.15s;flex-shrink:0;';
        btn.onclick = function(e){ e.preventDefault(); menuEditorSetColor(c); };
        btn.setAttribute('data-color', c);
        el.appendChild(btn);
    });
}

function menuEditorSetColor(hex) {
    document.getElementById('me-color-value').value = hex;
    document.querySelectorAll('#me-color-swatches button').forEach(function(b){
        var active = b.getAttribute('data-color') === hex;
        b.style.border = active ? '3px solid #111827' : '3px solid transparent';
        b.style.transform = active ? 'scale(1.15)' : 'scale(1)';
    });
    // Reset custom label border
    var lbl = document.getElementById('me-custom-color-label');
    if (lbl) lbl.style.borderColor = 'transparent';
}

function menuEditorSetCustomColor(hex) {
    document.getElementById('me-color-value').value = hex;
    document.getElementById('me-color-custom').value = hex;
    var preview = document.getElementById('me-custom-color-preview');
    if (preview) preview.style.background = hex;
    // Deactivate all swatches
    document.querySelectorAll('#me-color-swatches button').forEach(function(b){
        b.style.border = '3px solid transparent';
        b.style.transform = 'scale(1)';
    });
    // Highlight custom label
    var lbl = document.getElementById('me-custom-color-label');
    if (lbl) lbl.style.borderColor = '#111827';
}

function menuEditorShowTypeDropdown() {
    var el = document.getElementById('me-type-dropdown');
    if (!el) return;
    var cats = [];
    (window._menuData || menu || []).forEach(function(m){ if(m.type && cats.indexOf(m.type)<0) cats.push(m.type); });
    if (cats.length === 0) { el.style.display='none'; return; }
    el.innerHTML = '';
    cats.forEach(function(c){
        var d = document.createElement('div');
        d.style.cssText = 'padding:10px 14px;cursor:pointer;font-size:0.85rem;font-weight:700;color:#374151;transition:background 0.1s;';
        d.textContent = c;
        d.onmouseenter = function(){ d.style.background='#F0FDF4'; };
        d.onmouseleave = function(){ d.style.background=''; };
        d.onmousedown = function(e){ e.preventDefault(); document.getElementById('me-type').value=c; menuEditorHideTypeDropdown(); };
        el.appendChild(d);
    });
    el.style.display = 'block';
}

function menuEditorHideTypeDropdown() {
    var el = document.getElementById('me-type-dropdown');
    if (el) el.style.display = 'none';
}

function menuEditorNewItem() {
    _meEditingKey = null;
    document.getElementById('menu-editor-form-title').textContent = 'Thêm món mới';
    var delBtn = document.getElementById('menu-editor-delete-btn');
    if (delBtn) delBtn.style.display = 'none';
    document.getElementById('me-name').value = '';
    document.getElementById('me-type').value = '';
    document.getElementById('me-price-m').value = '';
    document.getElementById('me-price-l').value = '';
    menuEditorSetColor('#006241');
    document.querySelectorAll('#menu-editor-list > div[data-key]').forEach(function(r){
        r.style.background=''; r.style.borderColor='transparent';
    });
}

function menuEditorEditItem(key, m) {
    _meEditingKey = key;
    document.getElementById('menu-editor-form-title').textContent = 'Sửa: '+m.name;
    var delBtn = document.getElementById('menu-editor-delete-btn');
    if (delBtn) { delBtn.style.display='flex'; }
    document.getElementById('me-name').value = m.name || '';
    document.getElementById('me-type').value = m.type || '';
    document.getElementById('me-price-m').value = m.priceM > 0 ? m.priceM : '';
    document.getElementById('me-price-l').value = m.priceL > 0 ? m.priceL : '';
    menuEditorSetColor(m.color || '#006241');
    // Nếu màu không có trong preset → hiện ở custom
    if (m.color && !ME_COLORS.includes(m.color)) {
        menuEditorSetCustomColor(m.color);
    }
}

function menuEditorSave() {
    var name = (document.getElementById('me-name').value || '').trim();
    var type = (document.getElementById('me-type').value || '').trim();
    var pM = parseInt(document.getElementById('me-price-m').value) || 0;
    var pL = parseInt(document.getElementById('me-price-l').value) || 0;
    var color = document.getElementById('me-color-value').value || '#006241';

    if (!name) { alert('Vui lòng nhập tên món!'); return; }
    if (!type) { alert('Vui lòng nhập phân loại!'); return; }

    var itemData = { name: name, type: type, priceM: pM, priceL: pL, color: color };

    if (_meEditingKey && !_meEditingKey.startsWith('idx_')) {
        // Sửa item có Firebase key thật
        db.ref('menu/' + _meEditingKey).update(itemData, function(err){
            if (err) { alert('Lỗi lưu: '+err.message); return; }
            menuEditorLoad();
        });
    } else if (_meEditingKey && _meEditingKey.startsWith('idx_')) {
        // Menu dạng array — cần đọc lại và viết toàn bộ
        var idx = parseInt(_meEditingKey.replace('idx_',''));
        db.ref('menu').once('value', function(snap){
            var arr = snap.val() || [];
            if (!Array.isArray(arr)) arr = Object.values(arr);
            arr[idx] = itemData;
            db.ref('menu').set(arr, function(err){
                if (err) { alert('Lỗi lưu: '+err.message); return; }
                menuEditorLoad();
            });
        });
    } else {
        // Thêm mới
        db.ref('menu').push(itemData, function(err){
            if (err) { alert('Lỗi lưu: '+err.message); return; }
            menuEditorLoad();
        });
    }
}

function menuEditorDeleteItem() {
    if (!_meEditingKey) return;
    var name = document.getElementById('me-name').value || 'món này';
    if (!confirm('Xóa "'+name+'" khỏi menu?')) return;

    if (_meEditingKey.startsWith('idx_')) {
        var idx = parseInt(_meEditingKey.replace('idx_',''));
        db.ref('menu').once('value', function(snap){
            var arr = snap.val() || [];
            if (!Array.isArray(arr)) arr = Object.values(arr);
            arr.splice(idx, 1);
            db.ref('menu').set(arr, function(err){
                if (err) { alert('Lỗi xóa: '+err.message); return; }
                menuEditorLoad();
            });
        });
    } else {
        db.ref('menu/' + _meEditingKey).remove(function(err){
            if (err) { alert('Lỗi xóa: '+err.message); return; }
            menuEditorLoad();
        });
    }
}

// =============================================
// PRICE KEYPAD (cho món không có giá)
// =============================================
var _keypadItemName = '';
var _keypadValue = '0';

function openPriceKeypad(name) {
    _keypadItemName = name;
    _keypadValue = '0';
    document.getElementById('keypad-item-name').textContent = name;
    document.getElementById('keypad-display').textContent = '0';
    var modal = document.getElementById('price-keypad-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closePriceKeypad() {
    var modal = document.getElementById('price-keypad-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function keypadPress(digit) {
    if (_keypadValue === '0') {
        _keypadValue = digit;
    } else {
        if (_keypadValue.length >= 9) return;
        _keypadValue += digit;
    }
    var num = parseInt(_keypadValue) || 0;
    document.getElementById('keypad-display').textContent = num.toLocaleString('vi-VN');
}

function keypadBackspace() {
    if (_keypadValue.length <= 1) { _keypadValue = '0'; }
    else { _keypadValue = _keypadValue.slice(0, -1); }
    var num = parseInt(_keypadValue) || 0;
    document.getElementById('keypad-display').textContent = num.toLocaleString('vi-VN');
}

function keypadConfirm() {
    var price = parseInt(_keypadValue.replace(/\./g,'')) || 0;
    if (price <= 0) { alert('Vui lòng nhập giá!'); return; }
    addToCart(_keypadItemName, 'M', price);
    closePriceKeypad();
}
</script>
