function openBedManager() {
    document.getElementById('loading-overlay').style.display = 'flex';
    switchView('bed');

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayInputFormat = `${yyyy}-${mm}-${dd}`;

    const picker = document.getElementById('date-picker-btn');
    if(picker) picker.value = todayInputFormat;

    db.ref('bedBookings/' + yyyy + '/' + mm + '/' + dd).on('value', snap => {
        // Load ngày được chọn. globalAllBookings sẽ được build từ multi-day load khi changeBedDate gọi
        _loadBedBookingsForDays([todayInputFormat], function(bookings) {
            globalAllBookings = bookings;
            document.getElementById('loading-overlay').style.display = 'none';
            changeBedDate(picker ? picker.value : todayInputFormat);
        });
    });
}

function changeBedDate(dateInputValue) {
    if (!dateInputValue) return;

    const parts = dateInputValue.split('-');
    const targetDateStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    currentFilterDateStr = targetDateStr;

    _loadBedBookingsForDays([dateInputValue], function(bookings) {
        // Merge vào globalAllBookings (replace entries của ngày này)
        globalAllBookings = globalAllBookings.filter(b => b.displayDate !== targetDateStr);
        globalAllBookings = globalAllBookings.concat(bookings);

        const isToday = (targetDateStr === new Date().toLocaleDateString('en-GB'));
        currentBedList = bookings.filter(b => {
            if (isToday) return b.displayDate === targetDateStr || (b.status && b.status.includes('active'));
            return b.displayDate === targetDateStr;
        });
        renderBedBookings(currentBedList);
    });
}
function renderBedBookings(list) {
    const now = new Date();
    const AUTO_CANCEL_MINUTES = 50;
    const todayStr = now.toLocaleDateString('en-GB');

    if (list && list.length > 0) {
        list.forEach(booking => {
            if (booking.status === 'chờ khách' || !booking.status) {

                if (!booking.displayDate || booking.displayDate === todayStr) {

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

                                booking.status = 'đã hủy';
                                booking.cancelType = 'auto_timeout';
                            }
                        }
                    }
                }
            }
        });
    }

    selectedBedIndex = -1;

    document.getElementById('detail-empty-state')?.classList.remove('hidden');

    document.getElementById('detail-content-panel')?.classList.add('hidden');

    stopPanelCountdown();

    renderLeftColumnList();
    renderRightColumnMap();
}
function renderLeftColumnList() {
    var container = document.getElementById('col-left-list');
    if (!container) return;

    if (!currentBedList || currentBedList.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-300 text-[10px] py-10 font-bold uppercase tracking-widest">Không có lịch</div>';
        return;
    }
const sortedPCList = [...currentBedList].map((item, idx) => ({...item, originalIndex: idx}))
   .sort((a, b) => {
    const getP = (i) => {
        const s = String(i.status || "").toLowerCase();
        const isCancelled = s.includes('đã hủy');
        const isDone = s.includes('đã xong');
        const isActive = s.includes('active') || s.includes('đang dùng');
        const isWaiting = (!i.bedId || i.bedId == "WAITING") && !isCancelled && !isDone;

        if (isCancelled) return 4;
        if (isActive) return 1;
        if (isWaiting) return 2;
        if (isDone) return 3;
        return 5;
    };
    return getP(a) - getP(b);
});
    container.innerHTML = sortedPCList.map(function(b, index) {
        var isDone = (b.status && b.status.includes('đã xong'));
        var isCancelled = (b.status && b.status.includes('đã hủy'));
        var isActive = (b.status && (b.status.includes('active') || b.status.includes('đang dùng')));
        var isSelected = (b.originalIndex === selectedBedIndex);

        var wrapperClass = "cursor-pointer p-4 rounded-[32px] transition-all duration-200 mb-3 border relative group ";
        var statusTextUI = "";

        if (isSelected) {
            wrapperClass += "bg-[#006241] border-[#006241] text-white shadow-lg scale-[1.02] z-10";
        } else if (isCancelled) {
            if (b.cancelType === 'auto_timeout') {
                wrapperClass += "bg-red-50 border-red-100 text-red-900";
                statusTextUI = "AUTO TIMEOUT";
            } else {
                wrapperClass += "bg-red-50 border-red-100 text-red-800 opacity-70 grayscale-[0.5]";
                statusTextUI = "ĐÃ HỦY";
            }
        } else if (isDone) {
            wrapperClass += "bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200";
        } else if (isActive) {
            wrapperClass += "bg-[#E6F4F1] border-[#bce3db] text-[#006241] shadow-sm";
        } else {
            wrapperClass += "bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:shadow-md hover:border-gray-200";
        }

        var statusDot = "";
        if (isCancelled) statusDot = "bg-red-500";
        else if (isDone) statusDot = "bg-gray-400";
        else if (isActive) statusDot = "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]";
        else statusDot = "bg-amber-400";

        var timeDisplay = `${b.start} - ${b.end}`;
        if (isCancelled) {
            timeDisplay = (b.cancelType === 'auto_timeout') ? "QUÁ GIỜ (HỦY)" : "ĐÃ HỦY LỊCH";
        } else if (isDone && b.realEndTime) {
            timeDisplay = `Check-out: ${b.realEndTime}`;
        }

        var bedLabel = isCancelled ? "Đã Hủy" : ((b.bedId && b.bedId != "WAITING") ? `BED 0${b.bedId}` : "Chờ Xếp");

        return `
        <div onclick="selectBedItem(${b.originalIndex})" class="${wrapperClass}">
            <div class="flex justify-between items-center mb-1.5">
                <span class="font-black text-[10px] opacity-70 uppercase tracking-widest">${bedLabel}</span>
                <div class="w-2.5 h-2.5 rounded-full ${statusDot}"></div>
            </div>
            <div class="font-black text-sm truncate mb-1.5 leading-tight">${b.name}</div>
            <div class="text-[10px] font-mono flex justify-between opacity-80 font-bold items-center">
                <span>${timeDisplay}</span>
                ${b.totalSpend ? `<span class="bg-black/10 px-1.5 rounded text-[9px]">${Number(b.totalSpend).toLocaleString()}đ</span>` : ''}
            </div>
            ${(b.preorder && (_hasActivePreorder(b) || b.preorder.status === 'loaded'))
                ? `<div style="margin-top:6px;display:inline-flex;align-items:center;gap:4px;background:${isSelected?'rgba(255,255,255,0.2)':'#fef9c3'};border:1px solid ${isSelected?'rgba(255,255,255,0.3)':'#fde047'};border-radius:8px;padding:3px 8px;">
                    <span style="font-size:0.6rem;font-weight:900;color:${isSelected?'white':'#854d0e'};">🍜 Pre-order</span>
                  </div>`
                : ''
            }
            ${b.preferredBed
                ? `<div style="margin-top:4px;display:inline-flex;align-items:center;gap:4px;background:${isSelected?'rgba(255,255,255,0.2)':'#e0f2fe'};border:1px solid ${isSelected?'rgba(255,255,255,0.3)':'#7dd3fc'};border-radius:8px;padding:3px 8px;">
                    <span style="font-size:0.6rem;font-weight:900;color:${isSelected?'white':'#0369a1'};">⭐ Chọn: Bed 0${b.preferredBed}${b.preferBedFee>0?' · +'+b.preferBedFee.toLocaleString()+'đ':' · Miễn phí'}</span>
                  </div>`
                : ''
            }
        </div>`;
    }).join('');
}
function renderRightColumnMap() {
    var container = document.getElementById('vertical-map-container');
    if(!container) return;

    var parent = container.parentElement;
    if (parent && !parent.classList.contains('spatial-glass')) {
        parent.className = "flex-1 spatial-glass rounded-[2.5rem] p-5 flex flex-col overflow-hidden relative shadow-sm border border-white/60";
        var title = parent.querySelector('h3');
        if(title) {
            title.className = "text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 text-center";
            title.innerText = "LIVE STATUS";
        }
    }

    container.className = "flex-1 grid grid-cols-2 gap-3 overflow-y-auto hide-scroll content-start";

    var html = '';

    var mapOrder = [1, 3, 2, 4];

    mapOrder.forEach(i => {
        var booking = currentBedList.find(b =>
            b.bedId == i &&
            b.status &&
            (b.status.includes('active') || b.status.includes('đang dùng'))
        );

        var contentHTML = `<span class="text-4xl font-black text-gray-200 group-hover:text-gray-300 transition-colors">0${i}</span>`;
        var subText = "TRỐNG";
        var boxClass = "bg-white/40 border-2 border-dashed border-gray-200 hover:border-gray-300 hover:bg-white/60";
        var statusDot = "";

        if (booking) {
            boxClass = "bg-[#065F46] text-white shadow-xl shadow-emerald-900/20 border border-emerald-600/50 relative overflow-hidden";
            subText = "";

            var shortName = "KHÁCH";
            if (booking.name) {
                let parts = booking.name.trim().split(' ');
                shortName = parts.slice(Math.max(parts.length - 2, 0)).join(' ');
            }

            contentHTML = `
                <div class="flex flex-col items-center justify-center h-full z-10 w-full px-1 pt-2">
                    <span class="text-[10px] font-bold opacity-60 mb-0.5 tracking-widest">BED 0${i}</span>
                    <span class="text-sm font-black text-center uppercase leading-tight break-words line-clamp-2 w-full px-1">
                        ${shortName}
                    </span>
                </div>
            `;

            statusDot = `
                <div class="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-[#065F46]"></span>
                </div>`;
        }

        html += `
        <div onclick="selectBedFromMap(${i})"
             class="${boxClass} aspect-square rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 active:scale-95 group relative">

            ${statusDot}
            ${contentHTML}

            ${!booking ? `<span class="text-[9px] font-black uppercase tracking-widest mt-1 text-gray-400 group-hover:text-gray-500">${subText}</span>` : ''}
        </div>`;
    });

    container.innerHTML = html;
}
function selectBedFromMap(bedId) {
    var index = currentBedList.findIndex(b => b.bedId == bedId && b.status && !b.status.includes('đã xong') && !b.status.includes('đã hủy'));
    if (index !== -1) {
        selectBedItem(index);
        var listItem = document.getElementById('col-left-list').children[index];
        if(listItem) listItem.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
}
let onConfirmAction = null;

function showIOSConfirm(message, callback) {
    document.getElementById('ios-modal-message').innerText = message;

    onConfirmAction = callback;

    const btnOk = document.getElementById('ios-confirm-btn');
    btnOk.onclick = function() {
        if (onConfirmAction) onConfirmAction();
        closeIOSModal();
    };

    const modal = document.getElementById('ios-confirm-modal');
    modal.classList.remove('hidden');
    modal.classList.add('animate-fade-in');
}

function closeIOSModal() {
    document.getElementById('ios-confirm-modal').classList.add('hidden');
    onConfirmAction = null;
}

function selectBedItem(index) {
    selectedBedIndex = index;
    renderLeftColumnList();

    var data = currentBedList[index];
    var panel = document.getElementById('detail-content-panel');
    var empty = document.getElementById('detail-empty-state');

    if(empty) empty.classList.add('hidden');
    if(panel) {
        panel.classList.remove('hidden');
        panel.className = "flex flex-col h-full bg-[#F2F4F7] relative overflow-hidden rounded-[2.5rem]";
    }

    var isDone = (data.status && data.status.includes('đã xong'));
    var isCancelled = (data.status && data.status.includes('đã hủy'));
    var isActive = (data.status && (
        data.status.includes('active') ||
        data.status.includes('đang dùng') ||
        data.status === 'active'
    ));
    var hasBed = (data.bedId && data.bedId != "WAITING");
    var bookingId = data.id || data.key;

    var hasPenalty = data.hasPenalty === true;
    var penaltyAmt = data.penaltyAmount || 0;

    let subTitleHTML = "";
    if (isCancelled) {
        let reason = "ĐÃ HỦY";
        if (data.cancelType === 'auto_timeout') reason = "AUTO HỦY (QUÁ GIỜ)";
        else if (data.cancelType === 'customer') reason = "KHÁCH BÁO HỦY";
        else if (data.cancelType === 'store') reason = "QUÁN HỦY (SYSTEM)";
        subTitleHTML = `<span class="text-xl font-black text-red-500 uppercase tracking-tight">${reason}</span>`;
    } else if (isDone) {
        subTitleHTML = `<span class="text-xl font-black text-gray-400 uppercase">BED 0${data.bedId} (ĐÃ TRẢ)</span>`;
    } else {
        subTitleHTML = `<span class="text-2xl font-black text-[#065F46]" id="detail-bed-name">${hasBed ? `BED 0${data.bedId}` : "CHỜ XẾP"}</span>`;
    }

    panel.innerHTML = `
    <div class="spatial-glass w-full h-full flex flex-col relative rounded-[2.5rem] overflow-hidden">

        <div class="px-8 pt-6 pb-2 shrink-0">
            <div class="flex items-start justify-between">
                <div class="flex-1 pr-4">
                    <h1 class="text-3xl md:text-4xl font-black tracking-tighter text-[#1e293b] leading-tight mb-1 line-clamp-2 overflow-hidden text-ellipsis" style="max-height: 5rem;">
                        ${data.name || "Khách lẻ"}
                    </h1>

                    <div class="flex items-center gap-2">
                        ${subTitleHTML}
                        <div id="detail-timer-box" class="hidden ml-4 px-3 py-1 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 animate-pulse">
                            <span class="material-symbols-outlined text-sm">timer</span>
                            <span id="detail-countdown" class="font-black font-mono text-lg tracking-tight">--:--</span>
                        </div>
                    </div>
                </div>

                <div id="detail-status-badge" class="px-5 py-2 rounded-2xl border transition-colors shrink-0">
                    <span class="font-black text-sm tracking-widest uppercase">WAITING</span>
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto px-8 pb-4 hide-scroll space-y-4">

            <div class="grid grid-cols-2 gap-4">
                <div class="p-4 glass-card-inner rounded-[2rem] flex flex-col justify-center">
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">LIÊN HỆ</p>
                    <h4 class="text-xl font-black text-slate-800 truncate">${data.phone || "--"}</h4>
                    <div class="flex items-center gap-1 text-emerald-600">
                        <span class="material-symbols-outlined text-xs">verified</span>
                        <span class="text-[10px] font-bold">Khách hàng</span>
                    </div>
                </div>

                <div class="p-4 glass-card-inner rounded-[2rem] flex flex-col justify-center">
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">ĐI CÙNG</p>
                    <h4 class="text-xl font-black text-slate-800 truncate">${data.compName || "---"}</h4>
                    <p class="text-xs font-bold text-gray-500">${data.compPhone || "--"}</p>
                </div>
            </div>

            <div class="p-4 bg-white/60 border border-white/40 rounded-[2rem] flex items-center justify-around shadow-sm">
                <div class="text-center">
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">BẮT ĐẦU</p>
                    <span class="text-3xl font-black text-slate-800 tracking-tighter">${data.start}</span>
                </div>
                <div class="text-gray-300">
                    <span class="material-symbols-outlined text-3xl font-light">arrow_forward</span>
                </div>
                <div class="text-center">
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">KẾT THÚC</p>
                    <span class="text-3xl font-black text-slate-800 tracking-tighter">${data.end}</span>
                </div>
            </div>

            <div id="row-checkout-time" class="hidden text-center bg-gray-100/50 rounded-2xl p-2 border border-gray-200/50">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thực tế check-out lúc</span>
                <div class="font-black text-slate-800 text-2xl tracking-tight" id="detail-real-end">--:--</div>
            </div>

            <div id="done-session-info" class="hidden space-y-3"></div>

            <div id="wrapper-btn-cancel" class="hidden pt-2">
                <button id="btn-action-cancel" class="w-full py-3 rounded-2xl border-2 border-dashed border-red-200 text-red-400 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-50 transition-all">
                    HỦY LỊCH NÀY
                </button>
            </div>
        </div>

        <div id="detail-action-buttons" class="px-6 pb-6 pt-2">
            <div class="bg-white/90 backdrop-blur-xl p-3 rounded-[2rem] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] border border-white flex items-center gap-3">
                <button id="btn-action-order" class="flex-1 h-14 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[2rem] font-black text-sm uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-inner">
                    <span class="material-symbols-outlined">restaurant</span>
                    Gọi Món
                </button>
                <button id="btn-action-checkout" class="flex-1 h-14 bg-[#065F46] hover:bg-[#044e39] text-white rounded-[2rem] font-black text-sm uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
                    <span class="material-symbols-outlined">meeting_room</span>
                    Xếp Bed Ngay
                </button>
            </div>
        </div>

    </div>
    `;

    var badge = document.getElementById('detail-status-badge');
    var badgeContent = badge.querySelector('span');

    if (isDone) {
        badge.className = "px-5 py-2 rounded-2xl border border-gray-200 bg-gray-100 text-gray-500";
        badgeContent.innerText = "ĐÃ XONG";
    } else if (isCancelled) {
        badge.className = "px-5 py-2 rounded-2xl border border-red-200 bg-red-50 text-red-500";
        badgeContent.innerText = "ĐÃ HỦY";
    } else if (isActive) {
        badge.className = "px-5 py-2 rounded-2xl border border-emerald-200 bg-emerald-50 text-[#065F46] shadow-sm";
        badgeContent.innerText = "ACTIVE";
    } else {
        badge.className = "px-5 py-2 rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-sm";
        badgeContent.innerText = "CHỜ KHÁCH";
    }

    var timerBox = document.getElementById('detail-timer-box');
    if (isActive) {
        if(timerBox) timerBox.classList.remove('hidden');
        startPanelCountdown(data.end);
    } else {
        if(timerBox) timerBox.classList.add('hidden');
        stopPanelCountdown();
    }

    var rowCheckout = document.getElementById('row-checkout-time');
    var actionBtns = document.getElementById('detail-action-buttons');
    var wrapperCancel = document.getElementById('wrapper-btn-cancel');

    if (isDone || isCancelled) {
        if(rowCheckout) {
            rowCheckout.classList.remove('hidden');
            let timeText = isCancelled ? (data.note || "Đã hủy") : (data.realEndTime || "--:--");
            document.getElementById('detail-real-end').innerText = timeText;
        }
        if(actionBtns) actionBtns.classList.add('hidden');
        if(wrapperCancel) wrapperCancel.classList.add('hidden');

        if (isDone && !isCancelled) {
            let savedTotal = data.totalSpend ? Number(data.totalSpend) : null;
            if (savedTotal !== null) {
                renderDoneSessionInfo(savedTotal, hasPenalty, penaltyAmt, data.phone, bookingId);
            } else if (data.phone) {
                calculateSessionSpend(data.phone, data.start, data.realEndTime).then(total => {
                    renderDoneSessionInfo(total, hasPenalty, penaltyAmt, data.phone, bookingId);
                });
            }
        }
    } else {
        var oldInfo = document.getElementById('done-session-info');
        if(oldInfo) oldInfo.classList.add('hidden');
        if(rowCheckout) rowCheckout.classList.add('hidden');
        if(actionBtns) actionBtns.classList.remove('hidden');

    if(isActive) {
        window.currentPcBooking = data;

        if (wrapperCancel) {
            wrapperCancel.classList.remove('hidden');
            wrapperCancel.innerHTML = `
                <div class="flex gap-2 mt-3">
                    <button onclick="openMoveBedModal('${bookingId}')"
                        class="flex-1 h-14 rounded-[32px] bg-white border-2 border-amber-100 text-amber-600 font-black uppercase tracking-[0.15em] text-[12px] shadow-[0_4px_10px_rgba(251,191,36,0.1)] hover:border-amber-300 hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 group">
                        <span class="material-symbols-outlined text-[18px] group-hover:rotate-180 transition-transform duration-500">sync_alt</span>
                        Đổi Bed
                    </button>
                    <button onclick="openExtendModal(window.currentPcBooking, null)"
                        class="flex-1 h-14 rounded-[32px] bg-white border-2 border-[#006241]/30 text-[#006241] font-black uppercase tracking-[0.15em] text-[12px] shadow-[0_4px_10px_rgba(0,98,65,0.08)] hover:border-[#006241]/50 hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 group">
                        <span class="material-symbols-outlined text-[18px]">more_time</span>
                        Gia Hạn
                    </button>
                </div>
            `;
        }
    }
    else {
        window.currentPcBooking = data;
        if(wrapperCancel) {
            wrapperCancel.classList.remove('hidden');
            wrapperCancel.innerHTML = `
                <div class="flex gap-2 mt-1">
                    <button id="btn-action-cancel"
                        class="flex-1 h-13 py-3 rounded-[20px] border-2 border-dashed border-red-200 text-red-400 font-black uppercase tracking-[0.15em] text-[11px] hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-1.5">
                        <span class="material-symbols-outlined text-[16px]">cancel</span>
                        Hủy Lịch
                    </button>
                    <button id="btn-action-extend"
                        class="flex-1 h-13 py-3 rounded-[20px] border-2 border-[#006241]/30 text-[#006241] font-black uppercase tracking-[0.15em] text-[11px] bg-white hover:border-[#006241]/60 hover:bg-green-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm">
                        <span class="material-symbols-outlined text-[16px]">more_time</span>
                        Gia Hạn
                    </button>
                </div>
            `;
            document.getElementById('btn-action-cancel').onclick = function() {
                window.pendingCancelId = bookingId;
                document.getElementById('modal-cancel-reason').classList.remove('hidden');
            };
            document.getElementById('btn-action-extend').onclick = function() {
                openExtendModal(window.currentPcBooking, null);
            };
        }
    }

        (function() {
            var warnPhone = data.phone ? normalizePhone(data.phone) : null;
            var warnKey = warnPhone || bookingId;
            firebase.database().ref('bedWarnings/' + warnKey + '/' + bookingId).once('value').then(function(snap) {
                var count = (snap.val() && snap.val().count) ? snap.val().count : 0;
                if (count > 0) {
                    var color = count >= 3 ? '#dc2626' : count === 2 ? '#f97316' : '#f59e0b';
                    document.querySelectorAll('.warn-badge-pc, .warn-mob-badge').forEach(function(b) {
                        b.textContent = count;
                        b.style.display = 'flex';
                        b.classList.remove('hidden');
                        b.style.backgroundColor = color;
                    });
                }
            });
        })();

        if (data.phone) {
             calculateSessionSpend(data.phone, data.start, data.end).then(total => {
                var infoDiv = document.getElementById('done-session-info');
                if (infoDiv) {
                    infoDiv.innerHTML = `
                    <div class="bg-white border border-emerald-100 rounded-[2rem] p-4 shadow-sm relative overflow-hidden group">
                        <div class="flex justify-between items-center mb-2">
                            <div>
                                <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">CHI TIÊU TẠM TÍNH</p>
                                <div class="flex items-baseline gap-1">
                                    <span class="text-3xl font-black tracking-tight text-[#065F46]">${total.toLocaleString()}</span>
                                    <span class="text-xs font-bold opacity-60 text-[#065F46]">VNĐ</span>
                                </div>
                            </div>
                            <div class="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-[#065F46] cursor-pointer active:scale-90 transition-transform" onclick="showBillModal('${bookingId}')" title="Xem hoá đơn">
                                <span class="material-symbols-outlined">receipt_long</span>
                            </div>
                        </div>

                        <div class="border-t border-dashed border-emerald-100 pt-2 flex justify-center gap-2">
                            <button onclick="copyBedNotification('${data.end}')"
                                class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 transition-all active:scale-95">
                                <span class="material-symbols-outlined text-[16px]">content_copy</span>
                                <span class="text-[10px] font-bold uppercase">Copy Thông báo kết thúc</span>
                            </button>
                            <button onclick="sendWarning(this)" data-id="${bookingId}" data-name="${data.name||'Khách hàng'}"
                                id="warn-btn-pc-${bookingId}"
                                class="warn-btn relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 transition-all active:scale-95">
                                <span class="material-symbols-outlined text-[16px]">warning</span>
                                <span class="text-[10px] font-bold uppercase">Cảnh báo</span>
                                <span class="warn-badge-pc hidden absolute -top-1.5 -right-1.5 text-[9px] font-black text-white rounded-full w-4 h-4 flex items-center justify-center bg-red-500"></span>
                            </button>
                        </div>
                    </div>`;
                    infoDiv.classList.remove('hidden');
                }
             });
        }

        setupActionButtons(bookingId, data, hasBed,
            document.getElementById('btn-action-order'),
            document.getElementById('btn-action-checkout'),
            document.getElementById('btn-action-cancel')
        );
    }
}

function renderDoneSessionInfo(total, hasPenalty, penaltyAmt, phone, bookingId) {
    var infoDiv = document.getElementById('done-session-info');
    if (!infoDiv) return;

    var totalHTML = `
    <div class="bg-gradient-to-br from-[#065F46] to-[#044e39] rounded-[2rem] p-6 text-white shadow-lg relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-20"><span class="material-symbols-outlined text-6xl">payments</span></div>
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">TỔNG CHI TIÊU</p>
        <div class="flex items-baseline gap-1">
            <span class="text-4xl font-black tracking-tight">${total.toLocaleString()}</span>
            <span class="text-sm font-bold opacity-80">VNĐ</span>
        </div>
    </div>`;

    var penaltyHTML = '';
    if (hasPenalty) {
        penaltyHTML = `
        <div class="bg-red-50 rounded-[2rem] p-6 border border-red-100 flex flex-col gap-4 relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-20 h-20 bg-red-200 rounded-full opacity-30"></div>
            <div class="flex items-center gap-4 relative z-10">
                <div class="w-12 h-12 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center shadow-sm">
                    <span class="material-symbols-outlined text-2xl">warning</span>
                </div>
                <div>
                    <p class="text-[10px] font-black text-red-400 uppercase tracking-widest">ĐÃ PHẠT VỆ SINH</p>
                    <p class="text-2xl font-black text-red-600">${penaltyAmt.toLocaleString()}đ</p>
                </div>
            </div>
            <div class="flex gap-3 relative z-10">
                <button onclick="openCleaningModal('${phone}', '${bookingId}')" class="flex-1 py-3 bg-white border border-red-200 text-red-500 rounded-xl font-bold text-xs uppercase shadow-sm hover:bg-red-50 transition-all">Sửa</button>
                <button onclick="deletePenalty('${phone}', '${bookingId}')" class="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-red-200 hover:bg-red-600 transition-all">Xóa</button>
            </div>
        </div>`;
    } else {
        penaltyHTML = `
        <div onclick="openCleaningModal('${phone}', '${bookingId}')" class="group bg-white rounded-[2rem] p-5 border-2 border-dashed border-gray-200 hover:border-red-200 cursor-pointer transition-all flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gray-100 group-hover:bg-red-100 text-gray-400 group-hover:text-red-500 rounded-2xl flex items-center justify-center transition-colors">
                    <span class="material-symbols-outlined">cleaning_services</span>
                </div>
                <div>
                    <h4 class="font-black text-gray-600 group-hover:text-red-500 uppercase text-sm transition-colors">Thêm phí vệ sinh</h4>
                    <p class="text-xs text-gray-400">Nếu khách làm bẩn nệm/sàn</p>
                </div>
            </div>
            <span class="material-symbols-outlined text-gray-300 group-hover:text-red-400">add_circle</span>
        </div>`;
    }

    infoDiv.innerHTML = totalHTML + penaltyHTML;
    infoDiv.classList.remove('hidden');
}
function setupActionButtons(bookingId, data, hasBed, btnOrder, btnCheckout, btnCancel) {
    if(btnCancel) {
        btnCancel.onclick = function() {
            window.pendingCancelId = bookingId;
            document.getElementById('modal-cancel-reason').classList.remove('hidden');
        };
    }
    if (btnOrder) {
        var hasPreorder = _hasActivePreorder(data);

        if (hasPreorder) {
            var poQty = _countPreorderQty(data.preorder);
            btnOrder.innerHTML = '<span style="display:flex;align-items:center;gap:5px;">🍜 Pre-order <span style="background:rgba(255,255,255,0.35);border-radius:6px;padding:1px 7px;font-size:0.72rem;">' + poQty + ' món</span></span>';
            btnOrder.style.background = 'linear-gradient(135deg,#b45309,#d97706)';
            btnOrder.style.color = 'white';
            btnOrder.onclick = function() {
                showPreorderModal(data, bookingId);
            };
        } else {
            btnOrder.innerHTML = "<span>☕ Gọi Món</span>";
            btnOrder.style.background = '';
            btnOrder.style.color = '';
            btnOrder.onclick = function() { showBedDetail(data.bedId); };
        }
    }
    if (btnCheckout) {
        if (!hasBed) {
            btnCheckout.innerHTML = '<span>🛏️ Xếp Bed Ngay</span>';
            btnCheckout.onclick = function() {
                pendingBedOrder = data;
                renderBedSelection();
                document.getElementById('bed-select-modal').classList.remove('hidden');
            };
        } else {
            btnCheckout.innerHTML = '<span>Trả Bed</span>';
            btnCheckout.onclick = function() { handleBedCheckout(data); };
        }
    }
}
function handleMobileBedOrder(bookingId) {
    const booking = globalAllBookings.find(b => b.id === bookingId);
    if (!booking) return;

    activeOrderingBedId = booking.bedId || "WAITING";
    pendingBedOrder = booking;

    // Nếu có pre-order chưa load → hiện modal xem trước, không vào menu thẳng
    if (_hasActivePreorder(booking)) {
        showPreorderModal(booking, bookingId);
        return;
    }

    var sdtInput = document.getElementById('kh-sdt');
    if (sdtInput && booking.phone) {
        sdtInput.value = booking.phone;
        if (typeof checkSdtLive === 'function') {
            checkSdtLive();
        }
    }

    autoAddBedItems(booking);

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
 function showBedDetail(bedId, forceBooking) {
    var booking = null;

    if (forceBooking) {
        booking = forceBooking;
    }
    else if (bedId && bedId != 0) {
        booking = currentBedList.find(b =>
            b.bedId == bedId &&
            b.status &&
            (b.status.includes('active') || b.status.includes('đang dùng'))
        );

        if (!booking) {
            booking = currentBedList.find(b => b.bedId == bedId);
        }
    }
    else if (!booking && selectedBedIndex > -1) {
        booking = currentBedList[selectedBedIndex];
    }

    if (!booking) return alert("Không tìm thấy dữ liệu khách hàng!");

    activeOrderingBedId = bedId;
    pendingBedOrder = booking;

    _doShowBedDetail(booking, bedId);
}

// Popup khuyến mãi đặc biệt từ slot gợi ý (bookingBonus)
function showBonusPopup(booking) {
    var bonus = (booking.bookingBonus || '').trim();
    if (!bonus) return;

    var hasBlanket = bonus.indexOf('chăn') !== -1 || bonus.indexOf('Free chăn') !== -1;
    var has5k      = bonus.indexOf('5k') !== -1 || bonus.indexOf('Giảm 5k') !== -1;

    var bonusLabel = bonus.replace(/✨\s*/g, '');

    // Build HTML mô tả khuyến mãi
    var details = '<ul style="text-align:left;margin:8px 0 0;padding:0 0 0 18px;font-size:13px;color:#1e3932;">';
    if (hasBlanket) details += '<li style="margin-bottom:4px;"><b>Chăn bed</b> miễn phí (thêm vào cart 0đ)</li>';
    if (has5k)      details += '<li><b>Giảm 5.000đ</b> tổng bill (tự động áp)</li>';
    details += '</ul>';

    var html = '<p style="font-size:13px;color:#374151;margin-bottom:6px;">Khách được hưởng:</p>'
             + '<div style="background:#f0fdf4;border:1.5px solid #6ee7b7;border-radius:12px;padding:10px 14px;margin-bottom:12px;">'
             + '<p style="font-weight:900;color:#006241;font-size:13px;margin:0 0 4px;">✨ ' + bonusLabel + '</p>'
             + details
             + '</div>'
             + '<div style="display:flex;gap:8px;margin-top:4px;">'
             + '<button onclick="closeAppModal()" '
             +   'style="flex:1;padding:12px;border:1.5px solid #e5e7eb;border-radius:12px;background:white;font-weight:700;font-size:12px;cursor:pointer;color:#6b7280;">Bỏ qua</button>'
             + '<button onclick="_applyBonusToCart(' + JSON.stringify({hasBlanket:hasBlanket,has5k:has5k}) + ');closeAppModal()" '
             +   'style="flex:2;padding:12px;border:none;border-radius:12px;background:linear-gradient(135deg,#006241,#005235);color:white;font-weight:900;font-size:12px;cursor:pointer;">Thêm vào cart</button>'
             + '</div>';

    showAppModal('🎁 Khuyến mãi đặc biệt', html, '');
}

// Áp dụng bonus vào cart
function _applyBonusToCart(opts) {
    if (opts.hasBlanket) {
        // Tìm item "Chăn bed" trong menu, add với giá 0đ
        var blanket = menu.find(function(m) { return m.name.toLowerCase() === 'chăn bed'; });
        if (blanket) {
            var ex = cart.find(function(c) { return c.name === blanket.name; });
            if (ex) ex.qty++;
            else cart.push({ name: blanket.name, size: 'M', price: 0, qty: 1 });
        }
    }
    if (opts.has5k) {
        // Thêm discount 5k vào cart dưới dạng item âm
        var ex5k = cart.find(function(c) { return c.name === 'Khuyến mãi đặc biệt'; });
        if (!ex5k) cart.push({ name: 'Khuyến mãi đặc biệt', size: 'M', price: -5000, qty: 1 });
    }
    renderCart();
    if (typeof showToast === 'function') showToast('🎁 Đã áp khuyến mãi vào cart!');
}

function _doShowBedDetail(booking, bedId) {
   if (booking.phone) {
        scanAndAddDebt(booking.phone);
    }

    var sdtInput = document.getElementById('kh-sdt');
    var statusLabel = document.getElementById('sdt-status');

    if (sdtInput) {
        sdtInput.value = "";
        if (statusLabel) statusLabel.innerText = "";

        if (booking.phone) {
            sdtInput.value = booking.phone;
            if (typeof checkSdtLive === 'function') checkSdtLive();
        }
    }

    if (typeof autoAddBedItems === 'function') autoAddBedItems(booking);

    // Hiện popup khuyến mãi nếu lịch có bookingBonus
    // Nếu có nợ → chờ nhân viên đóng modal nợ rồi mới hiện (tránh đè modal)
    if (booking.bookingBonus) {
        var phone = booking.phone;
        var key = typeof normalizePhone === 'function' ? normalizePhone(phone||'') : (phone||'');
        var cust = customerMap && customerMap[key];
        var hasDebt = cust && cust.pendingFee > 0;
        if (hasDebt) {
            _onModalClose = function() { showBonusPopup(booking); };
        } else {
            setTimeout(function() { showBonusPopup(booking); }, 400);
        }
    }

    // Preorder KHÔNG auto add vào cart ở đây nữa
    // Nhân viên bấm nút vàng "Pre-order" → showPreorderModal → xem xong mới confirm add

    if (booking) {
        const rawPhone = booking.phone || "";
        const maskedPhone = rawPhone.length > 4
            ? "******" + rawPhone.slice(-4)
            : "Khách lẻ";

        db.ref('session_display').set({
            state: 'bed_welcome',
            customerName: booking.name || "Quý Khách",
            maskedPhone: maskedPhone,
            startTime: booking.start || "--:--",
            endTime: booking.end || "--:--",
            bedId: booking.bedId,
            orderType: 'bed'
        });
    }

    switchView('menu');
    const sidebar = document.getElementById('sidebar-cart');
    if (sidebar) sidebar.classList.remove('hidden');

    var cartInfo = document.getElementById('cart-bed-info');
    var sidebarContainer = document.getElementById('sidebar-cart');

    if (!cartInfo && sidebarContainer) {
        cartInfo = document.createElement('div');
        cartInfo.id = 'cart-bed-info';
        sidebarContainer.insertBefore(cartInfo, sidebarContainer.firstChild);
    }

    if (cartInfo) {
        var guestName = booking.name || "Khách hàng";
        cartInfo.className = "p-3 mb-3 rounded-2xl text-center font-black uppercase text-[10px] tracking-widest animate-pulse border-2";

        if (booking.bedId && booking.bedId != 0 && booking.bedId != "WAITING") {
            cartInfo.innerText = `🟢 ĐANG ORDER: BED 0${booking.bedId} - ${guestName}`;
            cartInfo.classList.add('bg-green-50', 'text-[#006241]', 'border-[#006241]/20');
            cartInfo.classList.remove('bg-amber-50', 'text-[#d97706]', 'border-[#d97706]/20');
        } else {
            cartInfo.innerText = `🟠 ĐANG ORDER: KHÁCH CHỜ - ${guestName}`;
            cartInfo.classList.add('bg-amber-50', 'text-[#d97706]', 'border-[#d97706]/20');
            cartInfo.classList.remove('bg-green-50', 'text-[#006241]', 'border-[#006241]/20');
        }
    }

    const island = document.getElementById('bed-dynamic-island');
    if (island && booking) {
        document.getElementById('island-cust-name').innerText = booking.name || "Khách lẻ";
        document.getElementById('island-time-range').innerText = `${booking.start} - ${booking.end}`;
        document.getElementById('island-duration').innerText = getDurationLabel(booking.start, booking.end);
        island.classList.remove('hidden');
    }
}
function finalizeBedCheckIn(bedId) {
    if (!pendingBedOrder) return alert("Lỗi: Không tìm thấy thông tin khách hàng!");

    var bookingId = pendingBedOrder.id || pendingBedOrder.key;
    if (!bookingId) return alert("Lỗi dữ liệu: Không tìm thấy mã đơn hàng trên hệ thống.");

    const isBusy = currentBedList.find(b =>
        (b.status && (b.status.includes('active') || b.status.includes('đang dùng')))
        && b.bedId == bedId
    );
    if (isBusy) return alert("Bed 0" + bedId + " đang có khách rồi! Vui lòng chọn Bed khác.");

    var now = new Date();

    var partsStart = pendingBedOrder.start.split(':');
    var bookStart = new Date();
    bookStart.setHours(parseInt(partsStart[0]), parseInt(partsStart[1]), 0);

    var partsEnd = pendingBedOrder.end.split(':');
    var bookEnd = new Date();
    bookEnd.setHours(parseInt(partsEnd[0]), parseInt(partsEnd[1]), 0);

    var finalStartStr = now.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
    var finalEndStr = pendingBedOrder.end;

    if (now > bookStart) {
    }
    else {

        var diffMinutes = (bookStart - now) / 60000;

        var originalDurationMins = (bookEnd - bookStart) / 60000;

        // Nếu có pre-order → end đã bị cộng +5p bonus → trừ lại trước khi ceil
        // để originalBlocks phản ánh đúng số tiếng khách thực sự đặt
        var hasPreorder = pendingBedOrder.preorder && Object.keys(pendingBedOrder.preorder).length > 0;
        var originalDurationForBlock = hasPreorder ? originalDurationMins - 5 : originalDurationMins;
        var originalBlocks = Math.ceil(originalDurationForBlock / 60);

        // Thời gian thực tế nếu khách đến sớm — cũng trừ 5p để so sánh cùng đơn vị
        var newTotalMins = originalDurationMins + diffMinutes;
        var newTotalForBlock = hasPreorder ? newTotalMins - 5 : newTotalMins;
        var newBlocks = Math.ceil(newTotalForBlock / 60);

        if (newBlocks > originalBlocks) {
            var newEndDate = new Date(bookEnd.getTime() - (diffMinutes * 60000));
            finalEndStr = newEndDate.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
        } else {
        }
    }

    document.getElementById('bed-select-modal').classList.add('hidden');
    document.getElementById('loading-overlay').style.display = 'flex';

    _updateBedBooking(pendingBedOrder, {
        status: 'active',
        bedId: bedId,
        checkInTime: finalStartStr,
        start: finalStartStr,
        end: finalEndStr
    }, (err) => {
        document.getElementById('loading-overlay').style.display = 'none';

        if (!err) {
            syncToCustomerDisplay('success', {
                orderType: 'bed',
                bedId: bedId,
                endTime: finalEndStr,
                customerName: pendingBedOrder.name
            });

            setTimeout(() => {
                syncToCustomerDisplay('idle');
            }, 8000);

            resetOrderingMode(true);

            openBedManager();
            showAppModal("Thành công", `Đã xếp Bed 0${bedId}.<br>Khách phải trả Bed lúc: <b>${finalEndStr}</b>`, "✅");
        } else {
            alert("Lỗi Firebase: " + err.message);
        }
    });
}
function openBookingModal() { document.getElementById('modal-add-booking').classList.remove('hidden'); document.getElementById('new_cust_name').value = "Khách vãng lai"; document.getElementById('new_cust_phone').value = ""; document.getElementById('new_cust_phone').focus(); switchTimeMode('duration');
        if (typeof syncToCustomerDisplay === 'function') {
        syncToCustomerDisplay('input_phone');  } }
function closeBookingModal() { document.getElementById('modal-add-booking').classList.add('hidden'); if (typeof syncToCustomerDisplay === 'function') {
        syncToCustomerDisplay('idle'); }  }
function autoFillCustomer() {
    var phoneInput = document.getElementById('new_cust_phone');
    var phone = phoneInput.value.toString().trim();

    if (!phone || phone.length < 3) return;

    var key = normalizePhone(phone);
    var customer = customerMap[key];

    var elName = document.getElementById('new_cust_name');
    var elCompName = document.getElementById('new_comp_name');
    var elCompPhone = document.getElementById('new_comp_phone');

    if (customer) {

        elName.value = customer.name || "";

        if(elCompName) elCompName.value = customer.compName || "";
        if(elCompPhone) elCompPhone.value = customer.compPhone || "";

        elName.classList.add('bg-green-50', 'text-green-700');
        setTimeout(() => elName.classList.remove('bg-green-50', 'text-green-700'), 1000);
        scanAndAddDebt(phone, true);

    } else {
    }
}
function submitNewBooking() {
    var phone = document.getElementById('new_cust_phone').value.trim();
    var name = document.getElementById('new_cust_name').value.trim();
    var compName = document.getElementById('new_comp_name').value;
    var compPhone = document.getElementById('new_comp_phone').value;

    if (!phone || !name) return alert("Vui lòng nhập SĐT và Tên!");

    var phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
        return alert("Số điện thoại phải có đúng 10 chữ số!\nVí dụ: 0901234567");
    }
    if (!phoneDigits.startsWith('0')) {
        return alert("Số điện thoại Việt Nam phải bắt đầu bằng số 0!\nVí dụ: 0901234567");
    }

    var durationMinutes = 60;
    var now = new Date();
    var boxDur = document.getElementById('mode-duration-box');

    if (boxDur && !boxDur.classList.contains('hidden')) {
        durationMinutes = (typeof selectedDurationHours !== 'undefined' ? selectedDurationHours : 1) * 60;
    } else {
        var hh = document.getElementById('custom-hour').value;
        var mm = document.getElementById('custom-minute').value;

        if (!hh || !mm) return alert("Vui lòng nhập đầy đủ giờ và phút về!");

        var end = new Date();
        end.setHours(parseInt(hh), parseInt(mm), 0);

        if (end <= now) return alert("Giờ về phải lớn hơn giờ hiện tại!");
        durationMinutes = Math.floor((end - now) / 60000);
    }

    var btn = document.querySelector('button[onclick="submitNewBooking()"]');
    if(btn) { btn.innerHTML = "⏳ Đang tạo..."; btn.disabled = true; }

    const dateStr = now.toLocaleDateString('en-GB');
    const startStr = now.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
    const endObj = new Date(now.getTime() + durationMinutes * 60000);
    const endStr = endObj.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});

    let cleanPhone = normalizePhone(phone);
    if(cleanPhone) {
        var existingCustomer = customerMap[cleanPhone];
        if (!existingCustomer) {
            db.ref('customers/' + cleanPhone).set({
                name: name,
                phone: cleanPhone,
                points: 0,
                createdAt: new Date().toISOString(),
                lastVisit: new Date().toISOString(),
                compName: compName || '',
                compPhone: compPhone || ''
            });
        } else {
            db.ref('customers/' + cleanPhone).update({
                name: name,
                lastVisit: new Date().toISOString(),
                compName: compName || '',
                compPhone: compPhone || ''
            });
        }
    }

    var _d = _parseDateKey(dateStr);
    var _datedRef = _d
        ? db.ref('bedBookings/' + _d.year + '/' + _d.month + '/' + _d.day)
        : db.ref('bedBookings/misc');
    var _newRef = _datedRef.push();
    var _newKey = _newRef.key;
    var _fullPath = _newRef.toString().replace(/.*\.com\//, '').replace(/\.json$/, '');
    // Dùng path tương đối
    var _rtPath = 'bedBookings/' + (_d ? _d.year + '/' + _d.month + '/' + _d.day : 'misc') + '/' + _newKey;
    _newRef.set({
        phone: phone,
        name: name,
        date: dateStr,
        start: startStr,
        end: endStr,
        compName: compName,
        compPhone: compPhone,
        status: "chờ khách",
        bedId: "",
        type: "walk-in",
        isWalkIn: true,
        rulesAgreed: false,
        dateKey: _d ? (_d.year + '-' + _d.month + '-' + _d.day) : '',
        path: _rtPath
    }, (err) => {
        if(btn) { btn.innerHTML = "TẠO LỊCH & CHỜ XẾP"; btn.disabled = false; }

        if (!err) {
            closeBookingModal();
            openBedManager();
        } else {
            alert("Lỗi: " + err.message);
        }
    });
}
function submitWalkIn() { var phone = normalizePhone(document.getElementById('walkin-phone').value); var hours = document.getElementById('walkin-hours').value; if(!phone || !hours) return; document.getElementById('walk-in-modal').classList.add('hidden'); document.getElementById('loading-overlay').style.display = 'flex'; db.ref('beds').push({ phone: phone, name: "Khách vãng lai", duration: hours*60, type: "walk-in", status: "chờ khách" }); document.getElementById('loading-overlay').style.display = 'none'; openBedManager(); }
function checkSdtLive() {
    const sdtInput = document.getElementById('kh-sdt');
    const sdt = sdtInput.value.toString().trim();
    const status = document.getElementById('sdt-status');
renderCustomerSuggestions(sdt, 'pc');
    if (sdt.length < 3) {
        status.innerText = "";
        return;
    }

    const m = customerMap[sdt];

   if (m) {
        status.innerText = "★ THÀNH VIÊN: " + m.name;
        status.className = "text-[8px] font-black text-green-500 uppercase mt-1 text-center";

        if(window.debtTimeout) clearTimeout(window.debtTimeout);
        window.debtTimeout = setTimeout(() => scanAndAddDebt(sdt), 500);
        if(window.giftTimeout) clearTimeout(window.giftTimeout);
        window.giftTimeout = setTimeout(() => scanGiftVouchers(sdt), 600);
       syncToCustomerDisplay('welcome');
    } else {
        if (sdt.length >= 10) {
            status.innerText = "★ KHÁCH MỚI";
            status.className = "text-[8px] font-black text-amber-500 uppercase mt-1 text-center";
        } else {
            status.innerText = "";
        }
       syncToCustomerDisplay('cart', { customerName: "Khách mới", customerPoints: 0 });
    }
}
var _onModalClose = null; // callback chạy sau khi đóng app-modal
function showAppModal(title, msg, icon, onClose) {
    icon = icon || '';
    document.getElementById('app-modal-title').innerText = title;
    document.getElementById('app-modal-msg').innerHTML = msg;
    document.getElementById('app-modal-icon').innerText = icon;
    document.getElementById('app-modal').classList.remove('hidden');
    _onModalClose = onClose || null;
}
function closeAppModal() {
    document.getElementById('app-modal').classList.add('hidden');
    if (typeof _onModalClose === 'function') {
        var cb = _onModalClose;
        _onModalClose = null;
        cb();
    }
}
function parseTimeObj(timeStr) { if (!timeStr) return null; var d = new Date(); var parts = timeStr.split(':'); d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0); return d; }
function startPanelCountdown(endTimeStr) { stopPanelCountdown(); var clockEl = document.getElementById('detail-countdown'); if(!clockEl) return; var timeParts = endTimeStr.split(':'); if(timeParts.length < 2) return; var endDate = new Date(); endDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0); bedCountdownInterval = setInterval(function() { var diff = endDate - new Date(); var isOver = diff < 0; diff = Math.abs(diff); var h = Math.floor(diff / 3600000); var m = Math.floor((diff % 3600000) / 60000); var s = Math.floor((diff % 60000) / 1000); var fmt = v => v < 10 ? "0"+v : v; clockEl.innerText = (isOver ? '-' : '') + fmt(h) + ":" + fmt(m) + ":" + fmt(s); clockEl.className = isOver ? "text-3xl font-black text-red-500 font-mono tracking-tighter" : "text-3xl font-black text-[#006241] font-mono tracking-tighter"; }, 1000); }
function stopPanelCountdown() { if (bedCountdownInterval) clearInterval(bedCountdownInterval); }
function switchTimeMode(mode) {
    var btnDur = document.getElementById('tab-duration');
    var btnEnd = document.getElementById('tab-end-time');
    var boxDur = document.getElementById('mode-duration-box');
    var boxEnd = document.getElementById('mode-endtime-box');

    if (mode === 'duration') {
        if(btnDur) btnDur.className = "flex-1 py-3 rounded-[16px] text-xs font-black uppercase tracking-wider bg-white text-[#006241] shadow-sm transition-all";
        if(btnEnd) btnEnd.className = "flex-1 py-3 rounded-[16px] text-xs font-black uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-all";

        if(boxDur) boxDur.classList.remove('hidden');
        if(boxEnd) boxEnd.classList.add('hidden');

        if(document.getElementById('final_duration_minutes'))
            document.getElementById('final_duration_minutes').value = 60;
    } else {
        if(btnEnd) btnEnd.className = "flex-1 py-3 rounded-[16px] text-xs font-black uppercase tracking-wider bg-white text-[#006241] shadow-sm transition-all";
        if(btnDur) btnDur.className = "flex-1 py-3 rounded-[16px] text-xs font-black uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-all";

        if(boxEnd) boxEnd.classList.remove('hidden');
        if(boxDur) boxDur.classList.add('hidden');

        var now = new Date();
        now.setMinutes(now.getMinutes() + 90);
        var hh = ("0" + now.getHours()).slice(-2);
        var mm = ("0" + now.getMinutes()).slice(-2);

        var elH = document.getElementById('custom-hour');
        var elM = document.getElementById('custom-minute');
        if(elH) elH.value = hh;
        if(elM) elM.value = mm;

        if(typeof calculateDurationFromTime === 'function') calculateDurationFromTime();
    }
}
function calculateDurationFromTime() {
    var h = document.getElementById('custom-hour').value;
    var m = document.getElementById('custom-minute').value;

    if (!h || !m) return;

    var now = new Date();
    var end = new Date();
    end.setHours(parseInt(h), parseInt(m), 0);

    var diffMins = Math.floor((end - now) / 60000);

    if (diffMins <= 0) {
        document.getElementById('calculated-time-hint').innerText = "⚠️ Giờ về phải sau giờ hiện tại";
        document.getElementById('calculated-time-hint').className = "text-center text-[10px] font-bold text-red-500 mt-3 uppercase tracking-widest";
        document.getElementById('final_duration_minutes').value = 0;
    } else {
        document.getElementById('calculated-time-hint').innerText = `Tổng cộng: ${Math.floor(diffMins/60)}h ${diffMins%60}p`;
        document.getElementById('calculated-time-hint').className = "text-center text-[10px] font-bold text-gray-400 mt-3 uppercase tracking-widest";
        document.getElementById('final_duration_minutes').value = diffMins;
    }
}

