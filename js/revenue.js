function openRevenue(mode) {
    if (!mode) mode = 'day';

    var isSwitchingMode = !document.getElementById('view-history').classList.contains('hidden') &&
                          document.getElementById('btn-nav-revenue').classList.contains('tab-active');

    if (isSwitchingMode) {
        var miniLoader = document.getElementById('mini-loader');
        if (miniLoader) miniLoader.classList.remove('hidden');

        var content = document.getElementById('history-detail-content');
        if (content) {
            content.style.opacity = "0.6";
            content.style.pointerEvents = "none";
        }
    } else {
        document.getElementById('loading-overlay').style.display = 'flex';
        switchView('revenue');
    }

    var startEl = document.getElementById('rev-start');
    var endEl = document.getElementById('rev-end');
    var startVal = startEl ? startEl.value : null;
    var endVal = endEl ? endEl.value : null;

    // Xác định khoảng ngày fetch đúng theo mode
    var now = new Date();
    var fetchStart, fetchEnd;
    if (startVal && endVal) {
        // Custom range từ date picker
        fetchStart = new Date(startVal);
        fetchEnd   = new Date(endVal);
    } else if (mode === 'year') {
        fetchStart = new Date(now.getFullYear(), 0, 1);
        fetchEnd   = new Date(now.getFullYear(), 11, 31);
    } else if (mode === 'month') {
        fetchStart = new Date(now.getFullYear(), now.getMonth(), 1);
        fetchEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (mode === 'week') {
        var dow = now.getDay() || 7;
        fetchStart = new Date(now); fetchStart.setDate(now.getDate() - dow + 1); fetchStart.setHours(0,0,0,0);
        fetchEnd   = new Date(fetchStart); fetchEnd.setDate(fetchStart.getDate() + 6);
    } else {
        // day hoặc fallback
        fetchStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        fetchEnd   = new Date(fetchStart);
    }

    fetchOrdersByDateRange(fetchStart, fetchEnd).then(function(allOrders) {

        document.getElementById('loading-overlay').style.display = 'none';

        try {

            var stats = calculateStats(allOrders, mode, startVal, endVal);

            if (stats) {
                renderDailyRevenueList(stats.dailyList);
                renderRevenueDashboard(stats, mode);
            }
        } catch (e) {
            alert("Lỗi: " + e.message);
            var content = document.getElementById('history-detail-content');
            if (content) { content.style.opacity = "1"; content.style.pointerEvents = "auto"; }
        }
    });
}
function calculateStats(orders, mode, customStart, customEnd) {
    var now = new Date();
    var startTime, endTime;
    var labels = [];
    var chartData = [];
    var groupType = 'day';

    if (mode === 'week') {
        var day = now.getDay() || 7;
        startTime = new Date(now); startTime.setDate(now.getDate() - day + 1); startTime.setHours(0,0,0,0);
        endTime = new Date(startTime); endTime.setDate(startTime.getDate() + 6); endTime.setHours(23,59,59,999);
        labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        chartData = [0,0,0,0,0,0,0];
    }
    else if (mode === 'month') {
        startTime = new Date(now.getFullYear(), now.getMonth(), 1);
        endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        var daysInMonth = endTime.getDate();
        for (var i = 1; i <= daysInMonth; i++) { labels.push(i.toString()); chartData.push(0); }
    }
    else if (mode === 'year') {
        startTime = new Date(now.getFullYear(), 0, 1);
        endTime = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        chartData = [0,0,0,0,0,0,0,0,0,0,0,0];
        groupType = 'month';
    }
    else if (mode === 'day') {
        startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        labels = ['0h','2h','4h','6h','8h','10h','12h','14h','16h','18h','20h','22h'];
        chartData = [0,0,0,0,0,0,0,0,0,0,0,0];
        groupType = 'hour2';
    }
    else if (mode === 'custom') {
        if (!customStart || !customEnd) return null;
        startTime = new Date(customStart); startTime.setHours(0,0,0,0);
        endTime = new Date(customEnd); endTime.setHours(23,59,59,999);
        var diffTime = Math.abs(endTime - startTime);
        var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 31) {
            groupType = 'month';
            labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
            chartData = [0,0,0,0,0,0,0,0,0,0,0,0];
        } else {
            for (var j = 0; j <= diffDays; j++) {
                var dTemp = new Date(startTime); dTemp.setDate(dTemp.getDate() + j);
                labels.push(dTemp.getDate() + "/" + (dTemp.getMonth()+1));
                chartData.push(0);
            }
        }
    }

    var drinkChartData  = chartData.map(() => 0);
    var snackChartData   = chartData.map(() => 0);
    var khacChartData    = chartData.map(() => 0);
    var transferChartData= chartData.map(() => 0);
    var cashChartData    = chartData.map(() => 0);
    var stats = { drinkTotal: 0, snackTotal: 0, khacTotal: 0, transferTotal: 0, cashTotal: 0, labels: labels, chartData: chartData, drinkChartData, snackChartData, khacChartData, transferChartData, cashChartData, dailyList: {}, today: 0, yesterday: 0 };

    var todayStr = now.toLocaleDateString('en-GB');
    var yest = new Date(now); yest.setDate(now.getDate() - 1);
    var yestStr = yest.toLocaleDateString('en-GB');

    orders.forEach(function(o) {
        var d = new Date(o.createdAt || Date.now());
        var dateKey = d.toLocaleDateString('en-GB');
        var amount = Number(o.total) || 0;
        if (amount <= 0) return;

        if (dateKey === todayStr) stats.today += amount;
        if (dateKey === yestStr) stats.yesterday += amount;

        if (d >= startTime && d <= endTime) {

            var orderDrink = 0; var orderSnack = 0; var orderKhac = 0;

            const processSingleItem = (name, qty, itemPrice) => {
                const menuItem = menu.find(m => m.name.toLowerCase() === name.toLowerCase());

                const finalPrice = (itemPrice > 0) ? itemPrice : (menuItem ? (menuItem.priceM || menuItem.priceL) : 0);
                const subTotal = finalPrice * qty;

                const type = menuItem ? String(menuItem.type || "").toLowerCase() : "";

                if (type.includes('ăn vặt') || type.includes('đồ ăn') || type.includes('snack')) {
                    stats.snackTotal += subTotal;
                    orderSnack += subTotal;
                } else if (type.includes('khác') || type === 'khac') {
                    stats.khacTotal = (stats.khacTotal || 0) + subTotal;
                    orderKhac += subTotal;
                } else {
                    stats.drinkTotal += subTotal;
                    orderDrink += subTotal;
                }
            };

            if (o.itemsArray && Array.isArray(o.itemsArray)) {
                o.itemsArray.forEach(i => {
                    processSingleItem(i.name, i.qty || 1, i.price || 0);
                });
            }
            else if (o.items) {
                var itemStrings = String(o.items).split(',');
                itemStrings.forEach(str => {
                    str = str.trim();
                    var xIndex = str.lastIndexOf('x');
                    if (xIndex > -1) {
                        var qty = parseInt(str.substring(xIndex + 1)) || 1;
                        var nameFull = str.substring(0, xIndex).trim();
                        var nameOnly = nameFull.split('(')[0].trim();
                        processSingleItem(nameOnly, qty, 0);
                    }
                });
            }

            const orderMethod = String(o.method || '').toLowerCase();
            if (orderMethod.includes('chuyển khoản') || orderMethod.includes('chuyen khoan') || orderMethod.includes('bank') || orderMethod.includes('transfer')) {
                stats.transferTotal += amount;
            } else {
                stats.cashTotal += amount;
            }

            if (!stats.dailyList[dateKey]) stats.dailyList[dateKey] = { drink: 0 };
            stats.dailyList[dateKey].drink += orderDrink;

            var idx = -1;
            if (groupType === 'month') idx = d.getMonth();
            else if (mode === 'month') idx = d.getDate() - 1;
            else if (mode === 'week') idx = (d.getDay() + 6) % 7;
            else if (mode === 'day' || groupType === 'hour2') idx = Math.floor(d.getHours() / 2);
            else if (mode === 'custom' && labels.length <= 31) {
                var timeDiff = d.getTime() - startTime.getTime();
                idx = Math.floor(timeDiff / (1000 * 3600 * 24));
            }

            if (idx >= 0 && idx < chartData.length) {
                chartData[idx] += orderDrink;
                drinkChartData[idx]    += orderDrink;
                snackChartData[idx]    += orderSnack;
                khacChartData[idx]     += orderKhac;
                if (orderMethod.includes('chuyển khoản') || orderMethod.includes('chuyen khoan') || orderMethod.includes('bank') || orderMethod.includes('transfer')) {
                    transferChartData[idx] += amount;
                } else {
                    cashChartData[idx] += amount;
                }
            }
        }
    });
    return stats;
}
function renderDailyRevenueList(list) {
    let html = '<div class="mb-4 text-left"><h3 class="brand-font text-[#006241] text-[10px] uppercase tracking-widest mb-2 ml-1 text-left">Doanh thu</h3><div class="space-y-1.5 text-left">';
    Object.keys(list).sort((a,b) => { const da = a.split('/').reverse().join(''); const db = b.split('/').reverse().join(''); return db.localeCompare(da); }).forEach(date => {
        html += `<div class="p-3 bg-white rounded-2xl shadow-sm text-left"><p class="font-black text-[#006241] text-[10px] uppercase text-left">📅 ${date}</p><p class="text-[11px] font-black text-[#006241] mt-1 text-left">${list[date].drink.toLocaleString()}đ</p></div>`;
    });
    html += '</div></div>';
    document.getElementById('history-container').innerHTML = html;
}

