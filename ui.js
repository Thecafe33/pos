function resetOrderingMode(isSilent = false) {
    pendingBedOrder = null;
    activeOrderingBedId = null;
    isCheckoutFlow = false;

    const island = document.getElementById('bed-dynamic-island');
    if (island) island.classList.add('hidden');

    const cartInfo = document.getElementById('cart-bed-info');
    if (cartInfo) cartInfo.remove();

    const sdtInput = document.getElementById('kh-sdt');
    if (sdtInput) sdtInput.value = "";

    const sdtStatus = document.getElementById('sdt-status');
    if (sdtStatus) sdtStatus.innerText = "";

    giftVoucherMarkUsedAndReset(true);
    resetDebtState();
    resetSplitState();
    cart = [];
    renderCart();

    if (!isSilent) {
        syncToCustomerDisplay('idle');
    }

}

function handleBookingInput() {
    autoFillCustomer();
    var val = document.getElementById('new_cust_phone').value;
    renderCustomerSuggestions(val, 'booking');

    var digits = val.replace(/\D/g, '');
    var phoneInput = document.getElementById('new_cust_phone');
    var hint = document.getElementById('phone-length-hint');
    if (!hint) {
        hint = document.createElement('p');
        hint.id = 'phone-length-hint';
        hint.style.cssText = 'font-size:11px; font-weight:800; margin-top:4px; transition:all 0.2s;';
        phoneInput.parentNode.appendChild(hint);
    }
    if (digits.length === 0) {
        hint.innerText = '';
    } else if (digits.length < 10) {
        hint.innerText = `⚠️ Còn thiếu ${10 - digits.length} số (${digits.length}/10)`;
        hint.style.color = '#f59e0b';
        phoneInput.style.borderColor = '#fcd34d';
    } else if (digits.length === 10) {
        hint.innerText = '✅ Đủ 10 số';
        hint.style.color = '#006241';
        phoneInput.style.borderColor = '#006241';
    } else {
        hint.innerText = `❌ Quá dài! Chỉ cần 10 số (${digits.length}/10)`;
        hint.style.color = '#ef4444';
        phoneInput.style.borderColor = '#ef4444';
    }
}

function renderCustomerSuggestions(inputVal, type) {
    var containerId = '';
    if (type === 'pc') containerId = 'suggest-pc';
    else if (type === 'mobile') containerId = 'suggest-mobile';
    else if (type === 'booking') containerId = 'suggest-booking';

    var container = document.getElementById(containerId);
    if (!container) return;

    var keyword = inputVal.replace(/[^0-9]/g, '');

    if (keyword.length < 3) {
        container.classList.add('hidden');
        container.innerHTML = '';
        return;
    }

    var matches = Object.keys(customerMap).filter(phone => phone.includes(keyword)).slice(0, 5);

    if (matches.length === 0) {
        container.classList.add('hidden');
        return;
    }

    var html = matches.map(phone => {
        var cust = customerMap[phone];
        var name = cust.name || "Khách lẻ";
        var phoneDisplay = phone.replace(keyword, `<span class="text-[#006241] font-black">${keyword}</span>`);

        return `
        <div onclick="selectSuggestion('${phone}', '${type}')"
             class="p-3 border-b border-gray-100 hover:bg-green-50 cursor-pointer flex justify-between items-center group transition-colors">
            <div class="flex flex-col text-left">
                <span class="text-sm font-bold text-gray-800 group-hover:text-[#006241]">${name}</span>
                <span class="text-xs text-gray-400 font-mono tracking-wider">${phoneDisplay}</span>
            </div>
            <span class="material-symbols-outlined text-gray-300 text-sm group-hover:text-[#006241]">north_west</span>
        </div>
        `;
    }).join('');

    container.innerHTML = html;
    container.classList.remove('hidden');
}

