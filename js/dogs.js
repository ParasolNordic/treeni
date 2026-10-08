/* Tassutreeni – piirretyt pennut, ikonit ja koristeet (SVG) */
(function (global) {
  'use strict';

  var COATS = {
    kulta:     { name: 'Kultainen',        base: '#F4C27F', shade: '#E2A55C', light: '#FFF3DF', ear: '#E09A50', line: '#5B3A22' },
    suklaa:    { name: 'Suklaa',           base: '#A0673F', shade: '#7E4C2C', light: '#EBC7A0', ear: '#6E4026', line: '#3E2516' },
    lumi:      { name: 'Lumi\u00ADvalkoinen',    base: '#FFFDF8', shade: '#EFE4D2', light: '#FFFFFF', ear: '#F1DFC6', line: '#7A6553' },
    musta:     { name: 'Musta-valkoinen',  base: '#3B3537', shade: '#2A2526', light: '#FFFFFF', ear: '#2A2526', line: '#1E1A1B', blaze: true },
    husky:     { name: 'Harmaa-valkoinen', base: '#9DA8B5', shade: '#7D8896', light: '#FFFFFF', ear: '#7A8594', line: '#3C4450', mask: 'husky' },
    kettu:     { name: 'Kettu-oranssi',    base: '#EE9E52', shade: '#D47F35', light: '#FFF6EA', ear: '#DD873A', line: '#5A3317', blaze: true },
    pilkku:    { name: 'Pilkul\u00ADlinen',      base: '#FFFFFF', shade: '#EDEDED', light: '#FFFFFF', ear: '#3B3537', line: '#3B3537', spots: true },
    aprikoosi: { name: 'Aprikoosi',        base: '#F9D2B0', shade: '#EDB78E', light: '#FFF1E4', ear: '#EDB07F', line: '#6A4430' }
  };

  var EARS = { luppa: 'Luppakorvat', pysty: 'Pystykorvat', nalle: 'Nallekorvat' };

  var STAGES = [
    { name: 'Pikkupentu',     tra: 'pikkupennuksi',    min: 0 },
    { name: 'Pentu',          tra: 'pennuksi',         min: 6 },
    { name: 'Nuori koira',    tra: 'nuoreksi koiraksi', min: 16 },
    { name: 'Aikuinen koira', tra: 'aikuiseksi koiraksi', min: 30 },
    { name: 'Mestarikoira',   tra: 'mestarikoiraksi',  min: 45 }
  ];

  var EYE = '#2B1D1A';
  var BLUSH = '#FF8FA3';
  var TONGUE = '#FF7A93';

  function n(v) { return Math.round(v * 10) / 10; }

  function ellipse(cx, cy, rx, ry, fill, stroke, sw, extra) {
    return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" fill="' + fill + '"' +
      (stroke ? ' stroke="' + stroke + '" stroke-width="' + (sw || 3) + '"' : '') + (extra || '') + '/>';
  }

  function heartPath(cx, cy, s) {
    return 'M' + n(cx) + ' ' + n(cy + 6 * s) +
      ' C' + n(cx - 9 * s) + ' ' + n(cy) + ' ' + n(cx - 11 * s) + ' ' + n(cy - 7 * s) + ' ' + n(cx - 5.5 * s) + ' ' + n(cy - 8 * s) +
      ' C' + n(cx - 2.5 * s) + ' ' + n(cy - 8.5 * s) + ' ' + n(cx) + ' ' + n(cy - 6 * s) + ' ' + n(cx) + ' ' + n(cy - 4.5 * s) +
      ' C' + n(cx) + ' ' + n(cy - 6 * s) + ' ' + n(cx + 2.5 * s) + ' ' + n(cy - 8.5 * s) + ' ' + n(cx + 5.5 * s) + ' ' + n(cy - 8 * s) +
      ' C' + n(cx + 11 * s) + ' ' + n(cy - 7 * s) + ' ' + n(cx + 9 * s) + ' ' + n(cy) + ' ' + n(cx) + ' ' + n(cy + 6 * s) + ' Z';
  }

  function bonePath(cx, cy, w, h) {
    var r = h * 0.42, x1 = cx - w / 2 + r, x2 = cx + w / 2 - r, t = h * 0.22;
    return 'M' + n(x1) + ' ' + n(cy - t) + ' L' + n(x2) + ' ' + n(cy - t) +
      ' A' + n(r) + ' ' + n(r) + ' 0 1 1 ' + n(x2 + r * 0.55) + ' ' + n(cy) +
      ' A' + n(r) + ' ' + n(r) + ' 0 1 1 ' + n(x2) + ' ' + n(cy + t) +
      ' L' + n(x1) + ' ' + n(cy + t) +
      ' A' + n(r) + ' ' + n(r) + ' 0 1 1 ' + n(x1 - r * 0.55) + ' ' + n(cy) +
      ' A' + n(r) + ' ' + n(r) + ' 0 1 1 ' + n(x1) + ' ' + n(cy - t) + ' Z';
  }

  /* ---------- Hatut, kaulakorut ja lelut ---------- */

  function hatSvg(kind, hx, hy, rx, ry, line) {
    var top = hy - ry;
    switch (kind) {
      case 'rusetti': {
        var bx = hx - rx * 0.5, by = top + ry * 0.2;
        return '<g class="acc">' +
          '<path d="M' + n(bx) + ' ' + n(by) + ' L' + n(bx - 18) + ' ' + n(by - 13) + ' Q' + n(bx - 23) + ' ' + n(by) + ' ' + n(bx - 18) + ' ' + n(by + 13) + ' Z" fill="#FF5C8A" stroke="' + line + '" stroke-width="2.5" stroke-linejoin="round"/>' +
          '<path d="M' + n(bx) + ' ' + n(by) + ' L' + n(bx + 18) + ' ' + n(by - 13) + ' Q' + n(bx + 23) + ' ' + n(by) + ' ' + n(bx + 18) + ' ' + n(by + 13) + ' Z" fill="#FF5C8A" stroke="' + line + '" stroke-width="2.5" stroke-linejoin="round"/>' +
          ellipse(bx, by, 6, 6, '#FF8FB0', line, 2.5) +
          ellipse(bx - 14, by - 4, 2, 2, '#FFD1DE') + ellipse(bx + 12, by + 4, 2, 2, '#FFD1DE') +
          '</g>';
      }
      case 'kruunu': {
        var y = top + 4, w = rx * 0.9, x0 = hx - w / 2;
        return '<g class="acc">' +
          '<path d="M' + n(x0) + ' ' + n(y) + ' L' + n(x0 - 2) + ' ' + n(y - 26) + ' L' + n(x0 + w * 0.25) + ' ' + n(y - 12) + ' L' + n(hx) + ' ' + n(y - 32) + ' L' + n(x0 + w * 0.75) + ' ' + n(y - 12) + ' L' + n(x0 + w + 2) + ' ' + n(y - 26) + ' L' + n(x0 + w) + ' ' + n(y) + ' Z" fill="#FFCC33" stroke="' + line + '" stroke-width="2.5" stroke-linejoin="round"/>' +
          ellipse(hx, y - 8, 4.5, 4.5, '#FF5C8A', line, 1.5) + ellipse(x0 + 6, y - 7, 3, 3, '#4FB3FF', line, 1.5) + ellipse(x0 + w - 6, y - 7, 3, 3, '#4FB3FF', line, 1.5) +
          '</g>';
      }
      case 'kukat': {
        var out = '<g class="acc">', cols = ['#FF7FA8', '#FFD23F', '#B98CFF', '#FF9F59', '#7FD1FF'];
        for (var i = 0; i < 5; i++) {
          var a = Math.PI * (0.18 + i * 0.16);
          var fx = hx - Math.cos(a) * rx * 0.86, fy = hy - Math.sin(a) * ry * 0.92;
          for (var p = 0; p < 5; p++) {
            var pa = p * Math.PI * 2 / 5;
            out += ellipse(fx + Math.cos(pa) * 5, fy + Math.sin(pa) * 5, 4.6, 4.6, cols[i], line, 1.2);
          }
          out += ellipse(fx, fy, 3.6, 3.6, '#FFF3A6', line, 1.2);
        }
        return out + '</g>';
      }
      case 'juhlahattu': {
        var px = hx + rx * 0.25, py = top + 6;
        return '<g class="acc" transform="rotate(14 ' + n(px) + ' ' + n(py) + ')">' +
          '<path d="M' + n(px - 17) + ' ' + n(py) + ' L' + n(px) + ' ' + n(py - 44) + ' L' + n(px + 17) + ' ' + n(py) + ' Z" fill="#7FD1FF" stroke="' + line + '" stroke-width="2.5" stroke-linejoin="round"/>' +
          '<path d="M' + n(px - 11) + ' ' + n(py - 15) + ' L' + n(px + 11) + ' ' + n(py - 15) + ' M' + n(px - 6) + ' ' + n(py - 29) + ' L' + n(px + 6) + ' ' + n(py - 29) + '" stroke="#FF5C8A" stroke-width="5" stroke-linecap="round"/>' +
          ellipse(px, py - 46, 6, 6, '#FFD23F', line, 2) +
          '</g>';
      }
      case 'pipo': {
        var py2 = top + ry * 0.42;
        return '<g class="acc">' +
          '<path d="M' + n(hx - rx * 0.9) + ' ' + n(py2) + ' Q' + n(hx - rx * 0.86) + ' ' + n(top - 18) + ' ' + n(hx) + ' ' + n(top - 20) + ' Q' + n(hx + rx * 0.86) + ' ' + n(top - 18) + ' ' + n(hx + rx * 0.9) + ' ' + n(py2) + ' Z" fill="#E8435E" stroke="' + line + '" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M' + n(hx - rx * 0.55) + ' ' + n(top - 4) + ' L' + n(hx - rx * 0.55) + ' ' + n(py2 - 6) + ' M' + n(hx) + ' ' + n(top - 14) + ' L' + n(hx) + ' ' + n(py2 - 6) + ' M' + n(hx + rx * 0.55) + ' ' + n(top - 4) + ' L' + n(hx + rx * 0.55) + ' ' + n(py2 - 6) + '" stroke="#C72E48" stroke-width="3" stroke-linecap="round"/>' +
          '<rect x="' + n(hx - rx * 0.95) + '" y="' + n(py2 - 9) + '" width="' + n(rx * 1.9) + '" height="16" rx="8" fill="#FFFFFF" stroke="' + line + '" stroke-width="3"/>' +
          ellipse(hx, top - 24, 11, 11, '#FFFFFF', line, 3) +
          '</g>';
      }
      case 'lasit': {
        var gy = hy + ry * 0.06, gx = rx * 0.38;
        return '<g class="acc">' +
          '<path d="' + heartPath(hx - gx, gy + 2, 1.9) + '" fill="#FF5C8A" fill-opacity=".85" stroke="' + line + '" stroke-width="2.5"/>' +
          '<path d="' + heartPath(hx + gx, gy + 2, 1.9) + '" fill="#FF5C8A" fill-opacity=".85" stroke="' + line + '" stroke-width="2.5"/>' +
          '<path d="M' + n(hx - gx + 9) + ' ' + n(gy - 6) + ' Q' + n(hx) + ' ' + n(gy - 12) + ' ' + n(hx + gx - 9) + ' ' + n(gy - 6) + '" stroke="' + line + '" stroke-width="2.5" fill="none"/>' +
          ellipse(hx - gx - 4, gy - 5, 3, 1.8, '#FFFFFF', null, 0, ' opacity=".8"') + ellipse(hx + gx - 4, gy - 5, 3, 1.8, '#FFFFFF', null, 0, ' opacity=".8"') +
          '</g>';
      }
      default: return '';
    }
  }

  function neckSvg(kind, color, hx, neckY, line) {
    switch (kind) {
      case 'panta':
        return '<g class="acc">' +
          '<path d="M' + n(hx - 36) + ' ' + n(neckY - 4) + ' Q' + n(hx) + ' ' + n(neckY + 12) + ' ' + n(hx + 36) + ' ' + n(neckY - 4) + '" stroke="' + line + '" stroke-width="13" fill="none" stroke-linecap="round"/>' +
          '<path d="M' + n(hx - 36) + ' ' + n(neckY - 4) + ' Q' + n(hx) + ' ' + n(neckY + 12) + ' ' + n(hx + 36) + ' ' + n(neckY - 4) + '" stroke="' + color + '" stroke-width="8" fill="none" stroke-linecap="round"/>' +
          '<path d="' + heartPath(hx, neckY + 14, 1.15) + '" fill="#FFD23F" stroke="' + line + '" stroke-width="2"/>' +
          '</g>';
      case 'huivi':
        return '<g class="acc">' +
          '<path d="M' + n(hx - 38) + ' ' + n(neckY - 6) + ' Q' + n(hx) + ' ' + n(neckY + 6) + ' ' + n(hx + 38) + ' ' + n(neckY - 6) + ' L' + n(hx) + ' ' + n(neckY + 34) + ' Z" fill="' + color + '" stroke="' + line + '" stroke-width="2.8" stroke-linejoin="round"/>' +
          ellipse(hx - 14, neckY + 6, 2.6, 2.6, '#FFFFFF', null, 0, ' opacity=".9"') + ellipse(hx + 12, neckY + 4, 2.6, 2.6, '#FFFFFF', null, 0, ' opacity=".9"') +
          ellipse(hx - 1, neckY + 18, 2.6, 2.6, '#FFFFFF', null, 0, ' opacity=".9"') + ellipse(hx + 4, neckY + 9, 2, 2, '#FFFFFF', null, 0, ' opacity=".9"') +
          '</g>';
      case 'kaulaliina':
        return '<g class="acc">' +
          '<path d="M' + n(hx - 40) + ' ' + n(neckY - 8) + ' Q' + n(hx) + ' ' + n(neckY + 14) + ' ' + n(hx + 40) + ' ' + n(neckY - 8) + '" stroke="' + line + '" stroke-width="19" fill="none" stroke-linecap="round"/>' +
          '<path d="M' + n(hx - 40) + ' ' + n(neckY - 8) + ' Q' + n(hx) + ' ' + n(neckY + 14) + ' ' + n(hx + 40) + ' ' + n(neckY - 8) + '" stroke="' + color + '" stroke-width="14" fill="none" stroke-linecap="round"/>' +
          '<path d="M' + n(hx + 18) + ' ' + n(neckY + 2) + ' l6 30 l14 -3 l-6 -29 Z" fill="' + color + '" stroke="' + line + '" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<path d="M' + n(hx + 22) + ' ' + n(neckY + 14) + ' l13 -3 M' + n(hx + 24) + ' ' + n(neckY + 22) + ' l13 -3" stroke="#FFFFFF" stroke-width="3"/>' +
          '</g>';
      case 'mitali':
        return '<g class="acc">' +
          '<path d="M' + n(hx - 14) + ' ' + n(neckY - 2) + ' L' + n(hx - 4) + ' ' + n(neckY + 20) + ' L' + n(hx + 4) + ' ' + n(neckY + 20) + ' L' + n(hx + 14) + ' ' + n(neckY - 2) + ' Z" fill="#4F8BFF" stroke="' + line + '" stroke-width="2.4" stroke-linejoin="round"/>' +
          ellipse(hx, neckY + 28, 11, 11, '#FFCC33', line, 2.6) +
          '<path d="M' + n(hx) + ' ' + n(neckY + 21) + ' l2.3 4.7 5.1.7 -3.7 3.6.9 5.1 -4.6 -2.4 -4.6 2.4.9 -5.1 -3.7 -3.6 5.1 -.7 Z" fill="#FFF3A6"/>' +
          '</g>';
      default: return '';
    }
  }

  function propSvg(kind, line) {
    switch (kind) {
      case 'pallo':
        return '<g class="prop">' + ellipse(178, 207, 14, 14, '#D7EC3B', line, 2.8) +
          '<path d="M166 199 Q176 207 166 216 M190 199 Q180 207 190 216" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>';
      case 'luu':
        return '<g class="prop" transform="rotate(-12 64 210)"><path d="' + bonePath(64, 210, 46, 17) + '" fill="#FFF8EA" stroke="' + line + '" stroke-width="2.8" stroke-linejoin="round"/></g>';
      case 'sydan':
        return '<g class="prop float"><path d="' + heartPath(188, 64, 2.2) + '" fill="#FF5C8A" stroke="' + line + '" stroke-width="2.4"/>' +
          ellipse(182, 54, 3, 2, '#FFFFFF', null, 0, ' opacity=".8"') + '</g>';
      case 'sukka':
        return '<g class="prop" transform="rotate(-8 60 198)">' +
          '<path d="M52 176 L72 176 L72 204 Q72 214 62 216 L46 219 Q36 220 36 211 Q36 204 46 202 L52 201 Z" fill="#E8435E" stroke="' + line + '" stroke-width="2.6" stroke-linejoin="round"/>' +
          '<rect x="48" y="170" width="28" height="11" rx="5.5" fill="#FFFFFF" stroke="' + line + '" stroke-width="2.6"/>' +
          ellipse(56, 196, 2.5, 2.5, '#FFFFFF') + ellipse(64, 205, 2.5, 2.5, '#FFFFFF') + '</g>';
      case 'ankka':
        return '<g class="prop">' +
          ellipse(180, 210, 16, 11, '#FFD23F', line, 2.6) + ellipse(186, 196, 9, 9, '#FFD23F', line, 2.6) +
          '<path d="M194 196 l9 2 -9 4 Z" fill="#FF9F43" stroke="' + line + '" stroke-width="1.8" stroke-linejoin="round"/>' +
          ellipse(188, 194, 1.8, 1.8, EYE) + '<path d="M172 206 q6 6 12 1" stroke="' + line + '" stroke-width="2" fill="none"/></g>';
      default: return '';
    }
  }

  /* ---------- Taustat ---------- */

  function sceneSvg(kind) {
    switch (kind) {
      case 'ranta':
        return '<rect width="240" height="240" fill="#BFE8FF"/>' + ellipse(196, 46, 20, 20, '#FFE27A') +
          '<path d="M0 150 Q60 140 120 150 T240 148 L240 240 L0 240 Z" fill="#5EC2E8"/>' +
          '<path d="M0 170 Q50 162 110 172 T240 170" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".7"/>' +
          '<path d="M0 196 Q80 184 160 194 T240 190 L240 240 L0 240 Z" fill="#FBE3B0"/>' +
          ellipse(34, 214, 7, 4, '#FFB3C6') + ellipse(214, 222, 5, 3, '#FFFFFF');
      case 'talvi':
        return '<rect width="240" height="240" fill="#D9ECFF"/>' +
          '<path d="M0 180 Q70 160 140 176 T240 170 L240 240 L0 240 Z" fill="#FFFFFF"/>' +
          '<path d="M20 120 l14 -40 14 40 Z M190 128 l12 -36 12 36 Z" fill="#7FB89A"/>' +
          '<path d="M14 136 l20 -44 20 44 Z M184 140 l18 -40 18 40 Z" fill="#5F9F80" opacity=".9"/>' +
          [[30, 30], [80, 18], [140, 40], [210, 22], [110, 70], [60, 80], [220, 90], [170, 74]].map(function (p) {
            return ellipse(p[0], p[1], 3, 3, '#FFFFFF');
          }).join('');
      case 'tahdet':
        return '<rect width="240" height="240" fill="#2B3A67"/>' + ellipse(196, 44, 18, 18, '#FFF1B8') + ellipse(204, 40, 15, 15, '#2B3A67') +
          [[30, 30, 2], [70, 60, 1.5], [120, 24, 2.2], [160, 80, 1.4], [40, 100, 1.6], [220, 110, 2], [100, 90, 1.2], [150, 40, 1.4]].map(function (p) {
            return ellipse(p[0], p[1], p[2], p[2], '#FFFFFF');
          }).join('') +
          '<path d="M0 190 Q120 170 240 190 L240 240 L0 240 Z" fill="#3E7D5B"/>';
      case 'koti':
        return '<rect width="240" height="240" fill="#FFE9D6"/>' +
          '<rect x="22" y="34" width="54" height="44" rx="6" fill="#BFE8FF" stroke="#E7B98C" stroke-width="5"/>' +
          '<path d="M49 34 L49 78 M22 56 L76 56" stroke="#E7B98C" stroke-width="4"/>' +
          '<rect y="176" width="240" height="64" fill="#E7B98C"/>' +
          ellipse(120, 214, 98, 18, '#FF9FB7') + ellipse(120, 214, 78, 12, '#FFC2D1');
      default: /* puisto */
        return '<rect width="240" height="240" fill="#CFEAFF"/>' + ellipse(40, 40, 16, 16, '#FFE27A') +
          ellipse(170, 46, 24, 10, '#FFFFFF') + ellipse(188, 40, 16, 10, '#FFFFFF') +
          '<path d="M0 176 Q60 150 130 168 T240 160 L240 240 L0 240 Z" fill="#7BCB7E"/>' +
          '<path d="M0 196 Q90 180 240 198 L240 240 L0 240 Z" fill="#5DB868"/>' +
          ellipse(28, 168, 16, 12, '#4FA65A') + ellipse(44, 164, 13, 10, '#5DB868') +
          ellipse(214, 172, 4, 4, '#FFFFFF') + ellipse(214, 172, 1.8, 1.8, '#FFD23F') +
          ellipse(26, 206, 4, 4, '#FF9FB7') + ellipse(26, 206, 1.8, 1.8, '#FFFFFF');
    }
  }

  /* ---------- Itse koira ---------- */

  function drawDog(o) {
    o = o || {};
    var c = COATS[o.coat] || COATS.kulta;
    var age = o.age == null ? 2 : o.age;
    var hs = [1.12, 1.07, 1.0, 0.96, 0.96][age];
    var bs = [0.84, 0.9, 0.97, 1.03, 1.03][age];
    var line = c.line, sw = 3;
    var hx = 120, hy = 92 + (1 - hs) * 10, rx = 56 * hs, ry = 49 * hs;
    var bcy = 168, brx = 44 * bs, bry = 42 * bs;
    var face = o.face || 'happy';
    var ears = o.ears || 'luppa';
    var out = [];
    var cls = 'dog' + (o.animate === false ? '' : ' dog-anim');

    out.push('<svg class="' + cls + '" viewBox="' + (o.viewBox || '0 0 240 240') + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (o.label || 'Söpö koiranpentu') + '">');
    if (o.scene) out.push('<g class="scene">' + sceneSvg(o.scene) + '</g>');
    out.push(ellipse(120, 222, 72, 9, 'rgba(31,42,68,.13)'));

    /* häntä */
    out.push('<g class="tail" style="transform-origin:156px 186px">' +
      '<path d="M154 188 Q198 184 192 138" stroke="' + line + '" stroke-width="' + (17 * bs) + '" fill="none" stroke-linecap="round"/>' +
      '<path d="M154 188 Q198 184 192 138" stroke="' + c.base + '" stroke-width="' + (11 * bs) + '" fill="none" stroke-linecap="round"/>' +
      (c.blaze || c.mask ? ellipse(192, 141, 5 * bs, 5 * bs, c.light) : '') +
      '</g>');

    /* takajalat ja vartalo */
    out.push(ellipse(120 - 36 * bs, 194, 24 * bs, 20 * bs, c.base, line, sw));
    out.push(ellipse(120 + 36 * bs, 194, 24 * bs, 20 * bs, c.base, line, sw));
    out.push(ellipse(120 - 44 * bs, 211, 15, 8, c.light === c.base ? c.shade : c.light, line, sw));
    out.push(ellipse(120 + 44 * bs, 211, 15, 8, c.light === c.base ? c.shade : c.light, line, sw));
    out.push(ellipse(120, bcy, brx, bry, c.base, line, sw));
    out.push(ellipse(120, bcy + 6, brx * 0.58, bry * 0.7, c.light));
    if (c.spots) {
      [[96, 150, 7], [146, 172, 6], [104, 190, 5], [150, 150, 4.5], [86, 176, 4]].forEach(function (s) {
        out.push(ellipse(s[0], s[1], s[2], s[2] * 0.9, line));
      });
    }

    /* etujalat */
    [-15, 15].forEach(function (dx) {
      out.push('<rect x="' + n(120 + dx - 11) + '" y="' + n(bcy - 4) + '" width="22" height="' + n(214 - bcy + 4) + '" rx="11" fill="' + c.base + '" stroke="' + line + '" stroke-width="' + sw + '"/>');
      out.push(ellipse(120 + dx, 213, 14, 8.5, c.light === c.base ? c.shade : c.light, line, sw));
      out.push('<path d="M' + n(120 + dx - 4) + ' 209 l0 5 M' + n(120 + dx + 4) + ' 209 l0 5" stroke="' + line + '" stroke-width="2" stroke-linecap="round"/>');
    });

    /* kaulakoru (pään alle) */
    if (o.neck) out.push(neckSvg(o.neck, o.neckColor || '#4F8BFF', hx, hy + ry * 0.9, line));

    /* takakorvat */
    if (ears === 'pysty') {
      [-1, 1].forEach(function (s) {
        var bx1 = hx + s * rx * 0.82, by1 = hy - ry * 0.35;
        var tx = hx + s * rx * 0.68, ty = hy - ry * 1.32;
        var bx2 = hx + s * rx * 0.2, by2 = hy - ry * 0.86;
        out.push('<path d="M' + n(bx1) + ' ' + n(by1) + ' Q' + n(tx + s * 6) + ' ' + n(ty + 4) + ' ' + n(tx) + ' ' + n(ty) + ' Q' + n(tx - s * 10) + ' ' + n(ty + 6) + ' ' + n(bx2) + ' ' + n(by2) + ' Z" fill="' + c.ear + '" stroke="' + line + '" stroke-width="' + sw + '" stroke-linejoin="round"/>');
        out.push('<path d="M' + n(hx + s * rx * 0.7) + ' ' + n(hy - ry * 0.55) + ' Q' + n(tx + s * 2) + ' ' + n(ty + 14) + ' ' + n(tx) + ' ' + n(ty + 12) + ' Q' + n(tx - s * 6) + ' ' + n(ty + 16) + ' ' + n(hx + s * rx * 0.34) + ' ' + n(hy - ry * 0.82) + ' Z" fill="#FFB8C6" opacity=".85"/>');
      });
    } else if (ears === 'nalle') {
      [-1, 1].forEach(function (s) {
        out.push(ellipse(hx + s * rx * 0.74, hy - ry * 0.74, 17 * hs, 17 * hs, c.ear, line, sw));
        out.push(ellipse(hx + s * rx * 0.74, hy - ry * 0.72, 9 * hs, 9 * hs, '#FFC2CF'));
      });
    }

    /* pää */
    out.push('<g class="head">');
    out.push(ellipse(hx, hy, rx, ry, c.base, line, sw));
    if (c.blaze) out.push('<rect x="' + n(hx - 8) + '" y="' + n(hy - ry * 0.95) + '" width="16" height="' + n(ry * 1.2) + '" rx="8" fill="' + c.light + '"/>');
    if (c.mask === 'husky') {
      out.push('<path d="M' + n(hx - rx * 0.86) + ' ' + n(hy + ry * 0.05) + ' Q' + n(hx - rx * 0.5) + ' ' + n(hy - ry * 0.2) + ' ' + n(hx) + ' ' + n(hy - ry * 0.55) +
        ' Q' + n(hx + rx * 0.5) + ' ' + n(hy - ry * 0.2) + ' ' + n(hx + rx * 0.86) + ' ' + n(hy + ry * 0.05) +
        ' Q' + n(hx + rx * 0.8) + ' ' + n(hy + ry * 0.9) + ' ' + n(hx) + ' ' + n(hy + ry * 0.98) + ' Q' + n(hx - rx * 0.8) + ' ' + n(hy + ry * 0.9) + ' ' + n(hx - rx * 0.86) + ' ' + n(hy + ry * 0.05) + ' Z" fill="' + c.light + '"/>');
    }
    if (c.spots) {
      [[hx - rx * 0.5, hy - ry * 0.55, 6], [hx + rx * 0.62, hy - ry * 0.2, 5], [hx + rx * 0.3, hy - ry * 0.72, 4]].forEach(function (s) {
        out.push(ellipse(s[0], s[1], s[2], s[2] * 0.9, line));
      });
    }
    if (o.eyePatch) out.push(ellipse(hx + rx * 0.38, hy + ry * 0.04, 17 * hs, 15 * hs, c.shade === c.base ? c.ear : c.ear));
    out.push(ellipse(hx, hy + ry * 0.4, rx * 0.5, ry * 0.38, c.light));

    /* silmät */
    var ex = rx * 0.38, ey = hy + ry * 0.06, er = (age === 0 ? 1.15 : 1) * hs;
    function openEye(x) {
      return '<g class="eye" style="transform-origin:' + n(x) + 'px ' + n(ey) + 'px">' +
        ellipse(x, ey, 8.6 * er, 10.6 * er, EYE) +
        ellipse(x + 2.8 * er, ey - 3.8 * er, 3.5 * er, 3.5 * er, '#FFFFFF') +
        ellipse(x - 2.8 * er, ey + 3.6 * er, 1.6 * er, 1.6 * er, '#FFFFFF', null, 0, ' opacity=".9"') + '</g>';
    }
    function happyEye(x) {
      return '<path d="M' + n(x - 8 * er) + ' ' + n(ey + 3) + ' Q' + n(x) + ' ' + n(ey - 9 * er) + ' ' + n(x + 8 * er) + ' ' + n(ey + 3) + '" stroke="' + EYE + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
    }
    if (o.hat !== 'lasit') {
      if (face === 'joy') { out.push(happyEye(hx - ex)); out.push(happyEye(hx + ex)); }
      else if (face === 'wink') { out.push(openEye(hx - ex)); out.push(happyEye(hx + ex)); }
      else { out.push(openEye(hx - ex)); out.push(openEye(hx + ex)); }
    }
    if (face === 'think') {
      out.push('<path d="M' + n(hx - ex - 9) + ' ' + n(ey - 16) + ' q9 -5 17 0 M' + n(hx + ex - 8) + ' ' + n(ey - 18) + ' q9 3 17 -1" stroke="' + line + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>');
    }

    /* posket, kirsu, suu */
    out.push(ellipse(hx - rx * 0.64, hy + ry * 0.36, 9, 5.5, BLUSH, null, 0, ' opacity=".5"'));
    out.push(ellipse(hx + rx * 0.64, hy + ry * 0.36, 9, 5.5, BLUSH, null, 0, ' opacity=".5"'));
    var ny = hy + ry * 0.3;
    out.push('<path d="M' + n(hx - 9) + ' ' + n(ny - 3) + ' Q' + n(hx) + ' ' + n(ny - 8) + ' ' + n(hx + 9) + ' ' + n(ny - 3) + ' Q' + n(hx + 9) + ' ' + n(ny + 4) + ' ' + n(hx) + ' ' + n(ny + 7) + ' Q' + n(hx - 9) + ' ' + n(ny + 4) + ' ' + n(hx - 9) + ' ' + n(ny - 3) + ' Z" fill="' + EYE + '"/>');
    out.push(ellipse(hx - 3, ny - 3, 3, 1.6, '#FFFFFF', null, 0, ' opacity=".7"'));
    if (face === 'joy' || face === 'tongue' || face === 'wink') {
      out.push('<path d="M' + n(hx - 10) + ' ' + n(ny + 10) + ' Q' + n(hx) + ' ' + n(ny + 26) + ' ' + n(hx + 10) + ' ' + n(ny + 10) + ' Z" fill="#7A2E3A" stroke="' + EYE + '" stroke-width="2.5" stroke-linejoin="round"/>');
      out.push('<path d="M' + n(hx - 6) + ' ' + n(ny + 15) + ' Q' + n(hx - 7) + ' ' + n(ny + 27) + ' ' + n(hx) + ' ' + n(ny + 27) + ' Q' + n(hx + 7) + ' ' + n(ny + 27) + ' ' + n(hx + 6) + ' ' + n(ny + 15) + ' Z" fill="' + TONGUE + '"/>');
      out.push('<path d="M' + n(hx) + ' ' + n(ny + 7) + ' L' + n(hx) + ' ' + n(ny + 10) + '" stroke="' + EYE + '" stroke-width="3" stroke-linecap="round"/>');
    } else if (face === 'think') {
      out.push('<path d="M' + n(hx) + ' ' + n(ny + 7) + ' L' + n(hx) + ' ' + n(ny + 11) + ' M' + n(hx - 6) + ' ' + n(ny + 14) + ' Q' + n(hx) + ' ' + n(ny + 11) + ' ' + n(hx + 7) + ' ' + n(ny + 13) + '" stroke="' + EYE + '" stroke-width="3" fill="none" stroke-linecap="round"/>');
    } else {
      out.push('<path d="M' + n(hx) + ' ' + n(ny + 7) + ' L' + n(hx) + ' ' + n(ny + 11) + ' M' + n(hx - 10) + ' ' + n(ny + 10) + ' Q' + n(hx - 5) + ' ' + n(ny + 16) + ' ' + n(hx) + ' ' + n(ny + 11) + ' Q' + n(hx + 5) + ' ' + n(ny + 16) + ' ' + n(hx + 10) + ' ' + n(ny + 10) + '" stroke="' + EYE + '" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>');
    }

    /* luppakorvat pään päälle */
    if (ears === 'luppa') {
      [-1, 1].forEach(function (s) {
        var ecx = hx + s * rx * 0.86, ecy = hy - ry * 0.02;
        out.push('<g class="ear" style="transform-origin:' + n(hx + s * rx * 0.7) + 'px ' + n(hy - ry * 0.6) + 'px">' +
          '<ellipse cx="' + n(ecx) + '" cy="' + n(ecy) + '" rx="' + n(17 * hs) + '" ry="' + n(33 * hs) + '" fill="' + c.ear + '" stroke="' + line + '" stroke-width="' + sw + '" transform="rotate(' + (s * 16) + ' ' + n(ecx) + ' ' + n(ecy) + ')"/></g>');
      });
    }
    out.push('</g>');

    if (o.hat) out.push(hatSvg(o.hat, hx, hy, rx, ry, line));
    if (o.prop) out.push(propSvg(o.prop, line));
    out.push('</svg>');
    return out.join('');
  }

  /* Satunnainen palkintopentu */
  var HATS = ['', '', 'rusetti', 'kruunu', 'kukat', 'juhlahattu', 'pipo', 'lasit'];
  var NECKS = ['', 'panta', 'huivi', 'kaulaliina'];
  var NECK_COLORS = ['#4F8BFF', '#FF5C8A', '#2FBF71', '#B98CFF', '#FF9F43', '#E8435E'];
  var PROPS = ['', 'pallo', 'luu', 'sydan', 'sukka', 'ankka'];
  var FACES = ['happy', 'joy', 'tongue', 'wink', 'joy', 'happy'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function randomDogOptions() {
    var coats = Object.keys(COATS);
    return {
      coat: pick(coats),
      ears: pick(Object.keys(EARS)),
      age: pick([0, 0, 1, 1, 2]),
      face: pick(FACES),
      hat: pick(HATS),
      neck: pick(NECKS),
      neckColor: pick(NECK_COLORS),
      prop: pick(PROPS),
      eyePatch: Math.random() < 0.15
    };
  }

  /* ---------- Pienet ikonit ---------- */

  var ICONS = {
    bone: function (cls) {
      return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 48 24" aria-hidden="true"><path d="' + bonePath(24, 12, 44, 18) + '" fill="#FFF6E2" stroke="#7A5232" stroke-width="2.6" stroke-linejoin="round"/></svg>';
    },
    paw: function (cls, color) {
      color = color || 'currentColor';
      return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 40 40" aria-hidden="true"><g fill="' + color + '">' +
        '<ellipse cx="20" cy="27" rx="10" ry="8.5"/><ellipse cx="9" cy="16" rx="4.6" ry="5.8"/><ellipse cx="17" cy="9.5" rx="4.6" ry="6"/>' +
        '<ellipse cx="26" cy="9.5" rx="4.6" ry="6"/><ellipse cx="33" cy="16.5" rx="4.6" ry="5.8"/></g></svg>';
    },
    heart: function (cls) {
      return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 30 30" aria-hidden="true"><path d="' + heartPath(15, 16, 1.5) + '" fill="#FF5C8A"/></svg>';
    },
    rosette: function (tier, cls) {
      var col = { 3: ['#FFCC33', '#F2A900'], 2: ['#D7E0EA', '#A9B6C4'], 1: ['#F2A877', '#D37B45'] }[tier] || ['#E8EEF5', '#C9D4E0'];
      var petals = '';
      for (var i = 0; i < 12; i++) {
        var a = i * Math.PI / 6;
        petals += ellipse(30 + Math.cos(a) * 15, 26 + Math.sin(a) * 15, 7, 7, col[1]);
      }
      return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 60 70" aria-hidden="true">' +
        '<path d="M20 36 L12 66 L21 60 L26 68 L30 38 Z" fill="' + (tier ? '#4F8BFF' : '#D5DEE8') + '"/>' +
        '<path d="M40 36 L48 66 L39 60 L34 68 L30 38 Z" fill="' + (tier ? '#FF5C8A' : '#D5DEE8') + '"/>' +
        petals + ellipse(30, 26, 16, 16, col[0], tier ? '#FFFFFF' : '#C9D4E0', 3) +
        (tier ? '<text x="30" y="32" text-anchor="middle" font-size="17" font-weight="800" fill="#FFFFFF" font-family="Baloo 2, sans-serif">' + tier + '</text>' : '') +
        '</svg>';
    },
    star: function (cls, on) {
      return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="' + (on ? '#FFCC33' : '#DCE5EF') + '" stroke="' + (on ? '#E0A800' : '#C3CFDC') + '" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    },
    die: function (v, cls) {
      var pts = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] }[v] || [];
      return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 60 60" aria-hidden="true"><rect x="4" y="4" width="52" height="52" rx="12" fill="#FFFFFF" stroke="#1F2A44" stroke-width="3"/>' +
        pts.map(function (p) { return ellipse(30 + p[0] * 13, 30 + p[1] * 13, 5.2, 5.2, '#1F2A44'); }).join('') + '</svg>';
    },
    brush: function (cls) { /* hoito */
      return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="13" width="18" height="8" rx="4" fill="#7FD1FF" stroke="#1F2A44" stroke-width="2"/><path d="M7 21v5M11 21v5M15 21v5M19 21v5" stroke="#1F2A44" stroke-width="2" stroke-linecap="round"/><rect x="20" y="14" width="10" height="5" rx="2.5" fill="#FF9FB7" stroke="#1F2A44" stroke-width="2"/></svg>';
    },
    whistle: function (cls) { /* kasvatus */
      return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 20a7 7 0 1 0 14 0a7 7 0 0 0-1-3.6L27 11V7H14a7 7 0 0 0-9 13z" fill="#FFD23F" stroke="#1F2A44" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="20" r="2.6" fill="#1F2A44"/></svg>';
    },
    ball: function (cls) { /* leikki */
      return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="12" fill="#D7EC3B" stroke="#1F2A44" stroke-width="2"/><path d="M7 8q8 8 0 16M25 8q-8 8 0 16" stroke="#FFFFFF" stroke-width="2.4" fill="none"/></svg>';
    }
  };

  /* Agility-esteet treenipolun asemille */
  var OBSTACLES = {
    hyppy: '<rect x="10" y="18" width="5" height="34" rx="2" fill="#FFFFFF" stroke="#1F2A44" stroke-width="2.5"/><rect x="49" y="18" width="5" height="34" rx="2" fill="#FFFFFF" stroke="#1F2A44" stroke-width="2.5"/><rect x="8" y="27" width="48" height="6" rx="3" fill="#FF5C8A" stroke="#1F2A44" stroke-width="2.5"/>',
    tunneli: '<path d="M8 50 L8 34 Q8 14 32 14 Q56 14 56 34 L56 50 Z" fill="#4F8BFF" stroke="#1F2A44" stroke-width="2.5"/><path d="M18 50 L18 36 Q18 24 32 24 Q46 24 46 36 L46 50 Z" fill="#1F2A44"/><path d="M8 34h48" stroke="#FFFFFF" stroke-width="2" opacity=".6"/>',
    kepit: '<path d="M8 52h48" stroke="#1F2A44" stroke-width="3" stroke-linecap="round"/>' + [12, 22, 32, 42, 52].map(function (x, i) { return '<rect x="' + (x - 2.5) + '" y="12" width="5" height="40" rx="2.5" fill="' + (i % 2 ? '#FFD23F' : '#FFFFFF') + '" stroke="#1F2A44" stroke-width="2"/>'; }).join(''),
    rengas: '<rect x="30" y="38" width="4" height="16" fill="#1F2A44"/><circle cx="32" cy="26" r="16" fill="none" stroke="#1F2A44" stroke-width="9"/><circle cx="32" cy="26" r="16" fill="none" stroke="#FF9F43" stroke-width="5"/>',
    keinu: '<path d="M32 40 L24 54 L40 54 Z" fill="#FFD23F" stroke="#1F2A44" stroke-width="2.5" stroke-linejoin="round"/><rect x="4" y="30" width="56" height="8" rx="3" fill="#2FBF71" stroke="#1F2A44" stroke-width="2.5" transform="rotate(-12 32 34)"/>',
    pallo: '<circle cx="32" cy="32" r="18" fill="#D7EC3B" stroke="#1F2A44" stroke-width="2.5"/><path d="M19 20q12 12 0 24M45 20q-12 12 0 24" stroke="#FFFFFF" stroke-width="3" fill="none"/>',
    luu: '<path d="' + bonePath(32, 32, 50, 20) + '" fill="#FFF6E2" stroke="#1F2A44" stroke-width="2.5"/>',
    nuuhku: '<path d="M14 46 Q32 8 50 46 Z" fill="#B98CFF" stroke="#1F2A44" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="30" r="5" fill="#FFF3A6" stroke="#1F2A44" stroke-width="2"/>',
    kartio: '<path d="M32 10 L46 50 L18 50 Z" fill="#FF9F43" stroke="#1F2A44" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 34h16M21 42h22" stroke="#FFFFFF" stroke-width="3"/><rect x="12" y="50" width="40" height="5" rx="2" fill="#FF9F43" stroke="#1F2A44" stroke-width="2.5"/>',
    pöytä: '<rect x="10" y="24" width="44" height="8" rx="2" fill="#2FBF71" stroke="#1F2A44" stroke-width="2.5"/><path d="M15 32v20M49 32v20" stroke="#1F2A44" stroke-width="3.5" stroke-linecap="round"/>',
    a: '<path d="M6 54 L32 12 L58 54" fill="#FFD23F" stroke="#1F2A44" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 33 L45 33" stroke="#FF5C8A" stroke-width="4"/>',
    koodi: '<rect x="12" y="14" width="40" height="36" rx="6" fill="#FFFFFF" stroke="#1F2A44" stroke-width="2.5"/><text x="32" y="38" text-anchor="middle" font-size="16" font-weight="800" fill="#4F8BFF" font-family="Baloo 2, sans-serif">A=1</text>',
    viivat: '<g transform="rotate(25 32 32)"><path d="M12 26h40M12 34h40" stroke="#FF5C8A" stroke-width="3"/><path d="M20 14v36M26 14v36M38 14v36M44 14v36" stroke="#1F2A44" stroke-width="2.5"/></g>',
    pokaali: '<path d="M20 12h24v10a12 12 0 0 1-24 0z" fill="#FFCC33" stroke="#1F2A44" stroke-width="2.5"/><path d="M20 16h-6a6 6 0 0 0 6 8M44 16h6a6 6 0 0 1-6 8" fill="none" stroke="#1F2A44" stroke-width="2.5"/><path d="M32 34v8M24 50h16l-2-8H26z" fill="#FFCC33" stroke="#1F2A44" stroke-width="2.5" stroke-linejoin="round"/>'
  };

  function obstacle(kind) {
    return '<svg class="obstacle" viewBox="0 0 64 64" aria-hidden="true">' + (OBSTACLES[kind] || OBSTACLES.hyppy) + '</svg>';
  }

  function stageFor(stars) {
    var s = 0;
    for (var i = 0; i < STAGES.length; i++) if (stars >= STAGES[i].min) s = i;
    return s;
  }

  global.TT_DOGS = {
    COATS: COATS, EARS: EARS, STAGES: STAGES,
    drawDog: drawDog, randomDogOptions: randomDogOptions,
    ICONS: ICONS, obstacle: obstacle, sceneSvg: sceneSvg, stageFor: stageFor,
    heartPath: heartPath, bonePath: bonePath
  };
})(typeof window !== 'undefined' ? window : globalThis);
