/* Xiǎobù 小步 — app logic (vanilla JS, không cần build) */
(() => {
'use strict';

/* ============ helpers ============ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pad = n => String(n).padStart(2, '0');
const todayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayNum = (d = new Date()) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
const keyOfDay = n => { const d = new Date(n * 864e5); return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`; };
const hasHan = s => /[㐀-鿿]/.test(s);
const hanOnly = s => (s.match(/[㐀-鿿]/g) || []);
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[\s'’\-·,.!?，。！？：:～~…]/g, '');
const go = h => { if (location.hash === h) route(); else location.hash = h; };

/* ============ course (dựng lại mỗi khi tải thêm gói) ============ */
const MEMO = window.MEMO = window.MEMO || {};
const PACKS = window.PACKS || [{ id: 1, name: 'Gói 1', builtin: true }];
let COURSE = [], LESSONS = [], ALL_W = [], ALL_P = [], ITEM = new Map(), ALL_CHARS = [];
const packOf = st => st.pack || 1;
function buildCourse() {
  COURSE = (window.COURSE || []).map((s, i) => ({ s, i }))
    .sort((a, b) => (packOf(a.s) - packOf(b.s)) || ((a.s.track === 'fun') - (b.s.track === 'fun')) || a.i - b.i).map(x => x.s);
  LESSONS = [];
  COURSE.forEach((st, si) => {
    st.si = si;
    st.lessons.forEach(l => {
      l.stage = st; l.idx = LESSONS.length;
      if (!l.W) {
        l.W = l.words.map(w => ({ t: 'w', hz: w[0], py: w[1], vi: w[2], hv: w[3] || '', say: w[4] || w[0], lesson: l }));
        l.P = (l.phrases || []).map(p => ({ t: 'p', hz: p[0], py: p[1], vi: p[2], note: p[3] || '', say: p[4] || p[0], lesson: l }));
        l.G = (l.gram?.ex || []).map(e => ({ t: 'g', hz: e[0], py: e[1], vi: e[2], note: '📐 ' + l.gram.t, say: e[0], lesson: l }));
        l.R = (l.rp || []).map(r => ({ npc: { hz: r[0], py: r[1], vi: r[2] }, ans: { t: 'r', hz: r[3], py: r[4], vi: r[5], say: r[3], note: '🎭 ' + r[2], lesson: l } }));
        l.S = (l.scene?.l || []).filter(x => hasHan(x[1])).map(x => ({ t: 's', hz: x[1], py: x[2], vi: x[3], note: '🎬 ' + x[0], say: x[1], lesson: l }));
        l.C = (l.chars || '').split('|').filter(Boolean).map(s => { const [c, py, vi] = s.split(':'); return { c, py, vi }; });
      }
      LESSONS.push(l);
    });
  });
  ALL_W = LESSONS.flatMap(l => l.W); ALL_P = LESSONS.flatMap(l => l.P);
  ITEM = new Map();
  [...ALL_W, ...ALL_P, ...LESSONS.flatMap(l => l.G), ...LESSONS.flatMap(l => l.R.map(r => r.ans)), ...LESSONS.flatMap(l => l.S)].forEach(it => { if (!ITEM.has(it.hz)) ITEM.set(it.hz, it); });
  ALL_CHARS = [];
  const seen = new Set(); LESSONS.forEach(l => l.C.forEach(c => { if (!seen.has(c.c)) { seen.add(c.c); ALL_CHARS.push({ ...c, lesson: l }); } }));
}
buildCourse();

/* ============ state (localStorage) ============ */
const KEY = 'xiaobu.v1';
const DEF = () => ({
  v: 1, lessons: {}, srs: {}, packs: {}, xp: 0, xpDay: {}, secDay: {}, stageTests: {}, written: {}, tone: { best: 0, plays: 0 },
  settings: { pinyin: true, hv: true, rate: 0.9, voice: '', unlockAll: false, goal: 15, zhScale: 1 },
  last: null, created: Date.now()
});
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.v) { const d = DEF(); return { ...d, ...s, settings: { ...d.settings, ...(s.settings || {}) }, tone: { ...d.tone, ...(s.tone || {}) } }; }
  } catch (e) { /* ignore */ }
  return DEF();
}
let S = load();
let saveFail = false;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { if (!saveFail) { saveFail = true; toast('⚠️ Không lưu được tiến độ (trình duyệt đang ở chế độ ẩn danh?)'); } }
}
const lp = id => (S.lessons[id] ||= { s: [0, 0, 0, 0, 0], done: false, best: 0 });
const stageById = id => COURSE.find(s => s.id === id);
const stageDone = id => { const st = stageById(id); return !!st && st.lessons.every(l => S.lessons[l.id]?.done); };
const stageOpen = st => S.settings.unlockAll || !st.requires || stageDone(st.requires) || st.lessons.some(l => (S.lessons[l.id]?.s || []).some(Boolean));
function isUnlocked(l) {
  if (S.settings.unlockAll || (S.lessons[l.id]?.s || []).some(Boolean)) return true;
  const i = l.stage.lessons.indexOf(l);
  if (i === 0) return l.idx === 0 || stageOpen(l.stage);
  return !!S.lessons[l.stage.lessons[i - 1].id]?.done;
}
function focusStage() {
  const f = stageById(S.focus);
  if (f && !stageDone(f.id) && f.lessons.some(isUnlocked)) return f;
  return COURSE.find(st => st.track !== 'fun' && !stageDone(st.id) && st.lessons.some(isUnlocked))
    || COURSE.find(st => !stageDone(st.id) && st.lessons.some(isUnlocked)) || COURSE[COURSE.length - 1];
}
function currentLesson() {
  const st = focusStage();
  return st.lessons.find(l => !lp(l.id).done && isUnlocked(l)) || LESSONS.find(l => !lp(l.id).done && isUnlocked(l)) || LESSONS[LESSONS.length - 1];
}
function lastActiveDay() {
  const t = dayNum(), keys = [...Object.keys(S.secDay), ...Object.keys(S.xpDay)].filter(k => (S.secDay[k] || 0) >= 60 || (S.xpDay[k] || 0) > 0);
  if (!keys.length) return null;
  const d = keys.sort().pop(), [y, m, dd] = d.split('-').map(Number);
  return t - Math.round(Date.UTC(y, m - 1, dd) / 864e5);
}
const firstIncomplete = p => { const i = p.s.findIndex(x => !x); return i < 0 ? 0 : i; };

function addXP(n) {
  S.xp += n; const k = todayKey(); S.xpDay[k] = (S.xpDay[k] || 0) + n; save(); updHUD();
}
function streak() {
  const active = k => (S.secDay[k] || 0) >= 60 || (S.xpDay[k] || 0) > 0;
  let d = dayNum(), n = 0;
  if (!active(keyOfDay(d))) d--;
  while (active(keyOfDay(d))) { n++; d--; }
  return n;
}
const level = () => 1 + Math.floor(S.xp / 150);

/* ============ GÓI HỌC: chỉ tải gói sau khi xong gói trước ============ */
const packById = id => PACKS.find(p => p.id === +id);
const packLessons = id => LESSONS.filter(l => packOf(l.stage) === +id);
const packLoaded = id => +id === 1 || LESSONS.some(l => packOf(l.stage) === +id);
const packDone = id => { const ls = packLessons(id); return ls.length > 0 && ls.every(l => S.lessons[l.id]?.done); };
const packOpen = id => +id === 1 || !!S.packs?.[id];
const loadingPacks = {};
function loadPack(p) {
  if (packLoaded(p.id)) return Promise.resolve(true);
  if (!p.file) return Promise.resolve(false);
  return loadingPacks[p.id] ||= new Promise(res => {
    const sc = document.createElement('script'); sc.src = p.file; sc.async = true;
    sc.onload = () => { buildCourse(); res(packLoaded(p.id)); };
    sc.onerror = () => { delete loadingPacks[p.id]; sc.remove(); res(false); };
    document.head.appendChild(sc);
  });
}
async function unlockPack(id) {
  const p = packById(id); if (!p || !p.ready) return toast('Gói này đang được soạn — sắp ra mắt!');
  S.packs[id] = S.packs[id] || Date.now(); save();
  view().innerHTML = `<div class="empty">${MASCOT}<h3>Đang tải ${esc(p.name)}…</h3><p class="muted">${esc(p.title)} · ${esc(p.size || '')}</p></div>`;
  const ok = await loadPack(p);
  if (!ok) { toast('❌ Chưa tải được gói — kiểm tra mạng rồi bấm thử lại nhé.', 4000); return go('#/'); }
  const first = COURSE.find(st => packOf(st) === p.id); if (first) S.focus = first.id; save();
  confetti(); toast(`🎉 Đã mở <b>${esc(p.name)} · ${esc(p.title)}</b>!`, 4500); go('#/');
}
// gói tiếp theo chưa tải: trả về {p, state: 'ready' | 'locked' | 'retry' | 'soon'}
function nextPackInfo() {
  const p = PACKS.find(x => x.id > 1 && !packLoaded(x.id)); if (!p) return null;
  if (!p.ready) return { p, state: 'soon' };
  if (packOpen(p.id)) return { p, state: 'retry' };
  const prev = p.id - 1, ls = packLessons(prev), done = ls.filter(l => S.lessons[l.id]?.done).length;
  return { p, state: packDone(prev) ? 'ready' : 'locked', prev, done, total: ls.length };
}
function nextPackCard(n, big) {
  if (!n) return '';
  const { p, state } = n, prevP = packById(p.id - 1);
  const head = `<div class="np-tag">${esc(p.name)} · ${esc(p.months || '')}</div><h3>${state === 'ready' ? '🎁 ' : state === 'soon' ? '🛠️ ' : '🔒 '}${esc(p.title)}</h3><p>${esc(p.desc)}</p>`;
  const body = state === 'ready' ? `<p class="np-ok">🎉 Bạn đã hoàn thành ${esc(prevP?.name || '')}! Bấm để tải gói mới (${esc(p.size || '')}).</p><button class="btn big" data-unlock="${p.id}">Mở ${esc(p.name)} →</button>`
    : state === 'retry' ? `<button class="btn big" data-unlock="${p.id}">Tải lại ${esc(p.name)}</button>`
    : state === 'soon' ? `<p class="muted">Gói này đang được soạn — sẽ ra mắt sớm.</p>`
    : `<div class="bar"><i style="width:${n.done / Math.max(1, n.total) * 100}%"></i></div><p class="muted">Mở khi xong ${esc(prevP?.name || '')}: còn <b>${n.total - n.done}</b>/${n.total} bài. Đã học trước đây? <a href="#/packtest/${n.prev}">Kiểm tra vượt gói →</a></p>`;
  return `<section class="next-pack ${big ? 'big' : ''} np-${state}">${head}${body}</section>`;
}
document.addEventListener('click', e => { const u = e.target.closest('[data-unlock]'); if (u) unlockPack(+u.dataset.unlock); });

/* ============ SRS (ôn tập lặp lại ngắt quãng) ============ */
const IVL = [0, 1, 2, 4, 7, 15, 30, 60, 120];
function srsAdd(items) {
  const t = dayNum();
  items.forEach(it => { if (!S.srs[it.hz]) S.srs[it.hz] = { b: 0, due: t + 1, r: 0, w: 0 }; });
  save();
}
function srsGrade(hz, g) {
  const c = S.srs[hz] || (S.srs[hz] = { b: 0, due: 0, r: 0, w: 0 }), t = dayNum();
  if (g === 0) { c.b = Math.max(0, Math.min(c.b, 1) - 1); c.due = t + 1; c.w++; }
  else if (g === 1) { c.due = t + Math.max(1, Math.ceil(IVL[Math.max(c.b, 1)] / 2)); c.r++; }
  else { c.b = Math.min(c.b + 1, IVL.length - 1); c.due = t + IVL[c.b]; c.r++; }
  save();
}
const dueItems = () => { const t = dayNum(); return Object.entries(S.srs).filter(([k, v]) => v.due <= t && ITEM.has(k)).map(([k]) => ITEM.get(k)); };
const learnedItems = () => Object.keys(S.srs).filter(k => ITEM.has(k)).map(k => ITEM.get(k));
const nextDueInfo = () => { const t = dayNum(); const f = Object.values(S.srs).filter(v => v.due > t).map(v => v.due); if (!f.length) return null; const m = Math.min(...f); return { days: m - t, n: f.filter(x => x === m).length }; };

