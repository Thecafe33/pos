function openHistory() {
    document.getElementById('loading-overlay').style.display = 'flex';
    switchView('history');

    // Lấy 7 ngày gần nhất + node cũ
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    fetchOrdersByDateRange(weekAgo, today).then(allOrders => {
        document.getElementById('loading-overlay').style.display = 'none';
        if (!allOrders.length) {
            historyData = [];
            document.getElementById('history-container').innerHTML = "<div class='text-center text-gray-400 mt-10'>Chưa có đơn hàng nào</div>";
        } else {
            // Chuyển về dạng object giả để tương thích processHistoryData
            const fakeData = {};
            allOrders.forEach((o, i) => { fakeData[i] = o; });
            processHistoryData(fakeData);
        }
    });
}

function processHistoryData(data) {
    document.getElementById('loading-overlay').style.display = 'none';
    if(!data) {
        historyData = [];
        document.getElementById('history-container').innerHTML = "<div class='text-center text-gray-400 mt-10'>Chưa có đơn hàng nào</div>";
    } else {
        historyData = Object.keys(data).map(key => {
            const o = data[key];
            const d = new Date(o.createdAt || Date.now());
            return {
                ...o,
                id: key,
                dateStr: d.toLocaleDateString('en-GB'),
                timeStr: d.toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}),
                fullTime: d.toLocaleString('en-GB'),
                points: o.points || Math.floor((Number(o.total)||0)/100)
            };
        }).reverse();
        renderHistoryList(historyData);
    }
}

function renderHistoryList(data) {
    if(!data || data.length === 0) return;

    if (window.innerWidth <= 768) {
        renderHistoryMobile(data);
        return;
    }

    const grouped = data.reduce((acc, obj) => {
        const key = obj.dateStr; if (!acc[key]) acc[key] = []; acc [key].push(obj); return acc;
    }, {});

    let html = "";
    Object.keys(grouped).sort((a,b) => {
         const da = a.split('/').reverse().join(''); const db = b.split('/').reverse().join(''); return db.localeCompare(da);
    }).forEach(date => {
        html += `<div class="mb-4 text-left"><h3 class="brand-font text-[#006241] text-[10px] uppercase tracking-widest mb-2 ml-1 text-left">📅 Ngày ${date}</h3><div class="space-y-1.5 text-left">`;
        grouped[date].forEach((h) => {
            const realIdx = historyData.findIndex(item => item.id === h.id);
            const valColor = h.total < 0? 'text-red-500': 'text-[#006241]';
            html += `<div id="h-item-${realIdx}" onclick="selectBill(${realIdx})" class="p-3 bg-white rounded-3xl border-2 border-transparent shadow-sm flex justify-between items-center cursor-pointer active:scale-95 text-xs text-left">
                <div class="min-w-0 text-left">
                    <p class="font-black text-[#006241] uppercase text-left">${h.timeStr}</p>
                    <p class="text-[8px] text-gray-400 font-bold truncate w-20 text-left">${h.sdt}</p>
                </div>
                <p class="font-black ${valColor} text-right">${Number(h.total).toLocaleString()}</p>
            </div>`;
        });
        html += '</div></div>';
    });
    document.getElementById('history-container').innerHTML = html;
}
let sheetStartY = 0;
let sheetCurrentY = 0;
let isSheetDragging = false;

