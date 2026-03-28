function renderCart() {
    const list = document.getElementById('cart-list');
    if (!list) return;

    currentTotal = 0;

    list.innerHTML = cart.map((i, idx) => {
        currentTotal += i.price * i.qty;
        const isGift     = !!i._vKey;
        const isDiscount = !!i._discountId;
        const isSpecial  = isGift || isDiscount;

        const isFee = (i.size === 'Phí');

        const sizeLabel = (!isSpecial && !isFee && i.size)
            ? `<span class="text-[10px] font-black text-white bg-[#006241] px-1.5 py-[1px] rounded ml-1 uppercase">${i.size.toUpperCase()}</span>`
            : (isFee ? `<span class="text-[10px] font-black text-white bg-red-500 px-1.5 py-[1px] rounded ml-1">Phí</span>` : '');

        let subLabel = '';
        if (isGift && i._giftType === 'item') {
            const origStr = i._originalPrice ? `<span class="line-through text-gray-300 mr-1">${i._originalPrice.toLocaleString()}đ</span>` : '';
            subLabel = `<p class="text-[9px] font-bold text-amber-600 mt-0.5">${origStr}Quà · ${i._giftLabel||i.size}</p>`;
        } else if (isGift && i._giftType === 'item_free') {
            const origStr = i._originalPrice ? `<span class="line-through text-gray-300 mr-1">${i._originalPrice.toLocaleString()}đ</span>` : '';
            subLabel = `<p class="text-[9px] font-bold text-green-600 mt-0.5">${origStr}Mien phi · ${i._giftLabel||''}</p>`;
        } else if (isGift && i._giftType === 'item_upsize') {
            subLabel = `<p class="text-[9px] font-bold text-yellow-600 mt-0.5">Up size M→L · ${i._giftLabel||''}</p>`;
        } else if (isGift) {
            subLabel = `<p class="text-[9px] font-bold text-amber-600 mt-0.5">Quà · ${i._giftLabel||i.size}</p>`;
        }
        else if (isDiscount) subLabel = `<p class="text-[9px] font-bold text-blue-500 mt-0.5">🏷 Mã: ${i._discountCode || ''} · ${i._discountTarget ? i._discountTarget : 'Toàn đơn'}</p>`;
        else if (isFee)      subLabel = `<p class="text-red-400 font-bold text-[10px] mt-0.5">${(i.price).toLocaleString()}đ</p>`;
        else                 subLabel = `<p class="text-gray-400 font-bold text-[10px] mt-0.5">${(i.price).toLocaleString()}đ / ly</p>`;

        const priceColor = isSpecial ? 'text-blue-600' : 'text-[#006241]';
        const priceText  = isSpecial
            ? `<span class="text-[10px] font-black text-blue-600">−${Math.abs(i.price).toLocaleString()}đ</span>`
            : '';

        const qtyBlock = isSpecial
            ? `<button onclick="removeCartItem(${idx})" class="w-7 h-7 flex items-center justify-center font-black text-red-400 text-base rounded-md hover:bg-red-50 active:scale-90 transition-all ml-1">✕</button>`
            : `<div class="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-100 flex-shrink-0">
                <button onclick="updateQty(${idx}, -1)" class="w-7 h-7 flex items-center justify-center font-black text-gray-400 text-xl rounded-md hover:bg-gray-100 active:scale-90 transition-all">−</button>
                <span class="font-black text-[#006241] text-sm w-5 text-center">${i.qty}</span>
                <button onclick="updateQty(${idx}, 1)" class="w-7 h-7 flex items-center justify-center font-black text-[#006241] text-xl rounded-md hover:bg-green-50 active:scale-90 transition-all">+</button>
               </div>`;

        const bgColor = isGift ? 'bg-amber-50 border-amber-100' : isDiscount ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-white';

        return `<div class="${bgColor} p-2.5 rounded-xl flex justify-between items-center shadow-sm border text-xs mb-1 gap-2">
            <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1">
                    <p class="font-black ${priceColor} capitalize-first text-sm leading-tight truncate max-w-[130px]">${i.name}</p>${sizeLabel}
                    ${priceText}
                </div>
                ${subLabel}
            </div>
            ${qtyBlock}
        </div>`;
    }).join('');

    if (_giftOrderDiscount) {
        var discountableSubtotal = 0;
        cart.forEach(function(ci) {
            if (ci.size !== 'Phí') discountableSubtotal += ci.price * ci.qty;
        });
        if (_giftOrderDiscount.type === 'percent') {
            _giftOrderDiscount.amt = Math.round(discountableSubtotal * _giftOrderDiscount.value / 100);
        } else {
            _giftOrderDiscount.amt = _giftOrderDiscount.value;
        }
    }
    var displayTotal = currentTotal;
    if (_giftOrderDiscount && _giftOrderDiscount.amt > 0) displayTotal = Math.max(0, currentTotal - _giftOrderDiscount.amt);
    var discRow = document.getElementById('gift-order-discount-row');
    if (discRow) {
        if (_giftOrderDiscount && _giftOrderDiscount.amt > 0) {
            discRow.innerHTML = `<div class="flex justify-between items-center text-[11px] font-bold pb-1 mb-1 border-b border-dashed border-gray-200"><span class="text-gray-400 truncate max-w-[160px]">${_giftOrderDiscount.label}</span><span class="text-green-600 font-black">−${_giftOrderDiscount.amt.toLocaleString()}đ</span></div><div class="flex justify-between items-center text-[10px] text-gray-400 font-bold mb-1"><span>Giá gốc</span><span class="line-through">${currentTotal.toLocaleString()}đ</span></div>`;
            discRow.classList.remove('hidden');
        } else { discRow.innerHTML=''; discRow.classList.add('hidden'); }
    }
    if (_giftOrderDiscount && _giftOrderDiscount.amt > 0) currentTotal = displayTotal;
    const formattedTotal = displayTotal.toLocaleString() + 'đ';

    if(document.getElementById('total-price'))
        document.getElementById('total-price').innerText = formattedTotal;

    if(document.getElementById('mob-bar-total'))
        document.getElementById('mob-bar-total').innerText = formattedTotal;

    if(document.getElementById('pay-total-display-1'))
        document.getElementById('pay-total-display-1').innerText = formattedTotal;

    if(document.getElementById('pay-total-display-2'))
        document.getElementById('pay-total-display-2').innerText = formattedTotal;
syncToCustomerDisplay('cart');
    updateSuggestions();

    var payBtn = document.getElementById('sidebar-pay-btn');
    var backBtn = document.getElementById('sidebar-back-btn');
    if (payBtn) payBtn.classList.toggle('hidden', isPaymentMode);
    if (backBtn) backBtn.classList.toggle('hidden', !isPaymentMode);

    if (isPaymentMode && window.innerWidth > 768) {
        var cashPaidInput = document.getElementById('cash-paid');
        if (cashPaidInput) {
            cashPaidInput.value = currentTotal.toLocaleString('en-US');
        }
        calcChange();
    }
}

