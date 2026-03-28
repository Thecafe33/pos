function autoLoginPOS() {
    const email = "elio@thecafe33.com";
    const pass = "Thecafe33ty";

    auth.signInWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            // Chạy archive sau khi đăng nhập thành công
            setTimeout(runAutoArchive, 5000);
            setTimeout(runAutoArchiveOrders, 7000);
            setTimeout(syncRewardsToRT, 10000);
        })
        .catch((error) => {
            alert("Lỗi: Không thể đăng nhập vào hệ thống! Kiểm tra lại Email/Pass trong code.");
        });
}


// Sync rewards từ Firestore → RT mirror (cho app khách đọc không cần Firestore auth)
function syncRewardsToRT() {
    fstore.collection('rewards').get().then(function(snapshot) {
        var batch = {};
        snapshot.forEach(function(doc) {
            batch[doc.id] = Object.assign({}, doc.data(), { _docId: doc.id });
        });
        db.ref('rewards_mirror').set(batch);
        console.log('[Sync] Đã mirror', Object.keys(batch).length, 'rewards sang RT');
    }).catch(function(err) {
        console.warn('[Sync] Lỗi mirror rewards:', err.message);
    });
}

// ── Auto-archive bedBookings cũ hơn 3 ngày sang Firestore, rồi xóa khỏi RT ──
function runAutoArchive() {
    var now = new Date();
    now.setHours(0, 0, 0, 0);

    // Build danh sách ngày cần kiểm tra: từ 180 ngày trước đến 4 ngày trước
    var days = [];
    for (var i = 180; i >= 4; i--) {
        var d = new Date(now);
        d.setDate(d.getDate() - i);
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var dd = String(d.getDate()).padStart(2, '0');
        days.push({ year: String(y), month: m, day: dd });
    }

    var processed = 0;
    var archived = 0;

    function processNext(idx) {
        if (idx >= days.length) {
            if (archived > 0) console.log('[AutoArchive] Đã archive ' + archived + ' ngày bedBookings sang Firestore.');
            return;
        }
        var d = days[idx];
        var rtPath = 'bedBookings/' + d.year + '/' + d.month + '/' + d.day;
        db.ref(rtPath).once('value', function(snap) {
            if (!snap.exists()) { processNext(idx + 1); return; }
            var data = snap.val();
            var keys = Object.keys(data);

            // Ghi vào Firestore bedBookings_archive/{year}/{month}/{day}
            // Cấu trúc nested giống RT → đọc cùng logic, không cần xử lý riêng
            var fsDocRef = fstore
                .collection('bedBookings_archive').doc(d.year)
                .collection(d.month).doc(d.day);
            fsDocRef.set({ bookings: data, archivedAt: new Date().toISOString() })
                .then(function() {
                    // Xóa khỏi Realtime sau khi archive thành công
                    db.ref(rtPath).remove();
                    archived++;
                    processNext(idx + 1);
                })
                .catch(function(err) {
                    console.warn('[AutoArchive] Lỗi archive ' + d.year+'/'+d.month+'/'+d.day + ':', err.message);
                    processNext(idx + 1);
                });
        });
    }

    processNext(0);
}

// ── Auto-archive orders cũ hơn 3 ngày sang Firestore orders_archive ──────────
function runAutoArchiveOrders() {
    var now = new Date();
    now.setHours(0, 0, 0, 0);

    // Build danh sách ngày cần kiểm tra: từ 180 ngày trước đến 4 ngày trước
    var days = [];
    for (var i = 180; i >= 4; i--) {
        var d = new Date(now);
        d.setDate(d.getDate() - i);
        var parts = getOrderParts(d); // { year, month(jan/feb...), day }
        days.push(parts);
    }

    var archived = 0;

    function processNext(idx) {
        if (idx >= days.length) {
            if (archived > 0) console.log('[AutoArchiveOrders] Da archive ' + archived + ' ngay orders sang Firestore.');
            return;
        }
        var d = days[idx];
        var rtPath = 'orders/' + d.year + '/' + d.month + '/' + d.day;

        db.ref(rtPath).once('value', function(snap) {
            if (!snap.exists() || !snap.val()) { processNext(idx + 1); return; }
            var data = snap.val();

            // Ghi vào Firestore orders_archive/{year}/{month}/{day}
            // Cùng cấu trúc với RT → đọc đồng nhất
            fstore.collection('orders_archive').doc(d.year)
                .collection(d.month).doc(d.day)
                .set({ orders: data, archivedAt: new Date().toISOString() })
                .then(function() {
                    db.ref(rtPath).remove();
                    archived++;
                    processNext(idx + 1);
                })
                .catch(function(err) {
                    console.warn('[AutoArchiveOrders] Loi archive ' + d.year+'/'+d.month+'/'+d.day + ':', err.message);
                    processNext(idx + 1);
                });
        });
    }

    processNext(0);

    // Xóa payment_events cũ hơn hôm nay khỏi RT (không cần lưu lại)
    var cutoff = now.getTime(); // now đã setHours(0,0,0,0) ở trên
    db.ref('payment_events').once('value', function(snap) {
        if (!snap.exists()) return;
        var removed = 0;
        snap.forEach(function(child) {
            var createdAt = child.val().createdAt;
            if (createdAt && Number(createdAt) < cutoff) {
                child.ref.remove();
                removed++;
            }
        });
        if (removed > 0) console.log('[AutoArchiveOrders] Đã xóa ' + removed + ' payment_events cũ khỏi RT.');
    });
}