function renderRevenueDashboard(data, mode) {
    document.getElementById('history-detail-empty').classList.add('hidden');
    const detail = document.getElementById('history-detail-content');
    detail.classList.remove('hidden');

    detail.style.opacity = "1";
    detail.style.pointerEvents = "auto";

    const diff = data.today - data.yesterday;
    const dColor = diff >= 0 ? 'text-green-500': 'text-red-500';
    const dIcon = diff >= 0 ? '▲': '▼';

    const activeBtn = "bg-[#006241] text-white shadow-md font-bold rounded-full transform scale-105";
    const inactiveBtn = "bg-transparent text-gray-500 hover:bg-gray-100 font-medium rounded-full";

    _secretRevenueOn = false;
    detail.innerHTML = `
    <div class="flex flex-col h-full space-y-4 text-left pt-2 px-1">

        <div class="flex flex-row items-center justify-between gap-2 z-10 relative">
            <div class="flex bg-white p-1 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 shrink-0">
                <button onclick="openRevenue('day')" class="px-5 py-2 text-[10px] uppercase transition-all duration-300 ${mode==='day'?activeBtn:inactiveBtn}">Hôm nay</button>
                <button onclick="openRevenue('week')" class="px-5 py-2 text-[10px] uppercase transition-all duration-300 ${mode==='week'?activeBtn:inactiveBtn}">Tuần</button>
                <button onclick="openRevenue('month')" class="px-5 py-2 text-[10px] uppercase transition-all duration-300 ${mode==='month'?activeBtn:inactiveBtn}">Tháng</button>
                <button onclick="openRevenue('year')" class="px-5 py-2 text-[10px] uppercase transition-all duration-300 ${mode==='year'?activeBtn:inactiveBtn}">Năm</button>
            </div>

            <div class="flex items-center gap-2 bg-white p-1 pl-3 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 shrink-0">
                <div id="mini-loader" class="hidden animate-spin rounded-full h-3 w-3 border-[2px] border-t-[#006241] border-gray-100 mr-1"></div>
                <div class="flex items-center gap-1 border-r border-gray-100 pr-2 mr-1">
                    <input type="date" id="rev-start" class="text-[10px] font-bold text-[#006241] outline-none bg-transparent w-[70px] uppercase cursor-pointer">
                    <span class="text-gray-300 font-light">-</span>
                    <input type="date" id="rev-end" class="text-[10px] font-bold text-[#006241] outline-none bg-transparent w-[70px] uppercase cursor-pointer">
                </div>
                <button onclick="openRevenue('custom')" class="w-8 h-8 bg-[#006241] text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
                <button id="btn-secret-revenue" onclick="toggleSecretRevenue()" title="" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all active:scale-95 text-base border border-gray-200">🐶</button>
                <button onclick="switchView('menu')" class="w-8 h-8 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 ml-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-3 text-left z-0 relative">

            <div id="pc-filter-drink" onclick="setChartFilter('drink')" class="p-4 bg-white rounded-[32px] border border-gray-50 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center cursor-pointer hover:shadow-md active:scale-95 transition-all ring-[#006241]">
                <p id="pc-drink-label" class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng thu</p>
                <p id="pc-drink-main" class="brand-font text-xl text-[#006241]">${data.drinkTotal.toLocaleString()}</p>
                <p id="pc-drink-secret" class="brand-font text-xl text-slate-400 hidden">${(data.drinkTotal + (data.khacTotal||0)).toLocaleString()}</p>
                <p id="pc-khac-sub" class="text-[8px] text-slate-300 hidden">+ Khác: ${(data.khacTotal||0).toLocaleString()}</p>
            </div>

            <div id="pc-secret-snack" class="hidden">
            <div id="pc-filter-snack" onclick="setChartFilter('snack')" class="p-4 bg-white rounded-[32px] border border-gray-50 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center cursor-pointer hover:shadow-md active:scale-95 transition-all ring-[#D97706]">
                <p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ăn vặt</p>
                <p class="brand-font text-xl text-amber-500">${data.snackTotal.toLocaleString()}</p>
            </div>
            </div>

            <div id="pc-secret-yesterday" class="hidden p-4 bg-white rounded-[32px] border border-gray-50 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center">
                <p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">So hôm qua</p>
                <div class="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full mt-1">
                    <span class="text-[10px] ${dColor}">${dIcon}</span>
                    <span class="font-black text-xs ${dColor}">${Math.abs(diff).toLocaleString()}</span>
                </div>
            </div>
        </div>

        <div id="pc-secret-payment" class="hidden grid grid-cols-2 gap-3 text-left z-0 relative">
            <div id="pc-filter-transfer" onclick="setChartFilter('transfer')" class="p-4 bg-white rounded-[32px] border border-gray-50 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center cursor-pointer hover:shadow-md active:scale-95 transition-all ring-[#0369a1]">
                <p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Chuyển khoản</p>
                <p class="brand-font text-xl text-[#0369a1]">${data.transferTotal.toLocaleString()}</p>
            </div>
            <div id="pc-filter-cash" onclick="setChartFilter('cash')" class="p-4 bg-white rounded-[32px] border border-gray-50 shadow-[0_4px_15px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center cursor-pointer hover:shadow-md active:scale-95 transition-all ring-[#16a34a]">
                <p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tiền mặt</p>
                <p class="brand-font text-xl text-[#16a34a]">${data.cashTotal.toLocaleString()}</p>
            </div>
        </div>

        <div class="flex-1 bg-white p-5 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col relative overflow-hidden z-0">
            <canvas id="revenueChart"></canvas>
        </div>
    </div>`;

    lastStatsCache = data;
    currentChartFilter = 'total';
    updateFilterCardStyles('total');
    setTimeout(() => {
        renderChart(data.labels, data.chartData, mode, '#006241');
    }, 200);
}
function renderChart(labels, chartData, type, color) {
    color = color || '#006241';
    const ctx = document.getElementById('revenueChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'bar', plugins: [ChartDataLabels],
        data: { labels, datasets: [{ data: chartData, backgroundColor: color + 'CC', borderRadius: 6, hoverBackgroundColor: color }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: { anchor: 'end', align: 'top', formatter: (v) => v != 0 ? (v/1000).toFixed(0) + 'k': '', font: { weight: 'bold', size: 9 }, color: color} }, scales: { y: { display: false }, x: { grid: { display: false }, ticks: { font: { weight: 'bold', size: 8} } } } }
    });
}