function showHistoryDetailMobile(idx) {
    const h = historyData[idx];
    if (!h) return;

    document.getElementById('detail-mob-time').innerText = h.timeStr + " - " + h.dateStr.slice(0,5);
    document.getElementById('detail-mob-cust').innerText = h.sdt || 'Vãng lai';
    document.getElementById('detail-mob-method').innerText = h.method;
    document.getElementById('detail-mob-total').innerText = Number(h.total).toLocaleString();
    var paidRow = document.getElementById('detail-mob-paid-row');
    var paidEl = document.getElementById('detail-mob-paid');
    var changeEl = document.getElementById('detail-mob-change');
    if (h.paid && Number(h.paid) > 0 && paidRow && paidEl && changeEl) {
        paidEl.innerText = Number(h.paid).toLocaleString() + 'đ';
        changeEl.innerText = Number(h.change || 0).toLocaleString() + 'đ';
        changeEl.className = 'text-sm font-black ' + ((h.change||0) > 0 ? 'text-blue-600' : 'text-gray-400');
        paidRow.classList.remove('hidden');
    } else if (paidRow) {
        paidRow.classList.add('hidden');
    }

    const itemsContainer = document.getElementById('detail-mob-items-list');
    let itemsHtml = '';
    let totalQty = 0;

    const itemsArr = h.items.split(',');

    itemsArr.forEach((itemStr) => {
        const raw = itemStr.trim();
        const lastX = raw.lastIndexOf('x');

        if (lastX !== -1) {
            let namePart = raw.substring(0, lastX).trim();
            const qty = parseInt(raw.substring(lastX + 1)) || 1;
            totalQty += qty;

            let finalName = namePart;
            let size = "";
            let unitPrice = 0;

            if(namePart.includes('(')) {
                let parts = namePart.split('(');
                finalName = parts[0].trim();
                size = parts[1].replace(')', '').trim();
            }

            const menuItem = menu.find(m => m.name.toLowerCase() === finalName.toLowerCase());
            if (menuItem) {
                if (size === 'L') unitPrice = menuItem.priceL;
                else unitPrice = menuItem.priceM || menuItem.priceL;
            }

            let displayPrice = (unitPrice * qty).toLocaleString();
            if(unitPrice === 0) displayPrice = "--";

            itemsHtml += `
            <div class="py-3 border-b border-dashed border-gray-100 flex justify-between items-start group">
                <div class="flex gap-3">
                    <div class="w-6 text-center pt-0.5">
                        <span class="text-[16px] font-black text-[#006B44]">${qty}</span>
                    </div>

                    <div>
                        <h3 class="text-[15px] font-bold text-gray-900 leading-snug">
                            ${finalName}
                        </h3>
                        <div class="flex items-center gap-2 mt-1">
                            ${size ? `<span class="text-[10px] font-black text-[#006B44] bg-[#006B44]/10 px-1.5 py-[2px] rounded text-center min-w-[20px]">${size}</span>` : ''}
                            <span class="text-[12px] text-gray-400 font-bold tracking-wide">${unitPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <span class="text-[15px] font-bold text-gray-900 tabular-nums tracking-tight">${displayPrice}</span>
            </div>`;
        }
    });

    itemsContainer.innerHTML = itemsHtml;
    document.getElementById('detail-item-count').innerText = `Số lượng: ${totalQty} món`;

    const btnCancel = document.getElementById('btn-cancel-order-mobile');
    const totalText = document.getElementById('detail-mob-total');

    if(h.total < 0) {
        btnCancel.classList.add('hidden');
        totalText.parentElement.classList.add('text-red-500');
        totalText.parentElement.classList.remove('text-[#006B44]');
        document.getElementById('detail-mob-total').innerText = "ĐÃ HỦY";
    } else {
        btnCancel.classList.remove('hidden');
        totalText.parentElement.classList.remove('text-red-500');
        totalText.parentElement.classList.add('text-[#006B44]');

        btnCancel.onclick = function() {
            if(confirm("Xác nhận hủy đơn hàng này?")) {
                executeRefundAction(idx, true);
                closeHistoryDetailMobile();
            }
        };
    }

    const sheet = document.getElementById('sheet-history-detail');
    const content = document.getElementById('sheet-content-main');
    sheet.classList.remove('hidden');
    requestAnimationFrame(() => {
        content.classList.remove('translate-y-full');
    });

    setupSwipeToDismiss(content);
}

function closeHistoryDetailMobile() {
    const sheet = document.getElementById('sheet-history-detail');
    const content = document.getElementById('sheet-content-main');

    content.style.transform = '';
    content.classList.add('translate-y-full');

    setTimeout(() => {
        sheet.classList.add('hidden');
    }, 300);
}

