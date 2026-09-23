// Let Me AI That For You. Share link format:  ?ai=<provider>&q=<prompt>&lang=<en|he>
// Depends on: icons.js (icon, LOGOS), providers.js (PROVIDERS, HISTORY_POOL), i18n.js (STRINGS)

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

let lang = STRINGS[params.get('lang')] ? params.get('lang') : (navigator.language || '').startsWith('he') ? 'he' : 'en';

// ---- Pause support (play mode) ----
// One flag + a list of "resolve me on resume" callbacks. `pausableWait` is used in place of
// plain `sleep` throughout the animation, so every await in the sequence honors the pause.
let paused = false;
let resumeWaiters = [];
const waitForResume = () => new Promise(resolve => resumeWaiters.push(resolve));
const releasePause = () => { const waiters = resumeWaiters; resumeWaiters = []; waiters.forEach(fn => fn()); };

/** Sleep for `ms`, freezing the countdown while `paused` (checked every 100ms so a pause takes effect quickly). */
async function pausableWait(ms) {
  let remaining = ms;
  while (remaining > 0) {
    if (paused) { await waitForResume(); continue; }
    const chunk = Math.min(remaining, 100);
    const start = performance.now();
    await sleep(chunk);
    if (!paused) remaining -= performance.now() - start; // don't burn time that elapsed while paused
  }
}

/** Translate a key, filling {placeholders}. Arrays return a random entry. */
function t(key, vars = {}) {
  const s = STRINGS[lang][key];
  return (Array.isArray(s) ? pick(s) : s).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

/** Apply language + direction to static [data-i18n] elements. */
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
}

/** Copy text to clipboard; resolves true on success. */
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}

// =====================================================================
// Create mode
// =====================================================================

function initCreate() {
  $('create').hidden = false;
  let selected = 'chatgpt';

  // Provider radio tiles
  $('providers').innerHTML = Object.entries(PROVIDERS).map(([id, p]) => `
    <label class="provider">
      <input type="radio" name="ai" value="${id}" ${id === selected ? 'checked' : ''}>
      <span class="provider-logo" data-ai="${id}">${LOGOS[id]}</span><span>${p.name}</span>
    </label>`).join('');

  const updateNote = () => {
    const p = PROVIDERS[selected];
    $('noPrefillNote').hidden = p.prefill;
    $('noPrefillNote').textContent = t('noPrefill', { ai: p.name });
  };

  /** Build the shareable link from the current form state. */
  const buildLink = () => {
    const q = $('prompt').value.trim();
    if (!q) return;
    const url = `${location.href.split(/[?#]/)[0]}?${new URLSearchParams({ ai: selected, q, lang })}`;
    $('link').value = url;
    $('previewBtn').href = url;
    $('result').hidden = false;
  };

  $('providers').addEventListener('change', e => {
    selected = e.target.value;
    updateNote();
    if (!$('result').hidden) buildLink();
  });

  $('form').addEventListener('submit', e => {
    e.preventDefault();
    buildLink();
    $('link').select();
  });

  $('copyBtn').addEventListener('click', async () => {
    if (!(await copyText($('link').value))) return;
    $('copyBtn').textContent = t('copied');
    setTimeout(() => { $('copyBtn').textContent = t('copy'); }, 1500);
  });

  $('shareBtn').addEventListener('click', async () => {
    const url = $('link').value;
    if (!navigator.share) return open(`https://wa.me/?text=${encodeURIComponent(`${t('shareText')} ${url}`)}`, '_blank', 'noopener');
    try { await navigator.share({ title: t('title'), text: t('shareText'), url }); } catch { /* user cancelled */ }
  });

  $('langToggle').addEventListener('click', () => {
    lang = lang === 'he' ? 'en' : 'he';
    applyLang();
    $('langToggle').textContent = t('langToggle');
    updateNote();
    if (!$('result').hidden) buildLink();
  });

  $('langToggle').textContent = t('langToggle');
  updateNote();
  $('prompt').focus();
}