const CHART_FILTER_CONFIG = {
    total:    { key: 'chartData',       color: '#006241', label: 'Tổng thu'       },
    drink:    { key: 'drinkChartData',  color: '#006241', label: 'Tổng nước'      },
    snack:    { key: 'snackChartData',  color: '#D97706', label: 'Ăn vặt'         },
    transfer: { key: 'transferChartData',color:'#0369a1', label: 'Chuyển khoản'   },
    cash:     { key: 'cashChartData',   color: '#16a34a', label: 'Tiền mặt'       },
};

function setChartFilter(type) {
    if (currentChartFilter === type) type = 'total';
    currentChartFilter = type;
    applyPCChartFilter(type);
    applyMobileChartFilter(type);
    updateFilterCardStyles(type);
}

function applyPCChartFilter(type) {
    if (!lastStatsCache) return;
    const cfg = CHART_FILTER_CONFIG[type] || CHART_FILTER_CONFIG.total;
    const data = lastStatsCache[cfg.key] || lastStatsCache.chartData;
    renderChart(lastStatsCache.labels, data, currentRevMode, cfg.color);
}

function applyMobileChartFilter(type) {
    if (!lastStatsCache) return;
    const cfg = CHART_FILTER_CONFIG[type] || CHART_FILTER_CONFIG.total;
    const data = lastStatsCache[cfg.key] || lastStatsCache.chartData;
    renderMobileChartBars(lastStatsCache.labels, data, cfg.color);

    const total = (data || []).reduce((a, b) => a + b, 0);
    const totalEl = document.getElementById('mob-chart-total');
    if (totalEl) totalEl.innerText = total.toLocaleString() + ' ₫';
}

