(() => {
  if (window.__ytpf) return;
  window.__ytpf = true;

  const H = (x) => x;
  const setHtml = (el, x) => { el.innerHTML = H(x); };

  const KEY = 'ytpf';
  const persist = (s) => { try { chrome.storage.local.set({ [KEY]: s }); } catch (e) {} };
  const restore = () => chrome.storage.local.get(KEY).then((r) => r[KEY] || null);

  let S = { folders: [], lists: [], hidden: [], chans: [], notes: {}, feedFilter: null };
  let mode = 'p', sel = 'none', ed = null, q = '', open = false, drag = null, view = null, ne = null;
  const selStore = { p: 'none', c: 'all', n: 'all' };
  const PREVIEWS = 4;
  const PV_VER = 5; // увеличивайте, когда меняется разбор данных: кэш превью перезагрузится

  const CSS = `
:host{all:initial;--bg:#fff;--side:#f2f2f2;--ink:#0f0f0f;--mut:#606060;--line:#d9d9d9;--acc:#065fd4;--accink:#fff;--hov:#e6e6e6;--sel:#fff;--drop:#cfe0fb;font:16px/1.4 Roboto,Arial,sans-serif;color:var(--ink)}
:host-context(html[dark]){--bg:#212121;--side:#181818;--ink:#f1f1f1;--mut:#aaa;--line:#3d3d3d;--acc:#3ea6ff;--accink:#0f0f0f;--hov:#303030;--sel:#2b2b2b;--drop:#26405f}
*{box-sizing:border-box}
[hidden]{display:none!important}
button,input,select,textarea{font:inherit;color:inherit}
button{cursor:pointer;border:1px solid var(--line);background:var(--bg);border-radius:8px;padding:6px 12px}
button:hover{background:var(--hov)}
.pri{background:var(--acc);color:var(--accink);border-color:var(--acc);font-weight:500}
.pri:hover{background:var(--acc);opacity:.9}
input,select,textarea{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:6px 8px;max-width:100%}
#zone{position:fixed;right:0;bottom:0;width:260px;height:120px;z-index:2147483000;display:flex;align-items:flex-end;justify-content:flex-end;gap:10px;padding:16px;background:transparent}
#zone.wide{width:560px}
#fab,#nbtn{background:var(--hov);color:var(--ink);box-shadow:0 4px 16px rgba(0,0,0,.45);opacity:0;transform:scale(.9);transition:opacity .15s,transform .15s}
#fab{font-size:28px;padding:20px 40px;border-radius:50px}
#nbtn{font-size:22px;padding:16px 28px;border-radius:50px}
#zone:hover #fab,#zone:hover #nbtn{opacity:1;transform:scale(1)}
#fab:hover,#nbtn:hover{background:var(--line)}
#pill{position:fixed;top:72px;right:24px;z-index:2147483000;background:var(--bg);border:1px solid var(--line);border-radius:20px;padding:6px 8px 6px 14px;box-shadow:0 2px 10px rgba(0,0,0,.35);font-size:14px;display:flex;align-items:center;gap:8px}
#pill button{border-radius:50%;padding:2px 8px}
#ov{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;padding-bottom:3vh}
#pn{background:var(--bg);width:95vw;height:94vh;border-radius:14px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.5)}
header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--line)}
header b{font-size:20px}
#tabs{flex:1;display:flex;gap:8px;margin-left:16px}
#tabs button{font-size:16px;padding:8px 20px;border-radius:20px}
#tabs button.on{background:var(--acc);color:var(--accink);border-color:var(--acc);font-weight:500}
#st{color:var(--mut);font-size:13px;max-width:420px}
#x{font-size:30px;line-height:1;padding:10px 24px}
#body{flex:1;display:grid;grid-template-columns:400px 1fr;min-height:0}
aside{background:var(--side);border-right:1px solid var(--line);padding:10px 8px;overflow:auto;display:flex;flex-direction:column}
section{padding:12px 16px;overflow:auto}
.row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;font-size:20px}
.row:hover{background:var(--hov)}
.row.on{background:var(--sel);box-shadow:inset 3px 0 0 var(--acc);font-weight:500}
.row.over{background:var(--drop)}
.n{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.c{color:var(--mut);font-size:16px}
.ic{font-size:28px;line-height:1;vertical-align:middle}
.act{display:none}
.row:hover .act,.row.on .act{display:flex}
.act button{padding:0 6px;border:0;background:transparent;color:var(--mut);font-size:18px}
.nf{display:flex;gap:6px;margin-top:12px}
.nf input{flex:1;min-width:0}
.hint{color:var(--mut);font-size:14px;margin:6px 4px}
.crumb{font-size:22px;font-weight:500;margin:0 0 10px}
#tools{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
#q{width:100%;margin-bottom:10px}
.card{display:flex;gap:10px;align-items:center;justify-content:space-between;border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin-bottom:8px;cursor:pointer;user-select:none}
.ri{user-select:text;width:100%}
.ti{min-width:0;flex:1}
.ti b{font-weight:500;font-size:21px;line-height:1.3;overflow-wrap:anywhere}
.m{color:var(--mut);font-size:14px}
.empty{color:var(--mut);padding:20px 4px}
.lg{display:grid;grid-template-columns:repeat(auto-fill,minmax(440px,1fr));gap:12px}
.lg .card{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:0;padding:12px 14px}
.cm{min-width:0;display:flex;flex-direction:column;gap:4px}
.pv{display:grid;gap:6px}
.pv img,.pv i{width:100%;aspect-ratio:4/3;border-radius:8px;object-fit:cover;background:var(--hov);display:block}
.pbar{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.pbar b{flex:1;font-size:24px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pbar a{color:var(--acc);text-decoration:none;font-weight:500}
.pbar button[data-a="back"],.pbar button[data-a="nback"]{font-size:20px;font-weight:500;padding:12px 26px}
.vg{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.vc{display:block;text-decoration:none;color:var(--ink)}
.vc .th{position:relative;aspect-ratio:16/9;background:var(--hov);border-radius:10px;overflow:hidden}
.vc img{width:100%;height:100%;object-fit:cover;display:block}
.vc .du{position:absolute;right:6px;bottom:6px;background:rgba(0,0,0,.8);color:#fff;font-size:13px;padding:1px 5px;border-radius:4px}
.vt{margin-top:6px;font-weight:500;font-size:15px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.vc:hover .vt{color:var(--acc)}
.vc.off{opacity:.5}
.cg{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.cc{display:flex;gap:14px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:12px 14px;cursor:pointer;user-select:none}
.av{width:60px;height:60px;border-radius:50%;object-fit:cover;background:var(--hov);flex:none;display:block}
.ct{font-size:19px;font-weight:500;overflow-wrap:anywhere}
.ng{display:flex;flex-direction:column;gap:12px}
.nc{display:flex;gap:14px;border:1px solid var(--line);border-radius:12px;padding:12px;align-items:flex-start}
.nth{flex:none;width:200px}
.nth img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;display:block;background:var(--hov)}
.nb{flex:1;min-width:0}
.nt{color:var(--ink);font-size:18px;font-weight:500;text-decoration:none}
.nt:hover{color:var(--acc)}
.tg{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}
.tag{background:var(--hov);border-radius:12px;padding:2px 10px;font-size:13px;cursor:pointer}
.nx{margin-top:6px;line-height:1.5;overflow-wrap:anywhere}
.nx a{color:var(--acc);text-decoration:none}
#ntags,#ntext{width:100%;margin-bottom:10px;font-size:16px}
#ntext{min-height:260px;resize:vertical}
.nrow{display:flex;gap:10px;flex-wrap:wrap}
`;

  const HTML = `
<style>${CSS}</style>
<div id="zone"><button id="nbtn" hidden>📝 Заметка</button><button id="fab">📁 Папки</button></div>
<div id="pill" hidden></div>
<div id="ov" hidden>
  <div id="pn">
    <header>
      <b>Папки</b>
      <div id="tabs"><button data-tab="p">Плейлисты</button><button data-tab="c">Подписки</button><button data-tab="n">Заметки</button></div>
      <span id="st"></span><button id="rs">Обновить со страницы</button><button id="x" aria-label="Закрыть">✕</button>
    </header>
    <div id="body">
      <aside>
        <div id="tree"></div>
        <div class="nf" id="nfw"><input id="nfi" placeholder="Новая папка"><button id="nfb" class="pri">+</button></div>
        <div class="hint" id="nfh"></div>
      </aside>
      <section>
        <div class="crumb" id="crumb"></div>
        <div id="tools"></div>
        <input id="q" type="search" placeholder="Поиск">
        <div id="cards"></div>
      </section>
    </div>
  </div>
</div>`;

  const host = document.createElement('div');
  host.id = 'ytpf-host';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = H(HTML);
  document.documentElement.appendChild(host);

  // ---------- общие помощники ----------
  const $ = (s) => root.querySelector(s);
  const uid = () => Math.random().toString(36).slice(2, 10);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let loaded = false;
  const save = () => { if (loaded) persist(S); };
  const fol = (id) => S.folders.find((f) => f.id === id);
  const fk = (f) => f.k || 'p';
  const itemsOf = (m) => (m === 'c' ? S.chans : S.lists);
  const P = () => location.pathname;
  const isPL = () => P() === '/feed/playlists' || /\/playlists\/?$/.test(P());
  const isCH = () => P() === '/feed/channels';
  const isSubs = () => P() === '/feed/subscriptions';
  const isVideo = () => P() === '/watch' || P().startsWith('/shorts/');
  const inWide = () => !!document.fullscreenElement || !!document.querySelector('ytd-watch-flexy[theater], ytd-watch-flexy[fullscreen]');
  const fixUrl = (u) => (u ? (u.startsWith('//') ? 'https:' + u : u) : '');
  const normH = (p) => { try { return decodeURIComponent((p.split('?')[0].split('/')[1]) || '').toLowerCase(); } catch (e) { return ''; } };

  function ids(id) { let r = [id]; S.folders.filter((f) => f.p === id).forEach((f) => (r = r.concat(ids(f.id)))); return r; }
  function path(id) { const a = []; let f = fol(id); while (f) { a.unshift(f.name); f = fol(f.p); } return a.join(' / '); }
  const count = (id) => { const s = ids(id); return itemsOf(mode).filter((l) => s.includes(l.f)).length; };

  const deep = (o, key) => {
    if (!o || typeof o !== 'object') return undefined;
    if (o[key] !== undefined) return o[key];
    for (const k in o) { const r = deep(o[k], key); if (r !== undefined) return r; }
    return undefined;
  };
  const txt = (x) => (x ? (typeof x === 'string' ? x : x.simpleText || (x.runs ? x.runs.map((r) => r.text).join('') : '') || x.content || '') : '');

  // ---------- доступ к данным YouTube ----------
  async function authHeaders() {
    const m = document.cookie.match(/(?:^|;\s*)(?:__Secure-3PAPISID|SAPISID)=([^;]+)/);
    if (!m) return {};
    const ts = Math.floor(Date.now() / 1000);
    const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(ts + ' ' + m[1] + ' https://www.youtube.com'));
    const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    return { Authorization: 'SAPISIDHASH ' + ts + '_' + hex, 'X-Origin': 'https://www.youtube.com', 'X-Goog-AuthUser': '0' };
  }

  async function getPage(url) {
    const html = await (await fetch(url, { credentials: 'include' })).text();
    const key = (html.match(/"INNERTUBE_API_KEY":"([^"]+)"/) || [])[1];
    const ver = (html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/) || [])[1] || '2.20250101.00.00';
    let data = null;
    const m = html.match(/ytInitialData["\]]*\s*=\s*(\{.+?\});\s*<\/script>/s);
    if (m) { try { data = JSON.parse(m[1]); } catch (e) {} }
    return { data, key, ver, len: html.length };
  }
  const plUrl = (id) => '/playlist?list=' + encodeURIComponent(id) + '&hl=ru';

  async function browseApi(body, key, ver) {
    const resp = await fetch('/youtubei/v1/browse?prettyPrint=false' + (key ? '&key=' + key : ''), {
      method: 'POST',
      credentials: 'include',
      headers: Object.assign({ 'Content-Type': 'application/json' }, await authHeaders()),
      body: JSON.stringify(Object.assign({ context: { client: { clientName: 'WEB', clientVersion: ver, hl: 'ru' } } }, body)),
    });
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return resp.json();
  }

  function tokenOf(data) {
    let token = null;
    (function walk(o) {
      if (!o || typeof o !== 'object') return;
      const ci = o.continuationItemRenderer;
      if (ci && ci.continuationEndpoint && ci.continuationEndpoint.continuationCommand) token = ci.continuationEndpoint.continuationCommand.token;
      for (const k in o) walk(o[k]);
    })(data);
    return token;
  }

  // видео: старый формат (…Renderer) и новый (lockupViewModel)
  function pickVideo(o) {
    const r = o.playlistVideoRenderer || o.playlistPanelVideoRenderer || o.videoRenderer || o.gridVideoRenderer || o.compactVideoRenderer;
    if (r && r.videoId) {
      return { id: r.videoId, t: txt(r.title), c: txt(r.shortBylineText || r.longBylineText || r.ownerText), d: txt(r.lengthText), ok: r.isPlayable !== false };
    }
    const lv = o.lockupViewModel;
    if (lv && lv.contentId && /VIDEO/.test(lv.contentType || '')) {
      const md = lv.metadata && lv.metadata.lockupMetadataViewModel;
      const parts = deep(md, 'metadataParts');
      const badge = deep(lv.contentImage, 'thumbnailBadgeViewModel');
      return { id: lv.contentId, t: txt(md && md.title), c: parts && parts[0] ? txt(parts[0].text) : '', d: badge ? txt(badge.text) : '', ok: true };
    }
    return null;
  }

  // каналы: старый формат (channelRenderer) и новый (lockupViewModel)
  function pickChannel(o) {
    const r = o.channelRenderer || o.gridChannelRenderer;
    if (r && r.channelId) {
      const ep = r.navigationEndpoint && r.navigationEndpoint.browseEndpoint;
      const base = (ep && ep.canonicalBaseUrl) || '';
      return { c: r.channelId, h: base.startsWith('/@') ? normH(base) : '', t: txt(r.title), img: fixUrl(deep(r.thumbnail, 'url')) };
    }
    const lv = o.lockupViewModel;
    if (lv && lv.contentId && /CHANNEL/.test(lv.contentType || '')) {
      const md = lv.metadata && lv.metadata.lockupMetadataViewModel;
      const base = deep(lv, 'canonicalBaseUrl') || '';
      return { c: lv.contentId, h: base.startsWith('/@') ? normH(base) : '', t: txt(md && md.title), img: fixUrl(deep(lv.contentImage, 'url')) };
    }
    return null;
  }

  function collectBy(pick, data, max) {
    const out = [];
    (function walk(o) {
      if (!o || typeof o !== 'object' || out.length >= max) return;
      const it = pick(o);
      if (it) { out.push(it); return; }
      for (const k in o) walk(o[k]);
    })(data);
    return out;
  }
  const collect = (data, max) => collectBy(pickVideo, data, max);

  // ---------- вкладка «Плейлисты»: загрузка списка видео ----------
  function vcard(v, it) {
    return `<a class="vc${it.ok ? '' : ' off'}" href="/watch?v=${it.id}&list=${encodeURIComponent(v.l)}&index=${it.i}"><div class="th"><img loading="lazy" src="https://i.ytimg.com/vi/${it.id}/mqdefault.jpg" alt="">${it.d ? `<span class="du">${esc(it.d)}</span>` : ''}</div><div class="vt">${esc(it.t)}</div><div class="m">${esc(it.c)}</div></a>`;
  }

  function takeVideos(v, data) {
    const fresh = collect(data, Infinity);
    fresh.forEach((it, i) => { it.i = v.items.length + i + 1; });
    const token = tokenOf(data);
    v.items = v.items.concat(fresh);
    if (view === v) {
      const g = root.querySelector('.vg');
      if (g) g.insertAdjacentHTML('beforeend', H(fresh.map((it) => vcard(v, it)).join('')));
      const msg = $('#vmsg'); if (msg && v.items.length) msg.hidden = true;
      const st = $('#vst'); if (st) st.textContent = 'Загружено: ' + v.items.length + '…';
    }
    return token;
  }

  async function loadPlaylist(v) {
    const dbg = [];
    let failed = false;
    try {
      const g = await getPage(plUrl(v.l));
      dbg.push('страница ' + Math.round(g.len / 1000) + ' КБ, данные ' + (g.data ? 'есть' : 'нет'));
      let token = g.data ? takeVideos(v, g.data) : null;
      dbg.push('видео на странице: ' + v.items.length);
      if (!v.items.length && view === v) {
        try {
          token = takeVideos(v, await browseApi({ browseId: 'VL' + v.l }, g.key, g.ver));
          dbg.push('видео через API: ' + v.items.length);
        } catch (e) { dbg.push('API: ' + e.message); }
      }
      while (token && view === v && v.items.length < 3000) {
        token = takeVideos(v, await browseApi({ continuation: token }, g.key, g.ver));
      }
    } catch (e) { failed = true; dbg.push('ошибка: ' + e.message); }
    v.done = true;
    if (view !== v) return;
    const st = $('#vst'); if (st) st.textContent = v.items.length + ' видео';
    const msg = $('#vmsg');
    if (msg) {
      const info = ' [' + dbg.join('; ') + ']';
      if (!v.items.length) { msg.hidden = false; msg.textContent = (failed ? 'Не удалось загрузить список видео. ' : 'В плейлисте нет видео или он недоступен. ') + 'Откройте плейлист на YouTube.' + info; }
      else if (failed) { msg.hidden = false; msg.textContent = 'Список загружен не полностью.' + info; }
    }
  }

  function openView(l) {
    const v = { l: l.l, t: l.t, items: [], done: false };
    view = v;
    $('#q').hidden = true;
    $('#tools').hidden = true;
    const id = encodeURIComponent(l.l);
    setHtml($('#cards'), `<div class="pbar"><button data-a="back">← К списку</button><b>${esc(l.t)}</b><span class="m" id="vst"></span><a href="/playlist?list=${id}">Открыть на YouTube</a></div><div class="vg"></div><div class="empty" id="vmsg">Загружаю список видео…</div>`);
    loadPlaylist(v);
  }

  // ---------- превью плейлистов ----------
  function pvHtml(p) {
    const ids = p.pv || [];
    const done = (p.pvv || 0) >= PV_VER;
    let h = `<div class="pv" data-pl="${p.id}"${done ? '' : ' data-need="1"'} style="grid-template-columns:repeat(${PREVIEWS},1fr)">`;
    for (let i = 0; i < (done ? ids.length : PREVIEWS); i++) h += ids[i] ? `<img draggable="false" loading="lazy" src="https://i.ytimg.com/vi/${ids[i]}/mqdefault.jpg" alt="">` : '<i></i>';
    return h + '</div>';
  }

  const pvQ = [], pvTried = new Set(), pvFail = {};
  let pvBusy = 0;
  function pvEnqueue(l) {
    if (pvTried.has(l.l) || (l.pvv || 0) >= PV_VER) return;
    pvTried.add(l.l);
    pvQ.push(l);
    pvPump();
  }
  function pvPump() {
    while (pvBusy < 2 && pvQ.length) {
      const l = pvQ.shift();
      pvBusy++;
      pvFetch(l).finally(() => { pvBusy--; pvPump(); });
    }
  }
  function pvRetry(l) {
    pvFail[l.l] = (pvFail[l.l] || 0) + 1;
    if (pvFail[l.l] <= 3) setTimeout(() => { pvTried.delete(l.l); pvEnqueue(l); }, 6000 * pvFail[l.l]);
  }
  async function pvFetch(l) {
    try {
      const g = await getPage(plUrl(l.l));
      let found = g.data ? collect(g.data, PREVIEWS) : [];
      if (!found.length) { try { found = collect(await browseApi({ browseId: 'VL' + l.l }, g.key, g.ver), PREVIEWS); } catch (e) {} }
      if (!g.data && !found.length) { pvRetry(l); return; }
      l.pv = found.map((x) => x.id);
      l.pvv = PV_VER;
      save();
      const e = root.querySelector('.pv[data-pl="' + l.id + '"]');
      if (e) e.outerHTML = H(pvHtml(l));
    } catch (e) { pvRetry(l); }
  }
  const pvObs = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      pvObs.unobserve(e.target);
      const l = S.lists.find((x) => x.id === e.target.dataset.pl);
      if (l) pvEnqueue(l);
    });
  }, { root: root.querySelector('section'), rootMargin: '300px' });

  // ---------- сбор плейлистов и каналов со страницы ----------
  function scan() {
    const seen = new Map();
    document.querySelectorAll('a[href*="list="]').forEach((a) => {
      let u; try { u = new URL(a.href, location.origin); } catch (e) { return; }
      if (u.pathname !== '/playlist') return;
      const id = u.searchParams.get('list');
      if (!id || id.startsWith('RD')) return;
      const box = a.closest('yt-lockup-view-model,ytd-rich-item-renderer,ytd-grid-playlist-renderer,ytd-playlist-renderer') || a;
      const te = box.querySelector('h3,#video-title,.yt-lockup-metadata-view-model-wiz__title');
      const t = ((te && te.textContent) || a.getAttribute('title') || a.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ');
      if (!seen.has(id) || (!seen.get(id) && t)) seen.set(id, t);
    });
    let n = 0;
    seen.forEach((t, id) => {
      if (S.hidden.includes(id)) return;
      const ex = S.lists.find((l) => l.l === id);
      if (ex) { if (t && ex.t.startsWith('Плейлист …')) ex.t = t; }
      else { S.lists.push({ id: uid(), l: id, t: t || 'Плейлист …' + id.slice(-6), f: null }); n++; }
    });
    if (n) { save(); render(); }
    return n;
  }

  function mergeChans(items) {
    let n = 0;
    items.forEach((it) => {
      if (!it.t && !it.c && !it.h) return;
      const ex = S.chans.find((c) => (it.c && c.c === it.c) || (it.h && c.h === it.h));
      if (ex) { if (it.c && !ex.c) ex.c = it.c; if (it.h && !ex.h) ex.h = it.h; if (it.t) ex.t = it.t; if (it.img) ex.img = it.img; }
      else { S.chans.push({ id: uid(), c: it.c || '', h: it.h || '', t: it.t || it.h || it.c, img: it.img || '', f: null }); n++; }
    });
    if (n) save();
    return n;
  }

  function scanChannelsDom() {
    const found = [];
    document.querySelectorAll('ytd-channel-renderer').forEach((el) => {
      const a = el.querySelector('a[href^="/@"], a[href^="/channel/"]');
      if (!a) return;
      const href = a.getAttribute('href');
      const te = el.querySelector('#text, #channel-title, #info h3');
      const im = el.querySelector('img');
      found.push({ c: href.startsWith('/channel/') ? href.split('/')[2] : '', h: href.startsWith('/@') ? normH(href) : '', t: te ? te.textContent.trim() : '', img: im ? fixUrl(im.getAttribute('src')) : '' });
    });
    const n = mergeChans(found);
    if (n) render();
    return n;
  }

  async function fetchChannels() {
    const stEl = $('#st');
    stEl.textContent = 'Загружаю подписки…';
    const dbg = [];
    let n = 0;
    try {
      const g = await getPage('/feed/channels');
      let items = g.data ? collectBy(pickChannel, g.data, Infinity) : [];
      let token = g.data ? tokenOf(g.data) : null;
      dbg.push('на странице: ' + items.length);
      if (!items.length) {
        try {
          const d = await browseApi({ browseId: 'FEchannels' }, g.key, g.ver);
          items = collectBy(pickChannel, d, Infinity); token = tokenOf(d);
          dbg.push('через API: ' + items.length);
        } catch (e) { dbg.push('API: ' + e.message); }
      }
      let guard = 0;
      while (token && guard++ < 40) {
        const d = await browseApi({ continuation: token }, g.key, g.ver);
        items = items.concat(collectBy(pickChannel, d, Infinity));
        token = tokenOf(d);
      }
      n = mergeChans(items);
    } catch (e) { dbg.push('ошибка: ' + e.message); }
    stEl.textContent = n ? 'Новых каналов: ' + n : (S.chans.length ? 'Новых каналов нет' : 'Каналы не найдены [' + dbg.join('; ') + ']');
    render();
  }

  // ---------- фильтр ленты подписок ----------
  let feedTouched = false;
  function allowedSets() {
    const s = ids(S.feedFilter), A = { c: new Set(), h: new Set(), t: new Set() };
    S.chans.filter((ch) => s.includes(ch.f)).forEach((ch) => { if (ch.c) A.c.add(ch.c); if (ch.h) A.h.add(ch.h); if (ch.t) A.t.add(ch.t.toLowerCase()); });
    return A;
  }
  function applyFeedFilter() {
    const on = !!(S.feedFilter && fol(S.feedFilter) && isSubs());
    if (!on && !feedTouched) return;
    const A = on ? allowedSets() : null;
    document.querySelectorAll('ytd-rich-item-renderer, ytd-grid-video-renderer, ytd-video-renderer').forEach((card) => {
      let hide = false;
      if (on) {
        let known = false, ok = false;
        const a = card.querySelector('a[href^="/@"], a[href^="/channel/"]');
        if (a) {
          known = true;
          const hr = a.getAttribute('href');
          ok = hr.startsWith('/channel/') ? A.c.has(hr.split('/')[2]) : A.h.has(normH(hr));
        }
        const nm = card.querySelector('ytd-channel-name');
        if (nm && !ok) { const t = nm.textContent.trim().toLowerCase(); if (t) { known = true; if (A.t.has(t)) ok = true; } }
        hide = known && !ok;
      }
      const want = hide ? 'none' : '';
      if (card.style.display !== want) card.style.display = want;
    });
    feedTouched = on;
  }

  // ---------- окно «Сохранить в плейлист» ----------
  const ROW_SEL = 'yt-list-item-view-model, toggleable-list-item-view-model, ytd-playlist-add-to-option-renderer, [role="listitem"], [role="option"], [role="menuitemcheckbox"], [role="checkbox"]';
  const ttl = new WeakMap();
  let pf = 'all', chipBar = null;
  const firstLine = (el) => ((el.innerText || '').split('\n').map((x) => x.trim()).find(Boolean) || '');
  const titleOf = (el) => { if (!ttl.has(el) && el.style.display !== 'none') ttl.set(el, firstLine(el)); return ttl.get(el) || ''; };

  function paintChips(b) {
    b.querySelectorAll('button').forEach((c) => {
      const on = c.dataset.k === pf;
      c.style.background = on ? 'var(--yt-spec-text-primary,#fff)' : 'var(--yt-spec-badge-chip-background,rgba(255,255,255,.1))';
      c.style.color = on ? 'var(--yt-spec-text-primary-inverse,#0f0f0f)' : 'var(--yt-spec-text-primary,#fff)';
    });
  }
  function buildChips() {
    const b = document.createElement('div');
    b.id = 'ytpf-chips';
    b.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;padding:8px 0 10px;';
    const chip = (label, key) => {
      const c = document.createElement('button');
      c.type = 'button';
      c.textContent = label;
      c.dataset.k = key;
      c.style.cssText = 'cursor:pointer;border:0;border-radius:8px;padding:6px 12px;font:500 13px Roboto,Arial,sans-serif;';
      c.addEventListener('click', (e) => { e.stopPropagation(); pf = key; paintChips(b); savePopup(); });
      return c;
    };
    b.appendChild(chip('Все', 'all'));
    b.appendChild(chip('Без папки', 'none'));
    S.folders.filter((f) => fk(f) === 'p').forEach((f) => b.appendChild(chip(path(f.id), f.id)));
    paintChips(b);
    return b;
  }
  function savePopup() {
    const pc = document.querySelector('ytd-popup-container');
    if (!pc || !pc.firstElementChild || !S.lists.length) return;
    const byTitle = new Map(S.lists.map((l) => [l.t.trim(), l]));
    let rows = Array.from(pc.querySelectorAll(ROW_SEL)).filter((el) => byTitle.has(titleOf(el)));
    rows = rows.filter((a) => !rows.some((b) => b !== a && b.contains(a)));
    if (rows.length < 2) return;
    const hostEl = rows[0].parentElement;
    if (!chipBar || !chipBar.isConnected || chipBar.parentElement !== hostEl) {
      pf = 'all';
      chipBar = buildChips();
      hostEl.insertBefore(chipBar, rows[0]);
    }
    Array.from(hostEl.children).forEach((el) => {
      if (el === chipBar) return;
      const l = byTitle.get(titleOf(el));
      const f = l ? l.f : null;
      const show = pf === 'all' || (pf === 'none' ? !f : !!(f && ids(pf).includes(f)));
      const want = show ? '' : 'none';
      if (el.style.display !== want) el.style.display = want;
    });
  }

  // ---------- заметки ----------
  const fmtTime = (s) => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; const p = (n) => String(n).padStart(2, '0'); return h ? h + ':' + p(m) + ':' + p(x) : m + ':' + p(x); };
  function linkify(text, id) {
    return esc(text).replace(/\[((?:\d{1,2}:)?\d{1,2}:\d{2})\]/g, (m, ts) => {
      const p = ts.split(':').map(Number);
      const s = p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
      return `<a href="/watch?v=${id}&amp;t=${s}s">[${ts}]</a>`;
    }).replace(/\n/g, '<br>');
  }
  function videoInfo() {
    const u = new URL(location.href);
    const id = u.pathname.startsWith('/shorts/') ? u.pathname.split('/')[2] : u.searchParams.get('v');
    if (!id) return null;
    const ch = document.querySelector('ytd-watch-metadata ytd-channel-name a, ytd-video-owner-renderer ytd-channel-name a, #owner ytd-channel-name a');
    return { id, t: document.title.replace(/^\(\d+\)\s*/, '').replace(/\s*-\s*YouTube$/, ''), c: ch ? ch.textContent.trim() : '' };
  }
  function noteCard(n) {
    return `<div class="nc"><a class="nth" href="/watch?v=${n.id}"><img draggable="false" loading="lazy" src="https://i.ytimg.com/vi/${n.id}/mqdefault.jpg" alt=""></a>` +
      `<div class="nb"><a class="nt" href="/watch?v=${n.id}">${esc(n.t)}</a><div class="m">${esc(n.c || '')}</div>` +
      `<div class="tg">${(n.tags || []).map((t) => `<span class="tag" data-tag="${esc(t)}">#${esc(t)}</span>`).join('')}</div>` +
      `<div class="nx">${linkify(n.text || '', n.id)}</div></div><button data-a="nedit" data-nid="${n.id}">✎ Изменить</button></div>`;
  }
  function editorHtml(n) {
    return `<div class="pbar"><button data-a="nback">← К заметкам</button><b>${esc(n.t)}</b><a href="/watch?v=${n.id}">Открыть видео</a></div>` +
      `<input id="ntags" placeholder="Метки через запятую, например: туториал, на потом" value="${esc((n.tags || []).join(', '))}">` +
      `<textarea id="ntext" placeholder="Заметка. Время вида [12:34] станет ссылкой на этот момент видео.">${esc(n.text || '')}</textarea>` +
      `<div class="nrow"><button data-a="nts">⏱ Вставить текущее время</button><button class="pri" data-a="nsave">Сохранить</button>${S.notes[n.id] ? '<button data-a="ndel">Удалить заметку</button>' : ''}</div>`;
  }
  function openEditor(n) {
    ne = n;
    render();
    setHtml($('#cards'), editorHtml(n));
    const ta = $('#ntext'); if (ta) ta.focus();
  }
  function openNoteFromPage() {
    const info = videoInfo();
    if (!info) return;
    toggle(true);
    switchMode('n');
    const ex = S.notes[info.id];
    openEditor({ id: info.id, t: info.t || (ex && ex.t) || info.id, c: info.c || (ex && ex.c) || '', tags: ex ? ex.tags || [] : [], text: ex ? ex.text || '' : '' });
  }

  // ---------- отрисовка ----------
  function tree(p, d) {
    return S.folders.filter((f) => fk(f) === mode && f.p === p).map((f) =>
      `<div class="row ${sel === f.id ? 'on' : ''}" data-id="${f.id}" data-drop="${f.id}" style="padding-left:${12 + d * 22}px">` +
      (ed === f.id
        ? `<input class="ri" value="${esc(f.name)}">`
        : `<span class="n"><span class="ic">📁</span> ${esc(f.name)}</span><span class="c">${count(f.id)}</span><span class="act"><button data-a="rf" title="Переименовать">✎</button><button data-a="df" title="Удалить папку">✕</button></span>`) +
      `</div>` + tree(f.id, d + 1)).join('');
  }

  function renderSide() {
    if (mode === 'n') {
      const tags = {};
      Object.values(S.notes).forEach((n) => (n.tags || []).forEach((t) => { tags[t] = (tags[t] || 0) + 1; }));
      setHtml($('#tree'), `<div class="row ${sel === 'all' ? 'on' : ''}" data-id="all"><span class="n"><span class="ic">📝</span> Все заметки</span><span class="c">${Object.keys(S.notes).length}</span></div>` +
        Object.keys(tags).sort().map((t) => `<div class="row ${sel === '#' + t ? 'on' : ''}" data-id="#${esc(t)}"><span class="n"># ${esc(t)}</span><span class="c">${tags[t]}</span></div>`).join(''));
    } else {
      const arr = itemsOf(mode);
      setHtml($('#tree'), `<div class="row ${sel === 'all' ? 'on' : ''}" data-id="all"><span class="n"><span class="ic">🗂</span> ${mode === 'c' ? 'Все каналы' : 'Все плейлисты'}</span><span class="c">${arr.length}</span></div>` +
        `<div class="row ${sel === 'none' ? 'on' : ''}" data-id="none" data-drop="none"><span class="n"><span class="ic">📥</span> Без папки</span><span class="c">${arr.filter((l) => !l.f).length}</span></div>` + tree(null, 0));
    }
    $('#nfw').hidden = mode === 'n';
    const real = fol(sel);
    $('#nfh').textContent = mode === 'n' ? '' : (real ? `Новая папка будет внутри «${real.name}».` : 'Новая папка будет в корне.');
  }

  function renderTools() {
    let h = '';
    if (mode === 'c') {
      if (fol(sel)) h += '<button data-a="ff">🔎 Показывать в ленте подписок только эту папку</button>';
      if (S.feedFilter && fol(S.feedFilter)) h += `<span class="m">Фильтр ленты: ${esc(path(S.feedFilter))}</span><button data-a="fx">Снять фильтр</button>`;
    } else if (mode === 'n') {
      h = isVideo() ? '<button class="pri" data-a="nnew">➕ Заметка к текущему видео</button>' : '<span class="m">Откройте видео и наведите мышь на правый нижний угол: появится кнопка «📝 Заметка».</span>';
    }
    setHtml($('#tools'), h);
    $('#tools').hidden = !h;
  }

  function renderLists() {
    const real = fol(sel);
    let L = S.lists;
    if (sel === 'none') L = L.filter((l) => !l.f); else if (real) { const s = ids(sel); L = L.filter((l) => s.includes(l.f)); }
    if (q) L = L.filter((l) => l.t.toLowerCase().includes(q));
    setHtml($('#cards'), L.length
      ? '<div class="lg">' + L.map((p) => `<div class="card" draggable="true" data-id="${p.id}" title="Нажмите, чтобы открыть список видео"><div class="cm"><div class="ti"><b>${esc(p.t)}</b><div class="m">${esc(path(p.f) || 'Без папки')}</div></div></div>${pvHtml(p)}</div>`).join('') + '</div>'
      : `<div class="empty">${S.lists.length ? 'Здесь пока пусто. Перетащите сюда плейлисты слева направо.' : 'Плейлисты пока не найдены. Откройте вкладку «Плейлисты» на YouTube, прокрутите вниз и нажмите «Обновить со страницы».'}</div>`);
  }

  function renderChans() {
    const real = fol(sel);
    let L = S.chans;
    if (sel === 'none') L = L.filter((c) => !c.f); else if (real) { const s = ids(sel); L = L.filter((c) => s.includes(c.f)); }
    if (q) L = L.filter((c) => (c.t + ' ' + c.h).toLowerCase().includes(q));
    const card = (ch) => `<div class="cc" draggable="true" data-id="${ch.id}" title="Открыть канал">` +
      (ch.img ? `<img class="av" draggable="false" loading="lazy" src="${esc(ch.img)}" alt="">` : '<i class="av"></i>') +
      `<div class="cm"><b class="ct">${esc(ch.t)}</b><div class="m">${esc(ch.h || '')}</div><div class="m">${esc(path(ch.f) || 'Без папки')}</div></div></div>`;
    setHtml($('#cards'), L.length ? '<div class="cg">' + L.map(card).join('') + '</div>'
      : `<div class="empty">${S.chans.length ? 'Здесь пока пусто. Перетащите сюда каналы слева направо.' : 'Подписки пока не загружены. Нажмите «Обновить подписки».'}</div>`);
  }

  function renderNotes() {
    let L = Object.keys(S.notes).map((id) => Object.assign({ id }, S.notes[id])).sort((a, b) => (b.ts || 0) - (a.ts || 0));
    if (sel.startsWith('#')) { const t = sel.slice(1); L = L.filter((n) => (n.tags || []).includes(t)); }
    if (q) L = L.filter((n) => (n.t + ' ' + (n.text || '') + ' ' + (n.tags || []).join(' ')).toLowerCase().includes(q));
    setHtml($('#cards'), L.length ? '<div class="ng">' + L.map(noteCard).join('') + '</div>'
      : `<div class="empty">${Object.keys(S.notes).length ? 'Ничего не найдено.' : 'Заметок пока нет. Откройте видео, наведите мышь на правый нижний угол и нажмите «📝 Заметка».'}</div>`);
  }

  const focusRi = () => { const i = root.querySelector('.ri'); if (i) { i.focus(); i.select(); } };

  function render() {
    if (mode !== 'n' && sel !== 'all' && sel !== 'none' && !fol(sel)) sel = 'all';
    root.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === mode));
    renderSide();
    $('#rs').hidden = mode === 'n';
    $('#rs').textContent = mode === 'c' ? 'Обновить подписки' : 'Обновить со страницы';
    $('#crumb').textContent = mode === 'n' ? (sel.startsWith('#') ? 'Метка: ' + sel.slice(1) : 'Все заметки')
      : sel === 'all' ? (mode === 'c' ? 'Все каналы' : 'Все плейлисты') : sel === 'none' ? 'Без папки' : path(sel);
    if ((mode === 'p' && view) || (mode === 'n' && ne)) { $('#q').hidden = true; $('#tools').hidden = true; focusRi(); return; }
    $('#q').hidden = false;
    renderTools();
    if (mode === 'p') renderLists(); else if (mode === 'c') renderChans(); else renderNotes();
    root.querySelectorAll('.pv[data-need]').forEach((e) => pvObs.observe(e));
    focusRi();
  }

  function switchMode(m) {
    selStore[mode] = sel;
    mode = m; sel = selStore[m];
    view = null; ne = null; ed = null; q = ''; $('#q').value = ''; $('#st').textContent = '';
    render();
    if (m === 'c' && !S.chans.length) fetchChannels();
  }

  function toggle(v) {
    open = v;
    $('#ov').hidden = !v;
    $('#zone').hidden = v || inWide();
    if (!v) { view = null; render(); return; }
    mode = 'p'; sel = 'none'; selStore.p = 'none'; view = null; ne = null; q = ''; $('#q').value = '';
    const n = isPL() ? scan() : 0;
    render();
    $('#st').textContent = n ? `Найдено новых: ${n}` : '';
  }

  function refresh() {
    if (mode === 'p') {
      if (!isPL()) { $('#st').textContent = 'Откройте вкладку «Плейлисты»'; return; }
      $('#st').textContent = `Найдено новых: ${scan()}`;
    } else if (mode === 'c') fetchChannels();
  }

  function commit(el) {
    const id = el.closest('[data-id]').dataset.id, v = el.value.trim();
    if (ed !== id) return;
    ed = null;
    const f = fol(id);
    if (f && v) f.name = v;
    save(); render();
  }

  function newFolder() {
    const v = $('#nfi').value.trim();
    if (!v || mode === 'n') return;
    S.folders.push({ id: uid(), name: v, p: fol(sel) ? sel : null, k: mode });
    $('#nfi').value = '';
    save(); render();
  }

  function act(b) {
    const a = b.dataset.a, row = b.closest('[data-id]'), id = row ? row.dataset.id : null;
    if (a === 'rf') { ed = id; render(); }
    else if (a === 'df') {
      const f = fol(id), arr = itemsOf(fk(f));
      S.folders.forEach((x) => { if (x.p === id) x.p = f.p; });
      arr.forEach((l) => { if (l.f === id) l.f = f.p; });
      S.folders = S.folders.filter((x) => x.id !== id);
      if (sel === id) sel = f.p || 'all';
      if (S.feedFilter === id) S.feedFilter = null;
      save(); render();
    }
    else if (a === 'back') { view = null; render(); }
    else if (a === 'ff') { S.feedFilter = sel; save(); applyFeedFilter(); render(); $('#st').textContent = 'Откройте «Подписки» на YouTube: лента покажет только эту папку'; }
    else if (a === 'fx') { S.feedFilter = null; save(); applyFeedFilter(); render(); sync(); }
    else if (a === 'nnew') { const i = videoInfo(); if (i) { const ex = S.notes[i.id]; openEditor({ id: i.id, t: i.t || i.id, c: i.c, tags: ex ? ex.tags || [] : [], text: ex ? ex.text || '' : '' }); } }
    else if (a === 'nedit') { const nid = b.dataset.nid, n = S.notes[nid]; if (n) openEditor({ id: nid, t: n.t, c: n.c, tags: n.tags || [], text: n.text || '' }); }
    else if (a === 'nback') { ne = null; render(); }
    else if (a === 'nts') {
      const v = document.querySelector('video'), ta = $('#ntext');
      ta.setRangeText('[' + fmtTime(v ? Math.floor(v.currentTime) : 0) + '] ', ta.selectionStart, ta.selectionEnd, 'end');
      ta.focus();
    }
    else if (a === 'nsave') {
      const tags = Array.from(new Set($('#ntags').value.split(/[,;\n]+/).map((t) => t.trim().replace(/^#/, '')).filter(Boolean)));
      const text = $('#ntext').value;
      if (!text.trim() && !tags.length) delete S.notes[ne.id];
      else S.notes[ne.id] = { t: ne.t, c: ne.c, tags, text, ts: Date.now() };
      ne = null; save(); render();
    }
    else if (a === 'ndel') { delete S.notes[ne.id]; ne = null; save(); render(); }
  }

  // ---------- события ----------
  root.addEventListener('click', (e) => {
    const t = e.target;
    if (t.id === 'fab' || t.id === 'zone') return toggle(true);
    if (t.id === 'nbtn') return openNoteFromPage();
    if (t.id === 'x') return toggle(false);
    if (t.id === 'ov') { if (!(mode === 'n' && ne)) toggle(false); return; }
    if (t.id === 'rs') return refresh();
    if (t.id === 'nfb') return newFolder();
    const tab = t.closest('[data-tab]');
    if (tab) return switchMode(tab.dataset.tab);
    if (t.closest('a')) { toggle(false); return; }
    const b = t.closest('button[data-a]');
    if (b) return act(b);
    const tag = t.closest('.tag');
    if (tag) { sel = '#' + tag.dataset.tag; render(); return; }
    const card = t.closest('.card');
    if (card && !t.closest('button,select,input,a,option')) {
      const l = S.lists.find((x) => x.id === card.dataset.id);
      if (l) { openView(l); return; }
    }
    const cc = t.closest('.cc');
    if (cc) {
      const ch = S.chans.find((x) => x.id === cc.dataset.id);
      if (ch) location.href = ch.h ? '/' + ch.h : '/channel/' + ch.c;
      return;
    }
    const row = t.closest('.row[data-id]');
    if (row && !t.classList.contains('ri')) { sel = row.dataset.id; view = null; ne = null; render(); }
  });

  root.addEventListener('focusout', (e) => { if (e.target.classList && e.target.classList.contains('ri')) commit(e.target); });
  root.addEventListener('input', (e) => { if (e.target.id === 'q') { q = e.target.value.trim().toLowerCase(); render(); $('#q').focus(); } });
  root.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t.classList && t.classList.contains('ri')) {
      if (e.key === 'Enter') t.blur();
      else if (e.key === 'Escape') { ed = null; render(); }
    } else if (t.id === 'nfi' && e.key === 'Enter') newFolder();
    else if (e.key === 'Escape' && open && !(mode === 'n' && ne)) toggle(false);
  });
  // не даём горячим клавишам YouTube перехватывать ввод в нашей панели
  ['keydown', 'keyup', 'keypress'].forEach((ev) => root.addEventListener(ev, (e) => e.stopPropagation()));

  root.addEventListener('dragstart', (e) => {
    const c = e.target.closest && e.target.closest('.card, .cc');
    if (c) { drag = c.dataset.id; e.dataTransfer.setData('text/plain', drag); e.dataTransfer.effectAllowed = 'move'; }
  });
  root.addEventListener('dragover', (e) => {
    const r = e.target.closest && e.target.closest('[data-drop]');
    if (r && drag) { e.preventDefault(); root.querySelectorAll('.over').forEach((x) => x.classList.remove('over')); r.classList.add('over'); }
  });
  root.addEventListener('drop', (e) => {
    const r = e.target.closest && e.target.closest('[data-drop]');
    if (r && drag) {
      e.preventDefault();
      const it = S.lists.find((x) => x.id === drag) || S.chans.find((x) => x.id === drag);
      const t = r.dataset.drop;
      if (it) it.f = t === 'none' ? null : t;
      save();
    }
    drag = null; render();
  });
  root.addEventListener('dragend', () => { drag = null; root.querySelectorAll('.over').forEach((x) => x.classList.remove('over')); });

  // ---------- слежение за страницей ----------
  function sync() {
    const z = $('#zone');
    z.hidden = open || inWide();
    z.classList.toggle('wide', isVideo());
    $('#nbtn').hidden = !isVideo();
    const pill = $('#pill');
    const on = !!(S.feedFilter && fol(S.feedFilter) && isSubs());
    pill.hidden = !on;
    if (on && pill.dataset.f !== S.feedFilter) {
      setHtml(pill, `<span>Лента: ${esc(path(S.feedFilter))}</span><button data-a="fx" title="Снять фильтр">✕</button>`);
      pill.dataset.f = S.feedFilter;
    }
  }

  let lastHref = '', tickT, popT;
  function tick() {
    if (!loaded) return;
    if (isPL()) scan();
    if (isCH()) scanChannelsDom();
    if (isSubs()) applyFeedFilter();
  }
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      if (open) toggle(false);
      if (isPL()) setTimeout(scan, 1500);
      if (isCH()) setTimeout(scanChannelsDom, 1500);
      applyFeedFilter();
    }
    sync();
  }, 700);
  document.addEventListener('fullscreenchange', sync);
  new MutationObserver(() => {
    clearTimeout(tickT); tickT = setTimeout(tick, 400);
    clearTimeout(popT); popT = setTimeout(savePopup, 120);
  }).observe(document.body, { childList: true, subtree: true });

  restore().then((d) => {
    if (d) S = Object.assign(S, d);
    loaded = true;
    if (!S.chans) S.chans = [];
    if (!S.notes) S.notes = {};
    render();
    sync();
    if (isPL()) setTimeout(scan, 1500);
  });
})();