function setupSwipeToDismiss(element) {
    const scrollBody = document.getElementById('sheet-scroll-body');

    element.ontouchstart = (e) => {
        if (scrollBody.scrollTop > 0) { isSheetDragging = false; return; }
        isSheetDragging = true;
        sheetStartY = e.touches[0].clientY;
        element.style.transition = 'none';
    };

    element.ontouchmove = (e) => {
        if (!isSheetDragging) return;
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - sheetStartY;
        if (deltaY > 0) {
            if (e.cancelable) e.preventDefault();
            element.style.transform = `translateY(${deltaY}px)`;
        }
    };

    element.ontouchend = (e) => {
        if (!isSheetDragging) return;
        isSheetDragging = false;
        element.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
        const deltaY = e.changedTouches[0].clientY - sheetStartY;
        if (deltaY > 150) closeHistoryDetailMobile();
        else element.style.transform = '';
    };
}

function setupSwipeToDismiss(element) {
    const scrollBody = document.getElementById('sheet-scroll-body');

    element.ontouchstart = (e) => {
        if (scrollBody.scrollTop > 0) {
            isSheetDragging = false;
            return;
        }

        isSheetDragging = true;
        sheetStartY = e.touches[0].clientY;
        element.style.transition = 'none';
    };

    element.ontouchmove = (e) => {
        if (!isSheetDragging) return;

        const currentY = e.touches[0].clientY;
        const deltaY = currentY - sheetStartY;

        if (deltaY > 0) {
            if (e.cancelable) e.preventDefault();

            element.style.transform = `translateY(${deltaY}px)`;
        }
    };

    element.ontouchend = (e) => {
        if (!isSheetDragging) return;
        isSheetDragging = false;

        element.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';

        const currentY = e.changedTouches[0].clientY;
        const deltaY = currentY - sheetStartY;

        if (deltaY > 150) {
            closeHistoryDetailMobile();
        } else {
            element.style.transform = '';
        }
    };
}