function normalizePhone(p){
    return String(p || "").replace(/[^0-9]/g, "");
}

function findCustomerByPhone(phone){
    const key = normalizePhone(phone);
    if(!key) return null;
    return customerMap[key] || null;
}

function checkCustomer(){
    const input = document.getElementById("walkin-phone");
    if(!input) return;

    const sdt = normalizePhone(input.value);
    const label = document.getElementById("sdt-status");

    if(!sdt){
        if(label) label.innerText = "";
        return;
    }

    const c = findCustomerByPhone(sdt);
    if(c){
        if(label){
            label.innerText = `✔ ${c.name} — ${c.points} điểm`;
            label.style.color = "#22c55e";
        }
    }else{
        if(label){
            label.innerText = "Khách mới";
            label.style.color = "#aaa";
        }
    }
}
let selectedDurationHours = 1;

function toggleTimeMode(mode) {
    const tabDur = document.getElementById('tab-duration');
    const tabEnd = document.getElementById('tab-end-time');
    const boxDur = document.getElementById('mode-duration-box');
    const boxEnd = document.getElementById('mode-endtime-box');

    if (mode === 'duration') {
        if(tabDur) tabDur.className = "flex-1 py-2 text-xs font-bold rounded-lg shadow-sm bg-white text-[#006241] transition-all";
        if(tabEnd) tabEnd.className = "flex-1 py-2 text-xs font-bold rounded-lg text-gray-500 hover:bg-gray-200 transition-all";
        if(boxDur) boxDur.classList.remove('hidden');
        if(boxEnd) boxEnd.classList.add('hidden');
        if(document.getElementById('final_duration_minutes')) document.getElementById('final_duration_minutes').value = 60;
    } else {
        if(tabEnd) tabEnd.className = "flex-1 py-2 text-xs font-bold rounded-lg shadow-sm bg-white text-[#006241] transition-all";
        if(tabDur) tabDur.className = "flex-1 py-2 text-xs font-bold rounded-lg text-gray-500 hover:bg-gray-200 transition-all";
        if(boxEnd) boxEnd.classList.remove('hidden');
        if(boxDur) boxDur.classList.add('hidden');

       var now = new Date();
        now.setMinutes(now.getMinutes() + 90);
        var hh = ("0" + now.getHours()).slice(-2);
        var mm = ("0" + now.getMinutes()).slice(-2);

        var elH = document.getElementById('custom-hour');
        var elM = document.getElementById('custom-minute');
        if(elH && elM) {
            elH.value = hh;
            elM.value = mm;
            calculateDurationFromTime();
        }
    }
}

