function saveOrderToFirebase(method, _overridePaid, _overrideChange) {
    if (isSavingOrder) return;
    if (!cart || cart.length === 0) return alert("Giỏ hàng đang trống!");
    isSavingOrder = true;

    let paid, change;
    if (_overridePaid !== undefined) {
        paid   = _overridePaid;
        change = _overrideChange !== undefined ? _overrideChange : Math.max(0, paid - currentTotal);
    } else {
        const isMobile = window.innerWidth <= 768;
        const _rawPaid = isMobile
            ? document.getElementById('cash-paid-mobile').value
            : document.getElementById('cash-paid').value;
        const pVal = String(_rawPaid || '').replace(/,/g, '');
        paid   = (method === 'Chuyển khoản') ? currentTotal : (Number(pVal) || currentTotal);
        change = Math.max(0, paid - currentTotal);
    }

    const currentBooking = pendingBedOrder;
    const isCheckout = isCheckoutFlow;
    const currentBedId = (currentBooking && currentBooking.bedId) ? currentBooking.bedId : (activeOrderingBedId || "");

    const sdtInput = document.getElementById('kh-sdt').value;
    const finalSdt = (currentBooking && currentBooking.phone) ? currentBooking.phone : (sdtInput || "Khách vãng lai");
    const finalCustName = (currentBooking && currentBooking.name) ? currentBooking.name : "Khách vãng lai";

    const orderData = {
        id: Date.now(),
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        sdt: finalSdt,
        items: cart.map(i => `${i.name} (${i.size}) x${i.qty}`).join(', '),
        itemsArray: cart,
        total: currentTotal,
        paid: paid,
        change: change,
        method: method,
        points: Math.floor(currentTotal / 100),
        bedId: currentBedId,
        customerName: finalCustName
    };

    // Gắn splitMeta nếu là đơn tính riêng
    if (_splitOrderMeta) {
        orderData.splitMeta = _splitOrderMeta;
        _splitOrderMeta = null;
    }

    getOrdersRef().push(orderData, (error) => {
        isSavingOrder = false;
        if (error) {
            alert("❌ Lỗi lưu đơn: " + error.message);
        } else {

            cart = [];
            renderCart();
            document.getElementById('kh-sdt').value = "";
            const pcStatusLabel = document.getElementById('sdt-status');
            if (pcStatusLabel) pcStatusLabel.innerText = "";
            clearDebtAfterPayment();

            // Ghi preorder/status = 'loaded' SAU KHI thanh toán thành công
            if (currentBooking && _hasActivePreorder(currentBooking)) {
                var _bkForStatus = (globalAllBookings || []).find(function(b){ return (b.id||b.key) === (currentBooking.id||currentBooking.key); });
                var _statusRef = _bkForStatus
                    ? _bedBookingRef(_bkForStatus, 'preorder/status')
                    : db.ref('bedBookings/' + (currentBooking.id||currentBooking.key) + '/preorder/status');
                _statusRef.set('loaded');
            }
            giftVoucherMarkUsedAndReset();
            resetDiscountState(true);
            if(document.getElementById('qr-modal')) document.getElementById('qr-modal').classList.add('hidden');

            if (isCheckout && currentBooking) {
                syncToCustomerDisplay('success');

                let realTime = new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
                _updateBedBooking(currentBooking, { status: 'đã xong', realEndTime: realTime });

                resetOrderingMode();
                openBedManager();
                setTimeout(() => showAppModal("Hoàn tất", "Đã thanh toán và TRẢ BED thành công!", "🏁"), 300);
            }

            else if (currentBooking && (currentBooking.bedId === "WAITING" || !currentBooking.bedId)) {
                renderBedSelection();
                document.getElementById('bed-select-modal').classList.remove('hidden');

            }

            else {
                syncToCustomerDisplay('success');

                resetOrderingMode(true);

                switchView('menu');
                setTimeout(() => showAppModal("Thành công", "Đơn hàng đã được lưu!", "✅"), 300);
            }
        }
    });
}
function closeBillModal() {
    document.getElementById('modal-bill-detail').classList.add('hidden');
}

