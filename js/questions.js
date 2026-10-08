/* Tassutreeni – tehtävägeneraattorit koko koealueelle (luvut 0–10 000, allekkain laskut, kertolaskut, laskujärjestys, sanatehtävät, päättely ja taituritehtävät) */
(function (global) {
  'use strict';

  /* ---------- Apufunktiot ---------- */
  function R(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var SP = ' ';
  function fmt(n) {
    var s = String(Math.abs(n));
    if (s.length > 3) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, SP);
    return (n < 0 ? '−' : '') + s;
  }
  function eur(n) { return fmt(n) + ' €'; }
  var MUL = ' · ', DIV = ' : ', PLUS = ' + ', MINUS = ' − ';
  function digitsOf(n) { return String(n).split('').map(Number); }
  function C(nn, k) { var r = 1; for (var i = 0; i < k; i++) r = r * (nn - i) / (i + 1); return Math.round(r); }
  function uniqBy(arr, key) { var seen = {}, out = []; arr.forEach(function (x) { var k = key(x); if (!seen[k]) { seen[k] = 1; out.push(x); } }); return out; }

  /* Monivalintavaihtoehdot: oikea + harhautukset, sekoitettuna, ei tuplia */
  function mcOptions(correct, wrongs, n) {
    n = n || 4;
    var opts = [{ html: correct, ok: true }];
    var seen = {}; seen[correct] = 1;
    wrongs.forEach(function (w) { if (opts.length < n && !seen[w]) { seen[w] = 1; opts.push({ html: w, ok: false }); } });
    return shuffle(opts);
  }

  /* ---------- Suomen lukusanat 0–9999 ---------- */
  var ONES = ['nolla', 'yksi', 'kaksi', 'kolme', 'neljä', 'viisi', 'kuusi', 'seitsemän', 'kahdeksan', 'yhdeksän'];
  function w100(n) {
    if (n < 10) return ONES[n];
    if (n === 10) return 'kymmenen';
    if (n < 20) return ONES[n - 10] + 'toista';
    var t = Math.floor(n / 10), o = n % 10;
    return ONES[t] + 'kymmentä' + (o ? ONES[o] : '');
  }
  function w1000(n) {
    var h = Math.floor(n / 100), r = n % 100;
    var s = h === 0 ? '' : (h === 1 ? 'sata' : ONES[h] + 'sataa');
    return s + (r ? w100(r) : '');
  }
  function words(n) {
    if (n === 0) return 'nolla';
    var th = Math.floor(n / 1000), r = n % 1000;
    var s = th === 0 ? '' : (th === 1 ? 'tuhat' : ONES[th] + 'tuhatta');
    var rest = r ? w1000(r) : '';
    return s && rest ? s + ' ' + rest : s + rest;
  }

  var PLACE = [
    { key: 'T', name: 'tuhansien', nom: 'tuhannet' },
    { key: 'S', name: 'satojen', nom: 'sadat' },
    { key: 'K', name: 'kymmenten', nom: 'kymmenet' },
    { key: 'Y', name: 'ykkösten', nom: 'ykköset' }
  ];

  /* TSKY-taulukko vihjeisiin */
  function tskyTable(n) {
    var d = String(n).padStart(4, ' ').split('');
    var cls = ['t', 's', 'k', 'y'];
    return '<table class="tsky"><tr>' + ['T', 'S', 'K', 'Y'].map(function (h, i) { return '<th class="c-' + cls[i] + '">' + h + '</th>'; }).join('') + '</tr><tr>' +
      d.map(function (x, i) { return '<td class="c-' + cls[i] + '">' + (x === ' ' ? '' : x) + '</td>'; }).join('') + '</tr></table>';
  }

  /* ---------- Allekkain-ruudukon tarkistus ---------- */
  function gridExpected(op, a, b) {
    if (op === 'add') return [a + b];
    if (op === 'sub') return [a - b];
    if (op === 'mul1') return [a * b];
    var o = b % 10, t = b - o;
    return [a * o, a * t, a * b];
  }
  function gridRowNames(op) {
    if (op === 'mul2') return ['ykkösrivi', 'kymmenrivi', 'summarivi'];
    return ['vastaus'];
  }
  /* rows: taulukko numeroita tai null (tyhjä/virheellinen rivi) */
  function gridCheck(op, a, b, rows) {
    var exp = gridExpected(op, a, b);
    var rowOk = exp.map(function (e, i) { return rows[i] === e; });
    return { ok: rowOk.every(Boolean), rowOk: rowOk, expected: exp };
  }
  function gridHint(op, a, b, rowOk) {
    if (op === 'add') return 'Laske sarakkeittain ykkösistä alkaen. Kun sarakkeen summa on 10 tai enemmän, kirjoita ykköset alle ja 1 muistinumeroksi seuraavan sarakkeen yläpuolelle.';
    if (op === 'sub') return 'Aloita ykkösistä. Jos ylempi numero on pienempi, lainaa vasemmalta naapurisarakkeelta. Jos naapurissa on 0, lainaa vielä kauempaa ja muuta nollat yhdeksiköiksi.';
    if (op === 'mul1') {
      var y = a % 10, p = b * y;
      return 'Aloita ykkösistä: ' + b + MUL + y + ' = ' + p + '. Kirjoita ' + (p % 10) + ' ykkösten paikalle' + (p >= 10 ? ' ja ' + Math.floor(p / 10) + ' muistinumeroksi' : '') + '. Lisää muistinumero aina seuraavaan tuloon, ennen kuin kirjoitat numeron.';
    }
    var o = b % 10, t = Math.floor(b / 10);
    if (!rowOk[0]) return 'Ykkösrivi: kerro koko luku ' + fmt(a) + ' luvun ' + fmt(b) + ' ykkösillä eli luvulla ' + o + '. Muista muistinumerot!';
    if (!rowOk[1]) return 'Kymmenrivi: kirjoita ensin ykkösten paikalle 0. Kerro sitten koko luku ' + fmt(a) + ' luvulla ' + t + ' ja kirjoita numerot nollan vasemmalle puolelle – kaikki numerot mukaan, myös viimeinen muistinumero.';
    return 'Rivit ovat oikein! Laske ne vielä yhteen allekkain: ' + fmt(gridExpected(op, a, b)[0]) + PLUS + fmt(gridExpected(op, a, b)[1]) + '.';
  }

  function gridStep(op, a, b, lead) {
    var sign = { add: PLUS, sub: MINUS, mul1: MUL, mul2: MUL }[op];
    var big = (op === 'mul1' || op === 'mul2') ? fmt(b) + sign + fmt(a) : fmt(a) + sign + fmt(b);
    var exp = gridExpected(op, a, b);
    return {
      kind: 'grid', op: op, a: a, b: b,
      lead: lead || 'Laske allekkain.', big: big,
      answerText: fmt(exp[exp.length - 1])
    };
  }

  /* ---------- Generaattoreiden apurit ---------- */
  function carriesAdd(a, b) {
    var c = 0, n = 0;
    while (a > 0 || b > 0) { var s = a % 10 + b % 10 + c; c = s >= 10 ? 1 : 0; n += c; a = Math.floor(a / 10); b = Math.floor(b / 10); }
    return n;
  }
  function borrowsSub(a, b) {
    var br = 0, n = 0;
    while (a > 0 || b > 0) { var d = a % 10 - br - b % 10; br = d < 0 ? 1 : 0; n += br; a = Math.floor(a / 10); b = Math.floor(b / 10); }
    return n;
  }
  function carriesMul(a, m) {
    var c = 0, n = 0;
    while (a > 0) { var p = (a % 10) * m + c; c = Math.floor(p / 10); if (c > 0 && a >= 10) n++; a = Math.floor(a / 10); }
    return n;
  }

  /* ===================================================================== */
  /*                          AIHEIDEN GENERAATTORIT                        */
  /* ===================================================================== */

  /* 1. Luvut ja lukuyksiköt */
  function genLuvut(d) {
    var type = pick([['place', 'tsky'], ['words2num', 'plusminus', 'tsky'], ['num2words', 'words2num', 'plusminus']][d]);
    if (type === 'place') {
      var N, ds;
      do { N = R(1000, 9999); ds = digitsOf(N); } while (uniqBy(ds, String).length < 4);
      var pi = R(0, 3);
      return { steps: [{ kind: 'num', lead: 'Mikä numero on <b>' + PLACE[pi].name + '</b> paikalla?', big: String(N), answer: ds[pi], answerText: String(ds[pi]),
        hint: 'Lukuyksiköt oikealta vasemmalle: ykköset (Y), kymmenet (K), sadat (S) ja tuhannet (T).' + tskyTable(N) }] };
    }
    if (type === 'tsky') {
      var t = R(1, 9), s = R(0, 9), k = R(0, 9), y = R(0, 9);
      if (d > 0 && Math.random() < 0.6) { if (Math.random() < 0.5) s = 0; else k = 0; }
      var Nn = t * 1000 + s * 100 + k * 10 + y;
      var parts = [[t, 'tuhat', 'tuhatta', 't'], [s, 'sata', 'sataa', 's'], [k, 'kymmenen', 'kymmentä', 'k'], [y, 'ykkönen', 'ykköstä', 'y']];
      var chips = parts.filter(function (p) { return d === 0 || p[0] !== 0; }).map(function (p) {
        return '<span class="chip c-' + p[3] + '">' + p[0] + ' ' + (p[0] === 1 ? p[1] : p[2]) + '</span>';
      }).join('<span class="chip-plus">+</span>');
      return { steps: [{ kind: 'num', lead: 'Mikä luku muodostuu näistä lukuyksiköistä?', html: '<div class="chips">' + chips + '</div>', answer: Nn, answerText: fmt(Nn),
        hint: 'Kirjoita numerot paikoilleen TSKY-taulukkoon. Jos jotain lukuyksikköä ei ole, sen paikalle tulee 0.' }] };
    }
    if (type === 'words2num') {
      var W = R(1000, 9999);
      if (d === 2 || Math.random() < 0.4) { var dz = digitsOf(W); dz[R(1, 2)] = 0; W = Number(dz.join('')); }
      return { steps: [{ kind: 'num', lead: 'Kirjoita luku numeroin.', big: '<span class="words">' + words(W) + '</span>', answer: W, answerText: fmt(W),
        hint: 'Pilko sana osiin: ensin tuhannet, sitten sadat, kymmenet ja ykköset. Puuttuvan lukuyksikön paikalle tulee 0.' + tskyTable(W) }] };
    }
    if (type === 'plusminus') {
      var delta = pick([10, 100, 1000]), up = Math.random() < 0.6, base, res, cross = Math.random() < 0.7;
      do {
        var bd = digitsOf(R(1100, 8900));
        if (delta === 100 && cross) bd[1] = up ? 9 : 0;
        if (delta === 10 && cross) bd[2] = up ? 9 : 0;
        base = Number(bd.join(''));
        res = up ? base + delta : base - delta;
      } while (res < 1000 || res > 9999);
      return { steps: [{ kind: 'num', lead: 'Mikä luku on <b>' + fmt(delta) + ' ' + (up ? 'suurempi' : 'pienempi') + '</b> kuin ' + fmt(base) + '?', big: fmt(base) + (up ? PLUS : MINUS) + fmt(delta), answer: res, answerText: fmt(res),
        hint: 'Kun lisäät tai vähennät ' + fmt(delta) + ', muuttuu ' + { 10: 'kymmenten', 100: 'satojen', 1000: 'tuhansien' }[delta] + ' numero. Jos se menee yli 9:n tai alle 0:n, muuttuu myös vasemmanpuoleinen numero.' }] };
    }
    /* num2words */
    var M, dm;
    do { M = R(1000, 9999); dm = digitsOf(M); } while (dm[1] === dm[2] || dm[2] === dm[3]);
    var cands = [
      Number([dm[0], dm[2], dm[1], dm[3]].join('')),
      Number([dm[0], dm[1], dm[3], dm[2]].join('')),
      Number([dm[0], dm[1] === 0 ? dm[2] : 0, dm[2], dm[3]].join('')),
      M + 100 <= 9999 ? M + 100 : M - 100
    ].filter(function (x) { return x !== M && x >= 1000; });
    return { steps: [{ kind: 'mc', lead: 'Miten luku luetaan?', big: fmt(M), layout: 'list',
      options: mcOptions(words(M), cands.map(words)),
      answerText: words(M), hint: 'Lue ensin tuhannet, sitten sadat, kymmenet ja ykköset.' + tskyTable(M) }] };
  }

  /* 2. Vertailu <, =, > */
  function cmpSym(a, b) { return a < b ? '<' : a > b ? '>' : '='; }
  function cmpStep(leftHtml, rightHtml, lv, rv, hint) {
    var sym = cmpSym(lv, rv);
    return { kind: 'mc', layout: 'symbols', lead: 'Valitse oikea merkki: &lt;, = tai &gt;.',
      big: '<span class="cmp">' + leftHtml + '<span class="cmp-box">?</span>' + rightHtml + '</span>',
      options: ['<', '=', '>'].map(function (s) { return { html: s, ok: s === sym }; }),
      answerText: leftHtml + ' ' + sym + ' ' + rightHtml, hint: hint };
  }
  function genVertailu(d) {
    var eq = Math.random() < 0.3;
    if (d === 0) {
      var a, ds, b;
      do { a = R(1000, 9999); ds = digitsOf(a); } while (ds[1] === ds[2] && ds[2] === ds[3]);
      if (eq) b = a;
      else if (Math.random() < 0.5) {
        var i = ds[1] !== ds[2] ? 1 : 2, dd = ds.slice(), t0 = dd[i]; dd[i] = dd[i + 1]; dd[i + 1] = t0; b = Number(dd.join(''));
      } else {
        do { b = a + pick([-1, 1]) * pick([1, 10, 100, 9, 90]); } while (b > 9999 || b < 1000);
      }
      return { steps: [cmpStep(fmt(a), fmt(b), a, b, 'Vertaa lukuja vasemmalta alkaen: ensin tuhannet, sitten sadat, kymmenet ja ykköset. Ensimmäinen ero ratkaisee.')] };
    }
    if (d === 1) {
      var t = R(1, 9), s = R(1, 9), k = R(0, 9), y = R(1, 9), N = t * 1000 + s * 100 + k * 10 + y;
      var trap = !eq && Math.random() < 0.35, parts, left;
      if (trap) { parts = [s * 100, k * 10, y]; left = N; }
      else {
        parts = [t * 1000, s * 100, k * 10, y];
        if (eq) left = N;
        else { do { left = N + pick([-1000, -100, -10, -1, 1, 10, 100, 1000]); } while (left < 1000 || left > 9999); }
      }
      parts = parts.filter(function (x) { return x > 0; });
      var right = parts.reduce(function (x, z) { return x + z; }, 0);
      return { steps: [cmpStep(fmt(left), parts.map(fmt).join(PLUS), left, right, 'Laske ensin oikean puolen summa: ' + parts.map(fmt).join(PLUS) + ' = ' + fmt(right) + '. Vertaa sitten lukuja.')] };
    }
    var form = pick(['sub', 'mul', 'add']), L, Rv, rh;
    if (form === 'sub') { var a1 = R(30, 95) * 100, b1 = pick([R(101, 399), R(1, 9) * 100 + R(1, 99)]); Rv = a1 - b1; rh = fmt(a1) + MINUS + fmt(b1); }
    else if (form === 'mul') { var m = R(2, 9), x = pick([R(2, 9) * 10, R(2, 9) * 100, R(1, 4) * 1000]); Rv = m * x; rh = fmt(m) + MUL + fmt(x); }
    else { var a2 = R(5, 89) * 100, b2 = R(100, 999); Rv = a2 + b2; rh = fmt(a2) + PLUS + fmt(b2); }
    L = eq ? Rv : Rv + pick([-2, 2, -1, 1]) * pick([1, 50, 100, 2]);
    if (L <= 0) L = Rv + 2;
    return { steps: [cmpStep(fmt(L), rh, L, Rv, 'Laske ensin lauseke: ' + rh + ' = ' + fmt(Rv) + '. Vertaa sitten lukuja.')] };
  }

  /* 3. Yhteenlasku allekkain */
  function genYhteen(d) {
    var a, b, want = [1, 2, 3][d], tries = 0;
    do {
      a = R(1000, 7999);
      b = d === 0 ? R(100, 999) : R(d === 1 ? 300 : 1000, d === 1 ? 2999 : 4999);
      tries++;
    } while ((a + b > 9999 || carriesAdd(a, b) !== want) && tries < 400);
    return { steps: [gridStep('add', a, b)] };
  }

  /* 4. Vähennyslasku allekkain */
  function genVahennys(d) {
    var a, b, tries = 0;
    if (d === 2) {
      do {
        var lead = R(2, 9), zeros = pick([[0, 0], [0, R(1, 9)], [R(1, 9), 0]]);
        a = Number([lead, zeros[0], zeros[1], R(0, 5)].join(''));
        if (Math.random() < 0.25) a = lead * 1000;
        b = Math.random() < 0.5 ? R(120, 899) : R(1100, a - 500);
        tries++;
      } while ((b >= a || borrowsSub(a, b) < 2) && tries < 400);
      return { steps: [gridStep('sub', a, b)] };
    }
    var want = d === 0 ? R(0, 1) : 2;
    do {
      a = R(2000, 9999);
      b = R(d === 0 ? 1000 : 600, a - 1);
      tries++;
    } while ((borrowsSub(a, b) !== want || /0/.test(String(a).slice(1))) && tries < 400);
    return { steps: [gridStep('sub', a, b)] };
  }

  /* 5. Kertominen 10:llä, 100:lla, 1000:lla ja pyöreillä luvuilla */
  function genPyoreat(d) {
    if (d === 0) {
      var k = pick([R(2, 9), R(2, 9), R(11, 60), 10]), p = pick([10, 100, 1000]);
      if (k * p > 10000) p = 100;
      if (k * p > 10000) p = 10;
      var res = k * p;
      return { steps: [{ kind: 'num', lead: 'Laske päässä.', big: fmt(k) + MUL + fmt(p), answer: res, answerText: fmt(res),
        hint: 'Kun kerrot luvulla ' + fmt(p) + ', lisää luvun ' + k + ' perään ' + ['', 'yksi nolla', 'kaksi nollaa', 'kolme nollaa'][String(p).length - 1] + '.' }] };
    }
    if (d === 1) {
      var kk = R(2, 9), m = R(2, 9), pw = pick([10, 100, 100, 1000]);
      if (kk * m * pw > 9999) pw = 100;
      if (kk * m >= 10 && Math.random() < 0.3) { m = R(2, 4); }
      var prod = kk * m, total = prod * pw;
      return { steps: [{ kind: 'fill', lead: 'Laske kertomalla ensin numerot ja lisäämällä sitten nollat.',
        parts: [fmt(kk) + MUL + fmt(m * pw) + ' = ' + kk + MUL + m + MUL + fmt(pw) + ' = ', { answer: prod }, MUL + fmt(pw) + ' = ', { answer: total }],
        answerText: fmt(kk) + MUL + fmt(m * pw) + ' = ' + fmt(total),
        hint: 'Kerro ensin ' + kk + MUL + m + ' = ' + prod + '. Lisää sitten perään ' + (String(pw).length - 1) + ' nollaa, koska kerrot vielä luvulla ' + fmt(pw) + '.' }] };
    }
    var form = pick(['xp', 'kx', 'kx']);
    if (form === 'xp') {
      var p2 = pick([10, 100]), x = p2 === 10 ? R(12, 99) : R(11, 99);
      return { steps: [{ kind: 'num', lead: 'Mikä luku puuttuu?', big: '<span class="blank">?</span>' + MUL + fmt(p2) + ' = ' + fmt(x * p2), answer: x, answerText: fmt(x),
        hint: 'Kun luku kerrotaan luvulla ' + fmt(p2) + ', sen perään tulee ' + (p2 === 10 ? 'yksi nolla' : 'kaksi nollaa') + '. Poista nollat tuloksesta.' }] };
    }
    var k3 = R(2, 9), m3 = R(2, 9), pw3 = pick([100, 1000]);
    if (k3 * m3 * pw3 > 9999) pw3 = 100;
    var xx = m3 * pw3;
    return { steps: [{ kind: 'num', lead: 'Mikä luku puuttuu?', big: k3 + MUL + '<span class="blank">?</span> = ' + fmt(k3 * xx), answer: xx, answerText: fmt(xx),
      hint: 'Mieti ilman nollia: ' + k3 + MUL + '? = ' + (k3 * m3) + '. Lisää sitten nollat takaisin.' }] };
  }

  /* 6. Kertominen lukuyksiköittäin */
  function genLukuyks(d, idx) {
    if (idx === 0 || (d === 0 && Math.random() < 0.3)) {
      var k = R(2, 5), a = R(2, 9), b = R(2, 9), nn = a * 10 + b;
      return { steps: [{ kind: 'mc', layout: 'list', lead: 'Miten ' + k + MUL + nn + ' lasketaan lukuyksiköittäin?',
        options: mcOptions(k + MUL + (a * 10) + PLUS + k + MUL + b, [k + MUL + a + MUL + b, k + MUL + a + PLUS + k + MUL + b, k + MUL + (a * 10) + PLUS + b]),
        answerText: k + MUL + nn + ' = ' + k + MUL + (a * 10) + PLUS + k + MUL + b + ' = ' + (k * a * 10) + PLUS + (k * b) + ' = ' + (k * nn),
        hint: 'Pura luku osiin: ' + nn + ' = ' + (a * 10) + PLUS + b + '. Kerro molemmat osat luvulla ' + k + '.' }] };
    }
    var len = d === 0 ? 2 : d === 1 ? 3 : 4, kk, n, tries = 0;
    do {
      kk = R(2, len === 4 ? 4 : 6);
      n = Number(Array.from({ length: len }, function (_, i) { return i === 0 ? R(1, len === 4 ? 3 : 9) : R(len === 4 && Math.random() < 0.25 ? 0 : 1, 9); }).join(''));
      tries++;
    } while (kk * n > 9999 && tries < 200);
    var ds = digitsOf(n), place = ds.map(function (x, i) { return x * Math.pow(10, len - 1 - i); }).filter(function (x) { return x > 0; });
    var parts = [fmt(kk) + MUL + fmt(n) + ' = ' + place.map(function (p) { return kk + MUL + fmt(p); }).join(PLUS) + '<br>= '];
    place.forEach(function (p, i) { if (i) parts.push(PLUS); parts.push({ answer: kk * p }); });
    parts.push('<br>= ');
    parts.push({ answer: kk * n });
    return { steps: [{ kind: 'fill', lead: 'Kerro lukuyksiköittäin.', parts: parts,
      answerText: fmt(kk) + MUL + fmt(n) + ' = ' + place.map(function (p) { return fmt(kk * p); }).join(PLUS) + ' = ' + fmt(kk * n),
      hint: 'Kerro jokainen osa erikseen, esimerkiksi ' + kk + MUL + fmt(place[0]) + ' = ' + kk + MUL + digitsOf(place[0])[0] + ' ' + (place[0] >= 1000 ? 'tuhatta' : place[0] >= 100 ? 'sataa' : 'kymmentä') + ' = ' + fmt(kk * place[0]) + '. Laske lopuksi osat yhteen.' }] };
  }

  /* 7. Kertolasku allekkain, yksinumeroinen kertoja */
  function genKerto1(d) {
    var a, m, tries = 0;
    do {
      if (d === 0) { a = R(112, 499); m = R(2, 5); }
      else if (d === 1) { a = Number([R(1, 3), R(0, 9), 0, R(1, 9)].join('')); if (Math.random() < 0.5) a = Number([R(1, 4), 0, R(1, 9), R(0, 9)].join('')); m = R(2, 6); }
      else { a = R(1000, 2999); m = R(3, 9); }
      tries++;
    } while ((a * m > 9999 || carriesMul(a, m) < (d === 2 ? 2 : 1)) && tries < 500);
    return { steps: [gridStep('mul1', a, m)] };
  }

  /* 8. Kaksinumeroinen kertoja (2-num · 2-num) */
  function genKerto2(d) {
    var a, b, tries = 0;
    var hi, lo;
    do {
      if (d === 0) { a = R(12, 35); b = R(11, 24); }
      else if (d === 1) { a = R(24, 69); b = R(12, 39); }
      else { a = R(36, 98); b = R(23, 89); }
      hi = Math.max(a, b); lo = Math.min(a, b);
      tries++;
    } while ((hi * lo > 9999 || lo % 10 === 0 || (lo % 10 === 1 && d > 0)) && tries < 300);
    return { steps: [gridStep('mul2', hi, lo)] };
  }

  /* 9. Kaksinumeroinen kertoja, kolminumeroinen kerrottava */
  function genKerto3(d) {
    var a, b, tries = 0;
    do {
      if (d === 0) { b = pick([20, 30, 20, 40]); a = R(105, 249); }
      else if (d === 1) { b = R(12, 35); a = Number([R(1, 3), 0, R(1, 9)].join('')); if (Math.random() < 0.4) a = Number([R(1, 3), R(1, 9), 0].join('')); }
      else { b = R(13, 42); a = R(112, 399); }
      tries++;
    } while (a * b > 9999 && tries < 300);
    return { steps: [gridStep('mul2', a, b)] };
  }

  /* 10. Laskujärjestys */
  function genJarjestys(d) {
    var t, expr, val, first, firstWrong, scratch = null;
    if (d === 0) {
      t = pick(['ab+c', 'a+bc', 'a-bc', '(a+b):c', '(a+b)c']);
      var a = R(2, 9), b = R(2, 9), c = R(2, 9);
      if (t === 'ab+c') { expr = a + MUL + b + PLUS + c; val = a * b + c; first = a + MUL + b; firstWrong = [b + PLUS + c]; }
      if (t === 'a+bc') { a = R(5, 40); expr = a + PLUS + b + MUL + c; val = a + b * c; first = b + MUL + c; firstWrong = [a + PLUS + b]; }
      if (t === 'a-bc') { a = b * c + R(3, 40); expr = a + MINUS + b + MUL + c; val = a - b * c; first = b + MUL + c; firstWrong = [a + MINUS + b]; }
      if (t === '(a+b):c') { var q = R(2, 9); c = R(2, 6); var s = q * c; a = R(1, s - 1); b = s - a; expr = '(' + a + PLUS + b + ')' + DIV + c; val = q; first = a + PLUS + b; firstWrong = [b + DIV + c]; }
      if (t === '(a+b)c') { expr = '(' + a + PLUS + b + ')' + MUL + c; val = (a + b) * c; first = a + PLUS + b; firstWrong = [b + MUL + c]; }
    } else if (d === 1) {
      t = pick(['ab+cd', 'ab-cd', 'a(b-c)', 'N-ab', 'a-b:c']);
      var a1 = R(2, 9), b1 = R(2, 9), c1 = R(2, 9), d1 = R(2, 9);
      if (t === 'ab+cd') { expr = a1 + MUL + b1 + PLUS + c1 + MUL + d1; val = a1 * b1 + c1 * d1; first = 'kertolaskut ' + a1 + MUL + b1 + ' ja ' + c1 + MUL + d1; firstWrong = [b1 + PLUS + c1]; }
      if (t === 'ab-cd') { while (a1 * b1 <= c1 * d1) { a1 = R(4, 9); b1 = R(4, 9); c1 = R(2, 5); d1 = R(2, 5); } expr = a1 + MUL + b1 + MINUS + c1 + MUL + d1; val = a1 * b1 - c1 * d1; first = 'kertolaskut ' + a1 + MUL + b1 + ' ja ' + c1 + MUL + d1; firstWrong = [b1 + MINUS + c1]; }
      if (t === 'a(b-c)') { var bb = R(12, 40), cc = R(2, bb - 5); a1 = R(2, 9); expr = a1 + MUL + '(' + bb + MINUS + cc + ')'; val = a1 * (bb - cc); first = bb + MINUS + cc; firstWrong = [a1 + MUL + bb]; }
      if (t === 'N-ab') { var x = R(12, 45), y = R(3, 9), N = Math.ceil((x * y + R(5, 60)) / 10) * 10; expr = fmt(N) + MINUS + x + MUL + y; val = N - x * y; first = x + MUL + y; firstWrong = [fmt(N) + MINUS + x]; }
      if (t === 'a-b:c') { var cq = R(2, 9), qq = R(2, 9), bq = cq * qq, aq = bq + R(5, 60); expr = aq + MINUS + bq + DIV + cq; val = aq - qq; first = bq + DIV + cq; firstWrong = [aq + MINUS + bq]; }
    } else {
      t = pick(['N-ab', 'a(b-c)', '(a+b)c', 'ab+c']);
      if (t === 'N-ab') { var x2 = R(13, 29), y2 = R(13, 45), N2 = Math.ceil((x2 * y2 + R(2, 40)) / 10) * 10; expr = fmt(N2) + MINUS + x2 + MUL + y2; val = N2 - x2 * y2; first = x2 + MUL + y2; firstWrong = [fmt(N2) + MINUS + x2]; scratch = { op: 'mul2', a: Math.max(x2, y2), b: Math.min(x2, y2) }; }
      if (t === 'a(b-c)') { var a3 = R(13, 29), b3 = R(20, 45), c3 = R(2, 9); expr = a3 + MUL + '(' + b3 + MINUS + c3 + ')'; val = a3 * (b3 - c3); first = b3 + MINUS + c3; firstWrong = [a3 + MUL + b3]; scratch = { op: 'mul2', a: Math.max(a3, b3 - c3), b: Math.min(a3, b3 - c3) }; }
      if (t === '(a+b)c') { var a4 = R(3, 9), b4 = R(4, 12), c4 = R(23, 79); expr = '(' + a4 + PLUS + b4 + ')' + MUL + c4; val = (a4 + b4) * c4; first = a4 + PLUS + b4; firstWrong = [b4 + MUL + c4]; scratch = { op: 'mul2', a: Math.max(a4 + b4, c4), b: Math.min(a4 + b4, c4) }; }
      if (t === 'ab+c') { var a5 = R(13, 38), b5 = R(12, 28), c5 = R(5, 99); expr = a5 + MUL + b5 + PLUS + c5; val = a5 * b5 + c5; first = a5 + MUL + b5; firstWrong = [b5 + PLUS + c5]; scratch = { op: 'mul2', a: Math.max(a5, b5), b: Math.min(a5, b5) }; }
    }
    var rule = 'Laskujärjestys: 1. sulkeet, 2. kerto- ja jakolaskut, 3. yhteen- ja vähennyslaskut vasemmalta oikealle.';
    var steps = [];
    if (Math.random() < 0.5 || d === 0) {
      steps.push({ kind: 'mc', layout: 'list', lead: 'Mikä lasketaan <b>ensin</b>?', big: expr,
        options: mcOptions(first, firstWrong.concat(['Ei ole väliä, kumpi lasketaan ensin'])), answerText: first, hint: rule });
    }
    steps.push({ kind: 'num', lead: 'Laske. Muista laskujärjestys.', big: expr, answer: val, answerText: fmt(val), hint: rule + ' Laske siis ensin ' + first + '.', scratch: scratch });
    return { steps: steps };
  }

  /* 11. Sanatehtävät: merkitse lauseke ja laske */
  var ITEMS = [
    ['koiranpeti', 'koiranpetiä', 'Yksi peti'], ['ruokasäkki', 'ruokasäkkiä', 'Yksi säkki'], ['hihna', 'hihnaa', 'Yksi hihna'],
    ['kaulapanta', 'kaulapantaa', 'Yksi panta'], ['purulelu', 'purulelua', 'Yksi lelu'], ['herkkupussi', 'herkkupussia', 'Yksi pussi'],
    ['sadetakki', 'sadetakkia', 'Yksi takki'], ['nuuskutusmatto', 'nuuskutusmattoa', 'Yksi matto'], ['ruokakuppi', 'ruokakuppia', 'Yksi kuppi']
  ];
  /* [perusmuoto, partitiivi, hinta-alue] */
  var BIG_ITEMS = [
    ['tietokone', 'tietokonetta', 899, 1499], ['tabletti', 'tablettia', 399, 899], ['puhelin', 'puhelinta', 299, 699],
    ['koirankoppi', 'koirankoppia', 189, 689], ['kuljetushäkki', 'kuljetushäkkiä', 119, 489], ['agilityeste', 'agilityestettä', 149, 599],
    ['lämpöpeti', 'lämpöpetiä', 109, 349]
  ];
  var BUYERS = ['Koirakoulu', 'Kennel', 'Eläinsuoja', 'Agilityseura', 'Koirapuiston yhdistys'];
  function priceOf(bi) { return R(bi[2], bi[3]); }

  function genSanat(d) {
    var tmpl = pick([['many', 'big', 'manyTwo'], ['many', 'left', 'plusOne', 'perDay'], ['left', 'more', 'practice', 'twoBig', 'perDay']][d]);
    var text, ok, wrong, ans, unit = '€', scratch = null, it, k, p, M, buyer = pick(BUYERS);
    if (tmpl === 'many' || tmpl === 'manyTwo') {
      it = pick(ITEMS); k = R(11, 39); p = R(12, 79);
      if (k * p > 9999) p = 49;
      text = buyer + ' ostaa ' + k + ' ' + it[1] + '. ' + it[2] + ' maksaa ' + eur(p) + '. Kuinka paljon ostokset maksavat yhteensä?';
      ok = k + MUL + eur(p); wrong = [k + PLUS + eur(p), eur(p) + MINUS + k, k + MUL + eur(p) + PLUS + eur(p)]; ans = k * p;
      scratch = { op: 'mul2', a: Math.max(k, p), b: Math.min(k, p) };
      if (tmpl === 'manyTwo') {
        var it2 = pick(BIG_ITEMS.slice(3)), p2 = priceOf(it2);
        text = buyer + ' ostaa ' + k + ' ' + it[1] + '. ' + it[2] + ' maksaa ' + eur(p) + '. Lisäksi ostoskoriin tulee yksi ' + it2[0] + ', joka maksaa ' + eur(p2) + '. Kuinka paljon ostokset maksavat yhteensä?';
        ok = k + MUL + eur(p) + PLUS + eur(p2); wrong = [k + MUL + '(' + eur(p) + PLUS + eur(p2) + ')', (k + 1) + MUL + eur(p), k + MUL + eur(p) + MINUS + eur(p2)];
        ans = k * p + p2;
      }
    } else if (tmpl === 'big') {
      var bi = pick(BIG_ITEMS); k = R(2, 6); p = priceOf(bi);
      while (k * p > 9999) k--;
      text = buyer + ' ostaa ' + k + ' ' + bi[1] + '. Yksi ' + bi[0] + ' maksaa ' + eur(p) + '. Kuinka paljon ostokset maksavat yhteensä?';
      ok = k + MUL + eur(p); wrong = [eur(p) + PLUS + k, eur(p) + MINUS + k, (k + 1) + MUL + eur(p)]; ans = k * p;
      scratch = { op: 'mul1', a: p, b: k };
    } else if (tmpl === 'plusOne') {
      var two = shuffle(BIG_ITEMS).slice(0, 2), pa = priceOf(two[0]), pb = priceOf(two[1]);
      text = 'Koirakouluun ostetaan kaksi ' + two[0][1] + ' ja yksi ' + two[1][0] + '. Yksi ' + two[0][0] + ' maksaa ' + eur(pa) + ' ja ' + two[1][0] + ' ' + eur(pb) + '. Kuinka paljon ostokset maksavat yhteensä?';
      ok = '2' + MUL + eur(pa) + PLUS + eur(pb); wrong = [eur(pa) + PLUS + eur(pb), '2' + MUL + '(' + eur(pa) + PLUS + eur(pb) + ')', '2' + MUL + eur(pa) + MINUS + eur(pb)]; ans = 2 * pa + pb;
      scratch = { op: 'mul1', a: pa, b: 2 };
    } else if (tmpl === 'left') {
      it = pick(ITEMS); k = R(12, 29); p = R(12, 39); M = Math.ceil((k * p + R(1, 40)) / 10) * 10;
      text = 'Sinulla on ' + eur(M) + '. Ostat koirakoululle ' + k + ' ' + it[1] + '. ' + it[2] + ' maksaa ' + eur(p) + '. Kuinka paljon rahaa jää?';
      ok = eur(M) + MINUS + k + MUL + eur(p); wrong = [eur(M) + MINUS + eur(p), k + MUL + eur(p) + MINUS + eur(M), eur(M) + PLUS + k + MUL + eur(p)]; ans = M - k * p;
      scratch = { op: 'mul2', a: Math.max(k, p), b: Math.min(k, p) };
    } else if (tmpl === 'more') {
      it = pick(ITEMS); k = R(21, 45); p = R(13, 29); M = Math.floor((k * p - R(20, 150)) / 100) * 100;
      if (M < 100) M = 100;
      text = 'Eläinsuoja tilaa ' + k + ' ' + it[1] + '. ' + it[2] + ' maksaa ' + eur(p) + '. Eläinsuojalla on rahaa ' + eur(M) + '. Kuinka paljon lisää rahaa tarvitaan?';
      ok = k + MUL + eur(p) + MINUS + eur(M); wrong = [eur(M) + MINUS + k + MUL + eur(p), k + MUL + eur(p) + PLUS + eur(M), eur(M) + MINUS + eur(p)]; ans = k * p - M;
      scratch = { op: 'mul2', a: Math.max(k, p), b: Math.min(k, p) };
    } else if (tmpl === 'practice') {
      var trick = pick(['istu', 'tassu', 'pyöri', 'odota', 'maahan']), a = R(21, 49), days = R(12, 19), T = Math.ceil((a * days + R(3, 60)) / 100) * 100;
      text = 'Pentu harjoittelee ' + trick + '-temppua ' + a + ' kertaa päivässä ' + days + ' päivän ajan. Kuinka monta kertaa sen pitää vielä harjoitella, jotta se saa täyteen ' + fmt(T) + ' harjoituskertaa?';
      ok = fmt(T) + MINUS + days + MUL + a; wrong = [fmt(T) + MINUS + a + MINUS + days, days + MUL + a + MINUS + fmt(T), fmt(T) + PLUS + days + MUL + a]; ans = T - a * days; unit = 'kertaa';
      scratch = { op: 'mul2', a: Math.max(a, days), b: Math.min(a, days) };
    } else if (tmpl === 'twoBig') {
      var bi3 = pick(BIG_ITEMS), pc = priceOf(bi3); M = Math.ceil((2 * pc + R(1, 60)) / 100) * 100;
      text = buyer + ' ostaa kaksi ' + bi3[1] + ', jotka maksavat ' + eur(pc) + ' kappale. Se maksaa ' + fmt(M) + ' eurolla. Kuinka paljon se saa rahaa takaisin?';
      ok = eur(M) + MINUS + '2' + MUL + eur(pc); wrong = [eur(M) + MINUS + eur(pc), '2' + MUL + eur(pc) + MINUS + eur(M), eur(M) + PLUS + '2' + MUL + eur(pc)]; ans = M - 2 * pc;
      scratch = { op: 'mul1', a: pc, b: 2 };
    } else { /* perDay */
      var act = pick([['Agilitykoira hyppää esteen yli', 'se hyppää esteen yli'], ['Pentu tuo pallon takaisin noutoleikissä', 'se tuo pallon takaisin'], ['Kennelin pennut saavat palkkioherkun', 'pennut saavat palkkioherkun'], ['Koirakoulun naksutin napsahtaa', 'naksutin napsahtaa']]), per = R(112, 399), dd = R(12, 24);
      while (per * dd > 9999) per -= 50;
      text = act[0] + ' keskimäärin ' + per + ' kertaa päivässä. Kuinka monta kertaa ' + act[1] + ' ' + dd + ' päivässä yhteensä?';
      ok = dd + MUL + per; wrong = [dd + PLUS + per, per + MINUS + dd, dd + MUL + per + PLUS + per]; ans = per * dd; unit = 'kertaa';
      scratch = { op: 'mul2', a: per, b: dd };
    }
    return { steps: [
      { kind: 'mc', layout: 'list', lead: 'Valitse oikea lauseke.', html: '<p class="story">' + text + '</p>', options: mcOptions(ok, wrong), answerText: ok,
        hint: 'Mieti, mitä tarinassa tapahtuu: monta samanlaista ostosta on kertolasku, eri ostokset lasketaan yhteen ja jäljelle jäävä raha lasketaan vähennyslaskulla.' },
      { kind: 'num', lead: 'Laske. Kirjoita tulos.', html: '<p class="story small">' + text + '</p><p class="expr">' + ok + '</p>', answer: ans, unit: unit, answerText: fmt(ans) + (unit ? ' ' + unit : ''),
        hint: 'Muista laskujärjestys: kertolasku lasketaan ensin. Voit käyttää apuruudukkoa.', scratch: scratch }
    ] };
  }

  /* 12. Päättely */
  function rowsSvg(rows, cols, extra, minus) {
    var w = 260, h = 16 + (rows + Math.max(extra, 0)) * 9, out = '<svg class="rows-svg" viewBox="0 0 ' + w + ' ' + h + '" aria-hidden="true">';
    for (var r = 0; r < rows + Math.max(extra, 0); r++) {
      var isExtra = r >= rows, isMinus = minus && r === rows - 1;
      out += '<rect x="8" y="' + (8 + r * 9) + '" width="' + (w - 16) + '" height="6" rx="3" fill="' + (isExtra ? '#2FBF71' : isMinus ? '#FF5C8A' : '#4F8BFF') + '" opacity="' + (isMinus ? 0.35 : 0.85) + '"/>';
    }
    return out + '</svg>';
  }
  function genPaattely(d) {
    var type = pick([['naapuri', 'naapuri'], ['naapuri2', 'puuttuva', 'kolmio'], ['puuttuva', 'kolmio', 'naapuri2']][d]);
    if (type === 'naapuri' || type === 'naapuri2') {
      var a = R(12, 28), b = R(12, 26), P = a * b;
      if (type === 'naapuri') {
        var delta = pick([1, -1, 1]), na = a + delta, val = na * b;
        return { steps: [{ kind: 'num', lead: 'Päättele. Tiedetään, että <b>' + a + MUL + b + ' = ' + fmt(P) + '</b>.', big: na + MUL + b + ' = ?', answer: val, answerText: fmt(val),
          hint: (delta > 0 ? na + MUL + b + ' on <b>yksi ' + b + ' enemmän</b> kuin ' + a + MUL + b + '. Kuvittele ' + a + ' riviä, joissa jokaisessa on ' + b + ' luuta – uusi rivi tuo ' + b + ' luuta lisää.'
            : na + MUL + b + ' on <b>yksi ' + b + ' vähemmän</b> kuin ' + a + MUL + b + '. Kuvittele ' + a + ' riviä, joissa jokaisessa on ' + b + ' luuta – yksi rivi otetaan pois.') + rowsSvg(a, b, delta > 0 ? 1 : 0, delta < 0),
          solution: fmt(P) + (delta > 0 ? PLUS : MINUS) + b + ' = ' + fmt(val) }] };
      }
      return { steps: [
        { kind: 'num', lead: 'Päättele. Tiedetään, että <b>' + a + MUL + b + ' = ' + fmt(P) + '</b>.', big: (a + 1) + MUL + b + ' = ?', answer: P + b, answerText: fmt(P + b),
          hint: (a + 1) + MUL + b + ' on yksi ' + b + ' enemmän kuin ' + a + MUL + b + '. Lisää siis ' + fmt(P) + ' + ' + b + '.' + rowsSvg(a, b, 1, false) },
        { kind: 'num', lead: 'Jatka päättelyä. Nyt tiedät, että <b>' + (a + 1) + MUL + b + ' = ' + fmt(P + b) + '</b>.', big: (a + 2) + MUL + b + ' = ?', answer: P + 2 * b, answerText: fmt(P + 2 * b),
          hint: 'Lisää vielä yksi ' + b + ': ' + fmt(P + b) + ' + ' + b + '.' }
      ] };
    }
    if (type === 'puuttuva') {
      var k = R(2, 4), x, tries = 0;
      do {
        x = Number([R(1, 3), R(0, 4), R(0, 4), R(1, 4)].join(''));
        if (d === 2 && Math.random() < 0.5) x = R(1001, 2499);
        tries++;
      } while (k * x > 9999 && tries < 100);
      var Nx = k * x, xd = digitsOf(x);
      return { steps: [{ kind: 'num', lead: 'Päättele puuttuva luku.', big: k + MUL + '<span class="blank">?</span> = ' + fmt(Nx), answer: x, answerText: fmt(x),
        hint: 'Kokeile lukuyksiköittäin: ' + k + MUL + fmt(xd[0] * 1000) + ' = ' + fmt(k * xd[0] * 1000) + '. Mieti sitten, montako sataa, kymmentä ja ykköstä vielä tarvitaan. Tarkista lopuksi kertomalla.' }] };
    }
    if (Math.random() < 0.6) {
      var m = R(3, 9), L = R(10, 45) * 10, ansK = Math.floor((L - 1) / m);
      return { steps: [{ kind: 'num', lead: 'Keksi kolmion tilalle <b>mahdollisimman suuri</b> luku.', big: m + MUL + '△ &lt; ' + fmt(L), answer: ansK, answerText: '△ = ' + ansK + ' (' + m + MUL + ansK + ' = ' + (m * ansK) + ')',
        hint: 'Kokeile: ' + m + MUL + '10 = ' + (m * 10) + ', ' + m + MUL + '20 = ' + (m * 20) + '. Etsi suurin luku, jolla tulo jää vielä alle ' + fmt(L) + '.' }] };
    }
    var L2 = R(5, 20) * 10, s = Math.floor(Math.sqrt(L2 - 1));
    return { steps: [{ kind: 'num', lead: 'Keksi kolmion tilalle <b>mahdollisimman suuri</b> luku. Molemmissa kolmioissa on sama luku.', big: '△' + MUL + '△ &lt; ' + fmt(L2), answer: s, answerText: '△ = ' + s + ' (' + s + MUL + s + ' = ' + (s * s) + ')',
      hint: 'Kokeile lukuja: 10' + MUL + '10 = 100, 11' + MUL + '11 = 121, 12' + MUL + '12 = 144 … Mikä on suurin, joka jää alle ' + fmt(L2) + '?' }] };
  }

  /* 13. Etsi virhe */
  function noCarryMul(a, m) {
    var ds = digitsOf(a), out = [];
    for (var i = ds.length - 1; i >= 0; i--) {
      var v = ds[i] * m;
      out.unshift(i > 0 ? String(v % 10) : String(v));
    }
    return Number(out.join(''));
  }
  function genVirhe(d) {
    var a, b, tries = 0, err, rows;
    do {
      if (d < 2) { a = R(23, 79); b = R(12, 39); } else { a = R(112, 349); b = R(12, 29); }
      if (a < b) { var t = a; a = b; b = t; }
      tries++;
    } while ((a * b > 9999 || b % 10 < 2) && tries < 300);
    var exp = gridExpected('mul2', a, b);
    var types = ['sum', 'p2'];
    if (noCarryMul(a, b % 10) !== exp[0]) types.push('p1', 'p1');
    err = pick(types);
    if (err === 'p1') { rows = [noCarryMul(a, b % 10), exp[1]]; rows.push(rows[0] + rows[1]); }
    else if (err === 'p2') { var p2w = exp[1] >= 1000 ? exp[1] % 1000 : exp[1] / 10; rows = [exp[0], p2w, exp[0] + p2w]; }
    else {
      var s = exp[0] + exp[1], wrongS = carriesAdd(exp[0], exp[1]) > 0 ? s - (function () {
        var x = exp[0], y = exp[1], c = 0, pos = 1, cols = [];
        while (x > 0 || y > 0) { var z = x % 10 + y % 10 + c; c = z >= 10 ? 1 : 0; if (c) cols.push(pos * 10); x = Math.floor(x / 10); y = Math.floor(y / 10); pos *= 10; }
        return pick(cols);
      })() : s + 100;
      rows = [exp[0], exp[1], wrongS];
    }
    var names = { p1: 'Ykkösrivillä', p2: 'Kymmenrivillä', sum: 'Yhteenlaskussa' };
    var why = {
      p1: 'Ykkösrivillä muistinumero on unohtunut: ' + (b % 10) + MUL + fmt(a) + ' = ' + fmt(exp[0]) + ', ei ' + fmt(rows[0]) + '.',
      p2: 'Kymmenrivi on jäänyt kesken: ' + fmt(b - b % 10) + MUL + fmt(a) + ' = ' + fmt(exp[1]) + ', ei ' + fmt(rows[1]) + '.',
      sum: 'Rivit ovat oikein, mutta yhteenlaskussa on unohtunut muistinumero: ' + fmt(exp[0]) + PLUS + fmt(exp[1]) + ' = ' + fmt(exp[2]) + '.'
    }[err];
    return { steps: [
      { kind: 'mc', layout: 'list', lead: 'Ruudukossa on yksi virhe. Missä se on?', big: fmt(b) + MUL + fmt(a), shownGrid: { op: 'mul2', a: a, b: b, rows: rows },
        options: ['p1', 'p2', 'sum'].map(function (k) { return { html: names[k], ok: k === err }; }), answerText: names[err] + '. ' + why,
        hint: 'Tarkista jokainen rivi itse: ykkösrivi on ' + (b % 10) + MUL + fmt(a) + ', kymmenrivi on ' + (b - b % 10) + MUL + fmt(a) + ' ja lopuksi rivit lasketaan yhteen.' },
      { kind: 'num', lead: 'Hyvä! ' + why + ' Laske nyt oikea tulos.', big: fmt(b) + MUL + fmt(a) + ' = ?', shownGrid: { op: 'mul2', a: a, b: b, rows: rows }, answer: exp[2], answerText: fmt(exp[2]),
        hint: 'Laske allekkain uudelleen apuruudukossa.', scratch: { op: 'mul2', a: a, b: b } }
    ] };
  }

  /* 14. Lenkkipolku: valitse lasku, jonka tulos on alle 4 000 */
  function polkuExpr(under) {
    var forms = under ? [
      function () { var k = R(2, 3), x = R(11, 19) * 100; return [k, x]; },
      function () { return [pick([2, 3]), pick([1010, 1111, 1001, 1200, 1300])]; },
      function () { return [4, pick([998, 990, 950, 900, 800])]; },
      function () { return [2, pick([1999, 1950, 1900, 1500])]; },
      function () { return [pick([5, 6, 7, 8, 9]), pick([300, 400, 200, 500])]; },
      function () { return [pick([6, 8, 9]), pick([100, 300, 400])]; }
    ] : [
      function () { return [4, pick([1100, 1010, 1001, 1200])]; },
      function () { return [pick([5, 6, 7, 8, 9]), pick([900, 800, 700, 1001, 1011, 999])]; },
      function () { return [pick([2, 3]), pick([2000, 2500, 3000, 4000])]; },
      function () { return [10, 1000]; },
      function () { return [100, 100]; },
      function () { return [7, pick([700, 600, 1001])]; },
      function () { return [1999, 5]; }
    ];
    var f, v, tries = 0;
    do { f = pick(forms)(); v = f[0] * f[1]; tries++; } while ((under ? v >= 4000 : v < 4000) && tries < 50);
    if (Math.random() < 0.3) f = [f[1], f[0]];
    return { html: fmt(f[0]) + MUL + fmt(f[1]), v: f[0] * f[1] };
  }
  function genPolku(d) {
    var n = d === 0 ? 2 : 3, good = polkuExpr(true), opts = [{ html: good.html, ok: true, v: good.v }], tries = 0;
    while (opts.length < n && tries < 50) {
      var b = polkuExpr(false);
      if (!opts.some(function (o) { return o.html === b.html; })) opts.push({ html: b.html, ok: false, v: b.v });
      tries++;
    }
    opts = shuffle(opts);
    return { steps: [{ kind: 'mc', layout: 'signs', lead: 'Pentu on lenkkipolun risteyksessä. Kulje sitä polkua, jonka laskun tulos on <b>alle 4' + SP + '000</b>.',
      options: opts.map(function (o) { return { html: o.html, ok: o.ok }; }),
      answerText: good.html + ' = ' + fmt(good.v),
      hint: 'Laske jokainen lasku: ' + opts.map(function (o) { return o.html + ' = ' + fmt(o.v); }).join(', ') + '.' }] };
  }

  /* 15. Lukujonot */
  function genJonot(d) {
    var type = pick([['double', 'step'], ['double', 'table', 'step'], ['doubleOver', 'table', 'stepDown']][d]);
    if (type === 'double' || type === 'doubleOver') {
      var s = pick([1, 3, 5, 10, 25, 15, 6, 50]), seq = [s];
      for (var i = 0; i < 9; i++) seq.push(seq[seq.length - 1] * 2);
      if (type === 'doubleOver') {
        var lim = pick([1000, 2000, 5000, 3000]), first = seq.filter(function (x) { return x > lim; })[0];
        if (!first || first > 20000) return genJonot(d);
        return { steps: [{ kind: 'num', lead: 'Jatka lukujonoa samalla säännöllä. Mikä on ensimmäinen luku, joka on <b>suurempi kuin ' + fmt(lim) + '</b>?', big: seq.slice(0, 4).map(fmt).join(', ') + ', …', answer: first, answerText: fmt(first),
          hint: 'Jokainen luku on kaksi kertaa edellinen. Jatka tuplaamista: ' + seq.slice(0, 6).map(fmt).join(', ') + ', …' }] };
      }
      var at = d === 0 ? 4 : R(5, 6);
      return { steps: [{ kind: 'num', lead: d === 0 ? 'Mikä luku tulee seuraavaksi?' : 'Mikä on jonon ' + (at + 1) + '. luku?', big: seq.slice(0, 4).map(fmt).join(', ') + ', …', answer: seq[at], answerText: fmt(seq[at]),
        hint: 'Katso, miten luku muuttuu: ' + fmt(seq[0]) + ' → ' + fmt(seq[1]) + ' → ' + fmt(seq[2]) + '. Joka kerta luku kerrotaan kahdella.' }] };
    }
    if (type === 'table') {
      var st = pick([2, 4, 5, 6, 3]), col = R(5, 9), top = [1, 2, 3].map(function (c) { return st * c; });
      var mult = pick([10, 100]), want = st * col * (mult === 10 ? 10 : 100);
      var html = '<table class="seq-table"><tr>' + top.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '<td>…</td><td class="q">' + (st * col) + '</td></tr>' +
        '<tr>' + top.map(function (x) { return '<td>' + fmt(x * 10) + '</td>'; }).join('') + '<td>…</td><td class="q">' + (mult === 10 ? '?' : fmt(st * col * 10)) + '</td></tr>' +
        '<tr>' + top.map(function (x) { return '<td>' + fmt(x * 100) + '</td>'; }).join('') + '<td>…</td><td class="q">' + (mult === 100 ? '?' : '') + '</td></tr></table>';
      return { steps: [{ kind: 'num', lead: 'Krokotiilijono: toinen rivi on ylärivi kertaa 10 ja kolmas rivi ylärivi kertaa 100. Mikä luku tulee kysymysmerkin kohdalle?', html: html, answer: want, answerText: fmt(want),
        hint: 'Ylärivillä on ' + (st * col) + '. Kerro se luvulla ' + mult + '.' }] };
    }
    var stp = pick([25, 50, 125, 250, 500, 150]), down = type === 'stepDown', start = down ? R(30, 90) * 100 : stp * R(1, 4);
    var sq = [0, 1, 2, 3, 4].map(function (i) { return down ? start - i * stp : start + i * stp; });
    return { steps: [{ kind: 'num', lead: 'Mikä luku tulee seuraavaksi?', big: sq.slice(0, 4).map(fmt).join(', ') + ', …', answer: sq[4], answerText: fmt(sq[4]),
      hint: 'Laske, paljonko luku muuttuu joka askeleella: ' + fmt(sq[1]) + MINUS + fmt(sq[0]) + ' = ' + fmt(Math.abs(sq[1] - sq[0])) + '.' }] };
  }

  /* 16. Salakirjoitus A = 1 … Ö = 29 */
  var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'.split('');
  var WORDS = ['HAU', 'LUU', 'TASSU', 'PENTU', 'HÄNTÄ', 'KUONO', 'HIHNA', 'PALLO', 'LENKKI', 'KOIRA', 'HERKKU', 'PANTA', 'NAPPI', 'KIRSU', 'KORVA', 'PETI', 'LELU', 'MURU', 'HAUKKU', 'NOUDA', 'ISTU', 'TÄNNE', 'RAPSU', 'PUSU', 'KOPPI', 'LUMI'];
  function encode(w) { return w.split('').map(function (ch) { return ABC.indexOf(ch) + 1; }); }
  function codeHtml(nums) { return '<span class="code">' + nums.map(function (x) { return '<b>' + x + '</b>'; }).join('') + '</span>'; }
  function abcTable() {
    return '<div class="abc">' + ABC.map(function (ch, i) { return '<span><b>' + ch + '</b>' + (i + 1) + '</span>'; }).join('') + '</div>';
  }
  function genKoodi(d) {
    var type = pick([['letter', 'decode'], ['decode', 'decode', 'encode'], ['encode', 'decode']][d]);
    if (type === 'letter') {
      var ch = pick(ABC.slice(0, 26));
      return { steps: [{ kind: 'num', lead: 'Mikä numero on kirjaimella <b>' + ch + '</b>?', html: abcTable(), answer: ABC.indexOf(ch) + 1, answerText: String(ABC.indexOf(ch) + 1), hint: 'Etsi kirjain aakkosista ja katso sen alla oleva numero.' }] };
    }
    var w = pick(WORDS);
    var same = shuffle(WORDS.filter(function (x) { return x !== w && Math.abs(x.length - w.length) <= 1; }));
    if (type === 'decode') {
      return { steps: [{ kind: 'mc', layout: 'grid', lead: 'Ratkaise salakirjoitus. Mikä sana on kyseessä?', html: codeHtml(encode(w)) + abcTable(),
        options: mcOptions(w, same), answerText: w + ' = ' + encode(w).join(' '), hint: 'Etsi jokaisen numeron kirjain aakkosista. Ensimmäinen numero ' + encode(w)[0] + ' on kirjain ' + w[0] + '.' }] };
    }
    var e = encode(w);
    var w1 = e.slice(); w1[R(0, w1.length - 1)] += 1;
    var w2 = e.slice().reverse();
    var w3 = e.map(function (x) { return x === 1 ? 2 : x - 1; });
    return { steps: [{ kind: 'mc', layout: 'list', lead: 'Mikä numerosarja tarkoittaa sanaa <b>' + w + '</b>?', html: abcTable(),
      options: mcOptions(e.join(' '), [w1.join(' '), w2.join(' ') === e.join(' ') ? w3.join(' ') : w2.join(' '), w3.join(' ')]), answerText: w + ' = ' + e.join(' '),
      hint: 'Muuta jokainen kirjain numeroksi: ' + w[0] + ' = ' + e[0] + '.' }] };
  }

  /* 17. Kiinalainen viivakertolasku */
  function linesSvg(m, digits, showDots) {
    var gap = 8, groupGap = 24, x = 30, groups = [];
    digits.forEach(function (dg) {
      var xs = []; for (var i = 0; i < dg; i++) { xs.push(x); x += gap; }
      groups.push(xs); x += groupGap - gap;
    });
    var w = x + 10, redGap = 11, h = 40 + (m - 1) * redGap + 40, cy0 = 40;
    var reds = []; for (var r = 0; r < m; r++) reds.push(cy0 + r * redGap);
    var out = '<svg class="lines-svg" viewBox="-20 -60 ' + (w + 40) + ' ' + (h + 120) + '" aria-label="Viivakertolasku"><g transform="rotate(24 ' + (w / 2) + ' ' + (h / 2) + ')">';
    reds.forEach(function (y) { out += '<line x1="10" y1="' + y + '" x2="' + (w + 10) + '" y2="' + y + '" stroke="#F0466F" stroke-width="2.4" stroke-linecap="round"/>'; });
    groups.forEach(function (xs) { xs.forEach(function (gx) { out += '<line x1="' + gx + '" y1="' + (cy0 - 34) + '" x2="' + gx + '" y2="' + (reds[reds.length - 1] + 34) + '" stroke="#1F2A44" stroke-width="2.4" stroke-linecap="round"/>'; }); });
    if (showDots) groups.forEach(function (xs) { xs.forEach(function (gx) { reds.forEach(function (y) { out += '<circle cx="' + gx + '" cy="' + y + '" r="2.8" fill="#1F2A44"/>'; }); }); });
    return out + '</g></svg>';
  }
  function genViivat(d) {
    var m = d === 0 ? R(2, 3) : R(2, 4), len = d === 0 ? 3 : 4, digits, tries = 0;
    do { digits = Array.from({ length: len }, function () { return R(1, 4); }); tries++; } while (m * Number(digits.join('')) > 9999 && tries < 100);
    var n = Number(digits.join('')), res = m * n;
    var wrong1 = m + MUL + fmt(Number(digits.slice().reverse().join('')));
    var wrong2 = (m === 2 ? 3 : m - 1) + MUL + fmt(n);
    var dd = digits.slice(), wi = R(0, len - 1); dd[wi] = dd[wi] === 4 ? 3 : dd[wi] + 1; var wrong3 = m + MUL + fmt(Number(dd.join('')));
    var correct = m + MUL + fmt(n);
    return { steps: [
      { kind: 'mc', layout: 'list', lead: 'Vanhassa kiinalaisessa kertolaskutavassa punaiset viivat kertovat kertojan ja mustat viivaryhmät kerrottavan numerot. Mikä kertolasku kuvassa on?', html: linesSvg(m, digits, false),
        options: mcOptions(correct, [wrong1, wrong2, wrong3]), answerText: correct,
        hint: 'Laske punaiset viivat: niitä on ' + m + '. Laske sitten mustat viivat ryhmittäin vasemmalta: ensimmäinen ryhmä on ' + (len === 4 ? 'tuhannet' : 'sadat') + '.' },
      { kind: 'num', lead: 'Laske kertolasku. Viivojen risteyskohdat kertovat jokaisen lukuyksikön määrän.', html: linesSvg(m, digits, true), big: correct + ' = ?', answer: res, answerText: fmt(res),
        hint: 'Jokaisessa ryhmässä on risteyksiä ' + m + ' kertaa viivojen määrä: ' + digits.map(function (x) { return m * x; }).join(', ') + '.' }
    ] };
  }

  /* 18. Pulmat (taituritehtävät) */
  var TOYS = ['pallo', 'luu', 'köysilelu', 'kumiankka', 'pehmolelu', 'frisbee'];
  var RIDDLES = [
    { clues: ['Luvussa on neljä numeroa.', 'Numeroiden summa on 3.', 'Jos luvusta vähennetään 1' + SP + '000, tulos on edelleen nelinumeroinen.', 'Luku on pariton.'], answer: 2001,
      test: function (x) { var s = digitsOf(x).reduce(function (a, b) { return a + b; }, 0); return s === 3 && x - 1000 >= 1000 && x % 2 === 1; } },
    { clues: ['Luvussa on neljä numeroa.', 'Kolme numeroista on samoja.', 'Numeroiden summa on 33.', 'Luvussa ei ole numeroa 6.', 'Satojen paikalla oleva numero on suurin.'], answer: 8988,
      test: function (x) { var ds = digitsOf(x), cnt = {}; ds.forEach(function (v) { cnt[v] = (cnt[v] || 0) + 1; }); var three = Object.keys(cnt).some(function (k) { return cnt[k] === 3; }); return three && ds.reduce(function (a, b) { return a + b; }, 0) === 33 && ds.indexOf(6) < 0 && ds[1] > ds[0] && ds[1] > ds[2] && ds[1] > ds[3]; } },
    { clues: ['Luvussa on neljä numeroa.', 'Numeroiden summa on 2.', 'Luku on parillinen.', 'Luku on suurempi kuin 1' + SP + '500.'], answer: 2000,
      test: function (x) { return digitsOf(x).reduce(function (a, b) { return a + b; }, 0) === 2 && x % 2 === 0 && x > 1500; } },
    { clues: ['Luvussa on neljä numeroa.', 'Kaikki numerot ovat samoja.', 'Numeroiden summa on 20.'], answer: 5555,
      test: function (x) { var ds = digitsOf(x); return ds.every(function (v) { return v === ds[0]; }) && ds.reduce(function (a, b) { return a + b; }, 0) === 20; } },
    { clues: ['Luvussa on neljä numeroa.', 'Numeroiden summa on 4.', 'Luku on pariton.', 'Luku on suurempi kuin 3' + SP + '000.'], answer: 3001,
      test: function (x) { return digitsOf(x).reduce(function (a, b) { return a + b; }, 0) === 4 && x % 2 === 1 && x > 3000; } },
    { clues: ['Luvussa on neljä numeroa.', 'Kaikki numerot ovat eri numeroita.', 'Numeroiden summa on 6.', 'Luku on mahdollisimman suuri.'], answer: 3210,
      test: null },
    { clues: ['Luvussa on neljä numeroa.', 'Numeroiden summa on 35.', 'Ykkösten paikalla on 8.'], answer: 9998,
      test: function (x) { return digitsOf(x).reduce(function (a, b) { return a + b; }, 0) === 35 && x % 10 === 8; } }
  ];
  function genPulmat(d) {
    var type = pick([['numform', 'pigeon', 'liput', 'riddle'], ['numform', 'comb', 'pigeon', 'pisteet', 'setelit', 'riddle'], ['numform', 'comb', 'pisteet', 'setelit', 'kassit', 'liput2', 'kortit', 'riddle']][d]);
    if (type === 'numform') {
      var digs; do { digs = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4); } while (digs.indexOf(0) < 0 && Math.random() < 0.6);
      var nums = [];
      (function perm(arr, cur) { if (!arr.length) { if (cur[0] !== 0) nums.push(Number(cur.join(''))); return; } arr.forEach(function (x, i) { perm(arr.slice(0, i).concat(arr.slice(i + 1)), cur.concat([x])); }); })(digs, []);
      var sorted = digs.slice().sort(function (a, b) { return a - b; });
      var T = (pick(sorted.filter(function (x) { return x > 1; })) || 3) * 1000;
      var over = nums.filter(function (x) { return x > T; }).sort(function (a, b) { return a - b; });
      var ask = d === 0 ? pick(['min', 'max']) : pick(['count', 'min', 'count']);
      var intro = 'Muodosta numerokorteista ' + sorted.join(', ') + ' nelinumeroisia lukuja. Jokaista korttia käytetään kerran, eikä luku saa alkaa nollalla.';
      if (ask === 'count') return { steps: [{ kind: 'num', lead: intro, big: 'Montako lukua on suurempia kuin ' + fmt(T) + '?', answer: over.length, answerText: over.length + ' lukua: ' + over.map(fmt).join(', '),
        hint: 'Luvun pitää alkaa numerolla, joka on suurempi kuin ' + (T / 1000) + ' (tai yhtä suuri, jos loput numerot ovat isompia). Kirjoita luvut järjestyksessä pienimmästä alkaen.' }] };
      var target = ask === 'min' ? over[0] : over[over.length - 1];
      return { steps: [{ kind: 'num', lead: intro, big: (ask === 'min' ? 'Mikä on pienin luku, joka on suurempi kuin ' : 'Mikä on suurin luku, joka on suurempi kuin ') + fmt(T) + '?', answer: target, answerText: fmt(target),
        hint: ask === 'min' ? 'Valitse ensimmäiseksi pienin mahdollinen tuhansien numero, ja laita loput numerot pienimmästä suurimpaan.' : 'Laita numerot suurimmasta pienimpään.' }] };
    }
    if (type === 'comb') {
      var nT = R(4, 5), kT = R(2, 3), toys = TOYS.slice(0, nT);
      return { steps: [{ kind: 'num', lead: 'Pennun lelukorissa on ' + nT + ' erilaista lelua: ' + toys.join(', ') + '. Pentu saa ottaa mukaan puistoon ' + kT + ' lelua. Järjestyksellä ei ole merkitystä.', big: 'Montako erilaista valintaa on?', answer: C(nT, kT), answerText: String(C(nT, kT)),
        hint: 'Merkitse lelut kirjaimilla A, B, C, D' + (nT === 5 ? ', E' : '') + ' ja luettele järjestelmällisesti: ' + (kT === 2 ? 'AB, AC, AD, …, sitten BC, BD, …' : 'ABC, ABD, …, sitten BCD, …') + ' Älä laske samaa valintaa kahdesti.' }] };
    }
    if (type === 'pigeon') {
      var cnt = R(3, 6), kind = pick(['two', 'three', 'diff']);
      var q = { two: ['kaksi samanlaista herkkua', 4], three: ['kolme erilaista herkkua', 2 * cnt + 1], diff: ['kaksi erilaista herkkua', cnt + 1] }[kind];
      return { steps: [{ kind: 'num', lead: 'Suljetussa herkkupussissa on ' + cnt + ' luuta, ' + cnt + ' nappulaa ja ' + cnt + ' makkaraa. Pussista nostetaan herkkuja katsomatta yksi kerrallaan.', big: 'Montako herkkua pitää vähintään nostaa, jotta saat varmasti ' + q[0] + '?', answer: q[1], answerText: String(q[1]),
        hint: 'Mieti huonointa mahdollista tuuria: ' + { two: 'ensin tulee yksi jokaista lajia (3 herkkua), joten seuraava on varmasti samanlainen.', three: 'ensin tulevat kaikki yhden lajin herkut ja sitten kaikki toisen lajin herkut. Vasta sen jälkeen tulee varmasti kolmas laji.', diff: 'ensin tulevat kaikki saman lajin herkut. Vasta sitten tulee varmasti eri laji.' }[kind] }] };
    }
    if (type === 'liput') {
      var A = R(6, 15) * 2, Lc = A / 2, na = R(1, 3), nc = R(1, 3), tot = na * A + nc * Lc;
      return { steps: [{ kind: 'num', lead: na + ' aikuisten ' + (na > 1 ? 'koiranäyttelylippua' : 'koiranäyttelylippu') + ' ja ' + nc + ' lasten ' + (nc > 1 ? 'lippua' : 'lippu') + ' maksavat yhteensä ' + eur(tot) + '. Lasten lippu on puolet halvempi kuin aikuisten lippu.', big: 'Mikä on lasten lipun hinta?', answer: Lc, unit: '€', answerText: eur(Lc),
        hint: 'Aikuisten lippu on kaksi lastenlippua. Muuta kaikki liput lastenlipuiksi: ' + na + ' aikuisten lippua = ' + (2 * na) + ' lastenlippua. Lastenlippuja on siis yhteensä ' + (2 * na + nc) + '.' }] };
    }
    if (type === 'liput2') {
      var Ad = R(8, 20), Ch = R(4, Ad - 1), X = 2 * Ch + Ad, Y = 2 * Ch + 2 * Ad;
      return { steps: [{ kind: 'num', lead: 'Kaksi lasten lippua ja yksi aikuisten lippu maksavat yhteensä ' + eur(X) + '. Kaksi lasten lippua ja kaksi aikuisten lippua maksavat yhteensä ' + eur(Y) + '.', big: 'Kuinka paljon maksaa yksi lasten lippu?', answer: Ch, unit: '€', answerText: eur(Ch),
        hint: 'Vertaa ostoksia: jälkimmäisessä on yksi aikuisten lippu enemmän. Aikuisten lippu maksaa siis ' + eur(Y) + MINUS + eur(X) + '.' }] };
    }
    if (type === 'pisteet') {
      var vals = [2, 4, 6, 8, 10], kP = R(3, 4), combos = [];
      (function comb(start, cur) { if (cur.length === kP) { combos.push(cur.slice()); return; } for (var i = start; i < vals.length; i++) { cur.push(vals[i]); comb(i + 1, cur); cur.pop(); } })(0, []);
      var sums = {}; combos.forEach(function (c) { var s = c.reduce(function (a, b) { return a + b; }, 0); (sums[s] = sums[s] || []).push(c); });
      var uniq = combos.filter(function (c) { return sums[c.reduce(function (a, b) { return a + b; }, 0)].length === 1; });
      var right = pick(uniq), S = right.reduce(function (a, b) { return a + b; }, 0);
      var wrongs = shuffle(combos.filter(function (c) { return c.join() !== right.join(); })).map(function (c) { return c.join(', '); });
      var name = pick(['Nappi', 'Muru', 'Rekku', 'Lumi', 'Tassu']);
      return { steps: [{ kind: 'mc', layout: 'list', lead: 'Palloseinässä on reiät, joista saa 2, 4, 6, 8 ja 10 pistettä. Samaan reikään saa heittää vain yhden pallon. ' + name + ' saa ' + kP + ' osumalla ' + S + ' pistettä.', big: 'Mihin reikiin pallot osuivat?',
        options: mcOptions(right.join(', '), wrongs), answerText: right.join(' + ') + ' = ' + S, hint: 'Laske jokaisen vaihtoehdon pisteet yhteen ja vertaa lukuun ' + S + '.' }] };
    }
    if (type === 'setelit') {
      var notes = [5, 10, 20, 50, 100, 200, 500], nN = R(3, 5), pickN, total, cnt2;
      var tries = 0;
      do {
        pickN = shuffle(notes).slice(0, nN).sort(function (a, b) { return b - a; });
        total = pickN.reduce(function (a, b) { return a + b; }, 0);
        cnt2 = 0;
        (function f(i, left, k) { if (k === 0) { if (left === 0) cnt2++; return; } for (var j = i; j < notes.length; j++) if (notes[j] <= left) f(j, left - notes[j], k - 1); })(0, total, nN);
        tries++;
      } while (cnt2 !== 1 && tries < 200);
      var opts = [pickN.join(' + ')];
      var alt1 = pickN.slice(); alt1[alt1.length - 1] = alt1[alt1.length - 1] === 5 ? 10 : 5;
      var alt2 = pickN.slice(); alt2[0] = alt2[0] === 500 ? 200 : 500;
      var alt3 = pickN.slice(0, -1).concat([pickN[pickN.length - 1] * 2 > 500 ? 20 : pickN[pickN.length - 1] * 2]);
      return { steps: [{ kind: 'mc', layout: 'list', lead: 'Lompakossa on ' + nN + ' seteliä, ja niissä on rahaa yhteensä ' + eur(total) + '. Setelit ovat 5, 10, 20, 50, 100, 200 ja 500 euron seteleitä.', big: 'Mitkä setelit lompakossa on?',
        options: mcOptions(opts[0], [alt1, alt2, alt3].map(function (a) { return a.sort(function (x, y) { return y - x; }).join(' + '); })), answerText: pickN.join(' + ') + ' = ' + total,
        hint: 'Laske jokaisen vaihtoehdon setelit yhteen. Tarkista myös, että seteleitä on täsmälleen ' + nN + '.' }] };
    }
    if (type === 'kassit') {
      var ok = false, bags, swapA, swapB, ba, bb, tries2 = 0;
      while (!ok && tries2 < 400) {
        tries2++;
        var S2 = R(16, 26);
        bags = [0, 1, 2].map(function () {
          var n2 = R(3, 4), arr = [], left = S2;
          for (var i = 0; i < n2 - 1; i++) { var v = R(2, Math.min(12, left - (n2 - i - 1) * 2)); arr.push(v); left -= v; }
          if (left < 2 || left > 15) return null; arr.push(left); return arr;
        });
        if (bags.some(function (b) { return !b; })) continue;
        ba = R(0, 2); bb = (ba + R(1, 2)) % 3;
        var ia = R(0, bags[ba].length - 1), ib = R(0, bags[bb].length - 1);
        if (bags[ba][ia] === bags[bb][ib]) continue;
        swapA = bags[ba][ia]; swapB = bags[bb][ib];
        bags[ba][ia] = swapB; bags[bb][ib] = swapA;
        var sols = [];
        for (var x = 0; x < 3; x++) for (var y = x + 1; y < 3; y++) bags[x].forEach(function (u) { bags[y].forEach(function (w) {
          var sx = bags[x].reduce(function (a, b) { return a + b; }, 0) - u + w, sy = bags[y].reduce(function (a, b) { return a + b; }, 0) - w + u, z = 3 - x - y, sz = bags[z].reduce(function (a, b) { return a + b; }, 0);
          if (sx === sy && sy === sz) sols.push([x, u, y, w].join('-'));
        }); });
        ok = uniqBy(sols, String).length === 1;
      }
      if (!ok) { bags = [[5, 7, 6, 2], [7, 12, 5], [5, 4, 4, 3]]; ba = 1; bb = 2; swapB = 7; swapA = 3; }
      var bagHtml = '<div class="bags">' + bags.map(function (b, i) { return '<div class="bag"><span class="bag-name">Kassi ' + (i + 1) + '</span>' + b.map(function (v) { return '<span class="coin">' + v + '&nbsp;€</span>'; }).join('') + '</div>'; }).join('') + '</div>';
      var correct = swapB + ' € kassista ' + (ba + 1) + ' ↔ ' + swapA + ' € kassista ' + (bb + 1);
      var wr = [];
      for (var t = 0; t < 12 && wr.length < 3; t++) {
        var x1 = R(0, 2), y1 = (x1 + R(1, 2)) % 3, u1 = pick(bags[x1]), w1 = pick(bags[y1]);
        var s1 = u1 + ' € kassista ' + (x1 + 1) + ' ↔ ' + w1 + ' € kassista ' + (y1 + 1);
        var s1r = w1 + ' € kassista ' + (y1 + 1) + ' ↔ ' + u1 + ' € kassista ' + (x1 + 1);
        if (s1 !== correct && s1r !== correct && wr.indexOf(s1) < 0 && u1 !== w1) wr.push(s1);
      }
      return { steps: [{ kind: 'mc', layout: 'list', lead: 'Vaihda kaksi ostosta keskenään niin, että kaikkien kassien ostokset maksavat yhtä paljon.', html: bagHtml, big: 'Mitkä ostokset vaihdetaan?',
        options: mcOptions(correct, wr), answerText: correct,
        hint: 'Laske ensin jokaisen kassin summa. Kaikkien kassien yhteissumma jaetaan kolmeen yhtä suureen osaan. Etsi kassit, joissa on liikaa ja liian vähän.' }] };
    }
    if (type === 'kortit') {
      var o1 = R(1, 9), t1 = R(0, 8), aNum = 9900 + t1 * 10 + o1, bNum = (9 - t1) * 10 + (10 - o1);
      var cardsArr = digitsOf(aNum).concat(digitsOf(bNum));
      var wrongSet = {};
      (function perm(arr, cur) {
        if (!arr.length) {
          if (cur[0] === 0 || cur[4] === 0) return;
          var x = Number(cur.slice(0, 4).join('')), y = Number(cur.slice(4).join(''));
          if (x + y !== 10000 && Math.abs(x + y - 10000) < 120) wrongSet[fmt(x) + PLUS + y] = 1;
          return;
        }
        arr.forEach(function (v, i) { perm(arr.slice(0, i).concat(arr.slice(i + 1)), cur.concat([v])); });
      })(cardsArr, []);
      var wrongs2 = shuffle(Object.keys(wrongSet)).slice(0, 3);
      if (wrongs2.length < 2) return genPulmat(d);
      return { steps: [{ kind: 'mc', layout: 'list', lead: 'Tuuli sekoitti numerokortit ' + shuffle(cardsArr).join(', ') + '. Jokaista korttia käytetään kerran.', big: 'Mikä yhteenlasku antaa tulokseksi 10' + SP + '000?',
        options: mcOptions(fmt(aNum) + PLUS + bNum, wrongs2), answerText: fmt(aNum) + PLUS + bNum + ' = 10' + SP + '000',
        hint: 'Ykkösten summan pitää olla 10, ja kymmenten summan muistinumeron kanssa myös 10. Laske jokainen vaihtoehto.' }] };
    }
    var rd = pick(RIDDLES);
    return { steps: [{ kind: 'num', lead: 'Mikä luku aarrearkussa on?', html: '<ul class="clues">' + rd.clues.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>', answer: rd.answer, answerText: fmt(rd.answer),
      hint: 'Käy vihjeet läpi yksi kerrallaan. Aloita vihjeestä, joka rajaa eniten, ja kokeile lukuja.' }] };
  }

  /* ===================================================================== */

  var TOPICS = [
    { id: 'luvut',     trick: 'Istu',        title: 'Luvut ja lukuyksiköt',          obstacle: 'kartio',  gen: genLuvut },
    { id: 'vertailu',  trick: 'Tassu',       title: 'Suurempi, pienempi vai yhtä suuri', obstacle: 'pöytä', gen: genVertailu },
    { id: 'yhteen',    trick: 'Maahan',      title: 'Yhteenlasku allekkain',         obstacle: 'hyppy',   gen: genYhteen },
    { id: 'vahennys',  trick: 'Odota',       title: 'Vähennyslasku allekkain',       obstacle: 'keinu',   gen: genVahennys },
    { id: 'pyoreat',   trick: 'Pyöri',       title: 'Kertominen 10:llä, 100:lla ja 1000:lla', obstacle: 'rengas', gen: genPyoreat },
    { id: 'lukuyks',   trick: 'Kieri',       title: 'Kertominen lukuyksiköittäin',   obstacle: 'a',       gen: genLukuyks },
    { id: 'kerto1',    trick: 'Hyppää',      title: 'Kertolasku allekkain',          obstacle: 'hyppy',   gen: genKerto1 },
    { id: 'kerto2',    trick: 'Pujottele',   title: 'Kaksinumeroinen kertoja',       obstacle: 'kepit',   gen: genKerto2 },
    { id: 'kerto3',    trick: 'Tunneli',     title: 'Iso kerrottava ja kaksinumeroinen kertoja', obstacle: 'tunneli', gen: genKerto3 },
    { id: 'jarjestys', trick: 'Etsi',        title: 'Laskujärjestys',                obstacle: 'nuuhku',  gen: genJarjestys },
    { id: 'sanat',     trick: 'Nouda',       title: 'Sanatehtävät: merkitse lauseke ja laske', obstacle: 'pallo', gen: genSanat },
    { id: 'virhe',     trick: 'Peruuta',     title: 'Etsi virhe allekkainlaskusta',  obstacle: 'kartio',  gen: genVirhe },
    { id: 'paattely',  trick: 'Kumarra',     title: 'Päättele ja keksi',             obstacle: 'luu',     gen: genPaattely },
    { id: 'polku',     trick: 'Hihnalenkki', title: 'Lenkkipolku: alle 4\u202F000',       obstacle: 'keinu',   gen: genPolku },
    { id: 'jonot',     trick: 'Seuraa',      title: 'Lukujonot',                     obstacle: 'kepit',   gen: genJonot },
    { id: 'viivat',    trick: 'Ylävitonen',  title: 'Kiinalainen viivakertolasku',   obstacle: 'viivat',  gen: genViivat },
    { id: 'koodi',     trick: 'Puhu',        title: 'Salakirjoitus',                 obstacle: 'koodi',   gen: genKoodi },
    { id: 'pulmat',    trick: 'Mestaritemppu', title: 'Pulmat ja taituritehtävät',   obstacle: 'pokaali', gen: genPulmat }
  ];
  var BY_ID = {};
  TOPICS.forEach(function (t) { BY_ID[t.id] = t; });

  var LEVEL_LEN = 8;
  function diffFor(i) { return i < 3 ? 0 : i < 6 ? 1 : 2; }

  function makeQuestion(topicId, d, idx) {
    var q = BY_ID[topicId].gen(d, idx);
    q.topic = topicId;
    return q;
  }

  function makeLevel(topicId) {
    var out = [], seen = {};
    for (var i = 0; i < LEVEL_LEN; i++) {
      var q, key, tries = 0;
      do { q = makeQuestion(topicId, diffFor(i), i); key = JSON.stringify(q.steps.map(function (s) { return [s.big, s.html, s.a, s.b]; })); tries++; } while (seen[key] && tries < 20);
      seen[key] = 1;
      out.push(q);
    }
    return out;
  }

  var EXAM_PLAN = [
    ['luvut', 1], ['vertailu', 2], ['yhteen', 2], ['vahennys', 1], ['vahennys', 2], ['pyoreat', 1], ['pyoreat', 2],
    ['lukuyks', 1], ['lukuyks', 2], ['kerto1', 1], ['kerto1', 2], ['kerto2', 1], ['kerto3', 1], ['kerto3', 2],
    ['jarjestys', 1], ['jarjestys', 2], ['sanat', 1], ['sanat', 2], ['paattely', 1], ['virhe', 1]
  ];
  function makeExam() {
    return EXAM_PLAN.map(function (p, i) { return makeQuestion(p[0], p[1], i + 1); });
  }

  global.TT_Q = {
    TOPICS: TOPICS, BY_ID: BY_ID, LEVEL_LEN: LEVEL_LEN,
    makeLevel: makeLevel, makeExam: makeExam, makeQuestion: makeQuestion,
    gridExpected: gridExpected, gridCheck: gridCheck, gridHint: gridHint, gridRowNames: gridRowNames,
    fmt: fmt, eur: eur, words: words, RIDDLES: RIDDLES, encode: encode, ABC: ABC,
    _gens: { genLuvut: genLuvut, genVertailu: genVertailu, genPulmat: genPulmat }
  };
  if (typeof module !== 'undefined') module.exports = global.TT_Q;
})(typeof window !== 'undefined' ? window : globalThis);
