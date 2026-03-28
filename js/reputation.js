function pushHistoryState(name) {
    if (history.state && history.state.view === name) return;
    history.pushState({ view: name }, null, "");
}

const originalSwitchView = switchView;
switchView = function(v) {
    originalSwitchView(v);
    if (v !== 'menu') {
        pushHistoryState(v);
    }
};

const originalOpenBookingModal = openBookingModal;
openBookingModal = function() {
    originalOpenBookingModal();
    pushHistoryState('booking_modal');
};

const originalShowMobileBedDetail = showMobileBedDetail;
showMobileBedDetail = function(id) {
    originalShowMobileBedDetail(id);
    pushHistoryState('bed_detail');
};

const originalHandleBedCheckout = handleBedCheckout;
handleBedCheckout = function(booking) {
    originalHandleBedCheckout(booking);
    setTimeout(() => {
        if(!document.getElementById('modal-smart-checkout').classList.contains('hidden')) {
            pushHistoryState('smart_checkout');
        }
    }, 50);
};

window.addEventListener('popstate', function(event) {

    const closeBooking = () => document.getElementById('modal-add-booking').classList.add('hidden');
    const closeSmart = () => {
        const m = document.getElementById('modal-smart-checkout');
        m.classList.add('opacity-0', 'scale-95');
        setTimeout(() => m.classList.add('hidden'), 200);
    };

    const smartModal = document.getElementById('modal-smart-checkout');
    if (smartModal && !smartModal.classList.contains('hidden')) {
        closeSmart();
        return;
    }

    const bookingModal = document.getElementById('modal-add-booking');
    if (bookingModal && !bookingModal.classList.contains('hidden')) {
        closeBookingModal();
        return;
    }

    const bedDetail = document.getElementById('mob-bed-detail-screen');
    if (bedDetail && !bedDetail.classList.contains('translate-x-full')) {
        closeMobileBedDetail();
        return;
    }

    const bedSelect = document.getElementById('bed-select-modal');
    if (bedSelect && !bedSelect.classList.contains('hidden')) {
        bedSelect.classList.add('hidden');
        return;
    }

    const viewMenu = document.getElementById('view-menu');
    if (viewMenu && viewMenu.classList.contains('hidden')) {
        originalSwitchView('menu');

        document.querySelectorAll('button[id^="btn-nav-"]').forEach(b => {
            b.classList.remove('tab-active', 'sb-green', 'text-white');
            b.classList.add('bg-gray-100', 'text-gray-400');
        });
        return;
    }

});

window.addEventListener('load', function() {
    history.replaceState({ view: 'menu' }, null, "");
});

const REP_DEFAULT = 100;
const REP_MAX = 100;
const REP_WARN_THRESHOLD = 60;

