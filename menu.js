function renderTabs() {
    if (!menu || menu.length === 0) return;
    const cats = ["Tất cả", ...new Set(menu.map(m => m.type))];

    const containerPC = document.getElementById('tabs-container');
    if(containerPC) {
        containerPC.innerHTML = cats.map(c => `<button onclick="filterTab('${c}')" class="category-tab ${c === currentTab? 'tab-active': 'bg-white text-gray-400'} capitalize-first transition-all">${c}</button>`).join('');
    }

    const containerMob = document.getElementById('mob-cat-list-new');
    if(containerMob) {
        containerMob.innerHTML = cats.map(c => {
            const isActive = (c === currentTab);
            return `
            <div onclick="filterTabMobile('${c}')" class="p-3 rounded-xl flex justify-between items-center cursor-pointer transition-all ${isActive ? 'bg-green-50 text-[#006241]' : 'hover:bg-gray-50 text-gray-600'}">
                <span class="capitalize-first font-bold text-sm ml-2">${c}</span>
                ${isActive ? '<span class="text-[#006241] text-lg font-black">✓</span>' : ''}
            </div>
            `;
        }).join('');
    }
}

function toggleCategoryDropdown() {
    const drop = document.getElementById('mob-cat-dropdown');
    const overlay = document.getElementById('mob-cat-overlay');
    const list = document.getElementById('mob-cat-list');

    if (drop.classList.contains('hidden')) {

        const cats = ["Tất cả", ...new Set(menu.map(m => m.type))];
        list.innerHTML = cats.map(c => {
            const isActive = (c === currentTab);

            return `
            <button onclick="selectCategoryDropdown('${c}')" class="w-full py-4 px-6 rounded-[2rem] flex items-center justify-between transition-all mb-1 ${isActive ? 'bg-[#E6F4F1] text-[#006241] shadow-sm ring-1 ring-[#006241]/20' : 'bg-white text-gray-700 hover:bg-gray-50'}">
                <span class="capitalize-first text-lg font-black tracking-wide">${c}</span>
                ${isActive ? '<span class="text-xl font-bold">✓</span>' : ''}
            </button>`;
        }).join('');

        drop.classList.remove('hidden');
        overlay.classList.remove('hidden');
        setTimeout(() => {
            drop.classList.remove('opacity-0', 'scale-95');
            drop.classList.add('opacity-100', 'scale-100');
        }, 10);

    } else {
        closeCategoryDropdown();
    }
}

function closeCategoryDropdown() {
    const drop = document.getElementById('mob-cat-dropdown');
    const overlay = document.getElementById('mob-cat-overlay');

    drop.classList.remove('opacity-100', 'scale-100');
    drop.classList.add('opacity-0', 'scale-95');
    overlay.classList.add('hidden');

    setTimeout(() => {
        drop.classList.add('hidden');
    }, 200);
}

function selectCategoryDropdown(c) {
    currentTab = c;
    document.getElementById('mob-cat-label-new').innerText = c;
    renderMenu();
    closeCategoryDropdown();
}

function closeCategorySheet() {
    const sheet = document.getElementById('sheet-category');
    const content = document.getElementById('sheet-category-content');

    content.classList.remove('sheet-open');
    sheet.querySelector('div').classList.add('opacity-0');

    setTimeout(() => {
        sheet.classList.add('hidden');
    }, 300);
}

function selectCategoryMobile(c) {
    currentTab = c;
    document.getElementById('mob-cat-label-new').innerText = c;
    renderMenu();
    closeCategorySheet();
}

function openCartModal() {
    if(cart.length === 0) return alert("Giỏ hàng đang trống! Chọn món đi bà.");

    const listEl = document.getElementById('sheet-cart-list');

    listEl.innerHTML = cart.map((i, idx) => `
    <div class="bg-white p-4 rounded-[32px] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-4 mb-3 relative overflow-hidden">

        <div class="flex-1 min-w-0 text-left">
            <p class="font-black text-[#1e3932] text-lg truncate capitalize-first tracking-tight">${i.name}</p>
            <p class="text-sm text-gray-400 font-bold uppercase mt-1">${i.size} • <span class="text-[#006241]">${i.price.toLocaleString()}đ</span></p>
        </div>

        <div class="flex items-center gap-3 bg-[#F2F4F6] rounded-full p-2 shadow-inner">
            <button onclick="updateQtyMobile(${idx}, -1)" class="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-600 font-bold active:scale-90 transition-all text-2xl hover:text-red-500 leading-none pb-1">-</button>
            <span class="font-black text-xl w-6 text-center text-[#1e3932]">${i.qty}</span>
            <button onclick="updateQtyMobile(${idx}, 1)" class="w-10 h-10 flex items-center justify-center bg-[#006241] rounded-full shadow-lg shadow-green-900/20 text-white font-bold active:scale-90 transition-all text-2xl leading-none pb-1">+</button>
        </div>

        <button onclick="removeItemMobile(${idx})" class="w-12 h-12 flex items-center justify-center text-red-500 bg-red-50 rounded-full active:scale-90 transition-all hover:bg-red-100 border border-red-100 shadow-sm ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    </div>
    `).join('');

    listEl.style.paddingBottom = "200px";

    document.getElementById('sheet-cart-edit').classList.remove('hidden');
    document.body.classList.add('cart-modal-open');
    updateCartPadding();
}
function closeCartModal() {
    document.getElementById('sheet-cart-edit').classList.add('hidden');
    document.body.classList.remove('cart-modal-open');
    updateCartPadding();
}

