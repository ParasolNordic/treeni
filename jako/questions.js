/* Jakotreeni – tehtävägeneraattorit (jakolasku-jakso: luvut 31–37)
   Jokainen vaihe sisältää:
   - lead / big / html: tehtävä
   - hint: tekstivihje väärän vastauksen jälkeen
   - explain: 2–3 lauseen opastus (näytetään ja luetaan ääneen vain napista)
   - traps: tunnetut virheet → virhepatterni (tag) + palaute */
(function (global) {
  'use strict';

  /* ---------------- Apurit ---------------- */
  function R(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var SP = ' ', NB = ' ';
  function fmt(n) { var s = String(Math.abs(n)); if (s.length > 3) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, SP); return (n < 0 ? '−' : '') + s; }
  function eur(n) { return fmt(n) + NB + '€'; }
  var MUL = NB + '·' + NB, DIV = NB + ':' + NB, PLUS = NB + '+' + NB, MINUS = NB + '−' + NB, EQ = NB + '=' + NB;
  function frac(a, b) { return '<span class="frac"><span>' + (typeof a === 'number' ? fmt(a) : a) + '</span><span>' + (typeof b === 'number' ? fmt(b) : b) + '</span></span>'; }
  function F(answer, o) { var f = { answer: answer }; for (var k in o || {}) f[k] = o[k]; if (f.traps) f.traps = f.traps.filter(function (t) { return t[0] !== answer && t[0] >= 0; }); return f; }
  function digits(n) { return String(n).split('').map(Number); }
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function uniq(a) { var s = {}, o = []; a.forEach(function (x) { var k = String(x); if (!s[k]) { s[k] = 1; o.push(x); } }); return o; }
  function mc(correct, wrongs, n) {
    n = n || 4;
    var out = [{ html: correct, ok: true }], seen = {}; seen[correct] = 1;
    wrongs.forEach(function (w) {
      var h = typeof w === 'object' ? w.html : w;
      if (out.length < n && !seen[h]) { seen[h] = 1; out.push(typeof w === 'object' ? { html: h, ok: false, tag: w.tag, msg: w.msg } : { html: h, ok: false }); }
    });
    return shuffle(out);
  }
  function sentenceCount(t) { return (t.match(/[.!?](\s|$)/g) || []).length; }

  /* ---------------- Havainnollistukset ---------------- */
  function boneIcon(x, y, s, fill) {
    var w = 18 * s, h = 7 * s, r = h * 0.55;
    return '<g transform="translate(' + x + ' ' + y + ')"><rect x="' + (-w / 2 + r) + '" y="' + (-h / 2) + '" width="' + (w - 2 * r) + '" height="' + h + '" fill="' + (fill || '#FFF6E2') + '" stroke="#7A5232" stroke-width="1.4"/>' +
      [[-w / 2 + r, -h / 2.4], [-w / 2 + r, h / 2.4], [w / 2 - r, -h / 2.4], [w / 2 - r, h / 2.4]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="' + (fill || '#FFF6E2') + '" stroke="#7A5232" stroke-width="1.4"/>'; }).join('') +
      '<rect x="' + (-w / 2 + r) + '" y="' + (-h / 2 + 1.2) + '" width="' + (w - 2 * r) + '" height="' + (h - 2.4) + '" fill="' + (fill || '#FFF6E2') + '"/></g>';
  }
  /* Herkut jaetaan kulhoihin: total herkkua, k kulhoa. split=true näyttää jaon. */
  function bowlsSvg(total, k, split) {
    var q = Math.floor(total / k), r = total - q * k;
    var bw = 64, gap = 12, W = Math.max(k * (bw + gap) + 40 + (split && r ? 70 : 0), 300), H = split ? 70 + Math.ceil(q / 3) * 16 + 30 : 150;
    var out = '<svg class="bowls" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + total + ' herkkua ja ' + k + ' kulhoa">';
    if (!split) {
      for (var i = 0; i < total; i++) {
        var cx = 30 + (i % 14) * 18 + (Math.floor(i / 14) % 2) * 9, cy = 20 + Math.floor(i / 14) * 14;
        out += boneIcon(cx, cy, 0.85);
      }
    }
    var by = H - 34;
    for (var b = 0; b < k; b++) {
      var x0 = 20 + b * (bw + gap);
      if (split) for (var j = 0; j < q; j++) out += boneIcon(x0 + 12 + (j % 3) * 20, by - 10 - Math.floor(j / 3) * 14, 0.8);
      out += '<path d="M' + x0 + ' ' + by + ' h' + bw + ' l-8 24 h-' + (bw - 16) + ' z" fill="#FF9FB7" stroke="#1F2A44" stroke-width="2.4" stroke-linejoin="round"/>';
      out += '<ellipse cx="' + (x0 + bw / 2) + '" cy="' + by + '" rx="' + (bw / 2) + '" ry="6" fill="#FFC2D1" stroke="#1F2A44" stroke-width="2.4"/>';
    }
    if (split && r) {
      var rx = 20 + k * (bw + gap) + 4;
      for (var t = 0; t < r; t++) out += boneIcon(rx + 14 + (t % 2) * 22, by - 2 - Math.floor(t / 2) * 14, 0.8, '#FFE0A3');
      out += '<text x="' + (rx + 24) + '" y="' + (by + 22) + '" font-size="13" font-weight="700" fill="#B3173E" text-anchor="middle">jää ' + r + '</text>';
    }
    return out + '</svg>';
  }
  /* Osittain jakamisen palkki: jaettava kahteen osaan */
  function splitBar(n, f, dv, showQ) {
    var r = n - f, w1 = Math.max(28, Math.round(100 * f / n)), w2 = Math.max(18, 100 - w1);
    return '<div class="splitbar" aria-hidden="true"><div class="sb-whole">' + fmt(n) + '</div><div class="sb-parts">' +
      '<div class="sb-a" style="flex:' + w1 + '"><b>' + fmt(f) + '</b>' + (showQ ? '<span>: ' + dv + ' = ' + fmt(f / dv) + '</span>' : '<span>: ' + dv + '</span>') + '</div>' +
      '<div class="sb-b" style="flex:' + w2 + '"><b>' + fmt(r) + '</b>' + (showQ ? '<span>: ' + dv + ' = ' + fmt(r / dv) + '</span>' : '<span>: ' + dv + '</span>') + '</div></div></div>';
  }
  /* Jakajan kertotaulu ja kymmenkertaiset tulokset kuten kirjassa */
  function tableRow(dv, hi) {
    var top = [], bot = [];
    for (var i = 1; i <= 10; i++) {
      top.push('<td' + (hi === dv * i ? ' class="hi"' : '') + '>' + fmt(dv * i) + '</td>');
      bot.push('<td' + (hi === dv * i * 10 ? ' class="hi"' : '') + '>' + fmt(dv * i * 10) + '</td>');
    }
    return '<table class="ktable" aria-label="Luvun ' + dv + ' kertotaulu"><tr>' + top.join('') + '</tr><tr class="ten">' + bot.join('') + '</tr></table>';
  }
  /* Lukuyksiköt sarakkeina */
  function placeCols(n, dv) {
    var ds = digits(n), names = ['Y', 'K', 'S', 'T'], cls = ['y', 'k', 's', 't'];
    return '<div class="pcols" aria-hidden="true">' + ds.map(function (dg, i) {
      var p = ds.length - 1 - i;
      return '<div class="pcol c-' + cls[p] + '"><i>' + names[p] + '</i><b>' + dg + '</b><span>: ' + dv + '</span><b class="pq">' + (dg / dv) + '</b></div>';
    }).join('') + '</div>';
  }

  /* ---------------- Yleiset ansat ---------------- */
  function reverseNum(n) { return Number(String(n).split('').reverse().join('')); }

  /* ===================================================================== */
  /* 1. Jakolaskut kertotaulusta ja herkkukoodi                             */
  /* ===================================================================== */
  var CODE = { 1: 'A', 2: 'E', 3: 'I', 4: 'K', 5: 'L', 6: 'M', 7: 'N', 8: 'O', 9: 'R', 10: 'T' };
  var LETTER = {}; Object.keys(CODE).forEach(function (k) { LETTER[CODE[k]] = Number(k); });
  var CODE_WORDS = ['KOIRA', 'NAMI', 'KALA', 'OMENA', 'MATTO', 'KANI', 'TAKKI', 'KIELI', 'MEKKO', 'TORNI', 'KOTI', 'LIMA', 'NAKKI', 'MAKKARA', 'TALKKARI'];
  CODE_WORDS = CODE_WORDS.filter(function (w) { return w.split('').every(function (c) { return LETTER[c]; }); });

  function factStep(a, b, lead) {
    var q = a / b;
    return {
      kind: 'num', lead: lead || 'Laske.', big: fmt(a) + DIV + b, answer: q, answerText: fmt(q),
      traps: [[q + 1, 'kertotaulu', 'Kertotaulussa yksi askel liian pitkälle. Tarkista: ' + b + ' · ' + (q + 1) + ' = ' + (b * (q + 1)) + '.'], [q - 1, 'kertotaulu', 'Kertotaulussa yksi askel liian lyhyt. Tarkista: ' + b + ' · ' + (q - 1) + ' = ' + (b * (q - 1)) + '.'], [a - b, 'kertotaulu', 'Vähensit jakajan, mutta jakolaskussa etsitään, montako kertaa jakaja mahtuu lukuun.']],
      hint: 'Jakolasku on kertolasku takaperin. Etsi luvun ' + b + ' kertotaulusta luku ' + fmt(a) + '.' + tableRow(b, a),
      explain: 'Jakolasku on kertolasku takaperin. Mieti, millä luvulla pitää kertoa ' + b + ', jotta saat ' + a + '. Käy luvun ' + b + ' kertotaulua läpi, kunnes löydät luvun ' + a + '.',
      helper: b
    };
  }
  function genPerus(d, idx) {
    var type = pick([['fact', 'fact', 'bowls'], ['fact', 'missing', 'code', 'bowls'], ['code', 'missing', 'fact2', 'missing']][d]);
    if (idx === 0) type = d === 2 ? 'code' : 'fact';
    if (type === 'fact') {
      var b = d === 0 ? R(2, 5) : R(6, 9), q = R(3, d === 0 ? 9 : 10);
      return { steps: [factStep(b * q, b)] };
    }
    if (type === 'bowls') {
      var k = R(3, 6), qq = R(3, 6), tot = k * qq;
      var st = factStep(tot, k, tot + ' herkkua jaetaan tasan ' + k + ' pennun kulhoihin. Montako herkkua tulee jokaiseen kulhoon?');
      st.big = null; st.html = bowlsSvg(tot, k, false) + '<p class="expr">' + tot + DIV + k + ' = ?</p>';
      st.hint = 'Laita kuhunkin kulhoon vuorotellen yksi herkku, kunnes herkut loppuvat. Voit myös etsiä luvun ' + k + ' kertotaulusta luvun ' + tot + '.' + bowlsSvg(tot, k, true);
      st.explain = 'Jaetaan herkut tasan, eli jokaiseen kulhoon tulee yhtä monta. Mieti: ' + k + ' kertaa mikä luku on ' + tot + '? Se luku on yhden kulhon herkkujen määrä.';
      return { steps: [st] };
    }
    if (type === 'missing') {
      var b2 = R(3, 9), q2 = R(4, 10), a2 = b2 * q2, form = R(0, 1);
      if (form === 0) return { steps: [{
        kind: 'num', lead: 'Mikä luku puuttuu?', big: '<span class="blank">?</span>' + DIV + b2 + EQ + q2, answer: a2, answerText: fmt(a2),
        traps: [[b2 + q2, 'kertotaulu', 'Laskit yhteen. Puuttuva jaettava saadaan kertomalla: ' + b2 + ' · ' + q2 + '.'], [q2, 'kertotaulu', 'Mieti, mikä luku jaettuna luvulla ' + b2 + ' antaa ' + q2 + '.']],
        hint: 'Jaettava saadaan kertolaskulla: jakaja kertaa osamäärä. Laske siis ' + b2 + ' · ' + q2 + '.',
        explain: 'Puuttuva luku on jaettava, eli se luku, joka jaetaan. Jos ' + b2 + ' pennulle jaetaan jokaiselle ' + q2 + ' herkkua, kaikki herkut saadaan kertolaskulla ' + b2 + ' kertaa ' + q2 + '.', helper: b2 }] };
      return { steps: [{
        kind: 'num', lead: 'Mikä luku puuttuu?', big: a2 + DIV + '<span class="blank">?</span>' + EQ + q2, answer: b2, answerText: String(b2),
        traps: [[a2 - q2, 'kertotaulu', 'Vähensit. Etsi luku, jolla kerrottuna ' + q2 + ' antaa ' + a2 + '.']],
        hint: 'Etsi luku, jolla ' + q2 + ' pitää kertoa, jotta saadaan ' + a2 + '.',
        explain: 'Nyt puuttuu jakaja. Mieti kertolaskuna: ' + q2 + ' kertaa mikä luku on ' + a2 + '? Kokeile kertotaulun lukuja yksi kerrallaan.', helper: q2 <= 10 ? q2 : null }] };
    }
    if (type === 'fact2') {
      /* päässälasku, jossa kymmenet ja ykköset jakautuvat */
      var dv = pick([2, 3, 4]), t, o, n;
      do { t = dv * R(1, Math.floor(9 / dv)); o = dv * R(0, Math.floor(9 / dv)); n = t * 10 + o; } while (n / dv < 11);
      var s = factStep(n, dv, 'Laske päässä.');
      s.traps = [[t / dv + o / dv, 'lukuyks', 'Laskit osat yhteen väärin: kymmenet ' + (t / dv) + ' ja ykköset ' + (o / dv) + ' ovat yhdessä ' + (n / dv) + '.']];
      s.hint = 'Jaa kymmenet ja ykköset erikseen: ' + (t * 10) + ' : ' + dv + ' = ' + (t * 10 / dv) + ' ja ' + o + ' : ' + dv + ' = ' + (o / dv) + '.';
      s.explain = 'Pilko luku kymmeniin ja ykkösiin: ' + n + ' on ' + (t * 10) + ' ja ' + o + '. Jaa kumpikin osa luvulla ' + dv + ' ja laske tulokset yhteen.';
      return { steps: [s] };
    }
    /* koodi */
    var word = pick(CODE_WORDS), parts = [], used = {};
    word.split('').forEach(function (ch, i) {
      var nn = LETTER[ch], bb = R(2, 9);
      if (i > 0) parts.push('<br>');
      parts.push('<span class="code-letter">' + (i + 1) + '.</span> ' + (nn * bb) + DIV + bb + EQ);
      parts.push(F(nn, { traps: [[nn + 1, 'kertotaulu', ''], [nn - 1, 'kertotaulu', '']] }));
    });
    var others = shuffle(CODE_WORDS.filter(function (w) { return w !== word; })).slice(0, 3);
    var key = '<div class="codekey">' + Object.keys(CODE).map(function (k) { return '<span><b>' + k + '</b>' + CODE[k] + '</span>'; }).join('') + '</div>';
    return { exam: 0, steps: [
      { kind: 'fill', lead: 'Herkkukoodi! Laske jakolaskut. Jokainen vastaus on yksi kirjain.', parts: parts, answerText: word.split('').map(function (c) { return LETTER[c]; }).join(', '),
        hint: 'Laske jokainen jakolasku kertotaulun avulla: mikä luku kertaa jakaja on jaettava?',
        explain: 'Laske jakolaskut yksi kerrallaan. Jokaisen jakolaskun vastaus on luku yhdestä kymmeneen. Muista, että jakolaskun voi tarkistaa kertolaskulla.' },
      { kind: 'mc', layout: 'grid', lead: 'Muuta luvut kirjaimiksi. Mikä sana koodissa on?', html: '<p class="expr">' + word.split('').map(function (c) { return LETTER[c]; }).join(' · ').replace(/ · /g, ', ') + '</p>' + key,
        options: mc(word, others), answerText: word,
        hint: 'Etsi jokaisen luvun kirjain taulukosta. Esimerkiksi ' + LETTER[word[0]] + ' on ' + word[0] + '.',
        explain: 'Katso taulukosta, mikä kirjain on jokaisen luvun alla. Kirjoita kirjaimet samassa järjestyksessä kuin jakolaskut, niin sana paljastuu.' }
    ] };
  }

  /* ===================================================================== */
  /* 2. Jakaminen 10:llä, 100:lla ja 1000:lla                               */
  /* ===================================================================== */
  function kymppiTraps(n, p, q) {
    var t = [];
    [10, 100, 1000].forEach(function (pp) { if (pp !== p && n % pp === 0) t.push([n / pp, 'nolla', 'Poistit väärän määrän nollia. Kun jaat luvulla ' + fmt(p) + ', lopusta lähtee ' + ['', 'yksi nolla', 'kaksi nollaa', 'kolme nollaa'][String(p).length - 1] + '.']); });
    var noInner = Number(String(q).replace(/0/g, ''));
    if (noInner !== q && noInner > 0) t.push([noInner, 'nolla', 'Keskellä oleva nolla jää paikalleen. Vain lopusta lähtee nollia.']);
    t.push([n * p, 'nolla', 'Kerroit, vaikka piti jakaa.']);
    return t;
  }
  function genKymppi(d) {
    var p, n, q, type = d === 2 ? pick(['plain', 'missingDividend', 'missingDivisor', 'notes']) : 'plain';
    if (type === 'plain') {
      if (d === 0) { p = pick([10, 100, 1000]); q = p === 1000 ? R(2, 9) : p === 100 ? R(3, 89) : R(12, 680); }
      else { p = pick([10, 100, 10]); q = p === 10 ? pick([R(101, 899), Number(R(1, 9) + '0' + R(1, 9))]) : pick([R(11, 99), Number(R(1, 9) + '0')]); }
      n = q * p;
      if (n > 9999) { p = 10; q = R(110, 899); n = q * p; }
      return { steps: [{
        kind: 'num', lead: 'Laske päässä.', big: fmt(n) + DIV + fmt(p), answer: q, answerText: fmt(q), traps: kymppiTraps(n, p, q),
        hint: 'Kun luku jaetaan luvulla ' + fmt(p) + ', lopusta poistuu ' + ['', 'yksi nolla', 'kaksi nollaa', 'kolme nollaa'][String(p).length - 1] + '. Keskellä olevat nollat jäävät.',
        explain: 'Kun jaat luvulla ' + fmt(p) + ', jokainen numero siirtyy pienempään lukuyksikköön. Käytännössä luvun lopusta otetaan pois ' + ['', 'yksi nolla', 'kaksi nollaa', 'kolme nollaa'][String(p).length - 1] + '. Keskellä olevat nollat pysyvät paikallaan.' }] };
    }
    if (type === 'missingDividend') {
      p = pick([10, 100]); q = R(14, 98); n = q * p;
      return { steps: [{ kind: 'num', lead: 'Mikä luku puuttuu?', big: '<span class="blank">?</span>' + DIV + fmt(p) + EQ + q, answer: n, answerText: fmt(n),
        traps: [[q * (p === 10 ? 100 : 10), 'nolla', 'Nollia tuli väärä määrä.']],
        hint: 'Puuttuva luku saadaan kertomalla: ' + q + ' · ' + fmt(p) + '. Lisää luvun ' + q + ' perään ' + (p === 10 ? 'yksi nolla' : 'kaksi nollaa') + '.',
        explain: 'Jaettava saadaan kertomalla osamäärä ja jakaja. Kun kerrot luvulla ' + fmt(p) + ', luvun perään tulee ' + (p === 10 ? 'yksi nolla' : 'kaksi nollaa') + '.' }] };
    }
    if (type === 'missingDivisor') {
      p = pick([10, 100, 1000]); q = p === 1000 ? R(2, 9) : p === 100 ? R(12, 79) : R(120, 799); n = q * p;
      return { steps: [{ kind: 'mc', layout: 'grid', lead: 'Millä luvulla jaettiin?', big: fmt(n) + DIV + '<span class="blank">?</span>' + EQ + fmt(q),
        options: mc(fmt(p), [10, 100, 1000, 1].filter(function (x) { return x !== p; }).map(function (x) { return { html: fmt(x), tag: 'nolla' }; })), answerText: fmt(p),
        hint: 'Laske, montako nollaa luvun lopusta katosi.',
        explain: 'Vertaa lukuja ' + fmt(n) + ' ja ' + fmt(q) + '. Laske, montako nollaa lopusta on kadonnut. Yksi nolla tarkoittaa jakoa kymmenellä, kaksi sadalla ja kolme tuhannella.' }] };
    }
    var nt = pick([10, 100]), cnt = nt === 10 ? R(23, 89) : R(12, 48), money = cnt * nt;
    return { steps: [{ kind: 'num', lead: 'Merkitse lauseke mielessäsi ja laske.', html: '<p class="story">Lauralla on ' + eur(money) + ' ' + nt + ' euron seteleinä. Kuinka monta ' + nt + ' euron seteliä Lauralla on?</p>', answer: cnt, unit: 'seteliä', answerText: fmt(cnt) + ' seteliä',
      traps: kymppiTraps(money, nt, cnt).concat([[money, 'lauseke', 'Kysytään setelien määrää, ei rahasummaa.']]),
      hint: 'Laske ' + fmt(money) + ' : ' + nt + '.',
      explain: 'Jokainen seteli on ' + nt + ' euroa. Setelien määrä saadaan jakamalla koko rahasumma ' + nt + ':llä. Kun jaat luvulla ' + nt + ', poista lopusta ' + (nt === 10 ? 'yksi nolla' : 'kaksi nollaa') + '.' }] };
  }

  /* ===================================================================== */
  /* 3. Pyöreiden lukujen jakaminen                                         */
  /* ===================================================================== */
  function genPyorea(d) {
    var dv, q, n;
    if (d === 0) { dv = R(2, 9); q = R(2, 9); n = dv * q * 10; }
    else if (d === 1) { dv = R(3, 9); q = R(3, 9); n = dv * q * 10; }
    else { dv = R(3, 9); q = R(2, 9); n = dv * q * 100; }
    var unit = d === 2 ? 100 : 10, unitName = d === 2 ? 'satasta' : 'kymppiä', small = n / unit, res = n / dv;
    var traps = [[res / 10, 'nolla', 'Unohdit nollan. Muista, että jaoit ' + (d === 2 ? 'satasia' : 'kymppejä') + '.'], [res * 10, 'nolla', 'Nollia tuli liikaa.']];
    if (d === 2) traps.push([res / 100, 'nolla', 'Unohdit nollat. Jaoit satasia, joten vastauksen loppuun tulee kaksi nollaa.']);
    if (d === 1) return { exam: 1, steps: [{
      kind: 'fill', lead: 'Ajattele kymppeinä.', parts: [fmt(n) + DIV + dv + ' = ' + small + ' kymppiä' + DIV + dv + ' = ', F(q, { traps: [[q + 1, 'kertotaulu', ''], [q - 1, 'kertotaulu', '']] }), ' kymppiä = ', F(res, { traps: traps })],
      answerText: fmt(n) + ' : ' + dv + ' = ' + fmt(res), hint: 'Laske ensin ' + small + ' : ' + dv + ' kertotaulusta. Vastaus on kymppejä, joten lisää loppuun nolla.',
      explain: 'Luku ' + fmt(n) + ' on ' + small + ' kymppiä. Jaa ' + small + ' kymppiä luvulla ' + dv + ' kertotaulun avulla. Muista lopuksi muuttaa kympit takaisin luvuksi lisäämällä nolla.', helper: dv },
      { kind: 'num', lead: 'Laske päässä.', big: fmt(n) + DIV + dv, answer: res, answerText: fmt(res), traps: traps, hint: 'Ajattele kymppeinä: ' + small + ' kymppiä : ' + dv + '.', explain: 'Ajattele kymppeinä, kuten edellisessä vaiheessa. Laske ensin ilman nollaa ja lisää nolla lopuksi.' }] };
    return { steps: [{
      kind: 'num', lead: 'Laske päässä.', big: fmt(n) + DIV + dv, answer: res, answerText: fmt(res), traps: traps,
      hint: 'Ajattele ' + (d === 2 ? 'satasina' : 'kymppeinä') + ': ' + fmt(n) + ' on ' + small + ' ' + unitName + '. Laske ' + small + ' : ' + dv + ' ja lisää ' + (d === 2 ? 'kaksi nollaa' : 'nolla') + '.',
      explain: 'Ajattele ' + (d === 2 ? 'satasina' : 'kymppeinä') + ': ' + fmt(n) + ' on ' + small + ' ' + unitName + '. Laske ensin ' + small + ' jaettuna ' + dv + ' kertotaulun avulla. Lisää lopuksi ' + (d === 2 ? 'kaksi nollaa' : 'nolla') + ' takaisin.', helper: dv }] };
  }

  /* ===================================================================== */
  /* 4. Lukuyksiköittäin jakaminen                                          */
  /* ===================================================================== */
  function lukuyksNumber(len, dv, wantZero) {
    var n, ds, tries = 0;
    do {
      ds = [];
      for (var i = 0; i < len; i++) {
        var opts = []; for (var m = 0; m * dv <= 9; m++) opts.push(m * dv);
        if (i === 0) opts = opts.filter(function (x) { return x > 0; });
        ds.push(pick(opts));
      }
      n = Number(ds.join(''));
      tries++;
    } while ((wantZero ? ds.slice(1).indexOf(0) < 0 : false) || (len >= 3 && ds.filter(function (x) { return x > 0; }).length < 2) || n / dv < 10 && tries < 200);
    return n;
  }
  function lukuyksTraps(n, dv, q) {
    var ds = digits(n), qs = ds.map(function (x) { return x / dv; });
    var concatNoZero = Number(qs.filter(function (x, i) { return !(x === 0 && i > 0); }).join(''));
    var t = [];
    if (concatNoZero !== q) t.push([concatNoZero, 'nolla', 'Nolla unohtui. Jos lukuyksikkö on 0, sen paikalle tulee vastaukseenkin 0.']);
    t.push([sum(qs), 'lukuyks', 'Laskit osamäärät yhteen ykkösinä. Muista, että ' + (ds[0] * Math.pow(10, ds.length - 1)) + ' : ' + dv + ' on ' + fmt(qs[0] * Math.pow(10, ds.length - 1)) + '.']);
    t.push([q * 10, 'nolla', 'Vastaukseen tuli liikaa numeroita – tarkista paikka-arvot.']);
    if (q >= 100) t.push([Math.floor(q / 10), 'nolla', 'Yksi lukuyksikkö puuttuu vastauksesta.']);
    return t;
  }
  function genLukuyks(d, idx) {
    var dv = d === 0 ? pick([2, 3, 4]) : pick([2, 3, 4, 2, 3]), len = d === 0 ? R(2, 3) : d === 1 ? 3 : 4;
    if (d === 2 && Math.random() < 0.5) dv = pick([2, 3, 4, 6, 8]);
    var type = d === 2 ? pick(['fill', 'num', 'which']) : 'fill';
    if (d === 2 && idx === 7) type = 'which';
    var n = lukuyksNumber(len, dv, d >= 1 && Math.random() < 0.6), q = n / dv;
    var ds = digits(n), parts = [];
    var places = ds.map(function (x, i) { return x * Math.pow(10, ds.length - 1 - i); }).filter(function (x) { return x > 0; });
    if (type === 'which') {
      var good = n, bads = [];
      for (var t = 0; t < 30 && bads.length < 3; t++) {
        var b = good + pick([1, 2, 10, 20, 100, 1]) * pick([1, -1]) * (pick([1, 1, 2]));
        if (b > 0 && digits(b).some(function (x) { return x % dv !== 0; }) && bads.indexOf(b) < 0) bads.push(b);
      }
      return { steps: [{ kind: 'mc', layout: 'grid', lead: 'Minkä jakolaskun voi laskea lukuyksiköittäin?', options: mc(frac(good, dv), bads.map(function (x) { return { html: frac(x, dv), tag: 'lukuyks' }; })), answerText: frac(good, dv),
        hint: 'Lukuyksiköittäin voi jakaa, kun jokaisen numeron voi jakaa tasan luvulla ' + dv + '.',
        explain: 'Lukuyksiköittäin jakaminen toimii vain, jos jokainen numero jakautuu tasan jakajalla. Tarkista jokaisesta vaihtoehdosta numerot yksi kerrallaan: tuhannet, sadat, kymmenet ja ykköset.' }, {
        kind: 'num', lead: 'Laske lukuyksiköittäin.', big: frac(good, dv) + ' =', answer: q, answerText: fmt(q), traps: lukuyksTraps(good, dv, q),
        hint: 'Jaa jokainen lukuyksikkö erikseen.' + placeCols(good, dv),
        explain: 'Jaa ensin tuhannet, sitten sadat, kymmenet ja ykköset. Jos jossain kohdassa on nolla, vastaukseenkin tulee siihen kohtaan nolla.' }] };
    }
    var tr = lukuyksTraps(n, dv, q);
    if (type === 'num') return { steps: [{ kind: 'num', lead: 'Laske lukuyksiköittäin päässä.', big: frac(n, dv) + ' =', answer: q, answerText: fmt(q), traps: tr,
      hint: 'Jaa jokainen lukuyksikkö erikseen ja pidä nollat paikallaan.' + placeCols(n, dv),
      explain: 'Jaa luku osissa: ' + places.map(fmt).join(', ') + '. Jaa jokainen osa luvulla ' + dv + ' ja laske tulokset yhteen. Pidä huoli, että nollat jäävät oikeille paikoille.' }] };
    parts.push(frac(n, dv) + ' = ');
    places.forEach(function (p, i) { if (i) parts.push(PLUS); parts.push(frac(p, dv)); });
    parts.push('<br>= ');
    places.forEach(function (p, i) { if (i) parts.push(PLUS); parts.push(F(p / dv, { traps: p < 10 ? [] : [[digits(p)[0] / dv, 'nolla', 'Muista paikka-arvo: ' + fmt(p) + ' : ' + dv + ' = ' + fmt(p / dv) + '.']] })); });
    parts.push('<br>= ');
    parts.push(F(q, { traps: tr }));
    return { exam: 0, steps: [{ kind: 'fill', lead: 'Laske lukuyksiköittäin. Merkitse välivaiheet.', parts: parts, chain: true, answerText: fmt(q),
      hint: 'Jaa jokainen osa erikseen. Esimerkiksi ' + fmt(places[0]) + ' : ' + dv + ' = ' + fmt(places[0] / dv) + '.' + placeCols(n, dv),
      explain: 'Luku on jo pilkottu lukuyksiköihin. Jaa jokainen osa luvulla ' + dv + ', esimerkiksi ' + fmt(places[0]) + ' jaettuna ' + dv + ' on ' + fmt(places[0] / dv) + '. Laske lopuksi osat yhteen.', helper: dv }] };
  }

  /* ===================================================================== */
  /* 5–6. Osittain jakaminen                                                 */
  /* ===================================================================== */
  function notLukuyks(n, dv) { return digits(n).some(function (x) { return x % dv !== 0; }); }
  function osittainNumber(min, max, dvs, minQ) {
    var dv, n, tries = 0;
    do { dv = pick(dvs); n = dv * R(Math.ceil(Math.max(min, dv * (minQ || 11)) / dv), Math.floor(max / dv)); tries++; } while ((!notLukuyks(n, dv) || n % (10 * dv) === 0) && tries < 500);
    return { n: n, dv: dv };
  }
  function firstPart(n, dv) { return Math.floor(n / (10 * dv)) * 10 * dv; }
  function osittainSteps(n, dv, withPick) {
    var f = firstPart(n, dv), r = n - f, q = n / dv, q1 = f / dv, q2 = r / dv, steps = [];
    if (withPick) {
      var ten = 10 * dv, cands = uniq([f - ten, f, f + ten, f + 2 * ten]).filter(function (x) { return x > 0; });
      var opts = cands.slice(0, 3);
      if (opts.indexOf(f) < 0) opts = [f].concat(opts);
      steps.push({ kind: 'mc', layout: 'strip', lead: 'Valitse ensimmäinen osa. Sen pitää olla luvun ' + dv + ' kymmenkertainen ja mahtua lukuun ' + fmt(n) + '.',
        big: frac(n, dv),
        options: opts.map(function (x) {
          return x === f ? { html: fmt(x), ok: true } : x > n ? { html: fmt(x), ok: false, tag: 'osat', msg: fmt(x) + ' on suurempi kuin ' + fmt(n) + ', joten se ei mahdu.' } : { html: fmt(x), ok: false, tag: 'osat', msg: fmt(x) + ' mahtuu, mutta isompikin mahtuu. Valitse suurin mahdollinen, niin toinen osa jää pieneksi.' };
        }).sort(function (a, b) { return Number(a.html.replace(/\D/g, '')) - Number(b.html.replace(/\D/g, '')); }),
        answerText: fmt(f), helper: dv,
        hint: 'Katso kertotaulun alariviä (kymmenkertaiset): etsi suurin luku, joka on pienempi tai yhtä suuri kuin ' + fmt(n) + '.' + tableRow(dv, f),
        explain: 'Etsi luvun ' + dv + ' kymmenkertaisista luvuista suurin, joka on enintään ' + fmt(n) + '. Kymmenkertaiset luvut ovat ' + [1, 2, 3, 4].map(function (i) { return fmt(10 * dv * i); }).join(', ') + ' ja niin edelleen. Tällaisen luvun voi jakaa luvulla ' + dv + ' helposti.' });
    }
    var parts = [frac(n, dv) + ' = ', frac(f, dv), PLUS, F(r, { den: dv, traps: [[r + 10, 'huolimaton', 'Vähennyslasku meni ohi: ' + fmt(n) + ' − ' + fmt(f) + ' = ' + fmt(r) + '.'], [r - 10, 'huolimaton', 'Vähennyslasku meni ohi: ' + fmt(n) + ' − ' + fmt(f) + ' = ' + fmt(r) + '.'], [n, 'osat', 'Toinen osa on se, mitä jää yli, kun ensimmäinen osa vähennetään.']] }),
      '<br>= ', F(q1, { traps: [[q1 + 10, 'kertotaulu', fmt(f) + ' : ' + dv + ' on ' + fmt(q1) + '. Tarkista: ' + dv + ' · ' + fmt(q1 + 10) + ' = ' + fmt(dv * (q1 + 10)) + '.'], [q1 - 10, 'kertotaulu', fmt(f) + ' : ' + dv + ' on ' + fmt(q1) + '.'], [f / 10 / dv, 'nolla', 'Muista nolla: ' + fmt(f) + ' : ' + dv + ' = ' + fmt(q1) + '.']] }),
      PLUS, F(q2, { traps: [[q2 + 1, 'kertotaulu', fmt(r) + ' : ' + dv + ' = ' + q2 + '. Tarkista: ' + dv + ' · ' + q2 + ' = ' + r + '.'], [q2 - 1, 'kertotaulu', fmt(r) + ' : ' + dv + ' = ' + q2 + '. Tarkista: ' + dv + ' · ' + q2 + ' = ' + r + '.'], [r, 'osat', 'Toinen osa jäi jakamatta! Myös ' + r + ' pitää jakaa luvulla ' + dv + '.'], [q, 'osat', 'Tähän tulee vain toisen osan osamäärä, ei koko vastaus.']] }),
      ' = ', F(q, { traps: [[q1 + r, 'osat', 'Toinen osa jäi jakamatta: myös ' + r + ' pitää jakaa luvulla ' + dv + '.'], [q + 1, 'huolimaton', 'Melkein! Tarkista osien yhteenlasku.'], [q - 1, 'huolimaton', 'Melkein! Tarkista osien yhteenlasku.'], [q1 * q2, 'osat', 'Osamäärät lasketaan yhteen, ei kerrota.']] })];
    steps.push({ kind: 'fill', lead: 'Laske osittain jakamalla.', parts: parts, chain: true, answerText: frac(n, dv) + ' = ' + frac(f, dv) + PLUS + frac(r, dv) + ' = ' + fmt(q1) + PLUS + q2 + ' = ' + fmt(q), helper: dv,
      hint: 'Toinen osa saadaan vähentämällä: ' + fmt(n) + ' − ' + fmt(f) + '. Jaa sitten kumpikin osa luvulla ' + dv + ' ja laske osamäärät yhteen.' + splitBar(n, f, dv, false),
      explain: 'Toinen osa saadaan vähentämällä ensimmäinen osa jaettavasta: ' + fmt(n) + ' miinus ' + fmt(f) + '. Jaa sitten kumpikin osa luvulla ' + dv + '. Lopuksi laske osamäärät yhteen.' });
    return steps;
  }
  function osittainExam(n, dv) {
    var f = firstPart(n, dv), r = n - f, q = n / dv;
    return { kind: 'fill', lead: 'Laske. Voit merkitä välivaiheet (ne eivät ole pakollisia).', parts: [frac(n, dv) + ' = ', F(f, { den: dv, optional: true }), PLUS, F(r, { den: dv, optional: true }), '<br>= ', F(f / dv, { optional: true }), PLUS, F(r / dv, { optional: true }), ' = ', F(q, { traps: [[f / dv + r, 'osat', 'Toinen osa jäi jakamatta.'], [q + 1, 'huolimaton', ''], [q - 1, 'huolimaton', '']] })],
      answerText: fmt(q), helper: dv, hint: '', explain: 'Pilko jaettava kahteen osaan: suurin jakajan kymmenkertainen luku ja loput. Jaa molemmat osat ja laske osamäärät yhteen.' };
  }
  function genOsittain(d, idx) {
    var o = d === 0 ? osittainNumber(30, 99, [2, 3], 11) : d === 1 ? osittainNumber(40, 99, [3, 4, 5], 11) : osittainNumber(56, 99, [4, 6, 7, 8], 11);
    var steps = osittainSteps(o.n, o.dv, d > 0 || idx === 0);
    return { steps: steps, examStep: osittainExam(o.n, o.dv) };
  }
  function genOsittain3(d, idx) {
    var o = d === 0 ? osittainNumber(100, 300, [2, 3], 30) : d === 1 ? osittainNumber(120, 480, [3, 4, 5], 30) : osittainNumber(200, 999, [4, 6, 7, 8, 5], 30);
    var steps = osittainSteps(o.n, o.dv, true);
    return { steps: steps, examStep: osittainExam(o.n, o.dv) };
  }

  /* ===================================================================== */
  /* 7. Jakojäännös ja tarkistus                                            */
  /* ===================================================================== */
  function remFill(n, dv, lead) {
    var q = Math.floor(n / dv), r = n % dv;
    return { kind: 'fill', lead: lead || 'Laske. Muista jakojäännös.', parts: [fmt(n) + DIV + dv + ' = ', F(q, { traps: [[q - 1, 'jaannos', 'Jakaja mahtuu vielä kerran lisää – jäännös on liian suuri.'], [q + 1, 'jaannos', dv + ' · ' + (q + 1) + ' = ' + (dv * (q + 1)) + ', mikä on enemmän kuin ' + n + '.']] }), ', jää ', F(r, { traps: [[r + dv, 'jaannos', 'Jäännös ei saa olla yhtä suuri tai suurempi kuin jakaja ' + dv + '.'], [r === 0 ? -1 : 0, 'jaannos', 'Jako ei mene tasan – jotain jää yli.'], [dv - r, 'jaannos', 'Jäännös on se, mitä jää yli: ' + n + ' − ' + (dv * q) + ' = ' + r + '.']] })],
      answerText: fmt(n) + ' : ' + dv + ' = ' + fmt(q) + ', jää ' + r, helper: dv,
      hint: n >= 10 * dv ? 'Jaa osittain: ' + fmt(n) + ' = ' + fmt(firstPart(n, dv)) + ' + ' + (n - firstPart(n, dv)) + '. Ensimmäinen osa jakautuu tasan. Jaa toinen osa, ja mitä siitä jää yli, on jakojäännös.' + splitBar(n, firstPart(n, dv), dv, false)
        : 'Etsi luvun ' + dv + ' kertotaulusta suurin luku, joka on enintään ' + fmt(n) + '. Ylijäävä osa on jakojäännös, ja se on aina pienempi kuin ' + dv + '.' + (n <= 40 ? bowlsSvg(n, dv, true) : ''),
      explain: n >= 10 * dv ? 'Pilko jaettava osiin: ' + fmt(firstPart(n, dv)) + ' ja ' + (n - firstPart(n, dv)) + '. Jaa molemmat osat luvulla ' + dv + ' ja laske osamäärät yhteen. Jos toisesta osasta jää jotain yli, se on jakojäännös.'
        : 'Etsi luvun ' + dv + ' kertotaulusta suurin luku, joka ei ole suurempi kuin ' + fmt(n) + '. Se kertoo osamäärän. Se mitä jää yli on jakojäännös, ja sen pitää olla pienempi kuin ' + dv + '.' };
  }
  function checkFill(n, dv) {
    var q = Math.floor(n / dv), r = n % dv;
    return { kind: 'fill', lead: 'Tarkista kertolaskulla: jakaja kertaa osamäärä plus jäännös on jaettava.', parts: ['Tarkistus: ' + dv + MUL, F(q), PLUS, F(r), EQ, F(n, { traps: [[dv * q, 'jaannos', 'Muista lisätä jäännös.']] })], chain: true,
      answerText: dv + ' · ' + q + ' + ' + r + ' = ' + n,
      hint: 'Kirjoita osamäärä ja jäännös, laske ' + dv + ' · ' + q + ' ja lisää ' + r + '. Tuloksen pitää olla ' + n + '.',
      explain: 'Tarkistuksessa jakaja kerrotaan osamäärällä ja jäännös lisätään. Jos tulos on sama kuin jaettava, jakolasku on oikein. Näin huolimattomuusvirheet jäävät kiinni.' };
  }
  function genJaannos(d, idx) {
    var n, dv;
    if (d === 0) { dv = R(2, 8); do { n = R(dv + 1, dv * 9); } while (n % dv === 0); return { exam: 0, steps: [remFill(n, dv), checkFill(n, dv)] }; }
    if (d === 1) {
      dv = R(4, 9); do { n = R(dv * 3, dv * 10 + dv - 1); } while (n % dv === 0 || n > 99);
      if (Math.random() < 0.4) {
        var q = Math.floor(n / dv), r = n % dv;
        var good = dv + MUL + q + PLUS + r + ' = ' + n;
        return { exam: 0, steps: [remFill(n, dv), { kind: 'mc', layout: 'list', lead: 'Mikä on oikea tarkistus jakolaskulle ' + n + ' : ' + dv + ' = ' + q + ', jää ' + r + '?',
          options: mc(good, [{ html: dv + MUL + r + PLUS + q + ' = ' + (dv * r + q), tag: 'jaannos' }, { html: dv + MUL + q + MINUS + r + ' = ' + (dv * q - r), tag: 'jaannos' }, { html: n + MUL + dv + PLUS + r, tag: 'jaannos' }]), answerText: good,
          hint: 'Tarkistuksessa jakaja kerrotaan osamäärällä ja jäännös lisätään.',
          explain: 'Tarkistus on jakolasku takaperin. Kerro jakaja osamäärällä ja lisää jäännös. Oikeassa tarkistuksessa tulos on sama kuin jaettava.' }] };
      }
      return { exam: 0, steps: [remFill(n, dv), checkFill(n, dv)] };
    }
    /* d2: meneekö tasan, kolminumeroinen */
    dv = pick([6, 7, 8, 4, 6, 7]);
    var even = Math.random() < 0.45, q3 = R(31, Math.floor(899 / dv)), r3 = even ? 0 : R(1, dv - 1);
    n = dv * q3 + r3;
    var f = firstPart(n - r3, dv);
    return { exam: 1, steps: [
      { kind: 'mc', layout: 'yesno', lead: 'Ratkaise osittain jakamalla: meneekö jako tasan?', big: frac(n, dv), options: [{ html: 'Menee tasan', ok: even, tag: 'jaannos' }, { html: 'Jää jakojäännös', ok: !even, tag: 'jaannos' }], answerText: even ? 'Menee tasan' : 'Jää jakojäännös ' + r3, helper: dv,
        hint: 'Pilko: ' + fmt(n) + ' = ' + fmt(f) + ' + ' + (n - f) + '. Osan ' + fmt(f) + ' voi jakaa tasan. Meneekö ' + (n - f) + ' : ' + dv + ' tasan?',
        explain: 'Pilko jaettava osiin: ' + fmt(f) + ' ja ' + (n - f) + '. Ensimmäinen osa jakautuu varmasti tasan. Katso siis, meneekö toinen osa ' + (n - f) + ' tasan luvulla ' + dv + '.' },
      remFill(n, dv, 'Laske osamäärä ja jäännös. Jos jako menee tasan, jäännös on 0.')
    ] };
  }

  /* ===================================================================== */
  /* 8. Puuttuva luku ja "Mikä luku?"                                        */
  /* ===================================================================== */
  function riddle() {
    for (var t = 0; t < 400; t++) {
      var L = pick([50, 60, 80, 100]), p = pick([3, 4, 5, 6, 7, 9]), s = pick([1, -1]), m = pick([2, 3, 4, 5, 8, 10]);
      if (p === m) continue;
      var sols = [];
      for (var x = 1; x < L; x++) if (x % p === 0 && (x + s) % m === 0 && x + s > 0) sols.push(x);
      if (sols.length === 1) {
        return { clues: ['Luku on pienempi kuin ' + L + '.', 'Luvun voi jakaa tasan luvulla ' + p + '.', (s > 0 ? 'Kun lukuun lisätään 1' : 'Kun luvusta vähennetään 1') + ', saadun luvun voi jakaa tasan luvulla ' + m + '.'], answer: sols[0], p: p, m: m, s: s };
      }
    }
    return { clues: ['Luku on pienempi kuin 100.', 'Luvun voi jakaa tasan luvulla 9.', 'Kun lukuun lisätään 1, saadun luvun voi jakaa tasan luvulla 8.'], answer: 63, p: 9, m: 8, s: 1 };
  }
  function genPuuttuva(d, idx) {
    var type = pick([['dividend', 'divisor', 'equal'], ['remDividend', 'remDivisor', 'equal'], ['riddle', 'remDivisor', 'remDividend', 'equal']][d]);
    if (type === 'dividend' || type === 'remDividend') {
      var dv = R(3, 9), q = R(5, 12), r = type === 'remDividend' ? R(1, dv - 1) : 0, n = dv * q + r;
      return { steps: [{ kind: 'num', lead: 'Päättele puuttuva luku.', big: '<span class="blank">?</span>' + DIV + dv + EQ + q + (r ? ', jää ' + r : ''), answer: n, answerText: String(n),
        traps: [[dv * q, 'jaannos', 'Muista lisätä jäännös ' + r + '.'], [dv + q + r, 'kertotaulu', 'Jaettava saadaan kertomalla, ei laskemalla yhteen.'], [dv * q - r, 'jaannos', 'Jäännös lisätään, ei vähennetä.']],
        hint: 'Jaettava = jakaja · osamäärä' + (r ? ' + jäännös' : '') + '. Laske ' + dv + ' · ' + q + (r ? ' + ' + r : '') + '.',
        explain: 'Puuttuva luku on jaettava. Sen saa kertomalla jakajan ja osamäärän' + (r ? ' ja lisäämällä jäännöksen' : '') + '. Laske siis ' + dv + ' kertaa ' + q + (r ? ' ja lisää ' + r : '') + '.' }] };
    }
    if (type === 'divisor' || type === 'remDivisor') {
      var dv2 = R(2, 9), q2 = R(4, 15), r2 = type === 'remDivisor' ? R(1, dv2 - 1) : 0, n2 = dv2 * q2 + r2;
      if (type === 'remDivisor' && dv2 === 2 && q2 < 6) q2 = 15, n2 = dv2 * q2 + r2;
      return { steps: [{ kind: 'num', lead: 'Päättele puuttuva luku.', big: n2 + DIV + '<span class="blank">?</span>' + EQ + q2 + (r2 ? ', jää ' + r2 : ''), answer: dv2, answerText: String(dv2),
        traps: [[n2 - q2, 'kertotaulu', 'Puuttuva luku on jakaja. Etsi luku, jolla ' + q2 + ' kerrottuna antaa ' + (n2 - r2) + '.']],
        hint: (r2 ? 'Vähennä ensin jäännös: ' + n2 + ' − ' + r2 + ' = ' + (n2 - r2) + '. ' : '') + 'Etsi luku, jolla ' + q2 + ' pitää kertoa, jotta saadaan ' + (n2 - r2) + '.',
        explain: (r2 ? 'Ota ensin jäännös pois: ' + n2 + ' miinus ' + r2 + ' on ' + (n2 - r2) + '. Mieti sitten' : 'Nyt puuttuu jakaja. Mieti') + ' kertolaskuna: ' + q2 + ' kertaa mikä luku on ' + (n2 - r2) + '? Se luku on puuttuva jakaja.' }] };
    }
    if (type === 'equal') {
      var a = pick([2, 3, 4, 6]), qq = R(2, 6), b = R(2, 9), c = a * qq, x = b * qq;
      if (b === a) b = a + 1, x = b * qq;
      return { steps: [{ kind: 'num', lead: 'Mikä luku?', html: '<p class="story">Tämä luku jaettuna luvulla ' + b + ' on yhtä suuri kuin ' + c + ' jaettuna luvulla ' + a + '.</p>', answer: x, answerText: String(x),
        traps: [[qq, 'paattely', 'Laskit vain ' + c + ' : ' + a + ' = ' + qq + '. Etsi vielä luku, joka jaettuna luvulla ' + b + ' antaa ' + qq + '.'], [c, 'paattely', 'Jakajat ovat eri, joten luku ei ole ' + c + '.']],
        hint: 'Laske ensin ' + c + ' : ' + a + ' = ' + qq + '. Etsi sitten luku, joka jaettuna luvulla ' + b + ' on ' + qq + ': ' + b + ' · ' + qq + '.',
        explain: 'Laske ensin helppo puoli: ' + c + ' jaettuna ' + a + '. Etsi sitten luku, joka jaettuna ' + b + ' antaa saman tuloksen. Sen saat kertolaskulla.' }] };
    }
    var rd = riddle();
    return { steps: [{ kind: 'num', lead: 'Mikä luku?', html: '<ul class="clues">' + rd.clues.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>', answer: rd.answer, answerText: String(rd.answer),
      hint: 'Kirjoita ensin luvun ' + rd.p + ' kertotaulun luvut ' + rd.p + ', ' + (2 * rd.p) + ', ' + (3 * rd.p) + ', … ja kokeile jokaiseen ' + (rd.s > 0 ? 'lisätä' : 'vähentää') + ' 1.',
      explain: 'Luettele ensin kaikki luvun ' + rd.p + ' kertotaulun luvut, jotka ovat tarpeeksi pieniä. ' + (rd.s > 0 ? 'Lisää' : 'Vähennä') + ' jokaisesta yksi ja tarkista, voiko tuloksen jakaa tasan luvulla ' + rd.m + '.' }] };
  }

  /* ===================================================================== */
  /* 9. Jaollisuus                                                           */
  /* ===================================================================== */
  var RULE = {
    2: 'Luvun voi jakaa 2:lla, jos se on parillinen eli viimeinen numero on 0, 2, 4, 6 tai 8.',
    3: 'Vinkki: luvun voi jakaa 3:lla, jos sen numeroiden summa jakautuu 3:lla.',
    4: 'Vinkki: katso kahta viimeistä numeroa. Jos ne muodostavat luvun, jonka voi jakaa 4:llä, koko luvun voi.',
    5: 'Luvun voi jakaa 5:llä, jos viimeinen numero on 0 tai 5.',
    6: 'Luvun voi jakaa 6:lla, jos sen voi jakaa sekä 2:lla että 3:lla.',
    8: 'Kokeile puolittaa kolme kertaa. Jos joka kerta tulee kokonaisluku, luvun voi jakaa 8:lla.',
    9: 'Vinkki: luvun voi jakaa 9:llä, jos sen numeroiden summa jakautuu 9:llä.',
    10: 'Luvun voi jakaa 10:llä, jos viimeinen numero on 0.',
    7: 'Jaa luku 7:llä tai etsi se luvun 7 kertotaulusta.'
  };
  var RULE_SHORT = {
    2: 'Luvun voi jakaa luvulla 2, jos se on parillinen.', 3: 'Luvun voi jakaa luvulla 3, jos sen numeroiden summa jakautuu luvulla 3.',
    4: 'Luvun voi jakaa luvulla 4, jos sen kahdesta viimeisestä numerosta muodostuvan luvun voi jakaa luvulla 4.', 5: 'Luvun voi jakaa luvulla 5, jos viimeinen numero on 0 tai 5.',
    6: 'Luvun voi jakaa luvulla 6, jos sen voi jakaa sekä luvulla 2 että luvulla 3.', 7: 'Luvulle 7 ei ole helppoa sääntöä, joten kokeile jakaa.',
    8: 'Luvun voi jakaa luvulla 8, jos sen voi puolittaa kolme kertaa tasan.', 9: 'Luvun voi jakaa luvulla 9, jos sen numeroiden summa jakautuu luvulla 9.', 10: 'Luvun voi jakaa luvulla 10, jos viimeinen numero on 0.'
  };
  function ruleText(k) { return (RULE[k] || '').replace(/(\d+):ll[aä]/g, 'luvulla $1'); }
  function genJaollisuus(d, idx) {
    var type = pick([['chips', 'route', 'chips'], ['chips', 'wallet', 'route', 'bella'], ['both', 'wallet', 'bella', 'both']][d]);
    if (type === 'chips' || type === 'both') {
      var ks = type === 'both' ? pick([[3, 4], [6, 9], [2, 9], [4, 6], [3, 5]]) : [pick(d === 0 ? [2, 5, 10, 3, 4] : [3, 4, 6, 8, 9])];
      var test = function (x) { return ks.every(function (k) { return x % k === 0; }); };
      var lcm = ks.length === 1 ? ks[0] : (function (a, b) { var g = function (x, y) { return y ? g(y, x % y) : x; }; return a * b / g(a, b); })(ks[0], ks[1]);
      var max = d === 0 ? 100 : d === 1 ? 200 : 400, good = [], bad = [];
      var nGood = R(2, 4);
      while (good.length < nGood) { var g = lcm * R(1, Math.floor(max / lcm)); if (good.indexOf(g) < 0) good.push(g); }
      while (bad.length < 8 - nGood) {
        var b = R(10, max);
        if (!test(b) && bad.indexOf(b) < 0) {
          if (ks.length === 2 && Math.random() < 0.6) { var b2 = ks[R(0, 1)] * R(2, Math.floor(max / Math.max(ks[0], ks[1]))); if (!test(b2) && bad.indexOf(b2) < 0) { bad.push(b2); continue; } }
          bad.push(b);
        }
      }
      var items = shuffle(good.concat(bad));
      var what = ks.length === 1 ? 'luvulla ' + ks[0] : 'sekä luvulla ' + ks[0] + ' että luvulla ' + ks[1];
      return { steps: [{ kind: 'multi', lead: 'Valitse kaikki luvut, jotka voi jakaa tasan ' + what + '.', items: items.map(function (x) { return { html: fmt(x), ok: test(x) }; }), answerText: good.sort(function (a, b) { return a - b; }).map(fmt).join(', '),
        hint: ks.map(ruleText).join(' ') + ' Voit myös jakaa ja katsoa, jääkö jäännöstä.',
        explain: 'Käy luvut läpi yksi kerrallaan ja kokeile jakaa ne. ' + RULE_SHORT[ks[0]] + (ks.length === 2 ? ' Valitse vain luvut, jotka jakautuvat molemmilla.' : ' Muista tarkistaa jokainen luku.') }] };
    }
    if (type === 'route') {
      var k = pick(d === 0 ? [3, 4, 5] : [3, 4, 6, 8, 9]), steps = [];
      for (var s = 0; s < 3; s++) {
        var ok = k * R(3, 12), wr = [];
        while (wr.length < 2) { var w = ok + pick([1, 2, -1, -2, 3, k + 1, -(k - 1)]); if (w > 0 && w % k !== 0 && wr.indexOf(w) < 0) wr.push(w); }
        steps.push({ kind: 'mc', layout: 'signs', lead: (s === 0 ? 'Kurre etsii herkkua! ' : 'Hyvä! Seuraava risteys. ') + 'Kulje polkua, jonka luvun voi jakaa tasan luvulla ' + k + '.',
          options: mc(fmt(ok), wr.map(function (x) { return { html: fmt(x), tag: 'jaollisuus', msg: fmt(x) + ' : ' + k + ' = ' + Math.floor(x / k) + ', jää ' + (x % k) + '.' }; }), 3), answerText: fmt(ok) + ' : ' + k + ' = ' + (ok / k),
          hint: ruleText(k) + ' Tai etsi luku luvun ' + k + ' kertotaulusta.' + tableRow(k),
          explain: 'Polulla saa kulkea vain lukuihin, jotka voi jakaa tasan luvulla ' + k + '. Kokeile jakaa jokainen luku ja katso, jääkö jäännöstä. ' + RULE_SHORT[k] });
      }
      return { steps: steps };
    }
    if (type === 'wallet') {
      var conds = pick([[[2, 4], 'kahdelle ja neljälle'], [[3, 9], 'kolmelle ja yhdeksälle'], [[5], 'viidelle'], [[2, 5, 10], 'kahdelle, viidelle ja kymmenelle'], [[3, 6], 'kolmelle ja kuudelle'], [[4, 8], 'neljälle ja kahdeksalle']]);
      var testW = function (x) { return conds[0].every(function (k2) { return x % k2 === 0; }); };
      var amounts = [], goodA;
      do { goodA = R(110, 480); } while (!testW(goodA));
      amounts.push(goodA);
      while (amounts.length < 4) { var am = R(110, 480); if (!testW(am) && amounts.indexOf(am) < 0) amounts.push(am); }
      return { steps: [{ kind: 'mc', layout: 'grid', lead: 'Kenen kukkaro? Pentu sanoo: ”Rahani voi jakaa ' + conds[1] + ' tasan.” Mikä kukkaro on pennun?', options: mc(eur(goodA), amounts.slice(1).map(function (x) { return { html: eur(x), tag: 'jaollisuus' }; })), answerText: eur(goodA),
        hint: conds[0].map(ruleText).join(' '),
        explain: 'Kokeile jokaista summaa: voiko sen jakaa tasan ' + conds[0].map(function (x) { return 'luvulla ' + x; }).join(' ja ') + '? Oikea kukkaro on se, jossa kaikki jaot menevät tasan.' }] };
    }
    /* bella */
    var pq = pick([[3, 4], [2, 3], [3, 6], [4, 6], [2, 5]]);
    var lc = (function (a, b) { var g = function (x, y) { return y ? g(y, x % y) : x; }; return a * b / g(a, b); })(pq[0], pq[1]);
    var x0 = lc * R(1, 3), others = [];
    while (others.length < 3) { var o2 = R(8, 60); if ((o2 % pq[0] !== 0 || o2 % pq[1] !== 0) && o2 !== 2 * x0 && others.indexOf(o2) < 0) others.push(o2); }
    var cats = shuffle([x0, 2 * x0].concat(others));
    return { steps: [{ kind: 'mc', layout: 'grid', lead: 'Päättele, mikä on Bellan luku.', html: '<ul class="clues"><li>Bellan luvun voi jakaa tasan luvulla ' + pq[0] + '.</li><li>Bellan luvun voi jakaa tasan luvulla ' + pq[1] + '.</li><li>Bellan luku on puolet toisesta jäljelle jääneestä luvusta.</li></ul>',
      options: cats.map(function (c) { return { html: String(c), ok: c === x0, tag: 'paattely', msg: c === 2 * x0 ? 'Tämä on se toinen jäljelle jäänyt luku. Bellan luku on sen puolikas.' : '' }; }), answerText: String(x0),
      hint: 'Rajaa ensin pois luvut, joita ei voi jakaa tasan molemmilla. Jäljelle jää kaksi lukua. Bellan luku on niistä pienempi, koska se on toisen puolikas.',
      explain: 'Käy vihjeet läpi yksi kerrallaan ja rajaa pois sopimattomat luvut. Kahden ensimmäisen vihjeen jälkeen jäljelle jää kaksi lukua. Bellan luku on niistä se, joka on toisen puolikas.' }] };
  }

  /* ===================================================================== */
  /* 10. Laskujärjestys                                                      */
  /* ===================================================================== */
  function genJarjestys(d, idx) {
    var forms = [['a:b+c', 'a·(b−c)', 'a:b−c', 'a+b:c'], ['a−b:c', '(a−b):c', 'a+b:c', 'a:10−c', '(a+b):c'], ['a−b:10', 'a:10+b', 'a·(b−c)', 'words1', 'words2', 'a+b:c']][d];
    var f = pick(forms), expr, val, ltr = null, first;
    var b, c, a, q;
    switch (f) {
      case 'a:b+c': b = pick([2, 5, 10, 4, 3]); q = R(3, 30); a = b * q; c = R(2, 40); expr = fmt(a) + DIV + b + PLUS + c; val = q + c; ltr = a % (b + c) === 0 ? a / (b + c) : null; first = fmt(a) + DIV + b; break;
      case 'a:b−c': b = pick([5, 10, 3, 6]); q = R(10, 40); a = b * q; c = R(2, q - 1); expr = fmt(a) + DIV + b + MINUS + c; val = q - c; first = fmt(a) + DIV + b; if (b - c > 0 && a % (b - c) === 0) ltr = a / (b - c); break;
      case 'a·(b−c)': a = d === 2 ? R(12, 25) : R(3, 9); b = d === 2 ? pick([100, 50, 40]) : R(8, 20); c = d === 2 ? b - pick([10, 5, 2]) : R(2, b - 2); expr = a + MUL + '(' + b + MINUS + c + ')'; val = a * (b - c); ltr = a * b - c; first = b + MINUS + c; break;
      case 'a+b:c': c = pick([3, 4, 5, 10]); q = R(8, 60); b = c * q; a = d === 2 ? R(100, 600) : R(10, 90); expr = fmt(a) + PLUS + fmt(b) + DIV + c; val = a + q; ltr = (a + b) % c === 0 ? (a + b) / c : null; first = fmt(b) + DIV + c; break;
      case 'a−b:c': c = pick([3, 4, 6, 10]); q = R(10, 50); b = c * q; a = b + c * R(2, 20); expr = fmt(a) + MINUS + fmt(b) + DIV + c; val = a - q; first = fmt(b) + DIV + c; ltr = (a - b) / c; break;
      case '(a−b):c': c = pick([10, 4, 5, 8]); q = R(4, 20); b = R(10, 90); a = b + c * q; expr = '(' + fmt(a) + MINUS + fmt(b) + ')' + DIV + c; val = q; ltr = a % c === 0 ? a / c - b : null; first = fmt(a) + MINUS + fmt(b); break;
      case '(a+b):c': c = pick([3, 4, 6]); q = R(5, 20); a = R(5, c * q - 5); b = c * q - a; expr = '(' + a + PLUS + b + ')' + DIV + c; val = q; ltr = b % c === 0 ? a + b / c : null; first = a + PLUS + b; break;
      case 'a:10−c': q = R(15, 60); a = q * 10; c = R(2, 9); expr = fmt(a) + DIV + '10' + MINUS + c; val = q - c; first = fmt(a) + DIV + '10'; ltr = a % (10 - c) === 0 ? a / (10 - c) : null; break;
      case 'a−b:10': q = R(12, 60); b = q * 10; a = R(b / 10 + 50, 1500); expr = fmt(a) + MINUS + fmt(b) + DIV + '10'; val = a - q; first = fmt(b) + DIV + '10'; ltr = (a - b) > 0 && (a - b) % 10 === 0 ? (a - b) / 10 : null; break;
      case 'a:10+b': q = R(120, 480); a = q * 10; b = pick([100, 50, 200, 25]); expr = fmt(a) + DIV + '10' + PLUS + b; val = q + b; first = fmt(a) + DIV + '10'; ltr = a % (10 + b) === 0 ? a / (10 + b) : null; break;
      case 'words1': {
        var x, y; do { y = R(2, 12); x = y + R(2, 12); } while ((x + y) % (x - y) !== 0 || x + y === x - y);
        var ok = '(' + x + PLUS + y + ')' + DIV + '(' + x + MINUS + y + ')';
        return { exam: 1, steps: [{ kind: 'mc', layout: 'list', lead: 'Merkitse lauseke. Muista sulkeet.', html: '<p class="story">Mikä on lukujen ' + x + ' ja ' + y + ' summan ja erotuksen osamäärä?</p>',
          options: mc(ok, [{ html: x + PLUS + y + DIV + x + MINUS + y, tag: 'jarjestys', msg: 'Ilman sulkeita jakolasku laskettaisiin ensin.' }, { html: '(' + x + MINUS + y + ')' + DIV + '(' + x + PLUS + y + ')', tag: 'lauseke', msg: 'Järjestys on väärin: ensin summa, sitten erotus.' }, { html: '(' + x + PLUS + y + ')' + MUL + '(' + x + MINUS + y + ')', tag: 'lauseke', msg: 'Osamäärä tarkoittaa jakolaskua, ei kertolaskua.' }]), answerText: ok,
          hint: 'Summa = yhteenlasku, erotus = vähennyslasku, osamäärä = jakolasku. Laita summa ja erotus sulkeisiin.',
          explain: 'Summa tarkoittaa yhteenlaskua ja erotus vähennyslaskua. Osamäärä tarkoittaa, että summa jaetaan erotuksella. Laita molemmat sulkeisiin, jotta ne lasketaan ensin.' },
          { kind: 'num', lead: 'Laske.', big: ok, answer: (x + y) / (x - y), answerText: String((x + y) / (x - y)), traps: [[x + y, 'jarjestys', 'Laske loppuun: jaa summa erotuksella.']], hint: 'Laske ensin sulkeet: ' + x + ' + ' + y + ' = ' + (x + y) + ' ja ' + x + ' − ' + y + ' = ' + (x - y) + '.', explain: 'Laske ensin molemmat sulkeet. Jaa sitten ensimmäisen sulkeen tulos toisen sulkeen tuloksella.' }] };
      }
      case 'words2': {
        var y2 = R(2, 6), x2 = y2 * R(2, 6); if (x2 === y2) x2 = y2 * 3;
        var ok2 = '(' + x2 + MINUS + y2 + ')' + MUL + '(' + x2 + DIV + y2 + ')';
        return { exam: 1, steps: [{ kind: 'mc', layout: 'list', lead: 'Merkitse lauseke. Muista sulkeet.', html: '<p class="story">Mikä on lukujen ' + x2 + ' ja ' + y2 + ' erotuksen ja osamäärän tulo?</p>',
          options: mc(ok2, [{ html: x2 + MINUS + y2 + MUL + x2 + DIV + y2, tag: 'jarjestys', msg: 'Ilman sulkeita kertolasku laskettaisiin ensin.' }, { html: '(' + x2 + PLUS + y2 + ')' + MUL + '(' + x2 + DIV + y2 + ')', tag: 'lauseke', msg: 'Erotus tarkoittaa vähennyslaskua.' }, { html: '(' + x2 + MINUS + y2 + ')' + DIV + '(' + x2 + MUL + y2 + ')', tag: 'lauseke', msg: 'Tulo tarkoittaa kertolaskua.' }]), answerText: ok2,
          hint: 'Erotus = vähennyslasku, osamäärä = jakolasku, tulo = kertolasku.',
          explain: 'Erotus tarkoittaa vähennyslaskua ja osamäärä jakolaskua. Tulo tarkoittaa, että nämä kaksi tulosta kerrotaan keskenään. Laita molemmat sulkeisiin.' },
          { kind: 'num', lead: 'Laske.', big: ok2, answer: (x2 - y2) * (x2 / y2), answerText: String((x2 - y2) * (x2 / y2)), hint: 'Laske ensin sulkeet: ' + x2 + ' − ' + y2 + ' = ' + (x2 - y2) + ' ja ' + x2 + ' : ' + y2 + ' = ' + (x2 / y2) + '.', explain: 'Laske ensin molemmat sulkeet erikseen. Kerro sitten tulokset keskenään.' }] };
      }
    }
    var rule = 'Laskujärjestys: 1. sulkeet, 2. kerto- ja jakolaskut, 3. yhteen- ja vähennyslaskut vasemmalta oikealle.';
    var traps = ltr != null && ltr !== val && ltr >= 0 && Number.isInteger(ltr) ? [[ltr, 'jarjestys', 'Laskit väärässä järjestyksessä. Sulkeet ensin, sitten kerto- ja jakolaskut ja vasta lopuksi yhteen- ja vähennyslaskut.']] : [];
    var steps = [];
    if (Math.random() < 0.5 || d === 0) {
      var wrongFirst = [];
      var m = expr.replace(/[()]/g, '').split(/ [+−·:] /);
      if (m.length >= 3) wrongFirst.push(m[0] + expr.match(/ [+−·:] /g)[0] + m[1]);
      wrongFirst.push('Vasemmalta ensimmäinen lasku');
      if (m.length >= 3) wrongFirst.push(m[1] + expr.match(/ [+−·:] /g)[1] + m[2]);
      steps.push({ kind: 'mc', layout: 'list', lead: 'Mikä lasketaan ensin?', big: expr, options: mc(first, wrongFirst.filter(function (w) { return w.replace(/\s/g, '') !== first.replace(/\s/g, ''); }).map(function (w) { return { html: w, tag: 'jarjestys' }; }), 3), answerText: first,
        hint: rule, explain: 'Muista laskujärjestys: ensin sulkeet, sitten kerto- ja jakolaskut ja vasta lopuksi yhteen- ja vähennyslaskut. Katso, onko lausekkeessa sulkeita tai kerto- tai jakolaskua.' });
    }
    steps.push({ kind: 'num', lead: 'Laske. Muista laskujärjestys.', big: expr, answer: val, answerText: fmt(val), traps: traps,
      hint: rule + ' Laske siis ensin ' + first + '.',
      explain: 'Etsi ensin lausekkeesta se lasku, joka tehdään ensimmäisenä: tässä se on ' + first.replace(/ /g, ' ') + '. Kirjoita sen tulos muistiin ja laske sitten loput.' });
    return { steps: steps };
  }

  /* ===================================================================== */
  /* 11. Sanatehtävät                                                        */
  /* ===================================================================== */
  function storyTask(story, okExpr, wrongs, ans, unit, hint, explain, traps) {
    return { exam: 1, examStep: { kind: 'num', lead: 'Merkitse lauseke mielessäsi ja laske.', html: '<p class="story">' + story + '</p>', answer: ans, unit: unit, answerText: fmt(ans) + (unit ? NB + unit : ''), traps: traps || [], hint: hint, explain: explain },
      steps: [
        { kind: 'mc', layout: 'list', lead: 'Valitse oikea lauseke.', html: '<p class="story">' + story + '</p>', options: mc(okExpr, wrongs), answerText: okExpr,
          hint: 'Kun jotain jaetaan tasan tai etsitään yhden hintaa, tarvitaan jakolasku.', explain: explain },
        { kind: 'num', lead: 'Laske. Kirjoita tulos.', html: '<p class="story small">' + story + '</p><p class="expr">' + okExpr + '</p>', answer: ans, unit: unit, answerText: fmt(ans) + (unit ? NB + unit : ''), traps: traps || [], hint: hint, explain: 'Laske lauseke ' + okExpr.replace(/<[^>]+>/g, '').replace(/ /g, ' ') + '. Voit käyttää osittain jakamista tai lukuyksiköittäin jakamista. Tarkista lopuksi kertolaskulla.' }
      ] };
  }
  var CONTAINERS = [['rasiassa', 'rasiaan', 'helmeä', 'helmeä', 'helmet'], ['pussissa', 'pussiin', 'herkkua', 'herkkua', 'herkut'], ['kulhossa', 'kulhoon', 'nappulaa', 'nappulaa', 'nappulat']];
  var PRICE_ITEMS = [['koiranpetiä', 'peti'], ['kaulapantaa', 'panta'], ['purulelua', 'lelu'], ['sadetakkia', 'takki'], ['ruokasäkkiä', 'säkki'], ['akvaariota', 'akvaario'], ['kiekkokalaa', 'kiekkokala'], ['taustakuvaa', 'taustakuva']];
  function divWrongs(n, k, unitA, unitK) {
    return [{ html: n + unitA + MUL + k + unitK, tag: 'lauseke', msg: 'Kertolasku antaisi suuremman luvun. Nyt jaetaan.' }, { html: n + unitA + MINUS + k + unitK, tag: 'lauseke', msg: 'Vähennyslasku ei jaa tasan.' }, { html: k + unitK + DIV + n + unitA, tag: 'lauseke', msg: 'Jaettava kirjoitetaan ensin: iso määrä jaetaan osiin.' }];
  }
  function genSanat(d, idx) {
    var type = pick([['jako', 'hinta', 'kalat'], ['hinta', 'kalat', 'jaannos', 'setelit'], ['liput', 'liput3', 'hinta3', 'jaannos', 'vertaa']][d]);
    if (type === 'jako') {
      var k = pick([2, 3, 4]), n = lukuyksNumber(3, k, false), q = n / k, c = pick(CONTAINERS);
      return storyTask(k + ' ' + c[0] + ' on yhteensä ' + n + ' ' + c[2] + '. Kuinka monta ' + c[3] + ' on yhdessä ' + c[0].replace(/ssa$/, 'ssa') + ', kun jokaisessa on yhtä monta?',
        n + DIV + k, divWrongs(n, k, '', ''), q, c[3], 'Laske lukuyksiköittäin: jaa sadat, kymmenet ja ykköset erikseen.',
        'Kaikki ' + c[4] + ' jaetaan tasan ' + k + ' osaan, joten tarvitaan jakolasku. Kirjoita ensin iso määrä ' + n + ' ja jaa se luvulla ' + k + '. Tämän voi laskea lukuyksiköittäin.', lukuyksTraps(n, k, q));
    }
    if (type === 'kalat') {
      var o = osittainNumber(40, 99, [3, 4, 5, 2], 11);
      var story = pick([o.n + ' kalaa jaetaan tasan ' + o.dv + ' akvaarioon. Kuinka monta kalaa jokaiseen akvaarioon tulee?', o.n + ' namia jaetaan tasan ' + o.dv + ' pennulle. Kuinka monta namia jokainen pentu saa?', o.n + ' koristekiveä jaetaan tasan ' + o.dv + ' akvaarioon. Kuinka monta kiveä jokaiseen akvaarioon tulee?']);
      return storyTask(story, o.n + DIV + o.dv, divWrongs(o.n, o.dv, '', ''), o.n / o.dv, story.indexOf('kalaa') >= 0 ? 'kalaa' : story.indexOf('namia') >= 0 ? 'namia' : 'kiveä',
        'Laske osittain jakamalla: ' + o.n + ' = ' + firstPart(o.n, o.dv) + ' + ' + (o.n - firstPart(o.n, o.dv)) + '.',
        'Kun jotain jaetaan tasan, tarvitaan jakolasku. Kirjoita ensin kaikkien määrä ' + o.n + ' ja jaa se ' + o.dv + ' osaan. Lukua ' + o.n + ' ei voi jakaa lukuyksiköittäin, joten jaa se osittain.',
        [[firstPart(o.n, o.dv) / o.dv + o.n - firstPart(o.n, o.dv), 'osat', 'Toinen osa jäi jakamatta.']]);
    }
    if (type === 'hinta' || type === 'hinta3') {
      var it = pick(PRICE_ITEMS), kk = type === 'hinta3' ? pick([3, 4, 6, 5]) : pick([2, 3, 4, 5]), price, total;
      if (type === 'hinta3') { price = R(31, Math.floor(980 / kk)); total = price * kk; if (!notLukuyks(total, kk)) { price += 1; total = price * kk; } }
      else { var oo = Math.random() < 0.5 ? { n: lukuyksNumber(3, kk, true), dv: kk } : osittainNumber(100, 400, [kk], 21); total = oo.n; price = total / kk; }
      return storyTask(kk + ' ' + it[0] + ' maksaa yhteensä ' + eur(total) + '. Kuinka paljon maksaa yksi ' + it[1] + '?', eur(total) + DIV + kk, divWrongs(eur(total), kk, '', ''), price, '€',
        'Yhden hinta saadaan jakamalla kokonaishinta kappalemäärällä: ' + fmt(total) + ' : ' + kk + '.',
        'Kun tiedetään monen tavaran yhteishinta ja halutaan yhden hinta, jaetaan. Jaa ' + fmt(total) + ' euroa ' + kk + ' yhtä suureen osaan. Tarkista lopuksi: ' + kk + ' kertaa vastauksesi pitää olla ' + fmt(total) + '.',
        [[total * kk, 'lauseke', 'Kerroit, vaikka piti jakaa.']]);
    }
    if (type === 'setelit') {
      var nt = pick([10, 100]), cnt = nt === 10 ? R(23, 89) : R(12, 48), money = cnt * nt;
      return storyTask('Lauralla on ' + eur(money) + ' ' + nt + ' euron seteleinä. Kuinka monta ' + nt + ' euron seteliä Lauralla on?', eur(money) + DIV + nt + NB + '€',
        [{ html: eur(money) + MUL + nt, tag: 'lauseke' }, { html: eur(money) + MINUS + nt + NB + '€', tag: 'lauseke' }, { html: nt + NB + '€' + DIV + fmt(money), tag: 'lauseke' }], cnt, 'seteliä',
        'Jaa ' + fmt(money) + ' : ' + nt + ' – poista lopusta ' + (nt === 10 ? 'yksi nolla' : 'kaksi nollaa') + '.',
        'Jokainen seteli on ' + nt + ' euroa, joten mietitään, montako kertaa ' + nt + ' mahtuu summaan. Se on jakolasku. Kun jaat luvulla ' + nt + ', lopusta lähtee ' + (nt === 10 ? 'yksi nolla' : 'kaksi nollaa') + '.',
        kymppiTraps(money, nt, cnt));
    }
    if (type === 'jaannos') {
      var p = R(3, 8), nn; do { nn = R(p * 4, p * 12); } while (nn % p === 0);
      var qq = Math.floor(nn / p), rr = nn % p;
      var st = remFill(nn, p, 'Laske. Montako namia kukin pentu saa ja montako jää yli?');
      st.html = '<p class="story">' + nn + ' namia jaetaan tasan ' + p + ' pennulle. Jokainen saa yhtä monta, ja ylimääräiset jäävät purkkiin. Montako namia kukin saa ja montako jää purkkiin?</p>';
      st.parts = ['Jokainen saa ', st.parts[1], ' namia ja purkkiin jää ', st.parts[3], ' namia.'];
      st.explain = 'Namit jaetaan tasan, joten tarvitaan jakolasku ' + nn + ' jaettuna ' + p + '. Etsi luvun ' + p + ' kertotaulusta suurin luku, joka on enintään ' + nn + '. Ylimääräiset namit ovat jakojäännös.';
      return { exam: 0, steps: [st] };
    }
    if (type === 'liput') {
      var n7 = pick([3, 4, 5, 6, 7]), pr = R(9, 14), tot = n7 * pr, pay = pick([20, 50]);
      if (pr >= pay) pay = 50;
      var ok = eur(pay) + MINUS + eur(tot) + DIV + n7;
      return storyTask('Nikon isä ostaa ' + n7 + ' konserttilippua, jotka maksavat yhteensä ' + eur(tot) + '. Juuso ostaa samaan konserttiin yhden lipun. Kuinka paljon hän saa ' + pay + ' eurosta takaisin?', ok,
        [{ html: '(' + eur(pay) + MINUS + eur(tot) + ')' + DIV + n7, tag: 'jarjestys' }, { html: eur(tot) + DIV + n7 + MINUS + eur(pay), tag: 'lauseke' }, { html: eur(pay) + MINUS + eur(tot), tag: 'lauseke', msg: 'Juuso ostaa vain yhden lipun.' }], pay - pr, '€',
        'Laske ensin yhden lipun hinta: ' + tot + ' : ' + n7 + ' = ' + pr + '. Vähennä se sitten ' + pay + ' eurosta.',
        'Tehtävässä on kaksi vaihetta. Laske ensin yhden lipun hinta jakamalla ' + tot + ' euroa ' + n7 + ' lipulle. Vähennä sitten yhden lipun hinta ' + pay + ' eurosta.',
        [[pr, 'lauseke', 'Laskit vasta yhden lipun hinnan. Kysytään, paljonko rahaa saa takaisin.'], [pay - tot, 'lauseke', 'Juuso ostaa vain yhden lipun.']]);
    }
    if (type === 'liput3') {
      var n4 = pick([4, 5, 6]), pr2 = R(21, 39), tot2 = n4 * pr2, m = pick([2, 3]);
      var ok3 = m + MUL + '(' + eur(tot2) + DIV + n4 + ')';
      return storyTask('Mian äiti ostaa ' + n4 + ' lippua jalkapallo-otteluun. Liput maksavat yhteensä ' + eur(tot2) + '. Ossi ja hänen ' + (m === 3 ? 'kaksi kaveriaan' : 'kaverinsa') + ' menevät samaan otteluun. Kuinka paljon heidän lippunsa maksavat yhteensä?', ok3,
        [{ html: eur(tot2) + DIV + n4, tag: 'lauseke', msg: 'Tämä on vasta yhden lipun hinta.' }, { html: eur(tot2) + MINUS + m + MUL + n4, tag: 'lauseke' }, { html: eur(tot2) + DIV + n4 + PLUS + m, tag: 'lauseke', msg: 'Yhden lipun hinta pitää kertoa lippujen määrällä.' }], m * pr2, '€',
        'Laske ensin yhden lipun hinta: ' + tot2 + ' : ' + n4 + ' = ' + pr2 + '. Kerro se sitten luvulla ' + m + '.',
        'Tehtävässä on kaksi vaihetta. Laske ensin yhden lipun hinta jakamalla ' + tot2 + ' euroa ' + n4 + ' lipulle. Kerro sitten yhden lipun hinta lippujen määrällä ' + m + '.',
        [[pr2, 'lauseke', 'Laskit yhden lipun hinnan. Kysytään ' + m + ' lipun hintaa.']]);
    }
    /* vertaa */
    var a1 = pick([3, 4]), a2 = a1 === 3 ? 5 : 6, pA = R(41, 99), pB = pA + pick([-3, -2, 2, 3, 4]);
    var tA = a1 * pA, tB = a2 * pB, cheaper = pA < pB ? 'Puotikoiran' : 'Hauvakaupan';
    var diff = Math.abs(pA - pB);
    return storyTask('Puotikoirassa ' + a1 + ' koiranpetiä maksaa yhteensä ' + eur(tA) + '. Hauvakaupassa ' + a2 + ' samanlaista petiä maksaa yhteensä ' + eur(tB) + '. Kuinka monta euroa yksi peti on halvempi ' + (pA < pB ? 'Puotikoirassa' : 'Hauvakaupassa') + '?',
      (pA < pB ? eur(tB) + DIV + a2 + MINUS + eur(tA) + DIV + a1 : eur(tA) + DIV + a1 + MINUS + eur(tB) + DIV + a2),
      [{ html: eur(tB) + MINUS + eur(tA), tag: 'lauseke', msg: 'Kaupoissa myydään eri määrä petejä, joten vertaa yhden pedin hintoja.' }, { html: '(' + eur(tB) + MINUS + eur(tA) + ')' + DIV + (a2 - a1), tag: 'lauseke' }, { html: eur(tA) + DIV + a2 + MINUS + eur(tB) + DIV + a1, tag: 'lauseke' }], diff, '€',
      'Laske ensin yhden pedin hinta kummassakin kaupassa: ' + tA + ' : ' + a1 + ' = ' + pA + ' ja ' + tB + ' : ' + a2 + ' = ' + pB + '.',
      'Kaupoissa on eri määrä petejä, joten verrataan yhden pedin hintaa. Laske ensin yhden pedin hinta kummassakin kaupassa jakolaskulla. Vähennä sitten pienempi hinta suuremmasta.',
      [[Math.abs(tA - tB), 'lauseke', 'Vertaa yhden pedin hintoja, ei koko summia.']]);
  }

  /* ===================================================================== */
  /* 12. Päättely                                                            */
  /* ===================================================================== */
  function symbolsTask(d) {
    var k = pick([3, 4, 5, 6]), X = k * 2 * R(3, 9), c = R(10, 50), e = X - c;
    if (e <= 0) { c = Math.floor(X / 2); e = X - c; }
    var S = X / k + R(5, 20), Z = S - X / k, Y = X / 2;
    var I = { X: '<i class="sym sym-bone" aria-label="luu"></i>', Y: '<i class="sym sym-ball" aria-label="pallo"></i>', Z: '<i class="sym sym-paw" aria-label="tassu"></i>' };
    var eqs = shuffle([
      I.X + DIV + '2' + PLUS + I.Y + EQ + I.X,
      I.X + DIV + k + PLUS + I.Z + EQ + S,
      I.X + MINUS + c + EQ + e
    ]);
    return { steps: [{ kind: 'fill', lead: 'Ratkaise, mitä lukua kuvat tarkoittavat. Sama kuva on aina sama luku.', html: '<div class="symeqs">' + eqs.map(function (q) { return '<p>' + q + '</p>'; }).join('') + '</div>',
      parts: [I.X + ' = ', F(X, { traps: [[e - c, 'paattely', ''], [c - e, 'paattely', '']] }), '<br>' + I.Y + ' = ', F(Y, { traps: [[X, 'paattely', 'Pallo on se, mitä luun puolikkaaseen pitää lisätä, jotta saadaan koko luu.']] }), '<br>' + I.Z + ' = ', F(Z, { traps: [[S - X, 'paattely', 'Jaa luu ensin luvulla ' + k + '.']] })],
      answerText: 'luu = ' + X + ', pallo = ' + Y + ', tassu = ' + Z,
      hint: 'Aloita yhtälöstä, jossa on vain yksi kuva: luu − ' + c + ' = ' + e + '. Kun tiedät luun, ratkaise muut.',
      explain: 'Aloita siitä yhtälöstä, jossa on vain yksi kuva, eli luu miinus ' + c + ' on ' + e + '. Kun tiedät luun arvon, sijoita se muihin yhtälöihin. Ratkaise sitten pallo ja tassu yksi kerrallaan.' }] };
  }
  function genPaattely(d, idx) {
    var type = pick([['sumdiff', 'croc', 'signs'], ['symbols', 'sumdiff', 'logic', 'croc'], ['symbols', 'logic', 'signs', 'sumdiff']][d]);
    if (type === 'symbols') return symbolsTask(d);
    if (type === 'sumdiff') {
      var small = R(5, 40), diff = R(5, 30), big = small + diff, S = small + big;
      var pair = pick([['koiranpeti', 'lelu', 'Peti', 'lelu', 'Kuinka paljon lelu maksaa?'], ['kiekkokala', 'koristekivi', 'Kala', 'kivi', 'Kuinka paljon kivi maksaa?'], ['hihna', 'pallo', 'Hihna', 'pallo', 'Kuinka paljon pallo maksaa?']]);
      return { steps: [{ kind: 'num', lead: 'Päättele.', html: '<p class="story">' + pair[0][0].toUpperCase() + pair[0].slice(1) + ' ja ' + pair[1] + ' maksavat yhteensä ' + eur(S) + '. ' + pair[2] + ' on ' + eur(diff) + ' kalliimpi kuin ' + pair[3] + '. ' + pair[4] + '</p>', answer: small, unit: '€', answerText: eur(small),
        traps: [[S - diff, 'paattely', 'Tämä on kahden halvemman tavaran hinta. Jaa se vielä kahdella.'], [S / 2, 'paattely', 'Tavarat eivät maksa yhtä paljon.'], [big, 'paattely', 'Tämä on kalliimman hinta.'], [diff, 'paattely', 'Tämä on hintojen ero.']],
        hint: 'Ota ensin ero pois: ' + S + ' − ' + diff + ' = ' + (S - diff) + '. Silloin jäljelle jää kaksi yhtä kallista tavaraa. Jaa kahdella.',
        explain: 'Kuvittele, että kalliimmasta otetaan ero pois. Silloin molemmat maksavat yhtä paljon ja yhteishinta on ' + S + ' miinus ' + diff + '. Jaa tämä summa kahdella, niin saat halvemman hinnan.' }] };
    }
    if (type === 'croc') {
      var k = pick([3, 4, 6, 7, 8, 9]), at1 = R(5, 10), at2 = R(5, 10);
      var top = [], bot = [];
      for (var i = 1; i <= 10; i++) { top.push(i <= 4 ? String(k * i) : (i === at1 ? '?' : '')); bot.push(i <= 4 ? String(k * i * 10) : (i === at2 ? '??' : '')); }
      if (at1 === at2) bot[at2 - 1] = '??';
      var tbl = '<table class="croc"><tr>' + top.map(function (x) { return '<td' + (x === '?' ? ' class="q"' : '') + '>' + (x === '?' ? 'A' : x) + '</td>'; }).join('') + '</tr><tr>' + bot.map(function (x) { return '<td' + (x === '??' ? ' class="q"' : '') + '>' + (x === '??' ? 'B' : x) + '</td>'; }).join('') + '</tr></table>';
      return { steps: [{ kind: 'fill', lead: 'Krokotiilijono: alarivin luku on aina 10 kertaa ylärivin luku. Mitkä luvut tulevat kohtiin A ja B?', html: tbl,
        parts: ['A = ', F(k * at1, { traps: [[k * (at1 - 1), 'huolimaton', 'Laske ruudut tarkkaan.'], [k * (at1 + 1), 'huolimaton', 'Laske ruudut tarkkaan.']] }), '<br>B = ', F(k * at2 * 10, { traps: [[k * at2, 'nolla', 'Alarivillä luvut ovat 10 kertaa suurempia.']] })],
        answerText: 'A = ' + (k * at1) + ', B = ' + (k * at2 * 10),
        hint: 'Ylärivillä on luvun ' + k + ' kertotaulu. A on ' + at1 + '. ruudussa, eli ' + at1 + ' · ' + k + '. B on ' + at2 + '. ruudussa alarivillä, eli ' + at2 + ' · ' + k + ' · 10.',
        explain: 'Ylärivillä on luvun ' + k + ' kertotaulu järjestyksessä. Laske, monesko ruutu A ja B ovat, ja kerro ruudun numero luvulla ' + k + '. Alariville lisätään vielä nolla, koska se on kymmenkertainen.' }] };
    }
    if (type === 'signs') {
      var ops = ['+', '·'], combos = [];
      ops.forEach(function (o1) { ops.forEach(function (o2) { ops.forEach(function (o3) { combos.push([o1, o2, o3]); }); }); });
      var val = function (c) { var e = '10' + c[0] + '10' + c[1] + '10' + c[2] + '10'; return Function('return ' + e.replace(/·/g, '*'))(); };
      var good = combos.filter(function (c) { return val(c) > 1000; }), bad = combos.filter(function (c) { return val(c) <= 1000; });
      var g = pick(good);
      var show = function (c) { return '10 ' + c[0] + ' 10 ' + c[1] + ' 10 ' + c[2] + ' 10'; };
      return { steps: [{ kind: 'mc', layout: 'list', lead: 'Mikä merkkien yhdistelmä tekee laskusta oikean? Muista laskujärjestys.', big: '10 □ 10 □ 10 □ 10 > 1' + SP + '000',
        options: mc(show(g), shuffle(bad).slice(0, 3).map(function (c) { return { html: show(c), tag: 'jarjestys', msg: show(c) + ' = ' + fmt(val(c)) + ', mikä ei ole yli 1 000.' }; })), answerText: show(g) + ' = ' + fmt(val(g)),
        hint: 'Laske jokainen vaihtoehto laskujärjestyksen mukaan: kertolaskut ensin.',
        explain: 'Laske jokainen vaihtoehto erikseen. Muista, että kertolaskut lasketaan ennen yhteenlaskuja. Oikean vaihtoehdon tulos on yli tuhat.' }] };
    }
    /* logic: Kasse ja Kurre ovat vastanneet kaikkiin väärin */
    var rows = d === 2 ? 5 : 4, table = [], right = 0;
    var opts = ['1', '2', 'X'];
    for (var r = 0; r < rows; r++) {
      var a = pick(opts), b; do { b = pick(opts); } while (b === a);
      var e = pick(opts); if (e !== a && e !== b) right++;
      table.push([a, b, e]);
    }
    return { steps: [{ kind: 'num', lead: 'Ratkaise. Kassella ja Kurrella on kaikki vastaukset väärin. Kuinka monta oikeaa vastausta Emmalla on?', html: '<table class="logic"><tr><th>Kysymys</th><th>Kasse</th><th>Kurre</th><th>Emma</th></tr>' + table.map(function (t, i) { return '<tr><td>' + (i + 1) + '.</td><td>' + t[0] + '</td><td>' + t[1] + '</td><td>' + t[2] + '</td></tr>'; }).join('') + '</table>',
      answer: right, answerText: String(right),
      hint: 'Jokaisessa kysymyksessä on kolme vaihtoehtoa: 1, 2 ja X. Kasse ja Kurre vastasivat väärin, joten oikea vastaus on se, jota kumpikaan ei valinnut.',
      explain: 'Jokaisessa kysymyksessä on kolme vaihtoehtoa, ja Kasse ja Kurre valitsivat kaksi väärää. Oikea vastaus on siis se kolmas vaihtoehto, jota kumpikaan ei valinnut. Tarkista rivi kerrallaan, valitsiko Emma juuri sen.' }] };
  }

  /* ===================================================================== */
  /* 13. Etsi huolimattomuusvirhe                                           */
  /* ===================================================================== */
  function genVirhe(d, idx) {
    var type = pick([['osa1', 'jakamaton', 'summa'], ['osa1', 'jakamaton', 'nolla', 'vahennys', 'jaannos'], ['osa1', 'nolla', 'jaannos', 'vahennys', 'jakamaton']][d]);
    var lines, wrongLine, correct, fix, big, why, answerKind = 'num';
    if (type === 'nolla') {
      var dv = pick([2, 3, 4, 6, 2]), n = lukuyksNumber(4, dv, true), q = n / dv, ds = digits(n);
      while (ds.slice(1).indexOf(0) < 0) { n = lukuyksNumber(4, dv, true); q = n / dv; ds = digits(n); }
      var places = ds.map(function (x, i) { return x * Math.pow(10, 3 - i); }).filter(function (x) { return x > 0; });
      var wrongQ = Number(places.map(function (p) { return digits(p)[0] / dv; }).join(''));
      if (wrongQ === q) wrongQ = Math.floor(q / 10);
      lines = [frac(n, dv) + ' = ' + places.map(function (p) { return frac(p, dv); }).join(PLUS), '= ' + places.map(function (p) { return fmt(p / dv); }).join(PLUS), '= ' + fmt(wrongQ)];
      wrongLine = 2; correct = q; big = frac(n, dv); why = 'Viimeisellä rivillä nollat unohtuivat: ' + places.map(function (p) { return fmt(p / dv); }).join(' + ') + ' = ' + fmt(q) + '.';
    } else if (type === 'jaannos') {
      var dv2 = R(4, 9), nn; do { nn = R(dv2 * 4, dv2 * 10); } while (nn % dv2 === 0);
      var qq = Math.floor(nn / dv2), rr = nn % dv2;
      lines = [nn + DIV + dv2 + ' = ' + (qq - 1) + ', jää ' + (rr + dv2), 'Tarkistus: ' + dv2 + MUL + (qq - 1) + PLUS + (rr + dv2) + ' = ' + nn];
      wrongLine = 0; correct = qq; big = nn + DIV + dv2; why = 'Jäännös ' + (rr + dv2) + ' on suurempi kuin jakaja ' + dv2 + ', joten jakaja mahtuu vielä kerran. Tarkistus ei paljasta tätä virhettä!';
      return { steps: [
        { kind: 'mc', layout: 'list', lead: 'Pentu laski tämän. Millä rivillä on virhe?', html: notebook(lines), options: [{ html: 'Rivillä 1', ok: true }, { html: 'Rivillä 2', ok: false, tag: 'jaannos', msg: 'Tarkistus on laskettu oikein, mutta se ei paljasta kaikkia virheitä.' }, { html: 'Ei virhettä', ok: false, tag: 'jaannos', msg: 'Katso jäännöstä tarkkaan.' }], answerText: why,
          hint: 'Vertaa jäännöstä jakajaan. Jäännös on aina pienempi kuin jakaja.', explain: 'Tarkista ensin, onko jäännös pienempi kuin jakaja. Jos jäännös on yhtä suuri tai suurempi, jakaja mahtuu vielä kerran lisää. Silloin osamäärä on liian pieni.' },
        remFill(nn, dv2, 'Hyvä! ' + why + ' Laske nyt oikein.')
      ] };
    } else {
      var o = d === 0 ? osittainNumber(40, 99, [3, 4], 11) : osittainNumber(100, 600, [3, 4, 5, 6], 21);
      var n3 = o.n, dv3 = o.dv, f = firstPart(n3, dv3), r = n3 - f, q1 = f / dv3, q2 = r / dv3, q3 = n3 / dv3;
      var L1 = frac(n3, dv3) + ' = ' + frac(f, dv3) + PLUS + frac(r, dv3), L2 = '= ' + fmt(q1) + PLUS + fmt(q2), L3 = '= ' + fmt(q3);
      if (type === 'osa1') { var wq1 = q1 + pick([10, q1 > 10 ? -10 : 10, 1]); L2 = '= ' + fmt(wq1) + PLUS + fmt(q2); L3 = '= ' + fmt(wq1 + q2); wrongLine = 1; why = 'Rivillä 2: ' + fmt(f) + ' : ' + dv3 + ' on ' + fmt(q1) + ', ei ' + fmt(wq1) + '. Tarkista: ' + dv3 + ' · ' + fmt(q1) + ' = ' + fmt(f) + '.'; }
      else if (type === 'jakamaton') { L2 = '= ' + fmt(q1) + PLUS + fmt(r); L3 = '= ' + fmt(q1 + r); wrongLine = 1; why = 'Rivillä 2 toinen osa ' + r + ' jäi jakamatta. ' + r + ' : ' + dv3 + ' = ' + q2 + '.'; }
      else if (type === 'summa') { var ws = q3 + pick([1, -1, 10]); L3 = '= ' + fmt(ws); wrongLine = 2; why = 'Rivillä 3 yhteenlasku meni väärin: ' + fmt(q1) + ' + ' + q2 + ' = ' + fmt(q3) + '.'; }
      else { var wr = r + 10; if (wr % dv3 !== 0) wr = r + dv3; L1 = frac(n3, dv3) + ' = ' + frac(f, dv3) + PLUS + frac(wr, dv3); L2 = '= ' + fmt(q1) + PLUS + fmt(wr / dv3); L3 = '= ' + fmt(q1 + wr / dv3); wrongLine = 0; why = 'Rivillä 1 osat eivät ole yhteensä ' + fmt(n3) + ': ' + fmt(f) + ' + ' + wr + ' = ' + fmt(f + wr) + '. Toisen osan pitää olla ' + fmt(n3) + ' − ' + fmt(f) + ' = ' + r + '.'; }
      lines = [L1, L2, L3]; correct = q3; big = frac(n3, dv3);
    }
    var opts = lines.map(function (_, i) { return { html: 'Rivillä ' + (i + 1), ok: i === wrongLine, tag: 'huolimaton' }; });
    return { steps: [
      { kind: 'mc', layout: 'list', lead: 'Pentu laski tämän vihkoonsa. Millä rivillä on virhe?', html: notebook(lines), options: opts, answerText: why,
        hint: 'Tarkista jokainen rivi itse: ovatko osat yhteensä jaettava, onko jokainen jako oikein ja meneekö yhteenlasku oikein?',
        explain: 'Tarkista rivi kerrallaan. Ensin katso, ovatko osat yhteensä yhtä paljon kuin jaettava. Sitten tarkista jokainen jakolasku kertolaskulla ja lopuksi yhteenlasku.' },
      { kind: 'num', lead: 'Hyvä! ' + why + ' Mikä on oikea vastaus?', big: big + ' =', answer: correct, answerText: fmt(correct), hint: 'Laske itse uudelleen huolellisesti.', explain: 'Laske jakolasku uudelleen alusta. Tarkista lopuksi kertomalla vastaus jakajalla.' }
    ] };
  }
  function notebook(lines) { return '<ol class="notebook">' + lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ol>'; }

  /* ===================================================================== */
  /* 14. Yhdistä                                                             */
  /* ===================================================================== */
  function genYhdista(d, idx) {
    var n = d === 0 ? 3 : 4, pairs = [], used = {}, tries = 0;
    while (pairs.length < n && tries < 400) {
      tries++;
      var dv, q, o;
      if (d === 0) { dv = R(2, 9); q = R(3, 10); }
      else if (d === 1) {
        o = Math.random() < 0.5 ? osittainNumber(40, 99, [3, 4], 11) : (function () { var k = pick([2, 3]); return { n: lukuyksNumber(3, k, false), dv: k }; })();
        dv = o.dv; q = o.n / dv;
      } else {
        dv = pick([2, 3, 4, 5]); q = pick([1001, 1012, 1021, 1023, 1100, 2021, 1101, 2200, 1010, 2011, 1201, 1102]);
        if (q * dv > 9999 || notLukuyks(q * dv, dv)) continue;
      }
      if (!Number.isInteger(q) || used[q]) continue;
      used[q] = 1;
      pairs.push({ a: q * dv, dv: dv, q: q });
    }
    var rights = pairs.map(function (p) { return p.q; });
    if (d === 2) { var decoy = rights[0] + pick([9, 11, 90, 99]); if (rights.indexOf(decoy) < 0) rights.push(decoy); }
    return { steps: [{ kind: 'match', lead: 'Yhdistä jakolasku ja sen osamäärä. Napauta ensin jakolaskua ja sitten sen tulosta.', left: pairs.map(function (p) { return { html: fmt(p.a) + DIV + p.dv, key: p.q }; }), right: shuffle(rights).map(function (x) { return { html: fmt(x), key: x }; }),
      answerText: pairs.map(function (p) { return fmt(p.a) + ' : ' + p.dv + ' = ' + fmt(p.q); }).join(', '),
      hint: 'Laske jokainen jakolasku ensin itse. ' + (d === 2 ? 'Isot luvut kannattaa jakaa lukuyksiköittäin.' : 'Voit tarkistaa kertolaskulla.'),
      explain: 'Laske jakolaskut yksi kerrallaan ja etsi vastaus oikealta. ' + (d === 2 ? 'Jaa isot luvut lukuyksiköittäin ja varo lukuja, jotka näyttävät melkein samalta.' : 'Tarkista jokainen pari kertolaskulla: jakaja kertaa osamäärä on jaettava.') }] };
  }

  /* ===================================================================== */
  /* 15. Mestaritemppu (★★★): sekoitus vaikeimpia                            */
  /* ===================================================================== */
  function genMestari(d, idx) {
    var t = pick(['jarjestys', 'puuttuva', 'sanat', 'jaannos', 'osittain3', 'lukuyks', 'paattely', 'jaollisuus']);
    var q = TOPICS_BY_ID[t].gen(2, idx);
    q.sub = t;
    return q;
  }

  /* ===================================================================== */
  var TOPICS = [
    { id: 'perus',     trick: 'Istu',          title: 'Jakolaskut kertotaulusta',             obstacle: 'kartio',  tag: 'kertotaulu', gen: genPerus },
    { id: 'kymppi',    trick: 'Tassu',         title: 'Jakaminen 10:llä, 100:lla ja 1000:lla', obstacle: 'pöytä',   tag: 'nolla',      gen: genKymppi },
    { id: 'pyorea',    trick: 'Maahan',        title: 'Pyöreiden lukujen jakaminen',           obstacle: 'hyppy',   tag: 'nolla',      gen: genPyorea },
    { id: 'lukuyks',   trick: 'Pyöri',         title: 'Lukuyksiköittäin jakaminen',            obstacle: 'rengas',  tag: 'lukuyks',    gen: genLukuyks },
    { id: 'osittain',  trick: 'Hyppää',        title: 'Osittain jakaminen',                    obstacle: 'keinu',   tag: 'osat',       gen: genOsittain },
    { id: 'osittain3', trick: 'Tunneli',       title: 'Osittain: kolminumeroinen luku',        obstacle: 'tunneli', tag: 'osat',       gen: genOsittain3 },
    { id: 'jaannos',   trick: 'Odota',         title: 'Jakojäännös ja tarkistus',              obstacle: 'a',       tag: 'jaannos',    gen: genJaannos },
    { id: 'yhdista',   trick: 'Pujottele',     title: 'Yhdistä jakolasku ja tulos',            obstacle: 'kepit',   tag: 'kertotaulu', gen: genYhdista },
    { id: 'jarjestys', trick: 'Peruuta',       title: 'Laskujärjestys',                        obstacle: 'kartio',  tag: 'jarjestys',  gen: genJarjestys },
    { id: 'sanat',     trick: 'Nouda',         title: 'Sanatehtävät: merkitse lauseke',        obstacle: 'pallo',   tag: 'lauseke',    gen: genSanat },
    { id: 'puuttuva',  trick: 'Etsi',          title: 'Puuttuva luku ja Mikä luku?',           obstacle: 'nuuhku',  tag: 'paattely',   gen: genPuuttuva },
    { id: 'jaollisuus',trick: 'Kumarra',       title: 'Jaollisuus ja Kurren reitti',           obstacle: 'luu',     tag: 'jaollisuus', gen: genJaollisuus },
    { id: 'paattely',  trick: 'Ylävitonen',    title: 'Päättely: kuvat, jonot ja logiikka',    obstacle: 'koodi',   tag: 'paattely',   gen: genPaattely },
    { id: 'virhe',     trick: 'Nuuski',   title: 'Etsi huolimattomuusvirhe',              obstacle: 'viivat',  tag: 'huolimaton', gen: genVirhe },
    { id: 'mestari',   trick: 'Mestaritemppu', title: 'Tähtitehtävät ★★★',                     obstacle: 'pokaali', tag: 'huolimaton', gen: genMestari }
  ];
  var TOPICS_BY_ID = {}; TOPICS.forEach(function (t) { TOPICS_BY_ID[t.id] = t; });

  var TAGS = {
    kertotaulu: { name: 'Kertotaulun jakolaskut', topic: 'perus', tip: 'Jakolasku on kertolasku takaperin. Kertaa kertotauluja 6–9 ja tarkista jokainen jako kertolaskulla.' },
    nolla:      { name: 'Nollat ja paikka-arvo', topic: 'kymppi', tip: 'Kun jaat 10:llä, 100:lla tai 1000:lla, poista lopusta oikea määrä nollia. Lukuyksiköittäin jakaessa nolla pysyy paikallaan.' },
    lukuyks:    { name: 'Lukuyksiköittäin jakaminen', topic: 'lukuyks', tip: 'Jaa tuhannet, sadat, kymmenet ja ykköset erikseen ja muista, mitä lukuyksikköä kukin numero tarkoittaa.' },
    osat:       { name: 'Osittain jakamisen osat', topic: 'osittain', tip: 'Valitse ensimmäiseksi osaksi suurin jakajan kymmenkertainen luku. Jaa MOLEMMAT osat ja laske osamäärät yhteen.' },
    jaannos:    { name: 'Jakojäännös', topic: 'jaannos', tip: 'Jäännös on aina pienempi kuin jakaja. Tarkista: jakaja · osamäärä + jäännös = jaettava.' },
    jarjestys:  { name: 'Laskujärjestys', topic: 'jarjestys', tip: 'Sulkeet ensin, sitten kerto- ja jakolaskut, viimeisenä yhteen- ja vähennyslaskut.' },
    lauseke:    { name: 'Sanatehtävän lauseke', topic: 'sanat', tip: 'Alleviivaa kysymys. Tasan jakaminen ja yhden hinta ovat jakolaskuja. Monivaiheisessa tehtävässä laske ensin yhden hinta.' },
    jaollisuus: { name: 'Jaollisuus', topic: 'jaollisuus', tip: 'Kokeile jakaa ja katso, jääkö jäännöstä. Muista vinkit: 2 parillinen, 5 lopussa 0 tai 5, 3 ja 9 numeroiden summa.' },
    paattely:   { name: 'Päättely', topic: 'paattely', tip: 'Kirjoita tiedot ylös ja aloita helpoimmasta vihjeestä. Tarkista lopuksi, että vastaus sopii kaikkiin vihjeisiin.' },
    huolimaton: { name: 'Huolimattomuusvirheet', topic: 'virhe', tip: 'Vastaus meni melkein oikein. Hidasta lopussa: tarkista yhteenlasku ja tee kertolaskutarkistus ennen kuin vastaat.' }
  };

  /* Virheen luokittelu */
  function classify(step, given, correct, fieldTraps, topicId) {
    var traps = (fieldTraps || []).concat(step.traps || []);
    for (var i = 0; i < traps.length; i++) if (traps[i][0] === given && given !== correct) return { tag: traps[i][1], msg: traps[i][2] || '' };
    if (given === correct) return null;
    if (given * 10 === correct || correct * 10 === given || given * 100 === correct || correct * 100 === given) return { tag: 'nolla', msg: 'Nollien määrä meni väärin. Tarkista paikka-arvo.' };
    var diff = Math.abs(given - correct);
    if (diff === 1 || diff === 2 || diff === 10 || diff === 100 || (correct >= 10 && reverseNum(given) === correct)) return { tag: 'huolimaton', msg: 'Melkein! Pieni huolimattomuusvirhe. Tarkista lopuksi kertolaskulla.' };
    return { tag: (TOPICS_BY_ID[topicId] || {}).tag || 'huolimaton', msg: '' };
  }

  var LEVEL_LEN = 8;
  function diffFor(i) { return i < 3 ? 0 : i < 6 ? 1 : 2; }
  function makeQuestion(topicId, d, idx) {
    var q = TOPICS_BY_ID[topicId].gen(d, idx || 0);
    q.topic = topicId; q.d = d;
    q.steps.concat(q.examStep ? [q.examStep] : []).forEach(function (s) { if (s.traps) s.traps = s.traps.filter(function (t) { return t[0] !== s.answer && t[0] >= 0; }); });
    return q;
  }
  function sig(q) { return JSON.stringify(q.steps.map(function (s) { return [s.big, s.html, s.parts && s.parts.filter(function (p) { return typeof p === 'string'; }).join('')]; })); }
  function makeLevel(topicId) {
    var out = [], seen = {};
    for (var i = 0; i < LEVEL_LEN; i++) {
      var q, t = 0;
      do { q = makeQuestion(topicId, diffFor(i), i); t++; } while (seen[sig(q)] && t < 25);
      seen[sig(q)] = 1; out.push(q);
    }
    return out;
  }
  var EXAM_PLAN = [
    ['perus', 1], ['kymppi', 1], ['kymppi', 2], ['pyorea', 2], ['jarjestys', 1], ['jarjestys', 2], ['lukuyks', 1], ['lukuyks', 2],
    ['osittain', 1], ['osittain', 2], ['osittain3', 1], ['osittain3', 2], ['jaannos', 0], ['jaannos', 2], ['puuttuva', 1],
    ['jaollisuus', 1], ['sanat', 0], ['sanat', 1], ['sanat', 2], ['paattely', 1]
  ];
  function examStepOf(q) {
    if (q.examStep) return q.examStep;
    var i = q.exam != null ? q.exam : q.steps.length - 1;
    return q.steps[Math.min(i, q.steps.length - 1)];
  }
  function makeExam() {
    return EXAM_PLAN.map(function (p, i) {
      var q;
      do { q = makeQuestion(p[0], p[1], i + 1); } while (p[0] === 'jaollisuus' && examStepOf(q).kind === 'mc' && examStepOf(q).layout === 'signs');
      q.examStep = examStepOf(q);
      return q;
    });
  }
  /* Arvosana-arvio: prosentti → kouluarvosana */
  var GRADE_SCALE = [[97, '10'], [92, '10−'], [88, '9½'], [84, '9'], [80, '9−'], [75, '8½'], [70, '8'], [65, '8−'], [60, '7½'], [55, '7'], [50, '7−'], [45, '6½'], [40, '6'], [33, '5½'], [27, '5'], [0, '4']];
  function gradeOf(pct) { for (var i = 0; i < GRADE_SCALE.length; i++) if (pct >= GRADE_SCALE[i][0]) return GRADE_SCALE[i][1]; return '4'; }

  global.JT_Q = {
    TOPICS: TOPICS, BY_ID: TOPICS_BY_ID, TAGS: TAGS, LEVEL_LEN: LEVEL_LEN,
    makeLevel: makeLevel, makeExam: makeExam, makeQuestion: makeQuestion, examStepOf: examStepOf,
    classify: classify, gradeOf: gradeOf, fmt: fmt, frac: frac, tableRow: tableRow, bowlsSvg: bowlsSvg, splitBar: splitBar,
    sentenceCount: sentenceCount, CODE: CODE, LETTER: LETTER, CODE_WORDS: CODE_WORDS
  };
  if (typeof module !== 'undefined') module.exports = global.JT_Q;
})(typeof window !== 'undefined' ? window : globalThis);
