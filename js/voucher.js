function loadDiscountCodes() {
    fstore.collection('rewards').onSnapshot(function(snapshot) {
        _discountCache = {};
        snapshot.forEach(function(doc) { _discountCache[doc.id] = doc.data(); });
    }, function(err) { console.error('loadDiscountCodes error:', err); });
}
loadDiscountCodes();

function applyDiscountCode() {
    var input = document.getElementById('discount-code-input');
    var statusEl = document.getElementById('discount-status');
    if (!input || !statusEl) return;

    var code = input.value.trim().toUpperCase();
    if (!code) return;

    var found = null;
    var foundKey = null;
    Object.keys(_discountCache).forEach(function(k) {
        if (_discountCache[k].code && _discountCache[k].code.toUpperCase() === code) {
            found = _discountCache[k];
            foundKey = k;
        }
    });

    if (!found) {
        statusEl.innerText = '✗ Mã không tồn tại';
        statusEl.style.color = '#ef4444';
        return;
    }
    if (found.active === false) {
        statusEl.innerText = '✗ Mã đã hết hạn';
        statusEl.style.color = '#ef4444';
        return;
    }
    if (found.usageLimit > 0 && (found.usedCount || 0) >= found.usageLimit) {
        statusEl.innerText = '✗ Mã đã dùng hết lượt';
        statusEl.style.color = '#ef4444';
        return;
    }

    if (_appliedDiscountId) {
        statusEl.innerText = '✗ Đã có mã giảm giá trong bill';
        statusEl.style.color = '#ef4444';
        return;
    }

    var discountAmt = 0;
    var targetName = '';

    if (found.type === 'item') {
        var target = (found.targetItem || '').toLowerCase().trim();
        var matchItem = null;
        cart.forEach(function(ci) {
            if (ci._vKey || ci._discountId) return;
            if (ci.name.toLowerCase().indexOf(target) !== -1) {
                matchItem = ci;
            }
        });
        if (!matchItem) {
            statusEl.innerText = '✗ Giỏ hàng không có "' + (found.targetItem || '') + '"';
            statusEl.style.color = '#ef4444';
            return;
        }
        discountAmt = found.value;
        targetName = matchItem.name;

    } else if (found.type === 'percent') {
        discountAmt = Math.round(currentTotal * found.value / 100);
        targetName = 'Toàn đơn';
    } else {
        discountAmt = found.value;
        targetName = 'Toàn đơn';
    }

    if (discountAmt <= 0) {
        statusEl.innerText = '✗ Mã không áp dụng được';
        statusEl.style.color = '#ef4444';
        return;
    }

    var discountItem = {
        name: found.label || ('Giảm ' + code),
        size: '',
        price: -discountAmt,
        qty: 1,
        _discountId: foundKey,
        _discountCode: code,
        _discountTarget: targetName
    };
    cart.push(discountItem);
    _appliedDiscountId = foundKey;

    renderCart();

    statusEl.innerText = '✓ Áp dụng: −' + discountAmt.toLocaleString() + 'đ';
    statusEl.style.color = '#006241';
    input.value = '';

    var newCount = (found.usedCount || 0) + 1;
    fstore.collection('rewards').doc(foundKey).update({ usedCount: newCount });
}

function resetDiscountState(noFirebase) {
    if (!noFirebase && _appliedDiscountId && _discountCache[_appliedDiscountId]) {
        var cur = _discountCache[_appliedDiscountId].usedCount || 0;
        if (cur > 0) fstore.collection('rewards').doc(_appliedDiscountId).update({ usedCount: cur - 1 });
    }
    _appliedDiscountId = null;
    var statusEl = document.getElementById('discount-status');
    if (statusEl) { statusEl.innerText = ''; }
    var input = document.getElementById('discount-code-input');
    if (input) input.value = '';
}

var _giftVoucherKey = null;
var _giftVoucherPhone = null;
var _giftOrderDiscount = null;