function submitCancelBooking(type) {
    var bookingId = window.pendingCancelId;
    if (!bookingId) return;

    var reasonText = "";
    if (type === 'customer_self') reasonText = "Khách tự hủy qua app";
    else if (type === 'customer') reasonText = "Khách báo hủy";
    else if (type === 'store') reasonText = "The cafe 33 hủy (System)";

    var booking = (typeof globalAllBookings !== 'undefined' ? globalAllBookings : []).find(function(b){ return b.id === bookingId; });
    var phone = booking ? (booking.phone || null) : null;
    var guestName = booking ? (booking.name || 'Khách hàng') : 'Khách hàng';

    if (phone) {
        if (type === 'customer_self') {
            updateRepScore(phone, guestName, -2, 'Khách tự hủy lịch qua app', bookingId);
        } else if (type === 'customer') {
            updateRepScore(phone, guestName, -8, 'Khách báo hủy (quán ghi nhận)', bookingId);
        }
    }

    document.getElementById('modal-cancel-reason').classList.add('hidden');
    document.getElementById('loading-overlay').style.display = 'flex';

    if (!booking) {
        alert('Lỗi: Không tìm thấy booking ' + bookingId + ' trong danh sách hiện tại.');
        document.getElementById('loading-overlay').style.display = 'none';
        return;
    }
    _updateBedBooking(booking, {
        status: 'đã hủy',
        cancelType: type,
        note: reasonText
    }, (err) => {
        document.getElementById('loading-overlay').style.display = 'none';
        if (!err) {
            openBedManager();
        } else {
            alert("Lỗi: " + err.message);
        }
    });
}
let tempCheckoutData = null;

