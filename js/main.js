/* =========================================================
   Chris Zhang — Personal Dossier
   - 評價：讀取 review/reviews.js 的 window.REVIEWS
   - 貼文：讀取 post/posts.js 的 window.POSTS
   - 榮譽：讀取 honor/honors.js 的 window.HONORS
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const esc = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');

  /* ---------- 報頭日期 ---------- */
  const now = new Date();
  $('#today').textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  $('#vol').textContent = now.getFullYear();
  $('#year').textContent = now.getFullYear();

  /* ---------- 導覽列：吸頂 + 目前區塊高亮 ---------- */
  const nav = $('#nav');
  const navLinks = [...nav.querySelectorAll('a[href^="#"]:not(.nav-logo)')];
  const onScroll = () => {
    nav.classList.toggle('stuck', nav.getBoundingClientRect().top <= 0 && window.scrollY > 10);
    let current = '';
    for (const a of navLinks) {
      const sec = $(a.getAttribute('href'));
      if (sec && sec.getBoundingClientRect().top < window.innerHeight * 0.55) current = a.getAttribute('href');
    }
    navLinks.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === current));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 捲動淡入 ---------- */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('shown'); io.unobserve(e.target); }
      }), { threshold: 0.12 })
    : null;
  document.querySelectorAll('.reveal').forEach((el) => (io ? io.observe(el) : el.classList.add('shown')));

  /* =========================================================
     榮譽：第一項直接顯示，其餘點箭頭展開
     ========================================================= */
  const honors = (Array.isArray(window.HONORS) ? window.HONORS : []).filter((h) => h && h.title);
  const honorList = $('#honorList');
  const honorMore = $('#honorMore');
  if (honorList && honors.length) {
    honorList.innerHTML = honors.map((h, i) => {
      const title = h.link
        ? `<a href="${esc(h.link)}" target="_blank" rel="noopener">${esc(h.title)}</a>`
        : esc(h.title);
      const meta = [h.event, h.year].filter(Boolean).map(esc).join(' · ');
      return `<li${i ? ' class="extra"' : ''}><span class="h-title">${title}</span>${meta ? `<span class="h-meta">${meta}</span>` : ''}</li>`;
    }).join('');
    const extra = honors.length - 1;
    if (extra > 0) {
      const label = $('#honorMoreTxt');
      const setLabel = (open) => { label.textContent = open ? 'SHOW LESS' : `+${extra} MORE`; };
      setLabel(false);
      honorMore.hidden = false;
      honorMore.addEventListener('click', () => {
        const open = !honorList.classList.contains('open');
        honorList.classList.toggle('open', open);
        honorMore.setAttribute('aria-expanded', String(open));
        setLabel(open);
      });
    }
  }

  /* =========================================================
     評價便利貼
     ========================================================= */
  const NOTE_COLORS = {
    yellow: '#fff2a1', pink: '#ffc9d6', green: '#d5ecb0', blue: '#c9e6ff', orange: '#ffd3a8', purple: '#e3d4ff'
  };
  const COLOR_ORDER = Object.keys(NOTE_COLORS);
  const reviews = (Array.isArray(window.REVIEWS) ? window.REVIEWS : []).filter((r) => r && r.text);

  const board = $('#board');
  const pile = $('#pile');
  const stage = $('#stage');
  const countEl = $('#noteCount');
  let idx = -1;          // 目前顯示第幾張
  let current = null;    // 目前的便利貼 DOM
  let busy = false;

  const colorOf = (r, i) => NOTE_COLORS[r.color] || r.color || NOTE_COLORS[COLOR_ORDER[i % COLOR_ORDER.length]];
  // 固定的隨機角度（同一張每次都一樣）
  const tilt = (i, range) => ((Math.sin(i * 12.9898) * 43758.5453) % 1) * range;

  function buildPile() {
    pile.innerHTML = '';
    const remaining = reviews.length - (idx + 1);
    const show = Math.min(Math.max(remaining, 0), 6);
    if (show === 0) {
      pile.innerHTML = '<span class="empty">That\'s all!<br>Click to start over</span>';
      return;
    }
    for (let k = show - 1; k >= 0; k--) {
      const i = idx + 1 + k;              // k=0 是最上面那張（下一張要抽的）
      const d = document.createElement('span');
      d.className = 'crumple';
      const t = `translate(${tilt(i + 3, 18).toFixed(1)}px, ${tilt(i + 7, 14).toFixed(1)}px) rotate(${tilt(i, 26).toFixed(1)}deg)`;
      d.style.setProperty('--t', t);
      d.style.transform = t;
      d.style.background = colorOf(reviews[i], i);
      pile.appendChild(d);
    }
  }

  function makeNote(i) {
    const r = reviews[i];
    const fig = document.createElement('figure');
    fig.className = 'note';
    fig.style.background = colorOf(r, i);
    fig.style.setProperty('--r', `${tilt(i + 11, 6).toFixed(1)}deg`);
    fig.innerHTML = `
      <blockquote>${esc(r.text)}</blockquote>
      <figcaption><b>— ${esc(r.name || 'Anonymous')}</b>${r.role ? `<span>${esc(r.role)}</span>` : ''}${r.date ? `<span> · ${esc(r.date)}</span>` : ''}</figcaption>`;
    return fig;
  }

  function go(dir) {
    if (busy || !reviews.length) return;
    let next = idx + dir;
    if (next >= reviews.length) next = 0;           // 看完後從頭開始
    if (next < 0) next = reviews.length - 1;
    busy = true;

    // 抽卡動畫：便利貼堆最上面那張先滑走
    const top = dir > 0 ? pile.querySelector('.crumple:last-child') : null;
    if (top) top.classList.add('leave');

    if (current) {
      const old = current;
      old.classList.remove('idle', 'in-next', 'in-prev');
      old.classList.add(dir > 0 ? 'out-next' : 'out-prev');
      setTimeout(() => old.remove(), 460);
    }

    setTimeout(() => {
      idx = next;
      current = makeNote(idx);
      current.classList.add(dir > 0 ? 'in-next' : 'in-prev');
      stage.appendChild(current);
      current.addEventListener('animationend', function done() {
        current.removeEventListener('animationend', done);
        current.classList.remove('in-next', 'in-prev');
        current.classList.add('idle');
        busy = false;
      });
      setTimeout(() => { busy = false; }, 1000); // 保險
      buildPile();
      countEl.textContent = `${pad(idx + 1)} / ${pad(reviews.length)}`;
    }, top ? 260 : 60);
  }

  if (!reviews.length) {
    board.innerHTML = '<p class="board-empty">No testimonials yet — stay tuned ✎</p>';
  } else {
    buildPile();
    countEl.textContent = `00 / ${pad(reviews.length)}`;
    pile.addEventListener('click', () => go(1));
    $('#nextNote').addEventListener('click', () => go(1));
    $('#prevNote').addEventListener('click', () => go(-1));
    board.tabIndex = -1;
    board.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    });
    // 手機左右滑
    let sx = null;
    stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      sx = null;
    });
    // 捲到評價區時自動抽第一張
    const autoFirst = () => { if (idx === -1) go(1); };
    if ('IntersectionObserver' in window) {
      const o = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { autoFirst(); o.disconnect(); } }, { threshold: 0.4 });
      o.observe(board);
    } else autoFirst();
  }

  /* =========================================================
     貼文
     ========================================================= */
  const PAGE_SIZE = 7; // 頭條 1 + 3×2
  const posts = (Array.isArray(window.POSTS) ? window.POSTS : [])
    .filter((p) => p && p.title)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const list = $('#postList');
  const moreBtn = $('#morePosts');
  let shown = 0;

  const fmtDate = (d) => {
    if (!d) return '';
    const t = new Date(d);
    return isNaN(t) ? d : t.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  };
  const imgSrc = (src) => {
    if (!src) return '';
    if (/^(https?:)?\/\//.test(src) || src.startsWith('img/') || src.startsWith('./') || src.startsWith('/')) return src;
    return 'img/' + src; // 只寫檔名時，自動到 img/ 找
  };

  function renderPosts() {
    const slice = posts.slice(shown, shown + PAGE_SIZE);
    slice.forEach((p, k) => {
      const a = document.createElement(p.link ? 'a' : 'article');
      a.className = 'post' + (shown + k === 0 ? ' lead' : '');
      if (p.link) { a.href = p.link; a.target = '_blank'; a.rel = 'noopener'; }
      const src = imgSrc(p.image);
      a.innerHTML = `
        <div class="post-meta"><span>${esc(fmtDate(p.date))}</span>${p.tag ? `<span class="tag">${esc(p.tag)}</span>` : ''}</div>
        <div class="post-img">${src ? `<img src="${esc(src)}" alt="${esc(p.title)}" data-label="PHOTO" loading="lazy">` : '<div class="ph">PHOTO</div>'}</div>
        <h3>${esc(p.title)}</h3>
        ${p.summary ? `<p>${esc(p.summary)}</p>` : ''}
        ${p.link ? '<span class="read">READ MORE →</span>' : ''}`;
      list.appendChild(a);
    });
    shown += slice.length;
    moreBtn.hidden = shown >= posts.length;
  }

  if (!posts.length) list.innerHTML = '<p class="posts-empty">NO POSTS YET</p>';
  else renderPosts();
  moreBtn.addEventListener('click', renderPosts);
})();
