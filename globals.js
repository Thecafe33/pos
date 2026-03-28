function normalizePhone(p){
    return String(p || "").replace(/[^0-9]/g, "");
}

function findCustomerByPhone(phone){
    const key = normalizePhone(phone);
    if(!key) return null;
    return customerMap[key] || null;
}
function formatTimeInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');

    var val = parseInt(input.value);
    if (isNaN(val)) return;

    if (input.id === 'custom-hour' && val > 23) input.value = '23';
    if (input.id === 'custom-minute' && val > 59) input.value = '59';
}

const firebaseConfig = {
  apiKey: "AIzaSyCNh1-16gYZ0P30Fkd-2tB-O89PXkPX9Lc",
  authDomain: "the-cafe-33.firebaseapp.com",
  databaseURL: "https://the-cafe-33-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "the-cafe-33",
  storageBucket: "the-cafe-33.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const fstore = firebase.firestore();
const auth = firebase.auth();

// ── bedBookings path helpers ──────────────────────────────────────────────
// Parse dateStr: DD/MM/YYYY hoặc YYYY-MM-DD → { year, month, day }
function _parseDateKey(dateStr) {
    if (!dateStr) return null;
    var s = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        var p = s.split('-');
        return { year: p[0], month: p[1], day: p[2] };
    }
    var sep = s.includes('/') ? '/' : '-';
    var p = s.split(sep);
    if (p.length >= 3 && p[2].length === 4) return { year: p[2], month: p[1].padStart(2,'0'), day: p[0].padStart(2,'0') };
    return null;
}

// Lấy path RT của booking (ưu tiên field .path nếu có, fallback tự tính)
function _getBedBookingPath(booking) {
    if (booking.path) return booking.path;
    var d = _parseDateKey(booking.date);
    if (d) return 'bedBookings/' + d.year + '/' + d.month + '/' + d.day + '/' + booking.id;
    return null;
}

// Update booking qua path đúng, kèm callback(err)
function _updateBedBooking(booking, data, callback) {
    var path = _getBedBookingPath(booking);
    if (!path) { if (callback) callback(new Error('Không tìm được path cho booking ' + booking.id)); return; }
    db.ref(path).update(data, callback);
}

// Lấy RT ref theo path đúng (dùng cho sub-path như /preorder, /moveHistory)
function _bedBookingRef(booking, subPath) {
    var base = _getBedBookingPath(booking);
    if (!base) return null;
    return subPath ? db.ref(base + '/' + subPath) : db.ref(base);
}

// Fetch bookings cho stats/report — đọc 3 tháng gần nhất từ RT theo cấu trúc YYYY/MM/DD
// mode: 'week'|'month'|'year'|'day'|'custom', startVal/endVal: 'YYYY-MM-DD' string
// callback(bookings[])
function _fetchBedBookingsForStats(mode, startVal, endVal, callback) {
    var now = new Date();
    var startDate, endDate;

    if (mode === 'week') {
        var day = now.getDay() || 7;
        startDate = new Date(now); startDate.setDate(now.getDate() - day + 1); startDate.setHours(0,0,0,0);
        endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 6);
    } else if (mode === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (mode === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
    } else if (mode === 'custom' && startVal && endVal) {
        startDate = new Date(startVal);
        endDate = new Date(endVal);
    } else {
        // day hoặc fallback: chỉ hôm nay
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate);
    }

    // Build danh sách ngày YYYY-MM-DD trong khoảng
    var days = [];
    var cur = new Date(startDate);
    cur.setHours(0,0,0,0);
    var end = new Date(endDate);
    end.setHours(0,0,0,0);
    while (cur <= end) {
        var y = cur.getFullYear();
        var m = String(cur.getMonth() + 1).padStart(2,'0');
        var d = String(cur.getDate()).padStart(2,'0');
        days.push(y + '-' + m + '-' + d);
        cur.setDate(cur.getDate() + 1);
    }

    // Giới hạn tối đa 366 ngày để tránh quá nhiều reads
    if (days.length > 366) days = days.slice(0, 366);

    _loadBedBookingsForDays(days, callback);
}
function _isBedBookingRecent(dateStr) {
    var d = _parseDateKey(dateStr);
    if (!d) return true; // không parse được → coi như gần, giữ RT
    var bookingDate = new Date(+d.year, +d.month - 1, +d.day);
    var today = new Date(); today.setHours(0,0,0,0);
    var diff = (today - bookingDate) / (1000 * 60 * 60 * 24);
    return diff <= 3;
}
// ─────────────────────────────────────────────────────────────────────────

