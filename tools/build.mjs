// Rakentaa julkaistavan sivuston kansioon _site:
// 1) kopioi pelit, 2) lisää ElevenLabs-asetukset Jakotreeniin,
// 3) salaa kaikki HTML-sivut salasanalla (StatiCrypt).
// Salasana ja avain luetaan ympäristömuuttujista, jotka GitHub Actions
// hakee repon secreteistä: SITE_PASSWORD ja ELEVENLABS_API_KEY.
import { cpSync, rmSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT = join(ROOT, '_site');
const SKIP = new Set(['.git', '.github', 'tools', '_site', 'node_modules', 'README.md', '.staticrypt.json']);

const password = process.env.SITE_PASSWORD || '';
const ttsKey = process.env.ELEVENLABS_API_KEY || '';
const voice = process.env.ELEVENLABS_VOICE_ID || '8X97zFR9k9pK2xyFI7Nr';
const model = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';

if (!password) {
  console.error('VIRHE: SITE_PASSWORD puuttuu. Lisää se repon asetuksiin: Settings → Secrets and variables → Actions → New repository secret.');
  console.error('Sivustoa ei julkaista ilman salasanaa, jotta mikään ei päädy nettiin suojaamattomana.');
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const name of readdirSync(ROOT)) {
  if (SKIP.has(name) || name.startsWith('.')) continue;
  cpSync(join(ROOT, name), join(OUT, name), { recursive: true });
}

// ElevenLabs-asetukset Jakotreenin sivulle. Sivu salataan seuraavassa vaiheessa,
// joten avain näkyy vain salasanan tietäville.
const jakoHtml = join(OUT, 'jako', 'index.html');
const cfg = { voice, model };
if (ttsKey) cfg.key = ttsKey;
const tag = '<script>window.JT_TTS = ' + JSON.stringify(cfg).replace(/</g, '\\u003c') + ';</script>';
const html = readFileSync(jakoHtml, 'utf8');
if (!html.includes('<!--JT_TTS_CONFIG-->')) { console.error('VIRHE: JT_TTS_CONFIG-paikkaa ei löytynyt jako/index.html-tiedostosta.'); process.exit(1); }
writeFileSync(jakoHtml, html.replace('<!--JT_TTS_CONFIG-->', tag));
console.log(ttsKey ? 'ElevenLabs-avain lisätty (salataan).' : 'ELEVENLABS_API_KEY puuttuu: selitysnappi käyttää laitteen omaa puheääntä.');

// Salaa kaikki HTML-sivut samalla salasanalla ja suolalla, jolloin
// "Muista minut" avaa kaikki sivut yhdellä kirjautumisella.
const htmlFiles = [];
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p); else if (n.endsWith('.html')) htmlFiles.push(relative(ROOT, p));
  }
})(OUT);

const args = [
  // Juurikansio on syötekansion yläkansio, joten '_site' + '-d .' kirjoittaa salatut sivut paikalleen.
  '--yes', 'staticrypt@3.5.4', '_site', '-r',
  '--short', '--remember', '30', '-d', '.', '--config', 'false',
  '-s', process.env.STATICRYPT_SALT || 'b4f2a7c1d9e83f60a1b2c3d4e5f60718',
  '--template-title', 'Tassutreeni',
  '--template-instructions', 'Kirjoita salasana, niin pääset treenaamaan.',
  '--template-button', 'Avaa',
  '--template-placeholder', 'Salasana',
  '--template-remember', 'Muista minut tällä laitteella',
  '--template-error', 'Väärä salasana. Kokeile uudelleen.',
  '--template-toggle-show', 'Näytä salasana',
  '--template-toggle-hide', 'Piilota salasana',
  '--template-color-primary', '#2BB3A3',
  '--template-color-secondary', '#E7F6F1'
];
execFileSync('npx', args, { stdio: 'inherit', cwd: ROOT, env: { ...process.env, STATICRYPT_PASSWORD: password } });

// Tarkistus: mikään HTML ei saa sisältää avainta tai salaamatonta pelisisältöä.
for (const f of htmlFiles) {
  const out = readFileSync(join(ROOT, f), 'utf8');
  if (ttsKey && out.includes(ttsKey)) { console.error('VIRHE: avain näkyy salaamattomana tiedostossa ' + f); process.exit(1); }
  if (!out.includes('staticrypt')) { console.error('VIRHE: tiedosto ei ole salattu: ' + f); process.exit(1); }
}
console.log('Valmis: ' + htmlFiles.length + ' sivua salattu kansioon _site.');
