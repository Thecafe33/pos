function getOrderParts(date) {
    const d = date || new Date();
    return {
        year: String(d.getFullYear()),
        month: MONTHS[d.getMonth()],
        day: String(d.getDate()).padStart(2, '0')
    };
}

// Ref ghi đơn mới: orders/2026/mar/13
function getOrdersRef(date) {
    const { year, month, day } = getOrderParts(date || new Date());
    return db.ref(`orders/${year}/${month}/${day}`);
}

// Fetch orders trong khoảng ngày — RT trước, fallback Firestore orders_archive
async function fetchOrdersByDateRange(startDate, endDate) {
    const allOrders = [];
    const cur = new Date(startDate);
    cur.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Build danh sách ngày cần đọc
    const days = [];
    while (cur <= end) {
        const { year, month, day } = getOrderParts(new Date(cur));
        days.push({ year, month, day });
        cur.setDate(cur.getDate() + 1);
    }

    // Đọc từng ngày: RT trước → fallback Firestore orders_archive/{year}/{month}/{day}
    await Promise.all(days.map(async ({ year, month, day }) => {
        const snap = await db.ref(`orders/${year}/${month}/${day}`).once('value');
        if (snap.exists() && snap.val()) {
            Object.values(snap.val()).forEach(o => allOrders.push(o));
        } else {
            // RT trống → đọc Firestore orders_archive (cùng cấu trúc year/month/day)
            try {
                const doc = await fstore
                    .collection('orders_archive').doc(year)
                    .collection(month).doc(day).get();
                if (doc.exists && doc.data() && doc.data().orders) {
                    Object.values(doc.data().orders).forEach(o => allOrders.push(o));
                }
            } catch(e) {
                console.warn('[fetchOrders] Firestore loi ' + year+'/'+month+'/'+day + ':', e.message);
            }
        }
    }));

    // Tương thích node cũ
    try {
        const oldSnap = await db.ref('order').once('value');
        if (oldSnap.exists() && oldSnap.val())
            Object.values(oldSnap.val()).forEach(o => allOrders.push(o));
    } catch(e) {}

    return allOrders;
}

// Fetch orders hôm nay
async function fetchTodayOrders() {
    const today = new Date();
    const { year, month, day } = getOrderParts(today);
    const snaps = await Promise.all([
        db.ref(`orders/${year}/${month}/${day}`).once('value'),
        db.ref('order').once('value')
    ]);
    const allOrders = [];
    snaps.forEach(snap => {
        if (snap.exists()) {
            const val = snap.val();
            if (val) Object.values(val).forEach(o => allOrders.push(o));
        }
    });
    return allOrders;
}
// ===== END ORDERS SHARDING =====

