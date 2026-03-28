function openRevenueMobile() {
    var mobBar = document.getElementById('mobile-bottom-bar');
    if(mobBar) {
        mobBar.classList.add('hidden');
        mobBar.classList.remove('flex');
    }

    document.getElementById('sidebar-cart').classList.add('hidden');

    ['view-menu', 'view-payment', 'view-history', 'view-bed', 'view-revenue'].forEach(id => {
        var el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    document.getElementById('view-bed-mobile').classList.add('hidden');

    const histMobEl2 = document.getElementById('view-history-mobile');
    if (histMobEl2) histMobEl2.classList.add('hidden');

    document.getElementById('view-revenue-mobile').classList.remove('hidden');

    fetchRevenueDataMobile(currentRevMode);
}
var currentRevLabelOverride = null;
var currentChartFilter = 'total';
var lastStatsCache = null;

function toggleSmartTimeDropdown() {
    const dd = document.getElementById('smart-time-dropdown');
    const ol = document.getElementById('smart-time-overlay');

    if (dd.classList.contains('hidden')) {
        dd.classList.remove('hidden');
        ol.classList.remove('hidden');
    } else {
        dd.classList.add('hidden');
        ol.classList.add('hidden');
    }
}

function selectSmartTime(type) {
    toggleSmartTimeDropdown();

    const now = new Date();
    let start, end;
    let label = "";
    let mode = 'custom';

    if (type === 'this_week') {
        switchRevTime('week');
        return;
    }
    else if (type === 'this_month') {
        switchRevTime('month');
        return;
    }
    else if (type === 'last_week') {
        let day = now.getDay() || 7;
        let endLastWeek = new Date(now);
        endLastWeek.setDate(now.getDate() - day);
        endLastWeek.setHours(23,59,59,999);

        let startLastWeek = new Date(endLastWeek);
        startLastWeek.setDate(endLastWeek.getDate() - 6);
        startLastWeek.setHours(0,0,0,0);

        start = startLastWeek.toISOString().split('T')[0];
        end = endLastWeek.toISOString().split('T')[0];
        label = "Tuần trước";
    }
    else if (type === 'last_month') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);

        let format = (d) => {
            let y = d.getFullYear();
            let m = String(d.getMonth()+1).padStart(2,'0');
            let day = String(d.getDate()).padStart(2,'0');
            return `${y}-${m}-${day}`;
        };

        start = format(start);
        end = format(end);
        label = "Tháng trước";
    }

    currentRevLabelOverride = label;

    ['week', 'month', 'year'].forEach(m => {
        document.getElementById(`tab-rev-${m}`).className = "flex-1 py-2.5 rounded-full text-[11px] font-bold text-slate-400 transition-all";
    });

    currentRevMode = 'custom';
    fetchRevenueDataMobile('custom', start, end);
}

let currentRevenueView = 'overview';

function switchRevenueView(viewMode) {
    currentRevenueView = viewMode;
    toggleRevenueDropdown();

    const titleEl = document.getElementById('mob-chart-title');
    if (titleEl) {
        if(viewMode === 'overview') titleEl.innerText = "Biểu đồ doanh thu";
        else if(viewMode === 'items') titleEl.innerText = "Top 10 Món Bán Chạy";
        else if(viewMode === 'groups') titleEl.innerText = "Doanh Thu Theo Nhóm";
        else if(viewMode === 'bed') titleEl.innerText = "Doanh Thu Cafe in Bed";
    }

    fetchRevenueDataMobile(currentRevMode);
}

let currentItemSort = 'desc';
let customSelectedItems = null;