function renderMobileChartBars(labels, data, color) {
    const chartBox = document.getElementById('mob-rev-chart-bars');
    if (!chartBox) return;
    const maxVal = Math.max(...data, 1);
    let isScrollMode = labels.length > 12;
    let barsHtml = '';
    labels.forEach((lbl, index) => {
        const val = data[index] || 0;
        let heightPct = 0;
        if (val > 0) { heightPct = Math.round((val / maxVal) * 100); if (heightPct < 15) heightPct = 15; }
        const isMax = val === maxVal && val > 0;
        let labelVal = '';
        if (val >= 1000000) labelVal = (val/1000000).toFixed(1) + 'tr';
        else if (val > 0) labelVal = (val/1000).toFixed(0) + 'k';
        let colClass = isScrollMode ? 'min-w-[40px] flex-shrink-0' : 'flex-1';
        const barColor = isMax ? color : (color + '66');
        barsHtml += `
        <div class="${colClass} flex flex-col items-center group h-full justify-end relative">
            <div class="w-full relative flex flex-col justify-end items-center h-full">
                ${val > 0 ? `<div class="mb-1 text-[9px] font-black text-slate-500 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-md shadow-sm border border-slate-100 z-10 whitespace-nowrap">${labelVal}</div>` : ''}
                <div class="w-3 sm:w-5 rounded-t-lg transition-all duration-500 ease-out" style="height:${heightPct}%;background-color:${barColor};"></div>
            </div>
            <span class="mt-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate w-full text-center">${lbl}</span>
        </div>`;
    });
    chartBox.innerHTML = barsHtml;
}

