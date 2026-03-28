function listenForPayment(code, amount) {
    if (paymentListener) {
        db.ref('payment_events').off();
    }

    paymentListener = db.ref('payment_events')
        .limitToLast(5)
        .on('value', (snap) => {
            const events = snap.val();
            if (!events) return;

            Object.values(events).forEach(data => {

                const eventAmount = Number(data.amount || 0);
                const targetAmount = Number(amount || 0);

                const dataCode = String(data.orderCode || "").trim();
                const targetCode = String(code || "").trim();

                const isCodeMatch = (dataCode === targetCode) ||
                                    (data.description && data.description.includes(targetCode)) ||
                                    (data.content && data.content.includes(targetCode));

                const isAmountMatch = eventAmount >= targetAmount;

                if (isCodeMatch && isAmountMatch) {
                    handlePaymentSuccess(data.amount);
                }
            });
        });
}
function handlePaymentSuccess(receivedAmount) {

    const statusEl = document.getElementById('qr-status');
    if(statusEl) {
        statusEl.innerHTML = `<div class="text-green-600 font-black animate-bounce">✅ ĐÃ NHẬN TIỀN!</div>`;
    }

    try {
        if (typeof syncToCustomerDisplay === 'function') syncToCustomerDisplay('success');
    } catch (e) {  }

    try {
        db.ref('payment_events').off();
        paymentListener = null;
    } catch (e) {  }

    setTimeout(() => {
        document.getElementById('qr-modal')?.classList.add('hidden');

        if (typeof saveOrderToFirebase === "function") {
            saveOrderToFirebase('Chuyển khoản');
        } else {
            alert("Lỗi: Không tìm thấy hàm lưu đơn!");
        }
    }, 1500);
}
function showPaymentQR() {
    if (!currentTotal || currentTotal < 2000) {
        alert("Vui lòng chọn món (Tối thiểu 2.000đ) để tạo mã QR!");
        setMethod('Tiền mặt');
        return;
    }

    const API_URL = "https://us-central1-the-cafe-33.cloudfunctions.net/createPayment";

    const modal = document.getElementById('qr-modal');
    modal.classList.remove('hidden');

    const qrImg = document.getElementById('vietqr-img');
    const qrText = document.getElementById('qr-content');
    const statusEl = document.getElementById('qr-status');

    qrImg.src = "https://i.gifer.com/ZZ5H.gif";
    qrText.innerText = "Đang tạo QR...";
    statusEl.innerText = "Vui lòng đợi giây lát...";

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            amount: parseInt(currentTotal)
        })
    })
    .then(response => response.json())
    .then(result => {

        if (result.status === "success") {
           var qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=" + encodeURIComponent(result.qrCode);
           qrImg.src = qrUrl;
            if (typeof syncToCustomerDisplay === 'function') {
                syncToCustomerDisplay('qr_payment', {
                    qrUrl: qrUrl,
                    amount: currentTotal
                });
            }
            currentOrderCode = result.orderCodeFull;
            qrText.innerText = currentOrderCode;
            statusEl.innerHTML = '<b class="text-amber-500 animate-pulse">Đang chờ thanh toán...</b>';

            listenForPayment(currentOrderCode, currentTotal);
        } else {
            alert("Lỗi từ PayOS: " + result.message);
            modal.classList.add('hidden');
            setMethod('Tiền mặt');
        }
    })
    .catch(error => {
        alert("Lỗi kết nối Server! Vui lòng thử lại.");
        modal.classList.add('hidden');
        setMethod('Tiền mặt');
    });
}

function toggleMobileMenu() {
    const sb = document.getElementById('mobile-sidebar');
    const ol = document.getElementById('mobile-overlay');
    if (sb.classList.contains('-translate-x-full')) {
        sb.classList.remove('-translate-x-full'); ol.classList.remove('hidden');
    } else {
        sb.classList.add('-translate-x-full'); ol.classList.add('hidden');
    }
}
function toggleCartExpand() {
    if (window.innerWidth > 768) return;

    openCartModal();
}
function syncMobileInputs() {
    var sdtMob = document.getElementById('pay-sdt-mobile').value;
    renderCustomerSuggestions(sdtMob, 'mobile');
    var sdtMain = document.getElementById('kh-sdt');
    if (sdtMain) {
        sdtMain.value = sdtMob;
        if (typeof checkSdtLive === 'function') checkSdtLive();
    }

    var cleanSdt = sdtMob.replace(/[^0-9]/g, '');
    var custNameEl = document.getElementById('pay-cust-name-mobile');
if (custNameEl) {
    if (customerMap[cleanSdt]) {
        custNameEl.innerHTML = `<div class="mt-3 bg-green-50 p-2 rounded-xl text-center"><span class="text-xs font-black text-green-700">★ ${customerMap[cleanSdt].name}</span></div>`;
        custNameEl.style.height = "auto";
    } else {
        custNameEl.innerHTML = "";
        custNameEl.style.height = "0";
    }
}

    var cashMob = document.getElementById('cash-paid-mobile').value;
    var cashMain = document.getElementById('cash-paid');

    var rawCash = cashMob.replace(/[^0-9]/g, '');

    if (cashMain) {
        cashMain.value = rawCash;
        if (typeof calcChange === 'function') calcChange();
    }

    var paid = Number(rawCash) || 0;
    var change = paid - currentTotal;
    var changeEl = document.getElementById('cash-change-mobile');
    if (changeEl) {
        changeEl.innerText = (change > 0 ? change.toLocaleString() : 0) + 'đ';
    }

    if (paid > 0) {
        try {
            var _mob_payload = {
                state: 'cash_payment',
                updatedAt: firebase.database.ServerValue.TIMESTAMP,
                total: currentTotal || 0,
                paid: paid,
                change: Math.max(0, change),
                cart: cart ? cart.map(function(i){ return {name:i.name,qty:i.qty,size:i.size,price:i.price}; }) : []
            };
            db.ref('session_display').set(_mob_payload).then(function(){
            }).catch(function(e){  });
        } catch(e) {  }
    }
}

function goToMobileCash() {
    setMethod('Tiền mặt');

    document.getElementById('mob-step-1').classList.add('hidden');
    document.getElementById('mob-step-2').classList.remove('hidden');

    var input = document.getElementById('cash-paid-mobile');
    if(input) {
        input.value = currentTotal.toLocaleString('en-US');

        syncMobileInputs();

        input.blur();
    }

    updateSuggestions();
}

function backMobileStep() {
    var step2 = document.getElementById('mob-step-2');

    if (step2 && !step2.classList.contains('hidden')) {
        document.getElementById('mob-step-2').classList.add('hidden');
        document.getElementById('mob-step-1').classList.remove('hidden');
        document.getElementById('mob-pay-title').innerText = "Thanh toán";
    } else {
        switchView('menu');
    }
}

let isSavingOrder = false;
