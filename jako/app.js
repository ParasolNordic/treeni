/* Jakotreeni – pelin käyttöliittymä ja mekaniikka */
(function () {
  'use strict';

  var D = window.TT_DOGS, Q = window.JT_Q, TIPS = window.TT_TIPS, TTS = window.JT_TTS_API;
  var KEY = 'tassutreeni.jako.v1';
  var $app = document.getElementById('app'), $ov = document.getElementById('overlay'), $toast = document.getElementById('toast');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Tila ---------------- */
  function defaultState() {
    return { v: 1, dog: null, bones: 0, stars: {}, stats: {}, tags: {}, errlog: [], streak: 0, streakBest: 0,
      exam: { best: null, bestGrade: null, runs: 0, history: [] }, pups: {}, settings: { sound: true }, tips: { order: [], i: 0 } };
  }
  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) { var o = JSON.parse(raw), d = defaultState(); for (var k in o) d[k] = o[k]; return d; } } catch (e) { /* ok */ }
    var s = defaultState();
    try { var old = JSON.parse(localStorage.getItem('tassutreeni.v1') || 'null'); if (old && old.dog) { s.dog = { name: old.dog.name, coat: old.dog.coat, ears: old.dog.ears, imported: true }; } } catch (e) { /* ok */ }
    return s;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ok */ } }
  var S = load();

  /* ---------------- Apurit ---------------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function $(sel) { return $app.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call($app.querySelectorAll(sel)); }
  function totalStars() { var t = 0; for (var k in S.stars) t += S.stars[k] || 0; return t; }
  var STAGE_MIN = [0, 6, 16, 28, 40];
  function stage() { var t = totalStars(), s = 0; for (var i = 0; i < STAGE_MIN.length; i++) if (t >= STAGE_MIN[i]) s = i; return s; }
  function dogOpts(extra) {
    var o = { coat: S.dog.coat, ears: S.dog.ears, age: stage(), neck: stage() >= 4 ? 'mitali' : 'huivi', neckColor: '#2BB3A3' };
    for (var k in extra || {}) o[k] = extra[k];
    return o;
  }
  function tagDog(extra) { return D.drawDog(dogOpts(Object.assign({ viewBox: '36 2 168 168', animate: false, prop: '' }, extra || {}))); }
  function toast(msg) { $toast.innerHTML = msg; $toast.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { $toast.hidden = true; }, 2600); }
  function stripTags(s) { return String(s).replace(/<span class="frac"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, '$1/$2').replace(/<br>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(); }

  var ICON = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7zM19.4 13.5l1.8 1.4-2 3.4-2.1-.8a7.6 7.6 0 0 1-2 1.2L14.8 21h-4l-.4-2.3a7.6 7.6 0 0 1-2-1.2l-2.1.8-2-3.4 1.8-1.4a7.7 7.7 0 0 1 0-2.4L4.3 9.7l2-3.4 2.1.8a7.6 7.6 0 0 1 2-1.2L10.8 3h4l.4 2.3a7.6 7.6 0 0 1 2 1.2l2.1-.8 2 3.4-1.8 1.4a7.7 7.7 0 0 1 0 2.4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    del: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11v12H9l-6-6z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h12m-4-5l5 5-5 5M20 6v12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>',
    table: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M9 5v14M15 5v14" stroke="currentColor" stroke-width="2"/></svg>',
    exam: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="6" width="40" height="52" rx="6" fill="#FFFFFF" stroke="#1F2A44" stroke-width="3"/><path d="M20 20h24M20 30h24M20 40h14" stroke="#1F2A44" stroke-width="3" stroke-linecap="round"/><circle cx="46" cy="46" r="11" fill="#FFCC33" stroke="#1F2A44" stroke-width="3"/><path d="M41 46l4 4 6-8" fill="none" stroke="#1F2A44" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    radar: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="24" fill="#E3FAF4" stroke="#1F2A44" stroke-width="3"/><circle cx="32" cy="32" r="14" fill="none" stroke="#2BB3A3" stroke-width="2.5"/><path d="M32 32L50 18" stroke="#1F2A44" stroke-width="3" stroke-linecap="round"/><circle cx="44" cy="40" r="4" fill="#F0466F"/><circle cx="22" cy="24" r="3" fill="#F0466F"/></svg>',
    park: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="12" width="26" height="26" rx="7" fill="#FFFFFF" stroke="#1F2A44" stroke-width="3" transform="rotate(-10 23 25)"/><circle cx="18" cy="20" r="3" fill="#1F2A44"/><circle cx="27" cy="29" r="3" fill="#1F2A44"/><path d="M34 44c6-10 18-10 22 0c-4 10-16 10-22 0z" fill="#7FD1FF" stroke="#1F2A44" stroke-width="3"/><path d="M34 44l-6-6v12z" fill="#7FD1FF" stroke="#1F2A44" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="42" r="2" fill="#1F2A44"/></svg>',
    pups: '<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#F4C27F" stroke="#1F2A44" stroke-width="3"><circle cx="22" cy="30" r="12"/><circle cx="42" cy="30" r="12"/><circle cx="32" cy="42" r="12"/></g><g fill="#1F2A44"><circle cx="18" cy="28" r="2"/><circle cx="25" cy="28" r="2"/><circle cx="38" cy="28" r="2"/><circle cx="45" cy="28" r="2"/><circle cx="28" cy="40" r="2"/><circle cx="35" cy="40" r="2"/></g></svg>'
  };

  /* ---------------- Äänet ---------------- */
  var actx = null;
  function tone(freqs, dur, type, vol) {
    if (!S.settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var t0 = actx.currentTime;
      freqs.forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = type || 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0 + i * dur);
        g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + i * dur + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * dur + 0.08);
        o.connect(g); g.connect(actx.destination); o.start(t0 + i * dur); o.stop(t0 + (i + 1) * dur + 0.1);
      });
    } catch (e) { /* ok */ }
  }
  var sfx = { ok: function () { tone([660, 880, 1175], 0.09, 'triangle', 0.16); }, bad: function () { tone([311, 262], 0.12, 'sine', 0.12); }, tap: function () { tone([1400], 0.02, 'sine', 0.04); }, win: function () { tone([523, 659, 784, 1047, 1319], 0.1, 'triangle', 0.16); } };

  function nextTip() {
    var n = TIPS.ALL.length;
    if (!S.tips.order || S.tips.order.length !== n || S.tips.i >= n) { S.tips.order = shuffle(Array.from({ length: n }, function (_, i) { return i; })); S.tips.i = 0; }
    var t = TIPS.ALL[S.tips.order[S.tips.i]]; S.tips.i++; save(); return t;
  }

  /* ---------------- Pentue ---------------- */
  var PUP_NAMES = ['Nami', 'Pipari', 'Hippu', 'Muru', 'Pippuri', 'Lumi', 'Sisu', 'Pörri', 'Nöpö', 'Hilla', 'Kuono', 'Myrsky', 'Sumu', 'Ruska', 'Tähti', 'Nöpönen'];
  function pupFor(topicId, idx) {
    if (S.pups[topicId]) return S.pups[topicId];
    var o = D.randomDogOptions();
    var nm = PUP_NAMES[idx % PUP_NAMES.length]; if (S.dog && nm === S.dog.name) nm = 'Nöpönen';
    var p = { name: nm, coat: o.coat, ears: o.ears, hat: '', neck: pick(['panta', 'huivi', '']), neckColor: o.neckColor, eyePatch: o.eyePatch };
    S.pups[topicId] = p; save(); return p;
  }
  function pupSvg(p, extra) { return D.drawDog(Object.assign({ coat: p.coat, ears: p.ears, age: 0, hat: p.hat, neck: p.neck, neckColor: p.neckColor, eyePatch: p.eyePatch, face: 'joy', animate: false, viewBox: '30 0 180 180' }, extra || {})); }

  /* ---------------- Navigointi ---------------- */
  var view = { name: S.dog ? 'home' : 'adopt' }, sess = null, game = null;
  function go(name, params) { explainToken++; try { TTS.stop(); } catch (e) { /* ok */ } view = Object.assign({ name: name }, params || {}); render(); window.scrollTo(0, 0); }
  function render() {
    var html;
    switch (view.name) {
      case 'adopt': html = screenAdopt(); break;
      case 'level': html = screenQuestion(); break;
      case 'complete': html = screenComplete(); break;
      case 'examIntro': html = screenExamIntro(); break;
      case 'review': html = screenReview(); break;
      case 'examResult': html = screenExamResult(); break;
      case 'radar': html = screenRadar(); break;
      case 'park': html = screenPark(); break;
      case 'pups': html = screenPups(); break;
      default: html = screenHome();
    }
    $app.innerHTML = html;
    $app.className = 'jt screen-' + view.name;
    if (view.name === 'level') initSlots();
  }
  function hud(sub) {
    return '<header class="hud"><button class="tag" data-act="home" aria-label="Kotiin">' + tagDog() + '</button>' +
      '<div class="hud-name"><b>' + esc(S.dog.name) + '</b><span>' + (sub || ['Pikkupentu', 'Pentu', 'Nuori koira', 'Aikuinen koira', 'Mestarikoira'][stage()]) + '</span></div>' +
      '<div class="hud-bones" aria-label="' + S.bones + ' luuta">' + D.ICONS.bone('ico-bone') + '<b>' + S.bones + '</b></div>' +
      '<button class="icon-btn" data-act="settings" aria-label="Asetukset">' + ICON.gear + '</button></header>';
  }

  /* ---------------- Adoptio ---------------- */
  var draft = { coat: 'kulta', ears: 'luppa', name: pick(['Nappi', 'Muru', 'Lumi', 'Tassu', 'Hilla', 'Sisu']) };
  function screenAdopt() {
    return '<main class="adopt"><div class="adopt-hero"><img class="jt-logo" src="icon.svg" alt="" width="96" height="96"><h1 class="logo">Jakotreeni</h1><p class="tagline">Jaa herkut tasan, kasvata pentue ja valmistaudu jakolaskukokeeseen.</p>' +
      '<div class="adopt-preview">' + D.drawDog({ coat: draft.coat, ears: draft.ears, age: 0, face: 'joy', scene: 'puisto', prop: 'luu' }) + '</div></div>' +
      '<section class="card adopt-card"><h2>Valitse koirasi</h2><div class="swatches">' + Object.keys(D.COATS).map(function (k) {
        return '<button class="swatch' + (draft.coat === k ? ' on' : '') + '" data-act="adopt-coat" data-v="' + k + '" aria-pressed="' + (draft.coat === k) + '">' + D.drawDog({ coat: k, ears: draft.ears, age: 0, animate: false, viewBox: '36 2 168 168' }) + '<span>' + D.COATS[k].name + '</span></button>';
      }).join('') + '</div><h3>Korvat</h3><div class="pills">' + Object.keys(D.EARS).map(function (k) { return '<button class="pill' + (draft.ears === k ? ' on' : '') + '" data-act="adopt-ears" data-v="' + k + '">' + D.EARS[k] + '</button>'; }).join('') +
      '</div><label class="namefield"><span>Koiran nimi</span><input id="dogname" maxlength="14" value="' + esc(draft.name) + '" autocomplete="off"></label><button class="cta big" data-act="adopt-go">Aloita treeni</button></section></main>';
  }

  /* ---------------- Koti ---------------- */
  function nextTopic() {
    for (var i = 0; i < Q.TOPICS.length; i++) if (!S.stars[Q.TOPICS[i].id]) return Q.TOPICS[i];
    var w = null, ws = 4; Q.TOPICS.forEach(function (t) { if ((S.stars[t.id] || 0) < ws) { ws = S.stars[t.id] || 0; w = t; } });
    return ws < 3 ? w : null;
  }
  function topTags(n) {
    var c = {}; S.errlog.slice(-60).forEach(function (e) { c[e.tag] = (c[e.tag] || 0) + 1; });
    return Object.keys(c).sort(function (a, b) { return c[b] - c[a]; }).slice(0, n || 3).map(function (k) { return { tag: k, n: c[k] }; });
  }
  function bubble() {
    var nt = nextTopic(), tt = topTags(1)[0];
    if (!totalStars()) return 'Hau! Jaetaanko herkkuja? Aloitetaan <b>' + Q.TOPICS[0].trick + '</b>-tempusta!';
    if (tt && tt.n >= 3 && Math.random() < 0.5) return 'Virhetutka piippaa: <b>' + Q.TAGS[tt.tag].name.toLowerCase() + '</b>. Treenataanko sitä?';
    if (nt) return pick(['Seuraavaksi <b>' + nt.trick + '</b>! Häntä heiluu jo.', 'Pentue odottaa uutta kaveria – kokeillaan <b>' + nt.trick + '</b>-temppua!', 'Muista tarkistaa jakolasku kertolaskulla. Mennään: <b>' + nt.trick + '</b>!']);
    return 'Kaikki temput hallussa! Kokeillaanko Jakokoetta?';
  }
  function screenHome() {
    var st = stage(), tot = totalStars(), nx = STAGE_MIN[st + 1];
    var pct = nx != null ? Math.round(100 * (tot - STAGE_MIN[st]) / (nx - STAGE_MIN[st])) : 100;
    var pupCount = Object.keys(S.stars).filter(function (k) { return S.stars[k]; }).length;
    var tiles = [
      ['examIntro', ICON.exam, 'Jakokoe', S.exam.bestGrade ? 'Paras arvosana ' + S.exam.bestGrade : 'Koe: tulokset vasta lopussa'],
      ['radar', ICON.radar, 'Virhetutka', S.errlog.length ? 'Mitä kannattaa treenata?' : 'Löytää virhepatternit'],
      ['park', ICON.park, 'Leikkipuisto', 'Noppa- ja kalastuspeli'],
      ['pups', ICON.pups, 'Pentue', pupCount + ' / ' + Q.TOPICS.length + ' pentua']
    ].map(function (t) { return '<button class="tile" data-act="' + t[0] + '"><span class="tile-ico">' + t[1] + '</span><b>' + t[2] + '</b><span>' + t[3] + '</span></button>'; }).join('');
    return hud() + '<main class="home"><a class="back-all" href="../">' + ICON.back + 'Kaikki treenit</a>' +
      '<section class="hero"><div class="hero-scene">' + D.drawDog(dogOpts({ scene: 'puisto', prop: 'luu' })) + '<p class="bubble">' + bubble() + '</p></div>' +
      '<div class="hero-info"><p class="hero-kicker">Jakotreeni</p><h1>' + esc(S.dog.name) + '</h1><p class="stage-line">' + ['Pikkupentu', 'Pentu', 'Nuori koira', 'Aikuinen koira', 'Mestarikoira'][st] + '</p>' +
      '<div class="meter" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + pct + '%"></span></div>' +
      '<p class="meter-label">' + (nx != null ? 'Vielä ' + (nx - tot) + ' tähteä seuraavaan kasvuvaiheeseen.' : 'Mestarikoira! Kaikki kasvuvaiheet saavutettu.') + '</p>' +
      (S.streakBest ? '<p class="meter-label">Paras huolellisuusputki: <b>' + S.streakBest + '</b></p>' : '') + '</div></section>' +
      '<nav class="tiles" aria-label="Pelin osat">' + tiles + '</nav>' +
      '<section class="path-wrap"><h2>Treenipolku</h2><p class="sub">Jokainen este on yksi kokeen aihe. Kun saat tähden, uusi pentu liittyy pentueeseen. Kolmella tähdellä pentu saa kruunun.</p>' + pathHtml() + '</section></main>';
  }
  function pathHtml() {
    var xs = [50, 76, 50, 24], rowH = 124, n = Q.TOPICS.length, H = 70 + (n - 1) * rowH + 70, nt = nextTopic();
    var pts = Q.TOPICS.map(function (t, i) { return { x: xs[i % 4], y: 70 + i * rowH }; });
    var d = 'M' + pts[0].x + ' ' + pts[0].y;
    for (var i = 1; i < pts.length; i++) d += ' C' + pts[i - 1].x + ' ' + (pts[i - 1].y + rowH / 2) + ' ' + pts[i].x + ' ' + (pts[i].y - rowH / 2) + ' ' + pts[i].x + ' ' + pts[i].y;
    var out = '<div class="path" style="height:' + H + 'px"><svg class="trail" viewBox="0 0 100 ' + H + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '" vector-effect="non-scaling-stroke"/></svg>';
    Q.TOPICS.forEach(function (t, i) {
      var p = pts[i], tier = S.stars[t.id] || 0, isNext = nt && nt.id === t.id, right = p.x <= 50;
      out += '<button class="station tier-' + tier + (isNext ? ' is-next' : '') + '" style="left:' + p.x + '%;top:' + p.y + 'px" data-act="level" data-topic="' + t.id + '" aria-label="' + t.trick + ': ' + t.title + '">' + D.obstacle(t.obstacle) +
        (tier ? '<span class="st-rosette">' + D.ICONS.rosette(tier, 'ico-rosette') + '</span>' : '') + (isNext ? '<span class="st-next">' + D.ICONS.paw('ico-paw', '#F0466F') + '</span>' : '') + '</button>' +
        '<div class="st-label ' + (right ? 'to-right' : 'to-left') + '" style="top:' + p.y + 'px;' + (right ? 'left:calc(' + p.x + '% + 52px)' : 'right:calc(' + (100 - p.x) + '% + 52px)') + '"><b>' + t.trick + '</b><span>' + t.title + '</span><i class="st-stars">' + [1, 2, 3].map(function (k) { return D.ICONS.star('ico-star', k <= tier); }).join('') + '</i></div>';
    });
    return out + '</div>';
  }

  /* ===================================================================== */
  /*                           TEHTÄVÄNÄKYMÄ                                 */
  /* ===================================================================== */
  function startLevel(topicId) {
    sess = { mode: 'level', topic: topicId, qs: Q.makeLevel(topicId), qi: 0, si: 0, tries: 0, firstOk: true, results: [], bones: 0, tags: {} };
    go('level');
  }
  function startExam() {
    var qs = Q.makeExam();
    sess = { mode: 'exam', qs: qs, qi: 0, si: 0, answers: qs.map(function () { return null; }), t0: Date.now() };
    go('level');
  }
  function curQ() { return sess.qs[sess.qi]; }
  function curStep() { return sess.mode === 'exam' ? curQ().examStep : curQ().steps[sess.si]; }
  function topicOf(q) { return q.sub || q.topic; }

  function screenQuestion() {
    var q = curQ(), st = curStep(), exam = sess.mode === 'exam', topic = Q.BY_ID[q.topic];
    var title = exam ? 'Jakokoe' : topic.trick, sub = exam ? 'Tehtävä ' + (sess.qi + 1) + ' / ' + sess.qs.length : topic.title;
    var dots = sess.qs.map(function (_, i) {
      if (exam) { var a = sess.answers[i]; return '<button class="paw ' + (i === sess.qi ? 'p-now' : a ? 'p-done' : '') + '" data-act="exam-goto" data-i="' + i + '" aria-label="Tehtävä ' + (i + 1) + '">' + D.ICONS.paw('ico-paw') + '</button>'; }
      var r = sess.results[i]; return '<i class="paw ' + (r ? (r.first ? 'p-first' : r.correct ? 'p-retry' : 'p-miss') : i === sess.qi ? 'p-now' : '') + '">' + D.ICONS.paw('ico-paw') + '</i>';
    }).join('');
    var needsPad = st.kind === 'num' || st.kind === 'fill';
    var tools = '';
    if (!exam) {
      tools = '<div class="tools"><button class="tool tts" data-act="explain">' + ICON.speaker + '<span>Selitä</span></button>' +
        (st.helper ? '<button class="tool" data-act="helper" aria-expanded="false">' + ICON.table + '<span>Luvun ' + st.helper + ' kertotaulu</span></button>' : '') + '</div>' +
        '<div class="explain" id="explain" hidden><div class="ex-dog">' + tagDog({ face: 'happy' }) + '</div><p>' + esc(st.explain) + '</p></div>' +
        (st.helper ? '<div class="helper" id="helper" hidden>' + Q.tableRow(st.helper) + '</div>' : '');
    }
    var stepInfo = !exam && q.steps.length > 1 ? '<span class="stepinfo">Vaihe ' + (sess.si + 1) + ' / ' + q.steps.length + '</span>' : '';
    var streak = !exam && S.streak >= 2 ? '<span class="streak" title="Huolellisuusputki">' + D.ICONS.paw('ico-paw', '#FF9F43') + S.streak + '</span>' : '';
    var nav = exam ? '<p class="exam-note">Tämä on koe: vastauksia ei tarkisteta heti. Näet pisteet, oikeat vastaukset ja korjaukset, kun palautat kokeen lopussa.</p><div class="exam-nav"><button class="ghost" data-act="exam-prev"' + (sess.qi === 0 ? ' disabled' : '') + '>Edellinen</button>' +
      '<button class="cta" data-act="exam-next">' + (sess.qi === sess.qs.length - 1 ? 'Tarkista vastaukset' : 'Seuraava') + '</button></div>' : '';
    return '<header class="qhead"><button class="icon-btn" data-act="quit" aria-label="Lopeta">' + ICON.back + '</button><div class="qtitle"><b>' + title + '</b><span>' + sub + '</span></div>' + streak +
      (exam ? '<span class="timer" id="timer">' + elapsed() + '</span>' : '<div class="hud-bones small">' + D.ICONS.bone('ico-bone') + '<b>' + S.bones + '</b></div>') + '</header>' +
      '<div class="paws' + (exam ? ' exam-dots' : '') + '">' + dots + '</div>' +
      '<main class="qmain' + (needsPad ? ' has-pad' : '') + '"><section class="qcard kind-' + st.kind + '">' +
      '<div class="q-dog" aria-hidden="true">' + tagDog({ face: 'happy' }) + '</div>' + stepInfo +
      '<p class="lead">' + st.lead + '</p>' + (st.big ? '<div class="big">' + st.big + '</div>' : '') + (st.html ? '<div class="qhtml">' + st.html + '</div>' : '') +
      '<div class="widget">' + widgetHtml(st, exam ? sess.answers[sess.qi] : (st.kind === 'match' ? { map: sess.matchMap || {} } : null)) + '</div>' + tools +
      '<div class="feedback" id="fb" hidden></div>' + nav + '</section>' +
      (needsPad ? '<section class="pad-area">' + numpad() + (exam ? '' : '<button class="cta check" data-act="check">Tarkista</button>') + '</section>' : '') + '</main>';
  }
  function elapsed() { if (!sess || !sess.t0) return ''; var s = Math.floor((Date.now() - sess.t0) / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

  function fieldHtml(p, k, prev) {
    var v = prev && prev.fields && prev.fields[k] != null ? prev.fields[k] : '';
    var f = '<span class="field' + (p.optional ? ' optional' : '') + '" data-slot data-f="' + k + '" data-max="5" role="textbox" aria-label="Vastauskenttä ' + (k + 1) + '">' + v + '</span>';
    return p.den ? '<span class="frac ffrac"><span>' + f + '</span><span>' + Q.fmt(p.den) + '</span></span>' : f;
  }
  function widgetHtml(st, prev) {
    if (st.kind === 'num') return '<div class="numrow"><span class="field big-field" data-slot data-f="0" data-max="6" role="textbox" aria-label="Vastaus">' + (prev && prev.val != null ? prev.val : '') + '</span>' + (st.unit ? '<span class="unit">' + st.unit + '</span>' : '') + '</div>';
    if (st.kind === 'fill') { var k = 0; return '<div class="fill">' + st.parts.map(function (p) { return typeof p === 'string' ? '<span class="fill-txt">' + p + '</span>' : fieldHtml(p, k++, prev); }).join('') + '</div>'; }
    if (st.kind === 'mc') return '<div class="opts layout-' + (st.layout || 'list') + '">' + st.options.map(function (o, i) {
      return '<button class="opt' + (prev && prev.choice === i ? ' chosen' : '') + '" data-act="opt" data-i="' + i + '"><span class="opt-txt">' + o.html + '</span></button>';
    }).join('') + '</div>';
    if (st.kind === 'multi') return '<div class="chips-pick">' + st.items.map(function (it, i) {
      var on = prev && prev.sel && prev.sel.indexOf(i) >= 0;
      return '<button class="pickchip' + (on ? ' on' : '') + '" data-act="chip" data-i="' + i + '" aria-pressed="' + !!on + '">' + it.html + '</button>';
    }).join('') + '</div>' + (sess.mode === 'exam' ? '' : '<button class="cta" data-act="check">Tarkista</button>');
    if (st.kind === 'match') {
      var m = (prev && prev.map) || {};
      return '<div class="match"><div class="m-col">' + st.left.map(function (l, i) {
        var a = m[i]; return '<button class="m-item m-left' + (a != null ? ' paired pc' + (i % 5) : '') + '" data-act="mleft" data-i="' + i + '"><span>' + l.html + '</span><b class="m-ans">' + (a != null ? st.right[a].html : '?') + '</b></button>';
      }).join('') + '</div><div class="m-col">' + st.right.map(function (r, j) {
        var owner = Object.keys(m).filter(function (k) { return m[k] === j; })[0];
        return '<button class="m-item m-right' + (owner != null ? ' paired pc' + (owner % 5) : '') + '" data-act="mright" data-j="' + j + '">' + r.html + '</button>';
      }).join('') + '</div></div>' + (sess.mode === 'exam' ? '' : '<button class="cta" data-act="check">Tarkista</button>');
    }
    return '';
  }
  function numpad() {
    return '<div class="numpad" role="group" aria-label="Numeronäppäimet">' + ['7', '8', '9', '4', '5', '6', '1', '2', '3'].map(function (k) { return '<button class="key" data-key="' + k + '">' + k + '</button>'; }).join('') +
      '<button class="key key-fn" data-key="back" aria-label="Pyyhi">' + ICON.del + '</button><button class="key" data-key="0">0</button><button class="key key-fn" data-key="next" aria-label="Seuraava ruutu">' + ICON.next + '</button></div>';
  }

  /* Syöttö */
  var slots = [], active = null, mSel = null, explainToken = 0;
  function initSlots() { slots = $$('[data-slot]'); mSel = null; var first = slots.filter(function (s) { return !s.textContent; })[0] || slots[0]; setActive(first || null); }
  function setActive(el) { if (active) active.classList.remove('active'); active = el; if (active) active.classList.add('active'); }
  function typeDigit(dg) {
    if (!active) return; sfx.tap();
    var max = +active.dataset.max || 5;
    if (active.classList.contains('bad')) active.textContent = '';
    active.classList.remove('bad', 'good');
    if (active.textContent.length < max) active.textContent = active.textContent.replace(/^0(?=\d)/, '') + dg;
    if (active.textContent.length > 1 && active.textContent[0] === '0') active.textContent = active.textContent.replace(/^0+/, '') || '0';
    examSave();
  }
  function backspace() { if (active) { active.textContent = active.textContent.slice(0, -1); active.classList.remove('bad', 'good'); examSave(); } }
  function nextSlot() { if (!active) return; var i = slots.indexOf(active); setActive(slots[(i + 1) % slots.length]); }

  /* Vastauksen lukeminen */
  function readAnswer(st) {
    if (st.kind === 'num') { var f = $('.widget .field'); return { val: f && f.textContent !== '' ? Number(f.textContent) : null }; }
    if (st.kind === 'fill') { return { fields: $$('.widget .field').map(function (f) { return f.textContent === '' ? null : Number(f.textContent); }) }; }
    if (st.kind === 'multi') return { sel: $$('.pickchip.on').map(function (b) { return +b.dataset.i; }) };
    if (st.kind === 'match') return { map: (sess.answers && sess.answers[sess.qi] && sess.answers[sess.qi].map) || sess.matchMap || {} };
    return null;
  }
  function isEmpty(st, a) {
    if (!a) return true;
    if (st.kind === 'num') return a.val == null;
    if (st.kind === 'fill') { var fs = st.parts.filter(function (p) { return typeof p === 'object'; }); return fs.some(function (p, i) { return !p.optional && a.fields[i] == null; }); }
    if (st.kind === 'mc') return a.choice == null;
    if (st.kind === 'multi') return !a.sel || !a.sel.length;
    if (st.kind === 'match') return Object.keys(a.map || {}).length < st.left.length;
    return true;
  }
  /* Arvioi vastaus: palauttaa { ok, tag, msg, wrongFields[] } */
  function grade(st, a, topicId) {
    if (st.kind === 'num') {
      if (a.val === st.answer) return { ok: true };
      var c = Q.classify(st, a.val, st.answer, null, topicId) || {}; return { ok: false, tag: c.tag, msg: c.msg };
    }
    if (st.kind === 'fill') {
      var fs = st.parts.filter(function (p) { return typeof p === 'object'; }), wrong = [], first = null;
      fs.forEach(function (p, i) {
        if (p.optional) return;
        if (a.fields[i] !== p.answer) { wrong.push(i); if (!first) first = Q.classify({}, a.fields[i], p.answer, p.traps, topicId) || {}; }
      });
      return wrong.length ? { ok: false, tag: first.tag, msg: first.msg, wrongFields: wrong } : { ok: true };
    }
    if (st.kind === 'mc') { var o = st.options[a.choice]; return o && o.ok ? { ok: true } : { ok: false, tag: (o && o.tag) || (Q.BY_ID[topicId] || {}).tag, msg: (o && o.msg) || '' }; }
    if (st.kind === 'multi') {
      var sel = a.sel || [], extra = sel.filter(function (i) { return !st.items[i].ok; }), miss = st.items.map(function (_, i) { return i; }).filter(function (i) { return st.items[i].ok && sel.indexOf(i) < 0; });
      if (!extra.length && !miss.length) return { ok: true };
      return { ok: false, tag: 'jaollisuus', msg: extra.length ? 'Lukua ' + stripTags(st.items[extra[0]].html) + ' ei voi jakaa tasan.' : 'Yksi tai useampi sopiva luku puuttuu vielä.', extra: extra, miss: miss };
    }
    if (st.kind === 'match') {
      var bad = st.left.map(function (_, i) { return i; }).filter(function (i) { var j = (a.map || {})[i]; return j == null || st.right[j].key !== st.left[i].key; });
      return bad.length ? { ok: false, tag: 'kertotaulu', msg: 'Tarkista parit: ' + bad.map(function (i) { return stripTags(st.left[i].html); }).join(', ') + '.', bad: bad } : { ok: true };
    }
    return { ok: false };
  }

  /* Harjoitustila: tarkistus */
  function check() {
    var st = curStep(), a = st.kind === 'match' ? { map: sess.matchMap || {} } : readAnswer(st);
    if (isEmpty(st, a)) { toast(st.kind === 'match' ? 'Yhdistä ensin kaikki parit.' : st.kind === 'multi' ? 'Valitse ensin luvut.' : 'Kirjoita ensin vastaus.'); return; }
    var g = grade(st, a, topicOf(curQ()));
    markFields(st, a, g);
    handle(g);
  }
  function markFields(st, a, g) {
    if (st.kind === 'num') { var f = $('.widget .field'); f.classList.toggle('good', g.ok); f.classList.toggle('bad', !g.ok); }
    if (st.kind === 'fill') { $$('.widget .field').forEach(function (f, i) { var bad = g.wrongFields && g.wrongFields.indexOf(i) >= 0; f.classList.toggle('bad', bad); f.classList.toggle('good', !bad); }); var fb1 = $('.widget .field.bad'); if (fb1) setActive(fb1); }
    if (st.kind === 'multi') $$('.pickchip').forEach(function (b, i) { b.classList.toggle('bad', !!(g.extra && g.extra.indexOf(i) >= 0)); b.classList.toggle('missing', !!(g.miss && g.miss.indexOf(i) >= 0) && sess.tries >= 1); });
    if (st.kind === 'match') $$('.m-left').forEach(function (b, i) { b.classList.toggle('bad', !!(g.bad && g.bad.indexOf(i) >= 0)); });
  }
  function chooseOpt(i, btn) {
    var st = curStep();
    if (sess.mode === 'exam') { sess.answers[sess.qi] = { choice: i }; $$('.opt').forEach(function (b) { b.classList.remove('chosen'); }); btn.classList.add('chosen'); sfx.tap(); return; }
    if (btn.disabled) return;
    var g = grade(st, { choice: i }, topicOf(curQ()));
    if (g.ok) btn.classList.add('good'); else { btn.classList.add('bad'); btn.disabled = true; }
    handle(g);
  }
  function logError(tag, topicId) {
    if (!tag) return;
    S.tags[tag] = (S.tags[tag] || 0) + 1;
    S.errlog.push({ tag: tag, topic: topicId, t: Date.now() });
    if (S.errlog.length > 200) S.errlog = S.errlog.slice(-200);
    if (sess && sess.tags) sess.tags[tag] = (sess.tags[tag] || 0) + 1;
    save();
  }
  function handle(g) {
    var st = curStep(), fb = document.getElementById('fb'), q = curQ();
    if (g.ok) {
      sfx.ok();
      if (sess.si < q.steps.length - 1) {
        lock(); fb.hidden = false; fb.className = 'feedback good'; fb.innerHTML = '<b>Oikein!</b> Jatketaan seuraavaan vaiheeseen.';
        setTimeout(function () { stopExplain(); sess.si++; sess.tries = 0; render(); }, reduceMotion ? 250 : 800);
      } else finishQ(true);
      return;
    }
    sess.tries++; sess.firstOk = false; sfx.bad();
    if (sess.tries === 1) logError(g.tag, topicOf(q));
    var qd = $('.q-dog'); if (qd) qd.innerHTML = tagDog({ face: 'think' });
    if (sess.tries >= 2) { reveal(); return; }
    var tagInfo = g.tag && Q.TAGS[g.tag] ? '<p class="radar-note">' + ICON.radar + '<span><b>Virhetutka: ' + Q.TAGS[g.tag].name + '.</b> ' + (g.msg || '') + '</span></p>' : (g.msg ? '<p>' + g.msg + '</p>' : '');
    fb.hidden = false; fb.className = 'feedback hint';
    fb.innerHTML = '<b>Melkein! Yritä vielä kerran.</b>' + tagInfo + '<div class="hint-txt">' + (st.hint || '') + '</div>';
    fb.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function lock() { $$('.opt, .pickchip, .m-item').forEach(function (b) { b.disabled = true; }); var p = $('.pad-area'); if (p) p.classList.add('locked'); $$('.qcard > .cta, .widget > .cta').forEach(function (b) { b.disabled = true; }); setActive(null); }
  function reveal() {
    var st = curStep(), fb = document.getElementById('fb'), last = sess.si >= curQ().steps.length - 1;
    lock();
    if (st.kind === 'mc') $$('.opt').forEach(function (b, i) { if (st.options[i].ok) b.classList.add('reveal'); });
    fb.hidden = false; fb.className = 'feedback solution';
    fb.innerHTML = '<b>Katsotaan yhdessä.</b><div class="hint-txt">' + (st.hint || '') + '</div><p class="answer">Oikea vastaus: <b>' + st.answerText + '</b></p>' +
      '<button class="cta" data-act="' + (last ? 'nextq' : 'nextstep') + '">' + (last ? 'Seuraava tehtävä' : 'Jatka') + '</button>';
    if (last) record(false);
    fb.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function record(correct) {
    var q = curQ(), first = correct && sess.firstOk, tid = topicOf(q);
    sess.results[sess.qi] = { correct: correct, first: first };
    var s = S.stats[tid] || (S.stats[tid] = { asked: 0, first: 0, correct: 0 }); s.asked++; if (first) s.first++; if (correct) s.correct++;
    if (first) { S.streak++; if (S.streak > S.streakBest) S.streakBest = S.streak; } else S.streak = 0;
    save();
  }
  var PRAISE = ['Oikein!', 'Hienoa!', 'Mahtavaa!', 'Tassut ylös!', 'Juuri niin!', 'Hau, oikein!', 'Upeaa työtä!', 'Nappisuoritus!', 'Huippua!', 'Tarkkaa työtä!'];
  function finishQ(correct) {
    record(correct);
    var bones = sess.firstOk ? 2 : 1, extra = '';
    if (sess.firstOk && S.streak > 0 && S.streak % 5 === 0) { bones += 3; extra = 'Huolellisuusputki ' + S.streak + '! Bonus +3 luuta.'; }
    S.bones += bones; sess.bones += bones; save(); lock();
    showReward({ title: pick(PRAISE), bones: bones, sub: extra || (sess.firstOk ? '' : 'Sait sen toisella yrityksellä – hyvä sisu!') }, nextQ);
  }
  function nextQ() {
    stopExplain();
    sess.qi++; sess.si = 0; sess.tries = 0; sess.firstOk = true; sess.matchMap = {};
    if (sess.qi >= sess.qs.length) return finishLevel();
    render(); window.scrollTo(0, 0);
  }
  function finishLevel() {
    var pts = sess.results.reduce(function (a, r) { return a + (r.first ? 1 : r.correct ? 0.5 : 0); }, 0);
    var stars = pts >= 7 ? 3 : pts >= 5 ? 2 : 1, prev = S.stars[sess.topic] || 0, before = stage();
    if (stars > prev) S.stars[sess.topic] = stars;
    var newPup = !prev, idx = Q.TOPICS.map(function (t) { return t.id; }).indexOf(sess.topic), pup = pupFor(sess.topic, idx);
    if (S.stars[sess.topic] === 3 && !pup.hat) pup.hat = 'kruunu';
    S.bones += stars * 2; save();
    go('complete', { topic: sess.topic, stars: stars, first: sess.results.filter(function (r) { return r.first; }).length, correct: sess.results.filter(function (r) { return r.correct; }).length, bones: sess.bones + stars * 2, newPup: newPup, grew: stage() > before, tags: sess.tags });
  }

  /* Palkinto */
  var rewardCb = null;
  function showReward(info, cb) {
    var tip = nextTip(), catIcon = { hoito: D.ICONS.brush('ico-cat'), kasvatus: D.ICONS.whistle('ico-cat'), leikki: D.ICONS.ball('ico-cat') }[tip.cat];
    var burst = '';
    if (!reduceMotion) for (var i = 0; i < 14; i++) { var a = (i / 14) * 360 + Math.random() * 20, d = 120 + Math.random() * 70; burst += '<i style="--a:' + a + 'deg;--d:' + d + 'px;--t:' + (0.7 + Math.random() * 0.5) + 's">' + (i % 2 ? D.ICONS.heart('ico-burst') : D.ICONS.paw('ico-burst', ['#FFCC33', '#2BB3A3', '#F0466F'][i % 3])) + '</i>'; }
    $ov.innerHTML = '<div class="reward" role="dialog" aria-modal="true" aria-labelledby="rw-t"><div class="burst" aria-hidden="true">' + burst + '</div>' +
      '<div class="reward-pic">' + D.drawDog(Object.assign(D.randomDogOptions(), { label: 'Söpö koiranpentu' })) + '</div><h2 id="rw-t">' + info.title + '</h2>' +
      (info.sub ? '<p class="reward-sub">' + info.sub + '</p>' : '') + (info.bones ? '<p class="reward-bones">+' + info.bones + ' ' + D.ICONS.bone('ico-bone') + '</p>' : '') +
      '<div class="tip tip-' + tip.cat + '"><span class="tip-cat">' + catIcon + TIPS.CAT_NAMES[tip.cat] + 'vinkki</span><p>' + tip.text + '</p></div><button class="cta big" data-act="reward-close">Jatka</button></div>';
    $ov.hidden = false; rewardCb = cb;
    setTimeout(function () { var b = $ov.querySelector('[data-act="reward-close"]'); if (b) b.focus(); }, 50);
  }
  function closeOverlay() { $ov.hidden = true; $ov.innerHTML = ''; var cb = rewardCb; rewardCb = null; if (cb) cb(); }

  function screenComplete() {
    var t = Q.BY_ID[view.topic], idx = Q.TOPICS.indexOf(t), nx = Q.TOPICS[idx + 1], pup = S.pups[view.topic];
    var tagList = Object.keys(view.tags || {}).sort(function (a, b) { return view.tags[b] - view.tags[a]; });
    return hud() + '<main class="complete"><section class="card done-card">' +
      '<div class="done-dog">' + D.drawDog(dogOpts({ face: 'joy', scene: 'puisto' })) + '<span class="done-rosette">' + D.ICONS.rosette(view.stars, 'ico-rosette-big') + '</span></div>' +
      '<h1>' + esc(S.dog.name) + ' oppi tempun: ' + t.trick + '!</h1><div class="stars-row">' + [1, 2, 3].map(function (k) { return D.ICONS.star('ico-star-big', k <= view.stars); }).join('') + '</div>' +
      '<p class="done-stats">Oikein ensimmäisellä yrityksellä <b>' + view.first + ' / ' + Q.LEVEL_LEN + '</b>' + (view.correct > view.first ? ', toisella vielä ' + (view.correct - view.first) : '') + '.</p>' +
      '<p class="done-bones">Ansaitsit ' + view.bones + ' luuta ' + D.ICONS.bone('ico-bone') + '</p>' +
      (view.newPup && pup ? '<div class="newpup"><div class="np-pic">' + pupSvg(pup) + '</div><p><b>' + esc(pup.name) + '</b> liittyi pentueeseen!' + (pup.hat === 'kruunu' ? ' Kolmesta tähdestä se sai kruunun.' : '') + '</p></div>' : (pup && pup.hat === 'kruunu' && view.stars === 3 ? '<p class="grew">' + esc(pup.name) + ' sai kruunun!</p>' : '')) +
      (view.grew ? '<p class="grew">' + esc(S.dog.name) + ' kasvoi! Nyt se on ' + ['pikkupentu', 'pentu', 'nuori koira', 'aikuinen koira', 'mestarikoira'][stage()] + '.</p>' : '') +
      (tagList.length ? '<div class="round-radar"><h3>' + ICON.radar + 'Virhetutka huomasi tällä kierroksella</h3><ul>' + tagList.map(function (k) { return '<li><b>' + Q.TAGS[k].name + '</b> (' + view.tags[k] + '×): ' + Q.TAGS[k].tip + '</li>'; }).join('') + '</ul></div>' : '<p class="done-tip">Virhetutka ei löytänyt yhtään virhettä. Hienoa huolellisuutta!</p>') +
      (view.stars < 3 ? '<p class="done-tip">Kolme tähteä saat, kun vähintään 7 tehtävää menee oikein ensimmäisellä yrityksellä.</p>' : '') +
      '<div class="btn-row"><button class="cta" data-act="level" data-topic="' + t.id + '">Treenaa uudestaan</button>' + (nx ? '<button class="cta alt" data-act="level" data-topic="' + nx.id + '">Seuraava: ' + nx.trick + '</button>' : '') + '<button class="ghost" data-act="home">Kotiin</button></div></section></main>';
  }

  /* ===================================================================== */
  /*                               KOE                                       */
  /* ===================================================================== */
  function screenExamIntro() {
    var hist = (S.exam.history || []).slice(-5).reverse();
    return hud() + '<main class="exam-intro"><section class="card show-intro"><div class="show-dog">' + D.drawDog(dogOpts({ face: 'happy', prop: '' })) + '</div>' +
      '<h1>Jakokoe</h1><p>Koe on kuin oikea matematiikan koe: 20 tehtävää koko jakolasku-jaksosta. Vastaukset tarkistetaan vasta lopussa, joten voit siirtyä tehtävästä toiseen ja korjata vastauksia.</p>' +
      '<ul class="rules"><li>Vihjeitä ja selitysnappia ei ole käytössä.</li><li>Lopuksi näet tarkistussivun, jolla voit vielä katsoa vastauksesi läpi. Käytä se – siellä huolimattomuusvirheet jäävät kiinni!</li><li>Saat arvosana-arvion kouluasteikolla 4–10 ja listan asioista, joita kannattaa vielä harjoitella.</li></ul>' +
      (hist.length ? '<p class="best">Aiemmat tulokset: ' + hist.map(function (h) { return '<b>' + h.grade + '</b> (' + h.pct + ' %)'; }).join(', ') + '</p>' : '') +
      '<button class="cta big" data-act="exam-start">Aloita koe</button></section></main>';
  }
  function examSave() {
    if (!sess || sess.mode !== 'exam' || view.name !== 'level') return;
    var st = curStep(), a = readAnswer(st);
    if (st.kind === 'mc' || st.kind === 'match') return;
    sess.answers[sess.qi] = isEmptyLoose(st, a) ? null : a;
  }
  function isEmptyLoose(st, a) {
    if (st.kind === 'num') return a.val == null;
    if (st.kind === 'fill') return a.fields.every(function (v) { return v == null; });
    if (st.kind === 'multi') return !a.sel.length;
    return false;
  }
  function stopExplain() { explainToken++; try { TTS.stop(); } catch (e) { /* ok */ } }
  function examGo(i) { examSave(); sess.qi = Math.max(0, Math.min(sess.qs.length - 1, i)); render(); window.scrollTo(0, 0); }
  function taskCore(st) {
    if (st.big) return '<b>' + st.big + '</b>';
    if (st.parts && typeof st.parts[0] === 'string' && /frac|\d/.test(st.parts[0])) return '<b>' + st.parts[0].replace(/\s*=\s*$/, '') + '</b>';
    if (st.html) return '<span class="small">' + esc(stripTags(st.html).slice(0, 110)) + (stripTags(st.html).length > 110 ? '…' : '') + '</span>';
    return '';
  }
  function answerSummary(st, a) {
    if (!a) return '<i class="empty">Ei vastausta</i>';
    if (st.kind === 'num') return esc(a.val) + (st.unit ? ' ' + st.unit : '');
    if (st.kind === 'fill') { var fs = st.parts.filter(function (p) { return typeof p === 'object'; }); return fs.map(function (p, i) { return p.optional ? null : (a.fields[i] == null ? '_' : a.fields[i]); }).filter(function (x) { return x != null; }).join(', '); }
    if (st.kind === 'mc') return a.choice != null ? st.options[a.choice].html : '<i class="empty">Ei valintaa</i>';
    if (st.kind === 'multi') return a.sel.map(function (i) { return st.items[i].html; }).join(', ');
    if (st.kind === 'match') return Object.keys(a.map || {}).length + ' / ' + st.left.length + ' paria';
    return '';
  }
  function screenReview() {
    var rows = sess.qs.map(function (q, i) {
      var st = q.examStep, a = sess.answers[i], empty = isEmpty(st, a);
      return '<button class="rv-row' + (empty ? ' rv-empty' : '') + '" data-act="exam-goto" data-i="' + i + '"><span class="rv-n">' + (i + 1) + '</span><span class="rv-q">' + esc(stripTags(st.lead)) + ' ' + taskCore(st) + '</span><span class="rv-a">' + answerSummary(st, a) + '</span></button>';
    }).join('');
    var emptyN = sess.qs.filter(function (q, i) { return isEmpty(q.examStep, sess.answers[i]); }).length;
    return '<header class="qhead"><button class="icon-btn" data-act="exam-back" aria-label="Takaisin">' + ICON.back + '</button><div class="qtitle"><b>Tarkista vastauksesi</b><span>Huolellisuustarkistus ennen palautusta</span></div><span class="timer">' + elapsed() + '</span></header>' +
      '<main class="review"><section class="card"><div class="checklist"><h2>Tarkistuslista</h2><ul><li>Tarkista jokainen jakolasku kertolaskulla: jakaja · vastaus (+ jäännös) = jaettava.</li><li>Onko jäännös pienempi kuin jakaja?</li><li>Ovatko nollat oikeilla paikoilla?</li><li>Sanatehtävissä: vastaako luku kysymykseen?</li></ul></div>' +
      (emptyN ? '<p class="weak">' + emptyN + ' tehtävää on vielä vastaamatta.</p>' : '<p class="okline">Kaikkiin tehtäviin on vastattu.</p>') +
      '<div class="rv-list">' + rows + '</div><div class="btn-row"><button class="cta big" data-act="exam-submit">Palauta koe</button></div></section></main>';
  }
  function submitExam() {
    var res = sess.qs.map(function (q) { return null; }), pts = 0;
    sess.qs.forEach(function (q, i) {
      var st = q.examStep, a = sess.answers[i], g = isEmpty(st, a) ? { ok: false, tag: null, msg: 'Vastaus puuttui.' } : grade(st, a, topicOf(q));
      res[i] = g; if (g.ok) pts++;
      var tid = topicOf(q), s = S.stats[tid] || (S.stats[tid] = { asked: 0, first: 0, correct: 0 }); s.asked++; if (g.ok) { s.first++; s.correct++; }
      if (!g.ok && g.tag) logError(g.tag, tid);
    });
    var pct = Math.round(100 * pts / sess.qs.length), gr = Q.gradeOf(pct);
    S.exam.runs++; S.exam.history = (S.exam.history || []).concat([{ pct: pct, grade: gr, d: Date.now() }]).slice(-20);
    if (S.exam.best == null || pct > S.exam.best) { S.exam.best = pct; S.exam.bestGrade = gr; }
    S.bones += pts; save();
    go('examResult', { res: res, pts: pts, pct: pct, grade: gr, time: elapsed() });
  }
  function screenExamResult() {
    var r = view, wrong = sess.qs.map(function (q, i) { return { q: q, i: i, g: r.res[i] }; }).filter(function (x) { return !x.g.ok; });
    var tc = {}; wrong.forEach(function (w) { if (w.g.tag) tc[w.g.tag] = (tc[w.g.tag] || 0) + 1; });
    var tags = Object.keys(tc).sort(function (a, b) { return tc[b] - tc[a]; });
    var tier = r.pct >= 90 ? 3 : r.pct >= 75 ? 2 : r.pct >= 55 ? 1 : 0;
    return hud() + '<main class="exam-result"><section class="card verdict"><div class="verdict-top">' + D.ICONS.rosette(tier, 'ico-rosette-big') + '<div><p class="verdict-code">' + r.grade + '</p><p class="verdict-name">arvosana-arvio</p></div></div>' +
      '<p class="verdict-score"><b>' + r.pts + '</b> / ' + sess.qs.length + ' oikein (' + r.pct + ' %) · aika ' + r.time + '</p>' +
      '<p class="judge">' + (r.pct >= 90 ? 'Erinomaista! Olet valmis kokeeseen.' : r.pct >= 75 ? 'Tosi hyvä! Hio vielä alla olevia kohtia, niin numero nousee.' : r.pct >= 55 ? 'Hyvä alku. Treenaa virhetutkan löytämiä asioita ja kokeile uudelleen.' : 'Harjoitellaan vielä. Aloita treenipolulta alla olevista aiheista.') + '</p>' +
      '<div class="btn-row"><button class="cta" data-act="exam-start">Uusi koe</button><button class="ghost" data-act="home">Kotiin</button></div></section>' +
      (tags.length ? '<section class="card"><h2>' + ICON.radar + 'Virhetutka</h2><div class="practice-list">' + tags.map(function (k) {
        return '<button class="practice" data-act="level" data-topic="' + Q.TAGS[k].topic + '"><span><b>' + Q.TAGS[k].name + ' (' + tc[k] + ')</b>' + Q.TAGS[k].tip + '</span><i>Treenaa</i></button>';
      }).join('') + '</div></section>' : '') +
      (wrong.length ? '<section class="card"><h2>Korjaukset</h2><div class="corr-list">' + wrong.map(function (w) {
        var st = w.q.examStep;
        return '<div class="corr"><span class="rv-n">' + (w.i + 1) + '</span><div><p class="corr-q">' + esc(stripTags(st.lead)) + ' ' + taskCore(st) + '</p>' +
          '<p>Sinun vastauksesi: ' + answerSummary(st, sess.answers[w.i]) + '</p><p class="corr-a">Oikea vastaus: <b>' + st.answerText + '</b></p>' + (w.g.msg ? '<p class="radar-note small">' + w.g.msg + '</p>' : '') + '</div></div>';
      }).join('') + '</div></section>' : '<section class="card"><h2>Täydet pisteet!</h2><p>Kaikki tehtävät oikein. Upeaa!</p></section>') + '</main>';
  }

  /* ===================================================================== */
  /*                             VIRHETUTKA                                  */
  /* ===================================================================== */
  function screenRadar() {
    var recent = S.errlog.slice(-60), c = {};
    recent.forEach(function (e) { c[e.tag] = (c[e.tag] || 0) + 1; });
    var keys = Object.keys(Q.TAGS), max = Math.max.apply(null, keys.map(function (k) { return c[k] || 0; }).concat([1]));
    var asked = 0, first = 0; Object.keys(S.stats).forEach(function (k) { asked += S.stats[k].asked; first += S.stats[k].first; });
    var top = topTags(3);
    if (!recent.length) return hud() + '<main class="radar"><section class="card"><h1>Virhetutka</h1><p>Tutka on vielä tyhjä. Kun treenaat, tutka huomaa, millaisia virheitä sattuu – esimerkiksi unohtuneet nollat tai jakamatta jäänyt osa – ja kertoo, mitä kannattaa harjoitella.</p><button class="cta" data-act="home">Treenaamaan</button></section></main>';
    return hud() + '<main class="radar"><section class="card"><h1>Virhetutka</h1>' +
      '<p>Oikein ensimmäisellä yrityksellä: <b>' + (asked ? Math.round(100 * first / asked) : 0) + ' %</b> (' + asked + ' tehtävää). Paras huolellisuusputki: <b>' + S.streakBest + '</b>.</p>' +
      '<div class="bars">' + keys.map(function (k) { var n = c[k] || 0; return '<div class="bar-row"><span class="bar-name">' + Q.TAGS[k].name + '</span><span class="bar"><span style="width:' + Math.round(100 * n / max) + '%"></span></span><b>' + n + '</b></div>'; }).join('') + '</div>' +
      '<p class="small">Luvut ovat viimeisestä ' + recent.length + ' virheestä.</p></section>' +
      '<section class="card"><h2>Treenaa näitä seuraavaksi</h2><div class="practice-list">' + top.map(function (t) { var g = Q.TAGS[t.tag]; return '<button class="practice" data-act="level" data-topic="' + g.topic + '"><span><b>' + g.name + '</b>' + g.tip + '</span><i>Treenaa</i></button>'; }).join('') + '</div></section></main>';
  }

  /* ===================================================================== */
  /*                               PENTUE                                    */
  /* ===================================================================== */
  function screenPups() {
    var cells = Q.TOPICS.map(function (t, i) {
      var p = S.pups[t.id];
      if (!p) return '<div class="pup locked"><div class="pup-pic">' + D.drawDog({ coat: 'lumi', age: 0, animate: false, viewBox: '30 0 180 180' }) + '</div><b>?</b><span>' + t.trick + '</span></div>';
      return '<button class="pup" data-act="pup" data-t="' + t.id + '"><div class="pup-pic">' + pupSvg(p) + '</div><b>' + esc(p.name) + '</b><span>' + t.trick + ' ' + [1, 2, 3].map(function (k) { return D.ICONS.star('ico-star', k <= (S.stars[t.id] || 0)); }).join('') + '</span></button>';
    }).join('');
    return hud() + '<main class="pups-screen"><section class="card"><h1>Pentue</h1><p>Jokaisesta treenipolun esteestä saat uuden pentukaverin. Napauta pentua, niin voit pukea sen. Yksi asuste maksaa 5 luuta.</p><div class="pup-grid">' + cells + '</div></section></main>';
  }
  var HATS = [['', 'Ei hattua'], ['rusetti', 'Rusetti'], ['kukat', 'Kukkaseppele'], ['juhlahattu', 'Juhlahattu'], ['pipo', 'Pipo'], ['lasit', 'Sydänlasit'], ['kruunu', 'Kruunu']];
  var NECKS = [['', 'Ei mitään'], ['panta', 'Panta'], ['huivi', 'Huivi'], ['kaulaliina', 'Kaulaliina']];
  function openPup(tid) {
    var p = S.pups[tid], three = S.stars[tid] === 3;
    $ov.innerHTML = '<div class="settings pup-dress" role="dialog" aria-modal="true"><h2>' + esc(p.name) + '</h2><div class="dress-pic">' + pupSvg(p, { animate: true, viewBox: '0 0 240 240', scene: 'koti' }) + '</div>' +
      '<h3>Päähän</h3><div class="pills">' + HATS.map(function (h) { var lockd = h[0] === 'kruunu' && !three; return '<button class="pill' + (p.hat === h[0] ? ' on' : '') + '" data-act="dress" data-k="hat" data-v="' + h[0] + '"' + (lockd ? ' disabled title="Kruunu vaatii kolme tähteä"' : '') + '>' + h[1] + (lockd ? ' (3 tähteä)' : '') + '</button>'; }).join('') + '</div>' +
      '<h3>Kaulaan</h3><div class="pills">' + NECKS.map(function (h) { return '<button class="pill' + (p.neck === h[0] ? ' on' : '') + '" data-act="dress" data-k="neck" data-v="' + h[0] + '">' + h[1] + '</button>'; }).join('') + '</div>' +
      '<p class="wallet">Sinulla on <b>' + S.bones + '</b> ' + D.ICONS.bone('ico-bone') + '</p><div class="btn-row"><button class="cta" data-act="settings-close">Valmis</button></div></div>';
    $ov.hidden = false; $ov.dataset.pup = tid; rewardCb = function () { render(); };
  }

  /* ===================================================================== */
  /*                            LEIKKIPUISTO                                 */
  /* ===================================================================== */
  function d6() { return 1 + Math.floor(Math.random() * 6); }
  function screenPark() {
    if (!game) return hud() + '<main class="park"><section class="card park-intro"><h1>Leikkipuisto</h1><p>Kirjan pelit, ' + esc(S.dog.name) + ' vastustajana. Voitosta saat luita ja koiravinkin.</p></section>' +
      '<button class="game-card" data-act="game" data-g="noppa2">' + D.ICONS.die(2, 'ico-die') + '<span><b>Jakolaskupeli kahdella nopalla</b>Yksi noppa on jakaja. Kahdesta nopasta muodostat jaettavan ja päätät numeroiden järjestyksen. Piste tulee, jos jako menee tasan ja laskit sen oikein.</span></button>' +
      '<button class="game-card" data-act="game" data-g="noppa3">' + D.ICONS.die(3, 'ico-die') + '<span><b>Jakolaskupeli kolmella nopalla</b>Kolmesta nopasta tulee kolminumeroinen jaettava. Tasan menevä jako ja suurempi tulos kuin kaverilla tuovat eniten pisteitä.</span></button>' +
      '<button class="game-card" data-act="game" data-g="kala">' + ICON.park + '<span><b>Kalasta jakolaskuilla</b>Heitä noppaa ja etene polulla. Ruudun luku on jakaja: nappaa kala, jonka luvun voi jakaa sillä tasan. Eniten kaloja saanut voittaa.</span></button></main>';
    return hud() + '<main class="park">' + (game.g === 'kala' ? gameKala() : gameNoppa()) + '</main>';
  }
  /* --- Noppapelit --- */
  function newNoppa(n) { game = { g: 'noppa' + n, n: n, round: 1, me: 0, dog: 0, phase: 'div', myDiv: null, dice: [], order: [], log: [] }; }
  function dogPlay(n) {
    var dv = d6(), ds = []; for (var i = 0; i < n; i++) ds.push(d6());
    var perms = []; (function p(a, c) { if (!a.length) { perms.push(Number(c.join(''))); return; } a.forEach(function (x, i) { p(a.slice(0, i).concat(a.slice(i + 1)), c.concat([x])); }); })(ds, []);
    var exact = perms.filter(function (x) { return x % dv === 0; }), num = exact.length ? Math.max.apply(null, exact) : Math.max.apply(null, perms);
    return { dv: dv, num: num, q: Math.floor(num / dv), r: num % dv };
  }
  function gameNoppa() {
    var g = game, body = '';
    if (g.phase === 'div') body = '<p class="game-msg">Kierros ' + g.round + '/5. Heitä ensin jakaja.</p><button class="cta big" data-act="n-div">Heitä jakaja</button>';
    else if (g.phase === 'dice') body = '<div class="dice-row">' + D.ICONS.die(g.myDiv, 'ico-die big') + '<p class="game-msg">Jakaja on <b>' + g.myDiv + '</b>. Heitä sitten ' + g.n + ' noppaa jaettavaksi.</p></div><button class="cta big" data-act="n-dice">Heitä ' + g.n + ' noppaa</button>';
    else if (g.phase === 'order') body = '<p class="game-msg">Jakaja on <b>' + g.myDiv + '</b>. Napauta noppia siinä järjestyksessä, jossa haluat numerot jaettavaan. Yritä saada jako menemään tasan!</p><div class="dice-pick">' + g.dice.map(function (v, i) { var used = g.order.indexOf(i) >= 0; return '<button class="die-btn' + (used ? ' used' : '') + '" data-act="n-pick" data-i="' + i + '"' + (used ? ' disabled' : '') + '>' + D.ICONS.die(v, 'ico-die') + '</button>'; }).join('') + '</div>' +
      '<p class="built">Jaettava: <b>' + (g.order.map(function (i) { return g.dice[i]; }).join('') || '–') + '</b></p>' + (g.order.length ? '<button class="ghost" data-act="n-reset">Aloita järjestys alusta</button>' : '');
    else if (g.phase === 'calc') { body = '<p class="game-msg">Laske jakolasku. Jos jako ei mene tasan, kirjoita jäännös.</p><div class="fill big-fill">' + g.num + ' : ' + g.myDiv + ' = <span class="field" data-slot data-f="0" data-max="3"></span>, jää <span class="field" data-slot data-f="1" data-max="1"></span></div>' + numpadMini() + '<button class="cta big" data-act="n-calc">Valmis</button>'; }
    else if (g.phase === 'result' || g.phase === 'end') {
      var last = g.log[g.log.length - 1];
      body = '<div class="round-res"><p>Sinä: ' + last.me.num + ' : ' + last.me.dv + ' = ' + last.me.q + (last.me.r ? ', jää ' + last.me.r : '') + (last.me.calcOk ? '' : ' <span class="bad-t">(laskit ' + last.me.given + ')</span>') + ' → <b>+' + last.me.pts + '</b></p>' +
        '<p>' + esc(S.dog.name) + ': ' + last.dog.num + ' : ' + last.dog.dv + ' = ' + last.dog.q + (last.dog.r ? ', jää ' + last.dog.r : '') + ' → <b>+' + last.dog.pts + '</b></p></div>' +
        (g.phase === 'end' ? '<p class="game-msg"><b>' + (g.me > g.dog ? 'Voitit pelin!' : g.me < g.dog ? esc(S.dog.name) + ' voitti tällä kertaa.' : 'Tasapeli!') + '</b></p><button class="cta big" data-act="game" data-g="' + g.g + '">Pelaa uudestaan</button>' : '<button class="cta big" data-act="n-next">Seuraava kierros</button>');
    }
    return '<section class="card game"><div class="game-head"><button class="icon-btn" data-act="park-back" aria-label="Takaisin">' + ICON.back + '</button><h1>Jakolaskupeli ' + (g.n === 2 ? 'kahdella' : 'kolmella') + ' nopalla</h1></div>' +
      '<div class="scoreboard"><span>Sinä <b>' + g.me + '</b></span><span>' + esc(S.dog.name) + ' <b>' + g.dog + '</b></span></div>' + body + '</section>';
  }
  function numpadMini() { return '<div class="numpad numpad-s">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(function (k) { return '<button class="key" data-key="' + k + '">' + k + '</button>'; }).join('') + '<button class="key key-fn" data-key="back" aria-label="Pyyhi">' + ICON.del + '</button><button class="key" data-key="0">0</button><button class="key key-fn" data-key="next" aria-label="Seuraava ruutu">' + ICON.next + '</button></div>'; }
  function noppaCalc() {
    var g = game, f = $$('.fill .field'), qv = f[0].textContent === '' ? null : +f[0].textContent, rv = f[1].textContent === '' ? 0 : +f[1].textContent;
    if (qv == null) { toast('Kirjoita osamäärä.'); return; }
    var q = Math.floor(g.num / g.myDiv), r = g.num % g.myDiv, calcOk = qv === q && rv === r;
    var dog = dogPlay(g.n), exactMe = r === 0, exactDog = dog.r === 0, me, dp;
    if (g.n === 2) { me = calcOk && exactMe ? 1 : 0; dp = exactDog ? 1 : 0; }
    else {
      var bigger = q > dog.q, dBigger = dog.q > q;
      me = !calcOk ? 0 : exactMe ? (bigger ? 2 : 1) : (bigger ? 1 : 0);
      dp = exactDog ? (dBigger ? 2 : 1) : (dBigger ? 1 : 0);
    }
    if (!calcOk) logError(r ? 'jaannos' : 'kertotaulu', 'jaannos');
    g.me += me; g.dog += dp;
    g.log.push({ me: { num: g.num, dv: g.myDiv, q: q, r: r, pts: me, calcOk: calcOk, given: qv + (rv ? ', jää ' + rv : '') }, dog: { num: dog.num, dv: dog.dv, q: dog.q, r: dog.r, pts: dp } });
    sfx[calcOk ? 'ok' : 'bad']();
    g.phase = g.round >= 5 ? 'end' : 'result';
    if (g.phase === 'end' && g.me > g.dog && !g.rewarded) { g.rewarded = true; S.bones += 6; save(); render(); setTimeout(function () { showReward({ title: 'Voitit pelin!', bones: 6 }, render); }, 400); return; }
    render();
  }
  /* --- Kalastus --- */
  var KALA_PATH = [4, 2, 3, 3, 8, 7, 9, 5, 6, 2, 7, 5, 9, 7, 8, 4, 6, 9, 3, 8, 7, 2, 6, 5];
  var FISH = [12, 14, 18, 45, 30, 49, 42, 35, 54, 48, 64, 36, 90, 24, 56, 27, 16, 72, 21, 70, 15];
  function newKala() { game = { g: 'kala', pos: { me: -1, dog: -1 }, fish: shuffle(FISH).map(function (v) { return { v: v, by: null }; }), turn: 'me', die: null, cur: null, msg: 'Heitä noppaa ja lähde liikkeelle!', phase: 'roll' }; }
  function fishSvg(v, by, i) {
    var col = by === 'me' ? '#2BB3A3' : by === 'dog' ? '#C9D4E0' : ['#7FD1FF', '#FFB86B', '#A7E07A', '#FF9FB7'][i % 4];
    return '<svg viewBox="0 0 90 50" aria-hidden="true"><path d="M8 25c10-18 44-22 62 0c-18 22-52 18-62 0z" fill="' + col + '" stroke="#1F2A44" stroke-width="3"/><path d="M70 25l16-12v24z" fill="' + col + '" stroke="#1F2A44" stroke-width="3" stroke-linejoin="round"/><circle cx="22" cy="21" r="3.2" fill="#1F2A44"/><text x="42" y="31" text-anchor="middle" font-size="17" font-weight="800" fill="#1F2A44" font-family="Baloo 2, sans-serif">' + v + '</text></svg>';
  }
  function gameKala() {
    var g = game, path = KALA_PATH.map(function (v, i) {
      var tokens = (g.pos.me === i ? '<i class="tok tok-me"></i>' : '') + (g.pos.dog === i ? '<i class="tok tok-dog"></i>' : '');
      return '<span class="sq' + ((g.turn === 'me' ? g.pos.me : g.pos.dog) === i ? ' here' : '') + '">' + v + tokens + '</span>';
    }).join('');
    var fishes = g.fish.map(function (f, i) { return '<button class="fish' + (f.by ? ' caught by-' + f.by : '') + '" data-act="k-fish" data-i="' + i + '"' + (f.by || g.phase !== 'catch' ? ' disabled' : '') + ' aria-label="Kala ' + f.v + '">' + fishSvg(f.v, f.by, i) + '</button>'; }).join('');
    var meN = g.fish.filter(function (f) { return f.by === 'me'; }).length, dogN = g.fish.filter(function (f) { return f.by === 'dog'; }).length;
    var ctrl = g.phase === 'roll' ? '<button class="cta big" data-act="k-roll">Heitä noppaa</button>' : g.phase === 'catch' ? '<button class="ghost" data-act="k-none">Ei sopivaa kalaa</button>' : g.phase === 'end' ? '<button class="cta big" data-act="game" data-g="kala">Pelaa uudestaan</button>' : '';
    return '<section class="card game"><div class="game-head"><button class="icon-btn" data-act="park-back" aria-label="Takaisin">' + ICON.back + '</button><h1>Kalasta jakolaskuilla</h1></div>' +
      '<div class="scoreboard"><span><i class="tok tok-me"></i>Sinä <b>' + meN + '</b></span><span><i class="tok tok-dog"></i>' + esc(S.dog.name) + ' <b>' + dogN + '</b></span></div>' +
      '<div class="kala-path"><span class="sq start">Lähtö</span>' + path + '<span class="sq goal">Maali</span></div><div class="pond">' + fishes + '</div>' +
      '<div class="dice-row">' + (g.die ? D.ICONS.die(g.die, 'ico-die big') : '<span class="die-empty"></span>') + '<p class="game-msg">' + g.msg + '</p></div>' + ctrl + '</section>';
  }
  function kalaMove(who) {
    var g = game; g.die = d6();
    g.pos[who] = Math.min(KALA_PATH.length, g.pos[who] + g.die);
    if (g.pos[who] >= KALA_PATH.length) { g.pos[who] = KALA_PATH.length; return null; }
    return KALA_PATH[g.pos[who]];
  }
  function kalaDogTurn() {
    var g = game; g.turn = 'dog'; g.phase = 'wait'; render();
    setTimeout(function () {
      if (g.pos.dog < KALA_PATH.length) {
        var v = kalaMove('dog');
        if (v == null) g.msg = esc(S.dog.name) + ' pääsi maaliin!';
        else {
          var opts = g.fish.filter(function (f) { return !f.by && f.v % v === 0; });
          if (opts.length) { var best = opts.sort(function (a, b) { return b.v - a.v; })[0]; best.by = 'dog'; g.msg = esc(S.dog.name) + ' sai ruudusta ' + v + ' kalan ' + best.v + ' (' + best.v + ' : ' + v + ' = ' + (best.v / v) + ').'; }
          else g.msg = esc(S.dog.name) + ' sai ruudun ' + v + ', mutta sopivaa kalaa ei ollut.';
        }
      }
      kalaAfter();
    }, reduceMotion ? 200 : 900);
  }
  function kalaAfter() {
    var g = game, left = g.fish.filter(function (f) { return !f.by; }).length;
    var done = (g.pos.me >= KALA_PATH.length && g.pos.dog >= KALA_PATH.length) || !left;
    if (done) {
      var meN = g.fish.filter(function (f) { return f.by === 'me'; }).length, dogN = g.fish.filter(function (f) { return f.by === 'dog'; }).length;
      g.phase = 'end'; g.msg += '<br><b>' + (meN > dogN ? 'Voitit! Sait ' + meN + ' kalaa.' : meN < dogN ? esc(S.dog.name) + ' voitti tällä kertaa.' : 'Tasapeli!') + '</b>';
      render();
      if (meN > dogN && !g.rewarded) { g.rewarded = true; S.bones += 6; save(); setTimeout(function () { showReward({ title: 'Voitit kalastuksen!', bones: 6 }, render); }, 500); }
      return;
    }
    if (g.pos.me >= KALA_PATH.length) { kalaDogTurn(); return; }
    g.turn = 'me'; g.phase = 'roll'; render();
  }

  /* ===================================================================== */
  /*                             ASETUKSET                                   */
  /* ===================================================================== */
  function openSettings() {
    $ov.innerHTML = '<div class="settings" role="dialog" aria-modal="true" aria-labelledby="st-t"><h2 id="st-t">Asetukset</h2>' +
      '<label class="namefield"><span>Koiran nimi</span><input id="set-name" maxlength="14" value="' + esc(S.dog.name) + '"></label>' +
      '<h3>Koiran väri</h3><div class="swatches small">' + Object.keys(D.COATS).map(function (k) { return '<button class="swatch small' + (S.dog.coat === k ? ' on' : '') + '" data-act="set-coat" data-v="' + k + '" aria-label="' + D.COATS[k].name + '">' + D.drawDog({ coat: k, ears: S.dog.ears, age: 0, animate: false, viewBox: '36 2 168 168' }) + '</button>'; }).join('') + '</div>' +
      '<h3>Korvat</h3><div class="pills">' + Object.keys(D.EARS).map(function (k) { return '<button class="pill' + (S.dog.ears === k ? ' on' : '') + '" data-act="set-ears" data-v="' + k + '">' + D.EARS[k] + '</button>'; }).join('') + '</div>' +
      '<label class="switch"><input type="checkbox" id="set-sound"' + (S.settings.sound ? ' checked' : '') + '><span>Äänitehosteet</span></label>' +
      '<p class="small">Selitysääni: ' + (TTS.hasVoice() ? 'ElevenLabs-ääni käytössä. Ääni haetaan vain, kun painat Selitä-nappia, ja kerran kuunneltu selitys tallentuu laitteelle.' : 'Laitteen oma puheääni (ElevenLabs-avainta ei ole asetettu).') + '</p>' +
      '<div class="btn-row"><button class="cta" data-act="settings-close">Valmis</button><button class="ghost danger" data-act="reset">Aloita alusta</button></div><p class="small">Versio ' + VERSION + '</p></div>';
    $ov.hidden = false; rewardCb = function () { render(); };
  }
  function saveSettings() {
    var n = document.getElementById('set-name'), so = document.getElementById('set-sound');
    if (n && n.value.trim()) S.dog.name = n.value.trim().slice(0, 14);
    if (so) S.settings.sound = so.checked;
    save();
  }

  /* ===================================================================== */
  /*                             TAPAHTUMAT                                  */
  /* ===================================================================== */
  function onClick(e) {
    var key = e.target.closest('[data-key]');
    if (key && $app.contains(key)) {
      if (key.closest('.locked')) return;
      var k = key.dataset.key;
      if (k === 'back') backspace(); else if (k === 'next') nextSlot(); else typeDigit(k);
      return;
    }
    var slot = e.target.closest('[data-slot]');
    if (slot && $app.contains(slot) && !slot.closest('.locked')) { setActive(slot); return; }
    var el = e.target.closest('[data-act]'); if (!el) return;
    var act = el.dataset.act, st;
    switch (act) {
      case 'home': game = null; go('home'); break;
      case 'settings': openSettings(); break;
      case 'level': startLevel(el.dataset.topic); break;
      case 'examIntro': go('examIntro'); break;
      case 'exam-start': startExam(); break;
      case 'radar': go('radar'); break;
      case 'park': game = null; go('park'); break;
      case 'pups': go('pups'); break;
      case 'pup': openPup(el.dataset.t); break;
      case 'quit':
        if (sess && sess.mode === 'exam') { if (!window.confirm('Keskeytetäänkö koe? Vastaukset eivät tallennu.')) return; }
        else if (sess && sess.results && sess.results.length && !window.confirm('Lopetetaanko treeni? Kierroksen tulokset jäävät kesken.')) return;
        sess = null; go('home'); break;
      case 'check': check(); break;
      case 'opt': chooseOpt(+el.dataset.i, el); break;
      case 'chip': if (el.disabled) return; el.classList.toggle('on'); el.setAttribute('aria-pressed', el.classList.contains('on')); el.classList.remove('bad'); sfx.tap();
        if (sess.mode === 'exam') { st = curStep(); var a = readAnswer(st); sess.answers[sess.qi] = a.sel.length ? a : null; } break;
      case 'mleft': $$('.m-left').forEach(function (b) { b.classList.remove('sel'); }); el.classList.add('sel'); mSel = +el.dataset.i; sfx.tap(); break;
      case 'mright': {
        if (mSel == null) { toast('Napauta ensin vasemmalta jakolaskua.'); return; }
        var map = sess.mode === 'exam' ? ((sess.answers[sess.qi] && sess.answers[sess.qi].map) || {}) : (sess.matchMap || {});
        Object.keys(map).forEach(function (kk) { if (map[kk] === +el.dataset.j) delete map[kk]; });
        map[mSel] = +el.dataset.j;
        if (sess.mode === 'exam') sess.answers[sess.qi] = { map: map }; else sess.matchMap = map;
        render(); mSel = null; var nb = $$('.m-left').filter(function (b, i) { return map[i] == null; })[0]; if (nb) { nb.classList.add('sel'); mSel = +nb.dataset.i; }
        sfx.tap(); break;
      }
      case 'nextq': nextQ(); break;
      case 'nextstep': stopExplain(); sess.si++; sess.tries = 0; render(); break;
      case 'explain': {
        /* Teksti näytetään vasta, kun ääni on lausuttu loppuun (tai lapsi lopettaa sen / ääni ei toimi). */
        st = curStep(); var box = document.getElementById('explain'), token = ++explainToken;
        var showText = function () { if (token === explainToken && box && document.body.contains(box)) box.hidden = false; };
        try { TTS.speak(st.explain).then(showText, showText); } catch (er) { showText(); }
        break;
      }
      case 'helper': { var h = document.getElementById('helper'); h.hidden = !h.hidden; el.setAttribute('aria-expanded', String(!h.hidden)); break; }
      case 'exam-prev': examGo(sess.qi - 1); break;
      case 'exam-next': examSave(); if (sess.answers[sess.qi]) toast('Vastaus tallennettu. Tulokset näet kokeen lopussa.'); if (sess.qi === sess.qs.length - 1) { examSave(); go('review'); } else examGo(sess.qi + 1); break;
      case 'exam-goto': if (view.name === 'review') { view = { name: 'level' }; sess.qi = +el.dataset.i; render(); window.scrollTo(0, 0); } else examGo(+el.dataset.i); break;
      case 'exam-back': view = { name: 'level' }; render(); break;
      case 'exam-submit': {
        var emptyN = sess.qs.filter(function (q, i) { return isEmpty(q.examStep, sess.answers[i]); }).length;
        if (emptyN && !window.confirm(emptyN + ' tehtävää on vastaamatta. Palautetaanko silti?')) return;
        submitExam(); break;
      }
      case 'adopt-coat': draft.coat = el.dataset.v; draft.name = document.getElementById('dogname').value; render(); break;
      case 'adopt-ears': draft.ears = el.dataset.v; draft.name = document.getElementById('dogname').value; render(); break;
      case 'adopt-go': S.dog = { name: (document.getElementById('dogname').value || 'Nappi').trim().slice(0, 14) || 'Nappi', coat: draft.coat, ears: draft.ears }; save(); sfx.win(); go('home'); break;
      case 'game': if (el.dataset.g === 'kala') newKala(); else newNoppa(el.dataset.g === 'noppa3' ? 3 : 2); render(); break;
      case 'park-back': game = null; render(); break;
      case 'n-div': game.myDiv = d6(); game.phase = 'dice'; sfx.tap(); render(); break;
      case 'n-dice': game.dice = []; for (var i = 0; i < game.n; i++) game.dice.push(d6()); game.order = []; game.phase = 'order'; sfx.tap(); render(); break;
      case 'n-pick': game.order.push(+el.dataset.i); sfx.tap(); if (game.order.length === game.n) { game.num = Number(game.order.map(function (j) { return game.dice[j]; }).join('')); game.phase = 'calc'; render(); initSlots(); } else render(); break;
      case 'n-reset': game.order = []; render(); break;
      case 'n-calc': noppaCalc(); break;
      case 'n-next': game.round++; game.phase = 'div'; game.myDiv = null; render(); break;
      case 'k-roll': {
        var v = kalaMove('me');
        if (v == null) { game.msg = 'Pääsit maaliin!'; kalaDogTurn(); }
        else { game.cur = v; game.phase = 'catch'; game.msg = 'Ruudun luku on <b>' + v + '</b>. Napauta kalaa, jonka luvun voi jakaa tasan luvulla ' + v + '.'; render(); }
        break;
      }
      case 'k-fish': {
        var f = game.fish[+el.dataset.i], cv = game.cur;
        if (f.v % cv === 0) { f.by = 'me'; sfx.ok(); game.msg = 'Saalis! ' + f.v + ' : ' + cv + ' = ' + (f.v / cv) + '.'; }
        else { sfx.bad(); logError('jaollisuus', 'jaollisuus'); game.msg = 'Hups! ' + f.v + ' : ' + cv + ' = ' + Math.floor(f.v / cv) + ', jää ' + (f.v % cv) + '. Vuoro siirtyy.'; }
        kalaDogTurn(); break;
      }
      case 'k-none': {
        var cv2 = game.cur, any = game.fish.filter(function (x) { return !x.by && x.v % cv2 === 0; });
        if (any.length) { sfx.bad(); game.msg = 'Löytyi kyllä: ' + any.map(function (x) { return x.v; }).join(', ') + ' (esim. ' + any[0].v + ' : ' + cv2 + ' = ' + (any[0].v / cv2) + '). Vuoro siirtyy.'; logError('jaollisuus', 'jaollisuus'); }
        else { sfx.ok(); game.msg = 'Oikein, yhtään kalaa ei voinut jakaa luvulla ' + cv2 + '.'; }
        kalaDogTurn(); break;
      }
    }
  }
  function onOverlay(e) {
    var el = e.target.closest('[data-act]');
    if (!el) { if (e.target === $ov && $ov.querySelector('.settings')) { saveSettings(); closeOverlay(); } return; }
    var act = el.dataset.act;
    if (act === 'reward-close') closeOverlay();
    else if (act === 'settings-close') { saveSettings(); closeOverlay(); }
    else if (act === 'set-coat') { saveSettings(); S.dog.coat = el.dataset.v; save(); openSettings(); }
    else if (act === 'set-ears') { saveSettings(); S.dog.ears = el.dataset.v; save(); openSettings(); }
    else if (act === 'dress') {
      var tid = $ov.dataset.pup, p = S.pups[tid], k = el.dataset.k, v = el.dataset.v;
      if (p[k] === v) return;
      if (S.bones < 5) { toast('Tarvitset 5 luuta. Treenaa lisää!'); return; }
      S.bones -= 5; p[k] = v; save(); sfx.tap(); openPup(tid);
    }
    else if (act === 'reset') { if (window.confirm('Aloitetaanko alusta? Tähdet, pentue ja luut nollautuvat.')) { try { localStorage.removeItem(KEY); } catch (er) { /* ok */ } S = defaultState(); S.dog = null; rewardCb = null; closeOverlay(); sess = null; game = null; go('adopt'); } }
  }
  function onKey(e) {
    if (!$ov.hidden) {
      if (e.key === 'Enter' || e.key === 'Escape') { if ($ov.querySelector('[data-act="reward-close"]')) { e.preventDefault(); closeOverlay(); } else if (e.key === 'Escape') { saveSettings(); closeOverlay(); } }
      return;
    }
    if (e.target.tagName === 'INPUT') return;
    var inLevel = view.name === 'level', inCalc = game && game.phase === 'calc';
    if (!inLevel && !inCalc) return;
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); typeDigit(e.key); }
    else if (e.key === 'Backspace') { e.preventDefault(); backspace(); }
    else if (e.key === 'Tab' && active) { e.preventDefault(); nextSlot(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (inCalc) { noppaCalc(); return; }
      var nb = $('.feedback [data-act]');
      if (nb) nb.click();
      else if (sess.mode === 'exam') { var n = $('[data-act="exam-next"]'); if (n) n.click(); }
      else if ($('[data-act="check"]') && !$('.pad-area.locked')) check();
    }
  }
  /* Näytä mahdollinen virhe ruudulla, jotta vian voi kertoa tarkasti */
  var VERSION = '2026-11-09d';
  window.addEventListener('error', function (e) { try { toast('Hups, virhe: ' + esc(e.message || '') + ' (versio ' + VERSION + ')'); } catch (er) { /* ok */ } });
  $app.addEventListener('click', onClick);
  $ov.addEventListener('click', onOverlay);
  document.addEventListener('keydown', onKey);

  /* Ajastin kokeeseen ja selitysnapin tila */
  setInterval(function () { var t = document.getElementById('timer'); if (t && sess && sess.t0) t.textContent = elapsed(); }, 1000);
  TTS.on(function (state) {
    var b = $('[data-act="explain"]'); if (!b) return;
    b.classList.toggle('loading', state === 'loading'); b.classList.toggle('playing', state === 'playing');
    b.innerHTML = (state === 'playing' ? ICON.stop + '<span>Lopeta</span>' : state === 'loading' ? ICON.speaker + '<span>Haetaan…</span>' : ICON.speaker + '<span>Selitä</span>');
  });

  window.JT_APP = { state: function () { return S; }, session: function () { return sess; }, go: go, startLevel: startLevel, startExam: startExam, game: function () { return game; } };
  if (S.dog && S.dog.imported && !S.dog.welcomed) { S.dog.welcomed = true; save(); setTimeout(function () { toast(esc(S.dog.name) + ' tuli mukaan Tassutreenistä!'); }, 400); }
  render();
})();
