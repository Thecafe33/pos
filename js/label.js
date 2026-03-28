<script>
// ═══════════════════════════════════════════════════════
//  TEM IN (Label Print · MP583) — tích hợp POS
// ═══════════════════════════════════════════════════════

// UUIDs
const LBL_SVC  = '49535343-fe7d-4ae5-8fa9-9fafd205e455';
const LBL_SVC2 = '000018f0-0000-1000-8000-00805f9b34fb';

// Thông số cố định
const LBL_DPI       = 203;
const LBL_CONTRAST  = 50;
const LBL_THRESHOLD = 230;
const LBL_GAP_MM    = 6;
const LBL_GS_MODE   = 0;

// Vật lý máy in
const LBL_PRINTHEAD = 48;
const LBL_PAPER     = 40;
const LBL_PRINTABLE = 35;
const LBL_LABEL_H   = 30;

// State
var lblImgData   = null;
var lblDevice    = null;
var lblChar      = null;
var lblIsConn    = false;
var lblDpiH      = 203;
var lblFlipH     = false;
var lblFlipV     = false;
var lblRotation  = 0;
var lblScaleVal  = 1.0;
var lblOffVal    = 0;
var lblStepTimer = null;

// ── File input ──
(function(){
    var fi = document.getElementById('lbl-file-input');
    if (!fi) return;
    fi.addEventListener('change', function(e){ lblHandleFile(e.target.files[0]); });
    var zone = document.getElementById('lbl-upload-zone');
    if (zone) {
        zone.addEventListener('dragover', function(e){ e.preventDefault(); zone.style.borderColor='#006241'; zone.style.background='#f0fdf4'; });
        zone.addEventListener('dragleave', function(){ zone.style.borderColor=''; zone.style.background=''; });
        zone.addEventListener('drop', function(e){ e.preventDefault(); zone.style.borderColor=''; zone.style.background=''; var f=e.dataTransfer.files[0]; if(f) lblHandleFile(f); });
    }
})();

function lblHandleFile(file) {
    if (!file) return;
    var r = new FileReader();
    r.onload = function(ev) {
        lblImgData = ev.target.result;
        var thumb = document.getElementById('lbl-thumb');
        var fname = document.getElementById('lbl-fname');
        var tw    = document.getElementById('lbl-thumb-wrap');
        var zone  = document.getElementById('lbl-upload-zone');
        if (thumb) thumb.src = lblImgData;
        if (fname) fname.textContent = file.name;
        if (tw)   { tw.style.display='block'; }
        if (zone) zone.style.display='none';
        var pb = document.getElementById('lbl-btn-print');
        if (pb) { pb.disabled = !lblIsConn; pb.style.opacity = lblIsConn ? '1' : '0.5'; pb.style.cursor = lblIsConn ? 'pointer' : 'not-allowed'; }
        lblLog('Ảnh: '+file.name+' ('+Math.round(file.size/1024)+'KB)','ok');
        lblUpdatePreview();
    };
    r.readAsDataURL(file);
}

function lblClearImg() {
    lblImgData = null;
    var tw   = document.getElementById('lbl-thumb-wrap');
    var zone = document.getElementById('lbl-upload-zone');
    var fi   = document.getElementById('lbl-file-input');
    var pb   = document.getElementById('lbl-btn-print');
    if (tw)   { tw.style.display='none'; }
    if (zone) { zone.style.display='flex'; }
    if (fi)   fi.value='';
    if (pb)   { pb.disabled=true; pb.style.opacity='0.5'; pb.style.cursor='not-allowed'; }
    var cv = document.getElementById('lbl-preview-canvas');
    if (cv) { cv.width=0; cv.height=0; }
    var pi = document.getElementById('lbl-preview-info');
    if (pi) pi.textContent='Chọn ảnh để xem';
}

// ── Stepper ──
var lblStepCfg = {
    dpi:   { min:100, max:500, step:5,   get: function(){ return lblDpiH; } },
    off:   { min:-4,  max:4,   step:0.5, get: function(){ return lblOffVal; } },
    scale: { min:50,  max:150, step:5,   get: function(){ return Math.round(lblScaleVal*100); } }
};