// =====================================================================
// Play mode — mock window templates (static markup only; the prompt is always set via textContent)
// =====================================================================

/** Shuffle a copy of an array. */
const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

/** Pick `n` random history titles, mixing types round-robin so every kind shows up. */
function pickHistory(n) {
  const decks = shuffle(Object.values(HISTORY_POOL)).map(shuffle);
  const out = [];
  for (let i = 0; out.length < n && i < n * decks.length; i++) {
    const item = decks[i % decks.length].pop();
    if (item) out.push(item);
  }
  return out;
}

/** Render [icon, label] pairs as buttons. */
const buttons = (items, cls) => items.map(([ic, label]) => `<span class="${cls}${label ? '' : ' icon-only'}">${icon(ic)}${label ? `<span>${label}</span>` : ''}</span>`).join('');

/** Chrome-like browser window with a new-tab page and the provider app. */
function browserTemplate(id, p) {
  const hour = new Date().getHours();
  const tod = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const current = Math.floor(Math.random() * 4); // highlighted "open" chat
  const shortcuts = ['chatgpt', 'claude', 'gemini', 'deepseek', 'perplexity', 'grok']
    .map(k => `<span class="ntp-tile"><i data-ai="${k}">${LOGOS[k]}</i>${PROVIDERS[k].name}</span>`).join('');

  return `
  <div class="win browser">
    <div class="tabstrip">
      <span class="lights"><i></i><i></i><i></i></span>
      <div class="tab active"><span id="tabIco" class="tab-ico">${icon('globe', 14)}</span><span id="tabTitle" class="tab-title">New Tab</span>${icon('x', 12)}</div>
      <div class="tab ghost"><span class="tab-ico">${icon('book', 14)}</span><span class="tab-title">How to be productive – 10 tips</span>${icon('x', 12)}</div>
      <span class="tab-new">${icon('plus', 16)}</span>
    </div>
    <div class="toolbar">
      <span class="nav">${icon('left')}${icon('right')}${icon('reload')}</span>
      <div id="omni" class="omni">
        <span id="omniIco" class="omni-ico">${icon('search', 15)}</span>
        <span class="omni-field"><span id="omniText"></span><b class="caret"></b><span id="omniPh" class="ph">Search or type a URL</span></span>
        <span class="omni-star">${icon('star', 15)}</span>
        <div id="omniDrop" class="omni-drop" hidden>
          <div class="omni-row active">${icon('globe', 15)}<span><b id="dropSite"></b> – <span class="muted">${p.name}</span></span></div>
          <div class="omni-row">${icon('search', 15)}<span><span id="dropQuery"></span> <span class="muted">– Search</span></span></div>
          <div class="omni-row">${icon('clock', 15)}<span class="muted">how to ask ai a question</span></div>
        </div>
      </div>
      <span class="tb-right"><i class="avatar">Y</i>${icon('dots')}</span>
      <div id="progress" class="progress"></div>
    </div>
    <div class="bookmarks">
      <span>${icon('folder', 14)} Work</span><span>${icon('folder', 14)} Recipes</span><span>${icon('bookmark', 14)} Cat videos</span><span>${icon('bookmark', 14)} Online courses I’ll finish someday</span>
    </div>
    <div class="viewport">
      <div id="ntp" class="ntp">
        <div class="ntp-brand">Search the web</div>
        <div class="ntp-search">${icon('search')}<span class="muted">Search or type a URL</span>${icon('mic')}</div>
        <div class="ntp-tiles">${shortcuts}</div>
      </div>

      <div id="app" class="app" data-ai="${id}" hidden>
        <aside class="sb">
          <div class="sb-top"><span class="sb-logo">${LOGOS[id]}</span><span class="sb-brand">${id === 'deepseek' ? 'deepseek' : p.name}</span>${icon('sidebar')}</div>
          <div class="sb-nav">${buttons(p.nav, 'sb-item')}</div>
          <div class="sb-label">${p.recents}</div>
          <div class="sb-list">${pickHistory(8).map((h, i) => `<span class="sb-hist${i === current ? ' current' : ''}">${h}</span>`).join('')}</div>
          <div class="sb-user"><i class="avatar">Y</i><span>You${p.plan ? `<small>${p.plan}</small>` : ''}</span></div>
        </aside>
        <section class="main">
          <header class="topbar">
            <span class="model">${p.model ? `${p.model}${icon('chevron', 14)}` : ''}</span>
            <span class="topbar-r">${icon('share', 16)}${icon('dots', 16)}</span>
          </header>
          <div class="center">
            <div id="greet" class="greet">
              <span class="greet-logo">${LOGOS[id]}</span>
              <h2>${p.greeting.replace('{tod}', tod)}</h2>
              ${p.subGreeting ? `<p>${p.subGreeting}</p>` : ''}
            </div>
            <div id="messages" class="messages"></div>
            <div id="composer" class="composer">
              <div class="composer-input"><span id="composerText"></span><b class="caret"></b><span class="ph">${p.placeholder}</span></div>
              <div class="composer-row">
                <span class="tools">${buttons(p.tools, 'tool')}</span>
                <span class="tools">
                  ${p.composerModel ? `<span class="tool model-pill">${p.composerModel}${icon('chevron', 14)}</span>` : ''}
                  ${buttons(p.toolsRight, 'tool')}
                  <span id="sendBtn" class="send">${icon('up', 18)}</span>
                </span>
              </div>
            </div>
            <div id="chips" class="chips">${buttons(p.chips, 'chip')}</div>
          </div>
          ${p.disclaimer ? `<footer class="disclaimer">${p.disclaimer}</footer>` : ''}
        </section>
      </div>
    </div>
  </div>`;
}