function updateRevenueItemsUI(data) {
    const labelMap = {'day': 'Hôm nay', 'week': 'Tuần này', 'month': 'Tháng này', 'year': 'Năm nay', 'custom': 'Tùy chọn'};
    let finalLabel = currentRevLabelOverride || labelMap[currentRevMode] || 'Chi tiết';
    const labelEl = document.getElementById('mob-chart-label');
    if(labelEl) labelEl.innerText = finalLabel;

    document.getElementById('mob-rev-total').innerHTML = `
        <span class="text-3xl">${data.totalRev.toLocaleString()}</span>
        <span class="text-xs font-bold opacity-60">₫</span>
    `;

    const container = document.getElementById('mob-rev-chart-bars');
    container.className = "w-full flex flex-col gap-3 pb-4";

    let sortLabel = currentItemSort === 'desc' ? "Cao ⬇" : "Thấp ⬆";
    let filterLabel = customSelectedItems ? "Tùy chọn" : "Top 10 (Mặc định)";
    let filterClass = customSelectedItems
        ? "bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100"
        : "bg-white text-slate-600 border-slate-100 shadow-sm";

    let html = `
    <div class="flex flex-col gap-3 mb-4">
        <div class="flex justify-between items-end px-1">
            <span class="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Xếp hạng</span>
        </div>
        <div class="flex gap-3">
            <button onclick="openItemSelectModal()" class="flex-1 flex items-center justify-center gap-2 ${filterClass} border py-2.5 px-4 rounded-full active:scale-95 transition-all group">
                <span class="material-symbols-outlined text-[18px] group-active:scale-110 transition-transform">tune</span>
                <span class="text-[11px] font-bold uppercase tracking-wide">${filterLabel}</span>
            </button>
            <button onclick="toggleItemSort()" class="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 py-2.5 px-5 rounded-full active:scale-95 transition-all">
                <span class="material-symbols-outlined text-[18px]">sort</span>
                <span class="text-[11px] font-bold">${sortLabel}</span>
            </button>
        </div>
    </div>`;

    if (data.topItems.length === 0) {
        container.innerHTML = html + '<div class="flex flex-col items-center justify-center py-10 text-gray-300 gap-2"><span class="text-3xl">📭</span><span class="text-xs font-medium">Chưa có số liệu</span></div>';
        document.getElementById('mob-chart-total').innerText = "0 ₫";
        return;
    }

    const maxVal = Math.max(...data.topItems.map(i => i.total), 1);

    const displayedTotal = data.topItems.reduce((acc, item) => acc + item.total, 0);
    document.getElementById('mob-chart-total').innerText = displayedTotal.toLocaleString() + ' ₫';

    html += '<div class="space-y-3">';
    html += data.topItems.map((item, index) => {
        let percent = Math.round((item.total / maxVal) * 100);
        let rankBg = 'bg-slate-100 text-slate-500';
        let rankText = 'text-slate-500';

        if(currentItemSort === 'desc' && !customSelectedItems) {
            if(index === 0) { rankBg = 'bg-yellow-100'; rankText = 'text-yellow-700'; }
            else if(index === 1) { rankBg = 'bg-gray-100'; rankText = 'text-gray-700'; }
            else if(index === 2) { rankBg = 'bg-orange-50'; rankText = 'text-orange-700'; }
        }
        let barColor = (item.total > 0) ? 'bg-[#006241]' : 'bg-slate-200';

        return `
        <div class="w-full group">
            <div class="flex justify-between items-center mb-1.5">
                <div class="flex items-center gap-3 max-w-[70%]">
                    <div class="w-6 h-6 rounded-full ${rankBg} ${rankText} flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm border border-white">
                        ${index + 1}
                    </div>
                    <div class="flex flex-col min-w-0">
                        <span class="font-bold text-[13px] text-slate-700 truncate leading-tight">${item.name}</span>
                        ${item.qty > 0 ? `<span class="text-[9px] font-bold text-slate-400">Đã bán: ${item.qty}</span>` : ''}
                    </div>
                </div>
                <span class="font-black text-[13px] text-[#006241] whitespace-nowrap">${item.total.toLocaleString()}</span>
            </div>
            <div class="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                <div class="h-full ${barColor} rounded-full transition-all duration-1000 ease-out relative" style="width: ${percent}%">
                    <div class="absolute inset-0 bg-white/20"></div>
                </div>
            </div>
        </div>`;
    }).join('');
    html += '</div>';
    container.innerHTML = html;
}

function calculateTopItems(orders, mode, customStart, customEnd) {
    var now = new Date(); var startTime, endTime;
    if (mode === 'week') { var day = now.getDay() || 7; startTime = new Date(now); startTime.setDate(now.getDate() - day + 1); startTime.setHours(0,0,0,0); endTime = new Date(startTime); endTime.setDate(startTime.getDate() + 6); endTime.setHours(23,59,59,999); }
    else if (mode === 'month') { startTime = new Date(now.getFullYear(), now.getMonth(), 1); endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); }
    else if (mode === 'year') { startTime = new Date(now.getFullYear(), 0, 1); endTime = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); }
    else if (mode === 'day') { startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0); endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); }
    else { if(!customStart || !customEnd) return { topItems: [], totalRev: 0 }; startTime = new Date(customStart); startTime.setHours(0,0,0,0); endTime = new Date(customEnd); endTime.setHours(23,59,59,999); }

    let itemMap = {}; let totalRevenue = 0;
    orders.forEach(o => {
        var d = new Date(o.createdAt || Date.now());
        if (d >= startTime && d <= endTime) {
            totalRevenue += Number(o.total || 0);
            if (o.itemsArray && Array.isArray(o.itemsArray)) {
                o.itemsArray.forEach(item => {
                    let name = item.name;
                    if (!itemMap[name]) itemMap[name] = { qty: 0, total: 0 };
                    itemMap[name].qty += (item.qty || 0);
                    itemMap[name].total += (item.price * item.qty || 0);
                });
            } else if (o.items) {
                let parts = o.items.split(',');
                parts.forEach(p => {
                    let cleanP = p.trim(); let xIndex = cleanP.lastIndexOf('x');
                    if(xIndex > -1) {
                        let namePart = cleanP.substring(0, xIndex).trim();
                        let parenIndex = namePart.indexOf('(');
                        if(parenIndex > -1) namePart = namePart.substring(0, parenIndex).trim();
                        let qty = parseInt(cleanP.substring(xIndex+1)) || 1;
                        if (!itemMap[namePart]) itemMap[namePart] = { qty: 0, total: 0 };
                        itemMap[namePart].qty += qty;
                    }
                });
            }
        }
    });

    let finalItems = [];
    if (customSelectedItems && customSelectedItems.length > 0) {
        customSelectedItems.forEach(name => {
            if (itemMap[name]) finalItems.push({ name: name, ...itemMap[name] });
            else finalItems.push({ name: name, qty: 0, total: 0 });
        });
    } else {
        let sorted = Object.keys(itemMap).map(k => ({name: k, ...itemMap[k]}));
        sorted.sort((a, b) => b.total - a.total);
        finalItems = sorted.slice(0, 10);
    }

    if (currentItemSort === 'desc') finalItems.sort((a, b) => b.total - a.total);
    else finalItems.sort((a, b) => a.total - b.total);

    return { topItems: finalItems, totalRev: totalRevenue };
}