function updateQty(idx, d) {
    cart[idx].qty += d;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    renderCart();
}

function removeCartItem(idx) {
    var removedItem = cart[idx];
    // Neu xoa mon qua tang -> reset button trong gift panel + reset _giftVoucherKey
    if (removedItem && removedItem._vKey) {
        // Gop lai item goc neu co
        var origName = removedItem._originalName || removedItem.name;
        var prevItem = (idx > 0 && cart[idx-1].name === origName && !cart[idx-1]._vKey) ? cart[idx-1] : null;
        var nextItem = (idx < cart.length-1 && cart[idx+1] && cart[idx+1].name === origName && !cart[idx+1]._vKey) ? cart[idx+1] : null;
        if (prevItem) prevItem.qty += 1;
        else if (nextItem) nextItem.qty += 1;
        cart.splice(idx, 1);

        // Reset gift panel button
        _giftVoucherKey = null;
        _giftVoucherPhone = null;
        var list = document.getElementById('gift-panel-list');
        if (list) {
            list.querySelectorAll('button').forEach(function(btn) {
                btn.disabled = false;
                btn.innerText = '+ Bill';
                btn.className = 'bg-green-700 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase active:scale-95';
            });
        }
    } else {
        cart.splice(idx, 1);
    }
    renderCart();
}