function getRepTier(score) {
    if (score >= 80) return { label: 'Tin tưởng', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
    if (score >= 60) return { label: 'Chú ý',    color: '#ca8a04', bg: '#fefce8', border: '#fde68a' };
    if (score >= 40) return { label: 'Rủi ro',   color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' };
    return             { label: 'Cấm',            color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
}

async function getRepScore(phone) {
    if (!phone) return REP_DEFAULT;
    try {
        const snap = await firebase.database().ref('reputation/' + normalizePhone(phone)).once('value');
        const val = snap.val();
        if (!val) return REP_DEFAULT;
        return Math.max(0, Math.min(REP_MAX, val.score != null ? val.score : REP_DEFAULT));
    } catch(e) { return REP_DEFAULT; }
}

async function updateRepScore(phone, name, delta, reason, bookingId) {
    if (!phone) return;
    try {
        const normPhone = normalizePhone(phone);
        const ref = firebase.database().ref('reputation/' + normPhone);
        const snap = await ref.once('value');
        const val = snap.val() || {};
        const oldScore = Math.max(0, Math.min(REP_MAX, val.score != null ? val.score : REP_DEFAULT));
        const newScore = Math.max(0, Math.min(REP_MAX, oldScore + delta));
        await ref.update({ score: newScore, name: name || val.name || 'Khách hàng', phone: normPhone });
        await ref.child('history').push({
            date: new Date().toLocaleDateString('vi-VN'),
            time: new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}),
            delta: delta, reason: reason,
            bookingId: bookingId || '',
            scoreBefore: oldScore, scoreAfter: newScore
        });
    } catch(e) {  }
}

(function() {
    if (typeof setCleaningFee !== 'function') return;
    const _orig = setCleaningFee;
    setCleaningFee = function(phone, amount, bookingId) {
        try {
            const booking = (typeof globalAllBookings !== 'undefined' ? globalAllBookings : []).find(function(b){ return b.id === bookingId; });
            const guestName = booking ? (booking.name || 'Khách hàng') : 'Khách hàng';
            updateRepScore(phone, guestName, -3, 'Bị tính phí vệ sinh', bookingId);
        } catch(e) {}
        _orig(phone, amount, bookingId);
    };
})();

(function() {
    if (typeof processCheckoutFirebase !== 'function') return;
    const _orig = processCheckoutFirebase;
    processCheckoutFirebase = async function(booking) {
        try {
            const phone = booking.phone;
            const bookingId = booking.id || booking.key;
            if (phone && bookingId) {
                const snapWarn = await firebase.database().ref('bedWarnings/' + normalizePhone(phone) + '/' + bookingId).once('value');
                const _hpRef = _bedBookingRef(booking, 'hasPenalty') || firebase.database().ref('bedBookings/' + bookingId + '/hasPenalty');
                const snapFee = await _hpRef.once('value');
                if (!snapWarn.exists() && snapFee.val() !== true) {
                    updateRepScore(phone, booking.name || 'Khách hàng', +3, 'Hoàn thành không vi phạm', bookingId);
                }
            }
        } catch(e) {}
        _orig(booking);
    };
})();

async function sendWarning(el) {
    var bookingId = el.dataset.id;
    var guestName = el.dataset.name || 'Khách hàng';
    if (!bookingId) return;

    var booking = (typeof globalAllBookings !== 'undefined' ? globalAllBookings : []).find(function(b){ return b.id === bookingId; });
    var phone = booking ? normalizePhone(booking.phone || '') : null;
    var bedId = booking ? (booking.bedId || '?') : '?';

    var warnKey = phone || bookingId;
    var ref = firebase.database().ref('bedWarnings/' + warnKey + '/' + bookingId);
    var snap = await ref.once('value');
    var currentCount = (snap.val() && snap.val().count) ? snap.val().count : 0;
    var newCount = currentCount + 1;

    if (newCount > 3) {
        if (typeof showAppModal === 'function') {
            showAppModal(
                'Vượt mức cảnh báo',
                'The Cafe 33 có quyền đến Bed ' + bedId + ' kiểm tra và mời <b>' + guestName + '</b> rời khỏi.<br><br>Bấm <b>Trả Bed</b> ở màn hình chi tiết để kết thúc lịch ngay lập tức.',
                '🚨'
            );
        }
        return;
    }

    await ref.set({ count: newCount, guestName: guestName, lastWarning: new Date().toLocaleString('vi-VN') });

    if (phone) {
        var pts = newCount === 1 ? -1 : newCount === 2 ? -2 : -3;
        updateRepScore(phone, guestName, pts, 'Cảnh báo vi phạm cấp ' + newCount, bookingId);
    }

    var warningText = '';
    if (newCount === 1) {
        warningText = '⚠️ Thông báo từ The cafe 33 ⚠️\nHệ thống ghi nhận ' + guestName + ' đang gây ồn và có dấu hiệu vi phạm nội quy khi sử dụng Bed.\nVui lòng sử dụng một cách văn minh và đúng quy định.\n⚠️ Trong trường hợp hệ thống ghi nhận thêm 02 nghi ngờ vi phạm,\nBed của bạn sẽ bị buộc dừng ngay lập tức, bạn phải rời khỏi khu vực Bed và không được hoàn lại chi phí của thời gian sử dụng còn lại.\n🤖 Tin nhắn tự động bởi AI của The Cafe 33';
    } else if (newCount === 2) {
        warningText = '⚠️ Thông báo từ The cafe 33 ⚠️\nHệ thống ghi nhận ' + guestName + ' đang gây ồn và có dấu hiệu vi phạm nội quy khi sử dụng Bed.\nVui lòng sử dụng một cách văn minh và đúng quy định.\n⚠️ Trong trường hợp hệ thống ghi nhận thêm 01 nghi ngờ vi phạm,\nBed của bạn sẽ bị buộc dừng ngay lập tức, bạn phải rời khỏi khu vực Bed và không được hoàn lại chi phí của thời gian sử dụng còn lại.\n🤖 Tin nhắn tự động bởi AI của The Cafe 33';
    } else {
        warningText = '⚠️ Thông báo từ The Cafe 33 ⚠️\nHệ thống ghi nhận dấu hiệu bất thường trong khu vực Bed.\nVui lòng mở rèm Bed trong 30 giây để hệ thống AI tự động xác nhận.\n⏱️ Lưu ý: Nếu không mở rèm trong vòng 2 phút kể từ khi nhận thông báo, điện khu vực Bed sẽ tự động tắt và hệ thống sẽ thông báo đến quản lý để tiến hành kiểm tra.\nXin cảm ơn và mong bạn thông cảm vì sự bất tiện.\nThe Cafe 33 – Không gian văn minh, an toàn cho tất cả khách hàng. 🤖';
    }

    try { await navigator.clipboard.writeText(warningText); }
    catch(e) {
        var ta = document.createElement('textarea');
        ta.value = warningText; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
    }

    var color = newCount >= 3 ? '#dc2626' : newCount === 2 ? '#f97316' : '#f59e0b';
    document.querySelectorAll('.warn-mob-badge, .warn-badge-pc').forEach(function(b) {
        b.textContent = newCount; b.style.display = 'flex'; b.classList.remove('hidden'); b.style.backgroundColor = color;
    });

    var pts2 = newCount === 1 ? 1 : newCount === 2 ? 2 : 3;
    if (typeof showAppModal === 'function') {
        showAppModal('Đã gửi cảnh báo lần ' + newCount,
            'Thông báo cấp ' + newCount + ' cho <b>' + guestName + '</b> đã được sao chép.<br><span style="color:#9ca3af;font-size:12px;">Trừ ' + pts2 + ' điểm Reputation</span>',
            '⚠️');
    }
}

var repCurrentTab = 'today';
var repAllCache = [];

function openReputationModal() {
    var m = document.getElementById('modal-reputation');
    if (!m) { alert('Lỗi: không tìm thấy modal reputation!'); return; }
    if (!m._listenerAdded) {
        m.addEventListener('click', function(e) { if (e.target === m) closeReputationModal(); });
        m._listenerAdded = true;
    }
    m.style.display = 'flex';
    switchRepTab('today');
}

function closeReputationModal() {
    var m = document.getElementById('modal-reputation');
    if (m) m.style.display = 'none';
}

function switchRepTab(tab) {
    repCurrentTab = tab;
    ['today','all','rank'].forEach(function(t) {
        var btn = document.getElementById('rep-tab-' + t);
        if (!btn) return;
        if (t === tab) {
            btn.style.background = 'white';
            btn.style.color = '#111';
            btn.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';
        } else {
            btn.style.background = 'transparent';
            btn.style.color = '#9ca3af';
            btn.style.boxShadow = 'none';
        }
    });
    var content = document.getElementById('rep-tab-content');
    if (content) content.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#9ca3af;font-size:16px;">Đang tải...</div>';
    if (tab === 'today') loadRepToday();
    else if (tab === 'all') loadRepAll();
    else loadRepRank();
}

function repRow(phone, name, score, sub, onClick) {
    var tier = getRepTier(score);
    return '<div onclick="' + onClick + '" style="padding:20px 40px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #f9fafb;cursor:pointer;" onmouseover="this.style.background=\'#f9fafb\'" onmouseout="this.style.background=\'white\'">'
        + '<div><div style="font-size:18px;font-weight:800;color:#111;">' + name + '</div>'
        + '<div style="font-size:14px;color:#9ca3af;margin-top:4px;font-family:monospace;">' + sub + '</div></div>'
        + '<div style="display:flex;align-items:center;gap:14px;">'
        + '<div style="text-align:right;"><div style="font-size:32px;font-weight:900;color:' + tier.color + ';line-height:1;">' + score + '</div>'
        + '<div style="font-size:13px;font-weight:700;color:' + tier.color + ';">' + tier.label + '</div></div>'
        + '<div style="width:6px;height:40px;border-radius:99px;background:' + tier.color + ';"></div>'
        + '</div></div>';
}

async function loadRepToday() {
    var content = document.getElementById('rep-tab-content');
    try {
        var now = new Date();
        var dd = String(now.getDate()).padStart(2,'0');
        var mm = String(now.getMonth()+1).padStart(2,'0');
        var yyyy = now.getFullYear();
        var todayDDMMYYYY = dd + '/' + mm + '/' + yyyy;

        var allBookings = (typeof globalAllBookings !== 'undefined') ? globalAllBookings : [];
        var list = allBookings.filter(function(b) {
            var d = b.displayDate || b.date || '';
            return d === todayDDMMYYYY;
        });

        if (list.length === 0) {
            content.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#9ca3af;font-size:16px;">Không có lịch đặt nào hôm nay.</div>';
            return;
        }

        var rows = await Promise.all(list.map(async function(b) {
            var s = await getRepScore(b.phone || '');
            return Object.assign({}, b, {repScore: s});
        }));
        rows.sort(function(a,b){ return a.repScore - b.repScore; });

        var html = '<div>';
        rows.forEach(function(b) {
            var warn = b.repScore < REP_WARN_THRESHOLD ? ' <span style="color:#ef4444;font-weight:700;font-size:13px;">· Cảnh báo</span>' : '';
            var safeName = (b.name||'Khách hàng').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
            var safePhone = normalizePhone(b.phone||'');
            var sub = (b.phone||'--') + ' &nbsp;·&nbsp; Bed ' + (b.bedId||'--');
            html += repRow(safePhone, (b.name||'Khách hàng') + warn, b.repScore, sub,
                "showRepDetail('" + safePhone + "','" + safeName + "','" + b.id + "')");
        });
        html += '</div>';
        content.innerHTML = html;

        var hasRisk = rows.some(function(r){ return r.repScore < REP_WARN_THRESHOLD; });
        var dot = document.getElementById('rep-alert-dot');
        if (dot) { dot.style.display = hasRisk ? 'block' : 'none'; }
    } catch(e) {
        content.innerHTML = '<div style="padding:40px;color:#ef4444;">Lỗi tải dữ liệu: ' + e.message + '</div>';
    }
}

async function loadRepAll() {
    var content = document.getElementById('rep-tab-content');
    try {
        var repSnap = await firebase.database().ref('reputation').once('value');
        var repData = repSnap.val() || {};

        // Đọc bookings 12 tháng gần nhất để lấy tên khách
        _fetchBedBookingsForStats('year', null, null, function(bookings) {
            var phoneMap = {};
            bookings.forEach(function(b) {
                if (!b.phone) return;
                var p = normalizePhone(b.phone);
                if (!phoneMap[p]) phoneMap[p] = b.name || 'Khách hàng';
            });
            var allPhones = {};
            Object.keys(phoneMap).forEach(function(p){ allPhones[p] = true; });
            Object.keys(repData).forEach(function(p){ allPhones[p] = true; });
            repAllCache = Object.keys(allPhones).map(function(phone) {
                var rep = repData[phone] || {};
                var score = Math.max(0, Math.min(REP_MAX, rep.score != null ? rep.score : REP_DEFAULT));
                var hist = rep.history ? Object.values(rep.history) : [];
                return { phone: phone, name: rep.name || phoneMap[phone] || 'Khách hàng', score: score, history: hist };
            });
            repAllCache.sort(function(a,b){ return a.score - b.score; });
            renderRepAllList('');
        });
    } catch(e) {
        content.innerHTML = '<div style="padding:40px;color:#ef4444;">Lỗi: ' + e.message + '</div>';
    }
}

function renderRepAllList(query) {
    var content = document.getElementById('rep-tab-content');
    var q = (query||'').toLowerCase().trim();
    var filtered = q ? repAllCache.filter(function(c){
        return c.name.toLowerCase().indexOf(q) !== -1 || c.phone.indexOf(q) !== -1;
    }) : repAllCache;
    var html = '<div style="padding:20px 40px 14px;position:sticky;top:0;background:white;z-index:10;border-bottom:1px solid #f3f4f6;">'
        + '<input id="rep-search-input" type="text" placeholder="Tìm theo tên hoặc số điện thoại..." value="' + (query||'') + '" '
        + 'oninput="renderRepAllList(this.value)" '
        + 'style="width:100%;padding:14px 18px;border-radius:22px;border:1.5px solid #e5e7eb;font-size:15px;font-weight:500;outline:none;background:#f9fafb;box-sizing:border-box;font-family:inherit;">'
        + '</div><div>';
    if (filtered.length === 0) {
        html += '<div style="padding:48px;text-align:center;color:#9ca3af;font-size:16px;">Không tìm thấy khách nào.</div>';
    } else {
        filtered.forEach(function(c) {
            var viols = c.history.filter(function(h){ return h.delta < 0; }).length;
            var safeName = c.name.replace(/'/g,"\\'");
            html += repRow(c.phone, c.name, c.score, c.phone + ' · ' + viols + ' vi phạm', "showRepDetail('" + c.phone + "','" + safeName + "','')");
        });
    }
    html += '</div>';
    content.innerHTML = html;
    if (query) {
        var inp = document.getElementById('rep-search-input');
        if (inp) { inp.focus(); inp.setSelectionRange(query.length, query.length); }
    }
}

async function loadRepRank() {
    var content = document.getElementById('rep-tab-content');
    try {
        var snap = await firebase.database().ref('reputation').once('value');
        var repData = snap.val() || {};
        var list = Object.values(repData).map(function(r) {
            return { name: r.name||'Khách hàng', phone: r.phone||'', score: Math.max(0,Math.min(REP_MAX,r.score!=null?r.score:REP_DEFAULT)), history: r.history?Object.values(r.history):[] };
        }).sort(function(a,b){ return b.score - a.score; });
        if (list.length === 0) {
            content.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#9ca3af;font-size:16px;">Chưa có dữ liệu.</div>';
            return;
        }
        var rankColors = ['#f59e0b','#9ca3af','#d97706'];
        var html = '<div>';
        list.forEach(function(c, idx) {
            var tier = getRepTier(c.score);
            var viols = c.history.filter(function(h){ return h.delta < 0; }).length;
            var safeName = c.name.replace(/'/g,"\\'");
            var rankColor = idx < 3 ? rankColors[idx] : '#d1d5db';
            html += '<div onclick="showRepDetail(\'' + c.phone + '\',\'' + safeName + '\',\'\')" style="padding:20px 40px;display:flex;align-items:center;gap:24px;border-bottom:1px solid #f9fafb;cursor:pointer;" onmouseover="this.style.background=\'#f9fafb\'" onmouseout="this.style.background=\'white\'">'
                + '<div style="width:32px;text-align:center;font-size:20px;font-weight:900;color:' + rankColor + ';flex-shrink:0;">' + (idx+1) + '</div>'
                + '<div style="flex:1;"><div style="font-size:18px;font-weight:800;color:#111;">' + c.name + '</div>'
                + '<div style="font-size:14px;color:#9ca3af;margin-top:4px;font-family:monospace;">' + c.phone + ' · ' + viols + ' vi phạm</div></div>'
                + '<div style="display:flex;align-items:center;gap:14px;"><div style="text-align:right;">'
                + '<div style="font-size:32px;font-weight:900;color:' + tier.color + ';line-height:1;">' + c.score + '</div>'
                + '<div style="font-size:13px;font-weight:700;color:' + tier.color + ';">' + tier.label + '</div></div>'
                + '<div style="width:6px;height:40px;border-radius:99px;background:' + tier.color + ';"></div></div></div>';
        });
        html += '</div>';
        content.innerHTML = html;
    } catch(e) {
        content.innerHTML = '<div style="padding:40px;color:#ef4444;">Lỗi: ' + e.message + '</div>';
    }
}

async function showRepDetail(phone, name, bookingId) {
    var content = document.getElementById('rep-tab-content');
    content.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:200px;color:#9ca3af;font-size:16px;">Đang tải...</div>';
    try {
        var snap = await firebase.database().ref('reputation/' + phone).once('value');
        var data = snap.val() || {};
        var score = Math.max(0, Math.min(REP_MAX, data.score != null ? data.score : REP_DEFAULT));
        var tier = getRepTier(score);
        var history = data.history ? Object.values(data.history).sort(function(a,b){ return (b.date+b.time).localeCompare(a.date+a.time); }) : [];

        var allBookings = (typeof globalAllBookings !== 'undefined') ? globalAllBookings : [];
        var targetBooking = null;
        if (bookingId) {
            targetBooking = allBookings.find(function(b){ return b.id === bookingId; });
        }
        if (!targetBooking) {
            var phoneBookings = allBookings.filter(function(b){ return normalizePhone(b.phone||'') === phone; });
            if (phoneBookings.length > 0) targetBooking = phoneBookings[phoneBookings.length - 1];
        }
        var compName = targetBooking ? (targetBooking.compName || '') : '';
        var compPhone = targetBooking ? (targetBooking.compPhone || '') : '';

        var compHtml = '';
        if (compName || compPhone) {
            compHtml = '<div style="margin-top:10px;padding:14px 18px;background:white;border-radius:20px;border:1px solid #e5e7eb;">'
                + '<div style="font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Người đi cùng</div>'
                + '<div style="font-size:16px;font-weight:700;color:#1f2937;">' + (compName||'--') + '</div>'
                + '<div style="font-size:14px;color:#9ca3af;font-family:monospace;margin-top:2px;">' + (compPhone||'--') + '</div>'
                + '</div>';
        }

        var histHtml = history.length === 0
            ? '<div style="padding:48px;text-align:center;color:#9ca3af;font-size:16px;">Chưa có lịch sử điểm.</div>'
            : history.map(function(h) {
                var isPos = h.delta > 0;
                var dStr = isPos ? '+' + h.delta : '' + h.delta;
                var dColor = isPos ? '#16a34a' : '#dc2626';
                return '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid #f3f4f6;">'
                    + '<div><div style="font-size:16px;font-weight:700;color:#1f2937;">' + (h.reason||'--') + '</div>'
                    + '<div style="font-size:13px;color:#9ca3af;margin-top:4px;">' + (h.date||'') + ' ' + (h.time||'') + '</div></div>'
                    + '<div style="text-align:right;"><div style="font-size:22px;font-weight:900;color:' + dColor + ';">' + dStr + ' điểm</div>'
                    + '<div style="font-size:13px;color:#9ca3af;">' + (h.scoreBefore!=null?h.scoreBefore:'--') + ' → ' + (h.scoreAfter!=null?h.scoreAfter:'--') + '</div></div></div>';
            }).join('');

        var prevTab = repCurrentTab;
        content.innerHTML = '<div style="padding:28px 40px;">'
            + '<button onclick="switchRepTab(\'' + prevTab + '\')" style="display:flex;align-items:center;gap:8px;font-size:15px;color:#9ca3af;font-weight:700;margin-bottom:24px;cursor:pointer;background:none;border:none;padding:0;">← Quay lại</button>'
            + '<div style="border-radius:24px;padding:28px 32px;margin-bottom:24px;background:' + tier.bg + ';border:1.5px solid ' + tier.border + ';">'
            + '<div style="display:flex;align-items:center;justify-content:space-between;">'
            + '<div><div style="font-size:22px;font-weight:900;color:#1f2937;">' + name + '</div>'
            + '<div style="font-size:15px;color:#9ca3af;font-family:monospace;margin-top:6px;">' + phone + '</div>'
            + '<div style="font-size:14px;font-weight:800;margin-top:14px;padding:6px 16px;border-radius:99px;display:inline-block;color:' + tier.color + ';background:white;">' + tier.label + '</div></div>'
            + '<div style="font-size:72px;font-weight:900;color:' + tier.color + ';line-height:1;">' + score + '</div></div>'
            + compHtml