function lblDoStep(key, delta) {
    var cfg = lblStepCfg[key];
    var cur = +(cfg.get() + delta).toFixed(2);
    cur = Math.max(cfg.min, Math.min(cfg.max, cur));
    if (key === 'dpi') {
        lblDpiH = cur;
        var el1 = document.getElementById('lbl-sd-dpi'); if(el1) el1.textContent = cur;
        var el2 = document.getElementById('lbl-v-dpi');  if(el2) el2.textContent = cur+' dpi';
        lblUpdatePreview();
    } else if (key === 'off') {
        lblOffVal = cur;
        var el3 = document.getElementById('lbl-sd-off'); if(el3) el3.textContent = cur;
        var el4 = document.getElementById('lbl-v-off');  if(el4) el4.textContent = (cur>=0?'+':'')+cur+' mm';
        lblUpdatePreview();
    } else if (key === 'scale') {
        lblScaleVal = cur/100;
        var el5 = document.getElementById('lbl-sd-scale'); if(el5) el5.textContent = cur;
        var el6 = document.getElementById('lbl-v-scale');  if(el6) el6.textContent = cur+'%';
        lblUpdatePreview();
    }
}

function lblStartStep(key, delta) {
    lblDoStep(key, delta);
    lblStepTimer = setTimeout(function(){
        lblStepTimer = setInterval(function(){ lblDoStep(key, delta); }, 80);
    }, 400);
}
function lblStopStep() {
    clearTimeout(lblStepTimer); clearInterval(lblStepTimer); lblStepTimer=null;
}

// ── Toggle / Rotate ──
function lblToggleFlip(axis) {
    if (axis === 'h') {
        lblFlipH = !lblFlipH;
        var b = document.getElementById('lbl-btn-fliph');
        if (b) { b.style.background = lblFlipH ? '#006241' : '#f9fafb'; b.style.color = lblFlipH ? 'white' : '#374151'; b.style.borderColor = lblFlipH ? '#006241' : '#e5e7eb'; }
    } else {
        lblFlipV = !lblFlipV;
        var b2 = document.getElementById('lbl-btn-flipv');
        if (b2) { b2.style.background = lblFlipV ? '#006241' : '#f9fafb'; b2.style.color = lblFlipV ? 'white' : '#374151'; b2.style.borderColor = lblFlipV ? '#006241' : '#e5e7eb'; }
    }
    lblUpdatePreview();
}

function lblRotateImg(deg) {
    lblRotation = (lblRotation + deg) % 360;
    var b90  = document.getElementById('lbl-btn-rot90');
    var b180 = document.getElementById('lbl-btn-rot180');
    if (b90)  { var active90  = (lblRotation % 90  !== 0 || lblRotation !== 0); b90.style.background  = lblRotation!==0   ? '#006241' : '#f9fafb'; b90.style.color  = lblRotation!==0   ? 'white' : '#374151'; b90.style.borderColor  = lblRotation!==0   ? '#006241' : '#e5e7eb'; }
    if (b180) { b180.style.background = lblRotation===180 ? '#006241' : '#f9fafb'; b180.style.color = lblRotation===180 ? 'white' : '#374151'; b180.style.borderColor = lblRotation===180 ? '#006241' : '#e5e7eb'; }
    lblUpdatePreview();
}

// ── Dithering toggle visual ──
(function(){
    var ck = document.getElementById('lbl-ck-dither');
    if (!ck) return;
    ck.addEventListener('change', function(){
        var track = document.getElementById('lbl-sw-track');
        var thumb = document.getElementById('lbl-sw-thumb');
        if (track) track.style.background = ck.checked ? '#006241' : '#e5e7eb';
        if (thumb) thumb.style.left = ck.checked ? '21px' : '3px';
    });
})();

// ── Log ──
function lblLog(msg, type) {
    var el = document.getElementById('lbl-log');
    if (!el) return;
    var d = document.createElement('div');
    var colors = { ok:'#4ade80', err:'#f87171', info:'#60a5fa', warn:'#fbbf24' };
    d.style.color = colors[type] || '#a0a0c0';
    d.textContent = '› '+msg;
    el.appendChild(d);
    el.scrollTop = el.scrollHeight;
}

// ── Pill status ──
function lblSetStatus(state, txt) {
    var pill = document.getElementById('lbl-status-pill');
    if (!pill) return;
    var styles = {
        connected:    { bg:'#F0FDF4', color:'#15803d', text: txt || 'Đã kết nối' },
        connecting:   { bg:'#fef7e0', color:'#b45309', text: txt || 'Đang kết nối...' },
        disconnected: { bg:'#FEE2E2', color:'#EF4444', text: txt || 'Chưa kết nối' }
    };
    var st = styles[state] || styles.disconnected;
    pill.style.background = st.bg;
    pill.style.color      = st.color;
    pill.textContent      = st.text;
}