var _extendBookingData = null;
var _extendDurationHours = 0;
var _extendNewEndTime = null;
var _extendCallback = null;
var _extendCurrentMode = 'duration';

function openExtendModal(booking, callback) {
    _extendBookingData = booking;
    _extendDurationHours = 0;
    _extendNewEndTime = null;
    _extendCallback = callback;
    _extendCurrentMode = 'duration';

    document.getElementById('extend-modal-title').innerText = (booking.name || 'Khách hàng') + (booking.bedId && booking.bedId !== 'WAITING' ? ' — Bed 0' + booking.bedId : '');
    document.getElementById('extend-current-end').innerText = booking.end || '--:--';
    document.getElementById('extend-preview-box').classList.add('hidden');
    document.getElementById('extend-new-end').innerText = '--:--';
    document.getElementById('extend-custom-hour').value = '';
    document.getElementById('extend-custom-minute').value = '';
    document.getElementById('extend-time-hint').innerText = 'Nhập giờ khách muốn về';

    [1,2,3].forEach(h => {
        var btn = document.getElementById('btn-extend-' + h + 'h');
        if (btn) {
            btn.classList.remove('border-[#006241]', 'bg-green-50');
            btn.classList.add('border-gray-200', 'bg-white');
        }
    });

    switchExtendMode('duration');

    var confirmBtn = document.getElementById('btn-confirm-extend');
    confirmBtn.disabled = true;
    confirmBtn.classList.add('opacity-40', 'cursor-not-allowed');
    document.getElementById('modal-extend-time').classList.remove('hidden');
}

