function openBedManagerMobile() {
    document.getElementById('loading-overlay').style.display = 'flex';

    var mobBar = document.getElementById('mobile-bottom-bar');
    if(mobBar) {
        mobBar.classList.add('hidden');
        mobBar.classList.remove('flex');
    }

    ['view-menu', 'view-payment', 'view-history', 'view-bed', 'view-revenue'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    const histMobEl = document.getElementById('view-history-mobile');
    if (histMobEl) histMobEl.classList.add('hidden');
    const revMobEl = document.getElementById('view-revenue-mobile');
    if (revMobEl) revMobEl.classList.add('hidden');

    document.getElementById('view-bed-mobile').classList.remove('hidden');

    const btnBed = document.getElementById('btn-nav-bed');
    if(btnBed) {
        document.querySelectorAll('button[id^="btn-nav-"]').forEach(b => {
            b.classList.remove('tab-active', 'sb-green', 'text-white');
            b.classList.add('bg-gray-100', 'text-gray-400');
        });
        btnBed.classList.add('tab-active', 'sb-green', 'text-white');
        btnBed.classList.remove('bg-gray-100', 'text-gray-400');
    }

    const today = new Date().toISOString().split('T')[0];
    const picker = document.getElementById('mob-date-picker');
    if(picker && !picker.value) picker.value = today;

    const todayISO = new Date().toISOString().split('T')[0];
    const todayParts = todayISO.split('-');

    db.ref('bedBookings/' + todayParts[0] + '/' + todayParts[1] + '/' + todayParts[2]).on('value', snap => {
        _loadBedBookingsForDays([todayISO], function(bookings) {
            globalAllBookings = globalAllBookings.filter(b => b.displayDate !== new Date().toLocaleDateString('en-GB'));
            globalAllBookings = globalAllBookings.concat(bookings);
            runAutoCancelScan(globalAllBookings);
            document.getElementById('loading-overlay').style.display = 'none';
            const pickerEl = document.getElementById('mob-date-picker');
            changeBedDateMobile(pickerEl && pickerEl.value ? pickerEl.value : todayISO);
        });
    });
}

function changeBedDateMobile(dateVal) {
    if(!dateVal) return;
    const parts = dateVal.split('-');
    const targetDateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;

    _loadBedBookingsForDays([dateVal], function(bookings) {
        globalAllBookings = globalAllBookings.filter(b => b.displayDate !== targetDateStr);
        globalAllBookings = globalAllBookings.concat(bookings);
        const isToday = (targetDateStr === new Date().toLocaleDateString('en-GB'));
        const list = bookings.filter(b => {
            if (isToday) return b.displayDate === targetDateStr || (b.status && b.status.includes('active'));
            return b.displayDate === targetDateStr;
        });
        renderMobileBedList(list);
    });
}

function renderMobileBedList(list) {
    const container = document.getElementById('mob-bed-list-container');
    if(!container) return;

    if(list.length === 0) {
        container.innerHTML = `<div class="flex flex-col items-center justify-center h-64 text-slate-400"><span class="material-symbols-outlined text-4xl mb-2">event_busy</span><p class="text-sm font-medium">Không có lịch đặt</p></div>`;
        return;
    }

    const sortedList = [...list].sort((a, b) => {
        const getPriority = (item) => {
            const status = String(item.status || "").toLowerCase();
            const isWaiting = !item.bedId || item.bedId == "WAITING";

            if (status.includes('đã hủy')) return 4;
            if (status.includes('đã xong')) return 3;
            if (status.includes('active') || status.includes('đang dùng')) return 1;
            if (isWaiting || status.includes('chờ khách')) return 2;
            return 5;
        };
        return getPriority(a) - getPriority(b);
    });

    container.innerHTML = sortedList.map(b => {
        const status = String(b.status || "").toLowerCase();
        const isCancelled = status.includes('đã hủy');
        const isDone = status.includes('đã xong');
        const isActive = status.includes('active') || status.includes('đang dùng');
        const isWaiting = (!b.bedId || b.bedId == "WAITING") && !isCancelled && !isDone;

        let cardBg = "bg-white",
            titleColor = "text-slate-900",
            subColor = "text-slate-500",
            dotColor = "bg-slate-300",
            statusLabel = b.bedId && b.bedId != "WAITING" ? `BED 0${b.bedId}` : "CHỜ XẾP";

        if (isCancelled) {
            cardBg = "bg-red-50 border-red-100";
            titleColor = "text-red-900";
            subColor = "text-red-400";
            dotColor = "bg-red-500";
            statusLabel = "ĐÃ HỦY";
        }
        else if (isActive) {
            cardBg = "bg-[#E6F4F1] border-[#bce3db]";
            titleColor = "text-[#006241]";
            subColor = "text-[#006241]/70";
            dotColor = "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]";
        }
        else if (isWaiting) {
            cardBg = "bg-amber-50 border-amber-100";
            titleColor = "text-amber-900";
            subColor = "text-amber-600/70";
            dotColor = "bg-amber-500";
            statusLabel = "CHỜ XẾP";
        }
        else if (isDone) {
            cardBg = "bg-white border-slate-100";
            titleColor = "text-slate-400";
            subColor = "text-slate-300";
            dotColor = "bg-slate-200";
        }

        return `
        <div onclick="showMobileBedDetail('${b.id}')"
             class="${cardBg} squircle p-5 shadow-sm active:scale-[0.98] transition-all border relative overflow-hidden mb-3">
            <div class="flex justify-between items-start mb-1.5 relative z-10">
                <span class="text-[10px] font-black tracking-[0.15em] uppercase ${subColor}">${statusLabel}</span>
                <div class="w-2.5 h-2.5 rounded-full ${dotColor}"></div>
            </div>
            <h3 class="text-xl font-black mb-2 ${titleColor} relative z-10 tracking-tight leading-none">${b.name}</h3>
            <div class="flex items-center gap-2 text-xs ${subColor} relative z-10 font-bold">
                <span class="material-symbols-outlined text-[14px]">schedule</span>
                <span>${isDone ? "Check-out lúc: " + (b.realEndTime || b.end) : b.start + " - " + b.end}</span>
            </div>
        </div>`;
    }).join('');
}
function showMobileBedDetail(bookingId) {
    var booking = globalAllBookings.find(b => b.id === bookingId);
    if (booking) {
        _showMobileBedDetailRender(booking);
        return;
    }
    // Fallback: tìm trong currentBedList trước, rồi đọc RT theo path nếu booking có dateKey
    var fromList = (currentBedList || []).find(b => b.id === bookingId);
    if (fromList) { _showMobileBedDetailRender(fromList); return; }
    // Không có trong memory — không biết ngày, không thể load
    console.warn('showMobileBedDetail: booking ' + bookingId + ' not found in memory');
}

function _showMobileBedDetailRender(booking) {
    window.currentMobileBooking = booking;
    renderDetailContentMobile(booking);

    const isFinished = (booking.status === 'đã xong' || booking.status === 'đã hủy');
    const isActive = (booking.status && (booking.status.includes('active') || booking.status.includes('đang dùng')));

    let topBtn = `<div class="w-11"></div>`;

    if (isActive) {
        topBtn = `
        <button onclick="openMoveBedModal('${booking.id}')"
            class="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-[0_2px_10px_rgba(245,158,11,0.2)] active:scale-90 transition-transform border border-amber-100">
            <span class="material-symbols-outlined text-[22px] font-bold">sync</span>
        </button>`;
    }

    const headerHtml = `
        <nav class="flex items-center justify-between px-5 py-4 bg-[#F2F2F7] sticky top-0 z-40">
            <button onclick="closeMobileBedDetail()" class="w-11 h-11 rounded-full bg-white flex items-center justify-center text-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] active:scale-90 transition-transform border border-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </button>
            <h1 class="text-lg font-black text-slate-900 uppercase tracking-tight">Chi tiết</h1>

            ${topBtn}
        </nav>`;

    document.getElementById('mob-detail-header-container').innerHTML = headerHtml;

    document.getElementById('mob-bed-detail-screen').classList.remove('translate-x-full');
}

function closeMobileBedDetail() {
    document.getElementById('mob-bed-detail-screen').classList.add('translate-x-full');
    window.currentMobileBooking = null;
}

var mobileTimerInterval = null;

function getCountdownStr(endTimeStr) {
    if (!endTimeStr || endTimeStr === "--:--") return { timeStr: "--:--", label: "...", style: "bg-gray-400" };

    const now = new Date();
    const parts = endTimeStr.split(':');
    const end = new Date();
    end.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);

    let diff = end - now;
    let label = "CÒN LẠI";
    let style = "bg-white/20 text-white";

    if (diff < 0) {
        diff = Math.abs(diff);
        label = "QUÁ GIỜ";
        style = "bg-red-500 text-white animate-pulse border border-white/30";
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    return { timeStr, label, style };
}

function renderDetailContentMobile(b) {
    if (mobileTimerInterval) clearInterval(mobileTimerInterval);
    window.currentMobileBooking = b;

    const container = document.getElementById('mob-bed-detail-content');
    const actionContainer = document.getElementById('mob-detail-actions');

    const isWaiting = !b.bedId || b.bedId == "WAITING";
    const isDone = b.status === 'đã xong';
    const isCancelled = b.status === 'đã hủy';
    const isActive = (b.status === 'active' || (b.status && b.status.includes('active')) || (b.status && b.status.includes('đang dùng')));
    const hasPreorder = _hasActivePreorder(b) || (b.preorder && b.preorder.status === 'loaded');

    const countdown = isActive ? getCountdownStr(b.end) : null;

    // --- Status badge ---
    let statusBg, statusLabel;
    if (isCancelled)    { statusBg = 'bg-red-100 text-red-600 border border-red-200';           statusLabel = 'Đã hủy'; }
    else if (isDone)    { statusBg = 'bg-gray-100 text-gray-500 border border-gray-200';         statusLabel = 'Đã xong'; }
    else if (isActive)  { statusBg = 'bg-emerald-100 text-emerald-700 border border-emerald-200'; statusLabel = 'Đang dùng'; }
    else if (isWaiting) { statusBg = 'bg-amber-100 text-amber-700 border border-amber-200';      statusLabel = 'Chờ xếp bed'; }
    else                { statusBg = 'bg-blue-100 text-blue-600 border border-blue-200';          statusLabel = 'Đã đặt'; }

    const bedLabel = isWaiting ? 'WAITING' : `Bed 0${b.bedId}`;

    container.innerHTML = `
    <!-- Header info block -->
    <div class="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100">
        <div class="flex items-start justify-between mb-4">
            <div class="flex-1 min-w-0">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Khách hàng</p>
                <h2 class="text-2xl font-black text-[#1e3932] truncate">${b.name || 'Khách'}</h2>
                <p class="text-sm font-bold text-gray-500 mt-0.5">${b.phone || '--'}</p>
            </div>
            <div class="flex flex-col items-end gap-2 shrink-0 ml-3">
                <span class="text-lg font-black text-[#006241]">${bedLabel}</span>
                <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${statusBg}">${statusLabel}</span>
            </div>
        </div>

        <!-- Giờ bắt đầu / kết thúc -->
        <div class="flex items-center justify-between bg-gray-50 rounded-[1.2rem] px-5 py-3">
            <div class="text-center">
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Bắt đầu</p>
                <p class="text-2xl font-black text-gray-800 tracking-tight">${b.start}</p>
            </div>
            <span class="material-symbols-outlined text-gray-300 text-2xl">arrow_forward</span>
            <div class="text-center">
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">${isDone ? 'Thực tế trả' : 'Kết thúc'}</p>
                <p class="text-2xl font-black ${isDone ? 'text-rose-600' : 'text-gray-800'} tracking-tight">${isDone ? (b.realEndTime || b.end) : b.end}</p>
            </div>
        </div>

        ${isActive ? `
        <!-- Timer đếm ngược -->
        <div class="mt-3 flex items-center justify-between px-1">
            <div id="mob-live-badge" class="${countdown.style} px-3 py-1 rounded-full text-[11px] font-black">${countdown.label}</div>
            <div id="mob-live-timer" class="timer-font text-3xl font-black text-[#006241] tracking-tight">${countdown.timeStr}</div>
        </div>` : ''}
    </div>

    <!-- Info grid: Đi cùng + Tags -->
    <div class="grid grid-cols-2 gap-3">
        <div class="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100">
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Đi cùng</p>
            <p class="text-[14px] font-black text-gray-800 truncate">${b.compName || '--'}</p>
            <p class="text-[11px] text-gray-400 font-bold mt-0.5">${b.compPhone || ''}</p>
        </div>
        <div class="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100">
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Ngày đặt</p>
            <p class="text-[13px] font-black text-gray-800">${b.date || b.displayDate || b.bookingDate || '--'}</p>
            <p class="text-[11px] text-gray-400 mt-1">${b.source === 'app_index' ? '📱 App' : '🖥️ POS'}</p>
        </div>
    </div>

    <!-- Tags: preorder, preferredBed -->
    ${(hasPreorder || b.preferredBed || b.bookingBonus) ? `
    <div class="flex flex-wrap gap-2">
        ${hasPreorder ? `<span class="text-[11px] font-black px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">🍜 Pre-order</span>` : ''}
        ${b.preferredBed ? `<span class="text-[11px] font-black px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">⭐ Bed 0${b.preferredBed}</span>` : ''}
        ${b.bookingBonus ? `<span class="text-[11px] font-black px-3 py-1.5 rounded-full bg-green-100 text-green-800 border border-green-200">🎁 Bonus</span>` : ''}
    </div>` : ''}

    <!-- Chi tiêu tạm tính -->
    <div class="bg-white rounded-[1.5rem] px-5 py-4 shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Chi tiêu tạm tính</p>
            <span id="mob-detail-total-display" class="text-2xl font-black text-[#006241] tracking-tight">...</span>
        </div>
        <button onclick="showBillModal('${b.id}')" class="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-[#006241] active:scale-90 transition-transform cursor-pointer">
            <span class="material-symbols-outlined text-[20px]">receipt_long</span>
        </button>
    </div>

    <!-- Nút copy + cảnh báo (active) -->
    ${isActive ? `
    <div class="flex gap-3">
        <button onclick="copyBedNotification('${b.end}')"
            class="flex-1 h-11 bg-white border border-gray-200 rounded-[1rem] flex items-center justify-center gap-2 text-gray-600 text-[12px] font-black uppercase active:scale-95 transition-transform shadow-sm">
            <span class="material-symbols-outlined text-[17px]">content_copy</span>
            Copy TB
        </button>
        <button onclick="sendWarning(this)" data-id="${b.id}" data-name="${b.name||'Khách hàng'}"
            class="warn-mob-btn relative flex-1 h-11 bg-amber-50 border border-amber-200 rounded-[1rem] flex items-center justify-center gap-2 text-amber-700 text-[12px] font-black uppercase active:scale-95 transition-transform shadow-sm">
            <span class="material-symbols-outlined text-[17px]">warning</span>
            Cảnh báo
            <span class="warn-mob-badge hidden absolute -top-1 -right-1 text-[9px] font-black text-white rounded-full w-4 h-4 flex items-center justify-center bg-red-500"></span>
        </button>
    </div>` : ''}

    <!-- Phí vệ sinh (done only, chưa tính) -->
    ${(isDone && !isCancelled && !b.hasPenalty) ? `
    <div class="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-3">
            <span class="text-[13px] font-black text-gray-800">Phí vệ sinh</span>
            <span class="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">Nợ sau</span>
        </div>
        <div class="flex gap-2">
            <button onclick="submitCleaningFee(20000)" class="high-gloss-button flex-1 py-3 rounded-full text-[13px] font-bold text-slate-900">20K</button>
            <button onclick="submitCleaningFee(30000)" class="high-gloss-button flex-1 py-3 rounded-full text-[13px] font-bold text-slate-900">30K</button>
            <button onclick="submitCleaningFee(50000)" class="high-gloss-button flex-1 py-3 rounded-full text-[13px] font-bold text-slate-900">50K</button>
        </div>
    </div>` : ''}
    ${(isDone && b.hasPenalty && b.penaltyAmount > 0) ? `
    <div class="bg-red-50 rounded-[1.5rem] p-5 border border-red-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                <span class="material-symbols-outlined text-red-500 text-[18px]">cleaning_services</span>
            </div>
            <span class="text-[13px] font-black text-red-700">Đã tính phí vệ sinh</span>
        </div>
        <span class="text-[15px] font-black text-red-600">${Number(b.penaltyAmount).toLocaleString()}đ</span>
    </div>` : ''}
    `;

    // --- Action buttons ---
    let btnHtml = '';
    const orderStyle = _hasActivePreorder(b)
        ? 'background:linear-gradient(135deg,#b45309,#d97706);color:white;border:none;'
        : 'background:white;border:2px solid #006241;color:#006241;';
    const orderLabel = _hasActivePreorder(b)
        ? '🍜 Pre-order (' + _countPreorderQty(b.preorder) + ')'
        : '☕ Gọi Món';

    if (isCancelled || isDone) {
        btnHtml = `
        <div class="p-4 pb-6">
            <button onclick="closeMobileBedDetail()" class="w-full h-14 bg-gray-100 text-gray-500 rounded-[1.5rem] font-black text-[14px] uppercase active:scale-95 transition-transform">Đóng</button>
        </div>`;
    } else if (isWaiting) {
        btnHtml = `
        <div class="p-4 pb-6 space-y-3">
            <div class="flex gap-3">
                <button onclick="openExtendModal(window.currentMobileBooking, null)"
                    class="flex-1 h-12 bg-white border-2 border-[#006241]/30 text-[#006241] rounded-[1.2rem] font-black text-[12px] uppercase active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-sm">
                    <span class="material-symbols-outlined text-[17px]">more_time</span> Gia hạn
                </button>
                <button onclick="if(window.currentMobileBooking){var b=window.currentMobileBooking;document.getElementById('modal-cancel-reason').classList.remove('hidden');window.pendingCancelId=b.id;}"
                    class="flex-1 h-12 bg-white border-2 border-red-200 text-red-500 rounded-[1.2rem] font-black text-[12px] uppercase active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-sm">
                    <span class="material-symbols-outlined text-[17px]">cancel</span> Hủy
                </button>
            </div>
            <div class="flex gap-3">
                <button onclick="handleMobileBedOrder('${b.id}')"
                    class="flex-1 h-14 rounded-[1.5rem] font-black text-[14px] active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm"
                    style="${orderStyle}">${orderLabel}
                </button>
                <button onclick="pendingBedOrder=window.currentMobileBooking; renderBedSelection(); document.getElementById('bed-select-modal').classList.remove('hidden');"
                    class="flex-1 h-14 bg-[#006241] rounded-[1.5rem] text-white font-black text-[14px] shadow-lg shadow-[#006241]/20 active:scale-95 transition-transform uppercase">
                    🛏️ Xếp Bed
                </button>
            </div>
        </div>`;
    } else if (isActive) {
        btnHtml = `
        <div class="p-4 pb-6 space-y-3">
            <div class="flex gap-3">
                <button onclick="openExtendModal(window.currentMobileBooking, null)"
                    class="flex-1 h-12 bg-white border-2 border-[#006241]/30 text-[#006241] rounded-[1.2rem] font-black text-[12px] uppercase active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-sm">
                    <span class="material-symbols-outlined text-[17px]">more_time</span> Gia hạn
                </button>
                <button onclick="openMoveBedModal('${b.id}')"
                    class="flex-1 h-12 bg-white border-2 border-amber-200 text-amber-600 rounded-[1.2rem] font-black text-[12px] uppercase active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-sm">
                    <span class="material-symbols-outlined text-[17px]">sync_alt</span> Đổi Bed
                </button>
            </div>
            <div class="flex gap-3">
                <button onclick="handleMobileBedOrder('${b.id}')"
                    class="flex-1 h-14 rounded-[1.5rem] font-black text-[14px] active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm"
                    style="${orderStyle}">${orderLabel}
                </button>
                <button onclick="handleBedCheckout(window.currentMobileBooking)"
                    class="flex-1 h-14 bg-[#006241] rounded-[1.5rem] text-white font-black text-[14px] shadow-lg shadow-[#006241]/20 active:scale-95 transition-transform uppercase">
                    🏁 Trả Bed
                </button>
            </div>
        </div>`;
    }
    actionContainer.innerHTML = btnHtml;

    // --- Tính chi tiêu ---
    const priceEl = document.getElementById('mob-detail-total-display');
    if (priceEl && b.phone) {
        let savedTotal = b.totalSpend ? Number(b.totalSpend) : null;
        if (isDone && savedTotal !== null) {
            priceEl.innerText = savedTotal.toLocaleString() + 'đ';
        } else {
            let timeEndForCalc = isDone ? (b.realEndTime || b.end) : b.end;
            calculateSessionSpend(b.phone, b.start, timeEndForCalc).then(total => {
                if (priceEl) {
                    priceEl.innerText = total.toLocaleString() + 'đ';
                    priceEl.classList.add('animate-pulse');
                    setTimeout(() => priceEl.classList.remove('animate-pulse'), 500);
                }
            });
        }
    }

    // --- Timer ---
    if (isActive) {
        mobileTimerInterval = setInterval(() => {
            const c = getCountdownStr(b.end);
            const tEl = document.getElementById('mob-live-timer');
            const bEl = document.getElementById('mob-live-badge');
            if (tEl) tEl.innerText = c.timeStr;
            if (bEl) { bEl.innerText = c.label; bEl.className = `${c.style} px-3 py-1 rounded-full text-[11px] font-black`; }
        }, 1000);
    }
}

function closeMobileBedDetail() {
    if (mobileTimerInterval) clearInterval(mobileTimerInterval);
    document.getElementById('mob-bed-detail-screen').classList.add('translate-x-full');
    window.currentMobileBooking = null;
}
let currentRevMode = 'day';