// ── Progress bar ──
function lblSetProgress(pct) {
    var wrap = document.getElementById('lbl-prog-wrap');
    var bar  = document.getElementById('lbl-prog-bar');
    if (!wrap || !bar) return;
    if (pct === null) { wrap.style.display='none'; bar.style.width='0%'; return; }
    wrap.style.display='block'; bar.style.width=pct+'%';
}

// ── BLE ──
function lblToggleBle() { if (lblIsConn) lblDisconnect(); else lblConnect(); }

async function lblConnect() {
    if (!navigator.bluetooth) { lblLog('Web Bluetooth không khả dụng — cần Chrome PC','err'); return; }
    var btn = document.getElementById('lbl-btn-ble');
    if (btn) { btn.disabled=true; btn.textContent='Đang tìm...'; }
    lblSetStatus('connecting'); lblSetProgress(10);
    lblLog('Quét BLE...','info');
    try {
        lblDevice = await navigator.bluetooth.requestDevice({
            filters:[{name:'MP583'},{namePrefix:'MP583'}],
            optionalServices:[LBL_SVC, LBL_SVC2]
        });
        lblLog('Tìm thấy: '+lblDevice.name,'ok'); lblSetProgress(35);
        var server = await lblDevice.gatt.connect();
        lblLog('GATT OK','ok'); lblSetProgress(55);
        var char = null;
        try {
            var svc   = await server.getPrimaryService(LBL_SVC);
            var chars = await svc.getCharacteristics();
            for (var c of chars) {
                lblLog('Char: '+c.uuid.slice(0,8)+' WNR='+c.properties.writeWithoutResponse,'info');
                if (c.properties.writeWithoutResponse || c.properties.write) char = char || c;
            }
            if (char) lblLog('SPP 49535343 OK','ok');
        } catch(e) {
            lblLog('SPP fail, thử 0x18F0...','warn');
            try {
                var svc2   = await server.getPrimaryService(LBL_SVC2);
                var chars2 = await svc2.getCharacteristics();
                for (var c2 of chars2) { if (c2.properties.writeWithoutResponse || c2.properties.write) char = char || c2; }
                if (char) lblLog('0x18F0 OK','ok');
            } catch(e2) { lblLog('Lỗi: '+e2.message,'err'); }
        }
        if (!char) throw new Error('Không tìm thấy writable characteristic');
        lblChar = char; lblIsConn = true;
        lblSetProgress(100); setTimeout(function(){ lblSetProgress(null); }, 500);
        lblLog('Sẵn sàng in · WNR='+char.properties.writeWithoutResponse,'ok');
        lblSetStatus('connected');
        if (btn) {
            btn.disabled = false;
            btn.style.background = '#1f2937';
            btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29z"/></svg> Ngắt kết nối';
        }
        var pb = document.getElementById('lbl-btn-print');
        if (pb && lblImgData) { pb.disabled=false; pb.style.opacity='1'; pb.style.cursor='pointer'; }
        lblDevice.addEventListener('gattserverdisconnected', lblOnDisconnect);
    } catch(e) {
        lblLog('Lỗi: '+e.message,'err'); lblSetProgress(null); lblSetStatus('disconnected');
        if (btn) { btn.disabled=false; btn.style.background='#006241'; btn.textContent='Kết nối MP583'; }
    }
}

function lblOnDisconnect() {
    lblIsConn=false; lblChar=null;
    lblLog('Mất kết nối','err'); lblSetStatus('disconnected');
    var btn = document.getElementById('lbl-btn-ble');
    if (btn) { btn.disabled=false; btn.style.background='#006241'; btn.textContent='Kết nối lại'; }
    var pb = document.getElementById('lbl-btn-print');
    if (pb) { pb.disabled=true; pb.style.opacity='0.5'; pb.style.cursor='not-allowed'; }
}
function lblDisconnect() { if (lblDevice && lblDevice.gatt && lblDevice.gatt.connected) lblDevice.gatt.disconnect(); lblOnDisconnect(); }