function selectSuggestion(phone, type) {
    if (type === 'pc') {
        var input = document.getElementById('kh-sdt');
        if(input) { input.value = phone; checkSdtLive(); }
        document.getElementById('suggest-pc').classList.add('hidden');
    }
    else if (type === 'mobile') {
        var input = document.getElementById('pay-sdt-mobile');
        if(input) { input.value = phone; syncMobileInputs(); }
        document.getElementById('suggest-mobile').classList.add('hidden');
    }
    else if (type === 'booking') {
        var input = document.getElementById('new_cust_phone');
        if(input) {
            input.value = phone;
            autoFillCustomer();
        }
        document.getElementById('suggest-booking').classList.add('hidden');
    }
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('#kh-sdt') && !e.target.closest('#suggest-pc')) {
        document.getElementById('suggest-pc')?.classList.add('hidden');
    }
    if (!e.target.closest('#pay-sdt-mobile') && !e.target.closest('#suggest-mobile')) {
        document.getElementById('suggest-mobile')?.classList.add('hidden');
    }
    if (!e.target.closest('#new_cust_phone') && !e.target.closest('#suggest-booking')) {
        document.getElementById('suggest-booking')?.classList.add('hidden');
    }
});
let currentStoreStatus = { isOff: false };

db.ref('store_status').on('value', snap => {
    currentStoreStatus = snap.val() || { isOff: false };
    updateStoreStatusUI();
});

function updateStoreStatusUI() {
    const btn = document.getElementById('btn-store-status');
    if (!btn) return;

    if (currentStoreStatus.isOff) {
        const now = new Date();
        const until = new Date(currentStoreStatus.offUntil);

        if (now > until) {
            resumeStore();
            return;
        }

        btn.className = "w-full py-4 rounded-[20px] font-black text-xs uppercase shadow-lg shadow-red-200 active:scale-95 transition-all mt-3 bg-red-500 text-white animate-pulse";
        btn.innerHTML = `⛔ TẠM NGƯNG<br><span class="text-[9px] opacity-80">${currentStoreStatus.reason}</span>`;
    } else {
        btn.className = "w-full py-4 rounded-[20px] font-black text-xs uppercase shadow-sm active:scale-95 transition-all mt-3 bg-white text-green-600 border-2 border-green-50 hover:bg-green-50";
        btn.innerHTML = `🟢 ĐANG NHẬN KHÁCH`;
    }
}

function handleStoreStatusClick() {
    if (currentStoreStatus.isOff) {
        if (confirm("Mở lại quán ngay lập tức?")) {
            resumeStore();
        }
    } else {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 60);

        const tzOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);

        document.getElementById('off-until-time').value = localISOTime;
        document.getElementById('modal-store-off').classList.remove('hidden');
    }
}

function toggleOtherReason(show) {
    const input = document.getElementById('off-reason-other');
    if (show) input.classList.remove('hidden');
    else input.classList.add('hidden');
}

function submitStoreOff() {
    const radios = document.getElementsByName('off_reason');
    let reason = "";
    for (let r of radios) if (r.checked) reason = r.value;

    if (reason === 'other') {
        reason = document.getElementById('off-reason-other').value.trim();
    }

    if (!reason) return alert("Vui lòng nhập lý do!");

    const untilVal = document.getElementById('off-until-time').value;
    if (!untilVal) return alert("Vui lòng chọn thời gian mở lại!");

    document.getElementById('loading-overlay').style.display = 'flex';
    document.getElementById('modal-store-off').classList.add('hidden');

    db.ref('store_status').set({
        isOff: true,
        reason: reason,
        offUntil: new Date(untilVal).toISOString(),
        updatedAt: new Date().toISOString()
    }, (err) => {
        document.getElementById('loading-overlay').style.display = 'none';
        if (err) alert("Lỗi: " + err.message);
        else showAppModal("Đã Tạm Ngưng", "App khách hàng sẽ chặn đặt lịch cho đến khi mở lại.", "🛑");
    });
}

