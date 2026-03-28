function renderHistoryMobile(data) {
    const container = document.getElementById('mob-history-list');
    if(!container) return;

    const grouped = data.reduce((acc, obj) => {
        const key = obj.dateStr; if (!acc[key]) acc[key] = []; acc [key].push(obj); return acc;
    }, {});

    let html = "";

    Object.keys(grouped).sort((a,b) => {
         const da = a.split('/').reverse().join(''); const db = b.split('/').reverse().join(''); return db.localeCompare(da);
    }).forEach(date => {

        html += `
        <div class="flex items-center gap-3 mb-4 mt-6">
            <span class="text-[12px] font-black text-[#1e3932] uppercase tracking-widest bg-white pr-2 sticky top-0">${date}</span>
            <div class="h-[1px] flex-1 bg-gray-100"></div>
        </div>
        <div class="space-y-4">`;

        grouped[date].forEach(h => {
            const realIdx = historyData.findIndex(item => item.id === h.id);

            let isRefund = h.total < 0;
            let amountColor = isRefund ? "text-red-500" : "text-[#1e3932]";
            let cardBg = "bg-gray-50/80";
            let iconBg = isRefund ? "bg-red-100 text-red-500" : "bg-white text-[#006241]";
            let icon = isRefund ? "undo" : "receipt_long";

            html += `
            <div onclick="showHistoryDetailMobile(${realIdx})" class="${cardBg} p-5 rounded-[32px] border border-transparent active:border-[#006241]/20 active:scale-[0.98] transition-all flex items-center justify-between relative overflow-hidden group">

                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-[18px] ${iconBg} flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                        <span class="material-symbols-outlined font-bold">${icon}</span>
                    </div>

                    <div class="min-w-0">
                        <h3 class="font-black text-xl text-[#1e3932] leading-none mb-1.5 tracking-tight">${h.timeStr}</h3>

                        <p class="text-[11px] font-bold text-gray-400 truncate flex items-center gap-1.5">
                            <span class="font-mono text-[10px]">#${h.id.toString().slice(-4)}</span>
                            <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span class="truncate max-w-[100px]">${h.sdt || 'Khách lẻ'}</span>
                        </p>
                    </div>
                </div>

                <div class="text-right shrink-0 ml-2">
                    <p class="font-black text-lg ${amountColor} tracking-tight leading-none">${Number(h.total).toLocaleString()}<span class="text-xs opacity-60 ml-0.5 font-bold align-top">đ</span></p>
                    <p class="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-wider text-right">${h.method}</p>
                </div>
            </div>`;
        });
        html += `</div>`;
    });

    container.innerHTML = html;
}

function filterHistoryMobile(keyword) {
    const kw = keyword.toLowerCase();
    const filtered = historyData.filter(h =>
        (h.sdt && h.sdt.toLowerCase().includes(kw)) ||
        h.total.toString().includes(kw) ||
        (h.id && h.id.toString().toLowerCase().includes(kw))
    );
    renderHistoryMobile(filtered);
}
function handleMobileBedOrder(bookingId) {
    const booking = globalAllBookings.find(b => b.id === bookingId);
    if (!booking) return;

    activeOrderingBedId = booking.bedId || "WAITING";
    pendingBedOrder = booking;

    _doHandleMobileBedOrder(booking);
}