// ── ESC/POS ──
async function lblImgToEscPos(dataURL) {
    var MM2PX_H = lblDpiH / 25.4;
    var MM2PX_W = LBL_DPI / 25.4;
    var paperW  = Math.round(LBL_PRINTHEAD * MM2PX_W);
    var labelW  = Math.round(LBL_PRINTABLE * MM2PX_W);
    var labelH  = Math.round(LBL_LABEL_H   * MM2PX_H);
    var autoOff = (LBL_PRINTHEAD - LBL_PAPER) + (LBL_PAPER - LBL_PRINTABLE) / 2.0;
    var finalOff = autoOff + lblOffVal;
    var offDots  = Math.round(Math.max(0, finalOff) * MM2PX_W);
    lblLog('off='+finalOff.toFixed(1)+'mm ('+offDots+'dots) | label='+labelW+'x'+labelH+'px','info');

    var cv = document.createElement('canvas');
    cv.width = paperW; cv.height = labelH;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0,0,paperW,labelH);

    if (dataURL) {
        var img = new Image();
        await new Promise(function(r){ img.onload=r; img.src=dataURL; });
        var scaledW = Math.round(labelW * lblScaleVal);
        var scaledH = Math.round(labelH * lblScaleVal);
        ctx.save();
        ctx.translate(offDots + labelW/2, labelH/2);
        if (lblFlipH) ctx.scale(-1,1);
        if (lblFlipV) ctx.scale(1,-1);
        ctx.rotate(lblRotation * Math.PI/180);
        ctx.drawImage(img, -scaledW/2, -scaledH/2, scaledW, scaledH);
        ctx.restore();
    }

    var id = ctx.getImageData(0,0,paperW,labelH);
    var px = id.data;
    var gray = new Float32Array(paperW * labelH);
    for (var i=0; i<paperW*labelH; i++) { gray[i] = 0.299*px[i*4]+0.587*px[i*4+1]+0.114*px[i*4+2]; }
    var factor = (259*(LBL_CONTRAST+255))/(255*(259-LBL_CONTRAST));
    for (var j=0; j<gray.length; j++) { gray[j] = Math.max(0,Math.min(255, factor*(gray[j]-128)+128)); }

    var ckd = document.getElementById('lbl-ck-dither');
    if (ckd && ckd.checked) {
        for (var y=0; y<labelH; y++) {
            for (var x=0; x<paperW; x++) {
                var idx = y*paperW+x;
                var old = gray[idx], nw = old<LBL_THRESHOLD?0:255;
                gray[idx]=nw; var err=old-nw;
                if(x+1<paperW) gray[idx+1]+=err*7/16;
                if(y+1<labelH){
                    if(x>0) gray[idx+paperW-1]+=err*3/16;
                    gray[idx+paperW]+=err*5/16;
                    if(x+1<paperW) gray[idx+paperW+1]+=err*1/16;
                }
            }
        }
    }

    var bpr = Math.ceil(paperW/8), bytes=[];
    bytes.push(0x1B,0x40, 0x1B,0x33,0x00, 0x1D,0x76,0x30,LBL_GS_MODE);
    bytes.push(bpr&0xFF,(bpr>>8)&0xFF, labelH&0xFF,(labelH>>8)&0xFF);
    for (var ry=0; ry<labelH; ry++) {
        for (var bx=0; bx<bpr; bx++) {
            var b=0;
            for (var bit=0; bit<8; bit++) { var rx=bx*8+bit; if(rx<paperW && gray[ry*paperW+rx]<LBL_THRESHOLD) b|=(0x80>>bit); }
            bytes.push(b);
        }
    }
    var rem = Math.round(LBL_GAP_MM * MM2PX_H);
    while(rem>0){ var n=Math.min(255,rem); bytes.push(0x1B,0x4A,n); rem-=n; }
    lblLog('GS v0: '+bpr+'bpr × '+labelH+'rows = '+bytes.length+' bytes','ok');
    return new Uint8Array(bytes);
}

async function lblWriteBle(data) {
    var CHUNK=128, sent=0, useWoR=lblChar.properties.writeWithoutResponse;
    while (sent < data.length) {
        var chunk = data.slice(sent, sent+CHUNK);
        try {
            if (useWoR) await lblChar.writeValueWithoutResponse(chunk);
            else        await lblChar.writeValue(chunk);
        } catch(e) {
            await new Promise(function(r){ setTimeout(r,80); });
            if (useWoR) await lblChar.writeValueWithoutResponse(chunk);
            else        await lblChar.writeValue(chunk);
        }
        sent += CHUNK;
        lblSetProgress(Math.round(sent/data.length*100));
        await new Promise(function(r){ setTimeout(r,30); });
    }
}

async function lblDoPrint() {
    if (!lblImgData) { return; }
    if (!lblIsConn)  { lblLog('Chưa kết nối BLE','err'); return; }
    var btn = document.getElementById('lbl-btn-print');
    if (btn) { btn.disabled=true; btn.style.opacity='0.7'; }
    lblLog('=== BẮT ĐẦU IN ===','info'); lblSetProgress(5);
    try {
        var data = await lblImgToEscPos(lblImgData);
        lblSetProgress(25);
        await lblWriteBle(data);
        lblSetProgress(100); setTimeout(function(){ lblSetProgress(null); },500);
        lblLog('In xong!','ok');
    } catch(e) {
        lblLog('Lỗi: '+e.message,'err'); lblSetProgress(null);
    }
    if (btn) { btn.disabled=false; btn.style.opacity='1'; }
}