function resumeStore() {
    db.ref('store_status').set({ isOff: false });
}
function copyBedNotification(endTime) {
    const text = `🌟 Chào bạn đến Cafe in Bed 🌟
Thời gian sử dụng Bed của bạn kết thúc lúc ${endTime}.
Vui lòng tự theo dõi thời gian, hệ thống không gửi thông báo kết thúc.
The Cafe 33 nghiêm cấm mọi hành vi vi phạm thuần phong mỹ tục trong khu vực Bed.
Mọi vi phạm sẽ bị xử lý theo đúng nội quy đã cam kết, bao gồm bồi thường 2.244.000đ nếu phát sinh thiệt hại.
Vui lòng không làm bẩn nệm. Phí vệ sinh 30–50K sẽ được áp dụng nếu vi phạm.
Hãy sử dụng dịch vụ văn minh – đúng quy định.
🤖 The Cafe 33`;

    navigator.clipboard.writeText(text).then(() => {
        if(typeof showAppModal === 'function') {
            showAppModal("Đã sao chép", "Nội dung thông báo đã được sao chép!<br> gửi cho khách ngay.", "📋");
        } else {
            alert("Đã sao chép nội dung thông báo!");
        }
    }).catch(err => {
    });
}
let bookingToMove = null;

function openMoveBedModal(bookingId) {
    const booking = globalAllBookings.find(b => b.id === bookingId);
    if (!booking) return alert("Lỗi: Không tìm thấy đơn hàng!");

    const status = String(booking.status || "").toLowerCase();
    if (!status.includes('active') && !status.includes('đang dùng')) {
        return alert("Chỉ có thể chuyển Bed khi đang sử dụng!");
    }

    bookingToMove = booking;
    document.getElementById('move-bed-subtitle').innerText = `Khách đang ở BED 0${booking.bedId}`;

    const grid = document.getElementById('move-bed-grid');
    grid.innerHTML = "";

    [1, 2, 3, 4].forEach(i => {
        const isBusy = currentBedList.find(b =>
            b.bedId == i &&
            b.status &&
            (b.status.includes('active') || b.status.includes('đang dùng')) &&
            b.id !== bookingId
        );

        let btnHtml = "";

        if (isBusy) {
            btnHtml = `<button disabled class="w-full p-4 rounded-3xl bg-gray-200 border border-gray-300 opacity-50 flex flex-col items-center justify-center grayscale cursor-not-allowed"><span class="text-xl font-black text-gray-400">BED 0${i}</span><span class="text-[9px] font-bold uppercase text-gray-400 mt-1">Đang bận</span></button>`;
        } else if (i == booking.bedId) {
             btnHtml = `<button disabled class="w-full p-4 rounded-3xl bg-amber-100 border-2 border-amber-300 flex flex-col items-center justify-center cursor-not-allowed"><span class="text-xl font-black text-amber-600">BED 0${i}</span><span class="text-[9px] font-bold uppercase text-amber-600 mt-1">Hiện tại</span></button>`;
        } else {
            btnHtml = `<button onclick="confirmMoveBed(${i})" class="w-full p-4 rounded-3xl bg-white border-2 border-transparent hover:border-amber-500 shadow-sm hover:shadow-lg active:scale-95 transition-all group flex flex-col items-center justify-center"><span class="text-xl font-black text-slate-700 group-hover:text-amber-600">BED 0${i}</span><span class="text-[9px] font-bold uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">Chọn Ngay</span></button>`;
        }
        grid.innerHTML += btnHtml;
    });

    document.getElementById('modal-move-bed').classList.remove('hidden');
}

