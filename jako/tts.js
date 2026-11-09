/* Jakotreeni – ääniselitys
   - ElevenLabs-ääni haetaan VAIN, kun lapsi painaa selitysnappia.
   - Valmis äänite tallennetaan laitteen välimuistiin, joten samaa selitystä ei makseta kahdesti.
   - Ilman avainta tai virhetilanteessa käytetään selaimen omaa suomenkielistä puhetta.
   - speak() palauttaa lupauksen, joka täyttyy AINA: kun puhe loppuu, kun se pysäytetään
     tai kun ääni ei toimi (esim. iPadin toistorajoitus). Näin selitysteksti ei voi jäädä piiloon. */
(function (global) {
  'use strict';
  var CFG = global.JT_TTS || {};
  var VOICE = CFG.voice || '8X97zFR9k9pK2xyFI7Nr';
  var MODEL = CFG.model || 'eleven_multilingual_v2';
  var KEY = CFG.key || '';
  var CACHE = 'jakotreeni-tts-v1';
  /* Lyhyt hiljainen ääni iPadin toistoluvan "avaamiseen" napin painalluksen aikana */
  var SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
  var memo = {}, listeners = [], player = null, job = null, seq = 0;

  function emit(state, text) { listeners.forEach(function (f) { try { f(state, text); } catch (e) { /* ok */ } }); }

  /* Muuttaa näytettävän tekstin puhuttavaksi: symbolit sanoiksi, luvut yhteen. */
  function speakable(text) {
    var t = String(text)
      .replace(/<span class="frac"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, ' $1 jaettuna $2 ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/(\d)[   ](?=\d{3}\b)/g, '$1');
    t = t.replace(/(\d)\s*:\s*(\d)/g, '$1 jaettuna $2')
      .replace(/\s*·\s*/g, ' kertaa ')
      .replace(/\s*[−–]\s*(?=\d)/g, ' miinus ')
      .replace(/\s*\+\s*/g, ' plus ')
      .replace(/\s*=\s*/g, ' on ')
      .replace(/€/g, ' euroa')
      .replace(/\s+:\s+(?=\d)/g, ' jaettuna ')
      .replace(/[  ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return t;
  }

  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36) + '-' + s.length;
  }
  function cacheGet(id) {
    if (memo[id]) return Promise.resolve(memo[id]);
    try {
      if (!global.caches) return Promise.resolve(null);
      return caches.open(CACHE).then(function (c) { return c.match('/tts/' + id); }).then(function (r) { return r ? r.blob() : null; }).catch(function () { return null; });
    } catch (e) { return Promise.resolve(null); }
  }
  function cachePut(id, blob) {
    memo[id] = blob;
    try { if (global.caches) caches.open(CACHE).then(function (c) { return c.put('/tts/' + id, new Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } })); }).catch(function () { /* ok */ }); } catch (e) { /* ok */ }
  }
  function fetchVoice(text) {
    return fetch('https://api.elevenlabs.io/v1/text-to-speech/' + VOICE + '?output_format=mp3_44100_64', {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({ text: text, model_id: MODEL, voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true } })
    }).then(function (r) { if (!r.ok) throw new Error('ElevenLabs ' + r.status); return r.blob(); });
  }

  function getPlayer() {
    if (!player) { try { player = new Audio(); player.preload = 'auto'; } catch (e) { player = null; } }
    return player;
  }

  /* Yksi puhetyö kerrallaan. finish() täyttää lupauksen täsmälleen kerran. */
  function newJob(text) {
    var j = { id: ++seq, text: text, done: false, timers: [], url: null };
    j.promise = new Promise(function (res) { j.resolve = res; });
    j.finish = function (state) {
      if (j.done) return;
      j.done = true;
      j.timers.forEach(clearTimeout);
      if (j.url) { try { URL.revokeObjectURL(j.url); } catch (e) { /* ok */ } }
      if (job === j) job = null;
      emit(state || 'idle', text);
      j.resolve();
    };
    j.later = function (ms, fn) { j.timers.push(setTimeout(fn, ms)); };
    return j;
  }

  function stop() {
    var p = player;
    if (p) { try { p.pause(); p.onended = p.onerror = p.onplaying = null; } catch (e) { /* ok */ } }
    try { if (global.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* ok */ }
    if (job) job.finish('idle'); else emit('idle');
  }

  function browserSpeak(j) {
    try {
      if (!global.speechSynthesis || !global.SpeechSynthesisUtterance) return j.finish('error');
      var u = new SpeechSynthesisUtterance(j.text);
      u.lang = 'fi-FI'; u.rate = 0.92; u.pitch = 1.05;
      var voices = speechSynthesis.getVoices().filter(function (v) { return /^fi/i.test(v.lang); });
      if (voices.length) u.voice = voices[0];
      u.onstart = function () { if (!j.done) emit('playing', j.text); };
      u.onend = function () { j.finish('idle'); };
      u.onerror = function () { j.finish('error'); };
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
      /* Jos laite ei puhu (esim. iPadin rajoitus), tekstiä ei jätetä piiloon */
      j.later(2500, function () { try { if (!speechSynthesis.speaking && !speechSynthesis.pending) j.finish('error'); } catch (e) { j.finish('error'); } });
      j.later(j.text.length * 110 + 6000, function () { j.finish('idle'); });
    } catch (e) { j.finish('error'); }
  }

  function playBlob(j, blob) {
    var p = getPlayer();
    if (!p) return browserSpeak(j);
    try {
      j.url = URL.createObjectURL(blob);
      p.onended = function () { if (job === j && p.src === j.url) j.finish('idle'); };
      p.onerror = function () { if (job === j && !j.done && p.src === j.url) browserSpeak(j); };
      p.onplaying = function () {
        if (job !== j || j.done || p.src !== j.url) return;
        emit('playing', j.text);
        var dur = isFinite(p.duration) && p.duration > 0 ? p.duration * 1000 : j.text.length * 110;
        j.later(dur + 4000, function () { j.finish('idle'); });
      };
      p.src = j.url;
      var pr = p.play();
      if (pr && pr.catch) pr.catch(function () { if (job === j && !j.done) browserSpeak(j); });
    } catch (e) { browserSpeak(j); }
  }

  /* Pääfunktio. Kutsu napin painalluksesta. */
  function speak(raw) {
    var text = speakable(raw);
    if (!text) return Promise.resolve();
    if (job && job.text === text) { stop(); return Promise.resolve(); } // toinen painallus = lopeta
    stop();
    var j = job = newJob(text);
    emit('loading', text);
    /* iPad sallii äänen vain suoraan painalluksesta: avataan soitin heti hiljaisella äänellä */
    var p = getPlayer();
    if (p) { try { p.src = SILENT; var u = p.play(); if (u && u.catch) u.catch(function () { /* ok */ }); } catch (e) { /* ok */ } }
    /* Jos mikään ei käynnisty 15 sekunnissa, näytetään teksti joka tapauksessa */
    j.later(15000, function () { if (job === j) j.finish('error'); });
    var id = hash(VOICE + MODEL + text);
    cacheGet(id).then(function (blob) {
      if (job !== j || j.done) return;
      if (blob) return playBlob(j, blob);
      if (!KEY) return browserSpeak(j);
      return fetchVoice(text).then(function (b) { cachePut(id, b); if (job === j && !j.done) playBlob(j, b); });
    }).catch(function () { if (job === j && !j.done) browserSpeak(j); });
    return j.promise;
  }

  global.JT_TTS_API = {
    speak: speak, stop: stop, speakable: speakable,
    hasVoice: function () { return !!KEY; },
    available: function () { return !!KEY || !!global.speechSynthesis; },
    on: function (f) { listeners.push(f); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