// ── Preview canvas ──
async function lblUpdatePreview() {
    if (!lblImgData) return;
    var MM2PX_W = LBL_DPI/25.4, MM2PX_H = lblDpiH/25.4;
    var paperW = Math.round(LBL_PRINTHEAD * MM2PX_W);
    var labelW = Math.round(LBL_PRINTABLE * MM2PX_W * lblScaleVal);
    var labelH = Math.round(LBL_LABEL_H   * MM2PX_H * lblScaleVal);
    var autoOff = (LBL_PRINTHEAD-LBL_PAPER)+(LBL_PAPER-LBL_PRINTABLE)/2.0;
    var offDots = Math.round((autoOff+lblOffVal)*MM2PX_W);

    var cv = document.createElement('canvas');
    cv.width=paperW; cv.height=labelH;
    var ctx=cv.getContext('2d');
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,paperW,labelH);

    var img=new Image();
    await new Promise(function(r){ img.onload=r; img.src=lblImgData; });
    ctx.save();
    ctx.translate(offDots+labelW/2, labelH/2);
    if(lblFlipH) ctx.scale(-1,1);
    if(lblFlipV) ctx.scale(1,-1);
    ctx.rotate(lblRotation*Math.PI/180);
    ctx.drawImage(img,-labelW/2,-labelH/2,labelW,labelH);
    ctx.restore();

    var id=ctx.getImageData(0,0,paperW,labelH), px=id.data;
    var factor=(259*(LBL_CONTRAST+255))/(255*(259-LBL_CONTRAST));
    for(var i=0;i<px.length;i+=4){
        var g=0.299*px[i]+0.587*px[i+1]+0.114*px[i+2];
        var boosted=Math.max(0,Math.min(255,factor*(g-128)+128));
        var out=boosted<LBL_THRESHOLD?0:255;
        px[i]=px[i+1]=px[i+2]=out; px[i+3]=255;
    }
    ctx.putImageData(id,0,0);

    var display=document.getElementById('lbl-preview-canvas');
    if(!display) return;
    var displayW=Math.min(400,paperW*1.5);
    display.width=paperW; display.height=labelH;
    display.style.width=displayW+'px';
    display.style.height=Math.round(labelH/paperW*displayW)+'px';
    display.getContext('2d').putImageData(id,0,0);

    var blacks=0;
    for(var j=0;j<id.data.length;j+=4){ if(id.data[j]===0) blacks++; }
    var total=paperW*labelH;
    var pi=document.getElementById('lbl-preview-info');
    if(pi) pi.textContent=paperW+'×'+labelH+'px | Ink: '+Math.round(blacks/total*100)+'% | Scale '+Math.round(lblScaleVal*100)+'%';
}
</script>


<!-- ══ MODAL IN TEM ══ -->
<div id="print-sticker-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;padding:20px;">
    <div style="background:white;border-radius:24px;width:100%;max-width:480px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.25);">
        <div style="padding:20px 24px 16px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
            <div>
                <div style="font-size:1rem;font-weight:900;color:#111827;">In tem</div>
                <div id="print-modal-subtitle" style="font-size:0.72rem;color:#9ca3af;margin-top:2px;"></div>
            </div>
            <button onclick="closePrintStickerModal()" style="width:32px;height:32px;border-radius:50%;background:#f3f4f6;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;" class="active:scale-95">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        </div>
        <div id="print-modal-list" style="flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:6px;"></div>
        <div style="padding:16px 20px;border-top:1px solid #f3f4f6;flex-shrink:0;display:flex;gap:10px;">
            <button onclick="printStickerSelectAll()" style="flex:1;padding:11px;border-radius:14px;border:1.5px solid #006241;color:#006241;background:white;font-size:0.8rem;font-weight:800;cursor:pointer;" class="active:scale-95">Chọn tất cả</button>
            <button id="print-modal-confirm-btn" onclick="printStickerConfirm()" style="flex:2;padding:11px;border-radius:14px;background:#006241;color:white;font-size:0.8rem;font-weight:800;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;" class="active:scale-95">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>
                In tem
            </button>
        </div>
    </div>
</div>



<script>