function updateQtyMobile(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);

    renderCart();

    if(cart.length === 0) closeCartModal();
    else openCartModal();
}

function removeItemMobile(idx) {
    cart.splice(idx, 1);

    renderCart();

    if(cart.length === 0) {
        closeCartModal();
    } else {
        openCartModal();
    }
}

function clearAllMobile() {
    cart = [];

    renderCart();

    const listEl = document.getElementById('sheet-cart-list');
    if(listEl) {
        listEl.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-gray-300 animate-fade-in">
                <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <span class="text-xs font-bold uppercase tracking-wider">Giỏ hàng trống trơn</span>
            </div>
        `;
    }
}

function toggleCatDropdown() {
    const drop = document.getElementById('mob-cat-dropdown');
    const overlay = document.getElementById('mob-cat-overlay');
    const arrow = document.getElementById('cat-arrow');

    if (drop.classList.contains('hidden')) {
        drop.classList.remove('hidden');
        overlay.classList.remove('hidden');
        arrow.style.transform = "rotate(180deg)";
    } else {
        drop.classList.add('hidden');
        overlay.classList.add('hidden');
        arrow.style.transform = "rotate(0deg)";
    }
}

function filterTabMobile(c) {
    currentTab = c;

    document.getElementById('mob-cat-label').innerText = c;

    renderMenu();

    renderTabs();

    toggleCatDropdown();
}

function filterTab(c) {
    currentTab = c;

    renderTabs();
    renderMenu();

    const mobLabel = document.getElementById('mob-cat-label');
    if(mobLabel) mobLabel.innerText = c;
}

function renderMenu() {
    const filtered = currentTab === "Tất cả"? menu: menu.filter(m => m.type === currentTab);
    const grid = document.getElementById('menu-grid');
    if (!grid) return;

    if (filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-3 text-center text-gray-400 py-10">Không có món nào.</div>';
        return;
    }

    grid.innerHTML = filtered.map(m => {
        const color = m.color || '#006241';
        const priceLabel = m.priceM > 0 ? (m.priceM/1000)+'k' : (m.priceL > 0 ? (m.priceL/1000)+'k' : '···');
        return `<div onclick="handleItemClick('${m.name}', ${m.priceM||0}, ${m.priceL||0})"
            class="menu-card flex flex-col justify-between items-center text-center cursor-pointer transition-all active:scale-95 relative overflow-hidden aspect-square p-3 rounded-[2.2rem] md:aspect-auto md:h-32 md:p-5 md:rounded-[2rem] md:justify-center md:hover:brightness-90 md:hover:scale-[1.03] md:active:scale-95"
            data-color="${color}">
            <div class="flex-1 flex items-center justify-center w-full overflow-hidden">
                <p class="menu-name font-black uppercase break-words leading-none transition-colors text-lg line-clamp-2 md:text-[1.3rem] md:line-clamp-3 md:leading-tight">
                    ${m.name}
                </p>
            </div>
            <div class="w-full pt-1 flex justify-center md:mt-2 md:pb-0 shrink-0">
                <p class="menu-price font-extrabold tracking-tight px-5 py-2 rounded-full text-base md:text-[14px] md:px-4 md:py-1.5 md:font-black">
                    ${priceLabel}
                </p>
            </div>
        </div>`;
    }).join('');

    // Apply màu nền cho cả mobile lẫn PC
    grid.querySelectorAll('.menu-card').forEach(function(card) {
        const color = card.getAttribute('data-color') || '#006241';
        card.style.background = color;
        card.style.boxShadow = '0 6px 20px ' + color + '44';
        card.querySelector('.menu-name').style.color = 'white';
        const priceEl = card.querySelector('.menu-price');
        priceEl.style.color = 'white';
        if (window.innerWidth >= 769) {
            priceEl.style.background = 'rgba(255,255,255,0.25)';
        } else {
            priceEl.style.background = 'rgba(255,255,255,0.2)';
        }
    });
}
function handleItemClick(name, pM, pL) {
    if(isPaymentMode) return;
    const vM = Number(pM), vL = Number(pL);

    if (vM > 0 && vL > 0) {
        document.getElementById('modal-item-name').innerText = name;
        document.getElementById('price-m').innerText = vM.toLocaleString() + 'đ';
        document.getElementById('price-l').innerText = vL.toLocaleString() + 'đ';

        document.getElementById('btn-size-m').onclick = () => { addToCart(name, 'M', vM); closeSize(); };
        document.getElementById('btn-size-l').onclick = () => { addToCart(name, 'L', vL); closeSize(); };

        var modal = document.getElementById('size-modal');
        modal.classList.remove('hidden');
        modal.classList.add('modal-active');

    } else if (vM > 0) {
        addToCart(name, 'M', vM);
    } else if (vL > 0) {
        addToCart(name, 'L', vL);
    } else {
        // Không có giá → mở bàn phím nhập giá tay
        openPriceKeypad(name);
    }
}

function closeSize() {
    var modal = document.getElementById('size-modal');
    modal.classList.remove('modal-active');
    modal.classList.add('hidden');
}

function addToCart(name, size, price) {
    const ex = cart.find(i => i.name === name && i.size === size);
    if (ex) ex.qty++; else cart.push({ name, size, price, qty: 1 });

    renderCart();

    closeSize();
    updateCartPadding();
}

// ===== ORDERS SHARDING BY DATE (cấu trúc: orders/năm/tháng/ngày) =====
const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