function _doHandleMobileBedOrder(booking) {
    var statusLabel = document.getElementById('sdt-status');

    if (sdtInput) {
        sdtInput.value = "";
        if (statusLabel) statusLabel.innerText = "";

        if (booking.phone) {
            sdtInput.value = booking.phone;
            if (typeof checkSdtLive === 'function') checkSdtLive();

            scanAndAddDebt(booking.phone);
        }
    }

    if (typeof autoAddBedItems === 'function') autoAddBedItems(booking);

    var _mobileKey = booking.key || booking.id;
    if (_mobileKey && _hasActivePreorder(booking)) {
        loadPreorderToCart(_mobileKey);
    }

    const maskedPhone = booking.phone && booking.phone.length > 4
        ? "******" + booking.phone.slice(-4) : "Khách lẻ";

    db.ref('session_display').set({
        state: 'bed_welcome',
        customerName: booking.name,
        maskedPhone: maskedPhone,
        startTime: booking.start,
        endTime: booking.end,
        orderType: 'bed'
    });

    switchView('menu');

    setTimeout(function() {
        var cartInfo = document.getElementById('cart-bed-info');
        var headerContainer = document.querySelector('#sidebar-cart .flex.justify-between');
        if (!cartInfo && headerContainer) {
            cartInfo = document.createElement('div');
            cartInfo.id = 'cart-bed-info';
            headerContainer.parentNode.insertBefore(cartInfo, headerContainer.nextSibling);
        }
        if (cartInfo) {
            var guestName = booking.name || "Khách hàng";
            cartInfo.className = "text-[11px] font-black uppercase mb-2 pl-1 mt-1 animate-pulse";
            if (booking.bedId && booking.bedId != "WAITING") {
                cartInfo.innerText = `🟢 ĐANG GỌI: BED 0${booking.bedId} - ${guestName}`;
                cartInfo.style.color = "#006241";
            } else {
                cartInfo.innerText = `🟠 ĐANG GỌI: KHÁCH CHỜ - ${guestName}`;
                cartInfo.style.color = "#d97706";
            }
        }
    }, 100);
}
function runAutoCancelScan(list) {
    if (!list || list.length === 0) return;

    const now = new Date();
    const AUTO_CANCEL_MINUTES = 50;
    const todayStr = new Date().toLocaleDateString('en-GB');

    list.forEach(booking => {
        if ((booking.status === 'chờ khách' || !booking.status) &&
            (!booking.displayDate || booking.displayDate === todayStr)) {

            if (booking.start && booking.start.includes(':')) {
                let parts = booking.start.split(':');
                let bookingTime = new Date();
                bookingTime.setHours(parseInt(parts[0]), parseInt(parts[1]), 0);

                let diff = (now - bookingTime) / 60000;

                if (diff > AUTO_CANCEL_MINUTES) {

                    let bookingId = booking.id || booking.key;
                    if (bookingId) {
                        _updateBedBooking(booking, {
                            status: 'đã hủy',
                            cancelType: 'auto_timeout',
                            note: 'Hủy tự động (Quá 50p)'
                        });
                        if (booking.phone) {
                            updateRepScore(booking.phone, booking.name || 'Khách hàng', -10, 'Lịch bị hủy do quá giờ', bookingId);
                        }
                    }
                }
            }
        }
    });
}
async function syncDataFromSheet() {
    const syncBtnIcon = document.getElementById('sync-icon');

    if(syncBtnIcon) syncBtnIcon.classList.add('animate-spin');

    if(typeof showAppModal === 'function') {
        showAppModal("Hệ thống", "Đang đồng bộ Menu, Khách hàng và Quà tặng từ Sheet...", "⏳");
    }

    try {
        const urls = [
            'https://us-central1-the-cafe-33.cloudfunctions.net/syncMenu',
            'https://us-central1-the-cafe-33.cloudfunctions.net/syncCustomers'
        ];

        const responses = await Promise.all(urls.map(url => fetch(url)));

        if(responses.every(r => r.ok)) {
            showAppModal("Thành công", "Menu và Khách hàng đã được cập nhật mới nhất!", "✅");
        } else {
            throw new Error("Một hoặc nhiều dịch vụ gặp lỗi");
        }

    } catch (error) {
        showAppModal("Thất bại", "Không thể cập nhật dữ liệu. Vui lòng kiểm tra Cloud Functions!", "❌");
    } finally {
        if(syncBtnIcon) syncBtnIcon.classList.remove('animate-spin');
    }
}
function getDurationLabel(start, end) {
    if (!start || !end) return "0 Tiếng";
    const s = start.split(':');
    const e = end.split(':');
    const startMins = parseInt(s[0]) * 60 + parseInt(s[1]);
    let endMins = parseInt(e[0]) * 60 + parseInt(e[1]);

    if (endMins < startMins) endMins += 24 * 60;

    const diff = endMins - startMins;
    const hours = diff / 60;

    return hours % 1 === 0 ? hours + " TIẾNG" : hours.toFixed(1) + " TIẾNG";
}