autoLoginPOS();
let menu = [];
let historyData = [];
let cart = [];
let currentTotal = 0;
let customerMap = {};
let currentTab = "Tất cả";
let isPaymentMode = false;
let myChart = null;
let selectedRefundItems = [];
let paymentListener = null;
let currentOrderCode = "";

var currentBedList = [];
var selectedBedIndex = -1;
var bedCountdownInterval = null;
var pendingBedOrder = null;
var activeOrderingBedId = null;
var isCheckoutFlow = false;

setInterval(() => {
    const el = document.getElementById('clock');
    if(el) el.innerText = new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
}, 1000);

window.onload = function() {

    const safetyTimer = setTimeout(() => {
        const ol = document.getElementById('loading-overlay');
        if(ol && ol.style.display !== 'none') {
            ol.style.display = 'none';
        }
    }, 5000);

    db.ref('menu').on('value', (snapshot) => {
        clearTimeout(safetyTimer);
        const data = snapshot.val();

        if (data) {
            menu = Array.isArray(data) ? data : Object.values(data);
            window._menuData = menu;
            renderTabs();
            renderMenu();
        } else {
        }
        document.getElementById('loading-overlay').style.display = 'none';
    }, (error) => {
        document.getElementById('loading-overlay').style.display = 'none';
        alert("Lỗi kết nối: " + error.message);
    });
db.ref("customers").on("value", snap => {
    customerMap = snap.val() || {};
});

    db.ref('beds').on('value', (snapshot) => {
        const data = snapshot.val();
        currentBedList = [];
        if(data) {
            Object.keys(data).forEach(key => {
                let item = data[key];
                item.key = key;
                currentBedList.push(item);
            });
        }
        const viewBed = document.getElementById('view-bed');
        if(viewBed && !viewBed.classList.contains('hidden')) {
            renderBedBookings(currentBedList);
        }
    });
    switchView('menu');
    listenToClientInput();

    checkAndSyncDailyRevenue();
};