function confirmMoveBed(newBedId) {
    if (!bookingToMove) return;

    const reason = prompt(`Bạn đang chuyển khách từ Bed 0${bookingToMove.bedId} sang Bed 0${newBedId}.\nNhập nguyên nhân (Vd: Bẩn, Máy lạnh hỏng...):`);

    if (reason === null) return;
    if (reason.trim() === "") return alert("Bắt buộc phải nhập lý do để lưu lịch sử!");

    const oldBedId = bookingToMove.bedId;
    const bookingId = bookingToMove.id;
    const timeNow = new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'});

    document.getElementById('loading-overlay').style.display = 'flex';
    document.getElementById('modal-move-bed').classList.add('hidden');

    _updateBedBooking(bookingToMove, {
        bedId: newBedId
    }, (error) => {
        if (error) {
            document.getElementById('loading-overlay').style.display = 'none';
            alert("Lỗi: " + error.message);
        } else {
            var _mhRef = _bedBookingRef(bookingToMove, 'moveHistory');
            if (_mhRef) _mhRef.push({
                fromBed: oldBedId,
                toBed: newBedId,
                time: timeNow,
                reason: reason,
                action: "Chuyển Bed"
            });

            document.getElementById('loading-overlay').style.display = 'none';

            openBedManager();

            if(typeof showAppModal === 'function') {
                showAppModal("Đã Chuyển Bed", `Khách đã được chuyển sang <b>BED 0${newBedId}</b>.<br>Lý do: ${reason}`, "🔄");
            }
        }
    });
}
var _pendingDebtPhone = null;
var _pendingDebtAdded = false;

function scanAndAddDebt(phone, onlyAlert) {
    if (onlyAlert === undefined) onlyAlert = false;
    if (!phone || phone.length < 3) return;
    var key = normalizePhone(phone);
    var cust = customerMap[key];
    if (cust && cust.pendingFee > 0) {
        var fee = cust.pendingFee;
        var reason = cust.pendingFeeReason || "Phí chưa thanh toán";

        if (!onlyAlert) {
            if (_pendingDebtAdded && _pendingDebtPhone === key) {
                if (typeof showAppModal === 'function') {
                    showAppModal("⚠️ CẢNH BÁO NỢ CŨ",
                        "Khách <b>" + cust.name + "</b> đang nợ: <b class=\"text-red-500\">" + fee.toLocaleString() + "đ</b><br>Lý do: " + reason + "<br>Đã tự động thêm vào bill.",
                        "💰");
                }
                return;
            }
            cart = cart.filter(function(i) { return !(i.name && i.name.indexOf("Nợ cũ:") === 0); });
            cart.push({ name: "Nợ cũ: " + reason, size: "Phí", price: fee, qty: 1 });
            renderCart();
            _pendingDebtPhone = key;
            _pendingDebtAdded = true;
        }

        if (typeof showAppModal === 'function') {
            showAppModal("⚠️ CẢNH BÁO NỢ CŨ",
                "Khách <b>" + cust.name + "</b> đang nợ: <b class=\"text-red-500\">" + fee.toLocaleString() + "đ</b><br>Lý do: " + reason + "<br>" + (onlyAlert ? "Vui lòng thu tiền!" : "Đã tự động thêm vào bill."),
                "💰");
        } else {
            alert("CẢNH BÁO: Khách " + cust.name + " đang nợ " + fee.toLocaleString() + "đ");
        }
    }
}

function clearDebtAfterPayment() {
    if (_pendingDebtPhone && _pendingDebtAdded) {
        db.ref('customers/' + _pendingDebtPhone).update({ pendingFee: 0, pendingFeeReason: null });
    }
    _pendingDebtPhone = null;
    _pendingDebtAdded = false;
}