function switchExtendMode(mode) {
    _extendCurrentMode = mode;
    _extendDurationHours = 0;
    _extendNewEndTime = null;

    var durTab = document.getElementById('extend-tab-duration');
    var endTab = document.getElementById('extend-tab-endtime');
    var durBox = document.getElementById('extend-mode-duration');
    var endBox = document.getElementById('extend-mode-endtime');

    if (mode === 'duration') {
        durTab.className = 'flex-1 py-3 rounded-[14px] text-sm font-black uppercase tracking-wider bg-white text-[#006241] shadow-sm transition-all';
        endTab.className = 'flex-1 py-3 rounded-[14px] text-sm font-black uppercase tracking-wider text-gray-400 transition-all';
        durBox.classList.remove('hidden');
        endBox.classList.add('hidden');
    } else {
        endTab.className = 'flex-1 py-3 rounded-[14px] text-sm font-black uppercase tracking-wider bg-white text-[#006241] shadow-sm transition-all';
        durTab.className = 'flex-1 py-3 rounded-[14px] text-sm font-black uppercase tracking-wider text-gray-400 transition-all';
        endBox.classList.remove('hidden');
        durBox.classList.add('hidden');
        document.getElementById('extend-custom-hour').focus();
    }

    document.getElementById('extend-preview-box').classList.add('hidden');
    var confirmBtn = document.getElementById('btn-confirm-extend');
    confirmBtn.disabled = true;
    confirmBtn.classList.add('opacity-40', 'cursor-not-allowed');
}