function selectBill(idx) {
    selectedRefundItems = [];
    document.querySelectorAll('[id^="h-item-"]').forEach(el => el.classList.remove('history-item-active'));

    var rowEl = document.getElementById(`h-item-${idx}`);
    if (rowEl) rowEl.classList.add('history-item-active');

    const h = historyData[idx];
    if (!h) return;

    let tQty = 0;

    const isAlreadyRefund = h.total < 0;

    let normalizedItems = [];
    if (h.itemsArray && Array.isArray(h.itemsArray) && h.itemsArray.length > 0) {
        normalizedItems = h.itemsArray.map(it => ({
            nameOnly: it.name || '',
            sizePart: it.size || '',
            qty: it.qty || 1,
            uP: it.price || 0,
            isFee: (it.size === 'Phí')
        }));
    } else {
        const items = (h.items || '').split(',');
        normalizedItems = items.map(item => {
            const raw = item.trim();
            const lastX = raw.lastIndexOf('x');
            if (lastX === -1) return null;
            const namePartFull = raw.substring(0, lastX).trim();
            const qty = parseInt(raw.substring(lastX + 1)) || 1;
            let nameOnly = namePartFull, sizePart = '';
            if (namePartFull.includes('(')) {
                const lb = namePartFull.lastIndexOf('(');
                nameOnly = namePartFull.substring(0, lb).trim();
                sizePart = namePartFull.substring(lb + 1, namePartFull.lastIndexOf(')'));
            }
            const m = menu.find(mi => mi.name.toLowerCase() === nameOnly.toLowerCase());
            const uP = m ? (sizePart === 'L' ? m.priceL : m.priceM) : 0;
            return { nameOnly, sizePart, qty, uP, isFee: false };
        }).filter(Boolean);
    }

    const itemsHtml = normalizedItems.map((it, i) => {
        const { nameOnly, sizePart, qty, uP, isFee } = it;
        tQty += qty;
        const subTotal = uP * qty;
        const m = menu.find(mi => mi.name.toLowerCase() === nameOnly.toLowerCase());
        const pts = (m && m.type === 'ăn vặt') ? Math.floor((subTotal/100)*0.4) : Math.floor(subTotal/100);
        const itData = JSON.stringify({ name: nameOnly, size: sizePart, qty, subTotal, itemPoints: pts });

        const sizeTag = isFee
            ? `<span class="text-red-500 font-black text-[12px] ml-1">[Phí]</span>`
            : (sizePart ? `<span class="text-green-500 font-black text-[12px] ml-1">[${sizePart}]</span>` : '');

        return `<div id="refund-row-${i}" onclick='${isAlreadyRefund ? "" : `toggleRefundItem(${i}, ${itData})`}' class="receipt-line p-2 rounded-xl transition-all border-l-4 border-transparent ${isAlreadyRefund ? "opacity-50 text-left" : "cursor-pointer hover:bg-gray-50 text-left"}">
            <div class="flex-1 mr-4 text-left">
                <div class="flex items-start gap-2 text-left">
                    <span class="font-black text-[#006241] text-lg text-left">${qty}x</span>
                    <div class="flex flex-col text-left">
                        <span class="font-black text-[#006241] text-sm capitalize-first leading-tight text-left">${nameOnly} ${sizeTag}</span>
                        <span class="text-[9px] text-gray-400 font-bold italic text-left">Đơn giá: ${uP.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div class="text-right font-black text-[#006241] text-base pt-1 text-right">${subTotal.toLocaleString()}</div>
        </div>`;
    }).join('');

    document.getElementById('history-detail-empty').classList.add('hidden');
    const detail = document.getElementById('history-detail-content');
    detail.classList.remove('hidden');

    detail.innerHTML = `
    <div class="grid grid-cols-12 gap-3 h-full overflow-hidden text-left relative">

        <button onclick="switchView('menu')" class="absolute top-0 right-0 z-50 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div class="col-span-4 border-r border-gray-100 pr-3 flex flex-col pt-2 text-left">
            <h3 class="brand-font text-3xl text-[#006241] leading-none mb-1 text-left">The cafe 33</h3>
            <p class="text-[8px] text-gray-400 font-bold uppercase mb-4 tracking-widest text-left">Hóa đơn điện tử</p>

            <div class="space-y-2 text-left">
                <div class="p-2 bg-gray-50 rounded-xl text-left"><p class="text-[8px] text-gray-400 font-bold uppercase mb-0.5 text-left">Thời gian</p><p class="font-black text-[#006241] text-[10px] leading-tight text-left">${h.fullTime}</p></div>
                <div class="p-2 bg-gray-50 rounded-xl text-left"><p class="text-[8px] text-gray-400 font-bold uppercase mb-0.5 text-left">Khách hàng</p><p class="font-black text-[#006241] text-[10px] leading-tight text-left">${h.sdt}</p></div>
                <div class="p-2 bg-gray-50 rounded-xl border-l-4 ${h.total < 0 ? 'border-red-500 text-left' : 'border-[#006241] text-left'} text-left"><p class="text-[8px] text-gray-400 font-bold uppercase mb-0.5 text-left">Thanh toán</p><p class="font-black ${h.total < 0 ? 'text-red-500 text-left' : 'text-[#006241] text-left'} text-[10px] uppercase text-left">${h.method}</p></div>
            </div>

            ${isAlreadyRefund ?
                '<div class="mt-10 text-center"><p class="text-[10px] font-black text-red-400 uppercase italic text-center">Hóa đơn hoàn trả</p></div>' :
                `<div class="mt-4 space-y-2 text-center">
                    <button onclick="executeRefundAction(${idx}, true)" class="w-full py-3 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all text-center">Hủy toàn bộ</button>
                    <button id="btn-refund-selected" onclick="executeRefundAction(${idx}, false)" class="hidden w-full py-3 border-2 border-red-500 text-red-500 rounded-xl font-black text-[10px] uppercase active:scale-95 transition-all text-center">Hoàn món đã chọn</button>
                </div>
                <div class="mt-auto pt-3 pb-1">
                    <button onclick="openPrintStickerModal(${idx})" class="w-full py-3 bg-[#1f2937] text-white rounded-2xl font-black text-[11px] uppercase active:scale-95 transition-all flex items-center justify-center gap-2 text-center"><svg xmlns='http://www.w3.org/2000/svg' class='h-3.5 w-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' stroke-width='2.5'><path stroke-linecap='round' stroke-linejoin='round' d='M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z'/></svg>In tem</button>
                </div>`
            }

            ${h.sdt === "Khách vãng lai" ? "" :
`<div class="mt-auto mb-2 text-center text-center"><p class="text-amber-600 font-black text-[9px] uppercase italic tracking-tighter text-center"> +${h.points} ĐIỂM</p></div>`
}
        </div>

        <div class="col-span-8 flex flex-col h-full pt-2 overflow-hidden text-left">
            <div id="refund-items-list" class="flex-1 overflow-y-auto pr-1 space-y-0.5 text-left">${itemsHtml}</div>
            <div class="mt-4 pt-4 border-t-2 border-[#006241] flex flex-col items-end flex-shrink-0 text-right">
                <div class="flex justify-between w-full items-center mb-1 text-left"><span class="text-[10px] font-bold text-gray-400 uppercase italic text-left">Số lượng: ${tQty} món</span><span class="brand-font text-[#006241] text-xl uppercase font-black opacity-30 text-right">Tổng bill</span></div>
                <div class="font-black text-3xl leading-none text-right ${h.total < 0 ? 'text-red-500 text-right' : 'text-[#006241] text-right'}">${h.total.toLocaleString()}<span class="text-lg ml-1 text-right">đ</span></div>
                ${(h.splitMeta && h.splitMeta.isSplit && h.splitMeta.groups) ? (() => {
                    let splitHTML = '<div class="mt-3 pt-3 border-t border-dashed border-gray-200 w-full space-y-2">';
                    splitHTML += '<p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Chi tiết tính riêng</p>';
                    h.splitMeta.groups.forEach((g, gi) => {
                        const isCash = g.method === 'cash';
                        const icon   = isCash ? '💵' : '📱';
                        const clr    = isCash ? 'border-green-200 bg-green-50/60' : 'border-indigo-200 bg-indigo-50/60';
                        const txtClr = isCash ? 'text-green-700' : 'text-indigo-700';
                        const itemsStr = (g.items||[]).map(it => `${it.name}${it.size?' '+it.size:''}`).join(', ');
                        splitHTML += `<div class="border ${clr} rounded-xl p-2">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[9px] font-black uppercase ${txtClr}">${icon} Nhóm ${gi+1}</span>
                                <span class="text-[10px] font-black ${txtClr}">${Number(g.subtotal||0).toLocaleString()}đ</span>
                            </div>
                            <p class="text-[9px] text-gray-500 font-bold leading-tight">${itemsStr}</p>
                            ${isCash ? `<div class="flex justify-between mt-1 pt-1 border-t border-green-100">
                                <span class="text-[9px] text-gray-400 font-bold">Nhận: <span class="text-gray-700">${Number(g.paid||0).toLocaleString()}đ</span></span>
                                <span class="text-[9px] text-gray-400 font-bold">Thừa: <span class="${(g.change||0)>0?'text-blue-600':'text-gray-400'}">${Number(g.change||0).toLocaleString()}đ</span></span>
                            </div>` : ''}
                        </div>`;
                    });
                    splitHTML += '</div>';
                    return splitHTML;
                })() : (h.paid && h.paid > 0) ? `
                <div class="mt-3 pt-3 border-t border-dashed border-gray-200 w-full flex flex-col gap-1.5">
                    <div class="flex justify-between items-center w-full">
                        <span class="text-[10px] font-bold text-gray-400 uppercase">Khách đưa</span>
                        <span class="text-sm font-black text-gray-700">${Number(h.paid).toLocaleString()}đ</span>
                    </div>
                    <div class="flex justify-between items-center w-full">
                        <span class="text-[10px] font-bold text-gray-400 uppercase">Tiền thừa</span>
                        <span class="text-sm font-black ${(h.change||0) > 0 ? 'text-blue-600' : 'text-gray-400'}">${Number(h.change||0).toLocaleString()}đ</span>
                    </div>
                </div>` : ''}
            </div>
        </div>
    </div>`;
}