/** macOS terminal window running Claude Code. */
function terminalTemplate(p) {
  return `
  <div class="win term">
    <div class="term-bar"><span class="lights"><i></i><i></i><i></i></span><span class="term-title">you — ~/projects — zsh — 100×30</span></div>
    <div class="term-body">
      <div class="muted">Last login: ${new Date().toDateString()} on ttys001</div>
      <div id="omni" class="term-line"><span class="ps1">you@mac ~/projects %</span> <span id="omniText"></span><b class="caret"></b></div>
      <div id="cc" hidden>
        <div class="cc-box"><span class="cc-star">✻</span> Welcome to <b>Claude Code</b>!<br><br><span class="muted">&nbsp;&nbsp;/help for help, /status for your current setup<br><br>&nbsp;&nbsp;cwd: /Users/you/projects</span></div>
        <div class="muted cc-tips">Tips for getting started:<br>&nbsp;1. Ask Claude to create a new app or clone a repository<br>&nbsp;2. Use Claude to help with file analysis, editing, bash commands and git<br>&nbsp;3. Be as specific as you would with another engineer for the best results</div>
        <div id="messages" class="cc-messages"></div>
        <div id="composer" class="cc-input"><span class="cc-gt">&gt;</span> <span id="composerText"></span><b class="caret"></b><span class="ph">${p.placeholder}</span></div>
        <div class="cc-hint muted"><span>? for shortcuts</span><span>⏵⏵ accept edits on (shift+tab to cycle)</span></div>
      </div>
    </div>
  </div>`;
}

// =====================================================================
// Play mode — the animated tutorial
// =====================================================================

