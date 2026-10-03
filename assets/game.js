/* محرك الألعاب - اللغة العربية للصف الأول الابتدائي - أ/ علاء الشال */
(function () {
  'use strict';
  var CFG = window.SITE || {};
  var UNIT = window.UNIT;
  var IMG = (CFG.root || '../') + 'assets/img/';
  var WA = CFG.whatsapp || '201004030062';
  var TEACHER = CFG.teacher || 'أ/ علاء الشال';

  /* ---------------- storage (optional, safe) ---------------- */
  function sget(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---------------- sound ---------------- */
  var AC = window.AudioContext || window.webkitAudioContext, ctx = null, noiseBuf = null;
  var muted = sget('alaa-mute') === '1';
  function ac() {
    if (!AC) return null;
    if (!ctx) { ctx = new AC(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, type, t0, dur, vol, glideTo) {
    var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise() {
    var c = ac(); if (!c) return null;
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate * 0.25, c.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    }
    return noiseBuf;
  }
  function clap(t0, vol) {
    var c = ac(); if (!c) return;
    var s = c.createBufferSource(); s.buffer = noise();
    var bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200 + Math.random() * 1600; bp.Q.value = 0.8;
    var g = c.createGain(); g.gain.value = vol;
    s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t0);
  }
  function sndCorrect() {
    if (muted) return; var c = ac(); if (!c) return; var t = c.currentTime + 0.01;
    [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, 'triangle', t + i * 0.085, 0.32, 0.22); });
    tone(1568, 'sine', t + 0.36, 0.25, 0.12); tone(2093, 'sine', t + 0.44, 0.35, 0.1);
    for (var i = 0; i < 22; i++) clap(t + 0.3 + Math.random() * 0.9, 0.35 * (1 - i / 26));
  }
  function sndWrong() {
    if (muted) return; var c = ac(); if (!c) return; var t = c.currentTime + 0.01;
    var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.connect(c.destination);
    var seq = [[392, 0.26], [370, 0.26], [349, 0.26], [330, 0.85]], tt = t;
    seq.forEach(function (p, i) {
      var o = c.createOscillator(), g = c.createGain(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(p[0], tt);
      if (i === 3) {
        var l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 6; lg.gain.value = 9;
        l.connect(lg); lg.connect(o.frequency); l.start(tt); l.stop(tt + p[1]);
        o.frequency.linearRampToValueAtTime(p[0] * 0.92, tt + p[1]);
      }
      g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(0.2, tt + 0.04);
      g.gain.setValueAtTime(0.2, tt + p[1] - 0.06); g.gain.exponentialRampToValueAtTime(0.0001, tt + p[1]);
      o.connect(g); g.connect(lp); o.start(tt); o.stop(tt + p[1] + 0.05); tt += p[1] + 0.02;
    });
  }
  function sndWin() {
    if (muted) return; var c = ac(); if (!c) return; var t = c.currentTime + 0.01;
    [[523.25, 0], [659.25, .12], [783.99, .24], [1046.5, .36], [783.99, .55], [1046.5, .68]].forEach(function (p) { tone(p[0], 'square', t + p[1], 0.3, 0.09); tone(p[0] / 2, 'triangle', t + p[1], 0.3, 0.12); });
    for (var i = 0; i < 40; i++) clap(t + 0.5 + Math.random() * 1.6, 0.3);
  }
  var arVoice = null;
  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    var vs = speechSynthesis.getVoices() || [];
    arVoice = vs.filter(function (v) { return /^ar/i.test(v.lang); })[0] || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function say(txt) {
    if (muted || !arVoice) return;
    try { speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(txt); u.voice = arVoice; u.lang = arVoice.lang; u.rate = 0.95; u.pitch = 1.15; speechSynthesis.speak(u); } catch (e) {}
  }
  var PRAISE = ['أحسنت!', 'ممتاز!', 'رائع يا بطل!', 'برافو عليك!', 'إجابة صحيحة!', 'شاطر!'];
  var OOPS = ['حاول مرة أخرى', 'للأسف، إجابة خطأ'];
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function setMuteIcon() { var b = document.querySelectorAll('.mute'); for (var i = 0; i < b.length; i++) b[i].textContent = muted ? '🔇' : '🔊'; }
  window.toggleMute = function () { muted = !muted; sset('alaa-mute', muted ? '1' : '0'); setMuteIcon(); if (!muted) sndCorrect(); };
  document.addEventListener('pointerdown', function () { ac(); }, { once: true });

  /* ---------------- helpers ---------------- */
  function $(s) { return document.querySelector(s); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function strip(h) { var d = document.createElement('div'); d.innerHTML = h; return d.textContent; }
  function optHTML(o) { return typeof o === 'string' ? o : '<img src="' + IMG + o.img + '.jpg" alt="">'; }
  function optText(o) { return typeof o === 'string' ? o : '🖼️'; }
  function confetti() {
    var cs = ['#f43f5e', '#fbbf24', '#22c55e', '#38bdf8', '#a855f7', '#fb923c'];
    for (var i = 0; i < 46; i++) {
      var c = el('div', 'confetti'); c.style.left = Math.random() * 100 + 'vw';
      c.style.background = cs[i % cs.length]; c.style.animationDuration = (1.4 + Math.random() * 1.6) + 's';
      c.style.animationDelay = Math.random() * .3 + 's';
      document.body.appendChild(c); setTimeout(function (x) { x.remove(); }.bind(null, c), 3400);
    }
  }
  var toastT;
  window.toast = function (m) { var t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2200); };

  /* ---------------- unit page ---------------- */
  var TYPES = { mcq: ['اختيار من متعدد', '١'], tf: ['صح أم خطأ', '٢'], bubble: ['الفقاعات', '٣'], target: ['الأهداف', '٤'] };
  function renderLessons() {
    var box = $('#lessons'); if (!box || !UNIT) return;
    box.innerHTML = '';
    UNIT.lessons.forEach(function (l, i) {
      var best = sget('alaa-best-' + l.id);
      var c = el('div', 'lcard');
      c.innerHTML = '<div class="pic"><img loading="lazy" src="' + (CFG.root || '../') + 'assets/heroes/' + l.id + '.jpg" alt="' + l.name + '"></div>' +
        '<div class="lb"><div class="lname">' + l.name + '</div><div class="meta">الدرس ' + '١٢٣٤٥٦٧٨'[i] + ' · ٢٠ سؤالًا</div>' +
        (best ? '<span class="best">⭐ أفضل نتيجة: ' + best + ' / 20</span>' : '') + '</div>';
      c.onclick = function () { location.hash = l.id; };
      box.appendChild(c);
    });
  }

  /* ---------------- game engine ---------------- */
  var G = null, raf = null;
  function stopAnim() { if (raf) cancelAnimationFrame(raf); raf = null; }

  function openFromHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    var l = UNIT && UNIT.lessons.filter(function (x) { return x.id === id; })[0];
    if (l) start(l); else close(true);
  }
  window.addEventListener('hashchange', openFromHash);

  function start(l) {
    stopAnim();
    G = { l: l, qs: shuffle(l.q), i: 0, score: 0, wrong: [], lock: false };
    $('#game').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    $('#g-title').textContent = l.name;
    $('#g-sub').textContent = UNIT.name + ' · ' + UNIT.title;
    next();
  }
  function close(fromHash) {
    stopAnim();
    $('#game').classList.add('hidden'); document.body.style.overflow = '';
    G = null; renderLessons();
    if (!fromHash && location.hash) history.pushState('', document.title, location.pathname + location.search);
  }
  window.closeGame = function () { close(false); };

  function progress() {
    $('#g-count').textContent = (G.i + 1) + ' / ' + G.qs.length;
    $('#g-score').textContent = G.score;
    $('#g-bar').style.width = (G.i / G.qs.length * 100) + '%';
  }

  function next() {
    stopAnim();
    if (G.i >= G.qs.length) return finish();
    G.lock = false;
    progress();
    var q = G.qs[G.i], body = $('#g-wrap');
    body.innerHTML = '';
    var t = TYPES[q.t];
    body.appendChild(el('div', 'qtype', '<i>' + t[1] + '</i>' + t[0]));
    var card = el('div', 'qcard');
    card.appendChild(el('div', 'qtext', q.q));
    if (q.img) card.appendChild(el('div', 'qimg', '<img src="' + IMG + q.img + '.jpg" alt="">'));
    body.appendChild(card);
    G.card = card;
    ({ mcq: rMCQ, tf: rTF, bubble: rBubble, target: rTarget })[q.t](q, body);
    $('#g-body').scrollTop = 0;
  }

  function answer(q, chosen, node, all) {
    if (G.lock) return; G.lock = true;
    var ok = chosen === q.ans;
    var correct = q.opts[q.ans];
    if (ok) { G.score++; node && node.classList.add('ok'); }
    else {
      node && node.classList.add('bad');
      all && all[q.ans] && all[q.ans].classList.add('ok');
      G.wrong.push({ q: q, chosen: q.opts[chosen] });
      G.card.classList.remove('shake'); void G.card.offsetWidth; G.card.classList.add('shake');
    }
    stopAnim();
    feedback(ok, correct, q);
    setTimeout(function () { hideFb(); G && (G.i++, next()); }, ok ? 1500 : 2300);
  }

  function feedback(ok, correct, q) {
    var fb = $('#fb');
    fb.className = 'fb show' + (ok ? '' : ' bad');
    if (ok) {
      sndCorrect(); confetti(); say(rnd(PRAISE));
      fb.innerHTML = '<div class="box"><div class="emo">' + rnd(['🌟', '🎉', '👏', '🏆', '😍']) + '</div><h3>' + rnd(['أحسنت يا بطل!', 'ممتاز!', 'رائع جدًّا!', 'برافو عليك!']) + '</h3></div>';
    } else {
      sndWrong(); say(rnd(OOPS));
      var c = typeof correct === 'string' ? '<b>' + correct + '</b>' : '<img src="' + IMG + correct.img + '.jpg" style="width:70px;height:70px;object-fit:contain;vertical-align:middle">';
      fb.innerHTML = '<div class="box"><div class="emo">😢</div><h3>إجابة خطأ!</h3><p>الإجابة الصحيحة: ' + c + '</p></div>';
    }
  }
  function hideFb() { $('#fb').className = 'fb'; }

  function rMCQ(q, body) {
    var imgs = typeof q.opts[0] !== 'string';
    var g = el('div', 'opts' + (imgs ? ' imgs' : '')), nodes = [];
    var long = !imgs && q.opts.some(function (o) { return o.length > 18; });
    shuffle(q.opts.map(function (o, i) { return i; })).forEach(function (i) {
      var b = el('button', 'opt' + (imgs ? ' imgopt' : '') + (long ? ' small' : ''), optHTML(q.opts[i]));
      nodes[i] = b; b.onclick = function () { answer(q, i, b, nodes); };
      g.appendChild(b);
    });
    if (long) g.style.gridTemplateColumns = '1fr';
    body.appendChild(g);
  }
  function rTF(q, body) {
    var g = el('div', 'tf'), nodes = [];
    [['صح', '✔ صح', 'yes'], ['خطأ', '✘ خطأ', 'no']].forEach(function (x, i) {
      var b = el('button', 'opt ' + x[2], x[1]); nodes[i] = b;
      b.onclick = function () { answer(q, i, b, nodes); }; g.appendChild(b);
    });
    body.appendChild(g);
  }
  function rBubble(q, body) {
    var a = el('div', 'arena'), nodes = [];
    var slots = shuffle([[6, 8], [54, 4], [10, 52], [56, 50]]);
    shuffle(q.opts.map(function (o, i) { return i; })).forEach(function (i, k) {
      var b = el('div', 'bubble', optHTML(q.opts[i]));
      var s = slots[k];
      b.style.right = (s[0] + Math.random() * 6) + '%'; b.style.top = (s[1] + 6 + Math.random() * 6) + '%';
      b.style.setProperty('--d', (3.2 + Math.random() * 2) + 's'); b.style.setProperty('--dl', (-Math.random() * 3) + 's');
      nodes[i] = b;
      b.onclick = function () { if (G.lock) return; b.classList.add(i === q.ans ? 'ok' : 'bad'); answer(q, i, b, nodes); };
      a.appendChild(b);
    });
    body.appendChild(a);
    body.appendChild(el('div', 'hint', '💡 المس الفقاعة التي فيها الإجابة الصحيحة — خذ وقتك!'));
  }
  function rTarget(q, body) {
    var r = el('div', 'range'), nodes = [], items = [];
    body.appendChild(r);
    var H = r.clientHeight, W = r.clientWidth;
    var order = shuffle(q.opts.map(function (o, i) { return i; }));
    order.forEach(function (i, k) {
      var lane = (k + 0.5) / order.length;
      var ln = el('div', 'lane'); ln.style.top = (lane * 100) + '%'; r.appendChild(ln);
      var t = el('div', 'target', '<div class="ring"><span>' + optHTML(q.opts[i]) + '</span></div><div class="stick"></div>');
      r.appendChild(t);
      var tw = t.offsetWidth || 90, th = t.offsetHeight || 110;
      var dir = k % 2 ? 1 : -1;
      var it = { el: t, x: Math.random() * (W - tw), y: lane * H - th / 2 - 4, v: dir * (28 + Math.random() * 26), w: tw };
      if (it.y < 2) it.y = 2; if (it.y + th > H) it.y = H - th;
      t.style.top = it.y + 'px';
      items.push(it); nodes[i] = t;
      t.onclick = function (ev) {
        if (G.lock) return;
        var rr = r.getBoundingClientRect(), bm = el('div', 'boom');
        bm.style.left = (ev.clientX - rr.left) + 'px'; bm.style.top = (ev.clientY - rr.top) + 'px'; r.appendChild(bm);
        answer(q, i, t, nodes);
      };
    });
    var last = performance.now();
    function step(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      W = r.clientWidth;
      items.forEach(function (it) {
        it.x += it.v * dt;
        if (it.x > W - it.w) { it.x = W - it.w; it.v = -Math.abs(it.v); }
        if (it.x < 0) { it.x = 0; it.v = Math.abs(it.v); }
        it.el.style.transform = 'translateX(' + (-it.x) + 'px)';
        it.el.style.right = '0px';
      });
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    body.appendChild(el('div', 'hint', '🎯 صوّب على الهدف الذي يحمل الإجابة الصحيحة — بلا وقت!'));
  }

  function finish() {
    stopAnim();
    $('#g-bar').style.width = '100%';
    var n = G.qs.length, s = G.score, pct = Math.round(s / n * 100);
    var best = +(sget('alaa-best-' + G.l.id) || 0); if (s > best) sset('alaa-best-' + G.l.id, s);
    var st = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
    var msg = st === 3 ? 'بطل اللغة العربية! 🏆' : st === 2 ? 'أداء رائع! واصل التقدّم 👏' : st === 1 ? 'جيد، تدرّب مرة أخرى 💪' : 'لا بأس، حاول من جديد 🌱';
    var stars = ''; for (var i = 0; i < 3; i++) stars += '<span class="' + (i < st ? '' : 'off') + '">⭐</span>';
    var mist = '';
    if (G.wrong.length) {
      mist = '<div class="mist"><h4>📝 أسئلة أراجعها</h4>' + G.wrong.map(function (w) {
        var c = w.q.opts[w.q.ans];
        return '<li>' + (w.q.img ? '<img src="' + IMG + w.q.img + '.jpg" alt="">' : '') + '<div><div class="q">' + w.q.q + '</div>' +
          '<div class="y">إجابتي: ' + (typeof w.chosen === 'string' ? '<b>' + w.chosen + '</b>' : '🖼️ صورة أخرى') + '</div>' +
          '<div class="a">الصحيح: ' + (typeof c === 'string' ? '<b>' + c + '</b>' : '<img src="' + IMG + c.img + '.jpg" alt="" style="width:46px;height:46px;vertical-align:middle">') + '</div></div></li>';
      }).join('') + '</div>';
    } else mist = '<p style="color:var(--ok);font-weight:800;font-size:1.25rem">أداء مثالي! لم تخطئ في أي سؤال 🌟</p>';
    $('#g-wrap').innerHTML = '<div class="result"><div class="stars">' + stars + '</div><h2>' + msg + '</h2>' +
      '<div class="sc">نتيجتي: <span style="color:var(--green)">' + s + '</span> من ' + n + ' (' + pct + '%)</div>' + mist +
      '<div class="share"><h4>📲 أرسل نتيجتك إلى ' + TEACHER + '</h4><input id="stu" type="text" placeholder="اكتب اسمك هنا أولًا" autocomplete="name">' +
      '<div class="warn" id="warn">من فضلك اكتب اسمك أولًا ✋</div><button class="btn wa" onclick="sendResult()">إرسال النتيجة عبر واتساب</button></div>' +
      '<div class="row"><button class="btn sky grow" onclick="replay()">🔄 العب مرة أخرى</button><button class="btn ghost grow" onclick="closeGame()">📚 دروس الوحدة</button></div></div>';
    var sv = sget('alaa-student'); if (sv) $('#stu').value = sv;
    G.done = { s: s, n: n, pct: pct };
    sndWin(); confetti(); setTimeout(confetti, 600);
    say(st >= 2 ? 'أحسنت! أنت بطل' : 'أحسنت المحاولة');
    $('#g-body').scrollTop = 0;
  }
  window.replay = function () { if (G) start(G.l); };
  window.sendResult = function () {
    var inp = $('#stu'), name = inp.value.trim();
    if (!name) { $('#warn').style.display = 'block'; inp.classList.add('shake'); setTimeout(function () { inp.classList.remove('shake'); }, 500); inp.focus(); return; }
    $('#warn').style.display = 'none'; sset('alaa-student', name);
    var d = G.done;
    var m = '📚 نتيجة طالب - اللغة العربية - الصف الأول الابتدائي\n' +
      '📘 ' + UNIT.name + ' (' + strip(UNIT.title) + ') - ' + G.l.name + '\n' +
      '👤 اسم الطالب: ' + name + '\n' +
      '✅ النتيجة: ' + d.s + ' من ' + d.n + '\n' +
      '⭐ النسبة: ' + d.pct + '%';
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(m), '_blank');
  };

  /* ---------------- home page: copy / share unit link ---------------- */
  window.unitURL = function (n) { return new URL('unit' + n + '/', location.href).href; };
  window.copyUnit = function (n) {
    var u = unitURL(n);
    function ok() { toast('✅ تم نسخ رابط الوحدة'); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(u).then(ok, fallback); else fallback();
    function fallback() {
      var t = document.createElement('textarea'); t.value = u; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); ok(); } catch (e) { prompt('انسخ الرابط:', u); } t.remove();
    }
  };
  window.shareUnit = function (n, title) {
    var u = unitURL(n);
    if (navigator.share) { navigator.share({ title: title, url: u }).catch(function () {}); }
    else window.open('https://wa.me/?text=' + encodeURIComponent(title + '\n' + u), '_blank');
  };

  document.addEventListener('DOMContentLoaded', function () {
    setMuteIcon();
    if (UNIT) { renderLessons(); if (location.hash) openFromHash(); }
  });
})();