function scanGiftVouchers(phone) {
    var panel = document.getElementById('gift-panel');
    var list  = document.getElementById('gift-panel-list');
    if (!panel || !list || !phone || phone.length < 9) {
        if (panel) panel.classList.add('hidden');
        return;
    }
    db.ref('customers/' + phone + '/myGifts').once('value', function(snap) {
        var now = Date.now();
        var EXPIRE = 30 * 24 * 60 * 60 * 1000;
        var gifts = [];
        snap.forEach(function(child) {
            var g = child.val();
            g._key = child.key;
            if (g.used) return;
            if (g.redeemedAt) {
                var age = now - new Date(g.redeemedAt).getTime();
                if (age > EXPIRE) {
                    db.ref('customers/' + phone + '/myGifts/' + g._key).update({ used: true, usedAt: 'expired' });
                    return;
                }
                var daysLeft = Math.max(0, Math.floor((EXPIRE - age) / 86400000));
                g._daysLeft = daysLeft;
            }
            gifts.push(g);
        });
        if (gifts.length === 0) { panel.classList.add('hidden'); return; }
        panel.classList.remove('hidden');
        list.innerHTML = '';
        gifts.forEach(function(g) {
            var daysColor = (g._daysLeft !== undefined && g._daysLeft <= 3) ? '#ef4444' : '#b45309';
            var daysText  = g._daysLeft !== undefined ? ('Còn ' + g._daysLeft + ' ngày') : '';
            var safeName = (g.name || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
            var safeCode = (g.code || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
            var row = document.createElement('div');
            row.className = 'bg-white rounded-xl p-2 border border-amber-100 flex items-center justify-between gap-2';
            row.innerHTML =
                '<div class="flex-1 min-w-0">' +
                    '<p class="font-black text-[11px] text-gray-800 truncate">' + safeName + '</p>' +
                    '<p class="font-mono text-[9px] text-green-700 font-bold">' + safeCode + '</p>' +
                    (daysText ? '<p class="text-[9px] font-bold" style="color:' + daysColor + '">' + daysText + '</p>' : '') +
                '</div>' +
                '<button class="bg-green-700 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase active:scale-95">+ Bill</button>';
            row.querySelector('button').addEventListener('click', function() {
                giftVoucherAddToCart(phone, g._key, g.name, g.code, g.rewardKey || null);
                this.innerText = '✓ Đã thêm';
                this.disabled = true;
                this.className = 'bg-green-100 text-green-700 text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase';
                var allBtns = list.querySelectorAll('button');
                allBtns.forEach(function(btn) {
                    if (!btn.disabled) {
                        btn.disabled = true;
                        btn.className = 'bg-gray-100 text-gray-400 text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase';
                    }
                });
            });
            list.appendChild(row);
        });
    });
}

function giftVoucherResetOld() {
    if (!_giftVoucherKey) return;
    for (var i = cart.length - 1; i >= 0; i--) {
        var ci = cart[i];
        if (ci._vKey === _giftVoucherKey) {
            if (ci._giftType === 'item' || ci._giftType === 'item_free') {
                // Tim item goc ke truoc hoac ke sau de gop lai
                var prevItem = (i > 0 && cart[i-1].name === (ci._originalName||ci.name) && !cart[i-1]._vKey) ? cart[i-1] : null;
                var nextItem = (i < cart.length-1 && cart[i+1].name === (ci._originalName||ci.name) && !cart[i+1]._vKey) ? cart[i+1] : null;
                if (prevItem) {
                    prevItem.qty += 1; cart.splice(i, 1);
                } else if (nextItem) {
                    nextItem.qty += 1; cart.splice(i, 1);
                } else {
                    // Khong co item goc de gop -> khoi phuc lai item nay
                    ci.price = ci._originalPrice;
                    ci.name  = ci._originalName || ci.name;
                    delete ci._vKey; delete ci._originalPrice; delete ci._originalName;
                    delete ci._giftType; delete ci._giftLabel;
                }
            } else {
                cart.splice(i, 1);
            }
            break;
        }
    }
    _giftOrderDiscount = null;
}

function giftVoucherAddToCart(phone, key, name, code, rewardKey) {
    giftVoucherResetOld();
    _giftVoucherKey   = key;
    _giftVoucherPhone = phone;

    function applyReward(r) {
        if (!r) { renderCart(); return; }

        if (r.type === 'item') {
            var target = (r.targetItem || '').toLowerCase().trim();
            var targetIdx = -1;
            cart.forEach(function(ci, idx) {
                if (targetIdx < 0 && !ci._vKey && !ci._discountId)
                    if (ci.name.toLowerCase().indexOf(target) !== -1) targetIdx = idx;
            });
            if (targetIdx < 0) {
                _giftVoucherKey = null; _giftVoucherPhone = null; renderCart();
                if (typeof showAppModal === 'function')
                    showAppModal('Lưu ý!', 'Quà áp dụng cho món <b>' + (r.targetItem||'') + '</b> — hãy thêm món đó trước!', '⚠️');
                return;
            }
            var item = cart[targetIdx];
            var origPrice = item.price, origName = item.name, origSize = item.size;
            var newPrice = Math.max(0, origPrice - (r.value || 0));
            if (item.qty > 1) {
                // Tach 1 cai giam ra, giu nguyen phan con lai
                item.qty -= 1;
                cart.splice(targetIdx + 1, 0, {
                    name: origName, size: origSize, price: newPrice, qty: 1,
                    _vKey: key, _giftType: 'item', _giftLabel: code,
                    _originalPrice: origPrice, _originalName: origName
                });
            } else {
                // Chi co 1 mon, ap giam truc tiep
                item.price = newPrice;
                item._vKey = key;
                item._giftType = 'item';
                item._giftLabel = code;
                item._originalPrice = origPrice;
                item._originalName = origName;
            }
            renderCart();

        } else if (r.type === 'item_free' || r.type === 'item_upsize') {
            if (cart.length === 0) {
                if (typeof showAppModal === 'function')
                    showAppModal('Giỏ hàng trống!', 'Hãy thêm món vào bill trước khi áp voucher này!', '⚠️');
                _giftVoucherKey = null; _giftVoucherPhone = null;
                return;
            }
            openPickCartModal(r, key, code, name);

        } else {
            _giftOrderDiscount = {
                type:  r.type,
                value: r.value || 0,
                label: (r.label || name) + (r.type === 'percent' ? ' – ' + r.value + '%' : ''),
                code:  code,
                amt:   0
            };
            renderCart();
        }
    }

    if (rewardKey) {
        if (_discountCache[rewardKey]) { applyReward(_discountCache[rewardKey]); }
        else { fstore.collection('rewards').doc(rewardKey).get().then(function(doc) {
            var r = doc.exists ? doc.data() : null; if (r) _discountCache[rewardKey] = r; applyReward(r);
        }); }
    } else {
        var codeUp = (code || '').toUpperCase().trim(), found = null;
        Object.keys(_discountCache).forEach(function(k) {
            if (!found && _discountCache[k].code && _discountCache[k].code.toUpperCase().trim() === codeUp) found = _discountCache[k];
        });
        if (found) { applyReward(found); }
        else { fstore.collection('rewards').where('code', '==', codeUp).limit(1).get().then(function(snap) {
            var r2 = null;
            if (!snap.empty) r2 = snap.docs[0].data();
            applyReward(r2);
        }); }
    }
}

function openPickCartModal(reward, vKey, vCode, vName) {
    var modal = document.getElementById('modal-pick-cart-item');
    var listEl = document.getElementById('pick-cart-list');
    var titleEl = document.getElementById('pick-cart-title');
    var subtitleEl = document.getElementById('pick-cart-subtitle');
    if (!modal || !listEl) return;

    var isUpsize = reward.type === 'item_upsize';
    titleEl.innerText = isUpsize ? 'Chọn món để up size M→L' : 'Chọn món được miễn phí';

    var hints = [];
    if (reward.conditionCategory) hints.push('Danh mục: ' + reward.conditionCategory);
    if (reward.conditionMaxPrice) hints.push('Giá ≤ ' + Number(reward.conditionMaxPrice).toLocaleString() + 'đ');
    if (reward.conditionMinPrice) hints.push('Giá ≥ ' + Number(reward.conditionMinPrice).toLocaleString() + 'đ');
    subtitleEl.innerText = hints.length ? 'Điều kiện: ' + hints.join(' · ') : 'Tap vào món muốn áp voucher';

    listEl.innerHTML = '';

    cart.forEach(function(ci, idx) {
        if (ci._vKey || ci._discountId) return;

        var eligible = true;
        if (reward.conditionCategory) {
            var menuItem = (window._menuData || []).find(function(m) { return m.name === ci.name; });
            if (!menuItem || (menuItem.type || '').toLowerCase() !== reward.conditionCategory.toLowerCase()) eligible = false;
        }
        if (reward.conditionMaxPrice && ci.price > reward.conditionMaxPrice) eligible = false;
        if (reward.conditionMinPrice && ci.price < reward.conditionMinPrice) eligible = false;
        if (reward.conditionMaxPrice === 0 && !reward.conditionCategory && !reward.conditionMinPrice) eligible = true;

        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-radius:24px;border:2px solid ' + (eligible ? '#e5e7eb' : '#f3f4f6') + ';background:' + (eligible ? 'white' : '#fafafa') + ';opacity:' + (eligible ? '1' : '0.45') + ';transition:all 0.15s;';

        var infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'flex:1;min-width:0;';
        infoDiv.innerHTML = '<p style="font-weight:800;font-size:1rem;color:#111827;margin:0 0 3px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + ci.name + (ci.size ? ' <span style="font-size:0.75rem;color:#9ca3af;">(' + ci.size + ')</span>' : '') + '</p>'
            + '<p style="font-size:0.85rem;font-weight:700;color:#006241;margin:0;">' + ci.price.toLocaleString() + 'đ'
            + (isUpsize ? ' <span style="color:#9ca3af;font-size:0.75rem;">→ giữ giá này + size L</span>' : ' <span style="color:#ef4444;font-size:0.75rem;">→ miễn phí</span>') + '</p>';

        row.appendChild(infoDiv);

        if (eligible) {
            var btn = document.createElement('button');
            btn.style.cssText = 'background:#006241;color:white;border:none;border-radius:22px;padding:10px 18px;font-size:0.85rem;font-weight:900;cursor:pointer;flex-shrink:0;margin-left:12px;';
            btn.innerText = isUpsize ? 'Up size' : 'Miễn phí';
            btn.addEventListener('click', function() {
                applyPickedCartItem(idx, reward, vKey, vCode, vName);
                closePickCartModal();
            });
            row.appendChild(btn);
            row.addEventListener('mouseenter', function() { if(eligible) this.style.borderColor='#006241'; this.style.boxShadow='0 4px 16px rgba(0,98,65,0.12)'; });
            row.addEventListener('mouseleave', function() { this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'; });
        } else {
            var badge = document.createElement('span');
            badge.style.cssText = 'font-size:0.7rem;font-weight:800;color:#9ca3af;margin-left:12px;flex-shrink:0;';
            badge.innerText = 'Không hợp lệ';
            row.appendChild(badge);
        }
        listEl.appendChild(row);
    });

    if (listEl.children.length === 0) {
        listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#9ca3af;"><div style="font-size:2.5rem;margin-bottom:12px;">🛒</div><p style="font-weight:700;">Không có món nào trong bill!</p></div>';
    }

    modal.style.display = 'flex';
}

function closePickCartModal() {
    var modal = document.getElementById('modal-pick-cart-item');
    if (modal) modal.style.display = 'none';
}

function applyPickedCartItem(idx, reward, vKey, vCode, vName) {
    var item = cart[idx];
    if (!item) return;
    var origPrice = item.price;
    var origName = item.name;
    var origSize = item.size;

    if (reward.type === 'item_free') {
        var newPrice = 0;
        if (item.qty > 1) {
            item.qty -= 1;
            cart.splice(idx + 1, 0, {
                name: origName, size: origSize, price: newPrice, qty: 1,
                _vKey: vKey, _giftType: 'item_free', _giftLabel: vCode,
                _originalPrice: origPrice, _originalName: origName
            });
        } else {
            item.price = newPrice; item._vKey = vKey; item._giftType = 'item_free';
            item._giftLabel = vCode; item._originalPrice = origPrice; item._originalName = origName;
        }
    } else if (reward.type === 'item_upsize') {
        var surcharge = reward.value || 0;
        var menuItem = (window._menuData || []).find(function(m) { return m.name === item.name; });
        var upsizeNote = 'Size L (Voucher)';
        cart.splice(idx + 1, 0, {
            name: origName + ' ↑L',
            size: 'L',
            price: surcharge,
            qty: 1,
            _vKey: vKey,
            _giftType: 'item_upsize',
            _giftLabel: vCode,
            _originalName: origName,
            _originalPrice: surcharge,
            _upsizeNote: true
        });
    }
    renderCart();
}

function giftVoucherMarkUsedAndReset(resetOnly) {
    if (!resetOnly && _giftVoucherKey && _giftVoucherPhone) {
        db.ref('customers/' + _giftVoucherPhone + '/myGifts/' + _giftVoucherKey)
          .update({ used: true, usedAt: new Date().toISOString() });
    }
    giftVoucherResetOld();
    _giftVoucherKey = null; _giftVoucherPhone = null; _giftOrderDiscount = null;
    var panel = document.getElementById('gift-panel');
    if (panel) panel.classList.add('hidden');
    var list = document.getElementById('gift-panel-list');
    if (list) list.innerHTML = '';
}

var _dfType = 'item';
var _dfActive = true;