function toggleItemSort() {
    currentItemSort = (currentItemSort === 'desc') ? 'asc' : 'desc';
    fetchRevenueDataMobile(currentRevMode);
}

function openItemSelectModal() {
    let uniqueItems = [...new Set(menu.map(m => m.name))].sort();
    const listEl = document.getElementById('item-select-list');
    listEl.innerHTML = uniqueItems.map(name => {
        let isChecked = customSelectedItems ? customSelectedItems.includes(name) : false;
        return `
        <label class="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl cursor-pointer active:bg-gray-50 transition-colors">
            <span class="font-bold text-gray-700 text-sm select-none">${name}</span>
            <input type="checkbox" value="${name}" ${isChecked ? 'checked' : ''} onchange="handleItemCheck(this)" class="w-5 h-5 rounded border-gray-300 accent-[#006241]">
        </label>`;
    }).join('');
    updateSelectCount();
    document.getElementById('modal-item-select').classList.remove('hidden');
}

function handleItemCheck(el) { updateSelectCount(); }
function updateSelectCount() {
    const count = document.querySelectorAll('#item-select-list input[type="checkbox"]:checked').length;
    document.getElementById('item-select-count').innerText = `Đã chọn: ${count} món`;
}
function filterItemSelectionList(keyword) {
    const kw = keyword.toLowerCase();
    document.querySelectorAll('#item-select-list label').forEach(lbl => {
        lbl.style.display = lbl.querySelector('span').innerText.toLowerCase().includes(kw) ? 'flex' : 'none';
    });
}
function resetItemSelection() {
    customSelectedItems = null;
    document.getElementById('modal-item-select').classList.add('hidden');
    fetchRevenueDataMobile(currentRevMode);
}
function applyItemSelection() {
    const checkboxes = document.querySelectorAll('#item-select-list input[type="checkbox"]:checked');
    if (checkboxes.length === 0) return alert("Vui lòng chọn ít nhất 1 món!");
    customSelectedItems = Array.from(checkboxes).map(cb => cb.value);
    document.getElementById('modal-item-select').classList.add('hidden');
    fetchRevenueDataMobile(currentRevMode);
}

function calculateGroupRevenue(orders, mode, customStart, customEnd) {
    var now = new Date(); var startTime, endTime;
    if (mode === 'week') { var day = now.getDay() || 7; startTime = new Date(now); startTime.setDate(now.getDate() - day + 1); startTime.setHours(0,0,0,0); endTime = new Date(startTime); endTime.setDate(startTime.getDate() + 6); endTime.setHours(23,59,59,999); }
    else if (mode === 'month') { startTime = new Date(now.getFullYear(), now.getMonth(), 1); endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); }
    else if (mode === 'year') { startTime = new Date(now.getFullYear(), 0, 1); endTime = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); }
    else if (mode === 'day') { startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0); endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); }
    else { if(!customStart || !customEnd) return { groups: [], totalRev: 0 }; startTime = new Date(customStart); startTime.setHours(0,0,0,0); endTime = new Date(customEnd); endTime.setHours(23,59,59,999); }

    let groupMap = {}; let totalRevenue = 0;
    orders.forEach(o => {
        var d = new Date(o.createdAt || Date.now());
        if (d >= startTime && d <= endTime) {
            totalRevenue += Number(o.total || 0);
            const process = (name, qty, price) => {
                const m = menu.find(mi => mi.name.toLowerCase() === name.toLowerCase());
                let gName = m ? m.type : "Khác";
                gName = gName.charAt(0).toUpperCase() + gName.slice(1);
                if (!groupMap[gName]) groupMap[gName] = { qty: 0, total: 0 };
                groupMap[gName].qty += qty;
                groupMap[gName].total += (price * qty);
            };
            if (o.itemsArray) o.itemsArray.forEach(i => process(i.name, i.qty||1, i.price||0));
            else if (o.items) {
                o.items.split(',').forEach(p => {
                    let raw = p.trim(), x = raw.lastIndexOf('x');
                    if(x>-1) {
                        let n = raw.substring(0, x).trim();
                        let idx = n.indexOf('('); if(idx>-1) n=n.substring(0,idx).trim();
                        let q = parseInt(raw.substring(x+1))||1;
                        let m = menu.find(mi=>mi.name.toLowerCase()===n.toLowerCase());
                        process(n, q, m?(m.priceM||0):0);
                    }
                });
            }
        }
    });
    let sorted = Object.keys(groupMap).map(k => ({name: k, ...groupMap[k]})).sort((a,b)=>b.total-a.total);
    return { groups: sorted, totalRev: totalRevenue };
}