async function initPlay(id, prompt) {
  const p = PROVIDERS[id];
  const isTerm = p.kind === 'terminal';
  const vars = { ai: p.name, site: p.site, placeholder: p.placeholder };
  const wait = pausableWait; // reading time stays the same with reduced motion; only movement is shortened
  const stage = $('stage'), cursor = $('cursor');
  const cursorPos = { x: 0, y: 0 };
  let skipped = false;
  let cursorAnim;

  // Positions use the CSS `translate` property (not `transform`), so the click `scale` animation can't distort them.

  /** Place the cursor instantly (no animation). */
  const placeCursor = (x, y) => {
    Object.assign(cursorPos, { x, y });
    cursor.style.translate = `${x}px ${y}px`;
  };

  $('play').hidden = false;
  $('window').innerHTML = isTerm ? terminalTemplate(p) : browserTemplate(id, p);
  document.title = `${p.name} — ${t('title')}`;

  /** Glide the fake cursor onto `el`, at `xFrac` of its width (0 = left edge, 1 = right edge). */
  // Uses the Web Animations API so we await the real end of the glide — clicks/ripples always land exactly on the cursor.
  const moveTo = async (el, xFrac = 0.5, yFrac = 0.5) => {
    const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    const from = { ...cursorPos };
    const x = r.left + r.width * xFrac - s.left, y = r.top + r.height * yFrac - s.top;
    const duration = reducedMotion ? 0 : Math.min(1100, 450 + Math.hypot(x - from.x, y - from.y) * 0.9);
    cursorAnim?.cancel();
    placeCursor(x, y);
    cursorAnim = cursor.animate(
      [{ translate: `${from.x}px ${from.y}px` }, { translate: `${x}px ${y}px` }],
      { duration, easing: 'cubic-bezier(.45, .05, .25, 1)' },
    );
    await cursorAnim.finished.catch(() => {}); // cancelled by a newer move
    await wait(150);
  };

  /** Fake a click: cursor pulse + ripple + element press state. */
  const click = async el => {
    cursor.classList.add('clicking');
    el.classList.add('pressed');
    const ripple = Object.assign(document.createElement('span'), { className: 'ripple' });
    ripple.style.translate = `${cursorPos.x}px ${cursorPos.y}px`;
    stage.append(ripple);
    setTimeout(() => ripple.remove(), 600);
    await wait(180);
    cursor.classList.remove('clicking');
    el.classList.remove('pressed');
    await wait(250);
  };

  /** Pop a floating keycap next to the cursor (e.g. "Enter ⏎"). */
  const pressKey = async label => {
    const key = $('keycap');
    key.textContent = label;
    Object.assign(key.style, { left: `${cursorPos.x + 24}px`, top: `${cursorPos.y + 24}px` });
    key.hidden = false;
    key.classList.remove('press');
    void key.offsetWidth; // restart the CSS animation
    key.classList.add('press');
    await wait(650);
    key.hidden = true;
  };

  /** Type text char by char; long text types faster so it never drags on. `onChar` fires after each char. */
  const type = async (el, text, onChar) => {
    const chars = [...text]; // handles emoji / surrogate pairs
    const perChar = Math.max(8, Math.min(75, 3500 / chars.length));
    for (const ch of chars) {
      if (skipped) return;
      el.textContent += ch;
      onChar?.(el.textContent);
      await wait(perChar + Math.random() * perChar * 0.6);
    }
  };

  /** Swap the step caption (out → in with a highlighter swipe) and light up the step rail. */
  const step = async (n, key) => {
    const caption = $('caption');
    if (caption.classList.contains('in')) {
      caption.classList.replace('in', 'out');
      await wait(220);
    }
    $('stepNum').textContent = n;
    $('captionText').textContent = t(key, vars);
    caption.classList.remove('out');
    void caption.offsetWidth; // restart the CSS animation
    caption.classList.add('in');
    document.querySelectorAll('.rail i').forEach((dot, i) => {
      dot.classList.toggle('on', i < n);
      dot.classList.toggle('now', i === n - 1);
    });
  };

  /** Pause/resume every running animation (cursor glide, CSS loops, the composer's FLIP transition) via the WAAPI registry. */
  const setPaused = next => {
    paused = next;
    document.getAnimations().forEach(a => (next ? a.pause() : a.play()));
    $('pauseBtn').classList.toggle('is-paused', next);
    $('pauseBtn').setAttribute('aria-label', t(next ? 'resume' : 'pause'));
    $('pauseBtn').innerHTML = icon(next ? 'play' : 'pause', 18);
    if (!next) releasePause(); // wake up any wait() stuck at waitForResume()
  };
  setPaused(false);
  $('pauseBtn').addEventListener('click', () => setPaused(!paused));

  $('skipBtn').addEventListener('click', () => {
    skipped = true;
    if (paused) setPaused(false); // don't leave the sequence's dangling promise frozen forever
    showFinal(p, prompt, vars);
  });

  /** Park the cursor in the middle of the window (measured right before the first move, once layout is settled). */
  const parkCursor = () => {
    const s = stage.getBoundingClientRect();
    placeCursor(s.width / 2, s.height / 2);
    cursor.classList.add('ready');
  };

  const promptRtl = /[֐-ࣿ]/.test(prompt);

  // ---- Step 1: open the app ----
  await step(1, isTerm ? 'ccStep1' : 'step1');
  parkCursor();
  await wait(1400);
  if (skipped) return;
  parkCursor();
  await moveTo($('omni'), isTerm ? 0.3 : 0.2);
  await click($('omni'));
  $('omni').classList.add('focused');
  await type($('omniText'), p.site, text => {
    if (isTerm) return;
    $('omniDrop').hidden = false;
    $('dropSite').textContent = p.site;
    $('dropQuery').textContent = text;
  });
  if (skipped) return;
  await wait(450);
  await pressKey('Enter ⏎');
  $('omni').classList.remove('focused');

  if (isTerm) {
    await wait(300);
    $('cc').hidden = false;
  } else {
    $('omniDrop').hidden = true;
    $('omniText').textContent = `https://${p.site}/`;
    $('omniIco').innerHTML = icon('lock', 14);
    $('progress').classList.add('loading');
    $('tabIco').innerHTML = '<span class="spinner"></span>';
    await wait(1000);
    $('tabIco').innerHTML = LOGOS[id];
    $('tabTitle').textContent = p.name;
    $('ntp').hidden = true;
    $('app').hidden = false;
    $('progress').classList.remove('loading');
  }
  await wait(700);

  // ---- Step 2: focus the input ----
  if (skipped) return;
  await step(2, isTerm ? 'ccStep2' : 'step2');
  await wait(1400);
  await moveTo($('composer'), isTerm ? 0.1 : promptRtl ? 0.85 : 0.15, isTerm ? 0.5 : 0.3);
  await click($('composer'));
  $('composer').classList.add('focused');
  await wait(500);

  // ---- Step 3: type the prompt ----
  if (skipped) return;
  await step(3, 'step3');
  await wait(1000);
  await type($('composerText'), prompt, () => $('sendBtn')?.classList.add('ready'));
  if (skipped) return;
  await wait(700);

  // ---- Step 4: send ----
  await step(4, isTerm ? 'ccStep4' : 'step4');
  await wait(1200);
  if (isTerm) await pressKey('Enter ⏎');
  else {
    await moveTo($('sendBtn'));
    await click($('sendBtn'));
  }
  if (skipped) return;
  await showConversation(id, prompt, isTerm, wait, () => skipped, moveTo);

  if (!skipped) showFinal(p, prompt, vars);
}