function showBillModal(bookingId) {
    var booking = (globalAllBookings || []).find(function(b) { return (b.id || b.key) === bookingId; });
    if (!booking) return;

    var modal = document.getElementById('modal-bill-detail');
    var guestEl = document.getElementById('bill-modal-guest');
    var bodyEl = document.getElementById('bill-modal-body');
    var totalEl = document.getElementById('bill-modal-total');

    guestEl.innerText = (booking.name || 'Khách') + (booking.bedId ? ' · Bed 0' + booking.bedId : '');
    bodyEl.innerHTML = '<div class="text-center py-8 text-gray-300 text-sm">Đang tải...</div>';
    totalEl.innerText = '--';
    modal.classList.remove('hidden');

    // Query orders hôm nay theo bedId và phone
    getOrdersRef().once('value', function(snap) {
        var data = snap.val();
        var orders = [];
        if (data) {
            Object.keys(data).forEach(function(k) {
                var o = data[k];
                var matchBed   = booking.bedId && o.bedId && String(o.bedId) === String(booking.bedId);
                var matchPhone = booking.phone && o.sdt && o.sdt.replace(/[^0-9]/g,'') === booking.phone.replace(/[^0-9]/g,'');
                if (matchBed || matchPhone) orders.push(o);
            });
        }

        if (!orders.length) {
            bodyEl.innerHTML = '<div class="text-center py-8 text-gray-400 text-sm">Chưa có hoá đơn nào.</div>';
            return;
        }

        // Gom tất cả items từ các order
        var itemMap = {};
        var grandTotal = 0;
        orders.forEach(function(o) {
            grandTotal += Number(o.total || 0);
            var items = [];
            if (o.itemsArray && Array.isArray(o.itemsArray)) {
                items = o.itemsArray;
            } else if (o.items) {
                o.items.split(',').forEach(function(s) {
                    var raw = s.trim();
                    var lastX = raw.lastIndexOf('x');
                    if (lastX === -1) return;
                    var namePart = raw.substring(0, lastX).trim();
                    var qty = parseInt(raw.substring(lastX + 1)) || 1;
                    var name = namePart, size = 'M';
                    if (namePart.includes('(')) {
                        var p = namePart.split('(');
                        name = p[0].trim();
                        size = p[1].replace(')', '').trim();
                    }
                    items.push({ name: name, size: size, qty: qty, price: 0 });
                });
            }
            items.forEach(function(it) {
                if (!it || !it.name) return;
                var key = it.name + '|' + (it.size || 'M');
                if (itemMap[key]) {
                    itemMap[key].qty += (parseInt(it.qty) || 1);
                } else {
                    itemMap[key] = { name: it.name, size: it.size || 'M', price: it.price || 0, qty: parseInt(it.qty) || 1 };
                }
            });
        });

        var html = '';
        Object.values(itemMap).forEach(function(it) {
            var sub = it.price * it.qty;
            html += '<div class="flex items-center justify-between py-2.5 border-b border-dashed border-gray-100 last:border-0">'
                + '<div class="flex items-center gap-3">'
                + '<span class="w-7 h-7 rounded-full bg-[#006241] text-white text-xs font-black flex items-center justify-center shrink-0">' + it.qty + '</span>'
                + '<div><p class="text-sm font-black text-gray-800">' + it.name + '</p>'
                + '<p class="text-[11px] text-gray-400 font-bold">' + it.size + (it.price > 0 ? ' · ' + it.price.toLocaleString() + 'đ' : '') + '</p></div>'
                + '</div>'
                + (sub > 0 ? '<span class="text-sm font-black text-[#006241]">' + sub.toLocaleString() + 'đ</span>' : '')
                + '</div>';
        });

        bodyEl.innerHTML = html;
        totalEl.innerText = grandTotal.toLocaleString() + 'đ';
    });
}

function completeOrder() {
    if (pendingBedOrder && pendingBedOrder.isWalkIn && !pendingBedOrder.rulesAgreed) {
        document.getElementById('modal-rules-check').classList.remove('hidden');
        return;
    }
    let method = 'Tiền mặt';

    const btnBank = document.getElementById('btn-bank');
    if (btnBank && (btnBank.classList.contains('sb-green') || btnBank.classList.contains('border-[#006241]'))) {
        method = 'Chuyển khoản';
    }

    saveOrderToFirebase(method);
}
// ═══════════════════════════════════════════════════════════════
// TÍNH RIÊNG — v2
// ═══════════════════════════════════════════════════════════════

// State
let splitExpandedCart = []; // [{ stableId, name, size, price }]
let splitSelected     = new Set();
let splitGroups       = [];  // [{ ids[], method, subtotal, paid, change }]
let splitQRListening  = false;
let _splitQRUnsubscribe = null;
let _splitOrderMeta   = null; // gắn vào order khi lưu

// Mở modal — giữ state (thêm món giữa chừng không bị reset)