function toggleItemSort() {
    currentItemSort = (currentItemSort === 'desc') ? 'asc' : 'desc';
    fetchRevenueDataMobile(currentRevMode);
}
    function openItemSelectModal() {
    let uniqueItems = [...new Set(menu.map(m => m.name))].sort();

    const listEl = document.getElementById('item-select-list');
    listEl.innerHTML = uniqueItems.map(name => {
        let isChecked = false;
        if (customSelectedItems) {
            isChecked = customSelectedItems.includes(name);
        }

        return `
        <label class="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl cursor-pointer active:bg-gray-50 transition-colors">
            <span class="font-bold text-gray-700 text-sm select-none">${name}</span>
            <input type="checkbox" value="${name}"
                ${isChecked ? 'checked' : ''}
                onchange="handleItemCheck(this)"
                class="w-5 h-5 rounded border-gray-300 accent-[#006241]">
        </label>
        `;
    }).join('');

    updateSelectCount();
    document.getElementById('modal-item-select').classList.remove('hidden');
}
    function handleItemCheck(el) {
    const checkboxes = document.querySelectorAll('#item-select-list input[type="checkbox"]:checked');
    updateSelectCount();
}
    function updateSelectCount() {
    const count = document.querySelectorAll('#item-select-list input[type="checkbox"]:checked').length;
    document.getElementById('item-select-count').innerText = `Đã chọn: ${count} món`;
}

function filterItemSelectionList(keyword) {
    const kw = keyword.toLowerCase();
    const labels = document.querySelectorAll('#item-select-list label');
    labels.forEach(lbl => {
        const text = lbl.querySelector('span').innerText.toLowerCase();
        lbl.style.display = text.includes(kw) ? 'flex' : 'none';
    });
}
    function resetItemSelection() {
    customSelectedItems = null;
    document.getElementById('modal-item-select').classList.add('hidden');
    fetchRevenueDataMobile(currentRevMode);
}

