function openDiscountManager() {
    switchView('discount');
    setActiveNavBtn('btn-nav-discount');
    switchMgrTab('menueditor');
}

function switchMgrTab(tab) {
    var tabs = ['gift','screen','label','sticker','menueditor'];

    // Sticker tab: ẩn cột B, các tab khác: hiện cột B
    var bWrap = document.getElementById('mgr-col-b-wrap');
    if (bWrap) bWrap.style.display = (tab === 'sticker') ? 'none' : 'flex';

    tabs.forEach(function(t) {
        var btn = document.getElementById('mgr-tab-'+t);
        var mobBtn = document.getElementById('mgr-mob-tab-'+t);
        var b   = document.getElementById('mgr-b-'+t);
        var c   = document.getElementById('mgr-c-'+t);
        var active = (t === tab);
        if (btn) {
            btn.style.background = active ? '#006241' : 'transparent';
            btn.style.color      = active ? 'white'   : '#6b7280';
            btn.style.boxShadow  = active ? '0 2px 10px rgba(0,98,65,0.2)' : 'none';
        }
        if (mobBtn) {
            mobBtn.style.background = active ? '#006241' : 'transparent';
            mobBtn.style.color      = active ? 'white'   : '#6b7280';
            mobBtn.style.boxShadow  = active ? '0 2px 8px rgba(0,98,65,0.2)' : 'none';
        }
        if (b && t !== 'sticker') {
            b.style.display = active ? 'flex' : 'none';
            if (active) b.style.flexDirection = 'column';
        }
        if (c) {
            c.style.display = active ? 'flex' : 'none';
            if (active) c.style.flexDirection = 'column';
        }
    });

    if (tab === 'gift')       renderDiscountList();
    if (tab === 'screen')     screenLoadSlides();
    if (tab === 'sticker')    stickerLoadConfig();
    if (tab === 'menueditor') menuEditorLoad();
}

function giftVoucherAddNewBtn() {
    discountFormClear();
    document.querySelectorAll('#discount-list > div[data-key]').forEach(function(r){
        r.style.background=''; r.style.borderColor='transparent';
    });
}

var _screenSlides = [];