function resetDebtState() {
    _pendingDebtPhone = null;
    _pendingDebtAdded = false;
}
function syncToCustomerDisplay(state, overrideData = {}) {
    const sdtInput = document.getElementById('kh-sdt');
    let sdt = sdtInput ? normalizePhone(sdtInput.value) : "";
    let cust = customerMap[sdt] || { name: "Khách mới", points: 0 };

    const payload = {
        state: state,
        updatedAt: firebase.database.ServerValue.TIMESTAMP,
        customerName: cust.name,
        customerPoints: cust.points,
        total: currentTotal,
        cart: cart.map(i => ({
            name: i.name,
            qty: i.qty,
            size: i.size,
            price: i.price
        })),
        ...overrideData
    };

    db.ref('session_display').set(payload);
}
function listenToClientInput() {
    db.ref('client_input').off();

    db.ref('client_input').on('value', (snap) => {
        const data = snap.val();

        if (!data) return;

        if (Date.now() - data.timestamp > 5000) {
             db.ref('client_input').set(null);
             return;
        }

        if (data.type === 'rules_agreed') {

            document.getElementById('modal-waiting-rules').classList.add('hidden');

            if(pendingBedOrder) pendingBedOrder.rulesAgreed = true;

            let method = document.getElementById('btn-bank').classList.contains('sb-green') ? 'Chuyển khoản' : 'Tiền mặt';
            saveOrderToFirebase(method);

            db.ref('client_input').set(null);
            return;
        }

        if (!data.value) return;

        const bookingModal = document.getElementById('modal-add-booking');
        const isBookingOpen = bookingModal && !bookingModal.classList.contains('hidden');

        if (isBookingOpen) {
            const input = document.getElementById('new_cust_phone');
            if (input) {
                input.value = data.value;
                if (typeof handleBookingInput === 'function') handleBookingInput();
                input.classList.add('bg-green-100');
                setTimeout(() => input.classList.remove('bg-green-100'), 500);
            }
        } else {
            const pcInput = document.getElementById('kh-sdt');
            if (pcInput) pcInput.value = data.value;

            const mobInput = document.getElementById('pay-sdt-mobile');
            if (mobInput) {
                mobInput.value = data.value;
                if (typeof syncMobileInputs === 'function') syncMobileInputs();
            }

            if (typeof checkSdtLive === 'function') checkSdtLive();
            if (typeof scanAndAddDebt === 'function') scanAndAddDebt(data.value);
        }

        db.ref('client_input').set(null);
    });
}
listenToClientInput();
function closeQRModal() {
    document.getElementById('qr-modal').classList.add('hidden');
    if (typeof syncToCustomerDisplay === 'function') {
        syncToCustomerDisplay('cart');
    }
    setMethod('Tiền mặt');
}
function syncBedWelcomeToScreen(bookingData) {

    const rawPhone = bookingData.phone || "";
    const maskedPhone = rawPhone.length > 4
        ? "******" + rawPhone.slice(-4)
        : rawPhone;

    const timeStart = bookingData.timeStart || "--:--";
    const timeEnd = bookingData.timeEnd || "--:--";

    db.ref('session_display').set({
        state: 'bed_welcome',
        customerName: bookingData.name,
        maskedPhone: maskedPhone,
        startTime: timeStart,
        endTime: timeEnd,
        orderType: 'bed'
    });
}

function triggerRulesToScreen() {
    document.getElementById('modal-rules-check').classList.add('hidden');
    document.getElementById('modal-waiting-rules').classList.remove('hidden');

    syncToCustomerDisplay('show_rules');
}

function skipRulesAndPay() {
    document.getElementById('modal-rules-check').classList.add('hidden');
    if(pendingBedOrder) pendingBedOrder.rulesAgreed = true;

    let method = document.getElementById('btn-bank').classList.contains('sb-green') ? 'Chuyển khoản' : 'Tiền mặt';
    syncCashPaymentToScreen(method);
    saveOrderToFirebase(method);
}

function cancelRulesWait() {
    document.getElementById('modal-waiting-rules').classList.add('hidden');
    syncToCustomerDisplay('idle');
}
function resetPhoneInput() {
    const input = document.getElementById('kh-sdt');
    if (input) {
        input.value = "";

        const status = document.getElementById('sdt-status');
        if (status) status.innerText = "";

        if (typeof checkSdtLive === 'function') checkSdtLive();

        if (typeof syncToCustomerDisplay === 'function') {
            syncToCustomerDisplay('cart', { customerName: "Khách lẻ", customerPoints: 0 });
        }
    }
}
document.addEventListener('DOMContentLoaded', updateCartPadding);

var _discountCache = {};
var _appliedDiscountId = null;