function applyItemSelection() {
    const checkboxes = document.querySelectorAll('#item-select-list input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert("Vui lòng chọn ít nhất 1 món hoặc bấm 'Mặc định'");
        return;
    }

    customSelectedItems = Array.from(checkboxes).map(cb => cb.value);

    document.getElementById('modal-item-select').classList.add('hidden');
    fetchRevenueDataMobile(currentRevMode);
}
function fetchRevenueDataMobile(mode, startVal, endVal) {
    const summaryCards = document.getElementById('mob-revenue-summary-cards');

    if (currentRevenueView !== 'overview') {
        if(summaryCards) summaryCards.classList.add('hidden');
    } else {
        if(summaryCards) summaryCards.classList.remove('hidden');
    }

    document.getElementById('mob-rev-total').innerText = "...";

    if (currentRevenueView === 'bed') {
        _fetchBedBookingsForStats(mode, startVal, endVal, function(bookings) {
            const bedStats = calculateBedStats(bookings, mode, startVal, endVal);
            updateRevenueBedUI(bedStats);
        });
        return;
    }

    // Xác định khoảng ngày fetch đúng theo mode (mobile)
    var now = new Date();
    var mobFetchStart, mobFetchEnd;
    if (startVal && endVal) {
        mobFetchStart = new Date(startVal);
        mobFetchEnd   = new Date(endVal);
    } else if (mode === 'year') {
        mobFetchStart = new Date(now.getFullYear(), 0, 1);
        mobFetchEnd   = new Date(now.getFullYear(), 11, 31);
    } else if (mode === 'month') {
        mobFetchStart = new Date(now.getFullYear(), now.getMonth(), 1);
        mobFetchEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (mode === 'week') {
        var dow = now.getDay() || 7;
        mobFetchStart = new Date(now); mobFetchStart.setDate(now.getDate() - dow + 1); mobFetchStart.setHours(0,0,0,0);
        mobFetchEnd   = new Date(mobFetchStart); mobFetchEnd.setDate(mobFetchStart.getDate() + 6);
    } else {
        mobFetchStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        mobFetchEnd   = new Date(mobFetchStart);
    }

    fetchOrdersByDateRange(mobFetchStart, mobFetchEnd).then(orders => {

        if (currentRevenueView === 'overview') {
            const chartBox = document.getElementById('mob-rev-chart-bars');
            let isScrollMode = (mode === 'month') || (mode === 'custom' && (!startVal || !endVal || Math.abs(new Date(endVal) - new Date(startVal)) > 12 * 86400000));

            if (isScrollMode) {
                chartBox.className = "relative h-64 w-full flex items-end justify-start gap-3 mb-8 overflow-x-auto custom-scrollbar px-2 pb-2";
            } else {
                chartBox.className = "relative h-64 w-full flex items-end justify-between gap-2 mb-8 overflow-hidden px-1";
            }

            const stats = calculateStats(orders, mode, startVal, endVal);
            if(stats) updateRevenueUIMobile(stats, mode);

        } else if (currentRevenueView === 'items') {
            const result = calculateTopItems(orders, mode, startVal, endVal);
            updateRevenueItemsUI(result);

        } else if (currentRevenueView === 'groups') {
            const result = calculateGroupRevenue(orders, mode, startVal, endVal);
            updateRevenueGroupsUI(result);
        }
    });
}
function calculateGroupRevenue(orders, mode, customStart, customEnd) {
    var now = new Date();
    var startTime, endTime;

    if (mode === 'week') {
        var day = now.getDay() || 7;
        startTime = new Date(now); startTime.setDate(now.getDate() - day + 1); startTime.setHours(0,0,0,0);
        endTime = new Date(startTime); endTime.setDate(startTime.getDate() + 6); endTime.setHours(23,59,59,999);
    } else if (mode === 'month') {
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
        endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (mode === 'year') {
        startTime = new Date(now.getFullYear(), 0, 1);
        endTime = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (mode === 'day') {
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else {
        if(!customStart || !customEnd) return { groups: [], totalRev: 0 };
        startTime = new Date(customStart); startTime.setHours(0,0,0,0);
        endTime = new Date(customEnd); endTime.setHours(23,59,59,999);
    }

    let groupMap = {};
    let totalRevenue = 0;

    orders.forEach(o => {
        var d = new Date(o.createdAt || Date.now());
        if (d >= startTime && d <= endTime) {
            totalRevenue += Number(o.total || 0);

            const processItem = (name, qty, price) => {
                const menuItem = menu.find(m => m.name.toLowerCase() === name.toLowerCase());

                let groupName = menuItem ? menuItem.type : "Khác";

                groupName = groupName.charAt(0).toUpperCase() + groupName.slice(1);

                if (!groupMap[groupName]) groupMap[groupName] = { qty: 0, total: 0 };
                groupMap[groupName].qty += qty;
                groupMap[groupName].total += (price * qty);
            };

            if (o.itemsArray && Array.isArray(o.itemsArray)) {
                o.itemsArray.forEach(item => {
                    processItem(item.name, item.qty || 1, item.price || 0);
                });
            } else if (o.items) {
                let parts = o.items.split(',');
                parts.forEach(p => {
                    let cleanP = p.trim();
                    let xIndex = cleanP.lastIndexOf('x');
                    if(xIndex > -1) {
                        let namePart = cleanP.substring(0, xIndex).trim();
                        let parenIndex = namePart.indexOf('(');
                        if(parenIndex > -1) namePart = namePart.substring(0, parenIndex).trim();
                        let qty = parseInt(cleanP.substring(xIndex+1)) || 1;

                        const mInfo = menu.find(m => m.name.toLowerCase() === namePart.toLowerCase());
                        let estimatedPrice = mInfo ? (mInfo.priceM || mInfo.priceL || 0) : 0;

                        processItem(namePart, qty, estimatedPrice);
                    }
                });
            }
        }
    });

    let sortedGroups = Object.keys(groupMap).map(key => {
        return { name: key, ...groupMap[key] };
    }).sort((a, b) => b.total - a.total);

    return { groups: sortedGroups, totalRev: totalRevenue };
}
function updateRevenueGroupsUI(data) {
    const labelMap = {'day': 'Hôm nay', 'week': 'Tuần này', 'month': 'Tháng này', 'year': 'Năm nay', 'custom': 'Tùy chọn'};
    let finalLabel = currentRevLabelOverride || labelMap[currentRevMode] || 'Chi tiết';

    const labelEl = document.getElementById('mob-chart-label');
    if(labelEl) labelEl.innerText = finalLabel;
    const container = document.getElementById('mob-rev-chart-bars');
    container.className = "w-full flex flex-col gap-3 pb-4";

    document.getElementById('mob-chart-total').innerText = data.totalRev.toLocaleString() + ' ₫';

    let html = `
    <div class="flex justify-between items-center mb-3 pb-2 border-b border-dashed border-gray-200">
        <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phân loại doanh thu</span>
        <span class="text-[10px] font-bold text-gray-400">Cao ➝ Thấp</span>
    </div>
    `;

    if (data.groups.length === 0) {
        container.innerHTML = html + '<div class="text-center text-gray-300 py-10 text-xs">Chưa có dữ liệu</div>';
        return;
    }

    const maxVal = Math.max(...data.groups.map(i => i.total), 1);

    html += '<div class="space-y-4">';

    html += data.groups.map((group, index) => {
        let percent = Math.round((group.total / maxVal) * 100);

        let icon = "category";
        if(group.name.toLowerCase().includes('cà phê')) icon = "coffee";
        else if(group.name.toLowerCase().includes('trà')) icon = "local_cafe";
        else if(group.name.toLowerCase().includes('ăn vặt')) icon = "cookie";
        else if(group.name.toLowerCase().includes('sinh tố')) icon = "blender";

        let isTop1 = index === 0;
        let barColor = isTop1 ? 'bg-amber-500' : 'bg-[#006241]';
        let iconBg = isTop1 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500';

        return `
        <div class="w-full group">
            <div class="flex justify-between items-center mb-1.5">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shadow-sm border border-white">
                        <span class="material-symbols-outlined text-[16px]">${icon}</span>
                    </div>

                    <div class="flex flex-col">
                        <span class="font-black text-[13px] text-slate-800 leading-tight">${group.name}</span>
                        <span class="text-[9px] font-bold text-slate-400">Đã bán: ${group.qty}</span>
                    </div>
                </div>

                <div class="flex flex-col items-end">
                    <span class="font-black text-[13px] text-[#006241]">${group.total.toLocaleString()}</span>
                    <span class="text-[9px] font-bold text-slate-400">${Math.round((group.total/data.totalRev)*100)}%</span>
                </div>
            </div>

            <div class="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full ${barColor} rounded-full transition-all duration-1000 ease-out relative" style="width: ${percent}%">
                    <div class="absolute inset-0 bg-white/20"></div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    html += '</div>';

    container.innerHTML = html;
}
function updateRevenueUIMobile(stats, mode) {

    document.getElementById('mob-rev-total').innerHTML = `
        <span class="text-3xl">${stats.drinkTotal.toLocaleString()}</span>
        <span class="text-xs font-bold opacity-60">₫</span>
    `;

    document.getElementById('mob-rev-snack').innerHTML = `
        <span class="text-3xl">${stats.snackTotal.toLocaleString()}</span>
        <span class="text-xs font-bold opacity-60">₫</span>
    `;

    const transferEl = document.getElementById('mob-rev-transfer');
    if (transferEl) transferEl.innerHTML = `
        <span class="text-3xl">${(stats.transferTotal||0).toLocaleString()}</span>
        <span class="text-xs font-bold opacity-60">₫</span>
    `;

    const cashEl = document.getElementById('mob-rev-cash');
    if (cashEl) cashEl.innerHTML = `
        <span class="text-3xl">${(stats.cashTotal||0).toLocaleString()}</span>
        <span class="text-xs font-bold opacity-60">₫</span>
    `;

    lastStatsCache = stats;
    currentChartFilter = 'total';
    updateFilterCardStyles('total');
    renderMobileChartBars(stats.labels, stats.chartData, '#006241');

    document.getElementById('mob-chart-total').innerText = stats.drinkTotal.toLocaleString() + ' ₫';
    window._lastMobileStats = stats;

    const labelMap = {'day': 'Hôm nay', 'week': 'Tuần này', 'month': 'Tháng này', 'year': 'Năm nay', 'custom': 'Tùy chọn'};
    let finalLabel = currentRevLabelOverride || labelMap[mode] || 'Chi tiết';
    const labelEl = document.getElementById('mob-chart-label');
    if(labelEl) labelEl.innerText = finalLabel;
}

function openMobileDateFilter() {
    const modal = document.getElementById('modal-date-range');
    if(modal) {
        modal.classList.remove('hidden');

        const today = new Date().toISOString().split('T')[0];
        const startInput = document.getElementById('filter-start-date');
        const endInput = document.getElementById('filter-end-date');

        if(startInput && !startInput.value) startInput.value = today;
        if(endInput && !endInput.value) endInput.value = today;
    } else {
    }
}

function submitDateFilter() {
    const start = document.getElementById('filter-start-date').value;
    const end = document.getElementById('filter-end-date').value;

    if(!start || !end) return alert("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc");
    if(new Date(start) > new Date(end)) return alert("Ngày bắt đầu không được lớn hơn ngày kết thúc");

    document.getElementById('modal-date-range').classList.add('hidden');

    currentRevMode = 'custom';

    ['day', 'week', 'month', 'year'].forEach(m => {
        const btn = document.getElementById(`tab-rev-${m}`);
        if(btn) btn.className = "flex-1 py-2.5 rounded-full text-[11px] font-bold text-slate-400 transition-all";
    });

    fetchRevenueDataMobile('custom', start, end);
}
function switchRevTime(mode) {
    currentRevMode = mode;
    currentRevLabelOverride = null;

    ['day', 'week', 'month', 'year'].forEach(m => {
        const btn = document.getElementById(`tab-rev-${m}`);
        if (!btn) return;
        if(m === mode) {
            btn.className = "flex-1 py-2.5 rounded-full text-[11px] font-black bg-[#065F46] text-white shadow-sm transition-all";
        } else {
            btn.className = "flex-1 py-2.5 rounded-full text-[11px] font-bold text-slate-400 transition-all";
        }
    });
    fetchRevenueDataMobile(mode);
}

function toggleRevenueDropdown() {
    const dd = document.getElementById('mob-revenue-dropdown');
    const ol = document.getElementById('mob-revenue-overlay');
    if(dd.classList.contains('hidden')) {
        dd.classList.remove('hidden');
        ol.classList.remove('hidden');
    } else {
        dd.classList.add('hidden');
        ol.classList.add('hidden');
    }
}

function quickPaidMobile(v) {
    let input = document.getElementById('cash-paid-mobile');
    if(input) {
        input.value = v.toLocaleString('en-US');
        if(typeof syncMobileInputs === 'function') syncMobileInputs();

        if(navigator.vibrate) navigator.vibrate(50);
    }
}
function selectDurationNew(hours) {
    selectedDurationHours = hours;

    const hiddenInput = document.getElementById('final_duration_minutes');
    if(hiddenInput) hiddenInput.value = hours * 60;

    [1, 2, 3].forEach(h => {
        const btn = document.getElementById(`btn-dur-${h}`);
        if(btn) btn.className = "border border-gray-200 bg-white text-gray-600 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all";
    });

    const activeBtn = document.getElementById(`btn-dur-${hours}`);
    if(activeBtn) activeBtn.className = "border border-green-600 bg-green-50 text-[#006241] py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all";
}
function calculateBedStats(bookings, mode, customStart, customEnd) {
    var now = new Date();
    var startTime, endTime;

    if (mode === 'week') {
        var day = now.getDay() || 7;
        startTime = new Date(now); startTime.setDate(now.getDate() - day + 1); startTime.setHours(0,0,0,0);
        endTime = new Date(startTime); endTime.setDate(startTime.getDate() + 6); endTime.setHours(23,59,59,999);
    } else if (mode === 'month') {
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
        endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (mode === 'year') {
        startTime = new Date(now.getFullYear(), 0, 1);
        endTime = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (mode === 'day') {
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else {
        if(!customStart || !customEnd) return null;
        startTime = new Date(customStart); startTime.setHours(0,0,0,0);
        endTime = new Date(customEnd); endTime.setHours(23,59,59,999);
    }

    let stats = {
        totalRevenue: 0,
        totalUsage: 0,
        topSpenders: {},
        topFrequent: {},
        cancelTimeout: 0,
        cancelCustomer: 0,
        cancelList: []
    };

    bookings.forEach(b => {
        let parts = (b.date || "").split('/');
        if(parts.length !== 3) return;
        let bDate = new Date(parts[2], parts[1]-1, parts[0]);

        if (bDate >= startTime && bDate <= endTime) {

            if (b.status === 'đã xong') {
                let money = Number(b.totalSpend || 0);

                stats.totalRevenue += money;
                stats.totalUsage++;

                let key = b.phone || "Vãng lai";
                if (!stats.topSpenders[key]) stats.topSpenders[key] = { name: b.name, total: 0, phone: key };
                stats.topSpenders[key].total += money;

                if (!stats.topFrequent[key]) stats.topFrequent[key] = { name: b.name, count: 0, phone: key };
                stats.topFrequent[key].count++;
            }
            else if (b.status === 'đã hủy') {
                if (b.cancelType === 'auto_timeout') {
                    stats.cancelTimeout++;
                } else {
                    stats.cancelCustomer++;
                }

                stats.cancelList.push(b);
            }
        }
    });

    stats.topSpendersArr = Object.values(stats.topSpenders).sort((a,b) => b.total - a.total).slice(0, 5);
    stats.topFrequentArr = Object.values(stats.topFrequent).sort((a,b) => b.count - a.count).slice(0, 5);

    return stats;
}
function updateRevenueBedUI(stats) {
    if(!stats) return;
    const labelMap = {'day': 'Hôm nay', 'week': 'Tuần này', 'month': 'Tháng này', 'year': 'Năm nay', 'custom': 'Tùy chọn'};
    let finalLabel = currentRevLabelOverride || labelMap[currentRevMode] || 'Chi tiết';
    const labelEl = document.getElementById('mob-chart-label');
    if(labelEl) labelEl.innerText = finalLabel;

    document.getElementById('mob-chart-total').innerText = stats.totalRevenue.toLocaleString() + ' ₫';

    const container = document.getElementById('mob-rev-chart-bars');

    container.className = "w-full flex flex-col gap-5 pb-4 overflow-visible";

    let html = `
    <div class="grid grid-cols-2 gap-3 mb-2">
        <div class="bg-emerald-50/50 p-4 rounded-[20px] border border-emerald-100 flex flex-col items-center justify-center text-center">
            <p class="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Tổng thu Bed</p>
            <p class="text-2xl font-black text-[#006241]">${stats.totalRevenue.toLocaleString()}<span class="text-xs ml-1 opacity-70">đ</span></p>
        </div>
        <div class="bg-blue-50/50 p-4 rounded-[20px] border border-blue-100 flex flex-col items-center justify-center text-center">
            <p class="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1">Số lượt dùng</p>
            <p class="text-2xl font-black text-blue-700">${stats.totalUsage}<span class="text-xs ml-1 opacity-70">lượt</span></p>
        </div>
    </div>
    `;

    html += `
    <div class="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
        <div class="flex items-center gap-2 mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <h4 class="text-[11px] font-black uppercase tracking-wider text-gray-500">Top 5 Chi Tiêu</h4>
        </div>
        <div class="space-y-2.5">`;

    if(stats.topSpendersArr.length === 0) html += '<p class="text-xs text-center text-gray-400 py-2">Chưa có dữ liệu</p>';
    else {
        stats.topSpendersArr.forEach((user, idx) => {
            let medal = idx === 0 ? "🥇" : (idx === 1 ? "🥈" : (idx === 2 ? "🥉" : `#${idx+1}`));
            html += `
            <div class="flex justify-between items-center text-sm">
                <div class="flex items-center gap-2 overflow-hidden">
                    <span class="text-xs w-5 text-center font-bold text-gray-400">${medal}</span>
                    <span class="font-bold text-slate-700 truncate">${user.name}</span>
                </div>
                <span class="font-black text-[#006241] whitespace-nowrap">${user.total.toLocaleString()}</span>
            </div>`;
        });
    }
    html += `</div></div>`;

    html += `
    <div class="bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
        <div class="flex items-center gap-2 mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <h4 class="text-[11px] font-black uppercase tracking-wider text-gray-500">Top 5 Thường Xuyên</h4>
        </div>
        <div class="space-y-2.5">`;

    if(stats.topFrequentArr.length === 0) html += '<p class="text-xs text-center text-gray-400 py-2">Chưa có dữ liệu</p>';
    else {
        stats.topFrequentArr.forEach((user, idx) => {
            html += `
            <div class="flex justify-between items-center text-sm">
                <div class="flex items-center gap-2 overflow-hidden">
                    <span class="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold">${idx+1}</span>
                    <span class="font-bold text-slate-700 truncate">${user.name}</span>
                </div>
                <span class="font-black text-blue-600">${user.count} <span class="text-[9px] font-medium text-gray-400">lần</span></span>
            </div>`;
        });
    }
    html += `</div></div>`;

    window.currentCancelList = stats.cancelList;

    html += `
    <div class="bg-red-50 rounded-2xl p-4 border border-red-100 relative overflow-hidden">
        <div class="flex justify-between items-start mb-3 relative z-10">
            <div>
                <h4 class="text-[11px] font-black uppercase tracking-wider text-red-500 mb-1">Thống kê hủy</h4>
                <p class="text-[9px] font-medium text-red-400">Tổng cộng: ${stats.cancelTimeout + stats.cancelCustomer} lịch</p>
            </div>
            <button onclick="showCancelDetailsModal()" class="bg-white text-red-500 text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all border border-red-100">
                Xem chi tiết
            </button>
        </div>

        <div class="grid grid-cols-2 gap-3 relative z-10">
            <div class="bg-white/60 rounded-xl p-2.5 flex flex-col items-center">
                <span class="text-2xl font-black text-red-600">${stats.cancelTimeout}</span>
                <span class="text-[9px] font-bold text-gray-500 uppercase">Quá giờ</span>
            </div>
            <div class="bg-white/60 rounded-xl p-2.5 flex flex-col items-center">
                <span class="text-2xl font-black text-red-600">${stats.cancelCustomer}</span>
                <span class="text-[9px] font-bold text-gray-500 uppercase">Khách hủy</span>
            </div>
        </div>
    </div>
    `;

    container.innerHTML = html;
}

function showCancelDetailsModal() {
    const list = window.currentCancelList || [];
    const container = document.getElementById('cancel-list-content');

    if(list.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-400 py-10">Không có lịch hủy nào.</div>';
    } else {
        container.innerHTML = list.map(b => {
            let reason = 'Khách yêu cầu';
            let badgeColor = 'text-red-500 bg-red-50 border-red-100';

            if (b.cancelType === 'auto_timeout') {
                reason = 'Quá giờ (Auto)';
                badgeColor = 'text-gray-500 bg-gray-100 border-gray-200';
            } else if (b.cancelType === 'store') {
                reason = 'Quán hủy (System)';
                badgeColor = 'text-orange-600 bg-orange-50 border-orange-100';
            }

            let date = b.date || b.bookingDate || '--/--';

            return `
            <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div class="flex justify-between mb-1">
                    <span class="font-bold text-sm text-gray-800">${b.name}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}">${reason}</span>
                </div>
                <div class="flex justify-between text-[10px] text-gray-500">
                    <span>${date} • ${b.start}-${b.end}</span>
                    <span class="font-mono">${b.phone}</span>
                </div>
                ${b.note ? `<p class="text-[10px] text-gray-400 italic mt-1 border-t border-gray-200 pt-1">"${b.note}"</p>` : ''}
            </div>
            `;
        }).join('');
    }

    document.getElementById('modal-cancel-list').classList.remove('hidden');
}
