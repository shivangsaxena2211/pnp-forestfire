/* THE ENCHANTED FOREST — shared visual effects. Purely cosmetic: no network calls, no telemetry. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(pointer: fine)').matches;

  /* ---- atmosphere layers ---- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  var atmos = el('div', 'atmos', '<div class="trees"></div><div class="fog f2"></div><div class="fog"></div><div class="vignette"></div>');
  atmos.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(atmos, document.body.firstChild);

  /* ---- floating golden particles ---- */
  if (!reduce) {
    var cv = el('canvas'); cv.id = 'sparkles'; cv.setAttribute('aria-hidden', 'true'); document.body.appendChild(cv);
    var cx = cv.getContext('2d'), W = 0, H = 0, P = [], run = true;
    var N = Math.min(46, Math.round(window.innerWidth / 30));
    function size() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
    size(); window.addEventListener('resize', size);
    for (var i = 0; i < N; i++) P.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .4, vy: -(Math.random() * .25 + .05), vx: (Math.random() - .5) * .15, t: Math.random() * 6.28, g: Math.random() > .25 });
    (function frame() {
      if (run) {
        cx.clearRect(0, 0, W, H);
        for (var i = 0; i < P.length; i++) {
          var p = P[i]; p.t += .02; p.x += p.vx + Math.sin(p.t) * .15; p.y += p.vy;
          if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
          var a = .35 + Math.sin(p.t * 2) * .3;
          cx.beginPath(); cx.fillStyle = p.g ? 'rgba(232,207,148,' + a + ')' : 'rgba(111,194,154,' + a * .7 + ')';
          cx.shadowColor = p.g ? '#C5A15B' : '#3C8060'; cx.shadowBlur = 8; cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
        }
      }
      requestAnimationFrame(frame);
    })();
    document.addEventListener('visibilitychange', function () { run = !document.hidden; });
  }

  /* ---- wand cursor trail (mouse only) ---- */
  if (!reduce && fine) {
    var tc = el('canvas'); tc.id = 'wandTrail'; tc.setAttribute('aria-hidden', 'true'); document.body.appendChild(tc);
    var tx = tc.getContext('2d'), tw = 0, th = 0, T = [];
    function tsize() { tw = tc.width = window.innerWidth; th = tc.height = window.innerHeight; }
    tsize(); window.addEventListener('resize', tsize);
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      for (var k = 0; k < 2; k++) T.push({ x: e.clientX + (Math.random() - .5) * 6, y: e.clientY + (Math.random() - .5) * 6, l: 1, vy: Math.random() * .6 + .1, r: Math.random() * 2 + .8 });
      if (T.length > 70) T.splice(0, T.length - 70);
    }, { passive: true });
    (function tf() {
      tx.clearRect(0, 0, tw, th);
      for (var i = T.length - 1; i >= 0; i--) {
        var s = T[i]; s.l -= .035; s.y += s.vy;
        if (s.l <= 0) { T.splice(i, 1); continue; }
        tx.beginPath(); tx.fillStyle = 'rgba(232,207,148,' + s.l * .8 + ')'; tx.shadowColor = '#C5A15B'; tx.shadowBlur = 10; tx.arc(s.x, s.y, s.r * s.l + .3, 0, 6.283); tx.fill();
      }
      requestAnimationFrame(tf);
    })();
  }

  /* ---- parchment page transition ---- */
  var wipe = el('div', 'wipe'); wipe.setAttribute('aria-hidden', 'true'); document.body.appendChild(wipe);
  if (!reduce && sessionStorageSafe('get') === '1') { wipe.style.transform = 'translateY(0)'; wipe.classList.add('out'); sessionStorageSafe('set', '0'); }
  function sessionStorageSafe(op, v) { try { return op === 'get' ? sessionStorage.getItem('ef_wipe') : sessionStorage.setItem('ef_wipe', v); } catch (e) { return null; } }
  window.addEventListener('pageshow', function (e) { if (e.persisted) { wipe.className = 'wipe'; wipe.style.transform = ''; } });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduce || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
    if (u.pathname === location.pathname && !u.hash) return;
    e.preventDefault(); sessionStorageSafe('set', '1'); wipe.classList.add('in');
    setTimeout(function () { location.href = a.href; }, 380);
  });

  /* ---- mobile nav ---- */
  var tg = document.querySelector('.nav-toggle'), nav = document.querySelector('.app-nav');
  if (tg && nav) {
    tg.addEventListener('click', function () { var o = nav.classList.toggle('open'); tg.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) nav.classList.remove('open'); });
  }

  /* ---- scroll reveal ---- */
  var rv = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('seen'); io.unobserve(en.target); } }); }, { threshold: .08 });
    rv.forEach(function (n) { io.observe(n); });
  } else { rv.forEach(function (n) { n.classList.add('seen'); }); }

  /* ---- occasional golden snitch (decorative, pointer-events:none) ---- */
  if (!reduce) {
    var sn = el('div', 'snitch', '<svg viewBox="0 0 46 24" width="46" height="24" aria-hidden="true"><g class="wing"><path d="M23 12C14 2 4 4 1 8c6 1 12 3 22 4z" fill="#e8cf94" opacity=".85"/><path d="M23 12c9-10 19-8 22-4-6 1-12 3-22 4z" fill="#e8cf94" opacity=".85"/></g><circle cx="23" cy="13" r="5" fill="#C5A15B" stroke="#80663D"/></svg>');
    document.body.appendChild(sn);
    function fly() { sn.style.top = (12 + Math.random() * 40) + 'vh'; sn.classList.remove('fly'); void sn.offsetWidth; sn.classList.add('fly'); }
    setTimeout(function () { fly(); setInterval(fly, 70000); }, 15000);
  }

  /* ---- live status seal on pages that do not poll /api/data themselves (reads GET /api/health only) ---- */
  var seal = document.querySelector('.status-chip[data-seal]');
  if (seal) {
    var base = location.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
    var checkSeal = function () {
      fetch(base + '/api/health', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (h) {
        var esp = (h && h.esp) || {};
        var lbl = !esp.reachable ? 'ESP OFFLINE' : (esp.stale ? 'STALE DATA' : 'ESP ONLINE');
        seal.textContent = lbl; seal.setAttribute('data-level', !esp.reachable ? 'crit' : (esp.stale ? 'warn' : 'safe'));
      }).catch(function () { seal.textContent = 'ESP OFFLINE'; seal.setAttribute('data-level', 'crit'); });
    };
    checkSeal(); setInterval(checkSeal, 5000);
  }

  /* ---- owl-post notification ---- */
  var owl = el('div', 'owl'); owl.setAttribute('role', 'status'); owl.setAttribute('aria-live', 'polite'); document.body.appendChild(owl);
  var owlT;
  window.Magic = {
    reduce: reduce,
    owl: function (title, msg) {
      owl.innerHTML = '<b></b><span></span>'; owl.firstChild.textContent = '🦉 ' + title; owl.lastChild.textContent = msg;
      owl.classList.add('show'); clearTimeout(owlT); owlT = setTimeout(function () { owl.classList.remove('show'); }, 6000);
    }
  };
})();
