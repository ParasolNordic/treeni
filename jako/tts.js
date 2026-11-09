/* Jakotreeni – ääniselitys
   - ElevenLabs-ääni haetaan VAIN, kun lapsi painaa selitysnappia.
   - Valmis äänite tallennetaan laitteen välimuistiin, joten samaa selitystä ei makseta kahdesti.
   - Ilman avainta tai virhetilanteessa käytetään selaimen omaa suomenkielistä puhetta. */
(function (global) {
  'use strict';
  var CFG = global.JT_TTS || {};
  var VOICE = CFG.voice || '8X97zFR9k9pK2xyFI7Nr';
  var MODEL = CFG.model || 'eleven_multilingual_v2';
  var KEY = CFG.key || '';
  var CACHE = 'jakotreeni-tts-v1';
  var memo = {};
  var audio = null, current = null, listeners = [];

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
    if (!global.caches) return Promise.resolve(null);
    return caches.open(CACHE).then(function (c) { return c.match('/tts/' + id); }).then(function (r) { return r ? r.blob() : null; }).catch(function () { return null; });
  }
  function cachePut(id, blob) {
    memo[id] = blob;
    if (!global.caches) return;
    caches.open(CACHE).then(function (c) { return c.put('/tts/' + id, new Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } })); }).catch(function () { /* ok */ });
  }

  function fetchVoice(text) {
    return fetch('https://api.elevenlabs.io/v1/text-to-speech/' + VOICE + '?output_format=mp3_44100_64', {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({ text: text, model_id: MODEL, voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true } })
    }).then(function (r) {
      if (!r.ok) throw new Error('ElevenLabs ' + r.status);
      return r.blob();
    });
  }

  function browserSpeak(text) {
    return new Promise(function (resolve, reject) {
      if (!global.speechSynthesis || !global.SpeechSynthesisUtterance) return reject(new Error('no speech'));
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'fi-FI'; u.rate = 0.92; u.pitch = 1.05;
      var voices = speechSynthesis.getVoices().filter(function (v) { return /^fi/i.test(v.lang); });
      if (voices.length) u.voice = voices[0];
      u.onend = function () { resolve(); };
      u.onerror = function (e) { reject(e); };
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
      current = { browser: true };
    });
  }

  function stop() {
    if (audio) { try { audio.pause(); } catch (e) { /* ok */ } audio = null; }
    if (global.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) { /* ok */ }
    current = null;
    emit('idle');
  }

  function playBlob(blob, text) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(blob);
      audio = new Audio(url);
      audio.onended = function () { URL.revokeObjectURL(url); audio = null; current = null; emit('idle', text); resolve(); };
      audio.onerror = function () { URL.revokeObjectURL(url); reject(new Error('play')); };
      audio.play().then(function () { emit('playing', text); }).catch(reject);
    });
  }

  /* Pääfunktio: palauttaa lupauksen, joka täyttyy kun puhe on päättynyt. */
  function speak(raw) {
    var text = speakable(raw);
    if (!text) return Promise.resolve();
    if (current && current.text === text) { stop(); return Promise.resolve(); }
    stop();
    current = { text: text };
    var id = hash(VOICE + MODEL + text);
    emit('loading', text);
    return cacheGet(id).then(function (blob) {
      if (blob) return playBlob(blob, text);
      if (!KEY) throw new Error('no key');
      return fetchVoice(text).then(function (b) { cachePut(id, b); if (current && current.text === text) return playBlob(b, text); });
    }).catch(function () {
      if (!current || current.text !== text) return;
      emit('playing', text);
      return browserSpeak(text).then(function () { current = null; emit('idle', text); }, function () { current = null; emit('error', text); });
    });
  }

  global.JT_TTS_API = {
    speak: speak, stop: stop, speakable: speakable,
    hasVoice: function () { return !!KEY; },
    available: function () { return !!KEY || !!global.speechSynthesis; },
    on: function (f) { listeners.push(f); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