function closeExtendModal() {
    document.getElementById('modal-extend-time').classList.add('hidden');
    _extendBookingData = null;
    _extendDurationHours = 0;
    _extendNewEndTime = null;
    _extendCallback = null;
}

function selectExtendDuration(hours) {
    _extendDurationHours = hours;
    _extendNewEndTime = null;

    [1,2,3].forEach(h => {
        var btn = document.getElementById('btn-extend-' + h + 'h');
        if (!btn) return;
        if (h === hours) {
            btn.classList.add('border-[#006241]', 'bg-green-50');
            btn.classList.remove('border-gray-200', 'bg-white');
        } else {
            btn.classList.remove('border-[#006241]', 'bg-green-50');
            btn.classList.add('border-gray-200', 'bg-white');
        }
    });

    if (_extendBookingData && _extendBookingData.end) {
        var parts = _extendBookingData.end.split(':');
        var endDate = new Date();
        endDate.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
        endDate.setTime(endDate.getTime() + hours * 60 * 60 * 1000);
        var newEnd = endDate.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
        _extendNewEndTime = newEnd;
        document.getElementById('extend-new-end').innerText = newEnd;
        document.getElementById('extend-preview-box').classList.remove('hidden');
    }

    var confirmBtn = document.getElementById('btn-confirm-extend');
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('opacity-40', 'cursor-not-allowed');
}

function formatExtendTimeInput(input) {
    var val = parseInt(input.value);
    if (isNaN(val)) { input.value = ''; return; }
    if (input.id === 'extend-custom-hour' && val > 23) input.value = '23';
    if (input.id === 'extend-custom-minute' && val > 59) input.value = '59';
}

function calcExtendFromTime() {
    var hh = document.getElementById('extend-custom-hour').value;
    var mm = document.getElementById('extend-custom-minute').value;
    var hint = document.getElementById('extend-time-hint');
    var confirmBtn = document.getElementById('btn-confirm-extend');

    if (!hh || !mm) {
        hint.innerText = 'Nhập giờ khách muốn về';
        hint.style.color = '#9ca3af';
        document.getElementById('extend-preview-box').classList.add('hidden');
        confirmBtn.disabled = true;
        confirmBtn.classList.add('opacity-40', 'cursor-not-allowed');
        return;
    }

    var newEndStr = hh.padStart(2,'0') + ':' + mm.padStart(2,'0');
    var currentEnd = _extendBookingData ? _extendBookingData.end : null;

    if (currentEnd) {
        var curParts = currentEnd.split(':');
        var curEnd = new Date(); curEnd.setHours(parseInt(curParts[0]), parseInt(curParts[1]), 0, 0);
        var newEnd = new Date(); newEnd.setHours(parseInt(hh), parseInt(mm), 0, 0);

        if (newEnd <= curEnd) {
            hint.innerText = 'Giờ về mới phải sau ' + currentEnd;
            hint.style.color = '#ef4444';
            document.getElementById('extend-preview-box').classList.add('hidden');
            confirmBtn.disabled = true;
            confirmBtn.classList.add('opacity-40', 'cursor-not-allowed');
            _extendNewEndTime = null;
            return;
        }

        var diffMs = newEnd - curEnd;
        var diffH = Math.floor(diffMs / 3600000);
        var diffM = Math.floor((diffMs % 3600000) / 60000);
        hint.innerText = 'Thêm ' + (diffH > 0 ? diffH + ' giờ ' : '') + (diffM > 0 ? diffM + ' phút' : '');
        hint.style.color = '#006241';
    }

    _extendNewEndTime = newEndStr;
    _extendDurationHours = 0;
    document.getElementById('extend-new-end').innerText = newEndStr;
    document.getElementById('extend-preview-box').classList.remove('hidden');
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('opacity-40', 'cursor-not-allowed');
}

function confirmExtendTime() {
    if (!_extendBookingData || !_extendNewEndTime) return;

    var booking = _extendBookingData;
    var newEndStr = _extendNewEndTime;
    var callback = _extendCallback;

    var bookingId = booking.id || booking.key;
    if (bookingId) {
        _updateBedBooking(booking, { end: newEndStr });
        booking.end = newEndStr;
        if (window.currentMobileBooking && window.currentMobileBooking.id === bookingId) window.currentMobileBooking.end = newEndStr;
        if (window.currentPcBooking && window.currentPcBooking.id === bookingId) window.currentPcBooking.end = newEndStr;
        if (globalAllBookings) {
            var idx = globalAllBookings.findIndex(b => b.id === bookingId);
            if (idx > -1) globalAllBookings[idx].end = newEndStr;
        }
    }

    if (typeof callback === 'function' && _extendDurationHours > 0) {
        for (var i = 0; i < _extendDurationHours; i++) {
            if (typeof autoAddMenuItemToCart === 'function') autoAddMenuItemToCart('1h bed');
        }
    }

    closeExtendModal();

    if (typeof showAppModal === 'function') showAppModal('Gia hạn thành công', 'Giờ kết thúc mới: ' + newEndStr, null);
    if (typeof callback === 'function') callback();
}

function skipExtendAndOrder() {
    var cb = _extendCallback;
    closeExtendModal();
    if (typeof cb === 'function') cb();
}

var currentBedClosingTime = '20:50';
var _bedAutoStopChecked = false;
var _bedCloseTimer = null;

function calcAutoStopTime(closingTime) {
    var parts = (closingTime || '20:50').split(':');
    var hh = parseInt(parts[0]) || 20;
    var mm = parseInt(parts[1]) || 50;
    var total = hh * 60 + mm + 10;
    return String(Math.floor(total / 60) % 24).padStart(2,'0') + ':' + String(total % 60).padStart(2,'0');
}

db.ref('bed_closing_time').on('value', function(snap) {
    var val = snap.val();
    currentBedClosingTime = val || '20:50';
    var el = document.getElementById('bed-closing-display');
    if (el) el.innerText = currentBedClosingTime;
    _bedAutoStopChecked = false;
});

function openBedClosingModal() {
    var parts = currentBedClosingTime.split(':');
    document.getElementById('closing-hour').value = parts[0] || '20';
    document.getElementById('closing-minute').value = parts[1] || '50';
    document.getElementById('modal-bed-closing').classList.remove('hidden');
}

function saveBedClosingTime() {
    var hh = (document.getElementById('closing-hour').value || '').padStart(2,'0');
    var mm = (document.getElementById('closing-minute').value || '').padStart(2,'0');
    if (!hh || !mm) return alert('Vui lòng nhập đầy đủ!');
    var newTime = hh + ':' + mm;
    db.ref('bed_closing_time').set(newTime);
    document.getElementById('modal-bed-closing').classList.add('hidden');
    if (typeof showAppModal === 'function') showAppModal('Đã lưu', 'Giờ đóng cửa Bed: ' + newTime, null);
}

function startBedAutoStopTimer() {
    if (_bedCloseTimer) clearInterval(_bedCloseTimer);
    _bedCloseTimer = setInterval(checkBedAutoStop, 30000);
    checkBedAutoStop();
}

function checkBedAutoStop() {
    var now = new Date();
    var nowStr = now.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
    var autoStopTime = calcAutoStopTime(currentBedClosingTime);
    if (nowStr === autoStopTime && !_bedAutoStopChecked) {
        _bedAutoStopChecked = true;
        triggerBedAutoStop();
    }
    if (nowStr < '01:00') _bedAutoStopChecked = false;
}

function triggerBedAutoStop() {
    var activeBookings = (globalAllBookings || []).filter(b =>
        b.status && (b.status.includes('active') || b.status.includes('đang dùng'))
    );
    var count = activeBookings.length;
    var nowStr = new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
    activeBookings.forEach(function(b) {
        var bookingId = b.id || b.key;
        if (bookingId) {
            _updateBedBooking(b, {
                status: 'đã xong',
                realEndTime: nowStr,
                autoStopped: true,
                totalSpend: b.totalSpend || 0
            });
        }
    });
    document.getElementById('autostop-time-display').innerText = calcAutoStopTime(currentBedClosingTime);
    document.getElementById('autostop-count').innerText = count;
    document.getElementById('modal-bed-autostop').classList.remove('hidden');
}

