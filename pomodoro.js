/* Pomodoro widget cho hoc voi hanh — tự chèn HTML/CSS, không cần sửa các trang khác
   ngoài việc thêm <script src="pomodoro.js" defer></script> trước </body>. */
(function () {
  'use strict';

  var STORAGE_KEY = 'hvh_pomodoro_v1';

  var TXT = {
    vi: {
      title: 'Pomodoro',
      modes: { work: 'Làm việc', short: 'Nghỉ ngơi ngắn', long: 'Nghỉ ngơi dài' },
      start: 'Bắt đầu',
      pause: 'Tạm dừng',
      resetLabel: 'Đặt lại',
      unit: 'phút',
      collapse: 'Thu nhỏ',
      expand: 'Mở rộng',
      hide: 'Ẩn',
      show: 'Hiện Pomodoro'
    },
    en: {
      title: 'Pomodoro',
      modes: { work: 'Working', short: 'Short break', long: 'Long break' },
      start: 'Start',
      pause: 'Pause',
      resetLabel: 'Reset',
      unit: 'min',
      collapse: 'Minimize',
      expand: 'Expand',
      hide: 'Hide',
      show: 'Show Pomodoro'
    }
  };

  var PRESETS = [15, 20, 25, 45, 60];
  var DEFAULT_MIN = { work: 25, short: 5, long: 15 };

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }
  function saveState(patch) {
    var s = loadState();
    Object.assign(s, patch);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }

  var saved = loadState();

  var state = {
    lang: saved.lang === 'en' ? 'en' : 'vi',
    mode: saved.mode || 'work',
    minutes: Object.assign({}, DEFAULT_MIN, saved.minutes || {}),
    remaining: typeof saved.remaining === 'number' ? saved.remaining : DEFAULT_MIN.work * 60,
    running: false,
    collapsed: !!saved.collapsed,
    hidden: !!saved.hidden,
    pos: saved.pos || null
  };

  var CSS = ''
    + '.pomo-widget{position:fixed;z-index:9999;width:300px;max-width:calc(100vw - 16px);background:var(--surface,#fff);'
    + 'border:1.5px solid var(--stroke,#1B1B28);border-radius:var(--radius,16px);'
    + 'box-shadow:5px 5px 0 0 var(--stroke,#1B1B28);font-family:var(--font-body,sans-serif);'
    + 'color:var(--ink,#000);user-select:none;}'
    + '.pomo-widget.pomo-collapsed{width:auto;}'
    + '.pomo-header{display:flex;align-items:center;gap:8px;padding:10px 12px;'
    + 'background:var(--primary,#C0BFF9);border-bottom:1.5px solid var(--stroke,#1B1B28);'
    + 'border-radius:calc(var(--radius,16px) - 1.5px) calc(var(--radius,16px) - 1.5px) 0 0;cursor:grab;}'
    + '.pomo-collapsed .pomo-header{border-bottom:none;border-radius:calc(var(--radius,16px) - 1.5px);}'
    + '.pomo-header:active{cursor:grabbing;}'
    + '.pomo-grip{opacity:.6;font-size:14px;line-height:1;}'
    + '.pomo-title{font-family:var(--font-display,inherit);font-weight:700;flex:1;font-size:.95rem;}'
    + '.pomo-header button{font-family:inherit;border:1.5px solid var(--stroke,#1B1B28);'
    + 'background:var(--surface,#fff);border-radius:8px;width:26px;height:26px;cursor:pointer;'
    + 'font-weight:700;font-size:.78rem;line-height:1;padding:0;}'
    + '.pomo-header button:hover{transform:translate(-1px,-1px);box-shadow:2px 2px 0 0 var(--stroke,#1B1B28);}'
    + '.pomo-lang-btn{width:auto !important;padding:0 8px !important;}'
    + '.pomo-body{padding:16px;display:flex;flex-direction:column;align-items:center;gap:14px;}'
    + '.pomo-collapsed .pomo-body{display:none;}'
    + '.pomo-ring-wrap{position:relative;width:150px;height:150px;}'
    + '.pomo-ring{width:150px;height:150px;transform:rotate(-90deg);}'
    + '.pomo-ring-bg{fill:none;stroke:var(--line,#E7E7EF);stroke-width:8;}'
    + '.pomo-ring-fg{fill:none;stroke:var(--accent,#6F6CE0);stroke-width:8;stroke-linecap:round;'
    + 'transition:stroke-dashoffset .3s linear;}'
    + '.pomo-time-display{position:absolute;inset:0;display:flex;flex-direction:column;'
    + 'align-items:center;justify-content:center;gap:2px;}'
    + '.pomo-time{font-family:var(--font-display,inherit);font-size:1.6rem;font-weight:700;'
    + 'font-variant-numeric:tabular-nums;}'
    + '.pomo-mode-label{font-size:.68rem;font-weight:700;letter-spacing:.04em;color:var(--muted,#55535F);'
    + 'text-transform:uppercase;}'
    + '.pomo-presets{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;}'
    + '.pomo-preset{font-family:inherit;border:1.5px solid var(--stroke,#1B1B28);background:var(--surface,#fff);'
    + 'border-radius:999px;padding:6px 12px;font-size:.82rem;font-weight:700;cursor:pointer;}'
    + '.pomo-preset:hover{transform:translate(-1px,-1px);box-shadow:2px 2px 0 0 var(--stroke,#1B1B28);}'
    + '.pomo-preset.active{background:var(--accent-deep,#514FC4);color:#fff;border-color:var(--accent-deep,#514FC4);}'
    + '.pomo-controls{display:flex;align-items:center;gap:10px;width:100%;}'
    + '.pomo-start{flex:1;font-family:inherit;border:1.5px solid var(--stroke,#1B1B28);'
    + 'background:var(--accent-deep,#514FC4);color:#fff;border-radius:999px;padding:12px 0;'
    + 'font-weight:700;font-size:1rem;cursor:pointer;}'
    + '.pomo-start:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 0 var(--stroke,#1B1B28);}'
    + '.pomo-reset{font-family:inherit;border:1.5px solid var(--stroke,#1B1B28);background:var(--surface,#fff);'
    + 'border-radius:50%;width:44px;height:44px;font-size:1.05rem;cursor:pointer;flex:none;}'
    + '.pomo-reset:hover{transform:translate(-1px,-1px);box-shadow:2px 2px 0 0 var(--stroke,#1B1B28);}'
    + '.pomo-modes{display:flex;gap:6px;width:100%;}'
    + '.pomo-mode{flex:1;font-family:inherit;border:1.5px solid var(--stroke,#1B1B28);background:var(--surface,#fff);'
    + 'border-radius:10px;padding:8px 4px;font-size:.78rem;font-weight:700;cursor:pointer;line-height:1.2;}'
    + '.pomo-mode:hover{transform:translate(-1px,-1px);box-shadow:2px 2px 0 0 var(--stroke,#1B1B28);}'
    + '.pomo-mode.active{background:var(--tint,#F2F1FD);border-color:var(--accent,#6F6CE0);color:var(--accent-deep,#514FC4);}'
    + '.pomo-fab{position:fixed;z-index:9999;width:52px;height:52px;border-radius:50%;'
    + 'background:var(--accent-deep,#514FC4);color:#fff;border:1.5px solid var(--stroke,#1B1B28);'
    + 'box-shadow:3px 3px 0 0 var(--stroke,#1B1B28);font-size:1.3rem;cursor:pointer;'
    + 'font-family:var(--font-display,inherit);font-weight:700;}'
    + '.pomo-fab:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 0 var(--stroke,#1B1B28);}'
    + '@media (max-width:480px){.pomo-widget{width:260px;}.pomo-ring-wrap{width:130px;height:130px;}'
    + '.pomo-ring{width:130px;height:130px;}}';

  function injectCSS() {
    var style = document.createElement('style');
    style.id = 'pomo-style';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  var R = 54, CIRC = 2 * Math.PI * R;

  function fmt(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
  }

  var els = {};

  function buildDOM() {
    var wrap = document.createElement('div');
    wrap.className = 'pomo-widget' + (state.collapsed ? ' pomo-collapsed' : '');
    wrap.id = 'pomo-widget';
    wrap.innerHTML =
      '<div class="pomo-header" id="pomo-drag">' +
        '<span class="pomo-grip">⠿⠿</span>' +
        '<span class="pomo-title" id="pomo-title">Pomodoro</span>' +
        '<button type="button" id="pomo-lang" class="pomo-lang-btn">EN</button>' +
        '<button type="button" id="pomo-collapse-btn">−</button>' +
        '<button type="button" id="pomo-hide-btn">×</button>' +
      '</div>' +
      '<div class="pomo-body">' +
        '<div class="pomo-ring-wrap">' +
          '<svg class="pomo-ring" viewBox="0 0 120 120">' +
            '<circle class="pomo-ring-bg" cx="60" cy="60" r="' + R + '"></circle>' +
            '<circle class="pomo-ring-fg" id="pomo-ring-fg" cx="60" cy="60" r="' + R + '" ' +
              'stroke-dasharray="' + CIRC + '" stroke-dashoffset="0"></circle>' +
          '</svg>' +
          '<div class="pomo-time-display">' +
            '<div class="pomo-time" id="pomo-time">25:00</div>' +
            '<div class="pomo-mode-label" id="pomo-mode-label">LÀM VIỆC</div>' +
          '</div>' +
        '</div>' +
        '<div class="pomo-presets" id="pomo-presets"></div>' +
        '<div class="pomo-controls">' +
          '<button type="button" class="pomo-start" id="pomo-start">Bắt đầu</button>' +
          '<button type="button" class="pomo-reset" id="pomo-reset" title="Đặt lại">↺</button>' +
        '</div>' +
        '<div class="pomo-modes" id="pomo-modes"></div>' +
      '</div>';
    document.body.appendChild(wrap);

    var fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'pomo-fab';
    fab.className = 'pomo-fab';
    fab.textContent = '⏱';
    fab.style.display = 'none';
    document.body.appendChild(fab);

    els.wrap = wrap;
    els.fab = fab;
    els.title = wrap.querySelector('#pomo-title');
    els.langBtn = wrap.querySelector('#pomo-lang');
    els.collapseBtn = wrap.querySelector('#pomo-collapse-btn');
    els.hideBtn = wrap.querySelector('#pomo-hide-btn');
    els.dragHandle = wrap.querySelector('#pomo-drag');
    els.time = wrap.querySelector('#pomo-time');
    els.modeLabel = wrap.querySelector('#pomo-mode-label');
    els.presets = wrap.querySelector('#pomo-presets');
    els.start = wrap.querySelector('#pomo-start');
    els.reset = wrap.querySelector('#pomo-reset');
    els.modes = wrap.querySelector('#pomo-modes');
    els.ringFg = wrap.querySelector('#pomo-ring-fg');

    PRESETS.forEach(function (m) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pomo-preset';
      b.dataset.min = m;
      b.textContent = m + ' ';
      var unit = document.createElement('span');
      unit.className = 'pomo-unit';
      unit.textContent = TXT[state.lang].unit;
      b.appendChild(unit);
      b.addEventListener('click', function () { onPreset(m); });
      els.presets.appendChild(b);
    });

    ['work', 'short', 'long'].forEach(function (mode) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pomo-mode';
      b.dataset.mode = mode;
      b.addEventListener('click', function () { onModeChange(mode); });
      els.modes.appendChild(b);
    });

    els.langBtn.addEventListener('click', toggleLang);
    els.collapseBtn.addEventListener('click', toggleCollapse);
    els.hideBtn.addEventListener('click', hideWidget);
    els.fab.addEventListener('click', showWidget);
    els.start.addEventListener('click', toggleRunning);
    els.reset.addEventListener('click', resetTimer);

    makeDraggable(els.dragHandle, els.wrap, function (pos) { saveState({ pos: pos }); });
    makeDraggable(els.fab, els.fab, function (pos) { saveState({ posFab: pos }); }, true);
  }

  function makeDraggable(handle, target, onEnd, isSelfDraggable) {
    var dragging = false, startX, startY, origLeft, origTop;
    handle.addEventListener('pointerdown', function (e) {
      if (isSelfDraggable !== true && e.target.closest('button') && e.target.closest('button') !== handle) return;
      dragging = true;
      var rect = target.getBoundingClientRect();
      origLeft = rect.left; origTop = rect.top;
      startX = e.clientX; startY = e.clientY;
      target.style.left = origLeft + 'px';
      target.style.top = origTop + 'px';
      target.style.right = 'auto';
      target.style.bottom = 'auto';
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      var newLeft = Math.min(Math.max(0, origLeft + dx), window.innerWidth - target.offsetWidth);
      var newTop = Math.min(Math.max(0, origTop + dy), window.innerHeight - target.offsetHeight);
      target.style.left = newLeft + 'px';
      target.style.top = newTop + 'px';
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      onEnd({ left: target.style.left, top: target.style.top });
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  }

  function clampToViewport(el, left, top) {
    var w = el.offsetWidth || 300, h = el.offsetHeight || 60;
    var maxLeft = Math.max(0, window.innerWidth - w - 4);
    var maxTop = Math.max(0, window.innerHeight - h - 4);
    var l = Math.min(Math.max(0, left), maxLeft);
    var t = Math.min(Math.max(0, top), maxTop);
    return { left: l, top: t };
  }

  function applyPos() {
    if (state.pos && state.pos.left) {
      var l = parseFloat(state.pos.left) || 0;
      var t = parseFloat(state.pos.top) || 0;
      var c = clampToViewport(els.wrap, l, t);
      els.wrap.style.left = c.left + 'px';
      els.wrap.style.top = c.top + 'px';
      els.wrap.style.right = 'auto';
    } else {
      els.wrap.style.right = '24px';
      els.wrap.style.top = '24px';
    }
    var savedFab = loadState().posFab;
    if (savedFab && savedFab.left) {
      var fl = parseFloat(savedFab.left) || 0;
      var ft = parseFloat(savedFab.top) || 0;
      var cf = clampToViewport(els.fab, fl, ft);
      els.fab.style.left = cf.left + 'px';
      els.fab.style.top = cf.top + 'px';
      els.fab.style.right = 'auto';
      els.fab.style.bottom = 'auto';
    } else {
      els.fab.style.right = '24px';
      els.fab.style.bottom = '24px';
    }
  }

  function reclampOnResize() {
    // Đọc lại vị trí hiện tại trên màn hình rồi kẹp lại trong khung nhìn,
    // để thu nhỏ cửa sổ hoặc xoay màn hình điện thoại không bao giờ làm mất widget.
    [els.wrap, els.fab].forEach(function (elm) {
      if (!elm || elm.style.display === 'none') return;
      var rect = elm.getBoundingClientRect();
      var c = clampToViewport(elm, rect.left, rect.top);
      if (c.left !== rect.left || c.top !== rect.top) {
        elm.style.left = c.left + 'px';
        elm.style.top = c.top + 'px';
        elm.style.right = 'auto';
        elm.style.bottom = 'auto';
      }
    });
  }

  function render() {
    var t = TXT[state.lang];
    els.title.textContent = t.title;
    els.langBtn.textContent = state.lang === 'vi' ? 'EN' : 'VI';
    els.collapseBtn.textContent = state.collapsed ? '+' : '−';
    els.collapseBtn.title = state.collapsed ? t.expand : t.collapse;
    els.hideBtn.title = t.hide;
    els.start.textContent = state.running ? t.pause : t.start;
    els.modeLabel.textContent = t.modes[state.mode].toUpperCase();
    els.reset.title = t.resetLabel;

    Array.prototype.forEach.call(els.presets.children, function (b) {
      b.querySelector('.pomo-unit').textContent = t.unit;
      b.classList.toggle('active', Number(b.dataset.min) === state.minutes[state.mode]);
    });
    Array.prototype.forEach.call(els.modes.children, function (b) {
      b.textContent = t.modes[b.dataset.mode];
      b.classList.toggle('active', b.dataset.mode === state.mode);
    });

    els.time.textContent = fmt(state.remaining);
    var total = state.minutes[state.mode] * 60;
    var frac = total > 0 ? state.remaining / total : 0;
    els.ringFg.style.strokeDashoffset = CIRC * (1 - frac);

    els.wrap.classList.toggle('pomo-collapsed', state.collapsed);
    els.wrap.style.display = state.hidden ? 'none' : '';
    els.fab.style.display = state.hidden ? 'block' : 'none';
    els.fab.title = t.show;
  }

  var timerId = null;
  function tick() {
    state.remaining -= 1;
    if (state.remaining <= 0) {
      state.remaining = 0;
      stopRunning();
      beep();
    }
    render();
    saveState({ remaining: state.remaining, mode: state.mode });
  }

  function startRunning() {
    if (state.running) return;
    state.running = true;
    timerId = setInterval(tick, 1000);
    render();
  }
  function stopRunning() {
    state.running = false;
    if (timerId) { clearInterval(timerId); timerId = null; }
    render();
  }
  function toggleRunning() { state.running ? stopRunning() : startRunning(); }

  function resetTimer() {
    stopRunning();
    state.remaining = state.minutes[state.mode] * 60;
    render();
    saveState({ remaining: state.remaining });
  }

  function onPreset(min) {
    state.minutes[state.mode] = min;
    stopRunning();
    state.remaining = min * 60;
    render();
    saveState({ minutes: state.minutes, remaining: state.remaining });
  }

  function onModeChange(mode) {
    if (mode === state.mode) return;
    stopRunning();
    state.mode = mode;
    state.remaining = state.minutes[mode] * 60;
    render();
    saveState({ mode: state.mode, remaining: state.remaining });
  }

  function toggleLang() {
    state.lang = state.lang === 'vi' ? 'en' : 'vi';
    render();
    saveState({ lang: state.lang });
  }

  function toggleCollapse() {
    state.collapsed = !state.collapsed;
    render();
    saveState({ collapsed: state.collapsed });
  }
  function hideWidget() {
    state.hidden = true;
    render();
    saveState({ hidden: true });
  }
  function showWidget() {
    state.hidden = false;
    render();
    saveState({ hidden: false });
  }

  function beep() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 880;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      o.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  }

  function init() {
    injectCSS();
    buildDOM();
    applyPos();
    render();
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(reclampOnResize, 120);
    });
    window.addEventListener('orientationchange', function () {
      setTimeout(reclampOnResize, 200);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