var _secretRevenueOn = false;
function toggleSecretRevenue() {
    _secretRevenueOn = !_secretRevenueOn;
    var btn = document.getElementById('btn-secret-revenue');
    var btnMob = document.getElementById('btn-mob-secret-revenue');
    var mainEl   = document.getElementById('pc-drink-main');
    var secretEl = document.getElementById('pc-drink-secret');
    var khacEl   = document.getElementById('pc-khac-sub');
    var snackEl  = document.getElementById('pc-secret-snack');
    var payEl    = document.getElementById('pc-secret-payment');
    var yesterdayEl = document.getElementById('pc-secret-yesterday');
    var pcLabel  = document.getElementById('pc-drink-label');
    var mobCards = document.getElementById('mob-secret-cards');
    var mobLabel = document.getElementById('mob-drink-label');

    var s = lastStatsCache || window._lastMobileStats;

    if (_secretRevenueOn) {
        if (btn)    { btn.style.background = '#1f2937'; btn.style.borderColor = '#1f2937'; }
        if (btnMob) { btnMob.style.background = '#1f2937'; btnMob.style.borderColor = '#1f2937'; }
        if (pcLabel) pcLabel.innerText = 'Tổng nước';
        if (mainEl)  mainEl.classList.add('hidden');
        if (secretEl) secretEl.classList.remove('hidden');
        if (khacEl)  khacEl.classList.remove('hidden');
        if (snackEl) snackEl.classList.remove('hidden');
        if (payEl)   { payEl.classList.remove('hidden'); payEl.classList.add('grid'); }
        if (yesterdayEl) yesterdayEl.classList.remove('hidden');
        if (mobLabel) mobLabel.innerText = 'Tổng nước';
        if (mobCards) { mobCards.style.display = 'contents'; }
        if (s) {
            var secretChartData = (s.drinkChartData || s.chartData).map(function(v, i) {
                return v + ((s.khacChartData || [])[i] || 0);
            });
            if (typeof renderChart === 'function' && s.labels)
                renderChart(s.labels, secretChartData, currentRevMode, '#006241');
            if (typeof renderMobileChartBars === 'function' && s.labels)
                renderMobileChartBars(s.labels, secretChartData, '#006241');
            var drinkPlusKhac = (s.drinkTotal||0) + (s.khacTotal||0);
            var fullTotal = drinkPlusKhac + (s.snackTotal||0);
            var mobRevTotal = document.getElementById('mob-rev-total');
            if (mobRevTotal) mobRevTotal.innerHTML = '<span class="text-3xl">' + drinkPlusKhac.toLocaleString() + '</span> <span class="text-xs font-bold opacity-60">₫</span>';
            var mobChartTotal = document.getElementById('mob-chart-total');
            if (mobChartTotal) mobChartTotal.innerText = fullTotal.toLocaleString() + ' ₫';
        }
    } else {
        if (btn)    { btn.style.background = ''; btn.style.borderColor = ''; }
        if (btnMob) { btnMob.style.background = ''; btnMob.style.borderColor = ''; }
        if (pcLabel) pcLabel.innerText = 'Tổng thu';
        if (mainEl)  mainEl.classList.remove('hidden');
        if (secretEl) secretEl.classList.add('hidden');
        if (khacEl)  khacEl.classList.add('hidden');
        if (snackEl) snackEl.classList.add('hidden');
        if (payEl)   { payEl.classList.add('hidden'); payEl.classList.remove('grid'); }
        if (yesterdayEl) yesterdayEl.classList.add('hidden');
        if (mobLabel) mobLabel.innerText = 'Tổng thu';
        if (mobCards) { mobCards.style.display = 'none'; }
        if (s) {
            var drinkData = s.drinkChartData || s.chartData;
            if (typeof renderChart === 'function' && s.labels)
                renderChart(s.labels, drinkData, currentRevMode, '#006241');
            if (typeof renderMobileChartBars === 'function' && s.labels)
                renderMobileChartBars(s.labels, drinkData, '#006241');
            var mobRevTotal = document.getElementById('mob-rev-total');
            if (mobRevTotal) mobRevTotal.innerHTML = '<span class="text-3xl">' + (s.drinkTotal||0).toLocaleString() + '</span> <span class="text-xs font-bold opacity-60">₫</span>';
            var mobChartTotal = document.getElementById('mob-chart-total');
            if (mobChartTotal) mobChartTotal.innerText = (s.drinkTotal||0).toLocaleString() + ' ₫';
        }
    }
}