startBedAutoStopTimer();

var _lastSeenAutoStopLog = null;
db.ref('bedAutoStopLog').limitToLast(1).on('value', function(snap) {
    if (!snap.exists()) return;
    var key = Object.keys(snap.val())[0];
    var log = snap.val()[key];
    if (!log || log.triggeredBy !== 'cloud_function') return;
    if (_lastSeenAutoStopLog === key) return;
    _lastSeenAutoStopLog = key;
    var logTime = log.timestamp ? new Date(log.timestamp) : null;
    var now = new Date();
    if (logTime && (now - logTime) > 10 * 60 * 1000) return;
    var countEl = document.getElementById('autostop-count');
    var timeEl = document.getElementById('autostop-time-display');
    if (countEl) countEl.innerText = log.count || 0;
    if (timeEl) timeEl.innerText = log.time || '';
    var modal = document.getElementById('modal-bed-autostop');
    if (modal) modal.classList.remove('hidden');
});

function handleBedCheckout(booking) {
    if (!booking) return;

    const now = new Date();
    let endParts = booking.end.split(':');
    let endTime = new Date();
    endTime.setHours(parseInt(endParts[0]), parseInt(endParts[1]), 0);

    let diffMinutes = Math.floor((now - endTime) / 60000);

    let startParts = booking.start.split(':');
    let startTime = new Date();
    startTime.setHours(parseInt(startParts[0]), parseInt(startParts[1]), 0);
    let bookedMinutes = (endTime - startTime) / 60000;
    let paidHours = Math.ceil(bookedMinutes / 60);

    tempCheckoutData = {
        booking: booking,
        diffMinutes: diffMinutes,
        paidHours: paidHours,
        extraHoursQty: (diffMinutes > 5) ? Math.ceil(diffMinutes / 60) : 0
    };

    if (diffMinutes <= 5) {
        let realTimeStr = new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
        calculateAndSaveCheckout(booking, realTimeStr);
        return;
    }

    document.getElementById('sco-bed-name').innerText = `BED 0${booking.bedId}`;
    document.getElementById('sco-customer').innerText = booking.name || "Khách lẻ";

    const otEl = document.getElementById('sco-overtime');
    const feeEl = document.getElementById('sco-fee');

    otEl.innerText = `${diffMinutes} phút`;
    otEl.className = "text-2xl font-black text-red-500";
    feeEl.innerText = `+ ${tempCheckoutData.extraHoursQty} giờ`;

    const modal = document.getElementById('modal-smart-checkout');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0', 'scale-95');
        modal.classList.add('opacity-100', 'scale-100');
    }, 10);
}

function confirmCheckoutAuto() {
    if(!tempCheckoutData) return;
    const { booking, extraHoursQty, paidHours } = tempCheckoutData;

    closeSmartCheckout();

    if (extraHoursQty > 0) {
        for (let i = 1; i <= extraHoursQty; i++) {
            let currentHourIndex = paidHours + i;
            if (currentHourIndex <= 4) autoAddMenuItemToCart("1h bed");
            else autoAddMenuItemToCart("1h bed từ h5");
        }
        showAppModal("Đã cộng tiền", `Hệ thống đã tự động thêm ${extraHoursQty}h vào hóa đơn.`, "🤖");
    }

    proceedToCheckoutFlow(booking);
}

function confirmCheckoutManual() {
    if(!tempCheckoutData) return;
    closeSmartCheckout();

    proceedToCheckoutFlow(tempCheckoutData.booking);
}

function confirmCheckoutFree() {
    if(!tempCheckoutData) return;
    const { booking } = tempCheckoutData;

    closeSmartCheckout();

    let realTimeStr = new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'});
    calculateAndSaveCheckout(booking, realTimeStr);
}

function closeSmartCheckout() {
    const modal = document.getElementById('modal-smart-checkout');
    modal.classList.remove('opacity-100', 'scale-100');
    modal.classList.add('opacity-0', 'scale-95');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function proceedToCheckoutFlow(booking) {
    activeOrderingBedId = booking.bedId;
    pendingBedOrder = booking;
    isCheckoutFlow = true;

    var sdtInput = document.getElementById('kh-sdt');
    if (sdtInput && booking.phone) {
        sdtInput.value = booking.phone;
        if (typeof checkSdtLive === 'function') checkSdtLive();
    }

    switchView('menu');
}
function calculateAndSaveCheckout(booking, realTimeStr) {
    let btnCheckout = document.getElementById('btn-action-checkout');
    if(btnCheckout) btnCheckout.innerHTML = 'Đang tính tiền...';

    calculateSessionSpend(booking.phone, booking.start, realTimeStr).then(total => {

        let bookingId = booking.id || booking.key;

        _updateBedBooking(booking, {
            status: 'đã xong',
            realEndTime: realTimeStr,
            totalSpend: total
        }, (err) => {
            if(!err) {
                openBedManager();
            }
            else {
                alert("Lỗi: " + err.message);
                if(btnCheckout) btnCheckout.innerHTML = '<span>🏁 Trả Bed</span>';
            }
        });
    });
}

function _getPreorderItems(preorder) {
    if (!preorder || !preorder.items) return [];
    if (Array.isArray(preorder.items)) return preorder.items.filter(Boolean);
    return Object.values(preorder.items).filter(Boolean);
}
function _hasActivePreorder(booking) {
    if (!booking || !booking.preorder) return false;
    if (booking.preorder.status === 'loaded') return false;
    return _getPreorderItems(booking.preorder).length > 0;
}
function _countPreorderQty(preorder) {
    return _getPreorderItems(preorder).reduce(function(s,i){ return s+(parseInt(i.qty)||1); }, 0);
}

function loadPreorderToCart(bookingKey) {
    if (!bookingKey) return;
    var _bk = (globalAllBookings || []).find(function(b){ return (b.id || b.key) === bookingKey; });
    var _preRef = _bk ? _bedBookingRef(_bk, 'preorder') : db.ref('bedBookings/' + bookingKey + '/preorder');
    _preRef.once('value', function(snap) {
        var preorder = snap.val();
        if (!preorder || !preorder.items) return;

        var items = _getPreorderItems(preorder);
        if (!items.length) return;

        var totalAdded = 0;
        items.forEach(function(item) {
            if (!item || !item.name) return;

            var menuItem = menu.find(function(m) {
                return m.name.toLowerCase() === item.name.toLowerCase();
            });
            var price = menuItem
                ? (menuItem.priceM > 0 ? menuItem.priceM : menuItem.priceL)
                : (item.price || 0);
            var qty = parseInt(item.qty) || 1;
            var size = item.size || 'M';

            var existing = cart.find(function(ci) {
                return ci.name === item.name && ci.size === size;
            });
            if (existing) {
                existing.qty += qty;
            } else {
                cart.push({ name: item.name, size: size, price: price, qty: qty, _preorder: true });
            }
            totalAdded += qty;
        });

        renderCart();

        if (totalAdded > 0 && typeof showToast === 'function') {
            showToast('🍜 Đã thêm ' + totalAdded + ' món pre-order vào giỏ!');
        }
    });
}

function showPreorderModal(data, bookingId) {
    var modal = document.getElementById('modal-preorder-preview');
    var guestEl = document.getElementById('preorder-modal-guest');
    var itemsEl = document.getElementById('preorder-modal-items');
    var totalEl = document.getElementById('preorder-modal-total');
    var confirmBtn = document.getElementById('preorder-modal-confirm-btn');

    guestEl.innerText = (data.name || 'Khách') + (data.phone ? ' · ' + data.phone : '') + ' · Bed ' + (data.bedId || '?');
    itemsEl.innerHTML = '<div class="flex items-center justify-center py-6 text-gray-300 gap-2"><div class="animate-spin w-5 h-5 border-2 border-[#006241] border-t-transparent rounded-full"></div><span class="text-sm font-bold">Đang tải...</span></div>';
    totalEl.innerText = '...';
    modal.classList.remove('hidden');

    var _bkObj = (globalAllBookings || []).find(function(b){ return (b.id || b.key) === bookingId; });
    var _preRef2 = _bkObj ? _bedBookingRef(_bkObj, 'preorder') : db.ref('bedBookings/' + bookingId + '/preorder');
    _preRef2.once('value', function(snap) {
        var preorder = snap.val();
        var items = preorder ? _getPreorderItems(preorder) : [];

        if (!items.length) {
            itemsEl.innerHTML = '<div class="text-center py-8 text-gray-300 text-sm">Không có món nào</div>';
            totalEl.innerText = '0đ';
            return;
        }

        var grandTotal = 0;
        var html = '';
        items.forEach(function(item) {
            if (!item || !item.name) return;
            var menuItem = menu.find(function(m) { return m.name.toLowerCase() === item.name.toLowerCase(); });
            var price = menuItem ? (menuItem.priceM > 0 ? menuItem.priceM : menuItem.priceL) : (item.price || 0);
            var qty = parseInt(item.qty) || 1;
            var size = item.size || 'M';
            var sub = price * qty;
            grandTotal += sub;
            html += '<div class="flex items-center justify-between bg-white rounded-[1.3rem] px-6 py-5">' +
                '<div class="flex items-center gap-5">' +
                    '<span class="w-11 h-11 rounded-full text-white text-base font-black flex items-center justify-center shrink-0" style="background:linear-gradient(135deg,#b45309,#d97706)">' + qty + 'x</span>' +
                    '<div>' +
                        '<p class="font-black text-gray-800 text-[1.05rem] leading-tight">' + item.name + '</p>' +
                        '<p class="text-sm text-gray-400 font-bold mt-1">' + size + ' · ' + price.toLocaleString() + 'đ / ly</p>' +
                    '</div>' +
                '</div>' +
                '<span class="font-black text-amber-600 text-[1.05rem]">' + sub.toLocaleString() + 'đ</span>' +
            '</div>';
        });
        itemsEl.innerHTML = html;
        totalEl.innerText = grandTotal.toLocaleString() + 'đ';

        confirmBtn.onclick = function() {
            modal.classList.add('hidden');
            pendingBedOrder = data;
            activeOrderingBedId = data.bedId || 'WAITING';
            // _doShowBedDetail lo toàn bộ: SĐT, phí bed, dynamic island, session display, switchView
            // Preorder được load riêng ngay sau (không còn auto-load trong _doShowBedDetail)
            _doShowBedDetail(data, data.bedId);
            var bkKey = data.id || data.key;
            if (bkKey) setTimeout(function() { loadPreorderToCart(bkKey); }, 200);
        };
    });
}

function autoAddBedItems(booking) {
    if (!booking) return;

    var totalHours = 0;

    if (booking.start && booking.end) {
        try {
            var ps = booking.start.split(':');
            var pe = booking.end.split(':');
            var startMins = parseInt(ps[0]) * 60 + parseInt(ps[1]);
            var endMins   = parseInt(pe[0]) * 60 + parseInt(pe[1]);
            var diffMins  = endMins - startMins;
            if (diffMins <= 0) diffMins += 24 * 60;
            // Có pre-order → giờ kết thúc đã được cộng +5p thưởng → trừ lại để tính phí đúng
            if (booking.preorder && Object.keys(booking.preorder).length > 0) diffMins -= 5;
            totalHours = Math.ceil(diffMins / 60);
        } catch(e) { totalHours = 0; }
    }

    if (totalHours <= 0 && booking.duration) {
        totalHours = Math.ceil(parseInt(booking.duration) / 60);
    }

    if (totalHours <= 0) {
        return;
    }

    cart = cart.filter(i => {
        var n = (i.name || '').toLowerCase();
        return n !== '1h bed' && n !== '1h bed từ h5';
    });

    var hoursNormal = Math.min(totalHours, 4);
    var hoursExtra  = Math.max(0, totalHours - 4);

    var addItem = function(name) {
        var item = menu.find(function(m) {
            return m.name.toLowerCase() === name.toLowerCase();
        });
        if (!item) {
            return;
        }
        var price = (item.priceM > 0) ? item.priceM : item.priceL;
        var ex = cart.find(function(c) { return c.name === item.name && c.size === 'M'; });
        if (ex) ex.qty++;
        else cart.push({ name: item.name, size: 'M', price: price, qty: 1 });
    };

    for (var i = 0; i < hoursNormal; i++) addItem('1h bed');
    for (var j = 0; j < hoursExtra;  j++) addItem('1h bed từ h5');

    renderCart();

    var msg = totalHours <= 4
        ? `Đã thêm ${totalHours} × 1h Bed`
        : `Đã thêm 4 × 1h Bed + ${hoursExtra} × 1h Bed (h5+)`;
    if (typeof showToast === 'function') showToast('🛏️ ' + msg);
}

function autoAddMenuItemToCart(itemName) {
    const item = menu.find(m => m.name.toLowerCase() === itemName.toLowerCase());

    if (item) {
        let price = item.priceM > 0 ? item.priceM : item.priceL;
        addToCart(item.name, 'M', price);
    } else {
    }
}

function processCheckoutFirebase(booking) {
    let btnCheckout = document.getElementById('btn-action-checkout');
    if(btnCheckout) btnCheckout.innerHTML = 'Wait...';

    _updateBedBooking(booking, {
        status: 'đã xong',
        realEndTime: new Date().toLocaleTimeString('en-GB')
    }, (err) => {
        if(!err) openBedManager();
        else {
            alert("Lỗi: " + err.message);
            if(btnCheckout) btnCheckout.innerHTML = '<span>🏁 Trả Bed</span>';
        }
    });
}
function renderBedSelection() {
    var container = document.getElementById('bed-selection-container');
    if (!container) return;

    container.innerHTML = "";

    var preferredBed = (pendingBedOrder && pendingBedOrder.preferredBed) ? String(pendingBedOrder.preferredBed) : null;

    if (preferredBed) {
        var feeNote = (pendingBedOrder.preferBedFee > 0)
            ? ` · <strong>+${Number(pendingBedOrder.preferBedFee).toLocaleString()}đ</strong> đã ghi nợ`
            : ' · Miễn phí';
        var noticeEl = document.createElement('div');
        noticeEl.style.cssText = 'grid-column:1/-1;background:linear-gradient(135deg,#e0f2fe,#bae6fd);border:1px solid #7dd3fc;border-radius:24px;padding:10px 14px;margin-bottom:2px;';
        noticeEl.innerHTML = `<p style="font-size:11px;font-weight:800;color:#0369a1;margin:0;">⭐ Khách yêu cầu <strong>Bed 0${preferredBed}</strong>${feeNote}</p>
            <p style="font-size:10px;color:#0284c7;margin:3px 0 0;font-weight:600;">Ô bed đó đã được highlight bên dưới.</p>`;
        container.appendChild(noticeEl);
    }

    var orderMap = [1, 3, 2, 4];

    orderMap.forEach(i => {
        var isBusy = currentBedList.find(b =>
            b.bedId == i && b.status && (b.status.includes('active') || b.status.includes('đang dùng'))
        );
        var isPreferred = preferredBed === String(i);

        var btnHTML = "";

        if (isBusy) {
            btnHTML = `
            <div class="relative w-full h-full">
                <button disabled class="w-full h-full bg-[#F3F4F6] rounded-2xl p-3 flex flex-col items-center justify-center border border-gray-200 cursor-not-allowed opacity-60 grayscale transition-all">
                    <div class="w-10 h-10 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <span class="font-bold text-gray-400 text-sm">BED 0${i}</span>
                    <span class="text-[9px] text-gray-400 font-bold uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded-full mt-1">Đang bận</span>
                </button>
            </div>`;
        } else if (isPreferred) {
            btnHTML = `
            <button onclick="finalizeBedCheckIn(${i})" class="w-full h-full rounded-2xl p-3 flex flex-col items-center justify-center border-2 active:scale-[0.97] transition-all duration-200 relative overflow-hidden" style="background:linear-gradient(160deg,#006241,#005235);border-color:#004d33;box-shadow:0 6px 20px rgba(0,98,65,0.35);">
                <div class="w-11 h-11 rounded-full flex items-center justify-center mb-1" style="background:rgba(255,255,255,0.2);">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                </div>
                <span class="font-black text-white text-lg">BED 0${i}</span>
                <span class="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1" style="background:rgba(255,255,255,0.2);color:#fff;">⭐ Khách chọn</span>
            </button>`;
        } else {
            btnHTML = `
            <button onclick="finalizeBedCheckIn(${i})" class="w-full h-full bg-white rounded-2xl p-3 flex flex-col items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] border-2 border-transparent hover:border-[#006241]/30 active:scale-[0.97] active:shadow-sm transition-all duration-200 group relative overflow-hidden">
                <div class="absolute inset-0 bg-[#006241] opacity-0 group-hover:opacity-[0.03] transition-opacity"></div>
                <div class="w-11 h-11 bg-[#E6F4F1] text-[#006241] rounded-full flex items-center justify-center mb-1 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                </div>
                <span class="font-black text-[#006241] text-lg group-hover:text-[#004f32] transition-colors">BED 0${i}</span>
                <span class="text-[9px] text-[#006241] font-bold uppercase tracking-wider bg-[#E6F4F1] px-2.5 py-0.5 rounded-full mt-1">Sẵn sàng</span>
            </button>`;
        }

        container.innerHTML += btnHTML;
    });
}
function calculateSessionSpend(phone, startTimeStr, endTimeStr) {
    return new Promise((resolve) => {
        if (!startTimeStr || !endTimeStr) { resolve(0); return; }

        var now = new Date();

        var startParts = startTimeStr.split(':');
        var startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(startParts[0]), parseInt(startParts[1]), 0);

        var endParts = endTimeStr.split(':');
        var endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(endParts[0]), parseInt(endParts[1]), 59);

        if (endDate < startDate) endDate.setDate(endDate.getDate() + 1);

        fetchOrdersByDateRange(startDate, endDate).then(orders => {
            let total = 0;
            orders.forEach(o => {
                if (normalizePhone(o.sdt) === normalizePhone(phone)) {
                    var orderDate = new Date(o.createdAt);

                    var bufferStart = new Date(startDate.getTime() - 5*60000);
                    var bufferEnd = new Date(endDate.getTime() + 5*60000);

                    if (orderDate >= bufferStart && orderDate <= bufferEnd) {
                        total += Number(o.total || 0);
                    }
                }
            });
            resolve(total);
        });
    });
}