function completeOrder_OLD() {
    if (cart.length === 0) return showAppModal("Hic!", "Chưa có món nào!", '🛒');

    let pVal = document.getElementById('cash-paid').value;
    if (pVal === "" || pVal === "0") pVal = currentTotal;
    const paid = Number(pVal);
    if (paid < currentTotal) return alert("Tiền khách đưa chưa đủ!");

    document.getElementById('loading-overlay').style.display = 'flex';

    var bookingKeyToClose = (pendingBedOrder) ? (pendingBedOrder.id || pendingBedOrder.key) : null;

    var bedIdToSend = "";
    var custNameToSend = "Khách vãng lai";
    if (pendingBedOrder) {
        bedIdToSend = pendingBedOrder.bedId || "WAITING";
        custNameToSend = pendingBedOrder.name;
    } else if (activeOrderingBedId) {
        bedIdToSend = activeOrderingBedId;
    }

    const orderData = {
        sdt: document.getElementById('kh-sdt').value || "Khách vãng lai",
        total: currentTotal,
        paid: paid,
        change: Math.max(0, paid - currentTotal),
        method: document.getElementById('btn-bank').classList.contains('border-[#006241]') ? 'Chuyển khoản' : 'Tiền mặt',
        items: cart.map(i => `${i.name}(${i.size})x${i.qty}`).join(', '),
        itemsArray: cart,
        bedId: bedIdToSend,
        customerName: custNameToSend,
        createdAt: new Date().toISOString(),
        status: "pending_sync"
    };

    getOrdersRef().push(orderData, (error) => {
        document.getElementById('loading-overlay').style.display = 'none';

        if(error) alert("Lỗi Firebase: " + error.message);
        else {
            document.getElementById('kh-sdt').value = "";
            document.getElementById('sdt-status').innerText = "";
            var cartInfo = document.getElementById('cart-bed-info');
            if (cartInfo) cartInfo.remove();

            cart = [];
            renderCart();

            if (bedIdToSend !== "WAITING") {
                pendingBedOrder = null;
                activeOrderingBedId = null;
            }

            if (isCheckoutFlow && bookingKeyToClose) {
                var checkoutTotal = (typeof currentTotal !== 'undefined') ? currentTotal : 0;
                var _bk = globalAllBookings.find(function(b){ return (b.id || b.key) === bookingKeyToClose; });
                if (_bk) {
                    _updateBedBooking(_bk, { status: 'đã xong', realEndTime: new Date().toLocaleTimeString('en-GB'), totalSpend: checkoutTotal });
                } else {
                    db.ref('bedBookings/' + bookingKeyToClose).update({ status: 'đã xong', realEndTime: new Date().toLocaleTimeString('en-GB'), totalSpend: checkoutTotal });
                }
                isCheckoutFlow = false;
                pendingBedOrder = null;
                openBedManager();
                setTimeout(() => { showAppModal("Hoàn tất!", "Đã thanh toán và TRẢ BED thành công!", '🏁'); }, 150);
            }
            else if (bedIdToSend == "WAITING") {
                 renderBedSelection();
                 document.getElementById('bed-select-modal').classList.remove('hidden');
            }
            else {
                switchView('menu');
                setTimeout(() => { showAppModal("Xong!", "Thanh toán thành công!", '✅'); }, 150);
            }
        }
    });
}

