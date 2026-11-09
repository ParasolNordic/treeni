# Tassutreeni

Koiranpentuteemainen matematiikan harjoituspeli 4. luokan kokeeseen (luvut 0–10 000, allekkain laskut, kertolaskut, laskujärjestys, sanatehtävät ja päättely).

**Pelaa:** https://parasolnordic.github.io/treeni/

- **Treenipolku:** 18 estettä, yksi jokaista kokeen aihetta varten. Jokaisella tasolla on 8 tehtävää, jotka vaikeutuvat loppua kohden.
- **Palkinto:** Jokaisesta oikeasta vastauksesta saa söpön koirakuvan ja yhden lauseen vinkin koiran hoidosta, kasvatuksesta tai leikistä.
- **Koiranäyttely:** Harjoituskoe, jossa on 20 tehtävää ja arvosana (ERI, EH, H tai T).
- **Leikkipuisto:** Kirjan noppapelit Lähelle tuhatta ja Tavoitteena 100.
- **Herkkukauppa:** Luilla voi ostaa pennulle asusteita.

Peli toimii selaimessa ilman asennusta, ja edistyminen tallentuu laitteelle.

## Saksan harjoituskoe

**Pelaa:** https://parasolnordic.github.io/treeni/saksa/

- Oppikirja: *Die Deutschprofis A2*, Lektion 2 *Meine Freunde*.
- 20 kysymystä, automaattinen pisteytys, vastaukset ja suomenkieliset selitykset.
- Sanasto, *weil*-sivulauseet, Perfekt ja luetun ymmärtäminen.
- Ajastin, tulostus, kirjoitusbonus ja paras tulos laitteella.
- Itsenäinen harjoitusmateriaali, ei koulun tai kustantajan virallinen koe.

## Saksan harjoituskoe 2 – kirjan kielioppisivujen mukaan

**Pelaa:** https://parasolnordic.github.io/treeni/saksa/koe2/

- 37 pisteytettävää tehtävää (25 minuutin ajastin), joista useissa kirjoitetaan oikea Perfekt-muoto itse.
- Weil-lauseet ja verbin paikka; haben/sein-apuverbit eri persoonissa.
- Kirjan Perfekt-verbit (säännölliset ja epäsäännölliset), mukaan lukien *fragen, reden, wechseln, weinen, wohnen, gefallen, reiten, helfen, streiten*.
- Kirjan erotettavat verbit: *anfangen, anmelden, anrufen, einladen, kennenlernen, mitfahren, umziehen*.
- *Woher? / Wo?*: *aus/in*, *aus der/in der*, *aus den/in den* mm. Sveitsi, Turkki ja USA.
- Aukeava kertauslista sisältää kaikki kuvissa näkyvät Perfekt-muodot ja maiden rakenteet.
- Automaattinen pisteytys, suomenkieliset selitykset, tulostus ja oma ennätys paikallisesti.

Harjoitus on itsenäisesti laadittu käyttäjän lähettämien kirjansivujen perusteella; ei koulun virallinen koe. Alkuperäinen saksan harjoituskoe 1 säilyy osoitteessa `/treeni/saksa/` ja matematiikkapeli etusivulla.

## Jakotreeni – jakolaskukoe (luvut 31–37)

**Pelaa:** https://parasolnordic.github.io/treeni/jako/

- 15 treenipolun estettä: kertotaulun jakolaskut, jakaminen 10:llä/100:lla/1000:lla, pyöreät luvut, lukuyksiköittäin ja osittain jakaminen (2- ja 3-numeroiset), jakojäännös ja tarkistus, yhdistäminen, laskujärjestys, sanatehtävät, puuttuva luku, jaollisuus, päättely, huolimattomuusvirheen etsintä ja ★★★-tähtitehtävät.
- Jokaisessa tehtävässä on tekstivihje ja **Selitä**-nappi: 2–3 lauseen opastus luetaan ElevenLabs-äänellä vain napista. Kerran haettu ääni tallentuu laitteelle.
- **Virhetutka** tunnistaa virhepatternit (esim. unohtunut nolla, jakamatta jäänyt osa, liian suuri jäännös) ja kertoo, mitä treenata.
- **Jakokoe**: 20 tehtävää, tarkistussivu ennen palautusta ja arvosana-arvio 4–10.
- Pentue kasvaa treenatessa, ja leikkipuistossa on kirjan noppa- ja kalastuspelit.

## Julkaisu ja salasanasuojaus

Sivusto julkaistaan GitHub Actionsilla (`.github/workflows/pages.yml`). Työnkulku lukee repon secreteistä:

| Secret | Mihin |
| --- | --- |
| `SITE_PASSWORD` | Salasana, jolla kaikki sivut avataan (StatiCrypt-salaus). Pakollinen. |
| `ELEVENLABS_API_KEY` | Jakotreenin selitysääni. Vapaaehtoinen – ilman avainta käytetään laitteen omaa puheääntä. |

Pages-asetuksissa lähteeksi pitää valita **GitHub Actions**.