/* ============ icons ============ */
const sv = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  home: sv('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>'),
  route: sv('<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H15a3.5 3.5 0 0 1 0 7H9a3.5 3.5 0 0 0 0 7h6.5"/>'),
  cards: sv('<rect x="7" y="3" width="13" height="16" rx="2.5"/><path d="M4 7v11a3 3 0 0 0 3 3h9"/>'),
  doc: sv('<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
  search: sv('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>'),
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>',
  lock: sv('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
  check: sv('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  back: sv('<path d="M15 5l-7 7 7 7"/>'),
  vol: sv('<path d="M4 9.5v5h4l5 4.5V5L8 9.5H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
  mic: sv('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
  gear: sv('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  list: sv('<path d="M5 7h14M5 12h14M5 17h14"/>'),
  clock: sv('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  head: sv('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3.5" y="14" width="4" height="6" rx="1.5"/><rect x="16.5" y="14" width="4" height="6" rx="1.5"/>'),
  chat: sv('<path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 17h-8l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 5z"/><path d="M8 10h8M8 13h5"/>'),
  book: sv('<path d="M3.5 5.5A1.5 1.5 0 0 1 5 4h4.5A2.5 2.5 0 0 1 12 6.5V20a2 2 0 0 0-2-2H3.5z"/><path d="M20.5 5.5A1.5 1.5 0 0 0 19 4h-4.5A2.5 2.5 0 0 0 12 6.5V20a2 2 0 0 1 2-2h6.5z"/>'),
  pen: sv('<path d="M15.5 4.5l4 4L8 20H4v-4z"/>'),
  quiz: sv('<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="m8 12 2.5 2.5L16 9"/>'),
  shuffle: sv('<path d="M16 4h4v4M4 20 20 4M20 16v4h-4M15 15l5 5M4 4l5 5"/>'),
  download: sv('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>'),
  upload: sv('<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19.5h14"/>')
};
const MASCOT = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="31" fill="#fff"/><path d="M11 41c0-13.5 9.4-24 21-24s21 10.5 21 24c0 6.5-9.4 10.5-21 10.5S11 47.5 11 41z" fill="#f7ecdc" stroke="#1b1b1f" stroke-width="2.4"/><path d="M24.5 20.5c2.5 3 4.5 4.6 7.5 4.6s5-1.6 7.5-4.6M32 17.5v7.5" fill="none" stroke="#1b1b1f" stroke-width="2.2" stroke-linecap="round"/><circle cx="25" cy="38" r="2.7" fill="#1b1b1f"/><circle cx="39" cy="38" r="2.7" fill="#1b1b1f"/><path d="M28.8 42.2q3.2 3 6.4 0" fill="none" stroke="#1b1b1f" stroke-width="2.2" stroke-linecap="round"/><ellipse cx="19.5" cy="43" rx="3.4" ry="2.4" fill="#f5a9b8" opacity=".85"/><ellipse cx="44.5" cy="43" rx="3.4" ry="2.4" fill="#f5a9b8" opacity=".85"/></svg>`;
const STEPS = [
  { name: 'Từ vựng', icon: I.book },
  { name: 'Nói thật', icon: I.chat },
  { name: 'Nghe', icon: I.head },
  { name: 'Viết', icon: I.pen },
  { name: 'Kiểm tra', icon: I.quiz }
];

/* ============ toast & confetti ============ */
let toastT;
function toast(msg, ms = 2600) {
  const t = $('#toast'); t.innerHTML = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
}
function confetti() {
  const cols = ['#cbb6f5', '#a9d3ec', '#f2a7bf', '#f5d86b', '#9fdf9c', '#dcb4f0'];
  const box = document.createElement('div'); box.className = 'confetti';
  for (let i = 0; i < 46; i++) {
    const s = document.createElement('i');
    s.style.cssText = `left:${Math.random() * 100}%;background:${cols[i % cols.length]};animation-delay:${Math.random() * .4}s;animation-duration:${1.6 + Math.random()}s;transform:rotate(${Math.random() * 360}deg)`;
    box.appendChild(s);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 3000);
}

/* ============ TTS (phát âm) ============ */
const cleanSay = s => String(s).replace(/666/g, '六六六').replace(/[…～~]/g, '').replace(/[／/]/g, '，');
const TTS = {
  ok: 'speechSynthesis' in window, voices: [], v: null, warned: false,
  init() {
    if (!this.ok) return;
    const load = () => {
      const all = speechSynthesis.getVoices();
      this.voices = all.filter(v => /^(zh|cmn)/i.test((v.lang || '').replace('_', '-')));
      this.pick();
      if (location.hash === '#/settings') { const sel = $('#voiceSel'); if (sel && !sel.options.length) settingsView(); }
    };
    load();
    speechSynthesis.addEventListener?.('voiceschanged', load);
    setTimeout(load, 700); setTimeout(load, 2500);
  },
  rank(vs) {
    const sc = v => {
      const l = (v.lang || '').replace('_', '-').toLowerCase(); let s = 0;
      if (l === 'zh-cn' || l.startsWith('cmn')) s += 10;
      if (/hk|tw|yue|mo/.test(l)) s -= 8;
      if (/xiaoxiao|xiaoyi|yunxi|yunjian|tingting|ting-ting|google|普通话|huihui|yaoyao|lili|li-mu|yu-shu|shanshan/i.test(v.name)) s += 3;
      if (/natural|neural|online|premium|enhanced/i.test(v.name)) s += 2;
      return s;
    };
    return [...vs].sort((a, b) => sc(b) - sc(a));
  },
  pick() { this.v = this.voices.find(v => v.name === S.settings.voice) || this.rank(this.voices)[0] || null; },
  tok: 0,
  utter(text, rate) {
    const u = new SpeechSynthesisUtterance(cleanSay(text));
    u.lang = this.v?.lang?.replace('_', '-') || 'zh-CN';
    if (this.v) u.voice = this.v;
    u.rate = rate ?? S.settings.rate; u.pitch = 1;
    return u;
  },
  // đọc lần lượt nhiều câu (cảnh phim)
  seq(texts, onIdx) {
    if (!this.ok) return;
    this.stop(); const tok = this.tok; let i = 0;
    const next = () => {
      if (tok !== this.tok || i >= texts.length) { if (tok === this.tok) onIdx?.(-1); return; }
      onIdx?.(i);
      const u = this.utter(texts[i]);
      u.onend = () => { i++; setTimeout(next, 500); };
      u.onerror = () => onIdx?.(-1);
      speechSynthesis.speak(u);
    };
    next();
  },
  // Phát bằng file âm thanh online (dự phòng) — thử lần lượt nhiều nguồn
  audio: null,
  srcs: [
    t => 'https://dict.youdao.com/dictvoice?le=zh&type=2&audio=' + encodeURIComponent(t),
    t => 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=zh-CN&q=' + encodeURIComponent(t)
  ],
  async online(text, rate, el) {
    const t = cleanSay(text).slice(0, 180);
    for (const mk of this.srcs) {
      try { this.audio?.pause(); } catch (e) {}
      const a = this.audio = new Audio();
      a.preload = 'auto'; a.src = mk(t);
      a.playbackRate = Math.max(0.5, Math.min(1.5, rate ?? S.settings.rate));
      if (el) { el.classList.add('speaking'); a.onended = () => el.classList.remove('speaking'); }
      const ok = await new Promise(res => {
        let done = false; const fin = v => { if (!done) { done = true; res(v); } };
        a.onplaying = () => fin(true); a.onerror = () => fin(false);
        a.play().catch(() => fin(false)); setTimeout(() => fin(!a.paused && a.currentTime > 0), 4000);
      });
      if (ok) return true;
    }
    el?.classList.remove('speaking');
    return false;
  },
  speak(text, { rate, el } = {}) {
    this.tok++;
    $$('.speaking').forEach(e => e.classList.remove('speaking'));
    const mode = S.settings.audio || 'auto';           // auto | device | online
    const noVoice = this.ok && this.voices.length === 0 && speechSynthesis.getVoices().length > 0;
    if (!this.ok || mode === 'online' || (mode === 'auto' && noVoice)) {
      this.online(text, rate, el).then(ok => { if (!ok) toast('🔇 Không phát được âm thanh. Kiểm tra: âm lượng, nút gạt im lặng (iPhone), kết nối mạng.', 5000); });
      return;
    }
    const u = this.utter(text, rate);
    let started = false;
    let t0 = 0;
    u.onstart = () => { started = true; t0 = Date.now(); };
    if (el) { el.classList.add('speaking'); }
    // Android: thiếu dữ liệu giọng Trung thì "đọc" xong ngay mà không ra tiếng → dùng online
    u.onend = () => { el?.classList.remove('speaking'); if (mode === 'auto' && t0 && Date.now() - t0 < 250 && hanOnly(text).length) this.online(text, rate, el); };
    u.onerror = e => { el?.classList.remove('speaking'); if (mode === 'auto' && e.error !== 'interrupted' && e.error !== 'canceled') this.online(text, rate, el); };
    const go = () => { try { speechSynthesis.resume(); } catch (e) {} speechSynthesis.speak(u); };
    // Lỗi Chrome: gọi speak() ngay sau cancel() đôi khi im lặng → chỉ cancel khi đang đọc, rồi chờ một chút
    if (speechSynthesis.speaking || speechSynthesis.pending) { speechSynthesis.cancel(); setTimeout(go, 80); } else go();
    // Sau 1,5 giây vẫn chưa phát (giọng hỏng / bị chặn) → chuyển sang âm thanh online
    if (mode === 'auto') { const tok = this.tok; setTimeout(() => { if (!started && tok === this.tok) { speechSynthesis.cancel(); this.online(text, rate, el); } }, 1500); }
  },
  stop() { this.tok++; if (this.ok) speechSynthesis.cancel(); try { this.audio?.pause(); } catch (e) {} }
};

/* ============ Nhận giọng nói (chấm phát âm gần đúng) ============ */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function lcsScore(target, heard) {
  const t = hanOnly(target), h = hanOnly(heard); if (!t.length) return 0;
  const dp = Array(h.length + 1).fill(0);
  for (const tc of t) { let prev = 0; for (let j = 1; j <= h.length; j++) { const tmp = dp[j]; dp[j] = tc === h[j - 1] ? prev + 1 : Math.max(dp[j], dp[j - 1]); prev = tmp; } }
  return Math.round(dp[h.length] / t.length * 100);
}
let recBusy = false;
function listenAndScore(target, btn, out) {
  if (!SR) return toast('Trình duyệt này chưa hỗ trợ nhận giọng nói.');
  if (recBusy) return;
  TTS.stop();
  const r = new SR(); r.lang = 'zh-CN'; r.interimResults = false; r.maxAlternatives = 4;
  recBusy = true; btn.classList.add('rec');
  if (out) out.innerHTML = '<span class="muted">🎙️ Đang nghe… nói đi nào!</span>';
  r.onresult = e => {
    const alts = [...e.results[0]].map(a => a.transcript);
    const best = alts.map(a => [a, lcsScore(target, a)]).sort((a, b) => b[1] - a[1])[0];
    const p = best[1];
    const em = p >= 85 ? '🎉 Chuẩn lắm!' : p >= 60 ? '👍 Khá ổn, nói rõ thanh hơn chút' : '💪 Thử lại nhé, nghe mẫu rồi nói chậm';
    if (out) out.innerHTML = `<div class="sr-res ${p >= 85 ? 'good' : p >= 60 ? 'ok' : 'bad'}"><b>${p}%</b> ${em}<br><span class="muted">Máy nghe được:</span> <span class="zh">${esc(best[0])}</span></div>`;
    if (p >= 85) addXP(2);
  };
  r.onerror = e => {
    if (out) out.innerHTML = '';
    toast(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'Cần cho phép dùng micro để chấm phát âm.' : 'Không nghe rõ, thử lại nhé.');
  };
  r.onend = () => { recBusy = false; btn.classList.remove('rec'); };
  try { r.start(); } catch (e) { recBusy = false; btn.classList.remove('rec'); }
}

/* ============ small render helpers ============ */
const zh = (s, cls = '') => `<span class="zh ${cls}" lang="zh-CN">${esc(s)}</span>`;
const pyH = py => `<div class="py" data-py>${esc(py)}</div>`;
const hvH = hv => hv ? `<div class="hv">${esc(hv)}</div>` : '';
const sayBtns = (say, extra = '') => `<button class="ibtn" data-say="${esc(say)}" aria-label="Nghe">${I.vol}</button><button class="ibtn slow" data-say="${esc(say)}" data-slow="1" aria-label="Nghe chậm">🐢</button>${extra}`;
const micBtn = say => SR ? `<button class="ibtn mic" data-mic="${esc(say)}" aria-label="Thử nói">${I.mic}</button>` : '';
const wordRow = w => `<div class="wrow"><button class="wrow-hz" data-say="${esc(w.say)}">${zh(w.hz)}</button><div class="wrow-info">${pyH(w.py)}<div class="wrow-vi">${esc(w.vi)}${w.hv ? ` <span class="hv-inline">${esc(w.hv)}</span>` : ''}</div></div><button class="ibtn" data-say="${esc(w.say)}" aria-label="Nghe">${I.vol}</button></div>`;
// 🧠 mẹo nhớ cho từng chữ trong từ (nếu có)
function memoHtml(hz, max = 3) {
  const cs = [...new Set(hanOnly(hz))].filter(c => MEMO[c]).slice(0, max);
  if (!cs.length) return '';
  return `<div class="memo"><b>🧠 Mẹo nhớ</b>${cs.map(c => `<div><span class="zh memo-c">${c}</span> ${esc(MEMO[c])}</div>`).join('')}</div>`;
}
// 📐 khối ngữ pháp
function gramHtml(l) {
  const g = l.gram; if (!g) return '';
  return `<details class="gram" ${lp(l.id).s[0] ? '' : 'open'}><summary>📐 Ngữ pháp: ${esc(g.t)}</summary>
    <div class="gram-body"><div class="gram-f">${esc(g.f)}</div><div class="gram-d">${g.d}</div>
    <div class="gram-ex">${l.G.map(e => `<div class="gx"><button class="gx-zh" data-say="${esc(e.say)}">${zh(e.hz)}</button>${pyH(e.py)}<div class="gx-vi">${esc(e.vi)}</div></div>`).join('')}</div>
    <p class="muted small">Chạm câu để nghe · đọc to theo từng câu ví dụ. Bài kiểm tra cuối bài sẽ có câu sắp xếp theo mẫu này.</p></div></details>`;
}
// 🎬 cảnh hội thoại
function sceneHtml(sc) {
  if (!sc) return '';
  return `<section class="scene card-pad">
    <div class="scene-head"><div><b>🎬 Cảnh: ${esc(sc.t)}</b><small class="muted">Nghe cả cảnh trước, đoán nghĩa, rồi mới xem dịch</small></div>
      <button class="btn" data-scene-play>▶ Nghe cả cảnh</button></div>
    <div class="scene-lines hide-vi">${sc.l.map((ln, i) => `<div class="sl" data-i="${i}">
      <span class="sl-who">${esc(ln[0])}</span>
      <div class="sl-main"><button class="sl-zh" data-say="${esc(ln[1])}">${zh(ln[1])}</button>${pyH(ln[2])}<div class="sl-vi">${esc(ln[3])}</div></div></div>`).join('')}</div>
    <button class="btn ghost small-btn" data-scene-vi>👁 Hiện nghĩa tiếng Việt</button>
  </section>`;
}
function bindScene(box, sc) {
  const sec = $('.scene', box); if (!sec) return;
  const lines = $$('.sl', sec), playBtn = $('[data-scene-play]', sec);
  playBtn.onclick = () => {
    if (playBtn.dataset.on) { TTS.stop(); delete playBtn.dataset.on; playBtn.textContent = '▶ Nghe lại cả cảnh'; lines.forEach(el => el.classList.remove('on')); return; }
    playBtn.dataset.on = 1; playBtn.textContent = '⏹ Dừng';
    TTS.seq(sc.l.map(x => x[1]), i => {
      lines.forEach((el, j) => el.classList.toggle('on', j === i));
      if (i >= 0) lines[i].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      else { delete playBtn.dataset.on; playBtn.textContent = '▶ Nghe lại cả cảnh'; }
    });
  };
  $('[data-scene-vi]', sec).onclick = e => { const l = $('.scene-lines', sec); l.classList.toggle('hide-vi'); e.target.textContent = l.classList.contains('hide-vi') ? '👁 Hiện nghĩa tiếng Việt' : '🙈 Ẩn nghĩa (tự kiểm tra)'; };
}
const explain = it => `<div class="xrow"><button class="xrow-hz" data-say="${esc(it.say)}">${zh(it.hz)}</button><div>${pyH(it.py)}<div class="xrow-vi">${esc(it.vi)}</div></div></div>`;
function phraseCard(p, showLesson = false) {
  return `<div class="pcard">
    ${showLesson ? `<a class="pc-lesson" href="#/lesson/${p.lesson.id}/1">${esc(p.lesson.title)}</a>` : ''}
    <button class="pc-zh" data-say="${esc(p.say)}">${zh(p.hz)}</button>
    ${pyH(p.py)}
    <div class="pc-vi">${esc(p.vi)}</div>
    ${p.note ? `<div class="pc-note">💬 ${esc(p.note)}</div>` : ''}
    <div class="pc-act">${sayBtns(p.say)}${micBtn(p.say)}</div>
    <div class="mic-out"></div>
  </div>`;
}
const weekdayVN = d => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
const calIcon = () => { const d = new Date(); return `<span class="cal"><i>THG ${d.getMonth() + 1}</i><b>${d.getDate()}</b></span>`; };

/* ============ global events ============ */
document.addEventListener('click', e => {
  const t = e.target;
  const mic = t.closest('[data-mic]');
  if (mic) { listenAndScore(mic.dataset.mic, mic, mic.closest('.pcard, .fc-card, .card-pad')?.querySelector('.mic-out')); return; }
  const say = t.closest('[data-say]');
  if (say) { e.preventDefault(); TTS.speak(say.dataset.say, { rate: say.dataset.slow ? Math.max(0.45, S.settings.rate * 0.62) : undefined, el: say }); }
  const py = t.closest('[data-py]');
  if (py && !S.settings.pinyin) py.classList.toggle('show');
  const g = t.closest('[data-go]');
  if (g) { e.preventDefault(); go(g.dataset.go); }
  const act = t.closest('[data-act]');
  if (act && act.dataset.act === 'continue') go('#/session');
});
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); go('#/search'); }
});

/* ============ time tracking (phút học mỗi ngày) ============ */
let lastAct = Date.now();
['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(ev => addEventListener(ev, () => { lastAct = Date.now(); }, { passive: true }));
setInterval(() => {
  if (document.hidden || Date.now() - lastAct > 90000) return;
  if (!/^#\/(lesson|review|pinyin|write|phrases|test|session)/.test(location.hash)) return;
  const k = todayKey(), before = S.secDay[k] || 0, goal = S.settings.goal * 60;
  S.secDay[k] = before + 10;
  if (before < goal && before + 10 >= goal) { confetti(); toast(`🎉 Đủ ${S.settings.goal} phút hôm nay rồi! Giỏi lắm!`, 4000); }
  save(); updHUD();
}, 10000);

/* ============ chrome: header, nav, dock ============ */
const NAV = [
  ['#/', 'Hôm nay', I.home], ['#/path', 'Lộ trình', I.route], ['#/review', 'Ôn tập', I.cards],
  ['#/pinyin', 'Pinyin', '<span class="zh nav-zh">拼</span>'], ['#/phrases', 'Sổ tay', I.doc]
];
function buildChrome() {
  $('#brandMascot').innerHTML = MASCOT;
  $('#nav').innerHTML = NAV.map(([h, n, ic]) => `<a href="${h}" data-h="${h}" aria-label="${n}">${ic}<span>${n}</span></a>`).join('');
  $('#dock').innerHTML = `
    <button class="d c-purple" data-go="#/search" aria-label="Tìm kiếm">${I.search}</button>
    <button class="d c-blue" data-go="#/review" aria-label="Ôn tập thẻ">${I.cards}</button>
    <button class="d c-pink zh" data-go="#/pinyin" aria-label="Pinyin & thanh điệu">拼</button>
    <button class="d c-yellow zh" data-go="#/write" aria-label="Tập viết chữ Hán">汉</button>
    <button class="d c-green" data-go="#/phrases" aria-label="Sổ tay câu nói">${I.doc}</button>
    <button class="d c-lilac" data-go="#/settings" aria-label="Giọng đọc & cài đặt">${I.vol}</button>
    <span class="sep"></span>
    <button class="d c-dark" data-act="continue" aria-label="Bắt đầu buổi học hôm nay">${I.play}</button>`;
  updHUD();
}
function updHUD() {
  const k = todayKey(), min = Math.floor((S.secDay[k] || 0) / 60), goal = S.settings.goal;
  const pct = Math.min(1, min / goal), r = 18, c = 2 * Math.PI * r;
  $('#streakN').textContent = streak();
  $('#lvlN').textContent = `Cấp ${level()}`;
  $('#minN').textContent = `${Math.min(min, 999)}/${goal} phút hôm nay`;
  $('#ring').innerHTML = `<svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="${r}" stroke="#2a2a2f" stroke-width="5" fill="none"/><circle cx="22" cy="22" r="${r}" stroke="#9fdf9c" stroke-width="5" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" transform="rotate(-90 22 22)"/></svg>`;
}
function updNav() {
  const h = location.hash || '#/';
  let active = null;
  $$('#nav a').forEach(a => {
    const on = a.dataset.h === '#/' ? (h === '#/' || h === '') : h.startsWith(a.dataset.h);
    a.classList.toggle('active', on); if (on) active = a;
  });
  placeNotch(active);
}
function placeNotch(a) {
  const n = $('#notch');
  if (!a || getComputedStyle($('#nav')).display === 'none') { n.style.opacity = 0; return; }
  const r = a.getBoundingClientRect(), pr = $('#panel').getBoundingClientRect();
  n.style.left = (r.left + r.width / 2 - pr.left) + 'px'; n.style.opacity = 1;
}
addEventListener('resize', () => placeNotch($('#nav a.active')));
function applySettings() {
  document.body.classList.toggle('no-py', !S.settings.pinyin);
  document.body.classList.toggle('no-hv', !S.settings.hv);
  document.documentElement.style.setProperty('--zh-scale', S.settings.zhScale);
}

/* ============ router ============ */
const view = () => $('#view');
const ROUTES = [
  [/^#?\/?$/, homeView], [/^#\/path$/, pathView], [/^#\/lesson\/(\w+)(?:\/(\d))?$/, lessonView],
  [/^#\/review$/, reviewView], [/^#\/pinyin$/, pinyinView], [/^#\/write$/, writeView],
  [/^#\/phrases$/, phrasesView], [/^#\/search$/, searchView], [/^#\/settings(?:\/remind)?$/, settingsView], [/^#\/test\/(\w+)$/, stageTestView],
  [/^#\/session$/, sessionView], [/^#\/packtest\/(\d+)$/, packTestView]
];
function route() {
  const h = location.hash || '#/';
  TTS.stop();
  document.body.classList.remove('in-lesson');
  for (const [re, fn] of ROUTES) {
    const m = h.match(re);
    if (m) { fn(...m.slice(1)); window.scrollTo(0, 0); updNav(); return; }
  }
  location.hash = '#/';
}
addEventListener('hashchange', route);

/* ============ HOME ============ */
function lessonCard(l, isCur) {
  const p = lp(l.id), un = isUnlocked(l), n = p.s.filter(Boolean).length;
  const cls = ['lcard', isCur ? 'current' : '', p.done ? 'done' : '', !un ? 'locked' : ''].join(' ');
  const right = isCur ? `<a class="play" href="#/lesson/${l.id}" aria-label="Học bài này">${I.play}</a>`
    : p.done ? `<a class="badge-done" href="#/lesson/${l.id}" aria-label="Học lại">${I.check}</a>`
    : un ? `<a class="play sm" href="#/lesson/${l.id}" aria-label="Học bài này">${I.play}</a>`
    : `<span class="lock">${I.lock}</span>`;
  const foot = isCur ? `<a class="btn-white" href="#/lesson/${l.id}">${I.clock}<span>${n ? 'Học tiếp' : 'Bắt đầu học'}</span></a>`
    : `<span class="pill">${p.done ? 'Đã xong ✓' : un ? `${n}/5 bước` : 'Sắp tới ⏳'}</span>`;
  return `<article class="${cls}" data-color="${l.stage.color}">
    <div class="lc-top"><div class="lc-head"><h4>${esc(l.title)}</h4><div class="lc-zh">${zh(l.zh)} <span class="lc-sub">${esc(l.sub || '')}</span></div></div>${right}</div>
    <p class="lc-desc">${esc(l.desc)}</p>
    <div class="lc-foot">${foot}<div class="lc-steps">${STEPS.map((s, i) => un
      ? `<a class="mini ${p.s[i] ? 'on' : ''}" href="#/lesson/${l.id}/${i}" title="${s.name}" aria-label="${s.name}">${s.icon}</a>`
      : `<span class="mini" title="${s.name}">${s.icon}</span>`).join('')}</div></div>
  </article>`;
}
function homeView() {
  const cur = currentLesson(), st = cur.stage, ls = st.lessons;
  const doneN = ls.filter(l => lp(l.id).done).length;
  const due = dueItems().length, learned = learnedItems().length, p = lp(cur.id);
  const ph = ALL_P[dayNum() % ALL_P.length];
  const d = new Date(), dateLbl = `${weekdayVN(d)}, ${d.getDate()}.${d.getMonth() + 1}`;
  const nd = nextDueInfo();
  const min = Math.floor((S.secDay[todayKey()] || 0) / 60), goal = S.settings.goal;
  const allDone = LESSONS.every(l => lp(l.id).done);
  const away = lastActiveDay(), fresh = S.xp === 0 && !Object.keys(S.srs).length;
  const npReady = nextPackInfo()?.state === 'ready';
  const greetTxt = allDone && npReady ? '🎉 Bạn đã xong cả gói! Mở gói tiếp theo ngay bên dưới nha.'
    : allDone ? 'Bạn đã học hết các bài hiện có! Ôn tập mỗi ngày để nhớ lâu nha 🎉'
    : away >= 3 ? `Lâu rồi không gặp (${away} ngày) 👋 Quên là bình thường — mình ôn lại một chút rồi học tiếp nha!`
    : `Hôm nay mình học bài <b>${esc(cur.title)}</b> ${zh(cur.zh)} nha!`;
  const sessDue = Math.min(due, 12);
  const np = nextPackInfo(), cpk = packById(packOf(st)) || PACKS[0], cpl = packLessons(cpk.id), cpd = cpl.filter(l => lp(l.id).done).length;
  view().innerHTML = `
  <div class="greet"><span class="mascot">${MASCOT}</span><p>${greetTxt}</p></div>
  ${allDone && !sessDue ? '' : `<a class="session-cta" href="#/session">
    <span class="sc-play">${I.play}</span>
    <span class="sc-txt"><b>Buổi học hôm nay · ~${goal} phút</b>
      <span class="sc-steps">${sessDue ? `<i>① Ôn ${sessDue} thẻ cũ</i>` : ''}${allDone ? '' : `${sessDue ? '<i>→</i>' : ''}<i>${sessDue ? '②' : '①'} ${esc(cur.title)}</i>`}</span></span>
    <span class="sc-go">Bắt đầu →</span>
  </a>`}
  ${fresh ? `<div class="comeback card-pad"><div><b>👋 Từng học tiếng Trung rồi (HelloChinese…)?</b><span class="muted">Làm bài kiểm tra nhanh — đạt ≥ 80% thì bỏ qua cả chặng, khỏi học lại từ đầu.</span></div>
    <div class="btn-row"><a class="btn ghost" href="#/test/s1">Kiểm tra Pinyin</a><a class="btn ghost" href="#/test/s2">Kiểm tra Sinh tồn</a></div></div>` : ''}
  ${np && np.state === 'ready' ? nextPackCard(np, true) : ''}
  <div class="home">
    <section class="home-main">
      <div class="title-row">
        <h1>Lộ trình của tôi <span class="flag" aria-hidden="true">🇨🇳</span></h1>
        <button class="search-pill" data-go="#/search">${I.search}<span>Tìm bài, chữ Hán, từ vựng…</span><kbd>⌘K</kbd></button>
      </div>
      <div class="stats-row">
        <div class="rail"><a class="rail-btn active" href="#/" aria-label="Lộ trình">${I.route}</a><a class="rail-btn" href="#/path" aria-label="Danh sách">${I.list}</a><a class="rail-btn" href="#/settings" aria-label="Cài đặt">${I.gear}</a></div>
        <div class="stat c-blue"><b>${ls.length}</b><span>Bài trong chặng</span></div>
        <div class="stat c-green big"><b>${doneN}</b><span>Đã xong</span></div>
        <div class="stat dashed"><b>${ls.length - doneN}</b><span>Còn lại</span></div>
      </div>
      <div class="pack-bar"><span class="pb-tag">${esc(cpk.name)} · ${esc(cpk.months || '')}</span><b>${esc(cpk.title || '')}</b><span class="pb-n">${cpd}/${cpl.length} bài</span><div class="bar"><i style="width:${cpd / Math.max(1, cpl.length) * 100}%"></i></div></div>
      <div class="stage-chips">${COURSE.map(x => { const op = stageOpen(x) || x.lessons.some(isUnlocked), dn = x.lessons.filter(l => lp(l.id).done).length;
        return `<button class="schip c-${x.color} ${x === st ? 'on' : ''} ${op ? '' : 'locked'}" data-stage="${x.id}">${op ? '' : '🔒 '}${zh(x.zh)} ${esc(x.short || x.name)}<small>${dn}/${x.lessons.length}</small></button>`; }).join('')}</div>
      <div class="stage-head">
        <h3>${zh(st.zh)} · ${esc(st.name)}</h3>
        <a href="#/path">Xem các chặng khác →</a>
      </div>
      <div class="zigzag">${ls.map(l => lessonCard(l, l === cur && !allDone)).join('')}</div>
      <div class="stage-test-cta">
        <div><b>📝 Kiểm tra chặng</b><span>${S.stageTests[st.id] ? `Điểm cao nhất: ${S.stageTests[st.id]}%` : '15 câu tổng hợp cả chặng — kiểm tra lại xem bạn nhớ bao nhiêu.'}</span></div>
        <a class="btn" href="#/test/${st.id}">Làm bài</a>
      </div>
      ${np && np.state !== 'ready' ? nextPackCard(np) : ''}
    </section>
    <aside class="today">
      <div class="today-head"><h2>Hôm nay</h2>${calIcon()}</div>
      <div class="today-cards">
        <div class="tcard c-blue">
          <div class="tc-head"><span class="ic">${I.cards}</span>Ôn từ vựng<span class="right">${dateLbl}</span></div>
          <div class="tc-body">${due ? `<b class="big-n">${due}</b> thẻ đến hạn ôn hôm nay. Ôn đúng lúc sắp quên là cách nhớ lâu nhất!`
            : learned ? `Hết thẻ đến hạn 🎉${nd ? ` <br><span class="muted">${nd.days === 1 ? 'Ngày mai' : `${nd.days} ngày nữa`} có ${nd.n} thẻ.</span>` : ''}`
            : 'Từ vựng sẽ xuất hiện ở đây sau khi bạn học bước Từ vựng trong một bài.'}</div>
          ${due ? `<a class="tc-btn" href="#/review">Ôn ngay →</a>` : learned ? `<a class="tc-btn" href="#/review">Ôn thêm ngẫu nhiên →</a>` : ''}
        </div>
        <div class="tcard tc-lesson c-${cur.stage.color}">
          <div class="tc-head"><span class="ic">${I.book}</span>Bài học<span class="right">${p.s.filter(Boolean).length}/5 bước</span></div>
          <div class="tc-body"><b>${esc(cur.title)}</b> · ${zh(cur.zh)}<br>${esc(cur.desc)}</div>
          <a class="tc-btn" href="#/lesson/${cur.id}">${p.s.some(Boolean) ? 'Học tiếp' : 'Bắt đầu'} →</a>
        </div>
        <div class="tcard c-yellow">
          <div class="tc-head"><span class="ic">${I.chat}</span>Câu nói hôm nay</div>
          <div class="tc-body qod"><button class="qod-zh" data-say="${esc(ph.say)}">${zh(ph.hz)}</button>${pyH(ph.py)}<div>${esc(ph.vi)}</div>${ph.note ? `<div class="muted small">💬 ${esc(ph.note)}</div>` : ''}</div>
          <div class="tc-row">${sayBtns(ph.say)}</div>
        </div>
        <div class="tcard c-pink">
          <div class="tc-head"><span class="ic zh">拼</span>Thanh điệu<span class="right">${S.tone.best}/10</span></div>
          <div class="tc-body">Luyện tai phân biệt 4 thanh — kỹ năng quan trọng nhất để nghe phim.</div>
          <a class="tc-btn" href="#/pinyin">Luyện nghe →</a>
        </div>
        <div class="tcard c-green">
          <div class="tc-head"><span class="ic">${I.clock}</span>Mục tiêu ${goal} phút<span class="right">🔥 ${streak()} ngày</span></div>
          <div class="tc-body"><div class="bar"><i style="width:${Math.min(100, min / goal * 100)}%"></i></div><span class="muted">${min >= goal ? 'Xong mục tiêu hôm nay! 🎉' : `Còn ${goal - min} phút nữa.`} Thời gian chỉ tính khi bạn đang học.</span></div>
          <a class="tc-btn" href="#/settings/remind">⏰ Đặt lịch nhắc học</a>
        </div>
      </div>
    </aside>
  </div>`;
  $$('.schip').forEach(b => b.onclick = () => {
    const x = stageById(b.dataset.stage);
    if (b.classList.contains('locked')) { const r = stageById(x.requires); return toast(`🔒 Học xong chặng <b>${esc(r?.short || '')}</b> để mở — hoặc làm Kiểm tra chặng để nhảy cóc.`); }
    S.focus = x.id; save(); homeView();
    $('.stage-head')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const sc = $('.stage-chips'), on = $('.schip.on'); if (sc && on) sc.scrollLeft = on.offsetLeft - sc.offsetLeft - 16;
}

/* ============ PATH (tất cả chặng) ============ */
function pathView() {
  const cur = currentLesson();
  view().innerHTML = `<div class="page">
    <div class="page-head"><a class="back" href="#/">${I.back}</a><h1>Các chặng</h1></div>
    <p class="muted lead">Mỗi bài ~15 phút: Từ vựng → Nói thật → Nghe → Viết → Kiểm tra (đạt ≥70% để mở bài tiếp theo).</p>
    ${COURSE.map((st, k) => {
      const done = st.lessons.filter(l => lp(l.id).done).length;
      const pk = packById(packOf(st)) || PACKS[0], newPack = k === 0 || packOf(COURSE[k - 1]) !== packOf(st);
      const pl = packLessons(pk.id), pdn = pl.filter(l => lp(l.id).done).length;
      const head = (newPack ? `<div class="pack-h"><span>${esc(pk.name)} · ${esc(pk.months || '')}</span><h2>${esc(pk.title || '')}</h2><p class="muted">${pdn}/${pl.length} bài đã xong${pk.id === 1 ? '' : ` · <a href="#/packtest/${pk.id}">📝 Kiểm tra gói</a>`}</p></div>` : '')
        + (pk.id === 1 && k === 0 ? `<h2 class="track-h">🧭 Lộ trình chính</h2><p class="muted">Nền tảng giao tiếp & đọc chữ, học lần lượt từng chặng.</p>`
        : (pk.id === 1 && st.track === 'fun' && COURSE[k - 1].track !== 'fun') ? `<h2 class="track-h">🎬 Chuyên đề phim & mạng xã hội</h2><p class="muted">Mở sau chặng Pinyin. Chọn chặng bạn thích học song song với lộ trình chính.</p>` : '');
      return `${head}<section class="stage-block c-${st.color}">
        <div class="sb-head"><div><div class="sb-zh">${zh(st.zh)}</div><h2>${esc(st.name)}</h2><p>${esc(st.desc)}</p>${stageOpen(st) || st.lessons.some(isUnlocked) ? '' : `<p class="lock-note">🔒 Mở khi xong chặng <b>${esc(stageById(st.requires)?.short || '')}</b> — hoặc làm Kiểm tra chặng (≥ 80%) để nhảy cóc.</p>`}</div>
        <div class="sb-prog"><b>${done}/${st.lessons.length}</b><div class="bar"><i style="width:${done / st.lessons.length * 100}%"></i></div></div></div>
        <div class="sb-list">${st.lessons.map(l => {
          const p = lp(l.id), un = isUnlocked(l);
          return `<a class="sb-row ${un ? '' : 'locked'} ${l === cur ? 'cur' : ''}" ${un ? `href="#/lesson/${l.id}"` : ''}>
            <span class="sb-ic">${p.done ? I.check : un ? I.play : I.lock}</span>
            <span class="sb-t"><b>${esc(l.title)}</b> ${zh(l.zh)}<small>${esc(l.desc)}</small></span>
            <span class="sb-n">${p.s.filter(Boolean).length}/5</span></a>`;
        }).join('')}</div>
        <a class="sb-test" href="#/test/${st.id}">📝 Kiểm tra chặng${S.stageTests[st.id] ? ` · cao nhất ${S.stageTests[st.id]}%` : ''}</a>
      </section>`;
    }).join('')}
    <div class="pack-h"><span>Lộ trình 1 năm</span><h2>Các gói tiếp theo</h2></div>
    ${PACKS.filter(p => !packLoaded(p.id)).map(p => { const n = nextPackInfo(); return n && n.p.id === p.id ? nextPackCard(n) : nextPackCard({ p, state: p.ready ? 'locked' : 'soon', prev: p.id - 1, done: 0, total: 1 }).replace(/<div class="bar">[\s\S]*?<\/p>/, '<p class="muted">Mở sau các gói trước.</p>'); }).join('') || '<p class="muted">Bạn đã mở tất cả các gói hiện có 🎉</p>'}
  </div>`;
}

/* ============ LESSON ============ */
function lessonView(id, stepStr) {
  const l = LESSONS.find(x => x.id === id);
  if (!l) return go('#/');
  if (!isUnlocked(l)) { toast('🔒 Bài này chưa mở — học xong bài trước nhé (hoặc bật "Mở khóa tất cả" trong Cài đặt).'); return go('#/'); }
  const p = lp(id), step = stepStr != null ? Math.min(4, +stepStr) : firstIncomplete(p);
  S.last = id; S.focus = l.stage.id; save();
  document.body.classList.add('in-lesson');
  view().innerHTML = `<div class="lesson c-${l.stage.color}">
    <div class="lesson-top">
      <a class="back" href="#/" aria-label="Quay lại">${I.back}</a>
      <div class="lt-title"><small>${esc(l.stage.name)} · Bài ${l.stage.lessons.indexOf(l) + 1}</small><h2>${esc(l.title)} ${zh(l.zh)}</h2></div>
    </div>
    <div class="steps-tabs">${STEPS.map((s, i) => `<a href="#/lesson/${id}/${i}" class="stab ${i === step ? 'active' : ''} ${p.s[i] ? 'done' : ''}">${p.s[i] ? I.check : s.icon}<span>${s.name}</span></a>`).join('')}</div>
    <div id="stepBody" class="step-body"></div>
  </div>`;
  [stepVocab, stepPhrases, stepListen, stepWrite, stepTest][step](l, $('#stepBody'));
  $('.stab.active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
}
function completeStep(l, i, silent) {
  const p = lp(l.id);
  if (!p.s[i]) { p.s[i] = 1; addXP(10); if (!silent) toast(`✅ Xong bước <b>${STEPS[i].name}</b> · +10 XP`); }
  if (i === 0) srsAdd([...l.W, ...l.G]);
  if (i === 1) srsAdd([...l.P, ...l.R.map(r => r.ans)]);
  save();
}
function nextStepHref(l, i) {
  if (i < 4) return `#/lesson/${l.id}/${i + 1}`;
  return '#/';
}

/* Step 1: từ vựng — học theo nhóm 4 từ, mỗi nhóm kiểm tra ngay (nhớ lâu hơn học một lèo) */
function chunkWords(W, n = 4) {
  const out = []; for (let i = 0; i < W.length; i += n) out.push(W.slice(i, i + n));
  if (out.length > 1 && out[out.length - 1].length < 2) out[out.length - 2].push(...out.pop());
  return out;
}
function stepVocab(l, box) {
  const W = l.W, chunks = chunkWords(W);
  box.innerHTML = `
    ${l.intro ? `<details class="intro" ${lp(l.id).s[0] ? '' : 'open'}><summary>📘 Lý thuyết nhanh</summary><div class="intro-body">${l.intro}</div></details>` : ''}
    ${gramHtml(l)}
    <div class="chunk-bar">${chunks.map((c, k) => `<span data-k="${k}">${k + 1}</span>`).join('')}<small class="muted">Học 4 từ → kiểm tra ngay → nhóm tiếp</small></div>
    <div id="vArea"></div>
    <details class="wordlist"><summary>Xem cả ${W.length} từ</summary>${W.map(wordRow).join('')}</details>`;
  const area = $('#vArea', box);
  const mark = k => $$('.chunk-bar span', box).forEach((e, j) => { e.classList.toggle('on', j === k); e.classList.toggle('done', j < k); });
  const focusArea = () => { $$('details.intro, details.gram', box).forEach(d => { d.open = false; }); area.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
  const runChunk = (k, words, retry) => {
    mark(k); let i = 0;
    if (k > 0 || retry) focusArea();
    area.innerHTML = `<div id="fc"></div>
      <div class="fc-nav"><button class="btn ghost" id="prev" aria-label="Trước">←</button><span id="cnt" class="muted"></span><button class="btn" id="next">Tiếp →</button></div>`;
    const show = speak => {
      const w = words[i];
      $('#fc', area).innerHTML = `<div class="fc-card">
        ${retry ? '<div class="pill retry">🔁 Ôn lại từ vừa sai</div>' : ''}
        <button class="fc-hz" data-say="${esc(w.say)}">${zh(w.hz)}</button>
        ${pyH(w.py)}${hvH(w.hv)}
        <div class="fc-vi">${esc(w.vi)}</div>
        <div class="fc-actions">${sayBtns(w.say)}${micBtn(w.say)}</div>
        <div class="mic-out"></div>
        ${memoHtml(w.hz)}
        <div class="fc-tip muted">Chạm chữ để nghe · đọc to theo 2 lần</div>
      </div>`;
      $('#cnt', area).textContent = `Nhóm ${k + 1}/${chunks.length} · ${i + 1}/${words.length}`;
      $('#prev', area).disabled = i === 0;
      $('#next', area).textContent = i === words.length - 1 ? 'Kiểm tra nhanh ✓' : 'Tiếp →';
      if (speak) TTS.speak(w.say);
    };
    $('#prev', area).onclick = () => { if (i > 0) { i--; show(true); } };
    $('#next', area).onclick = () => { if (i < words.length - 1) { i++; show(true); } else quizChunk(k, words); };
    let sx = null;
    area.ontouchstart = e => { if (e.target.closest('#fc')) sx = e.touches[0].clientX; };
    area.ontouchend = e => {
      if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 60) { if (dx < 0 && i < words.length - 1) { i++; show(true); } else if (dx > 0 && i > 0) { i--; show(true); } }
    };
    show(!!retry);
  };
  const quizChunk = (k, words) => {
    focusArea();
    const pool = poolFor(l, 'w');
    const qs = shuffle(words.map((w, j) => {
      const t = !hasHan(w.hz) ? 'hz2vi' : ['hz2vi', 'lis2hz', 'vi2hz'][j % 3];
      return QT[t](w, pool);
    }));
    runQuiz(area, qs, {
      intro: '⚡ Kiểm tra nhanh nhóm vừa học — nhớ lại ngay giúp não "khóa" từ lâu hơn.',
      onDone: (sc, tot, wrong) => {
        const next = k + 1 < chunks.length;
        const wrongW = [...new Set(wrong.map(q => q.item))];
        area.innerHTML = `<div class="mini-res ${wrongW.length ? '' : 'ok'}">
          <b>${wrongW.length ? `Đúng ${sc}/${tot} — ôn lại ${wrongW.length} từ sai nhé` : `🎉 Đúng hết ${tot}/${tot}!`}</b>
          <div class="btn-row">${wrongW.length ? '<button class="btn" id="again">🔁 Ôn lại từ sai</button><button class="btn ghost" id="skip">Bỏ qua</button>'
            : `<button class="btn big" id="skip">${next ? `Nhóm ${k + 2} →` : 'Xong bước Từ vựng ✓'}</button>`}</div></div>`;
        const go2 = () => { if (next) runChunk(k + 1, chunks[k + 1]); else { completeStep(l, 0); go(nextStepHref(l, 0)); } };
        $('#skip', area).onclick = go2;
        const ag = $('#again', area); if (ag) ag.onclick = () => runChunk(k, wrongW, true);
      }
    });
  };
  runChunk(0, chunks[0]);
}

/* Step 2: câu nói thật */
function stepPhrases(l, box) {
  box.innerHTML = `
    ${sceneHtml(l.scene)}
    <div class="hint">💡 <b>Shadowing:</b> nghe → nói đè theo 2–3 lần mỗi câu, bắt chước cả ngữ điệu. ${SR ? 'Bấm 🎤 để app chấm phát âm (gần đúng).' : ''}</div>
    <div class="phrases">${l.P.map(p => phraseCard(p)).join('')}</div>
    ${l.R.length ? `<section class="rp card-pad"><b>🎭 Đóng vai</b><p class="muted small">Người kia nói — bạn chọn câu đáp rồi bấm 🎤 nói to câu đó. ${l.R.length} lượt.</p><div id="rpBox"><button class="btn" id="rpStart">▶ Bắt đầu đóng vai</button></div></section>` : ''}
    <div class="step-actions"><button class="btn big" id="doneStep">Đã luyện xong ✓</button></div>`;
  bindScene(box, l.scene);
  const rpS = $('#rpStart', box);
  if (rpS) rpS.onclick = function startRp() {
    const rb = $('#rpBox', box);
    runQuiz(rb, l.R.map(r => QT.rp(r, l)), { intro: '🎭 Nghe câu hỏi, chọn câu đáp phù hợp, rồi nói to.',
      onDone: (sc, tot) => { rb.innerHTML = `<p>✅ Xong đóng vai: <b>${sc}/${tot}</b> lượt đúng.</p><button class="btn ghost" id="rpStart">↻ Đóng vai lại</button>`; $('#rpStart', rb).onclick = startRp; } });
  };
  $('#doneStep', box).onclick = () => { completeStep(l, 1); go(nextStepHref(l, 1)); };
}

/* Step 3: nghe */
function stepListen(l, box) {
  const qs = buildListen(l);
  runQuiz(box, qs, {
    intro: '🎧 Nghe và chọn đáp án. Bấm 🐢 để nghe chậm.',
    onDone: (sc, tot, wrong) => {
      completeStep(l, 2, true);
      resultScreen(box, { sc, tot, wrong, pass: true, title: 'Xong phần nghe!',
        btns: `<button class="btn ghost" data-retry>Làm lại</button><a class="btn" href="${nextStepHref(l, 2)}">Bước tiếp →</a>`,
        retry: () => stepListen(l, box) });
    }
  });
}

/* Step 4: viết */
let writers = [];
function stepWrite(l, box) {
  const C = l.C.length ? l.C : hanOnly(l.W[0].hz).slice(0, 2).map(c => ({ c, py: '', vi: '' }));
  box.innerHTML = `
    <div class="hint">✍️ Xem thứ tự nét, rồi bấm <b>Tập viết</b> và vẽ bằng ngón tay. Sai 2 lần app sẽ gợi ý nét.</div>
    <div class="ctabs">${C.map((c, i) => `<button class="ctab ${i ? '' : 'active'}" data-i="${i}">${zh(c.c)}</button>`).join('')}</div>
    <div id="wArea"></div>
    <div class="step-actions"><button class="btn big" id="doneStep">Xong bước này ✓</button></div>`;
  const area = $('#wArea', box);
  $$('.ctab', box).forEach(b => b.onclick = () => { $$('.ctab', box).forEach(x => x.classList.remove('active')); b.classList.add('active'); renderWriter(area, C[+b.dataset.i]); });
  renderWriter(area, C[0]);
  $('#doneStep', box).onclick = () => { completeStep(l, 3); go(nextStepHref(l, 3)); };
}
// Dữ liệu nét: ưu tiên file trong repo (data/strokes.json), không có thì lấy từ CDN
const strokeCache = {};
const strokeFile = url => strokeCache[url] ||= fetch(url).then(r => r.ok ? r.json() : {}).catch(() => ({}));
async function loadCharData(c, onLoad, onError) {
  const files = ['data/strokes.json', ...PACKS.filter(p => p.strokes && packLoaded(p.id)).map(p => p.strokes)];
  for (const f of files) { const db = await strokeFile(f); if (db[c]) return onLoad(db[c]); }
  fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${encodeURIComponent(c)}.json`)
    .then(r => { if (!r.ok) throw 0; return r.json(); }).then(onLoad).catch(onError);
}
function renderWriter(area, ch) {
  writers = [];
  area.innerHTML = `<div class="writer-wrap card-pad">
    <div class="writer-grid" id="hw"></div>
    <div class="w-info"><button class="w-big" data-say="${esc(ch.c)}">${zh(ch.c)}</button>${ch.py ? pyH(ch.py) : ''}<div class="w-vi">${esc(ch.vi || '')}</div>${memoHtml(ch.c, 1)}
      <div class="w-btns"><button class="btn ghost" id="wAnim">▶ Xem nét</button><button class="btn" id="wQuiz">✍️ Tập viết</button><button class="ibtn" data-say="${esc(ch.c)}" aria-label="Nghe">${I.vol}</button></div>
      <div id="wMsg" class="w-msg muted">${S.written[ch.c] ? `Đã viết ${S.written[ch.c]} lần` : ''}</div>
    </div></div>`;
  const hw = $('#hw', area), msg = $('#wMsg', area);
  const size = Math.max(200, Math.min(280, (area.clientWidth || 320) - 40));
  hw.style.width = hw.style.height = size + 'px';
  if (!window.HanziWriter) { hw.innerHTML = `<div class="fallback-char">${zh(ch.c)}</div>`; msg.textContent = 'Không tải được dữ liệu nét chữ (cần kết nối mạng).'; return; }
  const w = HanziWriter.create(hw, ch.c, {
    width: size, height: size, padding: 14, showOutline: true, strokeColor: '#1b1b1f', radicalColor: '#8e5bd6',
    outlineColor: '#dedee3', highlightColor: '#58c46e', drawingColor: '#3a3a40', drawingWidth: 26,
    strokeAnimationSpeed: 1.1, delayBetweenStrokes: 160, showHintAfterMisses: 2, charDataLoader: loadCharData,
    onLoadCharDataError: () => { hw.innerHTML = `<div class="fallback-char">${zh(ch.c)}</div>`; msg.textContent = 'Không tải được nét chữ (kiểm tra mạng).'; }
  });
  writers.push(w);
  setTimeout(() => w.animateCharacter(), 250);
  $('#wAnim', area).onclick = () => { try { w.cancelQuiz(); } catch (e) {} w.showCharacter(); w.animateCharacter(); };
  $('#wQuiz', area).onclick = () => {
    msg.textContent = 'Vẽ từng nét theo đúng thứ tự…';
    w.quiz({
      onMistake: () => { msg.textContent = 'Chưa đúng nét, thử lại nhé'; },
      onCorrectStroke: s => { msg.textContent = `Nét ${s.strokeNum + 1} ✓ (còn ${s.strokesRemaining})`; },
      onComplete: s => {
        S.written[ch.c] = (S.written[ch.c] || 0) + 1; addXP(3);
        msg.innerHTML = `<b>🎉 Hoàn thành!</b> Sai ${s.totalMistakes} nét · đã viết ${S.written[ch.c]} lần`;
        TTS.speak(ch.c);
      }
    });
  };
}

/* Step 5: kiểm tra bài */
function stepTest(l, box) {
  const qs = buildTest(l);
  runQuiz(box, qs, {
    intro: `📝 ${qs.length} câu tổng hợp. Đúng ≥ 70% để hoàn thành bài.`,
    onDone: (sc, tot, wrong) => {
      const pct = Math.round(sc / tot * 100), pass = pct >= 70, p = lp(l.id);
      p.best = Math.max(p.best || 0, pct);
      const first = pass && !p.done;
      if (pass) { completeStep(l, 4, true); p.done = true; if (first) { addXP(20); confetti(); } }
      save();
      if (pass && first && packDone(packOf(l.stage))) { const n = nextPackInfo(); if (n && n.state === 'ready') setTimeout(() => toast(`🏆 Bạn đã hoàn thành <b>${esc(packById(packOf(l.stage)).name)}</b>! Về trang chủ để mở ${esc(n.p.name)}.`, 6000), 800); }
      const nx = LESSONS[l.idx + 1];
      resultScreen(box, { sc, tot, wrong, pass,
        title: pass ? (first ? 'Hoàn thành bài học! +20 XP' : 'Làm tốt lắm!') : 'Chưa đạt 70% — thử lại nhé',
        btns: `<button class="btn ghost" data-retry>Làm lại</button>${pass ? (nx ? `<a class="btn" href="#/lesson/${nx.id}">Bài tiếp: ${esc(nx.title)} →</a>` : `<a class="btn" href="#/">Về trang chủ</a>`) : `<a class="btn" href="#/lesson/${l.id}/0">Ôn lại từ vựng</a>`}`,
        retry: () => stepTest(l, box) });
    }
  });
}

/* ============ QUIZ ENGINE ============ */
const TONE_V = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', ü: 'ǖǘǚǜ' };
const MARK = {};
Object.entries(TONE_V).forEach(([b, s]) => [...s].forEach((c, t) => { MARK[c] = [b, t + 1]; }));
function toneVariants(py, n) {
  const chars = [...py], pos = chars.map((c, i) => MARK[c.toLowerCase()] ? i : -1).filter(i => i >= 0);
  const out = new Set(); let guard = 0;
  while (pos.length && out.size < n && guard++ < 80) {
    const arr = [...chars], k = 1 + (Math.random() * Math.min(2, pos.length) | 0);
    shuffle(pos).slice(0, k).forEach(i => {
      const c = arr[i], low = c.toLowerCase(), [b, t] = MARK[low]; let nt;
      do { nt = 1 + (Math.random() * 4 | 0); } while (nt === t);
      let r = TONE_V[b][nt - 1]; if (c !== low) r = r.toUpperCase(); arr[i] = r;
    });
    const s = arr.join(''); if (s !== py) out.add(s);
  }
  return [...out];
}
const canPy = it => [...it.py].some(c => MARK[c.toLowerCase()]);
function poolFor(l, kind) {
  const key = kind === 'p' ? 'P' : 'W';
  const same = shuffle(l[key]), stage = shuffle(l.stage.lessons.flatMap(x => x[key])), all = shuffle(kind === 'p' ? ALL_P : ALL_W);
  return [...same, ...stage, ...all];
}
function pickOpts(correct, pool, n, keyFn) {
  const seen = new Set([keyFn(correct)]), out = [correct];
  for (const it of pool) { const k = keyFn(it); if (!seen.has(k)) { seen.add(k); out.push(it); } if (out.length >= n) break; }
  return shuffle(out);
}
const listenPrompt = (it, label) => `<div class="qlabel">${label}</div><div class="listen-row"><button class="listen-big" data-say="${esc(it.say)}" aria-label="Nghe">${I.vol}</button><button class="listen-slow" data-say="${esc(it.say)}" data-slow="1" aria-label="Nghe chậm">🐢</button></div>`;
const QT = {
  hz2vi: (it, pool) => ({ item: it, prompt: `<div class="qlabel">Nghĩa là gì?</div><button class="qhz" data-say="${esc(it.say)}">${zh(it.hz)}</button>${pyH(it.py)}`,
    opts: pickOpts(it, pool, 4, x => x.vi).map(x => ({ html: esc(x.vi), ok: x === it })) }),
  vi2hz: (it, pool) => ({ item: it, prompt: `<div class="qlabel">Chọn chữ Hán đúng</div><div class="qvi">${esc(it.vi)}</div>`,
    opts: pickOpts(it, pool.filter(x => hasHan(x.hz)), 4, x => x.hz).map(x => ({ html: zh(x.hz), ok: x === it })), zhOpts: true }),
  lis2hz: (it, pool) => ({ item: it, auto: it.say, prompt: listenPrompt(it, 'Nghe và chọn chữ đúng'),
    opts: pickOpts(it, pool.filter(x => hasHan(x.hz)), 4, x => x.hz).map(x => ({ html: zh(x.hz), ok: x === it })), zhOpts: true }),
  lis2vi: (it, pool) => ({ item: it, auto: it.say, prompt: listenPrompt(it, 'Nghe và chọn nghĩa'),
    opts: pickOpts(it, pool, 4, x => x.vi).map(x => ({ html: esc(x.vi), ok: x === it })) }),
  lis2py: it => { const v = toneVariants(it.py, 3); return { item: it, auto: it.say, prompt: listenPrompt(it, 'Nghe và chọn pinyin đúng (chú ý thanh điệu)'),
    opts: shuffle([it.py, ...v]).map(s => ({ html: `<span class="py-opt">${esc(s)}</span>`, ok: s === it.py })) }; },
  hz2py: it => { const v = toneVariants(it.py, 3); return { item: it, prompt: `<div class="qlabel">Chọn cách đọc đúng</div><div class="qhz static">${zh(it.hz)}</div><div class="qvi small">${esc(it.vi)}</div>`,
    opts: shuffle([it.py, ...v]).map(s => ({ html: `<span class="py-opt">${esc(s)}</span>`, ok: s === it.py })), sayOnAnswer: true }; },
  ph2vi: (it, pool) => ({ item: it, prompt: `<div class="qlabel">Câu này nghĩa là gì?</div><button class="qph" data-say="${esc(it.say)}">${zh(it.hz)}</button>${pyH(it.py)}`,
    opts: pickOpts(it, pool, 4, x => x.vi).map(x => ({ html: esc(x.vi), ok: x === it })) }),
  rp: (r, l) => {
    const others = shuffle([...l.R, ...l.stage.lessons.flatMap(x => x.R)].map(x => x.ans).filter(a => a.hz !== r.ans.hz));
    const opts = pickOpts(r.ans, others, 3, x => x.hz);
    return { item: r.ans, auto: r.npc.hz,
      prompt: `<div class="qlabel">🎭 Bạn đáp thế nào?</div><div class="rp-npc"><button class="qph" data-say="${esc(r.npc.hz)}">🗣 ${zh(r.npc.hz)}</button>${pyH(r.npc.py)}<div class="qvi small">${esc(r.npc.vi)}</div></div>`,
      opts: opts.map(x => ({ html: `${zh(x.hz)}${pyH(x.py)}`, ok: x === r.ans })),
      extra: SR ? `<div class="card-pad rp-say"><span class="muted small">Giờ nói to câu đáp:</span> ${micBtn(r.ans.say)}<div class="mic-out"></div></div>` : '' };
  },
  dict: it => { const h = hanOnly(it.hz), toks = []; for (let k = 0; k < h.length; k += 2) toks.push(h.slice(k, k + 2).join(''));
    return { item: it, type: 'build', toks, auto: it.say, rate: 1, sayOnAnswer: true,
      prompt: `<div class="spiral">✍️ Nghe – chép · tốc độ thật</div>` + listenPrompt(it, 'Nghe rồi xếp lại đúng câu') + `<div class="qvi small muted">Gợi ý: ${esc(it.vi)}</div>` }; },
  build: it => { const toks = hanOnly(it.hz); return { item: it, type: 'build', toks, prompt: `<div class="qlabel">Sắp xếp thành câu đúng</div><div class="qvi">${esc(it.vi)}</div>` }; }
};
const buildable = p => { const n = hanOnly(p.hz).length; return n >= 3 && n <= 9 && hasHan(p.hz); };
function compose(plan) {
  // plan: [[type, items[], pool], ...] — chọn item khác nhau cho mỗi câu
  const used = new Set(), qs = [];
  plan.forEach(([type, items, pool, filter]) => {
    let cand = shuffle(items).filter(x => !used.has(x.hz) && (!filter || filter(x)));
    if (!cand.length) cand = shuffle(items).filter(x => !filter || filter(x));
    const it = cand[0]; if (!it) return;
    used.add(it.hz); qs.push(QT[type](it, pool));
  });
  return qs;
}
function buildListen(l) {
  const pw = poolFor(l, 'w'), pp = poolFor(l, 'p');
  if (l.kind === 'pinyin') return compose(Array(6).fill(0).map(() => ['lis2py', l.W, pw, canPy]));
  if (l.S.length >= 4) {  // 🎬 nghe thoại phim tốc độ thật
    const ps = [...shuffle(l.S), ...pp];
    const qs = compose([['lis2vi', l.S, ps], ['lis2vi', l.S, ps], ['lis2vi', l.S, ps], ['lis2hz', l.W, pw], ['lis2vi', l.W, pw]]).map(q => (q.item.t === 's' && (q.rate = 1.05), q));
    const d = shuffle(l.S.filter(x => hanOnly(x.hz).length >= 4 && hanOnly(x.hz).length <= 14));
    d.slice(0, 2).forEach(x => qs.push(QT.dict(x)));
    return qs;
  }
  return shuffle(compose([['lis2hz', l.W, pw], ['lis2hz', l.W, pw], ['lis2vi', l.W, pw], ['lis2vi', l.W, pw], ['lis2vi', l.P, pp], ['lis2vi', l.P, pp]]));
}
function buildTest(l) {
  const pw = poolFor(l, 'w'), pp = poolFor(l, 'p');
  const hasBuild = l.P.some(buildable);
  const plan = l.kind === 'pinyin'
    ? [['lis2py', l.W, pw, canPy], ['lis2py', l.W, pw, canPy], ['lis2py', l.W, pw, canPy], ['lis2py', l.W, pw, canPy], ['hz2vi', l.W, pw], ['hz2vi', l.W, pw], ['hz2vi', l.W, pw], ['hz2py', l.W, pw, canPy], ['hz2py', l.W, pw, canPy], ['ph2vi', l.P, pp]]
    : [['hz2vi', l.W, pw], ['hz2vi', l.W, pw], ['hz2vi', l.W, pw], ['vi2hz', l.W, pw, x => hasHan(x.hz)], ['vi2hz', l.W, pw, x => hasHan(x.hz)], ['lis2hz', l.W, pw, x => hasHan(x.hz)], ['hz2py', l.W, pw, canPy], ['ph2vi', l.P, pp], ['lis2vi', l.P, pp]];
  const qs = shuffle(compose(plan));
  const gb = l.G.filter(buildable);
  if (gb.length) { const q = QT.build(shuffle(gb)[0]); q.prompt = `<div class="spiral gram-tag">📐 ${esc(l.gram.t)}</div>` + q.prompt; qs.push(q); }
  if (hasBuild) qs.push(QT.build(shuffle(l.P.filter(buildable))[0]));
  else if (!gb.length) qs.push(...compose([['hz2vi', l.W, pw]]));
  shuffle(l.R).slice(0, 2).forEach(r => qs.push(QT.rp(r, l)));
  const dS = shuffle(l.S.filter(x => l.stage.pack >= 4 && hanOnly(x.hz).length >= 4 && hanOnly(x.hz).length <= 14));
  if (dS.length) qs.push(QT.dict(dS[0]));
  // 🔁 ôn xen kẽ: 2 câu từ các bài đã học trước đó (chống quên bài cũ)
  const old = shuffle(learnedItems().filter(it => it.lesson !== l && it.t === 'w'));
  old.slice(0, 2).forEach((it, k) => {
    const q = QT[k ? 'lis2vi' : 'hz2vi'](it, [...shuffle(ALL_W)]);
    q.prompt = `<div class="spiral">🔁 Ôn bài cũ · ${esc(it.lesson.title)}</div>` + q.prompt;
    qs.splice(2 + k * 4, 0, q);
  });
  return qs;
}
function runQuiz(box, qs, { intro, onDone }) {
  let i = 0, sc = 0; const wrong = [];
  const render = () => {
    if (i >= qs.length) return onDone(sc, qs.length, wrong);
    const q = qs[i];
    box.innerHTML = `<div class="quiz">
      ${i === 0 && intro ? `<div class="hint">${intro}</div>` : ''}
      <div class="qtop"><div class="qbar"><i style="width:${i / qs.length * 100}%"></i></div><span class="qcount">${i + 1}/${qs.length}</span></div>
      <div class="qprompt">${q.prompt}</div>
      ${q.type === 'build' ? `<div class="build"><div class="b-ans" id="bAns"></div><div class="b-bank" id="bBank">${shuffle(q.toks.map((t, k) => [t, k])).map(([t, k]) => `<button class="tok" data-k="${k}">${zh(t)}</button>`).join('')}</div><button class="btn big" id="bCheck" disabled>Kiểm tra</button></div>`
        : `<div class="qopts ${q.zhOpts ? 'zh-opts' : ''}">${q.opts.map((o, k) => `<button class="opt" data-k="${k}">${o.html}</button>`).join('')}</div>`}
      <div class="qfb" id="qfb" hidden></div>
    </div>`;
    if (q.auto) TTS.speak(q.auto, { rate: q.rate });
    if (q.type === 'build') return bindBuild(q);
    $$('.opt', box).forEach(b => b.onclick = () => answer(+b.dataset.k));
  };
  const feedback = ok => {
    const q = qs[i], fb = $('#qfb', box);
    if (ok) { sc++; addXP(2); } else { wrong.push(q); const c = S.srs[q.item.hz]; if (c) { c.due = dayNum(); c.w = (c.w || 0) + 1; save(); } }
    fb.hidden = false; fb.className = 'qfb ' + (ok ? 'ok' : 'bad');
    fb.innerHTML = `<div class="fb-title">${ok ? '✅ Chính xác!' : '❌ Chưa đúng'}</div>${explain(q.item)}${q.item.note ? `<div class="muted small">💬 ${esc(q.item.note)}</div>` : ''}${ok ? '' : memoHtml(q.item.hz, 2)}${q.extra || ''}<button class="btn big" id="qNext">${i === qs.length - 1 ? 'Xem kết quả' : 'Tiếp →'}</button>`;
    $('#qNext', box).onclick = () => { i++; render(); };
    if (!q.auto || q.sayOnAnswer || !ok) TTS.speak(q.item.say);
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  const answer = k => {
    const q = qs[i], btns = $$('.opt', box);
    btns.forEach((b, j) => { b.disabled = true; if (q.opts[j].ok) b.classList.add('ok'); });
    if (!q.opts[k].ok) btns[k].classList.add('bad');
    feedback(q.opts[k].ok);
  };
  const bindBuild = q => {
    const ans = $('#bAns', box), bank = $('#bBank', box), chk = $('#bCheck', box); const picked = [];
    const sync = () => {
      ans.innerHTML = picked.map((k, idx) => `<button class="tok in" data-idx="${idx}">${zh(q.toks[k])}</button>`).join('') || '<span class="muted">Chạm vào chữ bên dưới…</span>';
      $$('.tok', bank).forEach(b => b.classList.toggle('used', picked.includes(+b.dataset.k)));
      chk.disabled = picked.length !== q.toks.length;
      $$('.tok.in', ans).forEach(b => b.onclick = () => { picked.splice(+b.dataset.idx, 1); sync(); });
    };
    $$('.tok', bank).forEach(b => b.onclick = () => { const k = +b.dataset.k; if (!picked.includes(k)) { picked.push(k); sync(); } });
    chk.onclick = () => {
      const ok = picked.map(k => q.toks[k]).join('') === q.toks.join('');
      chk.disabled = true; $$('.tok', box).forEach(b => b.disabled = true);
      ans.classList.add(ok ? 'ok' : 'bad'); feedback(ok);
    };
    sync();
  };
  render();
}
function resultScreen(box, { sc, tot, wrong, pass, title, btns, retry }) {
  const pct = Math.round(sc / tot * 100);
  box.innerHTML = `<div class="result ${pass ? 'pass' : 'fail'}">
    <div class="res-ring" style="--p:${pct}"><b>${pct}%</b></div>
    <h3>${esc(title)}</h3>
    <p class="muted">${sc}/${tot} câu đúng</p>
    ${wrong.length ? `<div class="wrong-list"><h4>Xem lại các câu sai</h4>${wrong.map(q => explain(q.item)).join('')}</div>` : ''}
    <div class="res-btns">${btns}</div>
  </div>`;
  const r = $('[data-retry]', box); if (r) r.onclick = retry;
}

/* ============ STAGE TEST ============ */
function stageTestView(sid) {
  const st = COURSE.find(s => s.id === sid); if (!st) return go('#/');
  document.body.classList.add('in-lesson');
  const W = st.lessons.flatMap(l => l.W), P = st.lessons.flatMap(l => l.P);
  const pw = [...shuffle(W), ...shuffle(ALL_W)], pp = [...shuffle(P), ...shuffle(ALL_P)];
  const run = () => {
    const isPy = st.lessons.every(l => l.kind === 'pinyin');
    const plan = [
      ...Array(4).fill(['hz2vi', W, pw]), ...Array(3).fill(['vi2hz', W, pw, x => hasHan(x.hz)]),
      ...Array(3).fill(isPy ? ['lis2py', W, pw, canPy] : ['lis2hz', W, pw, x => hasHan(x.hz)]),
      ...Array(2).fill(['hz2py', W, pw, canPy]), ...Array(2).fill(['ph2vi', P, pp])];
    const qs = shuffle(compose(plan));
    const b = P.filter(buildable); if (b.length) qs.push(QT.build(shuffle(b)[0]));
    runQuiz($('#stepBody'), qs, {
      intro: `📝 Kiểm tra chặng <b>${esc(st.name)}</b> — ${qs.length} câu.`,
      onDone: (sc, tot, wrong) => {
        const pct = Math.round(sc / tot * 100), pass = pct >= 70;
        S.stageTests[st.id] = Math.max(S.stageTests[st.id] || 0, pct); save();
        if (pass) { addXP(30); confetti(); }
        const canSkip = pct >= 80 && !stageDone(st.id);
        resultScreen($('#stepBody'), { sc, tot, wrong, pass, title: pass ? 'Vượt qua kiểm tra chặng! +30 XP' : 'Chưa đạt — ôn lại thêm nhé',
          btns: `${canSkip ? `<button class="btn" id="skipStage">✅ Mình biết chặng này rồi — đánh dấu xong</button>` : ''}<button class="btn ghost" data-retry>Làm lại</button><a class="btn ${canSkip ? 'ghost' : ''}" href="#/">Về trang chủ</a>`, retry: run });
        const sk = $('#skipStage'); if (sk) sk.onclick = () => {
          st.lessons.forEach(l => { const p = lp(l.id); p.s = [1, 1, 1, 1, 1]; p.done = true; p.best = Math.max(p.best || 0, pct); srsAdd(l.W); srsAdd(l.P); });
          save(); toast(`✅ Đã đánh dấu xong chặng <b>${esc(st.short || st.name)}</b>. Từ vựng vẫn được đưa vào ôn tập để bạn không quên.`, 4500); go('#/');
        };
      }
    });
  };
  view().innerHTML = `<div class="lesson c-${st.color}"><div class="lesson-top"><a class="back" href="#/">${I.back}</a><div class="lt-title"><small>Kiểm tra chặng</small><h2>${esc(st.name)} ${zh(st.zh)}</h2></div></div><div id="stepBody" class="step-body"></div></div>`;
  run();
}

/* ============ REVIEW (SRS) ============ */
let reviewMode = 'see';
function reviewView() {
  const due = dueItems(), learned = learnedItems();
  const modes = [['see', 'Nhìn chữ'], ['listen', 'Nghe'], ['vi', 'Việt → Trung']];
  view().innerHTML = `<div class="page">
    <div class="page-head"><a class="back" href="#/">${I.back}</a><h1>Ôn tập</h1></div>
    <div class="chips">${modes.map(([k, n]) => `<button class="chip ${reviewMode === k ? 'on' : ''}" data-m="${k}">${n}</button>`).join('')}</div>
    ${leechItems().length ? `<button class="leech card-pad" id="leech"><b>🧩 Từ hay quên (${leechItems().length})</b><span class="muted">Những từ bạn sai từ 2 lần trở lên — ôn riêng cho chắc.</span></button>` : ''}
    <div id="rvBody"></div></div>`;
  $$('.chip[data-m]').forEach(c => c.onclick = () => { reviewMode = c.dataset.m; reviewView(); });
  const body = $('#rvBody');
  const lb = $('#leech'); if (lb) lb.onclick = () => { lb.remove(); runCards(body, leechItems().slice(0, 15), true); };
  if (!learned.length) {
    body.innerHTML = `<div class="empty">${MASCOT}<h3>Chưa có thẻ nào</h3><p class="muted">Học bước <b>Từ vựng</b> và <b>Nói thật</b> của một bài, từ và câu sẽ vào đây để ôn theo lịch lặp lại ngắt quãng.</p><a class="btn" href="#/lesson/${currentLesson().id}">Học bài đầu tiên →</a></div>`;
    return;
  }
  if (!due.length) {
    const nd = nextDueInfo();
    body.innerHTML = `<div class="empty">${MASCOT}<h3>Hết thẻ đến hạn hôm nay 🎉</h3><p class="muted">Bạn đang có ${learned.length} thẻ.${nd ? ` ${nd.days === 1 ? 'Ngày mai' : `${nd.days} ngày nữa`} sẽ có ${nd.n} thẻ.` : ''}</p><button class="btn" id="extra">Ôn thêm 10 thẻ ngẫu nhiên</button></div>`;
    $('#extra').onclick = () => runCards(body, shuffle(learned).slice(0, 10), true);
    return;
  }
  body.innerHTML = `<p class="muted">${due.length} thẻ đến hạn · mỗi lượt tối đa 20 thẻ.</p>`;
  runCards(body, shuffle(due).slice(0, 20), false);
}
const leechItems = () => Object.entries(S.srs).filter(([k, v]) => (v.w || 0) >= 2 && ITEM.has(k)).sort((a, b) => b[1].w - a[1].w).map(([k]) => ITEM.get(k));
function runCards(box, items, practice, onFinish) {
  const q = [...items], total = items.length; let done = 0;
  const show = () => {
    if (!q.length) {
      addXP(5);
      if (onFinish) return onFinish(total);
      box.innerHTML = `<div class="empty">${MASCOT}<h3>Xong lượt ôn! +5 XP</h3><p class="muted">${total} thẻ đã ôn. Quay lại ngày mai nhé.</p><a class="btn" href="#/">Về trang chủ</a> <button class="btn ghost" id="more">Ôn tiếp</button></div>`;
      $('#more').onclick = () => reviewView(); confetti(); return;
    }
    const it = q[0];
    const front = reviewMode === 'see' ? `<button class="rc-hz" data-say="${esc(it.say)}">${zh(it.hz)}</button>`
      : reviewMode === 'listen' ? `<div class="listen-row"><button class="listen-big" data-say="${esc(it.say)}">${I.vol}</button><button class="listen-slow" data-say="${esc(it.say)}" data-slow="1">🐢</button></div><p class="muted">Nghe và nhớ nghĩa</p>`
      : `<div class="rc-vi">${esc(it.vi)}</div><p class="muted">Nói ra tiếng Trung rồi lật thẻ</p>`;
    box.innerHTML = `<div class="rc">
      <div class="qtop"><div class="qbar"><i style="width:${done / total * 100}%"></i></div><span class="qcount">${done}/${total}</span></div>
      <div class="rc-card c-${it.lesson.stage.color}">${front}
        <div class="rc-back" hidden>${reviewMode !== 'see' ? `<button class="rc-hz sm" data-say="${esc(it.say)}">${zh(it.hz)}</button>` : ''}${pyH(it.py)}${hvH(it.hv)}<div class="rc-vi2">${esc(it.vi)}</div>${it.note ? `<div class="muted small">💬 ${esc(it.note)}</div>` : ''}${memoHtml(it.hz, 2)}</div>
      </div>
      <div class="rc-btns" id="rcBtns"><button class="btn big" id="reveal">Lật thẻ</button></div>
    </div>`;
    if (reviewMode === 'listen') TTS.speak(it.say);
    $('#reveal').onclick = () => {
      $('.rc-back', box).hidden = false; TTS.speak(it.say);
      const c = S.srs[it.hz] || { b: 0 };
      const good = IVL[Math.min(c.b + 1, IVL.length - 1)], hard = Math.max(1, Math.ceil(IVL[Math.max(c.b, 1)] / 2));
      $('#rcBtns').innerHTML = `<button class="gbtn g0" data-g="0">Quên<small>lại ngay</small></button><button class="gbtn g1" data-g="1">Khó<small>${hard} ngày</small></button><button class="gbtn g2" data-g="2">Nhớ<small>${good} ngày</small></button>`;
      $$('.gbtn', box).forEach(b => b.onclick = () => {
        const g = +b.dataset.g;
        if (!(practice && g === 2 && S.srs[it.hz]?.due > dayNum())) srsGrade(it.hz, g);
        addXP(1); q.shift();
        if (g === 0) q.splice(Math.min(q.length, 3), 0, it); else done++;
        show();
      });
    };
  };
  show();
}

/* ============ KIỂM TRA GÓI (vượt gói) ============ */
function packTestView(id) {
  const pk = packById(id), ls = packLessons(id);
  if (!pk || !ls.length) return go('#/');
  document.body.classList.add('in-lesson');
  const W = ls.flatMap(l => l.W), P = ls.flatMap(l => l.P);
  const pw = [...shuffle(W), ...shuffle(ALL_W)], pp = [...shuffle(P), ...shuffle(ALL_P)];
  const run = () => {
    const plan = [...Array(6).fill(['hz2vi', W, pw]), ...Array(4).fill(['vi2hz', W, pw, x => hasHan(x.hz)]),
      ...Array(4).fill(['lis2hz', W, pw, x => hasHan(x.hz)]), ...Array(3).fill(['hz2py', W, pw, canPy]), ...Array(3).fill(['ph2vi', P, pp])];
    const qs = shuffle(compose(plan));
    runQuiz($('#stepBody'), qs, {
      intro: `📝 Kiểm tra <b>${esc(pk.name)}</b> — ${qs.length} câu lấy ngẫu nhiên từ cả gói. Đạt ≥ 80% là mở được gói tiếp theo.`,
      onDone: (sc, tot, wrong) => {
        const pct = Math.round(sc / tot * 100), pass = pct >= 80;
        S.stageTests['pack' + id] = Math.max(S.stageTests['pack' + id] || 0, pct); save();
        const nx = packById(+id + 1), canOpen = pass && nx && nx.ready && !packLoaded(nx.id);
        if (pass) { addXP(40); confetti(); }
        resultScreen($('#stepBody'), { sc, tot, wrong, pass,
          title: pass ? (canOpen ? `Xuất sắc! Bạn có thể mở ${nx.name}` : 'Vượt qua kiểm tra gói! +40 XP') : 'Chưa đạt 80% — học tiếp gói này nhé',
          btns: `${canOpen ? `<button class="btn" data-unlock="${nx.id}">Mở ${esc(nx.name)} →</button>` : ''}<button class="btn ghost" data-retry>Làm lại</button><a class="btn ghost" href="#/">Về trang chủ</a>`, retry: run });
      }
    });
  };
  view().innerHTML = `<div class="lesson c-blue"><div class="lesson-top"><a class="back" href="#/">${I.back}</a><div class="lt-title"><small>Kiểm tra gói</small><h2>${esc(pk.name)} · ${esc(pk.title || '')}</h2></div></div><div id="stepBody" class="step-body"></div></div>`;
  run();
}

/* ============ BUỔI HỌC HÔM NAY: ôn bài cũ trước → bài mới ============ */
function sessionView() {
  const cur = currentLesson(), due = shuffle(dueItems()).slice(0, 12);
  if (!due.length) { toast('Không có thẻ cần ôn — vào thẳng bài mới nhé! 📖'); return go(`#/lesson/${cur.id}`); }
  document.body.classList.add('in-lesson');
  view().innerHTML = `<div class="lesson c-${cur.stage.color}">
    <div class="lesson-top"><a class="back" href="#/">${I.back}</a><div class="lt-title"><small>Buổi học hôm nay · bước 1/2</small><h2>Ôn bài cũ trước 🔁</h2></div></div>
    <div class="hint">Não người hay quên sau 1–2 ngày — ôn đúng lúc sắp quên giúp nhớ lâu gấp nhiều lần. Lật thẻ và tự chấm thật lòng nhé!</div>
    <div id="sessBody"></div></div>`;
  runCards($('#sessBody'), due, false, n => {
    confetti();
    const allDone = lp(cur.id).done;
    $('#sessBody').innerHTML = allDone ? `<div class="empty">${MASCOT}<h3>Ôn xong ${n} thẻ! 🎉</h3><a class="btn big" href="#/">Về trang chủ</a></div>`
      : `<div class="empty">${MASCOT}<h3>Ôn xong ${n} thẻ! 🎉</h3><p class="muted">Bước 2: học bài mới <b>${esc(cur.title)}</b> ${zh(cur.zh)}</p><a class="btn big" href="#/lesson/${cur.id}">Học bài mới →</a></div>`;
  });
}

/* ============ PINYIN ============ */
function pinyinView() {
  const P = window.PINYIN;
  const tones = [['ā', 'Thanh 1', 'Ngang cao', 'M4 8H36', '妈', 'mā'], ['á', 'Thanh 2', 'Đi lên ~ dấu sắc', 'M4 24L36 6', '麻', 'má'], ['ǎ', 'Thanh 3', 'Xuống rồi lên ~ dấu hỏi', 'M4 16Q16 38 36 8', '马', 'mǎ'], ['à', 'Thanh 4', 'Rơi mạnh, dứt khoát', 'M4 6L36 32', '骂', 'mà']];
  view().innerHTML = `<div class="page">
    <div class="page-head"><a class="back" href="#/">${I.back}</a><h1>Pinyin & thanh điệu</h1></div>
    <div class="tone-grid">${tones.map(t => `<button class="tone-card" data-say="${t[4]}"><svg viewBox="0 0 40 40"><path d="${t[3]}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg><b class="py-big">${t[0]}</b><span>${t[1]}</span><small>${t[2]}</small><span class="tone-eg">${zh(t[4])} ${t[5]}</span></button>`).join('')}</div>
    <div class="card-pad drill-cta"><div><b>🎧 Luyện tai thanh điệu</b><p class="muted">10 câu: nghe 1 chữ, đoán thanh. Cao nhất: ${S.tone.best}/10</p></div><button class="btn" id="toneDrill">Bắt đầu</button></div>
    <div id="drill"></div>
    <h2 class="sec">Cặp thanh để luyện miệng</h2>
    <div class="toneset">${P.toneSets.map(([c, p]) => { const cs = [...c], ps = p.split(' '); return `<div class="ts-row">${cs.map((x, i) => `<button class="ts" data-say="${x}">${zh(x)}<small>${ps[i]}</small></button>`).join('')}</div>`; }).join('')}</div>
    <h2 class="sec">Thanh mẫu (phụ âm đầu)</h2>
    <div class="py-table">${P.initials.map(([a, c, p, h]) => `<button class="py-cell" data-say="${c}"><b>${a}</b><span>${zh(c)} <i>${p}</i></span><small>${h}</small></button>`).join('')}</div>
    <h2 class="sec">Vận mẫu (vần)</h2>
    <div class="py-table">${P.finals.map(([a, c, p, h]) => `<button class="py-cell" data-say="${c}"><b>${a}</b><span>${zh(c)} <i>${p}</i></span><small>${h}</small></button>`).join('')}</div>
    <div class="card-pad"><h3>Quy tắc biến điệu</h3><ul class="rules"><li><b>3+3 → 2+3</b>: 你好 đọc <i>ní hǎo</i></li><li><b>不</b> trước thanh 4 → <i>bú</i>: 不是 bú shì</li><li><b>一</b> trước thanh 4 → <i>yí</i>, trước thanh 1/2/3 → <i>yì</i></li><li>Viết <b>yu / ju / qu / xu</b> thật ra là <b>ü</b> (鱼 yú = "uý")</li></ul></div>
  </div>`;
  $('#toneDrill').onclick = () => {
    const items = Array(10).fill(0).map(() => { const [c, p] = P.toneSets[Math.random() * P.toneSets.length | 0]; const k = Math.random() * 4 | 0; return { set: [...c], pys: p.split(' '), k }; });
    const qs = items.map(o => {
      const it = { hz: o.set[o.k], py: o.pys[o.k], vi: `thanh ${o.k + 1}`, say: o.set[o.k], lesson: LESSONS[0] };
      return { item: it, auto: it.say, prompt: listenPrompt(it, 'Nghe và chọn thanh đúng'), opts: o.pys.map((p, j) => ({ html: `<span class="py-opt">${p}</span><small class="muted"> · thanh ${j + 1}</small>`, ok: j === o.k })) };
    });
    const box = $('#drill'); box.scrollIntoView({ behavior: 'smooth' });
    runQuiz(box, qs, { onDone: (sc, tot, wrong) => {
      S.tone.best = Math.max(S.tone.best, sc); S.tone.plays++; save();
      resultScreen(box, { sc, tot, wrong, pass: sc >= 7, title: sc >= 9 ? 'Tai cực thính! 👂' : sc >= 7 ? 'Tốt lắm!' : 'Luyện thêm vài lượt nhé',
        btns: `<button class="btn" data-retry>Lượt mới</button>`, retry: () => $('#toneDrill').click() });
    } });
  };
}

/* ============ WRITE ============ */
function writeView() {
  const learnedSet = new Set(LESSONS.filter(l => lp(l.id).s.some(Boolean)).flatMap(l => l.C.map(c => c.c)));
  view().innerHTML = `<div class="page">
    <div class="page-head"><a class="back" href="#/">${I.back}</a><h1>Tập viết chữ Hán</h1></div>
    <div class="write-input card-pad"><input id="anyChar" maxlength="1" placeholder="Nhập 1 chữ bất kỳ, vd: 爱" lang="zh-CN" autocomplete="off"><button class="btn" id="anyGo">Viết</button></div>
    <div id="wArea"></div>
    <h2 class="sec">Chữ trong giáo trình <small class="muted">(chấm xanh = bài đã học)</small></h2>
    <div class="char-grid">${ALL_CHARS.map((c, i) => `<button class="cg ${learnedSet.has(c.c) ? 'learned' : ''} ${S.written[c.c] ? 'written' : ''}" data-ci="${i}">${zh(c.c)}<small>${esc(c.py)}</small></button>`).join('')}</div>
  </div>`;
  const area = $('#wArea');
  const open = ch => { renderWriter(area, ch); area.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  $$('.cg').forEach(b => b.onclick = () => open(ALL_CHARS[+b.dataset.ci]));
  $('#anyGo').onclick = () => {
    const c = hanOnly($('#anyChar').value)[0]; if (!c) return toast('Nhập một chữ Hán nhé');
    const known = ALL_CHARS.find(x => x.c === c) || { c, py: '', vi: '' }; open(known);
  };
  $('#anyChar').addEventListener('keydown', e => { if (e.key === 'Enter') $('#anyGo').click(); });
  const firstL = ALL_CHARS.find(c => learnedSet.has(c.c)) || ALL_CHARS[0];
  renderWriter(area, firstL);
}

/* ============ PHRASES ============ */
let phFilter = 'all';
function phrasesView() {
  const chips = [['all', 'Tất cả'], ...COURSE.map(s => [s.id, s.name.split('·').pop().trim()])];
  const list = phFilter === 'all' ? ALL_P : ALL_P.filter(p => p.lesson.stage.id === phFilter);
  view().innerHTML = `<div class="page">
    <div class="page-head"><a class="back" href="#/">${I.back}</a><h1>Sổ tay câu nói thật</h1></div>
    <p class="muted lead">${ALL_P.length} câu người Trung nói thật ngoài đời & trong phim. Chạm để nghe, 🐢 nghe chậm${SR ? ', 🎤 thử nói' : ''}.</p>
    <div class="chips scroll">${chips.map(([k, n]) => `<button class="chip ${phFilter === k ? 'on' : ''}" data-f="${k}">${esc(n)}</button>`).join('')}</div>
    <button class="btn ghost rand" id="rand">${I.shuffle} Câu ngẫu nhiên</button>
    <div id="randBox"></div>
    <div class="phrases">${list.map(p => phraseCard(p, true)).join('')}</div>
  </div>`;
  $$('.chip[data-f]').forEach(c => c.onclick = () => { phFilter = c.dataset.f; phrasesView(); });
  $('#rand').onclick = () => { const p = list[Math.random() * list.length | 0]; $('#randBox').innerHTML = phraseCard(p, true); TTS.speak(p.say); };
}

/* ============ SEARCH ============ */
function searchView() {
  view().innerHTML = `<div class="page">
    <div class="page-head"><a class="back" href="#/">${I.back}</a><h1>Tìm kiếm</h1></div>
    <div class="search-box">${I.search}<input id="q" type="search" placeholder="Chữ Hán, pinyin (không dấu cũng được) hoặc tiếng Việt…" autocomplete="off"></div>
    <div id="res" class="results"></div></div>`;
  const inp = $('#q'), res = $('#res');
  const idx = [...ALL_W, ...ALL_P, ...LESSONS.flatMap(l => l.G)].map(it => ({ it, k: [it.hz, norm(it.py), norm(it.vi), norm(it.hv || '')] }));
  const run = () => {
    const raw = inp.value.trim(); if (!raw) { res.innerHTML = `<p class="muted">Ví dụ: <b>谢谢</b>, <b>xiexie</b>, <b>cảm ơn</b>, <b>tam</b> (Hán Việt)…</p>`; return; }
    const n = norm(raw);
    const ls = LESSONS.filter(l => norm(l.title).includes(n) || l.zh.includes(raw) || norm(l.desc).includes(n));
    const hits = idx.filter(({ k }) => k[0].includes(raw) || (n && (k[1].includes(n) || k[2].includes(n) || k[3].includes(n)))).slice(0, 60);
    res.innerHTML = (ls.length ? `<h3 class="sec">Bài học</h3>${ls.map(l => `<a class="sb-row" href="#/lesson/${l.id}"><span class="sb-ic">${isUnlocked(l) ? I.play : I.lock}</span><span class="sb-t"><b>${esc(l.title)}</b> ${zh(l.zh)}<small>${esc(l.stage.name)}</small></span></a>`).join('')}` : '')
      + (hits.length ? `<h3 class="sec">Từ & câu (${hits.length})</h3>${hits.map(({ it }) => `<div class="res-item">${wordRow(it)}<a class="res-l" href="#/lesson/${it.lesson.id}/${it.t === 'p' ? 1 : 0}">${esc(it.lesson.title)} →</a></div>`).join('')}` : (ls.length ? '' : '<p class="muted">Không tìm thấy. Thử từ khác nhé.</p>'));
  };
  inp.addEventListener('input', run); run();
  setTimeout(() => inp.focus(), 50);
}

/* ============ SETTINGS ============ */
function settingsView() {
  const s = S.settings, vs = TTS.rank(TTS.voices);
  const totalW = Object.keys(S.srs).length, doneL = LESSONS.filter(l => lp(l.id).done).length;
  const totalMin = Math.round(Object.values(S.secDay).reduce((a, b) => a + b, 0) / 60);
  view().innerHTML = `<div class="page settings">
    <div class="page-head"><a class="back" href="#/">${I.back}</a><h1>Giọng đọc & cài đặt</h1></div>
    <div class="stat-strip"><div><b>${doneL}/${LESSONS.length}</b><span>bài xong</span></div><div><b>${totalW}</b><span>thẻ đã học</span></div><div><b>${totalMin}</b><span>phút đã học</span></div><div><b>${S.xp}</b><span>XP</span></div></div>

    <section class="card-pad"><h3>🔊 Phát âm</h3>
      ${TTS.ok ? (vs.length ? `<label class="field">Giọng đọc<select id="voiceSel">${vs.map(v => `<option value="${esc(v.name)}" ${TTS.v && TTS.v.name === v.name ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select></label>`
        : `<div class="warn">Chưa thấy giọng tiếng Trung trên máy. App vẫn thử đọc bằng giọng mặc định, nhưng nên cài thêm:<ul><li><b>iPhone/iPad:</b> Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → <b>Tiếng Trung (Trung Quốc đại lục)</b> → tải giọng (vd: Tingting / Lilian).</li><li><b>Android:</b> Cài đặt → Quản lý chung → Ngôn ngữ → Chuyển văn bản thành giọng nói → Google → cài <b>Tiếng Trung (Quan thoại)</b>.</li><li><b>Máy tính:</b> dùng Chrome hoặc Edge (có sẵn giọng Trung online).</li></ul></div>`)
        : '<div class="warn">Trình duyệt không hỗ trợ đọc văn bản.</div>'}
      <label class="field">Nguồn âm thanh<select id="audioMode">
        <option value="auto" ${(s.audio || 'auto') === 'auto' ? 'selected' : ''}>Tự động (giọng máy, lỗi thì dùng online)</option>
        <option value="device" ${s.audio === 'device' ? 'selected' : ''}>Chỉ giọng đọc của máy (không cần mạng)</option>
        <option value="online" ${s.audio === 'online' ? 'selected' : ''}>Online (cần mạng, nghe ổn định nhất)</option></select></label>
      <button class="btn ghost" id="diag">🔧 Chẩn đoán âm thanh</button><pre id="diagOut" class="diag" hidden></pre>
      <p class="muted small">🔇 Không nghe gì? iPhone: tắt nút gạt im lặng ở cạnh máy và tăng âm lượng. Hoặc chọn "Online" ở trên.</p>
      <label class="field">Tốc độ đọc: <b id="rateV">${s.rate.toFixed(2)}×</b><input type="range" id="rate" min="0.5" max="1.2" step="0.05" value="${s.rate}"></label>
      <button class="btn ghost" data-say="你好！我是小步。今天也要加油哦！">${I.vol} Nghe thử</button>
    </section>

    <section class="card-pad"><h3>👀 Hiển thị</h3>
      <label class="toggle"><input type="checkbox" id="tPy" ${s.pinyin ? 'checked' : ''}><span></span>Hiện pinyin <small class="muted">(tắt để luyện đọc chữ — chạm vào chỗ mờ để xem)</small></label>
      <label class="toggle"><input type="checkbox" id="tHv" ${s.hv ? 'checked' : ''}><span></span>Hiện âm Hán Việt <small class="muted">(giúp nhớ nghĩa nhanh)</small></label>
      <label class="field">Cỡ chữ Hán: <b id="zsV">${Math.round(s.zhScale * 100)}%</b><input type="range" id="zs" min="0.8" max="1.4" step="0.05" value="${s.zhScale}"></label>
      <div class="font-demo">${zh('我想你了 · 小心地滑 · 恭喜发财')}</div>
    </section>

    <section class="card-pad"><h3>🎯 Học tập</h3>
      <label class="field">Mục tiêu mỗi ngày<select id="goal">${[10, 15, 20, 30].map(g => `<option value="${g}" ${s.goal === g ? 'selected' : ''}>${g} phút</option>`).join('')}</select></label>
      <label class="toggle"><input type="checkbox" id="tUn" ${s.unlockAll ? 'checked' : ''}><span></span>Mở khóa tất cả bài <small class="muted">(nếu bạn đã biết pinyin, muốn nhảy cóc)</small></label>
    </section>

    <section class="card-pad" id="remind"><h3>⏰ Nhắc học mỗi ngày</h3>
      <p class="muted small">Người hay quên thì để lịch nhắc giúp 😉 Chọn giờ rảnh, thêm vào lịch điện thoại — mỗi ngày sẽ có thông báo.</p>
      <label class="field">Giờ học<input type="time" id="rTime" value="${esc(s.remindAt || '20:30')}"></label>
      <div class="btn-row"><button class="btn" id="rIcs">📅 Thêm vào lịch (iPhone / máy tính)</button><a class="btn ghost" id="rGcal" target="_blank" rel="noopener">Google Calendar (Android)</a></div>
    </section>

    <section class="card-pad"><h3>💾 Sao lưu tiến độ</h3>
      <p class="muted small">Tiến độ được lưu tự động trên trình duyệt của máy này. Để chuyển sang máy khác (hoặc phòng khi xóa dữ liệu trình duyệt), hãy sao lưu.</p>
      <div class="btn-row"><button class="btn" id="exp">${I.download} Tải file sao lưu</button><label class="btn ghost file">${I.upload} Nhập file<input type="file" id="imp" accept="application/json,.json" hidden></label></div>
      <div class="btn-row"><button class="btn ghost" id="copyCode">Copy mã sao lưu</button><button class="btn ghost" id="pasteCode">Dán mã sao lưu</button></div>
      <textarea id="codeBox" rows="3" placeholder="Dán mã sao lưu vào đây rồi bấm 'Dán mã sao lưu'…" hidden></textarea>
    </section>

    <section class="card-pad danger"><h3>⚠️ Làm lại từ đầu</h3><button class="btn red" id="reset">Xóa toàn bộ tiến độ</button></section>
    <p class="muted small center">Xiǎobù 小步 · Nét chữ: Hanzi Writer · Phát âm: giọng đọc của thiết bị</p>
  </div>`;
  const sel = $('#voiceSel'); if (sel) sel.onchange = () => { s.voice = sel.value; TTS.pick(); save(); TTS.speak('你好'); };
  $('#diag').onclick = async () => {
    const out = $('#diagOut'); out.hidden = false; const log = m => { out.textContent += m + '\n'; };
    out.textContent = '';
    log('Trình duyệt: ' + navigator.userAgent.replace(/.*\) /, '').slice(0, 60));
    log('Hỗ trợ giọng đọc: ' + (TTS.ok ? 'có' : 'KHÔNG'));
    if (TTS.ok) {
      const all = speechSynthesis.getVoices(), zhv = all.filter(v => /^(zh|cmn)/i.test(v.lang.replace('_', '-')));
      log('Số giọng trên máy: ' + all.length + ' · giọng Trung: ' + zhv.length + (zhv.length ? ' (' + zhv.slice(0, 3).map(v => v.name).join(', ') + ')' : ''));
      log('Thử giọng máy…');
      await new Promise(res => {
        const u = TTS.utter('你好'); let t0 = 0; speechSynthesis.cancel();
        u.onstart = () => { t0 = Date.now(); log(' → bắt đầu đọc'); };
        u.onend = () => { log(' → xong sau ' + (t0 ? Date.now() - t0 : '?') + ' ms' + (t0 && Date.now() - t0 < 250 ? ' (QUÁ NHANH = không có tiếng)' : '')); res(); };
        u.onerror = e => { log(' → LỖI: ' + e.error); res(); };
        speechSynthesis.speak(u); setTimeout(() => { if (!t0) log(' → không phản hồi sau 3 giây'); res(); }, 3000);
      });
    }
    log('Thử âm thanh online…');
    const ok = await TTS.online('你好');
    log(ok ? ' → phát được ✅ (nếu vẫn không nghe: tăng âm lượng media)' : ' → KHÔNG phát được ❌ (kiểm tra mạng)');
    log('Chụp màn hình phần này gửi cho người hỗ trợ nếu vẫn lỗi.');
  };
  $('#audioMode').onchange = e => { s.audio = e.target.value; save(); TTS.speak('你好'); };
  $('#rate').oninput = e => { s.rate = +e.target.value; $('#rateV').textContent = s.rate.toFixed(2) + '×'; save(); };
  $('#tPy').onchange = e => { s.pinyin = e.target.checked; save(); applySettings(); };
  $('#tHv').onchange = e => { s.hv = e.target.checked; save(); applySettings(); };
  $('#zs').oninput = e => { s.zhScale = +e.target.value; $('#zsV').textContent = Math.round(s.zhScale * 100) + '%'; save(); applySettings(); };
  $('#goal').onchange = e => { s.goal = +e.target.value; save(); updHUD(); };
  $('#tUn').onchange = e => { s.unlockAll = e.target.checked; save(); };
  const appUrl = location.href.split('#')[0];
  const remindParts = () => {
    const [hh, mm] = ($('#rTime').value || '20:30').split(':').map(Number), d = new Date();
    d.setHours(hh, mm, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1);
    const f = x => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`;
    const e = new Date(d.getTime() + s.goal * 60000);
    return { start: f(d), end: f(e) };
  };
  const updGcal = () => {
    const { start, end } = remindParts();
    $('#rGcal').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('📚 Học tiếng Trung ' + s.goal + ' phút (小步)')
      + '&dates=' + start + '/' + end + '&recur=' + encodeURIComponent('RRULE:FREQ=DAILY') + '&details=' + encodeURIComponent('Mở app: ' + appUrl);
  };
  $('#rTime').onchange = () => { s.remindAt = $('#rTime').value; save(); updGcal(); };
  updGcal();
  $('#rIcs').onclick = () => {
    const { start, end } = remindParts();
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Xiaobu//VN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      'UID:xiaobu-daily-' + Date.now() + '@xiaobu', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      'DTSTART:' + start, 'DTEND:' + end, 'RRULE:FREQ=DAILY', 'SUMMARY:📚 Học tiếng Trung ' + s.goal + ' phút (小步)',
      'DESCRIPTION:Mở app: ' + appUrl, 'URL:' + appUrl,
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Đến giờ học tiếng Trung rồi! 加油！', 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'nhac-hoc-tieng-trung.ics';
    document.body.appendChild(a); a.click(); a.remove(); toast('Mở file vừa tải để thêm vào lịch nhé 📅');
  };
  if (location.hash.endsWith('/remind')) setTimeout(() => $('#remind').scrollIntoView({ behavior: 'smooth' }), 100);
  $('#exp').onclick = () => {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `xiaobu-tien-do-${todayKey()}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const importData = txt => {
    try {
      const d = JSON.parse(txt); if (!d || !d.v || !d.lessons) throw 0;
      localStorage.setItem(KEY, JSON.stringify(d)); S = load(); applySettings(); updHUD(); toast('✅ Đã khôi phục tiến độ!'); go('#/');
    } catch (e) { toast('❌ File/mã sao lưu không hợp lệ'); }
  };
  $('#imp').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => importData(r.result); r.readAsText(f); };
  $('#copyCode').onclick = async () => {
    const code = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
    try { await navigator.clipboard.writeText(code); toast('📋 Đã copy mã. Dán vào ghi chú / Zalo để giữ nhé.'); }
    catch (e) { const t = $('#codeBox'); t.hidden = false; t.value = code; t.select(); toast('Copy thủ công mã trong ô bên dưới'); }
  };
  $('#pasteCode').onclick = () => {
    const t = $('#codeBox');
    if (t.hidden || !t.value.trim()) { t.hidden = false; t.value = ''; t.focus(); toast('Dán mã vào ô rồi bấm lại nút này'); return; }
    try { importData(decodeURIComponent(escape(atob(t.value.trim())))); } catch (e) { toast('❌ Mã không hợp lệ'); }
  };
  $('#reset').onclick = () => {
    if (confirm('Xóa toàn bộ tiến độ học? Không thể hoàn tác.')) { const keep = S.settings; S = DEF(); S.settings = keep; save(); updHUD(); toast('Đã làm lại từ đầu'); go('#/'); }
  };
}

/* ============ boot ============ */
function boot() {
  if (!COURSE.length) { $('#view').innerHTML = '<p>Không tải được giáo trình (js/data.js).</p>'; return; }
  applySettings(); buildChrome(); TTS.init();
  const want = PACKS.filter(p => p.id > 1 && p.file && packOpen(p.id));
  if (want.length) {
    $('#view').innerHTML = `<div class="empty">${MASCOT}<h3>Đang tải bài học…</h3></div>`;
    Promise.all(want.map(loadPack)).then(() => route());
  } else route();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  // kiểm tra font chữ Hán đã tải
  document.fonts?.load?.('16px "Noto Sans SC"', '你好').catch(() => {});
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