/** After "sending": user bubble, thinking indicator, then a streamed snarky reply. */
async function showConversation(id, prompt, isTerm, wait, isSkipped, moveTo) {
  const composer = $('composer'), messages = $('messages');

  const add = (cls, html = '') => {
    const el = Object.assign(document.createElement('div'), { className: cls, innerHTML: html });
    messages.append(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  };

  // FLIP: measure the composer, switch to the chat layout, then animate it from its old spot so it glides instead of snapping
  const before = composer.getBoundingClientRect();
  composer.classList.remove('focused');
  $('composerText').textContent = '';
  $('sendBtn')?.classList.remove('ready');
  $('greet')?.remove();
  $('chips')?.remove();
  $('app')?.classList.add('chatting');
  const user = add(isTerm ? 'cc-user' : 'bubble');
  user.textContent = isTerm ? `> ${prompt}` : prompt;
  const dy = before.top - composer.getBoundingClientRect().top;
  if (dy) composer.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 550, easing: 'cubic-bezier(.2, .8, .2, 1)' });

  // Let the cursor drift off to the side to "watch", instead of hovering over empty space
  if (!isTerm) setTimeout(() => moveTo(messages, 0.9, 0.55), 250);

  const thinking = isTerm
    ? add('cc-think', '<span class="cc-spin">✻</span> <span>Pondering…</span> <span class="muted">(esc to interrupt)</span>')
    : add('thinking', '<i></i><i></i><i></i>');
  await wait(1600);
  thinking.remove();
  if (isSkipped()) return;

  const reply = add(isTerm ? 'cc-reply' : 'reply', isTerm ? '<span class="cc-dot">●</span> ' : `<span class="reply-logo" data-ai="${id}">${LOGOS[id]}</span>`);
  const text = reply.appendChild(document.createElement('span'));
  for (const word of t('aiReply').split(' ')) {
    if (isSkipped()) return;
    text.textContent += `${word} `;
    await wait(85);
  }
  await wait(3200); // time to actually read the reply
}