function setCleaningFee(phone, amount, bookingId) {
    if (!phone) return alert("Không tìm thấy SĐT khách!");

    db.ref('customers/' + normalizePhone(phone)).update({
        pendingFee: amount,
        pendingFeeReason: "Phí vệ sinh nệm (Lần trước)"
    }, (error) => {
        if (error) alert("Lỗi: " + error.message);
        else {
            let statusEl = document.getElementById(`fee-status-${bookingId}`);
            if(statusEl) {
                statusEl.innerText = `Đã lưu nợ ${amount.toLocaleString()}đ cho lần sau.`;
                statusEl.classList.remove('text-gray-400');
                statusEl.classList.add('text-green-600', 'font-bold');
            }
            var _bk = (globalAllBookings || []).find(function(b){ return (b.id || b.key) === bookingId; });
            if (_bk) _updateBedBooking(_bk, { hasPenalty: true, penaltyAmount: amount });
            else db.ref('bedBookings/' + bookingId).update({ hasPenalty: true, penaltyAmount: amount });
        }
    });
}

var pendingFeePhone = "";
var pendingFeeBookingId = "";

function openCleaningModal(phone, bookingId) {
    pendingFeePhone = phone;
    pendingFeeBookingId = bookingId;

    var modal = document.getElementById('modal-cleaning-fee');
    if(modal) {
        modal.classList.remove('hidden');
        modal.querySelector('div').classList.add('scale-100');
        modal.querySelector('div').classList.remove('scale-95');
    } else {
        alert("Lỗi: Không tìm thấy Modal HTML ID 'modal-cleaning-fee'. Vui lòng kiểm tra lại code HTML.");
    }
}

function submitCleaningFee(amount) {
    if (!pendingFeePhone) return;

    document.getElementById('modal-cleaning-fee').classList.add('hidden');

    showIOSConfirm(`Xác nhận tính phí ${amount.toLocaleString()}đ cho khách này?`, function() {
        setCleaningFee(pendingFeePhone, amount, pendingFeeBookingId);
    });
}

function setCleaningFee(phone, amount, bookingId) {
    document.getElementById('loading-overlay').style.display = 'flex';

    db.ref('customers/' + normalizePhone(phone)).update({
        pendingFee: amount,
        pendingFeeReason: "Phí vệ sinh nệm"
    }, (error) => {
        if (error) {
            document.getElementById('loading-overlay').style.display = 'none';
            alert("Lỗi: " + error.message);
        } else {
            var _bk = (globalAllBookings || []).find(function(b){ return (b.id || b.key) === bookingId; });
            var _doUpdate = _bk
                ? function(cb) { _updateBedBooking(_bk, { hasPenalty: true, penaltyAmount: amount }, cb); }
                : function(cb) { db.ref('bedBookings/' + bookingId).update({ hasPenalty: true, penaltyAmount: amount }, cb); };
            _doUpdate(() => {
                document.getElementById('loading-overlay').style.display = 'none';
                openBedManager();
                setTimeout(() => {
                    showAppModal("Đã tính phí!", `Khách sẽ bị tính thêm ${amount.toLocaleString()}đ vào lần thanh toán sau.`, "✅");
                }, 300);
            });
        }
    });
}

function deletePenalty(phone, bookingId) {
    showIOSConfirm("Bạn chắc chắn muốn XÓA phí phạt này chứ?", function() {
        document.getElementById('loading-overlay').style.display = 'flex';

        db.ref('customers/' + normalizePhone(phone)).update({
            pendingFee: 0,
            pendingFeeReason: null
        });

        var _bk = (globalAllBookings || []).find(function(b){ return (b.id || b.key) === bookingId; });
        var _doUpdate = _bk
            ? function(cb) { _updateBedBooking(_bk, { hasPenalty: false, penaltyAmount: 0 }, cb); }
            : function(cb) { db.ref('bedBookings/' + bookingId).update({ hasPenalty: false, penaltyAmount: 0 }, cb); };
        _doUpdate(() => {
            document.getElementById('loading-overlay').style.display = 'none';
            openBedManager();
            setTimeout(() => { showAppModal("Đã xóa!", "Đã hủy bỏ khoản phí vệ sinh.", "🗑️"); }, 300);
        });
    });
}