function setMethod(m) {
    const isBank = (m === 'Chuyển khoản');

    const activeClass = "w-full p-6 rounded-3xl border-4 bg-white text-xl font-bold flex justify-between items-center shadow-md border-[#006241] text-[#006241] sb-green";

    const inactiveClass = "w-full p-6 rounded-3xl border-4 border-transparent bg-white text-xl font-bold text-gray-300 flex justify-between items-center shadow-md";

    document.getElementById('btn-cash').className = isBank ? inactiveClass : activeClass;
    document.getElementById('btn-bank').className = isBank ? activeClass : inactiveClass;

    const box = document.getElementById('cash-detail-box');
    const input = document.getElementById('cash-paid');

    input.value = currentTotal.toLocaleString('en-US');
    calcChange();;

    if (isBank) {
        showPaymentQR();

        box.style.pointerEvents = "none";
        box.style.opacity = "0.4";
        box.style.filter = "grayscale(100%)";
    } else {
        box.style.pointerEvents = "auto";
        box.style.opacity = "1";
        box.style.filter = "none";

        document.getElementById('qr-modal')?.classList.add('hidden');
    }
    calcChange();
}
function updateSuggestions() {
    const denominations = [10000, 20000, 50000, 100000, 200000, 500000];

    function getSmartSuggestions(total) {
        if (!total || total <= 0) return [50000, 100000, 200000, 500000];

        const suggestions = new Set();

        for (const denom of denominations) {
            const rounded = Math.ceil(total / denom) * denom;
            if (rounded > total && rounded <= total * 3) {
                suggestions.add(rounded);
            }
        }

        for (const denom of [100000, 200000, 500000]) {
            if (denom > total) suggestions.add(denom);
        }

        return [...suggestions].sort((a, b) => a - b).slice(0, 5);
    }

    const vals = getSmartSuggestions(currentTotal);

    const pcContainer = document.getElementById('cash-suggestions');
    if (pcContainer) {
        pcContainer.innerHTML = vals.map(v => `<button onclick="quickPaid(${v})" class="bg-white border-2 border-gray-100 px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-400 hover:border-[#006241] hover:text-[#006241] transition-all">${(v/1000).toFixed(0)}k</button>`).join('');
    }

    const mobContainer = document.getElementById('cash-suggestions-mobile');
    if (mobContainer) {
        mobContainer.innerHTML = vals.map(v =>
            `<button onclick="quickPaidMobile(${v})"
                class="w-full py-4 bg-white text-[#006241] rounded-2xl text-lg font-black shadow-sm border border-gray-100 active:bg-[#006241] active:text-white active:scale-95 transition-all">
                ${(v/1000).toFixed(0)}k
            </button>`
        ).join('');
    }
}

function updateCartPadding() {
    return;
}
function formatCashInput(input) {
    let cursorPosition = input.selectionStart;

    let originalVal = input.value.replace(/\D/g, '');

    if (!originalVal) {
        input.value = "";
        return;
    }

    let formattedVal = Number(originalVal).toLocaleString('en-US');
    input.value = formattedVal;

}

function calcChange() {
    let rawVal = document.getElementById('cash-paid').value.replace(/,/g, '');
    const paid = Number(rawVal) || 0;

    let change = paid - currentTotal;

    document.getElementById('cash-change').innerText = (change > 0 ? change.toLocaleString() : 0) + 'đ';

    if (paid > 0) {
        try {
            var _payload = {
                state: 'cash_payment',
                updatedAt: firebase.database.ServerValue.TIMESTAMP,
                total: currentTotal || 0,
                paid: paid,
                change: Math.max(0, change),
                cart: cart ? cart.map(function(i){ return {name:i.name,qty:i.qty,size:i.size,price:i.price}; }) : []
            };
            db.ref('session_display').set(_payload).then(function(){
            }).catch(function(e){  });
        } catch(e) {  }
    }
}

function quickPaid(v) {
    document.getElementById('cash-paid').value = v.toLocaleString('en-US');
    calcChange();
}
function clearFullOrder() {
    if(pendingBedOrder) return alert("Đang trong quy trình thanh toán Bed!");
    cart = [];
    renderCart();
    updateCartPadding();
    resetDebtState();
    giftVoucherMarkUsedAndReset(true);
    resetDiscountState(true);
    var sdtEl = document.getElementById('kh-sdt');
    var statusEl = document.getElementById('sdt-status');
    if (sdtEl) sdtEl.value = '';
    if (statusEl) statusEl.innerText = '';
    var suggestEl = document.getElementById('suggest-pc');
    if (suggestEl) suggestEl.classList.add('hidden');
    syncToCustomerDisplay('idle');
}