function updateFilterCardStyles(activeType) {
    const configs = {
        'total':    { pcId: null, mobId: null  },
        'drink':    { pcId: 'pc-filter-drink',    mobId: 'mob-filter-drink'    },
        'snack':    { pcId: 'pc-filter-snack',    mobId: 'mob-filter-snack'    },
        'transfer': { pcId: 'pc-filter-transfer', mobId: 'mob-filter-transfer' },
        'cash':     { pcId: 'pc-filter-cash',     mobId: 'mob-filter-cash'     },
    };
    Object.values(configs).forEach(cfg => {
        [cfg.pcId, cfg.mobId].filter(Boolean).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('ring-2', 'ring-offset-1', 'scale-[1.03]', 'shadow-md');
                el.style.opacity = '1';
            }
        });
    });
    const active = configs[activeType];
    if (active) {
        [active.pcId, active.mobId].filter(Boolean).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('ring-2', 'ring-offset-1', 'scale-[1.03]', 'shadow-md');
        });

    }
}

function switchView(v) {
    var histMob = document.getElementById('view-history-mobile');
    if (histMob) histMob.classList.add('hidden');

    isPaymentMode = (v === 'payment');
    var isMobile = window.innerWidth <= 768;

    if (!isMobile) {
        var _payBtn = document.getElementById('sidebar-pay-btn');
        var _backBtn = document.getElementById('sidebar-back-btn');
        if (_payBtn) _payBtn.classList.toggle('hidden', isPaymentMode);
        if (_backBtn) _backBtn.classList.toggle('hidden', !isPaymentMode);
    }

    var mobBar = document.getElementById('mobile-bottom-bar');
    if (mobBar) {
        if (v === 'menu') {
            mobBar.classList.remove('hidden');
            mobBar.classList.add('flex');
        } else {
            mobBar.classList.add('hidden');
            mobBar.classList.remove('flex');
        }
    }

    var bedMob = document.getElementById('view-bed-mobile');
    if(bedMob) bedMob.classList.add('hidden');

    var revMob = document.getElementById('view-revenue-mobile');
    if(revMob) revMob.classList.add('hidden');

    if (v === 'bed' && isMobile) {
        openBedManagerMobile();
        return;
    }

    ['menu', 'payment', 'history', 'bed', 'revenue', 'discount'].forEach(id => {
        var viewEl = document.getElementById('view-' + id);
        if (viewEl) viewEl.classList.add('hidden');

        var btn = document.getElementById('btn-nav-' + id);
        if (btn) {
            btn.classList.remove('tab-active', 'sb-green', 'text-white');
            btn.className = 'bg-gray-100 text-gray-400 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase active:scale-95 transition-all';
        }
    });

    if (v === 'revenue') {
        if (isMobile) {
            openRevenueMobile();
            return;
        } else {
            document.getElementById('view-history').classList.remove('hidden');
            let btn = document.getElementById('btn-nav-revenue');
            if(btn) btn.className = 'sb-green text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tab-active';
        }
    }
    else if (v === 'history') {
        if (isMobile) {
            if(histMob) {
                histMob.classList.remove('hidden');
                document.getElementById('view-menu').classList.add('hidden');
            }
        } else {
            document.getElementById('view-history').classList.remove('hidden');
            let btn = document.getElementById('btn-nav-history');
            if(btn) btn.className = 'sb-green text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tab-active';
        }
    }
    else if (v === 'bed') {
        document.getElementById('view-bed').classList.remove('hidden');
        let btn = document.getElementById('btn-nav-bed');
        if(btn) btn.className = 'sb-green text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tab-active';
    }
    else if (v === 'discount') {
        document.getElementById('view-discount').classList.remove('hidden');
        switchMgrTab('menueditor'); // reset về tab mặc định
        let btn = document.getElementById('btn-nav-discount');
        if(btn) btn.className = 'sb-green text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tab-active';
    }
    else {
        var viewTarget = document.getElementById('view-' + v);
        if (viewTarget) viewTarget.classList.remove('hidden');
    }

    var sidebarCart = document.getElementById('sidebar-cart');
    if (sidebarCart) {
        if (isMobile) sidebarCart.classList.toggle('hidden', v !== 'menu');
        else sidebarCart.classList.toggle('hidden', v !== 'menu' && v !== 'payment');
    }

    var catBar = document.getElementById('category-bar');
    if (catBar) catBar.classList.toggle('hidden', v !== 'menu');

if (v === 'payment') {
    if (typeof renderCart === 'function') renderCart();

    if (window.innerWidth <= 768) {

        var pcInput = document.getElementById('kh-sdt');
        var mobInput = document.getElementById('pay-sdt-mobile');

        if (pcInput && mobInput) {
            mobInput.value = pcInput.value;

            var cleanSdt = normalizePhone(pcInput.value);
            var custNameEl = document.getElementById('pay-cust-name-mobile');
            if (custNameEl && customerMap[cleanSdt]) {
                 custNameEl.innerHTML = `<div class="mt-3 bg-green-50 p-2 rounded-xl text-center"><span class="text-xs font-black text-green-700">★ ${customerMap[cleanSdt].name}</span></div>`;
                 custNameEl.style.height = "auto";
            }
        }

        var mobStep1 = document.getElementById('mob-step-1');
        var mobStep2 = document.getElementById('mob-step-2');
        if (mobStep1) mobStep1.classList.remove('hidden');
        if (mobStep2) mobStep2.classList.add('hidden');
    }
    else {
        var payBtnSw = document.getElementById('sidebar-pay-btn');
        var backBtnSw = document.getElementById('sidebar-back-btn');
        if (payBtnSw) payBtnSw.classList.add('hidden');
        if (backBtnSw) backBtnSw.classList.remove('hidden');
    }

    if (typeof setMethod === 'function') setMethod('Tiền mặt');
}
}

