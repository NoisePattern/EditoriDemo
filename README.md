# EditoriDemo

Editoridemo on JavaScriptillä kirjoitettu canvas-pohjainen editori. Editori antaa säädettävissä olevan editointialueen johon voidaan lisätä muotoiltavia teksti-ja kuvakenttiä. Muotoiluvaihtoehtoja ovat mm.tekstikoko, reunuksen koko, kulmien pyöreys ja koon skaalaus. Valmiin pohjan voi muuttaa kuvaksi.

Editori on toteutettu puhtaasti JavaScriptillä joten sen voi kloonata mihin tahansa ja avata selaimella.

## Käyttöohje

### Pohja-asetukset

**Pohjakoko:** Asettaa editorialueen pikselileveys ja -korkeus.

**Taustaväri:** Asettaa editorialueen taustavärin.

**Taustakuva:** Avaa tiedostoikkunan josta editorialueeseen voidaan ladata taustakuva. Valitsinnapin vieressä olevalla Poista-napilla liitetty taustakuva voidaan poistaa käytöstä. Venytä pohjaan-valinnalla kuva voidaan asettaa venymään editorialueen mittoihin.

**Navigaatio:** Jos editorialue on suurempi kuin selainikkunassa on tilaa, näkyvää aluetta voidaan siirtää raahaamalla hiirellä sinistä aluetta punaisen koko aluetta esittävän pohjan yli.

**Tee kuva:** Muuttaa editorialueen PNG-kuvaksi ja avaa sen uuteen ikkunaan.

### Kentät

**Uusi kenttä:** Napeista voidaan editorialueeseen luoda uusi teksti-tai kuvakenttä. Uusi kenttä valitaan automaattisesti.

**Kentät:** Alasveto esittää listan editorialueen kentistä niiden korkeusjärjestyksessä. Alasvedosta voidaan valita kenttä editoitavaksi. Alasvedon alla olevat Ylös- ja Alas-napit siirtävät alasvedossa valittuna olevaa kenttää korkeusjärjestyksessä ylös tai alas. Poista-nappi poistaa valitun kentän editorialueelta.

**Näytä reunukset:** Kun valinta on päällä, kaikkien kenttien ympärille piirretään harmaa reunus, ja valitun kentän ympärille oranssi reunus.

### Tekstikenttä

Kun editorialueelle on lisätty ainakin yksi tekstikenttä, sen ominaisuuksia voidaan muokata tekstikenttätoimintojen kautta.

**Nimi:** Tekstikentälle voidaan antaa nimi jolla se esitetään Kentät-työkalun kenttäalasvedossa.

**Teksti:** Teksti joka editorialueella esitetään. Toiminto ei tällä hetkellä tue tekstin rivitystä.

**Fontti:** Alasveto fonttivaihtoehdoista joita teksti voi käyttää.

**Tekstikoko:** Tekstin koon syöttö.

**Tekstiväri:** Tekstin fonttivärin valinta.

**Sijainti:** Kentän sijaintia voidaan säätää syöttämällä kenttiin sen koordinaatit pikseleissä.

**Koko:** Alasveto tarjoaa kaksi mahdollista toimintoa tekstikentän koon säätöön:
- **Automaattinen** säätää kentän koon aina siihen syötetyn tekstin mukaisesti.
- **Lukittu koko** antaa leveys- ja korkeustietojen syöttökentät joiden mittoihin kenttä lukitaan tekstin tilatarpeesta huolimatta.

**Tausta:** Valinnalla voidaan kentän taustan väritäyttö kytkeä päälle ja pois.

**Taustaväri:** Kentän taustavärin valinta.

**Täyteleveys:** Tekstin ja kentän reunuksen väliin asetettavan tyhjän tilan koko pikseleissä. Täytealue piirretään taustavärillä.

**Reunaleveys:** Kentän reunan leveys pikseleissä. Voidaan asettaa nollaksi.

**Reunaväri:** Reunan värin valinta.

**Kulmapyöreys:** Kentän kulmien pyöreyden säätö. Minimiasetuksella kulmat ovat terävät, maksimissa lyhyempi sivu säädetään koko pituudeltaan kaarevaksi.

## Kuvakenttä

Kun editorialueelle on lisätty ainakin yksi kuvakenttä, sem ominaisuuksia voidaan muokata kuvakenttätoimintojen kautta.

**Nimi:** Kuvakentälle voidaan antaa nimi jolla se esitetään Kentät-työkalun kenttäalasvedossa.

**Lataa kuva:** Avaa tiedostoikkunan josta kuvakenttään voidaan ladata kuva.

**Sijainti:** Kentän sijaintia voidaan säätää syöttämällä kenttiin sen koordinaatit pikseleissä.

**Koko:** Alasveto tarjoaa kolme mahdollista toimintoa kuvakentän koon säätöön:
- **Alkuperäinen** esittää kuvan sen alkuperäisessä koossa.
- **Skaalattu** antaa syöttökentän josta kuvan skaalausprosenttia voidaan muuttaa. Skaalausprosetntti 100 esittää kuvan alkuperäisessä koossa.
- **Lukittu koko** antaa leveys- ja korkeustietojen syöttökentät joista kuvalle voidaan määrittää esitysmitat.
  - **Säilytä kuvasuhde**-valinta säilyttää kuvan leveyden ja korkeuden suhteen (aspektin) kun toisen arvoa muutetaan.

**Tausta:** Valinnalla voidaan kentän taustan väritäyttö kytkeä päälle ja pois.

** Taustaväri:** Kentän taustavärin valinta.

**Täyteleveys:** Kuvan ja kentän reunuksen väliin asetettavan tyhjän tilan koko pikseleissä. Täytealue piirretään taustavärillä.

**Reunaleveys:** Kentän reunan leveys pikseleissä. Voidaan asettaa nollaksi.

**Reunaväri:** Reunan värin valinta.

**Kulmapyöreys:** Kentän kulmien pyöreyden säätö. Minimiasetuksella kulmat ovat terävät, maksimissa lyhyempi sivu säädetään koko pituudeltaan kaarevaksi.