/** Show the "Was that so hard?" card and handle the redirect. */
function showFinal(p, prompt, vars) {
  if (!$('final').hidden) return;
  $('final').hidden = false;
  $('skipBtn').hidden = true;
  $('pauseBtn').hidden = true;
  $('finalTitle').textContent = t('finalTitle');
  $('finalSub').textContent = t('finalSub');
  confetti();

  const target = p.url(encodeURIComponent(prompt));
  const clip = p.copy ? p.copy(prompt) : prompt;
  $('goBtn').textContent = t(p.copy ? 'copyCmd' : p.prefill ? 'go' : 'copyGo', vars);
  $('goBtn').addEventListener('click', async () => {
    await copyText(clip); // backup even when the URL pre-fills
    location.href = target;
  });

  // Providers without URL prefill need a real user click (clipboard requires a gesture)
  if (!p.prefill) { $('finalNote').textContent = t(p.copy ? 'cmdHint' : 'pasteHint'); return; }

  let n = 6;
  const tick = () => {
    $('finalNote').textContent = t('redirecting', { n });
    if (n-- <= 0) location.href = target;
    else setTimeout(tick, 1000);
  };
  tick();
}

/** Sarcastic celebration. */
function confetti() {
  if (reducedMotion) return;
  const colors = ['#6c4cff', '#ff4c8b', '#ffb34c', '#22c55e', '#38bdf8'];
  for (let i = 0; i < 80; i++) {
    const c = Object.assign(document.createElement('i'), { className: 'confetti' });
    c.style.cssText = `left:${Math.random() * 100}vw;background:${pick(colors)};width:${6 + Math.random() * 6}px`;
    document.body.append(c);
    c.animate(
      [{ transform: 'translateY(-5vh) rotate(0)' }, { transform: `translate(${(Math.random() - 0.5) * 30}vw, 105vh) rotate(${Math.random() * 900}deg)` }],
      { duration: 1800 + Math.random() * 1600, delay: Math.random() * 300, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' },
    ).onfinish = () => c.remove();
  }
}

// =====================================================================
// Boot
// =====================================================================

applyLang();
const q = params.get('q');
const ai = params.get('ai');
if (q && PROVIDERS[ai]) initPlay(ai, q);
else initCreate();