var globalAllBookings = [];
var currentFilterDateStr = "";

// Load bookings cho 1 hoặc nhiều ngày từ RT path YYYY/MM/DD
// days: mảng string "YYYY-MM-DD"
// callback(bookings)
function _loadBedBookingsForDays(days, callback) {
    var results = [];
    var pending = days.length;
    if (pending === 0) { callback([]); return; }

    function _pushItems(data, year, month, day) {
        Object.keys(data).forEach(function(k) {
            var item = data[k];
            var rawDate = item.date || item.bookingDate || (day + '/' + month + '/' + year);
            if (rawDate.includes('-') && rawDate.split('-')[0].length === 4) {
                var p2 = rawDate.split('-');
                rawDate = p2[2] + '/' + p2[1] + '/' + p2[0];
            }
            results.push({
                id: k,
                ...item,
                start: item.start || item.startTime || '--:--',
                end:   item.end   || item.endTime   || '--:--',
                displayDate: rawDate
            });
        });
    }

    days.forEach(function(dayStr) {
        var p = dayStr.split('-');
        var year = p[0], month = p[1], day = p[2];

        db.ref('bedBookings/' + year + '/' + month + '/' + day).once('value', function(snap) {
            var data = snap.val();
            if (data && Object.keys(data).length > 0) {
                _pushItems(data, year, month, day);
                pending--;
                if (pending === 0) callback(results);
            } else {
                // Fallback Firestore nested: bedBookings_archive/{year}/{month}/{day}
                fstore.collection('bedBookings_archive').doc(year)
                    .collection(month).doc(day).get()
                    .then(function(doc) {
                        if (doc.exists) {
                            _pushItems(doc.data().bookings || {}, year, month, day);
                        }
                        pending--;
                        if (pending === 0) callback(results);
                    }).catch(function(err) {
                        console.warn('[loadBedBookings] Firestore loi ' + dayStr + ':', err.message);
                        pending--;
                        if (pending === 0) callback(results);
                    });
            }
        });
    });
}