const SHEETS_CONFIG = {
    SPREADSHEET_ID: '1QvFE_9jcjtP5ky-iAC9P-kn6AgMRt6osYPRhzjUPvDU',
    SHEET_NAME: 'S1a-HKD',
    SERVICE_ACCOUNT_EMAIL: 'bot-sheet@the-cafe-33.iam.gserviceaccount.com',
    PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----
MIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQDLvPjA24y9eJVE
pX6Olx+5ud8BEl14nWG31r4NBiSPqH/mdl/7b26JgMvwwAWVQ4ZngBYn0iS8Dynl
2c+m2ykuCgxXdjMcWNXFx/yytysNjfVZncgfuQLWfayrIIciJsgbA780vzFQpRJ0
R+GkvOtyXBN/a23lX+uXVheEfXRt3YHrL0pFk86W0DwcSvEVCwnTG/cLYGBwSMpH
vWOGU+SuABPr4shO6n/lRSuIHmxCrc5sN6f7UTKgdvMnpxwRcAO1Xvhe6qY/iWfQ
WncUY8KXq+33YwL/r9pvwnFBWqK6soaMUcNK4jCe3Am9h5KuiDTxUEsRDnKSxfdU
JSdJa2BtAgMBAAECgf81Uj/IOa2b6PMoBCgbKXIkKYEzxpqv9oCcnJcg0XrAHlla
96AnLgK/+fVmDNtpNUL304343ga/MTjF7ztpb/JXGkogmc7GnHlWSgDYxRd/dKfB
zImTw9f6Sunl351+UqgMae6g32kIsisiQ63Kb6cvRunTb0pTvcbq1J1TD4JpPhgI
+Q1y0lhZm4s9/a4BDVVLEjnGmABO1eXwYoX6lIVaTDDSFjMIq25j4d+p1oBrHlxE
Vu5XzofoRDsfAc8xjh93vC6q6wg5SwRHDBgPjDLmWf2G1fUWf0ldE2APcLNMMXDM
WIFY2RFpLEWIG9cVyEm7nr9AO0Jc0GIDkCsT9hUCgYEA8VlQlQ/HE5wneuZlJS2V
8tsuIQqpiMVCyJZ3ZSWTwSmaNV4jsxxNGQ4D38J3/zz98a51Mr2hCq03naWRl2zy
3EljMiqXXXZk6deu1gDCY+wwAAYuigab5MVnRSmu7Wqr4WQf9GmlcDgqfJv3ZdSE
UQZHgA5/YFzniY8mL1gf1h8CgYEA2BsqyoaE6/6pKPLmGFdJxWkCx03ScOEjyT2Q
pRuUMw6kv4jdktOXzcbGBOkj4n2V9gOumNeGm6tsqBYwh7JhMswMZSSofbxv/bOm
Y4egYMfyzAT5Tzwd/dbSnjMfP93OVPOEtU6xnQZAI0ZRnrzj5cUtKwZ2MlQn/57+
RbtOv/MCgYB2qmJ7mBFa6/lhbSyoFfzXNrs8lcB7tfm7JHg57Dr0y569xLaq1yx1
ODXha/2SKov1q8CGHUS0OizRP1oRaQkUFKVIQjbARnkhnOGi6Saq+LM1H9T8GnnG
BuVa1T7kDwHJxXAMvXERdxw0vn7qu43/RKYdKYOpfqR9NzwgJSUqIwKBgF8URNVq
Ld0u4/oSNE4NSXXDZ+eMQ8RKKdaGcbdS1PdJwA5NBz9sPOPaSpEqihFCM9JTeGPi
n2SqHVouuRda0gzpXaK6aC850wQKIHC14UfzcM12esHzrzZZZ70WvO76hac2pPKo
NtjhQSLD83ElphcXk3HUm/g0soxyxWikqlclAoGAFovt1e5xiouPJSVa7SqSFjso
MoIMvRJiXfHWODmgxR2qGy/vAM9G3a0QHSCisWY5FPBL3UiVaJJH0s/QVPIrzeVS
MBDc1ig8tVo2GlwysDker1sTUjAgMjDhsLpZXVw4MLbHToPDy+zYZbZFsE3gWnrU
fRgr2d+6614bnRftY9Q=
-----END PRIVATE KEY-----`,
};

async function checkAndSyncDailyRevenue() {
    const todayStr = new Date().toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const syncKey = 'sheets_synced_' + todayStr;
    if (localStorage.getItem(syncKey) === 'done') {
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr_GB = yesterday.toLocaleDateString('en-GB');
    const dd = String(yesterday.getDate()).padStart(2, '0');
    const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const yyyy = yesterday.getFullYear();

    try {
        const orders = await fetchOrdersByDateRange(yesterday, yesterday);

        let drinkTotal = 0;
        orders.forEach(o => {
            const amount = Number(o.total) || 0;
            if (amount <= 0) return;

            if (o.itemsArray && Array.isArray(o.itemsArray)) {
                o.itemsArray.forEach(item => {
                    const menuItem = menu.find(m => m.name.toLowerCase() === (item.name||'').toLowerCase());
                    const type = menuItem ? String(menuItem.type || '').toLowerCase() : '';
                    const isSnack = type.includes('ăn vặt') || type.includes('đồ ăn') || type.includes('snack');
                    const isKhac = type.includes('khác') || type === 'khac';
                    if (!isSnack && !isKhac) {
                        const price = (item.price > 0) ? item.price : (menuItem ? (menuItem.priceM || menuItem.priceL) : 0);
                        drinkTotal += price * (item.qty || 1);
                    }
                });
            } else if (o.items) {
                drinkTotal += amount;
            }
        });

        const finalRevenue = drinkTotal;

        await writeToGoogleSheets(dd, mm, yyyy, finalRevenue);
        localStorage.setItem(syncKey, 'done');
        showSyncToast(`✅ Đã ghi doanh thu ${dd}/${mm}: ${finalRevenue.toLocaleString()}đ vào sổ`);

    } catch (err) {
    }
}

async function createServiceAccountJWT() {
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: SHEETS_CONFIG.SERVICE_ACCOUNT_EMAIL,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    };

    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const encodedPayload = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    const signingInput = encodedHeader + '.' + encodedPayload;

    const pemKey = SHEETS_CONFIG.PRIVATE_KEY
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s/g, '');
    const keyData = Uint8Array.from(atob(pemKey), c => c.charCodeAt(0));

    const cryptoKey = await crypto.subtle.importKey(
        'pkcs8', keyData.buffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false, ['sign']
    );

    const signature = await crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        cryptoKey,
        new TextEncoder().encode(signingInput)
    );

    const encodedSig = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
    return signingInput + '.' + encodedSig;
}

async function getAccessToken() {
    const jwt = await createServiceAccountJWT();
    const resp = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
    });
    const data = await resp.json();
    if (!data.access_token) throw new Error('Lỗi lấy access token: ' + JSON.stringify(data));
    return data.access_token;
}

async function writeToGoogleSheets(dd, mm, yyyy, revenue) {
    const token = await getAccessToken();
    const spreadsheetId = SHEETS_CONFIG.SPREADSHEET_ID;
    const sheetName = SHEETS_CONFIG.SHEET_NAME;

    const metaResp = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        { headers: { 'Authorization': 'Bearer ' + token } }
    );
    const meta = await metaResp.json();
    const sheetMeta = (meta.sheets || []).find(s => s.properties.title === sheetName);
    if (!sheetMeta) throw new Error(`Không tìm thấy sheet tên "${sheetName}"`);
    const sheetId = sheetMeta.properties.sheetId;

    const readResp = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName + '!B1:C200')}`,
        { headers: { 'Authorization': 'Bearer ' + token } }
    );
    const readData = await readResp.json();
    const rows = readData.values || [];

    const targetFull  = `${dd}/${mm}/${yyyy}`;
    const targetShort = `${dd}/${mm}`;
    const targetISO   = `${yyyy}-${mm}-${dd}`;

    let existingRow = -1;
    let tongCongRow = -1;

    for (let i = 0; i < rows.length; i++) {
        const cellB = String(rows[i][0] || '').trim();
        const cellC = String(rows[i][1] || '').trim();

        if (
            cellB === targetFull ||
            cellB === targetShort ||
            cellB.startsWith(targetISO) ||
            cellC.includes(`ngày ${dd}/${mm}`)
        ) {
            existingRow = i + 1;
        }

        if (cellC.toLowerCase().includes('tổng cộng') || cellB.toLowerCase().includes('tổng cộng')) {
            tongCongRow = i + 1;
        }
    }

    if (existingRow > 0) {
        await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName + '!D' + existingRow)}?valueInputOption=USER_ENTERED`,
            {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                body: JSON.stringify({ values: [[revenue]] })
            }
        );
        return;
    }

    const insertAt = tongCongRow > 0 ? tongCongRow - 1 : rows.length;

    await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{
                    insertDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: insertAt,
                            endIndex: insertAt + 1
                        },
                        inheritFromBefore: true
                    }
                }]
            })
        }
    );

    const newRowNumber = insertAt + 1;
    await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName + '!B' + newRowNumber + ':D' + newRowNumber)}?valueInputOption=USER_ENTERED`,
        {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                values: [[
                    `${dd}/${mm}/${yyyy}`,
                    `Doanh thu bán hàng hoá ngày ${dd}/${mm}`,
                    revenue
                ]]
            })
        }
    );

}

function showSyncToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
        background: #006241; color: white; padding: 10px 20px; border-radius: 20px;
        font-size: 12px; font-weight: 700; z-index: 9999; white-space: nowrap;
        box-shadow: 0 4px 20px rgba(0,98,65,0.4); opacity: 1; transition: opacity 0.5s;
    `;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 4000);
}

