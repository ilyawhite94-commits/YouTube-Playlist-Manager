(() => {
  if (window.__ytpf) return;
  window.__ytpf = true;

  const KEY = 'ytpf';
  let S = { folders: [], lists: [], hidden: [] };
  let sel = 'none', ed = null, q = '', open = false, drag = null, view = null;

  const CSS = `
:host{all:initial;--bg:#fff;--side:#f2f2f2;--ink:#0f0f0f;--mut:#606060;--line:#d9d9d9;--acc:#065fd4;--accink:#fff;--hov:#e6e6e6;--sel:#fff;--drop:#cfe0fb;font:16px/1.4 Roboto,Arial,sans-serif;color:var(--ink)}
:host-context(html[dark]){--bg:#212121;--side:#181818;--ink:#f1f1f1;--mut:#aaa;--line:#3d3d3d;--acc:#3ea6ff;--accink:#0f0f0f;--hov:#303030;--sel:#2b2b2b;--drop:#26405f}
*{box-sizing:border-box}
[hidden]{display:none!important}
button,input,select{font:inherit;color:inherit}
button{cursor:pointer;border:1px solid var(--line);background:var(--bg);border-radius:8px;padding:6px 12px}
button:hover{background:var(--hov)}
.pri{background:var(--acc);color:var(--accink);border-color:var(--acc);font-weight:500}
.pri:hover{background:var(--acc);opacity:.9}
input,select{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:6px 8px;max-width:100%}
#zone{position:fixed;right:0;bottom:0;width:260px;height:120px;z-index:2147483000;display:flex;align-items:flex-end;justify-content:flex-end;padding:16px;background:transparent}
#fab{font-size:28px;padding:20px 40px;border-radius:50px;background:var(--hov);color:var(--ink);box-shadow:0 4px 16px rgba(0,0,0,.45);opacity:0;transform:scale(.9);transition:opacity .15s,transform .15s}
#zone:hover #fab{opacity:1;transform:scale(1)}
#fab:hover{background:var(--line)}
#ov{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;padding-bottom:3vh}
#pn{background:var(--bg);width:95vw;height:94vh;border-radius:14px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.5)}
header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--line)}
header b{font-size:20px;flex:1}
#st{color:var(--mut);font-size:13px}
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
#q{width:100%;margin-bottom:10px}
.card{display:flex;gap:10px;align-items:center;justify-content:space-between;border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin-bottom:8px;cursor:pointer}
.ti{min-width:0;flex:1}
.ti b{font-weight:500;font-size:21px;line-height:1.3;overflow-wrap:anywhere}
.m{color:var(--mut);font-size:14px}
.ca{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
.ca a{color:var(--acc);text-decoration:none;font-weight:500;white-space:nowrap}
.ca a:hover{text-decoration:underline}
.ca select{max-width:160px}
.ca .ib{padding:2px 8px;border:0;background:transparent;color:var(--mut)}
.ri{width:100%}
.empty{color:var(--mut);padding:20px 4px}
.card{user-select:none}
.ri{user-select:text}
.pbar{display:flex;align-items:center;gap:12px;margin-bottom:10px}
.pbar b{flex:1;font-size:24px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pbar a{color:var(--acc);text-decoration:none;font-weight:500}
.lg{display:grid;grid-template-columns:repeat(auto-fill,minmax(440px,1fr));gap:12px}
.lg .card{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:0;padding:12px 14px}
.cm{min-width:0;display:flex;flex-direction:column;gap:4px}
.pv{display:grid;gap:6px}
.pv img,.pv i{width:100%;aspect-ratio:4/3;border-radius:8px;object-fit:cover;background:var(--hov);display:block}
#x{font-size:30px;line-height:1;padding:10px 24px}
.pbar button[data-a="back"]{font-size:20px;font-weight:500;padding:12px 26px}
.lg .ca{justify-content:flex-start}
.vg{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
.vc{display:block;text-decoration:none;color:var(--ink)}
.vc .th{position:relative;aspect-ratio:16/9;background:var(--hov);border-radius:10px;overflow:hidden}
.vc img{width:100%;height:100%;object-fit:cover;display:block}
.vc .du{position:absolute;right:6px;bottom:6px;background:rgba(0,0,0,.8);color:#fff;font-size:13px;padding:1px 5px;border-radius:4px}
.vt{margin-top:6px;font-weight:500;font-size:15px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.vc:hover .vt{color:var(--acc)}
.vc.off{opacity:.5}
`;

  const HTML = `
<style>${CSS}</style>
<div id="zone"><button id="fab">📁 Папки</button></div>
<div id="ov" hidden>
  <div id="pn">
    <header><b>Папки плейлистов</b><span id="st"></span><button id="rs">Обновить со страницы</button><button id="x" aria-label="Закрыть">✕</button></header>
    <div id="body">
      <aside>
        <div id="tree"></div>
        <div class="nf"><input id="nfi" placeholder="Новая папка"><button id="nfb" class="pri">+</button></div>
        <div class="hint" id="nfh"></div>
        <div style="flex:1"></div>
        <button id="rh" hidden>Вернуть удалённые</button>
      </aside>
      <section>
        <div class="crumb" id="crumb"></div>
        <input id="q" type="search" placeholder="Поиск по названию">
        <div id="cards"></div>
      </section>
    </div>
  </div>
</div>`;

  const host = document.createElement('div');
  host.id = 'ytpf-host';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = HTML;
  document.documentElement.appendChild(host);

  const $ = (s) => root.querySelector(s);
  const uid = () => Math.random().toString(36).slice(2, 10);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fol = (id) => S.folders.find((f) => f.id === id);
  const save = () => { try { chrome.storage.local.set({ [KEY]: S }); } catch (e) {} };
  const inWide = () => !!document.fullscreenElement || !!document.querySelector('ytd-watch-flexy[theater], ytd-watch-flexy[fullscreen]');
  const isPL = () => location.pathname === '/feed/playlists' || /\/playlists\/?$/.test(location.pathname);

  function ids(id) { let r = [id]; S.folders.filter((f) => f.p === id).forEach((f) => (r = r.concat(ids(f.id)))); return r; }
  function path(id) { const a = []; let f = fol(id); while (f) { a.unshift(f.name); f = fol(f.p); } return a.join(' / '); }
  const count = (id) => { const s = ids(id); return S.lists.filter((l) => s.includes(l.f)).length; };

  function tree(p, d) {
    return S.folders.filter((f) => f.p === p).map((f) =>
      `<div class="row ${sel === f.id ? 'on' : ''}" data-id="${f.id}" data-drop="${f.id}" style="padding-left:${12 + d * 22}px">` +
      (ed === f.id
        ? `<input class="ri" value="${esc(f.name)}">`
        : `<span class="n"><span class="ic">📁</span> ${esc(f.name)}</span><span class="c">${count(f.id)}</span><span class="act"><button data-a="rf" title="Переименовать">✎</button><button data-a="df" title="Удалить папку">✕</button></span>`) +
      `</div>` + tree(f.id, d + 1)).join('');
  }

  function opts(cur) {
    return `<option value="">Без папки</option>` + S.folders.map((f) => `<option value="${f.id}" ${cur === f.id ? 'selected' : ''}>${esc(path(f.id))}</option>`).join('');
  }

  async function authHeaders() {
    const m = document.cookie.match(/(?:^|;\s*)(?:__Secure-3PAPISID|SAPISID)=([^;]+)/);
    if (!m) return {};
    const ts = Math.floor(Date.now() / 1000);
    const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(ts + ' ' + m[1] + ' https://www.youtube.com'));
    const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    return { Authorization: 'SAPISIDHASH ' + ts + '_' + hex, 'X-Origin': 'https://www.youtube.com', 'X-Goog-AuthUser': '0' };
  }

  function vcard(v, it) {
    return `<a class="vc${it.ok ? '' : ' off'}" href="/watch?v=${it.id}&list=${encodeURIComponent(v.l)}&index=${it.i}"><div class="th"><img loading="lazy" src="https://i.ytimg.com/vi/${it.id}/mqdefault.jpg" alt="">${it.d ? `<span class="du">${esc(it.d)}</span>` : ''}</div><div class="vt">${esc(it.t)}</div><div class="m">${esc(it.c)}</div></a>`;
  }

  function takeVideos(v, data) {
    let token = null;
    const fresh = [];
    (function walk(o) {
      if (!o || typeof o !== 'object') return;
      const r = o.playlistVideoRenderer;
      if (r && r.videoId) {
        const t = r.title ? (r.title.simpleText || (r.title.runs || []).map((x) => x.text).join('')) : '';
        const c = r.shortBylineText && r.shortBylineText.runs && r.shortBylineText.runs[0] ? r.shortBylineText.runs[0].text : '';
        fresh.push({ id: r.videoId, t, c, d: r.lengthText ? r.lengthText.simpleText || '' : '', ok: r.isPlayable !== false, i: v.items.length + fresh.length + 1 });
      }
      const ci = o.continuationItemRenderer;
      if (ci && ci.continuationEndpoint && ci.continuationEndpoint.continuationCommand) token = ci.continuationEndpoint.continuationCommand.token;
      for (const k in o) walk(o[k]);
    })(data);
    v.items = v.items.concat(fresh);
    if (view === v) {
      const g = root.querySelector('.vg');
      if (g) g.insertAdjacentHTML('beforeend', fresh.map((it) => vcard(v, it)).join(''));
      const msg = $('#vmsg'); if (msg && v.items.length) msg.hidden = true;
      const st = $('#vst'); if (st) st.textContent = 'Загружено: ' + v.items.length + '…';
    }
    return token;
  }

  async function loadPlaylist(v) {
    let failed = false;
    try {
      const html = await (await fetch('/playlist?list=' + encodeURIComponent(v.l) + '&hl=ru', { credentials: 'include' })).text();
      const m = html.match(/ytInitialData["\]]*\s*=\s*(\{.+?\});\s*<\/script>/s);
      if (!m) throw new Error('no data');
      const key = (html.match(/"INNERTUBE_API_KEY":"([^"]+)"/) || [])[1];
      const ver = (html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/) || [])[1] || '2.20250101.00.00';
      let token = takeVideos(v, JSON.parse(m[1]));
      while (token && view === v && v.items.length < 3000) {
        const resp = await fetch('/youtubei/v1/browse?prettyPrint=false' + (key ? '&key=' + key : ''), {
          method: 'POST',
          credentials: 'include',
          headers: Object.assign({ 'Content-Type': 'application/json' }, await authHeaders()),
          body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: ver, hl: 'ru' } }, continuation: token }),
        });
        if (!resp.ok) break;
        token = takeVideos(v, await resp.json());
      }
    } catch (e) { failed = true; }
    v.done = true;
    if (view !== v) return;
    const st = $('#vst'); if (st) st.textContent = v.items.length + ' видео';
    const msg = $('#vmsg');
    if (msg) {
      if (!v.items.length) { msg.hidden = false; msg.textContent = failed ? 'Не удалось загрузить список видео. Откройте плейлист на YouTube.' : 'В плейлисте нет видео или он недоступен.'; }
      else if (failed) { msg.hidden = false; msg.textContent = 'Список загружен не полностью.'; }
    }
  }

  function openView(l) {
    const v = { l: l.l, t: l.t, items: [], done: false };
    view = v;
    $('#q').hidden = true;
    const id = encodeURIComponent(l.l);
    $('#cards').innerHTML = `<div class="pbar"><button data-a="back">← К списку</button><b>${esc(l.t)}</b><span class="m" id="vst"></span><a href="/playlist?list=${id}">Открыть на YouTube</a></div><div class="vg"></div><div class="empty" id="vmsg">Загружаю список видео…</div>`;
    loadPlaylist(v);
  }

  const PREVIEWS = 4;

  function pvHtml(p) {
    const ids = p.pv || [];
    const done = (p.pvv || 0) >= PREVIEWS;
    let h = `<div class="pv" data-pl="${p.id}"${done ? '' : ' data-need="1"'} style="grid-template-columns:repeat(${PREVIEWS},1fr)">`;
    for (let i = 0; i < (done ? ids.length : PREVIEWS); i++) h += ids[i] ? `<img draggable="false" loading="lazy" src="https://i.ytimg.com/vi/${ids[i]}/mqdefault.jpg" alt="">` : '<i></i>';
    return h + '</div>';
  }

  const pvQ = [], pvTried = new Set();
  let pvBusy = 0;
  function pvEnqueue(l) {
    if (pvTried.has(l.l) || (l.pvv || 0) >= PREVIEWS) return;
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
  const pvFail = {};
  function pvRetry(l) {
    pvFail[l.l] = (pvFail[l.l] || 0) + 1;
    if (pvFail[l.l] <= 3) setTimeout(() => { pvTried.delete(l.l); pvEnqueue(l); }, 6000 * pvFail[l.l]);
  }
  async function pvFetch(l) {
    try {
      const html = await (await fetch('/playlist?list=' + encodeURIComponent(l.l) + '&hl=ru', { credentials: 'include' })).text();
      const m = html.match(/ytInitialData["\]]*\s*=\s*(\{.+?\});\s*<\/script>/s);
      if (!m) { pvRetry(l); return; }
      const ids = [];
      (function walk(o) {
        if (!o || typeof o !== 'object' || ids.length >= PREVIEWS) return;
        const r = o.playlistVideoRenderer;
        if (r && r.videoId) ids.push(r.videoId);
        for (const k in o) walk(o[k]);
      })(JSON.parse(m[1]));
      l.pv = ids;
      l.pvv = PREVIEWS;
      save();
      const e = root.querySelector('.pv[data-pl="' + l.id + '"]');
      if (e) e.outerHTML = pvHtml(l);
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

  function render() {
    if (sel !== 'all' && sel !== 'none' && !fol(sel)) sel = 'all';
    $('#tree').innerHTML =
      `<div class="row ${sel === 'all' ? 'on' : ''}" data-id="all"><span class="n"><span class="ic">🗂</span> Все плейлисты</span><span class="c">${S.lists.length}</span></div>` +
      `<div class="row ${sel === 'none' ? 'on' : ''}" data-id="none" data-drop="none"><span class="n"><span class="ic">📥</span> Без папки</span><span class="c">${S.lists.filter((l) => !l.f).length}</span></div>` +
      tree(null, 0);
    const real = fol(sel);
    $('#crumb').textContent = sel === 'all' ? 'Все плейлисты' : sel === 'none' ? 'Без папки' : path(sel);
    $('#nfh').textContent = real ? `Новая папка будет внутри «${real.name}».` : 'Новая папка будет в корне.';
    $('#rh').hidden = !S.hidden.length;
    let L = S.lists;
    if (sel === 'none') L = L.filter((l) => !l.f);
    else if (real) { const s = ids(sel); L = L.filter((l) => s.includes(l.f)); }
    if (q) L = L.filter((l) => l.t.toLowerCase().includes(q));
    if (view) { $('#q').hidden = true; return; }
    $('#q').hidden = false;
    $('#cards').innerHTML = L.length
      ? '<div class="lg">' + L.map((p) => `<div class="card" draggable="true" data-id="${p.id}" title="Нажмите, чтобы открыть список видео"><div class="cm"><div class="ti">` +
          (ed === p.id ? `<input class="ri" value="${esc(p.t)}">` : `<b>${esc(p.t)}</b>`) +
          `<div class="m">${esc(path(p.f) || 'Без папки')}</div></div></div>${pvHtml(p)}</div>`).join('') + '</div>'
      : `<div class="empty">${S.lists.length ? 'Здесь пока пусто. Перетащите сюда плейлисты слева направо или выберите папку в списке у карточки.' : 'Плейлисты пока не найдены. Прокрутите страницу вниз, чтобы YouTube загрузил их, и нажмите «Обновить со страницы».'}</div>`;
    root.querySelectorAll('.pv[data-need]').forEach((e) => pvObs.observe(e));
    const i = root.querySelector('.ri');
    if (i) { i.focus(); i.select(); }
  }

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
      if (ex) { if (t && ex.t.startsWith('Плейлист …')) { ex.t = t; } }
      else { S.lists.push({ id: uid(), l: id, t: t || 'Плейлист …' + id.slice(-6), f: null }); n++; }
    });
    if (n) { save(); render(); }
    return n;
  }

  function toggle(v) {
    open = v;
    $('#ov').hidden = !v;
    $('#zone').hidden = v || inWide();
    if (!v) { view = null; render(); }
    if (v) { sel = 'none'; view = null; const n = isPL() ? scan() : 0; render(); $('#st').textContent = n ? `Найдено новых: ${n}` : ''; }
  }

  function commit(el) {
    const id = el.closest('[data-id]').dataset.id, v = el.value.trim();
    if (ed !== id) return;
    ed = null;
    const f = fol(id);
    if (f) { if (v) f.name = v; } else { const l = S.lists.find((x) => x.id === id); if (l && v) l.t = v; }
    save(); render();
  }

  function newFolder() {
    const v = $('#nfi').value.trim();
    if (!v) return;
    S.folders.push({ id: uid(), name: v, p: fol(sel) ? sel : null });
    $('#nfi').value = '';
    save(); render();
  }

  root.addEventListener('click', (e) => {
    const t = e.target, b = t.closest('button[data-a]'), row = t.closest('[data-id]');
    if (t.id === 'fab' || t.id === 'zone') return toggle(true);
    if (t.id === 'ov' || t.id === 'x') return toggle(false);
    if (t.id === 'rs') { if (!isPL()) { $('#st').textContent = 'Откройте вкладку «Плейлисты»'; return; } const n = scan(); $('#st').textContent = `Найдено новых: ${n}`; return; }
    if (t.id === 'nfb') return newFolder();
    if (t.id === 'rh') { S.hidden = []; save(); scan(); render(); return; }
    if (t.closest('a')) { toggle(false); return; }
    if (b && b.dataset.a === 'back') { view = null; render(); return; }
    if (b && row) {
      const id = row.dataset.id, a = b.dataset.a;
      if (a === 'rf' || a === 'et') { ed = id; render(); }
      if (a === 'dp') { const l = S.lists.find((x) => x.id === id); if (l) S.hidden.push(l.l); S.lists = S.lists.filter((x) => x.id !== id); save(); render(); }
      if (a === 'df') {
        const f = fol(id);
        S.folders.forEach((x) => { if (x.p === id) x.p = f.p; });
        S.lists.forEach((l) => { if (l.f === id) l.f = f.p; });
        S.folders = S.folders.filter((x) => x.id !== id);
        if (sel === id) sel = f.p || 'all';
        save(); render();
      }
      return;
    }
    const card = t.closest('.card');
    if (card && !t.closest('button,select,input,a,option')) {
      const l = S.lists.find((x) => x.id === card.dataset.id);
      if (l) { openView(l); return; }
    }
    if (row && row.classList.contains('row') && !t.classList.contains('ri')) { sel = row.dataset.id; view = null; render(); }
  });

  root.addEventListener('change', (e) => {
    if (e.target.dataset && e.target.dataset.a === 'mv') {
      const l = S.lists.find((x) => x.id === e.target.closest('[data-id]').dataset.id);
      l.f = e.target.value || null; save(); render();
    }
  });
  root.addEventListener('focusout', (e) => { if (e.target.classList && e.target.classList.contains('ri')) commit(e.target); });
  root.addEventListener('input', (e) => { if (e.target.id === 'q') { q = e.target.value.trim().toLowerCase(); render(); $('#q').focus(); } });

  root.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t.classList && t.classList.contains('ri')) {
      if (e.key === 'Enter') t.blur();
      else if (e.key === 'Escape') { ed = null; render(); }
    } else if (t.id === 'nfi' && e.key === 'Enter') newFolder();
    else if (e.key === 'Escape' && open) toggle(false);
  });
  // не даём горячим клавишам YouTube перехватывать ввод в нашей панели
  ['keydown', 'keyup', 'keypress'].forEach((ev) => root.addEventListener(ev, (e) => e.stopPropagation()));

  root.addEventListener('dragstart', (e) => {
    const c = e.target.closest && e.target.closest('.card');
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
      const l = S.lists.find((x) => x.id === drag);
      const t = r.dataset.drop;
      if (l) l.f = t === 'none' ? null : t;
      save();
    }
    drag = null; render();
  });
  root.addEventListener('dragend', () => { drag = null; root.querySelectorAll('.over').forEach((x) => x.classList.remove('over')); });

  // слежение за страницей: кнопка только на вкладке плейлистов, новые плейлисты подхватываются сами
  let lastHref = '', tm;
  setInterval(() => {
    if (location.href !== lastHref) {
      lastHref = location.href;
      if (open) toggle(false);
      if (isPL()) setTimeout(scan, 1500);
    }
    $('#zone').hidden = open || inWide();
  }, 700);
  document.addEventListener('fullscreenchange', () => { $('#zone').hidden = open || inWide(); });
  new MutationObserver(() => {
    if (!isPL()) return;
    clearTimeout(tm);
    tm = setTimeout(scan, 1000);
  }).observe(document.body, { childList: true, subtree: true });

  chrome.storage.local.get(KEY).then((r) => {
    if (r[KEY]) S = Object.assign(S, r[KEY]);
    render();
    if (isPL()) setTimeout(scan, 1500);
  });
})();
