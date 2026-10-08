/* Tassutreeni – pelin käyttöliittymä ja pelimekaniikka */
(function () {
  'use strict';

  var D = window.TT_DOGS, Q = window.TT_Q, TIPS = window.TT_TIPS;
  var KEY = 'tassutreeni.v1';
  var $app = document.getElementById('app');
  var $ov = document.getElementById('overlay');
  var $toast = document.getElementById('toast');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Tila ja tallennus ---------------- */
  function defaultState() {
    return {
      v: 1, dog: null, bones: 0, stars: {}, stats: {},
      owned: { puisto: true }, wear: { hat: '', neck: '', neckColor: '', prop: '', scene: 'puisto' },
      exam: { best: null, runs: 0 }, medal: false,
      settings: { sound: true, photos: false },
      tips: { order: [], i: 0 }
    };
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var o = JSON.parse(raw), d = defaultState(); for (var k in o) d[k] = o[k]; return d; }
    } catch (e) { /* ei tallennusta */ }
    return defaultState();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ei tallennusta */ } }
  var S = load();

  /* ---------------- Apurit ---------------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function totalStars() { var t = 0; for (var k in S.stars) t += S.stars[k] || 0; return t; }
  function stage() { return D.stageFor(totalStars()); }
  function dogOpts(extra) {
    var o = { coat: S.dog.coat, ears: S.dog.ears, age: stage(), hat: S.wear.hat, neck: S.wear.neck || (stage() === 4 && S.medal ? 'mitali' : ''), neckColor: S.wear.neckColor, prop: S.wear.prop, eyePatch: !!S.dog.eyePatch };
    for (var k in extra || {}) o[k] = extra[k];
    return o;
  }
  function tagDog(extra) { return D.drawDog(dogOpts(Object.assign({ viewBox: '36 2 168 168', animate: false, prop: '' }, extra || {}))); }
  function toast(msg) {
    $toast.textContent = msg; $toast.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { $toast.hidden = true; }, 2200);
  }

  var ICON = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7zM19.4 13.5l1.8 1.4-2 3.4-2.1-.8a7.6 7.6 0 0 1-2 1.2L14.8 21h-4l-.4-2.3a7.6 7.6 0 0 1-2-1.2l-2.1.8-2-3.4 1.8-1.4a7.7 7.7 0 0 1 0-2.4L4.3 9.7l2-3.4 2.1.8a7.6 7.6 0 0 1 2-1.2L10.8 3h4l.4 2.3a7.6 7.6 0 0 1 2 1.2l2.1-.8 2 3.4-1.8 1.4a7.7 7.7 0 0 1 0 2.4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    del: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11v12H9l-6-6z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M12.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h12m-4-5l5 5-5 5M20 6v12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    show: '<svg viewBox="0 0 64 64" aria-hidden="true">' + '<path d="M32 6l7 14 15 2-11 10 3 15-14-7-14 7 3-15L10 22l15-2z" fill="#FFCC33" stroke="#1F2A44" stroke-width="3" stroke-linejoin="round"/><path d="M22 44l-6 16 8-4 4 8 4-14M42 44l6 16-8-4-4 8-4-14" fill="#4F8BFF" stroke="#1F2A44" stroke-width="3" stroke-linejoin="round"/></svg>',
    park: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="12" width="26" height="26" rx="7" fill="#FFFFFF" stroke="#1F2A44" stroke-width="3" transform="rotate(-10 23 25)"/><circle cx="18" cy="20" r="3" fill="#1F2A44"/><circle cx="27" cy="29" r="3" fill="#1F2A44"/><rect x="30" y="26" width="26" height="26" rx="7" fill="#FFFFFF" stroke="#1F2A44" stroke-width="3" transform="rotate(12 43 39)"/><circle cx="37" cy="33" r="3" fill="#1F2A44"/><circle cx="43" cy="39" r="3" fill="#1F2A44"/><circle cx="49" cy="45" r="3" fill="#1F2A44"/></svg>',
    shop: '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 24h40l-4 30H16z" fill="#FF9FB7" stroke="#1F2A44" stroke-width="3" stroke-linejoin="round"/><path d="M22 24c0-14 20-14 20 0" fill="none" stroke="#1F2A44" stroke-width="3" stroke-linecap="round"/><path d="' + D.bonePath(32, 39, 22, 9) + '" fill="#FFF6E2" stroke="#1F2A44" stroke-width="2.4"/></svg>',
    chart: '<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="34" width="10" height="20" rx="3" fill="#7FD1FF" stroke="#1F2A44" stroke-width="3"/><rect x="27" y="22" width="10" height="32" rx="3" fill="#2FBF71" stroke="#1F2A44" stroke-width="3"/><rect x="44" y="10" width="10" height="44" rx="3" fill="#FFCC33" stroke="#1F2A44" stroke-width="3"/></svg>'
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
        o.connect(g); g.connect(actx.destination);
        o.start(t0 + i * dur); o.stop(t0 + (i + 1) * dur + 0.1);
      });
    } catch (e) { /* ei ääntä */ }
  }
  var sfx = {
    ok: function () { tone([660, 880, 1175], 0.09, 'triangle', 0.16); },
    bad: function () { tone([311, 262], 0.12, 'sine', 0.12); },
    tap: function () { tone([1400], 0.02, 'sine', 0.04); },
    win: function () { tone([523, 659, 784, 1047, 1319], 0.1, 'triangle', 0.16); }
  };

  /* ---------------- Vinkit ---------------- */
  function nextTip() {
    var n = TIPS.ALL.length;
    if (!S.tips.order || S.tips.order.length !== n || S.tips.i >= n) {
      S.tips.order = shuffle(Array.from({ length: n }, function (_, i) { return i; })); S.tips.i = 0;
    }
    var tip = TIPS.ALL[S.tips.order[S.tips.i]]; S.tips.i++; save();
    return tip;
  }

  /* ---------------- Oikeat koirakuvat (valinnainen) ---------------- */
  var BREEDS = ['pomeranian', 'shiba', 'corgi/cardigan', 'pembroke', 'samoyed', 'maltese', 'poodle/toy', 'retriever/golden', 'havanese', 'spitz/japanese', 'shihtzu', 'frise/bichon', 'beagle', 'pug', 'papillon', 'cavapoo', 'keeshond', 'cockapoo', 'labrador', 'eskimo'];
  var photoQueue = [], photoPending = 0;
  function prefetchPhoto() {
    if (!S.settings.photos || photoQueue.length + photoPending >= 3 || !window.fetch) return;
    photoPending++;
    fetch('https://dog.ceo/api/breed/' + pick(BREEDS) + '/images/random').then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.status === 'success') { var img = new Image(); img.onload = function () { photoQueue.push(j.message); photoPending--; }; img.onerror = function () { photoPending--; }; img.src = j.message; }
      else photoPending--;
    }).catch(function () { photoPending--; });
  }
  function rewardPicture() {
    if (S.settings.photos && photoQueue.length) {
      var url = photoQueue.shift(); prefetchPhoto(); prefetchPhoto();
      return '<img class="photo" src="' + esc(url) + '" alt="Söpö koira"><span class="credit">Kuva: Dog CEO</span>';
    }
    if (S.settings.photos) prefetchPhoto();
    return D.drawDog(Object.assign(D.randomDogOptions(), { label: 'Söpö piirretty koiranpentu' }));
  }

  /* ---------------- Navigointi ---------------- */
  var view = { name: S.dog ? 'home' : 'adopt' };
  var sess = null, park = null;

  function go(name, params) {
    view = Object.assign({ name: name }, params || {});
    render();
    window.scrollTo(0, 0);
  }

  function render() {
    var html = '';
    switch (view.name) {
      case 'adopt': html = screenAdopt(); break;
      case 'level': html = screenLevel(); break;
      case 'complete': html = screenComplete(); break;
      case 'shop': html = screenShop(); break;
      case 'park': html = screenPark(); break;
      case 'show': html = screenShow(); break;
      case 'progress': html = screenProgress(); break;
      default: html = screenHome();
    }
    $app.innerHTML = html;
    $app.className = 'screen-' + view.name;
    if (view.name === 'level') initSlots();
    if (view.name === 'adopt') { var inp = document.getElementById('dogname'); if (inp) inp.addEventListener('input', function () { adoptDraft.name = inp.value; }); }
  }

  function hud(title) {
    return '<header class="hud">' +
      '<button class="tag" data-act="home" aria-label="Kotiin">' + tagDog() + '</button>' +
      '<div class="hud-name"><b>' + esc(S.dog.name) + '</b><span>' + (title || D.STAGES[stage()].name) + '</span></div>' +
      '<div class="hud-bones" aria-label="' + S.bones + ' luuta">' + D.ICONS.bone('ico-bone') + '<b>' + S.bones + '</b></div>' +
      '<button class="icon-btn" data-act="settings" aria-label="Asetukset">' + ICON.gear + '</button>' +
      '</header>';
  }

  /* ---------------- Adoptio ---------------- */
  var adoptDraft = { coat: 'kulta', ears: 'luppa', name: pick(['Nappi', 'Muru', 'Lumi', 'Tassu', 'Pipsa', 'Hilla', 'Nalle', 'Sisu']) };
  function screenAdopt() {
    var coats = Object.keys(D.COATS).map(function (k) {
      return '<button class="swatch' + (adoptDraft.coat === k ? ' on' : '') + '" data-act="adopt-coat" data-v="' + k + '" aria-pressed="' + (adoptDraft.coat === k) + '">' +
        D.drawDog({ coat: k, ears: adoptDraft.ears, age: 0, animate: false, viewBox: '36 2 168 168' }) + '<span>' + D.COATS[k].name + '</span></button>';
    }).join('');
    var ears = Object.keys(D.EARS).map(function (k) {
      return '<button class="pill' + (adoptDraft.ears === k ? ' on' : '') + '" data-act="adopt-ears" data-v="' + k + '" aria-pressed="' + (adoptDraft.ears === k) + '">' + D.EARS[k] + '</button>';
    }).join('');
    return '<main class="adopt">' +
      '<div class="adopt-hero">' +
        '<h1 class="logo">Tassutreeni</h1>' +
        '<p class="tagline">Kasvata pennusta mestarikoira – yksi laskutehtävä kerrallaan.</p>' +
        '<div class="adopt-preview">' + D.drawDog({ coat: adoptDraft.coat, ears: adoptDraft.ears, age: 0, face: 'joy', scene: 'puisto', prop: 'pallo' }) + '</div>' +
      '</div>' +
      '<section class="card adopt-card">' +
        '<h2>Valitse pentusi</h2>' +
        '<div class="swatches">' + coats + '</div>' +
        '<h3>Korvat</h3><div class="pills">' + ears + '</div>' +
        '<label class="namefield"><span>Pennun nimi</span><input id="dogname" maxlength="14" value="' + esc(adoptDraft.name) + '" autocomplete="off"></label>' +
        '<button class="cta big" data-act="adopt-go">Adoptoi pentu</button>' +
      '</section></main>';
  }

  /* ---------------- Koti ---------------- */
  function nextTopic() {
    for (var i = 0; i < Q.TOPICS.length; i++) if (!S.stars[Q.TOPICS[i].id]) return Q.TOPICS[i];
    var worst = null, ws = 4;
    Q.TOPICS.forEach(function (t) { if ((S.stars[t.id] || 0) < ws) { ws = S.stars[t.id] || 0; worst = t; } });
    return ws < 3 ? worst : null;
  }
  function bubbleText() {
    var nt = nextTopic();
    if (!totalStars()) return 'Hau! Opetetaanko minulle ensin <b>' + Q.TOPICS[0].trick + '</b>-temppu?';
    if (nt) return pick(['Hau! Treenataanko seuraavaksi <b>' + nt.trick + '</b>?', 'Minulla on häntä heilumassa – kokeillaan <b>' + nt.trick + '</b>-temppua!', 'Rapsutus ja yksi treeni lisää? <b>' + nt.trick + '</b> odottaa.']);
    return 'Osaan kaikki temput! Haastetaanko tuomari koiranäyttelyssä?';
  }
  function screenHome() {
    var st = stage(), tot = totalStars(), cur = D.STAGES[st], nx = D.STAGES[st + 1];
    var pct = nx ? Math.round(100 * (tot - cur.min) / (nx.min - cur.min)) : 100;
    var tiles = [
      ['show', ICON.show, 'Koiranäyttely', 'Harjoituskoe: 20 tehtävää'],
      ['park', ICON.park, 'Leikkipuisto', 'Noppapelit kaverin kanssa'],
      ['shop', ICON.shop, 'Herkkukauppa', 'Vaihda luut asusteisiin'],
      ['progress', ICON.chart, 'Edistyminen', 'Mitä osaan jo?']
    ].map(function (t) { return '<button class="tile" data-act="' + t[0] + '"><span class="tile-ico">' + t[1] + '</span><b>' + t[2] + '</b><span>' + t[3] + '</span></button>'; }).join('');
    return hud() + '<main class="home">' +
      '<section class="hero">' +
        '<div class="hero-scene">' + D.drawDog(dogOpts({ scene: S.wear.scene || 'puisto' })) + '<p class="bubble">' + bubbleText() + '</p></div>' +
        '<div class="hero-info"><h1>' + esc(S.dog.name) + '</h1><p class="stage-line">' + cur.name + '</p>' +
          '<div class="meter" role="progressbar" aria-valuenow="' + pct + '" aria-valuemin="0" aria-valuemax="100"><span style="width:' + pct + '%"></span></div>' +
          '<p class="meter-label">' + (nx ? 'Vielä ' + (nx.min - tot) + ' ruusuke' + (nx.min - tot === 1 ? '' : 'tta') + ', niin ' + esc(S.dog.name) + ' kasvaa <b>' + nx.tra + '</b>.' : esc(S.dog.name) + ' on mestarikoira – kaikki kasvuvaiheet saavutettu!') + '</p></div>' +
      '</section>' +
      '<nav class="tiles" aria-label="Pelin osat">' + tiles + '</nav>' +
      '<section class="path-wrap"><h2>Treenipolku</h2><p class="sub">Jokainen este on yksi kokeen aihe. Laske tehtävät, niin pentu oppii tempun ja saat ruusukkeen.</p>' + pathHtml() + '</section>' +
      '</main>';
  }
  function pathHtml() {
    var xs = [50, 76, 50, 24], rowH = 124, n = Q.TOPICS.length, H = 70 + (n - 1) * rowH + 70;
    var nt = nextTopic();
    var pts = Q.TOPICS.map(function (t, i) { return { x: xs[i % 4], y: 70 + i * rowH }; });
    var d = 'M' + pts[0].x + ' ' + pts[0].y;
    for (var i = 1; i < pts.length; i++) d += ' C' + pts[i - 1].x + ' ' + (pts[i - 1].y + rowH / 2) + ' ' + pts[i].x + ' ' + (pts[i].y - rowH / 2) + ' ' + pts[i].x + ' ' + pts[i].y;
    var out = '<div class="path" style="height:' + H + 'px"><svg class="trail" viewBox="0 0 100 ' + H + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '" vector-effect="non-scaling-stroke"/></svg>';
    Q.TOPICS.forEach(function (t, i) {
      var p = pts[i], tier = S.stars[t.id] || 0, isNext = nt && nt.id === t.id, right = p.x <= 50;
      out += '<button class="station tier-' + tier + (isNext ? ' is-next' : '') + '" style="left:' + p.x + '%;top:' + p.y + 'px" data-act="level" data-topic="' + t.id + '" aria-label="' + t.trick + ': ' + t.title + (tier ? ', ' + tier + ' tähteä' : '') + '">' +
        D.obstacle(t.obstacle) + (tier ? '<span class="st-rosette">' + D.ICONS.rosette(tier, 'ico-rosette') + '</span>' : '') +
        (isNext ? '<span class="st-next">' + D.ICONS.paw('ico-paw', '#F0466F') + '</span>' : '') + '</button>' +
        '<div class="st-label ' + (right ? 'to-right' : 'to-left') + '" style="top:' + p.y + 'px;' + (right ? 'left:calc(' + p.x + '% + 52px)' : 'right:calc(' + (100 - p.x) + '% + 52px)') + '">' +
        '<b>' + t.trick + '</b><span>' + t.title + '</span><i class="st-stars">' + [1, 2, 3].map(function (k) { return D.ICONS.star('ico-star', k <= tier); }).join('') + '</i></div>';
    });
    return out + '</div>';
  }

  /* ---------------- Tehtävänäkymä ---------------- */
  function startLevel(topicId) {
    sess = { mode: 'level', topic: topicId, qs: Q.makeLevel(topicId), qi: 0, si: 0, tries: 0, firstOk: true, results: [], bones: 0, face: 'happy' };
    prefetchPhoto(); prefetchPhoto();
    go('level');
  }
  function startExam() {
    sess = { mode: 'exam', topic: null, qs: Q.makeExam(), qi: 0, si: 0, tries: 0, firstOk: true, results: [], bones: 0, face: 'happy' };
    prefetchPhoto(); prefetchPhoto();
    go('level');
  }
  function curQ() { return sess.qs[sess.qi]; }
  function curStep() { return curQ().steps[sess.si]; }

  function screenLevel() {
    var q = curQ(), st = curStep(), topic = Q.BY_ID[q.topic];
    var title = sess.mode === 'exam' ? 'Koiranäyttely' : topic.trick;
    var sub = sess.mode === 'exam' ? 'Tehtävä ' + (sess.qi + 1) + '\u00A0/\u00A0' + sess.qs.length : topic.title;
    var paws = sess.qs.map(function (_, i) {
      var r = sess.results[i], cls = r ? (r.first ? 'p-first' : r.correct ? 'p-retry' : 'p-miss') : (i === sess.qi ? 'p-now' : '');
      return '<i class="paw ' + cls + '">' + D.ICONS.paw('ico-paw') + '</i>';
    }).join('');
    var needsPad = st.kind !== 'mc';
    var stepInfo = q.steps.length > 1 ? '<span class="stepinfo">Vaihe ' + (sess.si + 1) + ' / ' + q.steps.length + '</span>' : '';
    return '<header class="qhead"><button class="icon-btn" data-act="quit" aria-label="Lopeta treeni">' + ICON.back + '</button>' +
      '<div class="qtitle"><b>' + title + '</b><span>' + sub + '</span></div>' +
      '<div class="hud-bones small">' + D.ICONS.bone('ico-bone') + '<b>' + S.bones + '</b></div></header>' +
      '<div class="paws" aria-label="Edistyminen">' + paws + '</div>' +
      '<main class="qmain' + (needsPad ? ' has-pad' : '') + '">' +
        '<section class="qcard kind-' + st.kind + '">' +
          '<div class="q-dog" aria-hidden="true">' + tagDog({ face: sess.face }) + '</div>' + stepInfo +
          (st.lead ? '<p class="lead">' + st.lead + '</p>' : '') +
          (st.big ? '<div class="big' + (/[a-zåäö]{4,}/i.test(String(st.big).replace(/<[^>]+>/g, '')) && !/class="words"/.test(st.big) ? ' is-text' : '') + '">' + st.big + '</div>' : '') +
          (st.html ? '<div class="qhtml">' + st.html + '</div>' : '') +
          (st.shownGrid ? '<div class="shown">' + gridHtml(st.shownGrid.op, st.shownGrid.a, st.shownGrid.b, { rows: st.shownGrid.rows }) + '</div>' : '') +
          '<div class="widget">' + widgetHtml(st) + '</div>' +
          '<div class="feedback" id="fb" hidden></div>' +
        '</section>' +
        (needsPad ? '<section class="pad-area">' + numpad() + '<button class="cta check" data-act="check">Tarkista</button></section>' : '') +
      '</main>';
  }

  function widgetHtml(st) {
    if (st.kind === 'mc') {
      return '<div class="opts layout-' + (st.layout || 'list') + '">' + st.options.map(function (o, i) {
        return '<button class="opt" data-act="opt" data-i="' + i + '">' + (st.layout === 'signs' ? '<span class="sign-post"></span>' : '') + '<span class="opt-txt">' + o.html + '</span></button>';
      }).join('') + '</div>';
    }
    if (st.kind === 'num') {
      return '<div class="numrow"><span class="field big-field" data-slot data-type="field" data-max="6" data-order="0" role="textbox" aria-label="Vastaus"></span>' + (st.unit ? '<span class="unit">' + st.unit + '</span>' : '') + '</div>' +
        (st.scratch ? '<button class="ghost" data-act="scratch">Avaa apuruudukko</button><div class="scratch" hidden><p class="scratch-note">Apuruudukko – tätä ei tarkisteta.</p>' + gridHtml(st.scratch.op, st.scratch.a, st.scratch.b, { interactive: true, gid: 's', order0: 1000 }) + '</div>' : '');
    }
    if (st.kind === 'fill') {
      var k = 0;
      return '<div class="fill">' + st.parts.map(function (p) {
        if (typeof p === 'string') return '<span class="fill-txt">' + p + '</span>';
        var html = '<span class="field" data-slot data-type="field" data-max="5" data-order="' + k + '" data-f="' + k + '" role="textbox" aria-label="Vastauskenttä ' + (k + 1) + '"></span>';
        k++; return html;
      }).join('') + '</div>';
    }
    if (st.kind === 'grid') return gridHtml(st.op, st.a, st.b, { interactive: true, gid: 'g', order0: 0 });
    return '';
  }

  var PLACE_LETTERS = ['Y', 'K', 'S', 'T', 'TT'];
  function gridHtml(op, a, b, opt) {
    opt = opt || {};
    var exp = Q.gridExpected(op, a, b);
    var shownRows = opt.rows || (opt.solution ? exp : null);
    var all = [a, b].concat(exp).concat(shownRows || []);
    var cols = Math.max(4, Math.max.apply(null, all.map(function (x) { return String(x).length; })));
    var sign = { add: '+', sub: '−', mul1: '·', mul2: '·' }[op];
    var out = '<div class="vgrid' + (opt.interactive ? ' interactive' : '') + '" style="--cols:' + (cols + 1) + '" data-op="' + op + '">';
    function place(c) { return cols - 1 - c; }
    function cell(cls, content, attrs) { return '<div class="g-cell ' + cls + '"' + (attrs || '') + '>' + (content == null ? '' : content) + '</div>'; }
    function numRow(n, signTxt, extraCls) {
      var s = n == null ? '' : String(n), pad = cols - s.length, r = cell('g-sign' + (extraCls || ''), signTxt || '');
      for (var c = 0; c < cols; c++) r += cell('g-d p' + place(c) + (extraCls || ''), c >= pad ? s[c - pad] : '');
      return r;
    }
    out += cell('g-sign g-headrow', '');
    for (var c = 0; c < cols; c++) out += cell('g-head p' + place(c), PLACE_LETTERS[place(c)]);
    var gid = opt.gid || 'x', ord = opt.order0 || 0;
    if (opt.interactive) {
      out += cell('g-sign g-carrylbl', '<span>muisti</span>');
      for (c = 0; c < cols; c++) out += cell('g-carry p' + place(c), '', ' data-slot data-type="carry" data-max="2" data-g="' + gid + '" data-row="c" data-col="' + c + '" data-order="' + (ord + 900 + c) + '"');
    }
    out += numRow(a, '');
    out += numRow(b, sign, ' line-below');
    var rowsSpec = op === 'mul2' ? [['', ''], ['+', ' line-below'], ['', '']] : [['', '']];
    if (opt.interactive) {
      rowsSpec.forEach(function (spec, r) {
        out += cell('g-sign' + spec[1], spec[0]);
        for (var c2 = 0; c2 < cols; c2++) {
          var fixed = op === 'mul2' && r === 1 && c2 === cols - 1;
          out += cell('g-in p' + place(c2) + spec[1] + (fixed ? ' fixed' : ''), fixed ? '0' : '', ' data-slot data-type="cell" data-g="' + gid + '" data-row="r' + r + '" data-col="' + c2 + '" data-order="' + (ord + r * 100 + (cols - c2)) + '"' + (fixed ? ' title="Kun kerrotaan kymmenillä, ykkösten paikalle tulee 0."' : ''));
        }
      });
    } else {
      var rowsVals = shownRows || [];
      rowsSpec.forEach(function (spec, r) { out += numRow(rowsVals[r], spec[0], spec[1] + ' g-shown' + (opt.solution ? ' g-sol' : '')); });
    }
    return out + '</div>';
  }

  function numpad() {
    var keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];
    return '<div class="numpad" role="group" aria-label="Numeronäppäimet">' + keys.map(function (k) { return '<button class="key" data-key="' + k + '">' + k + '</button>'; }).join('') +
      '<button class="key key-fn" data-key="back" aria-label="Pyyhi">' + ICON.del + '</button><button class="key" data-key="0">0</button>' +
      '<button class="key key-fn" data-key="next" aria-label="Seuraava ruutu">' + ICON.next + '</button></div>';
  }

  /* Syöttöruudut */
  var slots = [], active = null;
  function initSlots() {
    slots = Array.prototype.slice.call($app.querySelectorAll('[data-slot]'));
    var main = slots.filter(function (el) { return el.dataset.type !== 'carry' && !el.closest('.scratch') && !el.classList.contains('fixed'); });
    main.sort(function (x, y) { return (+x.dataset.order) - (+y.dataset.order); });
    setActive(main[0] || null);
  }
  function setActive(el) {
    if (active) active.classList.remove('active');
    active = el;
    if (active) active.classList.add('active');
  }
  function travOrder(el) {
    var inScratch = !!el.closest('.scratch');
    return slots.filter(function (s) { return s.dataset.type !== 'carry' && !s.classList.contains('fixed') && !!s.closest('.scratch') === inScratch; })
      .sort(function (x, y) { return (+x.dataset.order) - (+y.dataset.order); });
  }
  function cellAt(g, row, col) { return $app.querySelector('[data-g="' + g + '"][data-row="' + row + '"][data-col="' + col + '"]'); }
  function typeDigit(dg) {
    if (!active) return;
    sfx.tap();
    var t = active.dataset.type, max = +active.dataset.max || 1, v = active.textContent;
    active.classList.remove('bad', 'good');
    if (t === 'cell') {
      if (active.classList.contains('fixed')) return;
      active.textContent = dg;
      var left = cellAt(active.dataset.g, active.dataset.row, +active.dataset.col - 1);
      if (left && !left.classList.contains('fixed')) setActive(left);
    } else if (v.length < max) active.textContent = v + dg;
  }
  function backspace() {
    if (!active) return;
    var t = active.dataset.type;
    if (t === 'cell') {
      if (active.textContent) { active.textContent = ''; return; }
      var right = cellAt(active.dataset.g, active.dataset.row, +active.dataset.col + 1);
      if (right && !right.classList.contains('fixed')) { setActive(right); right.textContent = ''; }
    } else active.textContent = active.textContent.slice(0, -1);
  }
  function nextSlot() {
    if (!active) return;
    var order = travOrder(active);
    if (active.dataset.type === 'cell') {
      var r = +active.dataset.row.slice(1) + 1, g = active.dataset.g;
      var rowCells = order.filter(function (s) { return s.dataset.g === g && s.dataset.row === 'r' + r; });
      setActive(rowCells[0] || order[0]);
      return;
    }
    if (active.dataset.type === 'carry') { setActive(order[0]); return; }
    var i = order.indexOf(active);
    setActive(order[(i + 1) % order.length]);
  }
  function moveArrow(dx, dy) {
    if (!active || active.dataset.type === 'field') { if (dx > 0 || dy > 0) nextSlot(); return; }
    var g = active.dataset.g, row = active.dataset.row, col = +active.dataset.col + dx;
    if (dy) {
      var rows = ['c', 'r0', 'r1', 'r2'], ri = rows.indexOf(row) + dy;
      if (ri >= 0 && ri < rows.length) row = rows[ri];
    }
    var el = cellAt(g, row, col);
    if (el && !el.classList.contains('fixed')) setActive(el);
  }

  function rowValue(cells) {
    var ds = cells.map(function (c) { return c.textContent.trim(); });
    var first = ds.findIndex(function (x) { return x !== ''; });
    if (first < 0) return null;
    for (var i = first; i < ds.length; i++) if (ds[i] === '') return NaN;
    return Number(ds.slice(first).join(''));
  }
  function gridRows(g, n) {
    var out = [];
    for (var r = 0; r < n; r++) {
      var cells = Array.prototype.slice.call($app.querySelectorAll('[data-g="' + g + '"][data-row="r' + r + '"]')).sort(function (x, y) { return (+x.dataset.col) - (+y.dataset.col); });
      out.push(rowValue(cells));
    }
    return out;
  }

  /* Tarkistus */
  function check() {
    var st = curStep(), ok = false, hint = null;
    if (st.kind === 'num') {
      var f = $app.querySelector('.widget .big-field');
      if (!f.textContent) { toast('Kirjoita ensin vastaus.'); return; }
      ok = Number(f.textContent) === st.answer;
      f.classList.toggle('bad', !ok); f.classList.toggle('good', ok);
    } else if (st.kind === 'fill') {
      var fs = Array.prototype.slice.call($app.querySelectorAll('.widget .field'));
      if (fs.some(function (x) { return !x.textContent; })) { toast('Täytä kaikki ruudut.'); return; }
      var answers = st.parts.filter(function (p) { return typeof p === 'object'; });
      ok = true;
      fs.forEach(function (x, i) { var good = Number(x.textContent) === answers[i].answer; x.classList.toggle('bad', !good); x.classList.toggle('good', good); if (!good) ok = false; });
    } else if (st.kind === 'grid') {
      var n = st.op === 'mul2' ? 3 : 1, rows = gridRows('g', n);
      if (rows.every(function (r) { return r === null; })) { toast('Kirjoita vastaus ruudukkoon.'); return; }
      var res = Q.gridCheck(st.op, st.a, st.b, rows.map(function (r) { return r === null || isNaN(r) ? -1 : r; }));
      ok = res.ok;
      res.rowOk.forEach(function (good, r) {
        Array.prototype.forEach.call($app.querySelectorAll('[data-g="g"][data-row="r' + r + '"]'), function (c) { c.classList.toggle('row-bad', !good); c.classList.toggle('row-good', good); });
      });
      hint = Q.gridHint(st.op, st.a, st.b, res.rowOk);
    }
    handleResult(ok, hint, null);
  }

  function chooseOption(i, btn) {
    var st = curStep(), o = st.options[i];
    if (btn.disabled) return;
    if (o.ok) { btn.classList.add('good'); handleResult(true); }
    else { btn.classList.add('bad'); btn.disabled = true; handleResult(false, null, btn); }
  }

  function handleResult(ok, hint) {
    var st = curStep(), fb = document.getElementById('fb');
    if (ok) {
      sfx.ok();
      if (sess.si < curQ().steps.length - 1) {
        lockStep();
        fb.hidden = false; fb.className = 'feedback good';
        fb.innerHTML = '<b>Oikein!</b> Jatketaan seuraavaan vaiheeseen.';
        setTimeout(function () { sess.si++; sess.tries = 0; sess.face = 'happy'; render(); }, reduceMotion ? 300 : 850);
      } else finishQuestion(true);
      return;
    }
    sess.tries++; sess.firstOk = false; sfx.bad();
    var q = $app.querySelector('.q-dog'); if (q) q.innerHTML = tagDog({ face: 'think' });
    var limit = sess.mode === 'exam' ? 1 : 2;
    if (sess.tries >= limit) { revealSolution(); return; }
    fb.hidden = false; fb.className = 'feedback hint';
    fb.innerHTML = '<b>Melkein! Yritä vielä kerran.</b><div class="hint-txt">' + (hint || st.hint || '') + '</div>';
    fb.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function lockStep() {
    Array.prototype.forEach.call($app.querySelectorAll('.opt'), function (b) { b.disabled = true; });
    var pad = $app.querySelector('.pad-area'); if (pad) pad.classList.add('locked');
    setActive(null);
  }

  function revealSolution() {
    var st = curStep(), fb = document.getElementById('fb'), last = sess.si >= curQ().steps.length - 1;
    lockStep();
    Array.prototype.forEach.call($app.querySelectorAll('.opt'), function (b, i) { if (st.options && st.options[i].ok) b.classList.add('reveal'); });
    var sol = st.kind === 'grid' ? '<div class="solgrid">' + gridHtml(st.op, st.a, st.b, { solution: true }) + '</div>' : '';
    fb.hidden = false; fb.className = 'feedback solution';
    fb.innerHTML = '<b>' + (sess.mode === 'exam' ? 'Ei tällä kertaa.' : 'Katsotaan yhdessä.') + '</b>' +
      (sess.mode !== 'exam' && st.hint ? '<div class="hint-txt">' + st.hint + '</div>' : '') + sol +
      '<p class="answer">Oikea vastaus: <b>' + st.answerText + '</b></p>' +
      '<button class="cta" data-act="' + (last ? 'nextq' : 'nextstep') + '">' + (last ? 'Seuraava tehtävä' : 'Jatka') + '</button>';
    if (last) recordQuestion(false);
    fb.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function recordQuestion(correct) {
    var q = curQ(), first = correct && sess.firstOk;
    sess.results[sess.qi] = { correct: correct, first: first, topic: q.topic };
    var s = S.stats[q.topic] || (S.stats[q.topic] = { asked: 0, first: 0, correct: 0 });
    s.asked++; if (first) s.first++; if (correct) s.correct++;
    save();
  }

  var PRAISE = ['Oikein!', 'Hienoa!', 'Mahtavaa!', 'Tassut ylös!', 'Juuri niin!', 'Hau, oikein!', 'Upeaa työtä!', 'Nappisuoritus!', 'Huippua!', 'Täydellistä!'];
  function finishQuestion(correct) {
    recordQuestion(correct);
    var bones = sess.firstOk ? 2 : 1;
    S.bones += bones; sess.bones += bones; save();
    lockStep();
    showReward({ title: pick(PRAISE), bones: bones, sub: sess.firstOk ? '' : 'Sait sen toisella yrityksellä – hyvä sisu!' }, nextQuestion);
  }

  function nextQuestion() {
    sess.qi++; sess.si = 0; sess.tries = 0; sess.firstOk = true; sess.face = 'happy';
    if (sess.qi >= sess.qs.length) return finishSession();
    render(); window.scrollTo(0, 0);
  }

  function finishSession() {
    if (sess.mode === 'exam') {
      var score = sess.results.filter(function (r) { return r && r.first; }).length;
      S.exam.runs++;
      if (!S.exam.best || score > S.exam.best) S.exam.best = score;
      var newMedal = score >= 18 && !S.medal;
      if (score >= 18) S.medal = true;
      save();
      return go('show', { result: { score: score, total: sess.qs.length, results: sess.results.slice(), newMedal: newMedal } });
    }
    var pts = sess.results.reduce(function (a, r) { return a + (r.first ? 1 : r.correct ? 0.5 : 0); }, 0);
    var stars = pts >= 7 ? 3 : pts >= 5 ? 2 : 1;
    var before = stage(), prev = S.stars[sess.topic] || 0;
    if (stars > prev) S.stars[sess.topic] = stars;
    var bonus = stars * 2; S.bones += bonus;
    save();
    var after = stage();
    go('complete', { topic: sess.topic, stars: stars, prev: prev, firstCount: sess.results.filter(function (r) { return r.first; }).length, correct: sess.results.filter(function (r) { return r.correct; }).length, bones: sess.bones + bonus, bonus: bonus, grew: after > before ? after : null });
  }

  /* ---------------- Palkinto ---------------- */
  var rewardClose = null;
  function showReward(info, onClose) {
    var tip = nextTip(), catIcon = { hoito: D.ICONS.brush('ico-cat'), kasvatus: D.ICONS.whistle('ico-cat'), leikki: D.ICONS.ball('ico-cat') }[tip.cat];
    var burst = '';
    if (!reduceMotion) for (var i = 0; i < 14; i++) {
      var ang = (i / 14) * 360 + Math.random() * 20, dist = 120 + Math.random() * 70;
      burst += '<i style="--a:' + ang + 'deg;--d:' + dist + 'px;--t:' + (0.7 + Math.random() * 0.5) + 's">' + (i % 2 ? D.ICONS.heart('ico-burst') : D.ICONS.paw('ico-burst', ['#FFCC33', '#4F8BFF', '#2FBF71'][i % 3])) + '</i>';
    }
    $ov.innerHTML = '<div class="reward" role="dialog" aria-modal="true" aria-labelledby="rw-title">' +
      '<div class="burst" aria-hidden="true">' + burst + '</div>' +
      '<div class="reward-pic">' + rewardPicture() + '</div>' +
      '<h2 id="rw-title">' + info.title + '</h2>' +
      (info.sub ? '<p class="reward-sub">' + info.sub + '</p>' : '') +
      (info.bones ? '<p class="reward-bones">+' + info.bones + ' ' + D.ICONS.bone('ico-bone') + '</p>' : '') +
      '<div class="tip tip-' + tip.cat + '"><span class="tip-cat">' + catIcon + TIPS.CAT_NAMES[tip.cat] + 'vinkki</span><p>' + tip.text + '</p></div>' +
      '<button class="cta big" data-act="reward-close">Jatka</button></div>';
    $ov.hidden = false;
    rewardClose = onClose;
    setTimeout(function () { var b = $ov.querySelector('[data-act="reward-close"]'); if (b) b.focus(); }, 50);
  }
  function closeOverlay() {
    $ov.hidden = true; $ov.innerHTML = '';
    var cb = rewardClose; rewardClose = null;
    if (cb) cb();
  }

  /* ---------------- Tason loppu ---------------- */
  function screenComplete() {
    var t = Q.BY_ID[view.topic], idx = Q.TOPICS.indexOf(t), nextT = Q.TOPICS[idx + 1];
    return hud() + '<main class="complete">' +
      '<section class="card done-card">' +
        '<div class="done-dog">' + D.drawDog(dogOpts({ face: 'joy', scene: S.wear.scene || 'puisto' })) + '<span class="done-rosette">' + D.ICONS.rosette(view.stars, 'ico-rosette-big') + '</span></div>' +
        '<h1>' + esc(S.dog.name) + ' oppi tempun: ' + t.trick + '!</h1>' +
        '<div class="stars-row">' + [1, 2, 3].map(function (k) { return D.ICONS.star('ico-star-big', k <= view.stars); }).join('') + '</div>' +
        '<p class="done-stats">Oikein ensimmäisellä yrityksellä <b>' + view.firstCount + '\u00A0/\u00A0' + Q.LEVEL_LEN + '</b>' + (view.correct > view.firstCount ? ', toisella yrityksellä vielä ' + (view.correct - view.firstCount) : '') + '.</p>' +
        '<p class="done-bones">Ansaitsit ' + view.bones + ' luuta ' + D.ICONS.bone('ico-bone') + '</p>' +
        (view.grew != null ? '<p class="grew">Pentusi kasvoi! Nyt ' + esc(S.dog.name) + ' on ' + D.STAGES[view.grew].name.toLowerCase() + '.</p>' : '') +
        (view.stars < 3 ? '<p class="done-tip">Kolme tähteä saat, kun vähintään 7 tehtävää menee oikein ensimmäisellä yrityksellä.</p>' : '') +
        '<div class="btn-row">' +
          '<button class="cta" data-act="level" data-topic="' + t.id + '">Treenaa uudestaan</button>' +
          (nextT ? '<button class="cta alt" data-act="level" data-topic="' + nextT.id + '">Seuraava temppu: ' + nextT.trick + '</button>' : '') +
          '<button class="ghost" data-act="home">Kotiin</button>' +
        '</div></section></main>';
  }

  /* ---------------- Koiranäyttely (harjoituskoe) ---------------- */
  var GRADES = [
    { min: 18, code: 'ERI', name: 'Erinomainen', tier: 3, text: 'Tuomari ihastui! Pentusi liikkuu kuin mestari, ja laskut sujuvat varmasti.' },
    { min: 15, code: 'EH', name: 'Erittäin hyvä', tier: 2, text: 'Upea esitys! Pienet hiomiskohteet vielä, niin seuraavalla kerralla tulee ERI.' },
    { min: 11, code: 'H', name: 'Hyvä', tier: 1, text: 'Hyvä suoritus! Harjoittele alla olevia aiheita, niin arvosana nousee.' },
    { min: 0, code: 'T', name: 'Tyydyttävä', tier: 0, text: 'Pentu tarvitsee vielä treeniä. Valitse alta aihe ja harjoitellaan yhdessä.' }
  ];
  function gradeFor(score) { for (var i = 0; i < GRADES.length; i++) if (score >= GRADES[i].min) return GRADES[i]; return GRADES[3]; }
  function screenShow() {
    if (view.result) {
      var r = view.result, g = gradeFor(r.score), wrongTopics = {};
      r.results.forEach(function (x) { if (!x.first) wrongTopics[x.topic] = (wrongTopics[x.topic] || 0) + 1; });
      var practice = Object.keys(wrongTopics).map(function (id) {
        var t = Q.BY_ID[id];
        return '<button class="practice" data-act="level" data-topic="' + id + '">' + D.obstacle(t.obstacle) + '<span><b>' + t.trick + '</b>' + t.title + '</span><i>' + wrongTopics[id] + ' virhe' + (wrongTopics[id] > 1 ? 'ttä' : '') + '</i></button>';
      }).join('');
      return hud() + '<main class="show">' +
        '<section class="card verdict tier-' + g.tier + '">' +
          '<div class="verdict-top">' + D.ICONS.rosette(g.tier, 'ico-rosette-big') + '<div><p class="verdict-code">' + g.code + '</p><p class="verdict-name">' + g.name + '</p></div></div>' +
          '<p class="verdict-score"><b>' + r.score + '</b> / ' + r.total + ' oikein</p>' +
          '<p class="judge">Tuomarin arvio: ' + g.text + '</p>' +
          (r.newMedal ? '<p class="grew">Ansaitsit näyttelymitalin! Se näkyy pennullasi, kun siitä tulee mestarikoira.</p>' : '') +
          '<div class="btn-row"><button class="cta" data-act="exam-start">Uusi näyttely</button><button class="ghost" data-act="home">Kotiin</button></div>' +
        '</section>' +
        (practice ? '<section class="card"><h2>Harjoittele vielä näitä</h2><div class="practice-list">' + practice + '</div></section>' : '<section class="card"><h2>Täydellinen kierros!</h2><p>Kaikki tehtävät oikein ensimmäisellä yrityksellä.</p></section>') +
        '</main>';
    }
    return hud() + '<main class="show">' +
      '<section class="card show-intro">' +
        '<div class="show-dog">' + D.drawDog(dogOpts({ face: 'happy', neck: S.wear.neck || 'huivi', neckColor: S.wear.neckColor || '#4F8BFF' })) + '</div>' +
        '<h1>Koiranäyttely</h1>' +
        '<p>Näyttelyssä tuomari arvioi, miten hyvin osaat kokeen asiat. Tehtäviä on 20, ja ne ovat kuin oikeassa kokeessa: allekkain laskuja, kertolaskuja, laskujärjestystä, sanatehtäviä ja päättelyä.</p>' +
        '<ul class="rules"><li>Jokaiseen tehtävään on yksi yritys.</li><li>Vihjeitä ei ole, mutta väärän vastauksen jälkeen näet oikean ratkaisun.</li><li>Arvosanat: ERI 18–20, EH 15–17, H 11–14, T 0–10.</li></ul>' +
        (S.exam.best != null ? '<p class="best">Paras tuloksesi: <b>' + S.exam.best + ' / 20</b> (' + gradeFor(S.exam.best).code + ')</p>' : '') +
        '<button class="cta big" data-act="exam-start">Astu kehään</button>' +
      '</section></main>';
  }

  /* ---------------- Kauppa ---------------- */
  var SHOP = [
    { id: 'rusetti', slot: 'hat', name: 'Rusetti', price: 10 },
    { id: 'pipo', slot: 'hat', name: 'Talvipipo', price: 15 },
    { id: 'kukat', slot: 'hat', name: 'Kukkaseppele', price: 18 },
    { id: 'juhlahattu', slot: 'hat', name: 'Juhlahattu', price: 20 },
    { id: 'lasit', slot: 'hat', name: 'Sydänlasit', price: 25 },
    { id: 'kruunu', slot: 'hat', name: 'Kruunu', price: 40 },
    { id: 'panta-sin', slot: 'neck', kind: 'panta', color: '#4F8BFF', name: 'Sininen panta', price: 5 },
    { id: 'panta-pin', slot: 'neck', kind: 'panta', color: '#FF5C8A', name: 'Pinkki panta', price: 5 },
    { id: 'huivi-vih', slot: 'neck', kind: 'huivi', color: '#2FBF71', name: 'Vihreä huivi', price: 12 },
    { id: 'huivi-lil', slot: 'neck', kind: 'huivi', color: '#B98CFF', name: 'Liila huivi', price: 12 },
    { id: 'kaulaliina', slot: 'neck', kind: 'kaulaliina', color: '#E8435E', name: 'Kaulaliina', price: 15 },
    { id: 'pallo', slot: 'prop', name: 'Tennispallo', price: 6 },
    { id: 'luu', slot: 'prop', name: 'Purululu', price: 6 },
    { id: 'ankka', slot: 'prop', name: 'Kumiankka', price: 10 },
    { id: 'sukka', slot: 'prop', name: 'Joulusukka', price: 14 },
    { id: 'sydan', slot: 'prop', name: 'Sydänilmapallo', price: 16 },
    { id: 'koti', slot: 'scene', name: 'Kotisohva', price: 15 },
    { id: 'ranta', slot: 'scene', name: 'Rantapäivä', price: 20 },
    { id: 'talvi', slot: 'scene', name: 'Lumitalvi', price: 20 },
    { id: 'tahdet', slot: 'scene', name: 'Tähtiyö', price: 30 }
  ];
  var SLOT_NAMES = { hat: 'Päähän', neck: 'Kaulaan', prop: 'Lelut', scene: 'Taustat' };
  function isWorn(it) {
    if (it.slot === 'neck') return S.wear.neck === it.kind && S.wear.neckColor === it.color;
    if (it.slot === 'scene') return (S.wear.scene || 'puisto') === it.id;
    return S.wear[it.slot] === it.id;
  }
  function itemPreview(it) {
    if (it.slot === 'scene') return '<svg viewBox="0 0 240 240" class="scene-thumb" aria-hidden="true">' + D.sceneSvg(it.id) + '</svg>';
    var o = { animate: false, viewBox: it.slot === 'prop' ? '20 100 200 130' : '36 2 168 168', prop: '', hat: '', neck: '' };
    if (it.slot === 'hat') o.hat = it.id;
    if (it.slot === 'neck') { o.neck = it.kind; o.neckColor = it.color; o.viewBox = '40 40 160 160'; }
    if (it.slot === 'prop') o.prop = it.id;
    return D.drawDog(dogOpts(o));
  }
  function screenShop() {
    var groups = ['hat', 'neck', 'prop', 'scene'].map(function (slot) {
      var items = SHOP.filter(function (it) { return it.slot === slot; }).map(function (it) {
        var owned = !!S.owned[it.id], worn = isWorn(it), afford = S.bones >= it.price;
        var btn = owned ? '<button class="mini' + (worn ? ' on' : '') + '" data-act="wear" data-id="' + it.id + '">' + (worn ? 'Riisu' : 'Pue') + '</button>'
          : '<button class="mini buy" data-act="buy" data-id="' + it.id + '"' + (afford ? '' : ' disabled') + '>' + it.price + ' ' + D.ICONS.bone('ico-bone') + '</button>';
        if (slot === 'scene' && owned) btn = '<button class="mini' + (worn ? ' on' : '') + '" data-act="wear" data-id="' + it.id + '"' + (worn ? ' disabled' : '') + '>' + (worn ? 'Käytössä' : 'Valitse') + '</button>';
        return '<div class="item' + (worn ? ' worn' : '') + '"><div class="item-pic">' + itemPreview(it) + '</div><b>' + it.name + '</b>' + btn + '</div>';
      }).join('');
      if (slot === 'scene') items = '<div class="item' + ((S.wear.scene || 'puisto') === 'puisto' ? ' worn' : '') + '"><div class="item-pic"><svg viewBox="0 0 240 240" class="scene-thumb" aria-hidden="true">' + D.sceneSvg('puisto') + '</svg></div><b>Puisto</b><button class="mini' + ((S.wear.scene || 'puisto') === 'puisto' ? ' on' : '') + '" data-act="wear" data-id="puisto"' + ((S.wear.scene || 'puisto') === 'puisto' ? ' disabled' : '') + '>' + ((S.wear.scene || 'puisto') === 'puisto' ? 'Käytössä' : 'Valitse') + '</button></div>' + items;
      return '<section class="card shop-group"><h2>' + SLOT_NAMES[slot] + '</h2><div class="items">' + items + '</div></section>';
    }).join('');
    return hud() + '<main class="shop">' +
      '<section class="shop-hero"><div class="shop-dog">' + D.drawDog(dogOpts({ scene: S.wear.scene || 'puisto', face: 'joy' })) + '</div>' +
      '<div><h1>Herkkukauppa</h1><p>Jokainen oikea vastaus tuo luita. Vaihda ne asusteisiin ja leluihin – pennullesi saa pukea yhden asusteen jokaiseen paikkaan.</p><p class="wallet">Sinulla on <b>' + S.bones + '</b> ' + D.ICONS.bone('ico-bone') + '</p></div></section>' +
      groups + '</main>';
  }
  function buy(id) {
    var it = SHOP.filter(function (x) { return x.id === id; })[0];
    if (!it || S.owned[id]) return;
    if (S.bones < it.price) { toast('Tarvitset vielä ' + (it.price - S.bones) + ' luuta.'); return; }
    S.bones -= it.price; S.owned[id] = true; wear(id, true); sfx.win();
    toast(it.name + ' on nyt pennullasi!');
  }
  function wear(id, forceOn) {
    if (id === 'puisto') { S.wear.scene = 'puisto'; save(); render(); return; }
    var it = SHOP.filter(function (x) { return x.id === id; })[0];
    if (!it || !S.owned[id]) return;
    var on = forceOn || !isWorn(it);
    if (it.slot === 'neck') { S.wear.neck = on ? it.kind : ''; S.wear.neckColor = on ? it.color : ''; }
    else if (it.slot === 'scene') S.wear.scene = it.id;
    else S.wear[it.slot] = on ? it.id : '';
    save(); render();
  }

  /* ---------------- Leikkipuisto ---------------- */
  function screenPark() {
    if (!park) {
      return hud() + '<main class="park">' +
        '<section class="card park-intro"><h1>Leikkipuisto</h1><p>Noppapelejä pennun kanssa. Voittamalla saat luita ja uuden koiravinkin.</p></section>' +
        '<button class="game-card" data-act="game" data-g="tuhat">' + D.ICONS.die(5, 'ico-die') + '<span><b>Lähelle tuhatta</b>Heitä noppaa viisi kertaa ja sijoita numerot ruutuihin: kaksinumeroinen luku kerrotaan kymmenellä ja siihen lisätään kolminumeroinen luku. Lähimmäs tuhatta päässyt voittaa – yli menevä häviää.</span></button>' +
        '<button class="game-card" data-act="game" data-g="sata">' + D.ICONS.die(3, 'ico-die') + '<span><b>Tavoitteena 100</b>Jokainen heitto kerrotaan vuorollaan luvuilla 10, 5, 5, 3, 3 ja 2. Voit lopettaa milloin vain. Lähimmäs sataa ylittämättä päässyt voittaa.</span></button>' +
        '</main>';
    }
    return hud() + '<main class="park">' + (park.g === 'tuhat' ? gameTuhat() : gameSata()) + '</main>';
  }
  function tuhatVal(arr) { var v = arr.map(function (x) { return x == null ? 0 : x; }); return (v[0] * 10 + v[1]) * 10 + (v[2] * 100 + v[3] * 10 + v[4]); }
  function tuhatBoard(arr, who, clickable) {
    function slot(i) {
      var empty = arr[i] == null;
      return '<button class="dslot' + (empty ? ' empty' : '') + '"' + (clickable && empty ? ' data-act="place" data-i="' + i + '"' : ' disabled') + '>' + (empty ? '' : arr[i]) + '</button>';
    }
    var done = arr.every(function (x) { return x != null; });
    return '<div class="board"><p class="board-who">' + who + '</p><div class="train">' +
      '<span class="wagon">' + slot(0) + slot(1) + '</span><span class="op">·</span><span class="wagon fixed">10</span><span class="op">+</span>' +
      '<span class="wagon">' + slot(2) + slot(3) + slot(4) + '</span><span class="op">=</span><span class="wagon result">' + (done ? Q.fmt(tuhatVal(arr)) : '?') + '</span></div></div>';
  }
  function gameTuhat() {
    var p = park, msg;
    if (p.phase === 'roll') msg = 'Heitä noppaa.';
    else if (p.phase === 'place') msg = 'Valitse ruutu numerolle ' + p.die + '.';
    else if (p.phase === 'dog') msg = esc(S.dog.name) + ' heittää…';
    else {
      var me = tuhatVal(p.me), dg = tuhatVal(p.dog), dm = me > 1000 ? Infinity : 1000 - me, dd = dg > 1000 ? Infinity : 1000 - dg;
      var calc = function (arr) { return (arr[0] * 10 + arr[1]) + MUL + '10 + ' + (arr[2] * 100 + arr[3] * 10 + arr[4]) + ' = ' + Q.fmt((arr[0] * 10 + arr[1]) * 10) + ' + ' + (arr[2] * 100 + arr[3] * 10 + arr[4]) + ' = ' + Q.fmt(tuhatVal(arr)); };
      var who = dm < dd ? 'Voitit!' : dd < dm ? esc(S.dog.name) + ' voitti tällä kertaa.' : 'Tasapeli!';
      msg = '<b>' + who + '</b><br>Sinä: ' + calc(p.me) + (me > 1000 ? ' (yli tuhannen)' : '') + '<br>' + esc(S.dog.name) + ': ' + calc(p.dog) + (dg > 1000 ? ' (yli tuhannen)' : '');
      if (!p.rewarded && dm < dd) { p.rewarded = true; S.bones += 5; save(); setTimeout(function () { showReward({ title: 'Voitit pelin!', bones: 5 }, function () { render(); }); }, 500); }
    }
    return '<section class="card game"><div class="game-head"><button class="icon-btn" data-act="park-back" aria-label="Takaisin">' + ICON.back + '</button><h1>Lähelle tuhatta</h1></div>' +
      tuhatBoard(p.me, 'Sinä', p.phase === 'place') + tuhatBoard(p.dog, esc(S.dog.name), false) +
      '<div class="dice-row">' + (p.die ? D.ICONS.die(p.die, 'ico-die big') : '<span class="die-empty"></span>') + '<p class="game-msg">' + msg + '</p></div>' +
      (p.phase === 'roll' ? '<button class="cta big" data-act="roll">Heitä noppaa</button>' : '') +
      (p.phase === 'done' ? '<button class="cta big" data-act="game" data-g="tuhat">Pelaa uudestaan</button>' : '') +
      '</section>';
  }
  var MUL = ' · ';
  function dogPlaceTuhat(arr, v) {
    var best = -1, bestScore = Infinity;
    arr.forEach(function (x, i) {
      if (x != null) return;
      var tmp = arr.slice(); tmp[i] = v;
      var est = tuhatVal(tmp.map(function (y) { return y == null ? 3.5 : y; }));
      var sc = Math.abs(1000 - est) + (est > 1000 ? 250 : 0) + Math.random() * 40;
      if (sc < bestScore) { bestScore = sc; best = i; }
    });
    arr[best] = v;
  }
  var SATA_M = [10, 5, 5, 3, 3, 2];
  function sataSum(arr) { return arr.reduce(function (a, v, i) { return a + v * SATA_M[i]; }, 0); }
  function sataBoard(arr, who) {
    return '<div class="board"><p class="board-who">' + who + '</p><div class="train sata">' + SATA_M.map(function (m, i) {
      return '<span class="wagon"><span class="dslot' + (arr[i] == null ? ' empty' : '') + '">' + (arr[i] == null ? '' : arr[i]) + '</span>' + MUL + m + '</span>' + (i < 5 ? '<span class="op">+</span>' : '');
    }).join('') + '<span class="op">=</span><span class="wagon result">' + sataSum(arr) + '</span></div></div>';
  }
  function gameSata() {
    var p = park, msg = '';
    if (p.phase === 'me') msg = p.me.length ? 'Pisteesi nyt ' + sataSum(p.me) + '. Heitätkö vielä vai lopetatko?' : 'Heitä noppaa. Ensimmäinen heitto kerrotaan kymmenellä.';
    else if (p.phase === 'dog') msg = esc(S.dog.name) + ' heittää…';
    else {
      var me = sataSum(p.me), dg = sataSum(p.dog), dm = me > 100 ? Infinity : 100 - me, dd = dg > 100 ? Infinity : 100 - dg;
      msg = '<b>' + (dm < dd ? 'Voitit!' : dd < dm ? esc(S.dog.name) + ' voitti tällä kertaa.' : 'Tasapeli!') + '</b><br>Sinä: ' + me + (me > 100 ? ' (yli sadan)' : '') + ', ' + esc(S.dog.name) + ': ' + dg + (dg > 100 ? ' (yli sadan)' : '');
      if (!p.rewarded && dm < dd) { p.rewarded = true; S.bones += 5; save(); setTimeout(function () { showReward({ title: 'Voitit pelin!', bones: 5 }, function () { render(); }); }, 500); }
    }
    var canThrow = p.phase === 'me' && p.me.length < 6 && sataSum(p.me) <= 100;
    return '<section class="card game"><div class="game-head"><button class="icon-btn" data-act="park-back" aria-label="Takaisin">' + ICON.back + '</button><h1>Tavoitteena 100</h1></div>' +
      sataBoard(p.me, 'Sinä') + sataBoard(p.dog, esc(S.dog.name)) +
      '<div class="dice-row">' + (p.die ? D.ICONS.die(p.die, 'ico-die big') : '<span class="die-empty"></span>') + '<p class="game-msg">' + msg + '</p></div>' +
      (p.phase === 'me' ? '<div class="btn-row">' + (canThrow ? '<button class="cta big" data-act="sata-roll">Heitä noppaa</button>' : '') + (p.me.length ? '<button class="cta alt big" data-act="sata-stop">Lopeta tähän</button>' : '') + '</div>' : '') +
      (p.phase === 'done' ? '<button class="cta big" data-act="game" data-g="sata">Pelaa uudestaan</button>' : '') +
      '</section>';
  }
  function d6() { return 1 + Math.floor(Math.random() * 6); }
  function dogTurnSata() {
    park.phase = 'dog'; render();
    var step = function () {
      var arr = park.dog, i = arr.length, sum = sataSum(arr);
      var safe = i < 6 && sum + 6 * SATA_M[i] <= 100;
      var risky = i < 6 && sum + 3.5 * SATA_M[i] <= 96 && Math.random() < 0.75;
      if (i < 6 && (safe || risky || i === 0)) {
        park.die = d6(); arr.push(park.die); render();
        if (sataSum(arr) > 100) { park.phase = 'done'; render(); return; }
        setTimeout(step, reduceMotion ? 150 : 700);
      } else { park.phase = 'done'; render(); }
    };
    setTimeout(step, reduceMotion ? 150 : 600);
  }

  /* ---------------- Edistyminen ---------------- */
  function screenProgress() {
    var rows = Q.TOPICS.map(function (t) {
      var s = S.stats[t.id], tier = S.stars[t.id] || 0;
      var pct = s && s.asked ? Math.round(100 * s.first / s.asked) : null;
      return '<button class="prog-row" data-act="level" data-topic="' + t.id + '">' + D.ICONS.rosette(tier, 'ico-rosette') +
        '<span class="prog-name"><b>' + t.title + '</b><i>' + (s ? s.asked + ' tehtävää, ' + pct + ' % oikein ensimmäisellä yrityksellä' : 'Ei vielä harjoiteltu') + '</i></span>' +
        '<span class="prog-bar"><span style="width:' + (pct || 0) + '%" class="' + (pct == null ? '' : pct >= 80 ? 'hi' : pct >= 50 ? 'mid' : 'lo') + '"></span></span></button>';
    }).join('');
    var weak = Q.TOPICS.filter(function (t) { var s = S.stats[t.id]; return s && s.asked >= 4 && s.first / s.asked < 0.6; }).map(function (t) { return t.title.toLowerCase(); });
    return hud() + '<main class="progress">' +
      '<section class="card"><h1>Edistyminen</h1>' +
      '<p>Ruusukkeita yhteensä <b>' + totalStars() + '\u00A0/\u00A0' + Q.TOPICS.length * 3 + '</b>. Koiranäyttelyn paras tulos: <b>' + (S.exam.best != null ? S.exam.best + '\u00A0/\u00A020' : 'ei vielä') + '</b>.</p>' +
      (weak.length ? '<p class="weak">Kannattaa vielä harjoitella: ' + weak.join(', ') + '.</p>' : '') +
      '</section><section class="card prog-list">' + rows + '</section></main>';
  }

  /* ---------------- Asetukset ---------------- */
  function openSettings() {
    var coats = Object.keys(D.COATS).map(function (k) {
      return '<button class="swatch small' + (S.dog.coat === k ? ' on' : '') + '" data-act="set-coat" data-v="' + k + '" aria-label="' + D.COATS[k].name + '">' + D.drawDog({ coat: k, ears: S.dog.ears, age: 0, animate: false, viewBox: '36 2 168 168' }) + '</button>';
    }).join('');
    var ears = Object.keys(D.EARS).map(function (k) { return '<button class="pill' + (S.dog.ears === k ? ' on' : '') + '" data-act="set-ears" data-v="' + k + '">' + D.EARS[k] + '</button>'; }).join('');
    $ov.innerHTML = '<div class="settings" role="dialog" aria-modal="true" aria-labelledby="set-title"><h2 id="set-title">Asetukset</h2>' +
      '<label class="namefield"><span>Pennun nimi</span><input id="set-name" maxlength="14" value="' + esc(S.dog.name) + '"></label>' +
      '<h3>Pennun väri</h3><div class="swatches small">' + coats + '</div>' +
      '<h3>Korvat</h3><div class="pills">' + ears + '</div>' +
      '<label class="switch"><input type="checkbox" id="set-sound"' + (S.settings.sound ? ' checked' : '') + '><span>Äänet</span></label>' +
      '<label class="switch"><input type="checkbox" id="set-photos"' + (S.settings.photos ? ' checked' : '') + '><span>Näytä palkintona oikeita koirakuvia (haetaan netistä, Dog CEO -kuvapankki)</span></label>' +
      '<div class="btn-row"><button class="cta" data-act="settings-close">Valmis</button><button class="ghost danger" data-act="reset">Aloita alusta</button></div></div>';
    $ov.hidden = false; rewardClose = function () { render(); };
  }
  function saveSettingsFromForm() {
    var n = document.getElementById('set-name'), so = document.getElementById('set-sound'), ph = document.getElementById('set-photos');
    if (n && n.value.trim()) S.dog.name = n.value.trim().slice(0, 14);
    if (so) S.settings.sound = so.checked;
    if (ph) { S.settings.photos = ph.checked; if (ph.checked) { prefetchPhoto(); prefetchPhoto(); } }
    save();
  }

  /* ---------------- Tapahtumat ---------------- */
  function onClick(e) {
    var keyBtn = e.target.closest('[data-key]');
    if (keyBtn && $app.contains(keyBtn)) {
      if (keyBtn.closest('.locked')) return;
      var k = keyBtn.dataset.key;
      if (k === 'back') backspace(); else if (k === 'next') nextSlot(); else typeDigit(k);
      return;
    }
    var slot = e.target.closest('[data-slot]');
    if (slot && $app.contains(slot) && !slot.classList.contains('fixed') && !slot.closest('.locked')) { setActive(slot); return; }
    var el = e.target.closest('[data-act]');
    if (!el) return;
    var act = el.dataset.act;
    switch (act) {
      case 'home': park = null; go('home'); break;
      case 'settings': openSettings(); break;
      case 'level': startLevel(el.dataset.topic); break;
      case 'show': go('show'); break;
      case 'exam-start': startExam(); break;
      case 'park': park = null; go('park'); break;
      case 'shop': go('shop'); break;
      case 'progress': go('progress'); break;
      case 'quit':
        if (sess && sess.results.length && !window.confirm('Lopetetaanko treeni? Tämän kierroksen tulokset jäävät kesken.')) return;
        sess = null; go('home'); break;
      case 'check': check(); break;
      case 'opt': chooseOption(+el.dataset.i, el); break;
      case 'nextq': nextQuestion(); break;
      case 'nextstep': sess.si++; sess.tries = 0; sess.face = 'happy'; render(); break;
      case 'scratch': {
        var sc = $app.querySelector('.scratch');
        sc.hidden = !sc.hidden; el.textContent = sc.hidden ? 'Avaa apuruudukko' : 'Piilota apuruudukko';
        if (!sc.hidden) { var first = travOrder(sc.querySelector('[data-type="cell"]'))[0]; setActive(first); }
        else initSlots();
        break;
      }
      case 'adopt-coat': adoptDraft.coat = el.dataset.v; render(); break;
      case 'adopt-ears': adoptDraft.ears = el.dataset.v; render(); break;
      case 'adopt-go': {
        var nm = (document.getElementById('dogname').value || '').trim() || 'Nappi';
        S.dog = { name: nm.slice(0, 14), coat: adoptDraft.coat, ears: adoptDraft.ears, born: Date.now() };
        save(); sfx.win(); go('home'); break;
      }
      case 'buy': buy(el.dataset.id); break;
      case 'wear': wear(el.dataset.id); break;
      case 'game':
        if (el.dataset.g === 'tuhat') park = { g: 'tuhat', me: [null, null, null, null, null], dog: [null, null, null, null, null], phase: 'roll', die: null };
        else park = { g: 'sata', me: [], dog: [], phase: 'me', die: null };
        render(); break;
      case 'park-back': park = null; render(); break;
      case 'roll': park.die = d6(); park.phase = 'place'; sfx.tap(); render(); break;
      case 'place': {
        park.me[+el.dataset.i] = park.die; park.phase = 'dog'; render();
        setTimeout(function () {
          park.die = d6(); dogPlaceTuhat(park.dog, park.die);
          park.phase = park.me.every(function (x) { return x != null; }) ? 'done' : 'roll';
          render();
        }, reduceMotion ? 150 : 700);
        break;
      }
      case 'sata-roll':
        park.die = d6(); park.me.push(park.die); sfx.tap();
        if (sataSum(park.me) > 100 || park.me.length >= 6) { render(); setTimeout(dogTurnSata, 500); } else render();
        break;
      case 'sata-stop': dogTurnSata(); break;
    }
  }
  function onOverlayClick(e) {
    var el = e.target.closest('[data-act]');
    if (!el) { if (e.target === $ov && $ov.querySelector('.settings')) { saveSettingsFromForm(); closeOverlay(); } return; }
    var act = el.dataset.act;
    if (act === 'reward-close') closeOverlay();
    else if (act === 'settings-close') { saveSettingsFromForm(); closeOverlay(); }
    else if (act === 'set-coat') { saveSettingsFromForm(); S.dog.coat = el.dataset.v; save(); openSettings(); }
    else if (act === 'set-ears') { saveSettingsFromForm(); S.dog.ears = el.dataset.v; save(); openSettings(); }
    else if (act === 'reset') {
      if (window.confirm('Haluatko varmasti aloittaa alusta? Pentu, ruusukkeet ja luut nollautuvat.')) {
        try { localStorage.removeItem(KEY); } catch (err) { /* ok */ }
        S = defaultState(); rewardClose = null; closeOverlay(); sess = null; park = null; go('adopt');
      }
    }
  }
  function onKey(e) {
    if (!$ov.hidden) {
      if (e.key === 'Enter' || e.key === 'Escape') {
        var btn = $ov.querySelector('[data-act="reward-close"]');
        if (btn) { e.preventDefault(); closeOverlay(); }
        else if (e.key === 'Escape') { saveSettingsFromForm(); closeOverlay(); }
      }
      return;
    }
    if (view.name !== 'level' || e.target.tagName === 'INPUT') return;
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); typeDigit(e.key); }
    else if (e.key === 'Backspace') { e.preventDefault(); backspace(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      var nb = $app.querySelector('.feedback [data-act]');
      if (nb) nb.click(); else if ($app.querySelector('[data-act="check"]') && !$app.querySelector('.pad-area.locked')) check();
    }
    else if (e.key === 'Tab' && active) { e.preventDefault(); nextSlot(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); moveArrow(-1, 0); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); moveArrow(1, 0); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveArrow(0, -1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); moveArrow(0, 1); }
  }

  $app.addEventListener('click', onClick);
  $ov.addEventListener('click', onOverlayClick);
  document.addEventListener('keydown', onKey);

  /* testejä varten */
  window.TT_APP = { state: function () { return S; }, session: function () { return sess; }, go: go, startLevel: startLevel, startExam: startExam, showReward: showReward };

  render();
})();
