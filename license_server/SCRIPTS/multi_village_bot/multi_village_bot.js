require('dotenv').config()
var fs = require('fs');
var scripts = JSON.parse(fs.readFileSync(`${require.main.path}/scripts.json`));
module.exports = {
    VERSION: "1.4.8",
    HANDLE_REQUEST: async function (request_data) {
        var types = scripts[request_data.script].request_types;
        switch (types[request_data.type]) {
            case "LICENSE_CHECK":
                return {
                    status: true,
                    snippet: this.PRE_OBFUSCATED.LICENSE_CHECK
                };
            case "MULTI_VILLAGE_BOT":
                return {
                    status: true,
                    snippet: this.PRE_OBFUSCATED.MULTI_VILLAGE_BOT
                };
        }
    },
    MULTI_VILLAGE_BOT: function multi_village_bot(license) {
        "INSERT_LICENSE_CHECK_HERE"
        var faluk = {}; var vezerlo = {}; faluk.csoport = {}; var korpercenkent = {}; // ne módosítsd
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //  A tőzsde legyen bekapcsolva ha nem csak egy gyors kört akarsz kiküldeni. Ott várja ki a körperc idejét!          //
        //  Ha a tőzsde be van kapcsolva, de nincs eladás/vétel, akkor a levelezésen várja ki a körperc idejét!              //
        //  Ha csak egyetlen folyamat van bekapcsolva akkor a körperc ideje a lapfrissítés idejével egyenlő!                 //
        //  A körperc script mozgatórugója, ide írd mennyi percenként szeretnéd elindítani a tőzsdén kívüli tevékenységeket! //
        //  Botriadó pipáláshoz saját bővítményem:  https://addons.mozilla.org/hu/firefox/addon/i-m-a-robot-captcha-clicker/ //
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ////// Elsődleges módosítók ///////
        var premium_fiok = 1; // prémium fiók előnyeit kihaszálja
        var kilep_ha_tetlen = 50; // percben, visszalép  a fiókba, ha az oldalon vagy x ideig
        var emberi_mozzanatok = 0; // humanizer kapcsoló, mikor végez a körrel random oldalakon ugrál, mintha egy játékos csinálná
        var visszalepes = 1; // visszalép ha kidob a játékból
        var tozsde = 1; // tőzsde kapcsoló
        var farm = 1; // farm kapcsoló
        var jatekosfarm = 0; // játékos farm kapcsoló
        var gyujtogetes = 1; // gyűjtögetés kapcsoló
        var epites = 0; // építés kapcsoló, bányaorientált lesz az építés
        var kepzes = 0; // képzés kapcsoló, legyárt x mennyiségű sereget
        var kuldetesek = 0; // elkezdi csinálni a küldetéseket és kiszedi az új küldetésrendszerből a nyersanyagot
        var leltar_nyersi = 0; // elhasználja a leltár nyersi csomagokat ha kevés a faluban a nyersi
        var napi_bonusz = 1; // begyűjti a napibónuszt
        var botriado = 2; // 0, ha nem megy, 1 ha csak pipál, 2 ha a képeset is megfejti
        var korperc = 13; // ennyi percenként indítja el a tőzsdén kívüli tevékenységeket miután végzett a körrel (random, de minimum ennyi perc)

        // Prémium opciók
        var tomeges_gyujti = 1; // tömeges gyűjtögetés az összes falun
        var tomeges_gyujti_feloldas = 0; // tömeges gyűjtögetés opciók feloldása az összes falun
        var tomeges_kikepzes = 0; // tömeges kiképzés az összes falun
        var tomeges_epites = 0; // tömeges építés az összes falun
        var barbar_faluk_kosozasa = 0; // megadott falukból lekosozza az első 20 falut amiben fal van a farmkezelőben
        var nyersikiegyenlites = 1; // nyersikiegyenlítés az összes faluban
        var ermeveretes = 0; // érmék veretése az összes falun
        ///////////////////////////////////

        ////////// Falu Módosítók ///////////////////////////////////////////////////////////////
        // koordináták egy sorban szóközzel elválasztva
        faluk.csoport.tamado = "";
        faluk.csoport.frontvedo = "";
        faluk.csoport.hatsovedo = "";
        faluk.csoport.farm = "";
        faluk.csoport.kem = "";
        faluk.csoport.barbarfarmolofaluk = "";
        faluk.csoport.jatekosfarmolofaluk = "";
        faluk.csoport.barbarkosozofaluk = "";
        /////////////////////////////////////////////////////////////////////////////////////////

        ////////// Szerver Módosítók ////////////////////////////////////////////////////////////
        var szerver = "77"; // szerver ahol használod
        var nemzet = "hu"; // nemzet ahol használod
        var terkepfrissites = 6; // ennyi orankent frissíti a kh adatbazist (minimum 1 óra!)
        /////////////////////////////////////////////////////////////////////////////////////////

        ////////// Farm Módosítók ///////////////////////////////////////////////////////////////
        korpercenkent.barbarfarm = 1; // Ennyi körpercenként küldi a farmot barbárra
        var a_b_ures_teli = 1; // Állítsd 1-re ha a teli falukra B-t akarsz küldeni, üresekre A-t
        var max_mezo = 30; // Maximum mező amit a script kiküldhet
        var template = "a"; // a vagy b vagy c gombot nyomjon
        var minimum_nyersi = 2000; // c gombnál a minimum nyersi amiért elindul
        var minimum_kl = 50; // minimum ennyi kl-t küld ki c gombnál
        ////////////////////////////////////////////////////////////////////////////////////////

        ////////// Játékos farm Módosítók //////////////////////////////////////////////////////
        korpercenkent.jatekosfarm = 1; // Ennyi körpercenként küldi a farmot a játékosokra
        // koordináták egy sorban szóközzel elválasztva
        var coords = '';
        var sp = 0; // lándzsás
        var sw = 0; // kardos
        var ax = 1000; // bárdos
        var scout = 0; // kém
        var lc = 0; // könnyűlovas
        var hv = 0; // nehézlovas
        var ra = 0; // kos
        var cat = 0; // katapult
        var snob = 1; // főnemes
        ////////////////////////////////////////////////////////////////////////////////////////

        ////////// Tőzsde Módosítók ////////////////////////////////////////////////////////////
        var tozsden_vasarlas_ultragyorsan = 0; // csak vesz, azonnal kiszedi a bennt levő nyersit, nem nézi a raktárat.
        var nyersi_elad = 0; // Állítsd 1-re ha nyersit szeretnél eladni
        var nyersi_vesz = 0; // Állítsd 1-re ha nyersit szeretnél venni
        var nyersi_elad_arfolyam = 1200; // tőzsde árfolyam ami alatt eladja a nyersit
        var nyersi_vesz_arfolyam = 60; // tőzsde árfolyam ami felett veszi a nyersit
        var nyersi_vesz_max_pp = 15; // ennyi pp-t költhet egyszerre vásárláskor
        var rakiban_marad = 500; // eladáskor ennyi marad a raktárban
        var minimum_amit_elad = 100; // eladáskor ennyi nyersitől kezd el eladni
        var szabadkapac = 300; // ennyi százalékig tölti fel a raktárat amikor nyersit vesz
        var szabad_kereskedo = 0; // ennyi kereskedőt hagy a faluban amikor nyersizik

        var auto_tozsde = 0; // kapcsold be ha nem szeretnéd nézni a tőzsdét, automatán figyeli a piacot és a kívánt profit alapján dolgozik
        var tozsdemozgas_szamlalo = 1000; // ennyi tőzsdemozgási adatból számol minimum, ha nincs ennyi még akkor a beírt értékeket veszi figyelembe
        var legkisebb_profit = 2; // legkisebb profit pp-ben adott nyersanyag eladás és vétel között (1 = nulla profit)
        var kenyszerített_profit = 1; // ha a profit sokkal nagyobb is lehetne az adatok alapján, akkor nem tőzsdéz a legkisebb profit értékénél
        ////////////////////////////////////////////////////////////////////////////////////////

        ////////// Gyűjtögetés Módosítók ///////////////////////////////////////////////////////
        korpercenkent.gyujtogetes = 1; // Ennyi körpercenként küldi a gyűjtögetést
        var támadó_faluból = 1; //Állítsd 1-re ha támadó faluból akarsz gyűjteni
        var frontvédő_faluból = 1; //Állítsd 1-re ha front védő faluból akarsz gyűjteni
        var hátsóvédő_faluból = 1; //Állítsd 1-re ha hátsó védő faluból akarsz gyűjteni

        faluk.tamado_gyujti = [
            {
                max_ora: 4, // a seregeid ennyi órára fogja elküldeni legfeljebb gyűjtögetésnél
                landzsas: true, // lándzsás küldés kapcsoló
                landzsas_otthon: 0, // lándszás amit a faluban hagy
                kardos: true, // kardos küldés kapcsoló
                kardos_otthon: 0, // kardos amit a faluban hagy
                bardos: true, // bárdos küldés kapcsoló
                bardos_otthon: 0, // bárdos amit a faluban hagy
                ijasz: true, // íjász küldés kapcsoló
                ijasz_otthon: 0, // íjász amit a faluban hagy
                konnyulovas: false, // könnyűlovas küldés kapcsoló
                konnyulovas_otthon: 0, // könnyűlovas amit a faluban hagy
                lovasijasz: true, // lovasíjász küldés kapcsoló
                lovasijasz_otthon: 0, // lovasíjász amit a faluban hagy
                nehezlovas: true, // nehézlovas küldés kapcsoló
                nehezlovas_otthon: 0
            }]; // nehézlovas amit a faluban hagy

        faluk.frontvedo_gyujti = [
            {
                max_ora: 3, // a seregeid ennyi órára fogja elküldeni legfeljebb gyűjtögetésnél
                landzsas: true, // lándzsás küldés kapcsoló
                landzsas_otthon: 0, // lándszás amit a faluban hagy
                kardos: true, // kardos küldés kapcsoló
                kardos_otthon: 0, // kardos amit a faluban hagy
                bardos: true, // bárdos küldés kapcsoló
                bardos_otthon: 0, // bárdos amit a faluban hagy
                ijasz: true, // íjász küldés kapcsoló
                ijasz_otthon: 0, // íjász amit a faluban hagy
                konnyulovas: true, // könnyűlovas küldés kapcsoló
                konnyulovas_otthon: 0, // könnyűlovas amit a faluban hagy
                lovasijasz: true, // lovasíjász küldés kapcsoló
                lovasijasz_otthon: 0, // lovasíjász amit a faluban hagy
                nehezlovas: false, // nehézlovas küldés kapcsoló
                nehezlovas_otthon: 0
            }]; // nehézlovas amit a faluban hagy

        faluk.hatsovedo_gyujti = [
            {
                max_ora: 4, // a seregeid ennyi órára fogja elküldeni legfeljebb gyűjtögetésnél
                landzsas: true, // lándzsás küldés kapcsoló
                landzsas_otthon: 0, // lándszás amit a faluban hagy
                kardos: true, // kardos küldés kapcsoló
                kardos_otthon: 0, // kardos amit a faluban hagy
                bardos: true, // bárdos küldés kapcsoló
                bardos_otthon: 0, // bárdos amit a faluban hagy
                ijasz: true, // íjász küldés kapcsoló
                ijasz_otthon: 0, // íjász amit a faluban hagy
                konnyulovas: true, // könnyűlovas küldés kapcsoló
                konnyulovas_otthon: 0, // könnyűlovas amit a faluban hagy
                lovasijasz: true, // lovasíjász küldés kapcsoló
                lovasijasz_otthon: 0, // lovasíjász amit a faluban hagy
                nehezlovas: true, // nehézlovas küldés kapcsoló
                nehezlovas_otthon: 0
            }]; // nehézlovas amit a faluban hagy
        ////////////////////////////////////////////////////////////////////////////////////////

        ////////// Építés Módosítók ////////////////////////////////////////////////////////////
        korpercenkent.epites = 1; // Ennyi körpercenként épít
        var kezdetek = 0; // Kapcsold be ha a játék legelején automatán akarsz építeni, követi a küldetéseket, de a nagyon rövid építéseknél nem tökéletes. 15 bányaszintig épít

        var Fohadiszallas = 20; // főhadiszállás szintje amíg építsen
        var Barakk = 20; // barakk szintje amíg építsen
        var Istallo = 10; // istálló szintje amíg építsen
        var Muhely = 5; // műhely szintje amíg építsen
        var Piac = 10; // piac szintje amíg építsen
        var Tanya = 10; // tanya szintje amíg építsen
        var Raktar = 20; // raktár szintje amíg építsen
        var Kovacsmuhely = 15; // kovácsműhely szintje amíg építsen
        var Fatelep = 30; // fatelep szintje amíg építsen
        var Agyagbanya = 30; // agyagbánya szintje amíg építsen
        var Vasbanya = 30; // vasbánya szintje amíg építsen
        var Akademia = 0; // akadémia szintje amíg építsen
        var Szobor = 1; // szobor szintje amíg építsen
        var Gyulekezohely = 1; // gyülekezőhely szintje amíg építsen
        var Rejtekhely = 0; // rejtekhely szintje amíg építsen
        var Fal = 0; // fal szintje amíg építsen

        var Kenyszeritett_lista = false; // sorban végzi az építést épületenként bányákkal kezdve, ha a kezdetek be van kapcsolva akkor "true" legyen
        var Raktar_epites_ha_kell = true; // ha az építéshez nincs elegendő raktár vagy megtelne akkor épít egy szintet
        var Tanya_epites_ha_kell = true; // ha az képzéshez/építéshez nincs elegendő tanyahely vagy megtelne akkor épít egy szintet
        var Max_raktar_szazalek = 98; // ennyi százaléknál épít automatán egy szintet a raktáron
        var Max_tanya_szazalek = 95; // ennyi százaléknál épít automatán egy szintet a tanyán
        var Max_raktar_szint = 30; // maximum szint ameddíg építi automatán a raktárat
        var Max_tanya_szint = 30; // maximum szint ameddíg építi automatán a tanyát
        var Max_epitesi_sor = 5; // maximum építési sor
        ////////////////////////////////////////////////////////////////////////////////////////

        ////////// Képzés Módosítók ////////////////////////////////////////////////////////////
        // a körperc ideje alatt ennyi egységet képez (train) és ha megvan a max seregmennyiség akkor nem képez tovább
        korpercenkent.kepzes = 1; // Ennyi körpercenként küldi a farmot a játékosokra
        faluk.tamado_sereg = [
            { troop: "spear", train: 0, max: 0 },
            { troop: "sword", train: 0, max: 0 },
            { troop: "axe", train: 7, max: 6000 },
            { troop: "archer", train: 0, max: 0 },
            { troop: "spy", train: 0, max: 100 },
            { troop: "light", train: 5, max: 4000 },
            { troop: "marcher", train: 0, max: 0 },
            { troop: "heavy", train: 0, max: 0 },
            { troop: "ram", train: 0, max: 300 },
            { troop: "catapult", train: 0, max: 200 }];

        faluk.frontvedo_sereg = [
            { troop: "spear", train: 5, max: 2000 },
            { troop: "sword", train: 0, max: 0 },
            { troop: "axe", train: 0, max: 0 },
            { troop: "archer", train: 0, max: 0 },
            { troop: "spy", train: 0, max: 200 },
            { troop: "light", train: 0, max: 0 },
            { troop: "marcher", train: 0, max: 0 },
            { troop: "heavy", train: 0, max: 0 },
            { troop: "ram", train: 0, max: 0 },
            { troop: "catapult", train: 0, max: 100 }];

        faluk.hatsovedo_sereg = [
            { troop: "spear", train: 2, max: 8000 },
            { troop: "sword", train: 2, max: 8000 },
            { troop: "axe", train: 0, max: 0 },
            { troop: "archer", train: 0, max: 0 },
            { troop: "spy", train: 0, max: 0 },
            { troop: "light", train: 0, max: 0 },
            { troop: "marcher", train: 0, max: 0 },
            { troop: "heavy", train: 2, max: 500 },
            { troop: "ram", train: 0, max: 0 },
            { troop: "catapult", train: 1, max: 100 }];

        faluk.farm_sereg = [
            { troop: "spear", train: 0, max: 0 },
            { troop: "sword", train: 0, max: 0 },
            { troop: "axe", train: 0, max: 0 },
            { troop: "archer", train: 0, max: 0 },
            { troop: "spy", train: 1, max: 100 },
            { troop: "light", train: 2, max: 4000 },
            { troop: "marcher", train: 0, max: 0 },
            { troop: "heavy", train: 0, max: 0 },
            { troop: "ram", train: 0, max: 0 },
            { troop: "catapult", train: 1, max: 100 }];

        faluk.kem_sereg = [
            { troop: "spear", train: 0, max: 0 },
            { troop: "sword", train: 0, max: 0 },
            { troop: "axe", train: 0, max: 0 },
            { troop: "archer", train: 0, max: 0 },
            { troop: "spy", train: 2, max: 10000 },
            { troop: "light", train: 0, max: 0 },
            { troop: "marcher", train: 0, max: 0 },
            { troop: "heavy", train: 0, max: 0 },
            { troop: "ram", train: 0, max: 0 },
            { troop: "catapult", train: 0, max: 0 }];

        var avoidUnevenResources = false; // kerüli az egyenletlen nyersi elosztást, ha nagy arányú eltérés lenne a raktár nyersanyageloszlásában akkor nem képez vagy csak kevesebbet
        ////////////////////////////////////////////////////////////////////////////////////////

        ////////// Prémium Módosítók ///////////////////////////////////////////////////////////
        korpercenkent.tomeges_gyujti = 1; // Ennyi körpercenként küldi tömeges gyűjtögetést
        korpercenkent.tomeges_gyujti_feloldas = 3; // Ennyi gyűjtögetésenként próbálja meg feloldani a gyűjtögetés opciókat
        korpercenkent.tomeges_kikepzes = 1; // Ennyi körpercenként képez sereget tömegesen
        korpercenkent.tomeges_epites = 2; // Ennyi körpercenként épít tömegesen
        korpercenkent.tomeges_barbar_faluk_kosozasa = 20; // Ennyi körpercenként kosozza a barbikat
        korpercenkent.tomeges_nyersikiegyenlites = 10; // Ennyi körpercenként egyenlíti ki a nyersanyagokat
        korpercenkent.tomeges_ermeveres = 10; // Ennyi körpercenként veri le az érméket tömegesen

        // tömeges gyűjtögetés
        var tomeges_gyujtogetes_tamadobol_ideje = 4;
        var tomeges_gyujtogetes_vedobol_ideje = 4;
        var tomeges_gyujtogetes_premiummal = false;
        var tomeges_landzsa = 1;
        var tomeges_kardos = 1;
        var tomeges_bardos = 1;
        var tomeges_ijasz = 1;
        var tomeges_konnyulo = 0;
        var tomeges_lovasij = 0;
        var tomeges_nehezlo = 1;
        var tomeges_landzsa_faluban_marad = 0;
        var tomeges_kardos_faluban_marad = 0;
        var tomeges_bardos_faluban_marad = 0;
        var tomeges_ijasz_faluban_marad = 0;
        var tomeges_konnyulo_faluban_marad = 400;
        var tomeges_lovasij_faluban_marad = 0;
        var tomeges_nehezlo_faluban_marad = 0;

        // tömeges nyersanyagkiegyenlítő
        var tomeges_nyersanyagkiegyenlito_tanya_nagy = 16000;
        var tomeges_nyersanyagkiegyenlito_tanya_kicsi = 3000;
        var tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek = 0.15;
        var tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek = 0.75;
        var tomeges_nyersanyagkiegyenlito_premiummal = false;

        // tömeges érmézés
        var tomeges_ermezes_itt = "500|500";
        var tomeges_ermezes_max_erme = "max-1";
        ////////////////////////////////////////////////////////////////////////////////////////

        var elad_hang = new Audio('https://freesound.org/data/previews/80/80921_1022651-lq.mp3');
        var vesz_hang = new Audio('https://freesound.org/data/previews/91/91926_7037-lq.mp3');
        var bot_hang = new Audio('https://freesound.org/data/previews/135/135613_2477074-lq.mp3');
        vezerlo.kikuldve = {};
        vezerlo.index = {};
        vezerlo.korpercenkent = {};
        var phase = 0;
        var map_id;
        var bot_settings = {}; bot_settings.faluk = {}; bot_settings.faluk.csoport = {}; bot_settings.korpercenkent = {};
        ////// Elsődleges módosítók /////////////////////////////////////////////////////////////
        bot_settings.premium_fiok = premium_fiok;
        bot_settings.kilep_ha_tetlen = kilep_ha_tetlen;
        bot_settings.emberi_mozzanatok = emberi_mozzanatok;
        bot_settings.visszalepes = visszalepes;
        bot_settings.tozsde = tozsde;
        bot_settings.farm = farm;
        bot_settings.jatekosfarm = jatekosfarm;
        bot_settings.gyujtogetes = gyujtogetes;
        bot_settings.epites = epites;
        bot_settings.kepzes = kepzes;
        bot_settings.kuldetesek = kuldetesek;
        bot_settings.leltar_nyersi = leltar_nyersi;
        bot_settings.napi_bonusz = napi_bonusz;
        bot_settings.botriado = botriado;
        bot_settings.korperc = korperc;
        // Prémium opciók
        bot_settings.tomeges_gyujti = tomeges_gyujti;
        bot_settings.tomeges_gyujti_feloldas = tomeges_gyujti_feloldas;
        bot_settings.tomeges_kikepzes = tomeges_kikepzes;
        bot_settings.tomeges_epites = tomeges_epites;
        bot_settings.barbar_faluk_kosozasa = barbar_faluk_kosozasa;
        bot_settings.nyersikiegyenlites = nyersikiegyenlites;
        bot_settings.ermeveretes = ermeveretes;
        ////////// Falu Módosítók ///////////////////////////////////////////////////////////////
        bot_settings.faluk.csoport.tamado = faluk.csoport.tamado;
        bot_settings.faluk.csoport.frontvedo = faluk.csoport.frontvedo;
        bot_settings.faluk.csoport.hatsovedo = faluk.csoport.hatsovedo;
        bot_settings.faluk.csoport.farm = faluk.csoport.farm;
        bot_settings.faluk.csoport.kem = faluk.csoport.kem;
        bot_settings.faluk.csoport.barbarfarmolofaluk = faluk.csoport.barbarfarmolofaluk;
        bot_settings.faluk.csoport.jatekosfarmolofaluk = faluk.csoport.jatekosfarmolofaluk;
        bot_settings.faluk.csoport.barbarkosozofaluk = faluk.csoport.barbarkosozofaluk;
        ////////// Szerver Módosítók ////////////////////////////////////////////////////////////
        bot_settings.szerver = szerver;
        bot_settings.nemzet = nemzet;
        bot_settings.terkepfrissites = terkepfrissites;
        ////////// Farm Módosítók ///////////////////////////////////////////////////////////////
        bot_settings.korpercenkent.barbarfarm = korpercenkent.barbarfarm;
        bot_settings.a_b_ures_teli = a_b_ures_teli;
        bot_settings.max_mezo = max_mezo;
        bot_settings.template = template;
        bot_settings.minimum_nyersi = minimum_nyersi;
        bot_settings.minimum_kl = minimum_kl;
        ////////// Játékos farm Módosítók //////////////////////////////////////////////////////
        bot_settings.korpercenkent.jatekosfarm = korpercenkent.jatekosfarm;
        bot_settings.coords = coords;
        bot_settings.sp = sp;
        bot_settings.sw = sw;
        bot_settings.ax = ax;
        bot_settings.scout = scout;
        bot_settings.lc = lc;
        bot_settings.hv = hv;
        bot_settings.ra = ra;
        bot_settings.cat = cat;
        bot_settings.snob = snob;
        ////////// Tőzsde Módosítók ////////////////////////////////////////////////////////////
        bot_settings.tozsden_vasarlas_ultragyorsan = tozsden_vasarlas_ultragyorsan;
        bot_settings.nyersi_elad = nyersi_elad;
        bot_settings.nyersi_vesz = nyersi_vesz;
        bot_settings.nyersi_elad_arfolyam = nyersi_elad_arfolyam;
        bot_settings.nyersi_vesz_arfolyam = nyersi_vesz_arfolyam;
        bot_settings.nyersi_vesz_max_pp = nyersi_vesz_max_pp;
        bot_settings.rakiban_marad = rakiban_marad;
        bot_settings.minimum_amit_elad = minimum_amit_elad;
        bot_settings.szabadkapac = szabadkapac;
        bot_settings.szabad_kereskedo = szabad_kereskedo;
        // auto tőzsde
        bot_settings.auto_tozsde = auto_tozsde;
        bot_settings.tozsdemozgas_szamlalo = tozsdemozgas_szamlalo;
        bot_settings.legkisebb_profit = legkisebb_profit;
        bot_settings.kenyszerített_profit = kenyszerített_profit;
        ////////// Gyűjtögetés Módosítók ///////////////////////////////////////////////////////
        bot_settings.korpercenkent.gyujtogetes = korpercenkent.gyujtogetes;
        bot_settings.támadó_faluból = támadó_faluból;
        bot_settings.frontvédő_faluból = frontvédő_faluból;
        bot_settings.hátsóvédő_faluból = hátsóvédő_faluból;
        bot_settings.faluk.tamado_gyujti = faluk.tamado_gyujti;
        bot_settings.faluk.frontvedo_gyujti = faluk.frontvedo_gyujti;
        bot_settings.faluk.hatsovedo_gyujti = faluk.hatsovedo_gyujti;
        ////////// Építés Módosítók ////////////////////////////////////////////////////////////
        bot_settings.korpercenkent.epites = korpercenkent.epites;
        bot_settings.kezdetek = kezdetek;
        bot_settings.Fohadiszallas = Fohadiszallas;
        bot_settings.Barakk = Barakk;
        bot_settings.Istallo = Istallo;
        bot_settings.Muhely = Muhely;
        bot_settings.Piac = Piac;
        bot_settings.Tanya = Tanya;
        bot_settings.Raktar = Raktar;
        bot_settings.Kovacsmuhely = Kovacsmuhely;
        bot_settings.Fatelep = Fatelep;
        bot_settings.Agyagbanya = Agyagbanya;
        bot_settings.Vasbanya = Vasbanya;
        bot_settings.Akademia = Akademia;
        bot_settings.Szobor = Szobor;
        bot_settings.Gyulekezohely = Gyulekezohely;
        bot_settings.Rejtekhely = Rejtekhely;
        bot_settings.Fal = Fal;
        bot_settings.Kenyszeritett_lista = Kenyszeritett_lista;
        bot_settings.Raktar_epites_ha_kell = Raktar_epites_ha_kell;
        bot_settings.Tanya_epites_ha_kell = Tanya_epites_ha_kell;
        bot_settings.Max_raktar_szazalek = Max_raktar_szazalek;
        bot_settings.Max_tanya_szazalek = Max_tanya_szazalek;
        bot_settings.Max_raktar_szint = Max_raktar_szint;
        bot_settings.Max_tanya_szint = Max_tanya_szint;
        bot_settings.Max_epitesi_sor = Max_epitesi_sor;
        ////////// Képzés Módosítók ////////////////////////////////////////////////////////////
        bot_settings.korpercenkent.kepzes = korpercenkent.kepzes;
        bot_settings.faluk.tamado_sereg = faluk.tamado_sereg;
        bot_settings.faluk.frontvedo_sereg = faluk.frontvedo_sereg;
        bot_settings.faluk.hatsovedo_sereg = faluk.hatsovedo_sereg;
        bot_settings.faluk.farm_sereg = faluk.farm_sereg;
        bot_settings.faluk.kem_sereg = faluk.kem_sereg;
        bot_settings.avoidUnevenResources = avoidUnevenResources;
        ////////// Prémium Módosítók ///////////////////////////////////////////////////////////
        bot_settings.korpercenkent.tomeges_gyujti = korpercenkent.tomeges_gyujti;
        bot_settings.korpercenkent.tomeges_gyujti_feloldas = korpercenkent.tomeges_gyujti_feloldas;
        bot_settings.korpercenkent.tomeges_kikepzes = korpercenkent.tomeges_kikepzes;
        bot_settings.korpercenkent.tomeges_epites = korpercenkent.tomeges_epites;
        bot_settings.korpercenkent.tomeges_barbar_faluk_kosozasa = korpercenkent.tomeges_barbar_faluk_kosozasa;
        bot_settings.korpercenkent.tomeges_nyersikiegyenlites = korpercenkent.tomeges_nyersikiegyenlites;
        bot_settings.korpercenkent.tomeges_ermeveres = korpercenkent.tomeges_ermeveres;
        // tömeges gyűjtögetés
        bot_settings.tomeges_gyujtogetes_tamadobol_ideje = tomeges_gyujtogetes_tamadobol_ideje;
        bot_settings.tomeges_gyujtogetes_vedobol_ideje = tomeges_gyujtogetes_vedobol_ideje;
        bot_settings.tomeges_gyujtogetes_premiummal = tomeges_gyujtogetes_premiummal;
        bot_settings.tomeges_landzsa = tomeges_landzsa;
        bot_settings.tomeges_kardos = tomeges_kardos;
        bot_settings.tomeges_bardos = tomeges_bardos;
        bot_settings.tomeges_ijasz = tomeges_ijasz;
        bot_settings.tomeges_konnyulo = tomeges_konnyulo;
        bot_settings.tomeges_lovasij = tomeges_lovasij;
        bot_settings.tomeges_nehezlo = tomeges_nehezlo;
        bot_settings.tomeges_landzsa_faluban_marad = tomeges_landzsa_faluban_marad;
        bot_settings.tomeges_kardos_faluban_marad = tomeges_kardos_faluban_marad;
        bot_settings.tomeges_bardos_faluban_marad = tomeges_bardos_faluban_marad;
        bot_settings.tomeges_ijasz_faluban_marad = tomeges_ijasz_faluban_marad;
        bot_settings.tomeges_konnyulo_faluban_marad = tomeges_konnyulo_faluban_marad;
        bot_settings.tomeges_lovasij_faluban_marad = tomeges_lovasij_faluban_marad;
        bot_settings.tomeges_nehezlo_faluban_marad = tomeges_nehezlo_faluban_marad;
        // tömeges nyersanyagkiegyenlítő
        bot_settings.tomeges_nyersanyagkiegyenlito_tanya_nagy = tomeges_nyersanyagkiegyenlito_tanya_nagy;
        bot_settings.tomeges_nyersanyagkiegyenlito_tanya_kicsi = tomeges_nyersanyagkiegyenlito_tanya_kicsi;
        bot_settings.tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek = tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek;
        bot_settings.tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek = tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek;
        bot_settings.tomeges_nyersanyagkiegyenlito_premiummal = tomeges_nyersanyagkiegyenlito_premiummal;
        // tömeges érmézés
        bot_settings.tomeges_ermezes_itt = tomeges_ermezes_itt;
        bot_settings.tomeges_ermezes_max_erme = tomeges_ermezes_max_erme;
        ///////////////////////////////////////////////////////////////////////////////////////
        var item_not_exist = [null, "NaN", "undefined", undefined];
        var get_localstorage = JSON.parse(localStorage.getItem("SAM"));
        if (item_not_exist.includes(typeof (get_localstorage.multi_village_bot))) {
            save_localstorage();
        }
        else if (item_not_exist.includes(typeof (get_localstorage.multi_village_bot.settings))) {
            save_localstorage();
        }
        else {
            bot_settings = get_localstorage.multi_village_bot.settings;
            SAM.multi_village_bot = get_localstorage.multi_village_bot;
        }
        function save_localstorage() {
            "INSERT_LICENSE_CHECK_HERE"
            if (item_not_exist.includes(typeof (SAM.multi_village_bot))) {
                SAM.multi_village_bot = {};
            }
            SAM.multi_village_bot.settings = bot_settings;
            SAM.multi_village_bot.vezerlo = vezerlo;
            localStorage.setItem("SAM", JSON.stringify(SAM));
        }
        function load_bot_settings() {
            "INSERT_LICENSE_CHECK_HERE"
            ////// Elsődleges módosítók /////////////////////////////////////////////////////////////
            premium_fiok = bot_settings.premium_fiok;
            kilep_ha_tetlen = bot_settings.kilep_ha_tetlen;
            emberi_mozzanatok = bot_settings.emberi_mozzanatok;
            visszalepes = bot_settings.visszalepes;
            tozsde = bot_settings.tozsde;
            farm = bot_settings.farm;
            jatekosfarm = bot_settings.jatekosfarm;
            gyujtogetes = bot_settings.gyujtogetes;
            epites = bot_settings.epites;
            kepzes = bot_settings.kepzes;
            kuldetesek = bot_settings.kuldetesek;
            leltar_nyersi = bot_settings.leltar_nyersi;
            napi_bonusz = bot_settings.napi_bonusz;
            botriado = bot_settings.botriado;
            korperc = bot_settings.korperc;
            // Prémium opciók
            tomeges_gyujti = bot_settings.tomeges_gyujti;
            tomeges_gyujti_feloldas = bot_settings.tomeges_gyujti_feloldas;
            tomeges_kikepzes = bot_settings.tomeges_kikepzes;
            tomeges_epites = bot_settings.tomeges_epites;
            barbar_faluk_kosozasa = bot_settings.barbar_faluk_kosozasa;
            nyersikiegyenlites = bot_settings.nyersikiegyenlites;
            ermeveretes = bot_settings.ermeveretes;
            ////////// Falu Módosítók ///////////////////////////////////////////////////////////////
            faluk.csoport.tamado = bot_settings.faluk.csoport.tamado;
            faluk.csoport.frontvedo = bot_settings.faluk.csoport.frontvedo;
            faluk.csoport.hatsovedo = bot_settings.faluk.csoport.hatsovedo;
            faluk.csoport.farm = bot_settings.faluk.csoport.farm;
            faluk.csoport.kem = bot_settings.faluk.csoport.kem;
            faluk.csoport.barbarfarmolofaluk = bot_settings.faluk.csoport.barbarfarmolofaluk;
            faluk.csoport.jatekosfarmolofaluk = bot_settings.faluk.csoport.jatekosfarmolofaluk;
            faluk.csoport.barbarkosozofaluk = bot_settings.faluk.csoport.barbarkosozofaluk;
            ////////// Szerver Módosítók ////////////////////////////////////////////////////////////
            szerver = bot_settings.szerver;
            nemzet = bot_settings.nemzet;
            terkepfrissites = bot_settings.terkepfrissites;
            ////////// Farm Módosítók ///////////////////////////////////////////////////////////////
            korpercenkent.barbarfarm = bot_settings.korpercenkent.barbarfarm;
            a_b_ures_teli = bot_settings.a_b_ures_teli;
            max_mezo = bot_settings.max_mezo;
            template = bot_settings.template;
            minimum_nyersi = bot_settings.minimum_nyersi;
            minimum_kl = bot_settings.minimum_kl;
            ////////// Játékos farm Módosítók //////////////////////////////////////////////////////
            korpercenkent.jatekosfarm = bot_settings.korpercenkent.jatekosfarm;
            coords = bot_settings.coords;
            sp = bot_settings.sp;
            sw = bot_settings.sw;
            ax = bot_settings.ax;
            scout = bot_settings.scout;
            lc = bot_settings.lc;
            hv = bot_settings.hv;
            ra = bot_settings.ra;
            cat = bot_settings.cat;
            snob = bot_settings.snob;
            ////////// Tőzsde Módosítók ////////////////////////////////////////////////////////////
            tozsden_vasarlas_ultragyorsan = bot_settings.tozsden_vasarlas_ultragyorsan;
            nyersi_elad = bot_settings.nyersi_elad;
            nyersi_vesz = bot_settings.nyersi_vesz;
            nyersi_elad_arfolyam = bot_settings.nyersi_elad_arfolyam;
            nyersi_vesz_arfolyam = bot_settings.nyersi_vesz_arfolyam;
            nyersi_vesz_max_pp = bot_settings.nyersi_vesz_max_pp;
            rakiban_marad = bot_settings.rakiban_marad;
            minimum_amit_elad = bot_settings.minimum_amit_elad;
            szabadkapac = bot_settings.szabadkapac;
            szabad_kereskedo = bot_settings.szabad_kereskedo;
            // auto tőzsde
            auto_tozsde = bot_settings.auto_tozsde;
            tozsdemozgas_szamlalo = bot_settings.tozsdemozgas_szamlalo;
            legkisebb_profit = bot_settings.legkisebb_profit;
            kenyszerített_profit = bot_settings.kenyszerített_profit;
            ////////// Gyűjtögetés Módosítók ///////////////////////////////////////////////////////
            korpercenkent.gyujtogetes = bot_settings.korpercenkent.gyujtogetes;
            támadó_faluból = bot_settings.támadó_faluból;
            frontvédő_faluból = bot_settings.frontvédő_faluból;
            hátsóvédő_faluból = bot_settings.hátsóvédő_faluból;
            faluk.tamado_gyujti = bot_settings.faluk.tamado_gyujti;
            faluk.frontvedo_gyujti = bot_settings.faluk.frontvedo_gyujti;
            faluk.hatsovedo_gyujti = bot_settings.faluk.hatsovedo_gyujti;
            ////////// Építés Módosítók ////////////////////////////////////////////////////////////
            korpercenkent.epites = bot_settings.korpercenkent.epites;
            kezdetek = bot_settings.kezdetek;
            Fohadiszallas = bot_settings.Fohadiszallas;
            Barakk = bot_settings.Barakk;
            Istallo = bot_settings.Istallo;
            Muhely = bot_settings.Muhely;
            Piac = bot_settings.Piac;
            Tanya = bot_settings.Tanya;
            Raktar = bot_settings.Raktar;
            Kovacsmuhely = bot_settings.Kovacsmuhely;
            Fatelep = bot_settings.Fatelep;
            Agyagbanya = bot_settings.Agyagbanya;
            Vasbanya = bot_settings.Vasbanya;
            Akademia = bot_settings.Akademia;
            Szobor = bot_settings.Szobor;
            Gyulekezohely = bot_settings.Gyulekezohely;
            Rejtekhely = bot_settings.Rejtekhely;
            Fal = bot_settings.Fal;
            Kenyszeritett_lista = bot_settings.Kenyszeritett_lista;
            Raktar_epites_ha_kell = bot_settings.Raktar_epites_ha_kell;
            Tanya_epites_ha_kell = bot_settings.Tanya_epites_ha_kell;
            Max_raktar_szazalek = bot_settings.Max_raktar_szazalek;
            Max_tanya_szazalek = bot_settings.Max_tanya_szazalek;
            Max_raktar_szint = bot_settings.Max_raktar_szint;
            Max_tanya_szint = bot_settings.Max_tanya_szint;
            Max_epitesi_sor = bot_settings.Max_epitesi_sor;
            ////////// Képzés Módosítók ////////////////////////////////////////////////////////////
            korpercenkent.kepzes = bot_settings.korpercenkent.kepzes;
            faluk.tamado_sereg = bot_settings.faluk.tamado_sereg;
            faluk.frontvedo_sereg = bot_settings.faluk.frontvedo_sereg;
            faluk.hatsovedo_sereg = bot_settings.faluk.hatsovedo_sereg;
            faluk.farm_sereg = bot_settings.faluk.farm_sereg;
            faluk.kem_sereg = bot_settings.faluk.kem_sereg;
            avoidUnevenResources = bot_settings.avoidUnevenResources;
            ////////// Prémium Módosítók ///////////////////////////////////////////////////////////
            korpercenkent.tomeges_gyujti = bot_settings.korpercenkent.tomeges_gyujti;
            korpercenkent.tomeges_gyujti_feloldas = bot_settings.korpercenkent.tomeges_gyujti_feloldas;
            korpercenkent.tomeges_kikepzes = bot_settings.korpercenkent.tomeges_kikepzes;
            korpercenkent.tomeges_epites = bot_settings.korpercenkent.tomeges_epites;
            korpercenkent.tomeges_barbar_faluk_kosozasa = bot_settings.korpercenkent.tomeges_barbar_faluk_kosozasa;
            korpercenkent.tomeges_nyersikiegyenlites = bot_settings.korpercenkent.tomeges_nyersikiegyenlites;
            korpercenkent.tomeges_ermeveres = bot_settings.korpercenkent.tomeges_ermeveres;
            // tömeges gyűjtögetés
            tomeges_gyujtogetes_tamadobol_ideje = bot_settings.tomeges_gyujtogetes_tamadobol_ideje;
            tomeges_gyujtogetes_vedobol_ideje = bot_settings.tomeges_gyujtogetes_vedobol_ideje;
            tomeges_gyujtogetes_premiummal = bot_settings.tomeges_gyujtogetes_premiummal;
            tomeges_landzsa = bot_settings.tomeges_landzsa;
            tomeges_kardos = bot_settings.tomeges_kardos;
            tomeges_bardos = bot_settings.tomeges_bardos;
            tomeges_ijasz = bot_settings.tomeges_ijasz;
            tomeges_konnyulo = bot_settings.tomeges_konnyulo;
            tomeges_lovasij = bot_settings.tomeges_lovasij;
            tomeges_nehezlo = bot_settings.tomeges_nehezlo;
            tomeges_landzsa_faluban_marad = bot_settings.tomeges_landzsa_faluban_marad;
            tomeges_kardos_faluban_marad = bot_settings.tomeges_kardos_faluban_marad;
            tomeges_bardos_faluban_marad = bot_settings.tomeges_bardos_faluban_marad;
            tomeges_ijasz_faluban_marad = bot_settings.tomeges_ijasz_faluban_marad;
            tomeges_konnyulo_faluban_marad = bot_settings.tomeges_konnyulo_faluban_marad;
            tomeges_lovasij_faluban_marad = bot_settings.tomeges_lovasij_faluban_marad;
            tomeges_nehezlo_faluban_marad = bot_settings.tomeges_nehezlo_faluban_marad;
            // tömeges nyersanyagkiegyenlítő
            tomeges_nyersanyagkiegyenlito_tanya_nagy = bot_settings.tomeges_nyersanyagkiegyenlito_tanya_nagy;
            tomeges_nyersanyagkiegyenlito_tanya_kicsi = bot_settings.tomeges_nyersanyagkiegyenlito_tanya_kicsi;
            tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek = bot_settings.tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek;
            tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek = bot_settings.tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek;
            tomeges_nyersanyagkiegyenlito_premiummal = bot_settings.tomeges_nyersanyagkiegyenlito_premiummal;
            // tömeges érmézés
            tomeges_ermezes_itt = bot_settings.tomeges_ermezes_itt;
            tomeges_ermezes_max_erme = bot_settings.tomeges_ermezes_max_erme;
            ///////////////////////////////////////////////////////////////////////////////////////
            if (document.URL.match("screen=settings")) {
                function create_visual() {
                    var table = document.getElementsByClassName("vis modemenu")[0];
                    var row = table.insertRow(0);
                    var cell1 = row.insertCell(0);
                    cell1.innerHTML = '<a id="setup_visual"; href=#;> BOT SETTINGS </a>';
                    cell1.style = 'min-width: 80px';

                    var style = document.createElement('style');
                    style.innerHTML = `
                    .switch {
                        position: relative;
                        display: inline-block;
                        width: 60px;
                        height: 18px;
                    }
                    /* Hide default HTML checkbox */
                    .switch input {
                        opacity: 0;
                        width: 0;
                        height: 0;
                    }

                    * The slider */
                    slider {
                        position: absolute;
                        cursor: pointer;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-color: #ccc;
                        -webkit-transition: .4s;
                        transition: .4s;
                    }
                    .slider:before {
                        position: absolute;
                        content: "";
                        height: 13px;
                        width: 20px;
                        left: 4px;
                        bottom: 3px;
                        background-color: white;
                        -webkit-transition: .4s;
                        transition: .4s;
                    }
                    input:checked + .slider {
                        background-color: #2196F3;
                    }
                    input:focus + .slider {
                        box-shadow: 0 0 1px #2196F3;
                    }
                    input:checked + .slider:before {
                        -webkit-transform: translateX(26px);
                        -ms-transform: translateX(26px);
                        transform: translateX(26px);
                    }
                    /* Rounded sliders */
                    .slider.round {
                        border-radius: 9px;
                    }
                    .slider.round:before {
                        border-radius: 40%;
                    }
                    `;
                    document.head.appendChild(style);

                    function setup_visual() {
                        document.getElementById("content_value").getElementsByClassName("vis settings")[0].offsetParent.remove();
                        document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].insertCell();
                        document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[1].style.position = "relative";
                        document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[1].vAlign = "top";
                        document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].insertCell();
                        document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[2].style.position = "relative";
                        document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[2].vAlign = "top";
                        document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[1].innerHTML = '<h3>BOT SETTINGS</h3><p>&nbsp;</p><table class="vis modemenu" style="position: relative;"> <tbody> <tr> <td style="min-width: 80px;"><a id="options_visual_basic"; href="#">Basic </a></td> </tr> <tr> <td style="min-width: 80px;"><a id="options_visual_server"; href="#">Server </a></td> </tr> <tr> <td style="min-width: 80px;"><a id="options_visual_villages"; href="#">Villages </a></td> </tr> <tr> <td style="min-width: 80px;"><a id="options_visual_farm"; href="#">Farm </a></td> </tr> <tr> <td style="min-width: 80px;"><a id="options_visual_exchange"; href="#">Premium Exchange </a></td> </tr> <tr> <td style="min-width: 80px;"><a id="options_visual_scavenge"; href="#">Scavenge </a></td> </tr> <tr> <td style="min-width: 80px;"><a id="options_visual_build"; href="#">Build </a></td> </tr> <tr> <td style="min-width: 80px;"><a id="options_visual_train"; href="#">Train </a></td> </tr> <tr> <td style="min-width: 80px;"><a id="options_visual_premium"; href="#">Premium </a></td> </tr> </tbody></table>';
                        setInterval(input_change_checker, 100);
                        document.getElementById("options_visual_basic").addEventListener("click", function () {
                            options_visual("basic");
                        });
                        document.getElementById("options_visual_server").addEventListener("click", function () {
                            options_visual("server");
                        });
                        document.getElementById("options_visual_villages").addEventListener("click", function () {
                            options_visual("villages");
                        });
                        document.getElementById("options_visual_farm").addEventListener("click", function () {
                            options_visual("farm");
                        });
                        document.getElementById("options_visual_exchange").addEventListener("click", function () {
                            options_visual("exchange");
                        });
                        document.getElementById("options_visual_scavenge").addEventListener("click", function () {
                            options_visual("scavenge");
                        });
                        document.getElementById("options_visual_build").addEventListener("click", function () {
                            options_visual("build");
                        });
                        document.getElementById("options_visual_train").addEventListener("click", function () {
                            options_visual("train");
                        });
                        document.getElementById("options_visual_premium").addEventListener("click", function () {
                            options_visual("premium");
                        });
                        setInterval(save_bot_settings, 1000);
                    }
                    function options_visual(menu) {
                        if (menu === "basic") {
                            document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[2].innerHTML = '<table class="vis modemenu" style="position: relative;"> <tbody> <tr> <td style="min-width: 120px;">License status</td> <td style="min-width: 300px; vertical-align: middle;"><label id="status"></label></td> </tr> <tr> <td style="min-width: 120px;">Premium active</td> <td style="min-width: 300px;"><label class="switch"> <input id="premium_fiok" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Relog if idle</td> <td style="min-width: 300px;"><input id="kilep_ha_tetlen" max="100" min="1" type="range" value="10" ></input><label id="kilep_ha_tetlen_label"></label></td> </tr> <tr> <td style="min-width: 120px;">Humanizer</td> <td style="min-width: 300px;"><label class="switch"> <input id="emberi_mozzanatok" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Login/relog</td> <td style="min-width: 300px;"><label class="switch"> <input id="visszalepes" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Farming</td> <td style="min-width: 300px;"><label class="switch"> <input id="farm" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Farm players</td> <td style="min-width: 300px;"><label class="switch"> <input id="jatekosfarm" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Scavenge</td> <td style="min-width: 300px;"><label class="switch"> <input id="gyujtogetes" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Building</td> <td style="min-width: 300px;"><label class="switch"> <input id="epites" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Training</td> <td style="min-width: 300px;"><label class="switch"> <input id="kepzes" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Quests</td> <td style="min-width: 300px;"><label class="switch"> <input id="kuldetesek" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Inventory res</td> <td style="min-width: 300px;"><label class="switch"> <input id="leltar_nyersi" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Daily bonus</td> <td style="min-width: 300px;"><label class="switch"> <input id="napi_bonusz" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Bot check</td> <td style="min-width: 300px;"><input id="botriado" max="2" min="0" type="range" value="0" ></input><label id="bot_check_label"></label></td> </tr> <tr> <td style="min-width: 120px;">Circle time</td> <td style="min-width: 300px;"><input id="korperc" max="100" min="1" type="range" value="10" ></input><label id="circle_time_label"></label></td> </tr> <tr> <td style="min-width: 120px;">&nbsp;</td> </tr> <tr> <td style="min-width: 120px;">Mass scavenge</td> <td style="min-width: 300px;"><label class="switch"> <input id="tomeges_gyujti" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Mass unlock scavenge options</td> <td style="min-width: 300px;"><label class="switch"> <input id="tomeges_gyujti_feloldas" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Mass building</td> <td style="min-width: 300px;"><label class="switch"> <input id="tomeges_kikepzes" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Mass training</td> <td style="min-width: 300px;"><label class="switch"> <input id="tomeges_epites" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Destroy barbarian walls</td> <td style="min-width: 300px;"><label class="switch"> <input id="barbar_faluk_kosozasa" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Resource balance</td> <td style="min-width: 300px;"><label class="switch"> <input id="nyersikiegyenlites" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Mass mint</td> <td style="min-width: 300px;"><label class="switch"> <input id="ermeveretes" type="checkbox" /> <span class="slider round"></span></label></td> </tr> </tbody></table>';
                        }
                        if (menu === "server") {
                            document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[2].innerHTML = '<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><table class="vis modemenu" style="position: relative;"> <tbody> <tr> <td style="min-width: 120px;">Server</td> <td style="min-width: 300px;"><input id="szerver" size="10" type="text" /></td> </tr> <tr> <td style="min-width: 120px;">Market</td> <td style="min-width: 300px;"><select id="nemzet"> <option value="en">en</option> <option value="de">de</option> <option value="hu">hu</option> <option value="ch">ch</option> <option value="nl">nl</option> <option value="pl">pl</option> <option value="br">br</option> <option value="pt">pt</option> <option value="cs">cs</option> <option value="ro">ro</option> <option value="ru">ru</option> <option value="gr">hr</option> <option value="sk">sk</option> <option value="it">it</option> <option value="tr">tr</option> <option value="fr">fr</option> <option value="es">es</option> <option value="ae">ae</option> <option value="uk">uk</option> <option value="us">us</option> <option value="beta">beta</option></select></td> </tr> <tr> <td style="min-width: 120px;">Map data update</td> <td style="min-width: 300px;"><input id="terkepfrissites" max="24" min="1" type="range" value="6" ></input><label id="terkepfrissites_label"></label></td> </tr> </tbody></table>';
                        }
                        if (menu === "villages") {
                            document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[2].innerHTML = '<table class="vis modemenu" style="position: relative;"> <tbody> <tr> <td style="min-width: 120px;">Offensive villages</td> <td style="min-width: 300px;"><textarea style="width: 300px" "height: 600px" type="text" id="csoport_tamado" value=""></textarea></td> </tr> <tr> <td style="min-width: 120px;">Frontline deff villages</td> <td style="min-width: 300px;"><textarea style="width: 300px" "height: 600px" type="text" id="csoport_frontvedo" value=""></textarea></td> </tr> <tr> <td style="min-width: 120px;">Backline deff villages</td> <td style="min-width: 300px;"><textarea style="width: 300px" "height: 600px" type="text" id="csoport_hatsovedo" value=""></textarea></td> </tr> <tr> <td style="min-width: 120px;">Farm villages</td> <td style="min-width: 300px;"><textarea style="width: 300px" "height: 600px" type="text" id="csoport_farm" value=""></textarea></td> </tr> <tr> <td style="min-width: 120px;">Spy villages</td> <td style="min-width: 300px;"><textarea style="width: 300px" "height: 600px" type="text" id="csoport_kem" value=""></textarea></td> </tr> <tr> <td style="min-width: 120px;">Barb farm villages</td> <td style="min-width: 300px;"><textarea style="width: 300px" "height: 600px" type="text" id="csoport_barbarfarmolofaluk" value=""></textarea></td> </tr> <tr> <td style="min-width: 120px;">Player farm villages</td> <td style="min-width: 300px;"><textarea style="width: 300px" "height: 600px" type="text" id="csoport_jatekosfarmolofaluk" value=""></textarea></td> </tr> <tr> <td style="min-width: 120px;">Destroy wall villages</td> <td style="min-width: 300px;"><textarea style="width: 300px" "height: 600px" type="text" id="csoport_barbarkosozofaluk" value=""></textarea></td> </tr> </tbody></table>';
                        }
                        if (menu === "farm") {
                            document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[2].innerHTML = '<table class="vis modemenu" style="position: relative;"> <tbody><tr><td></td><td><b>Barbarian Farming</b></td></tr> <tr> <td style="min-width: 120px;">barb farm every circle time</td> <td style="min-width: 300px;"><input id="korpercenkent_barbarfarm" max="50" min="1" type="range" value="1" ></input><label id="korpercenkent_barbarfarm_label"></td> </tr> <tr> <td style="min-width: 120px;">A-B empty-full</td> <td style="min-width: 300px;"><label class="switch"> <input id="a_b_ures_teli" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Max distance</td> <td style="min-width: 300px;"><input id="max_mezo" max="50" min="1" type="range" value="20" ></input><label id="max_mezo_label"></label></td> </tr> <tr> <td style="min-width: 120px;">Template</td> <td style="min-width: 300px;"><select id="template"> <option value="a">A</option> <option value="b">B</option> <option value="c">C</option></select></td> </tr> <tr> <td style="min-width: 120px;">Minimum res to farm (C)</td> <td style="min-width: 300px;"><input id="minimum_nyersi" max="5000" min="20" type="range" value="2000" ></input><label id="minimum_nyersi_label"></label></td> </tr> <tr> <td style="min-width: 120px;">Minimum ligth (C)</td> <td style="min-width: 300px;"><input id="minimum_kl" max="300" min="1" type="range" value="50" ></input><label id="minimum_kl_label"></label></td> </tr><tr><td></td><td><b>Player Farming</b></td></tr> <tr> <td style="min-width: 120px;">player farm every circle time</td> <td style="min-width: 300px;"><input id="korpercenkent_jatekosfarm" max="50" min="1" type="range" value="1" ></input><label id="korpercenkent_jatekosfarm_label"></td> </tr> <tr> <td style="min-width: 120px;">Coords</td> <td style="min-width: 300px;"><textarea style="width: 300px" "height: 600px" type="text" id="coords" value=""></textarea></td></tr><tr><td style="min-width: 120px;">Units</td> <td style="width: 10%;"><label>spear&nbsp;</label><input id="sp" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label>sword </label><input id="sw" size="5" type="text" value=0 ></td></tr><tr><td style="min-width: 120px;"></td> <td style="width: 10%;"><label>axe &nbsp;&nbsp;&nbsp;</label><input id="ax" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label>scout </label>&nbsp;<input id="scout" size="5" type="text" value=0 ></td></tr><tr><td style="min-width: 120px;"></td> <td style="width: 10%;"><label>light &nbsp;&nbsp;</label><input id="lc" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label>heavy </label><input id="hv" size="5" type="text" value=0 ></td></tr><tr><td style="min-width: 120px;"></td> <td style="width: 10%;"><label>ram &nbsp;&nbsp;&nbsp;</label><input id="ra" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label>cata&nbsp;&nbsp; </label><input id="cat" size="5" type="text" value=0 ></td></tr><tr><td style="min-width: 120px;"></td> <td style="width: 10%;"><label>snob &nbsp;&nbsp;</label><input id="snob" size="5" type="text" value=0 ></td></tr> </tbody></table>';
                        }
                        if (menu === "exchange") {
                            document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[2].innerHTML = '<table class="vis modemenu" style="position: relative;"> <tbody> <tr> <td style="min-width: 120px;">Buy ultra fast</td> <td style="min-width: 300px;"><label class="switch"> <input id="tozsden_vasarlas_ultragyorsan" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Sell res</td> <td style="min-width: 300px;"><label class="switch"> <input id="nyersi_elad" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Buy res</td> <td style="min-width: 300px;"><label class="switch"> <input id="nyersi_vesz" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Sell res under price</td> <td style="min-width: 300px;"><input id="nyersi_elad_arfolyam" max="2500" min="64" type="range" value="100" ></input><label id="nyersi_elad_arfolyam_label"></label></td> </tr> <tr> <td style="min-width: 120px;">Buy res above price</td> <td style="min-width: 300px;"><input id="nyersi_vesz_arfolyam" max="2500" min="10" type="range" value="65" ></input><label id="nyersi_vesz_arfolyam_label"></label></td> </tr> <tr> <td style="min-width: 120px;">Buy res max pp cost</td> <td style="min-width: 300px;"><input id="nyersi_vesz_max_pp" max="300" min="1" type="range" value="15" ></input><label id="nyersi_vesz_max_pp_label"></label></td> </tr> <tr> <td style="min-width: 120px;">Leave in storage</td> <td style="min-width: 300px;"><input id="rakiban_marad" max="20000" min="1" type="range" value="500" ></input><label id="rakiban_marad_label"></label></td> </tr> <tr> <td style="min-width: 120px;">Minimum res to sell</td> <td style="min-width: 300px;"><input id="minimum_amit_elad" max="5000" min="1" type="range" value="100" ></input><label id="minimum_amit_elad_label"></label></td> </tr> <tr> <td style="min-width: 120px;">Storage fill capacity</td> <td style="min-width: 300px;"><input id="szabadkapac" max="500" min="1" type="range" value="80" ></input><label id="szabadkapac_label"></label></td> </tr> <tr> <td style="min-width: 120px;"></td></tr> <tr> <td style="min-width: 120px;">Auto Exchange</td> <td style="min-width: 300px;"><label class="switch"> <input id="auto_tozsde" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Change data to use</td> <td style="min-width: 300px;"><input id="tozsdemozgas_szamlalo" max="5000" min="400" type="range" value="1000" ></input><label id="tozsdemozgas_szamlalo_label"></label></td> </tr> <tr> <td style="min-width: 120px;">Minimum profit</td> <td style="min-width: 300px;"><input id="legkisebb_profit" max="4" min="1" type="range" value="2" step="0.1"></input><label id="legkisebb_profit_label"></label></td> </tr> <tr> <td style="min-width: 120px;">AI profit</td> <td style="min-width: 300px;"><label class="switch"> <input id="kenyszerített_profit" type="checkbox" /> <span class="slider round"></span></label></td> </tr> </tbody></table>';
                        }
                        if (menu === "scavenge") {
                            document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[2].innerHTML = '<table class="vis modemenu" style="position: relative;"> <tbody> <tr> <td style="min-width: 120px;">Scavenge every circle time</td> <td style="min-width: 300px;"> <input id="korpercenkent_gyujtogetes" max="50" min="1" type="range" value="1" ></input> <label id="korpercenkent_gyujtogetes_label"> </td> </tr> <tr> <td style="min-width: 120px;">Offensive villages</td> <td style="min-width: 300px;"><label class="switch"> <input id="támadó_faluból" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <tr> <td style="min-width: 120px;">Frontline deff villages</td> <td style="min-width: 300px;"><label class="switch"> <input id="frontvédő_faluból" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <tr> <td style="min-width: 120px;">Backline deff villages</td> <td style="min-width: 300px;"><label class="switch"> <input id="hátsóvédő_faluból" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;"></td> </tr> <tr> <td>Offensive villages</td> <td style="min-width: 300px;"> <label>Max hour: &nbsp;&nbsp;&nbsp;</label><input id="tamado_gyujti_max_ora" max="24" min="1" type="range" value="4" ></input> <label id="tamado_gyujti_max_ora_label"> </td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>spear &nbsp;</label><label class="switch"> <input id="tamado_gyujti_landzsas" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="tamado_gyujti_landzsas_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>sword&nbsp;</label><label class="switch"> <input id="tamado_gyujti_kardos" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="tamado_gyujti_kardos_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>axe &nbsp;&nbsp;&nbsp;&nbsp;</label><label class="switch"> <input id="tamado_gyujti_bardos" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="tamado_gyujti_bardos_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>archer&nbsp;</label><label class="switch"> <input id="tamado_gyujti_ijasz" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="tamado_gyujti_ijasz_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>light &nbsp;&nbsp;&nbsp;</label><label class="switch"> <input id="tamado_gyujti_konnyulovas" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="tamado_gyujti_konnyulovas_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>m-arch </label><label class="switch"> <input id="tamado_gyujti_lovasijasz" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;home: <input id="tamado_gyujti_lovasijasz_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>heavy &nbsp;</label><label class="switch"> <input id="tamado_gyujti_nehezlovas" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="tamado_gyujti_nehezlovas_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td>Frontline villages</td> <td style="min-width: 300px;"> <label>Max hour: &nbsp;&nbsp;&nbsp;</label><input id="frontvedo_gyujti_max_ora" max="24" min="1" type="range" value="4" ></input> <label id="frontvedo_gyujti_max_ora_label"> </td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>spear &nbsp;</label><label class="switch"> <input id="frontvedo_gyujti_landzsas" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="frontvedo_gyujti_landzsas_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>sword&nbsp;</label><label class="switch"> <input id="frontvedo_gyujti_kardos" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="frontvedo_gyujti_kardos_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>axe &nbsp;&nbsp;&nbsp;&nbsp;</label><label class="switch"> <input id="frontvedo_gyujti_bardos" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="frontvedo_gyujti_bardos_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>archer&nbsp;</label><label class="switch"> <input id="frontvedo_gyujti_ijasz" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="frontvedo_gyujti_ijasz_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>light &nbsp;&nbsp;&nbsp;</label><label class="switch"> <input id="frontvedo_gyujti_konnyulovas" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="frontvedo_gyujti_konnyulovas_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>m-arch </label><label class="switch"> <input id="frontvedo_gyujti_lovasijasz" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;home: <input id="frontvedo_gyujti_lovasijasz_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>heavy &nbsp;</label><label class="switch"> <input id="frontvedo_gyujti_nehezlovas" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="frontvedo_gyujti_nehezlovas_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td>Backline villages</td> <td style="min-width: 300px;"> <label>Max hour: &nbsp;&nbsp;&nbsp;</label><input id="hatsovedo_gyujti_max_ora" max="24" min="1" type="range" value="4" ></input> <label id="hatsovedo_gyujti_max_ora_label"> </td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>spear &nbsp;</label><label class="switch"> <input id="hatsovedo_gyujti_landzsas" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="hatsovedo_gyujti_landzsas_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>sword&nbsp;</label><label class="switch"> <input id="hatsovedo_gyujti_kardos" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="hatsovedo_gyujti_kardos_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>axe &nbsp;&nbsp;&nbsp;&nbsp;</label><label class="switch"> <input id="hatsovedo_gyujti_bardos" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="hatsovedo_gyujti_bardos_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>archer&nbsp;</label><label class="switch"> <input id="hatsovedo_gyujti_ijasz" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="hatsovedo_gyujti_ijasz_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>light &nbsp;&nbsp;&nbsp;</label><label class="switch"> <input id="hatsovedo_gyujti_konnyulovas" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="hatsovedo_gyujti_konnyulovas_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>m-arch </label><label class="switch"> <input id="hatsovedo_gyujti_lovasijasz" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;home: <input id="hatsovedo_gyujti_lovasijasz_otthon" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>heavy &nbsp;</label><label class="switch"> <input id="hatsovedo_gyujti_nehezlovas" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;home: <input id="hatsovedo_gyujti_nehezlovas_otthon" size="5" type="text" value=0 ></td> </tr> </tbody></table>';
                        }
                        if (menu === "build") {
                            document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[2].innerHTML = '<table class="vis modemenu" style="position: relative;"> <tbody> <tr> <td style="min-width: 120px;">Build every circle time</td> <td style="min-width: 300px;"> <input id="korpercenkent_epites" max="50" min="1" type="range" value="1" ></input> <label id="korpercenkent_epites_label"> </td> </tr><tr> <td style="min-width: 120px;">Start phase</td> <td style="min-width: 300px;"><label class="switch"> <input id="kezdetek" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr><td style="min-width: 120px;"></td></tr> <tr> <td style="min-width: 120px;">Buildings</td> <td style="min-width: 300px;">&nbsp;main: &nbsp;&nbsp;&nbsp;&nbsp;<input id="Fohadiszallas" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;barracks: <input id="Barakk" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;stable: &nbsp;&nbsp;&nbsp;<input id="Istallo" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;garage: &nbsp;&nbsp;<input id="Muhely" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;market: &nbsp;<input id="Piac" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;farm: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="Tanya" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;storage: &nbsp;<input id="Raktar" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;smith: &nbsp;&nbsp;&nbsp;<input id="Kovacsmuhely" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;wood: &nbsp;&nbsp;&nbsp;&nbsp;<input id="Fatelep" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;stone: &nbsp;&nbsp;&nbsp;<input id="Agyagbanya" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;iron: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="Vasbanya" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;snob:&nbsp;&nbsp;&nbsp;&nbsp; <input id="Akademia" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;statue: &nbsp;&nbsp;<input id="Szobor" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;place: &nbsp;&nbsp;&nbsp;&nbsp;<input id="Gyulekezohely" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;hide: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="Rejtekhely" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;wall: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input id="Fal" size="5" type="text" value=0 ></td> </tr><tr> <td style="min-width: 120px;">Force order </td> <td style="min-width: 300px;"><label class="switch"> <input id="Kenyszeritett_lista" type="checkbox" /> <span class="slider round"></span></label></td> </tr><tr> <td style="min-width: 120px;">Build storage when needed</td> <td style="min-width: 300px;"><label class="switch"> <input id="Raktar_epites_ha_kell" type="checkbox" /> <span class="slider round"></span></label></td> </tr><tr> <td style="min-width: 120px;">Build farm when needed</td> <td style="min-width: 300px;"><label class="switch"> <input id="Tanya_epites_ha_kell" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr> <td style="min-width: 120px;">Max storage percentage </td> <td style="min-width: 300px;"><input id="Max_raktar_szazalek" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;">Max farm percentage </td> <td style="min-width: 300px;"><input id="Max_tanya_szazalek" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;">Max storage level </td> <td style="min-width: 300px;"><input id="Max_raktar_szint" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;">Max farm level </td> <td style="min-width: 300px;"><input id="Max_tanya_szint" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;">Max build queue length </td> <td style="min-width: 300px;"><input id="Max_epitesi_sor" size="5" type="text" value=0 ></td> </tr> </tbody></table>';
                        }
                        if (menu === "train") {
                            document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[2].innerHTML = '<table class="vis modemenu" style="position: relative;"> <tbody> <tr> <td style="min-width: 120px;">Train every circle time</td> <td style="min-width: 300px;"> <input id="korpercenkent_kepzes" max="50" min="1" type="range" value="1" ></input> <label id="korpercenkent_kepzes_label"> </td> </tr><tr> <td style="min-width: 120px;">Avoid uneven resources</td> <td style="min-width: 300px;"><label class="switch"> <input id="avoidUnevenResources" type="checkbox" /> <span class="slider round"></span></label></td> </tr> <tr><td style="min-width: 120px;"></td></tr> <tr> <td style="min-width: 120px;">Offensive villages</td> <td style="min-width: 300px;"><label>spear &nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="tamado_sereg_spear_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="tamado_sereg_spear_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>sword&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="tamado_sereg_sword_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="tamado_sereg_sword_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>axe &nbsp;&nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="tamado_sereg_axe_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="tamado_sereg_axe_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>archer&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="tamado_sereg_archer_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="tamado_sereg_archer_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>spy &nbsp;&nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="tamado_sereg_spy_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="tamado_sereg_spy_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>light &nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="tamado_sereg_light_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="tamado_sereg_light_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>m-arch</label>&nbsp;&nbsp;&nbsp;train: <input id="tamado_sereg_marcher_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="tamado_sereg_marcher_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>heavy&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="tamado_sereg_heavy_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="tamado_sereg_heavy_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>ram &nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="tamado_sereg_ram_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="tamado_sereg_ram_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>cata &nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="tamado_sereg_catapult_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="tamado_sereg_catapult_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;">Frontline deff villages</td> <td style="min-width: 300px;"><label>spear &nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="frontvedo_sereg_spear_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="frontvedo_sereg_spear_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>sword&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="frontvedo_sereg_sword_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="frontvedo_sereg_sword_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>axe &nbsp;&nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="frontvedo_sereg_axe_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="frontvedo_sereg_axe_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>archer&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="frontvedo_sereg_archer_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="frontvedo_sereg_archer_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>spy &nbsp;&nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="frontvedo_sereg_spy_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="frontvedo_sereg_spy_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>light &nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="frontvedo_sereg_light_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="frontvedo_sereg_light_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>m-arch</label>&nbsp;&nbsp;&nbsp;train: <input id="frontvedo_sereg_marcher_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="frontvedo_sereg_marcher_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>heavy&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="frontvedo_sereg_heavy_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="frontvedo_sereg_heavy_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>ram &nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="frontvedo_sereg_ram_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="frontvedo_sereg_ram_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>cata &nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="frontvedo_sereg_catapult_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="frontvedo_sereg_catapult_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;">Backline deff villages</td> <td style="min-width: 300px;"><label>spear &nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="hatsovedo_sereg_spear_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="hatsovedo_sereg_spear_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>sword&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="hatsovedo_sereg_sword_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="hatsovedo_sereg_sword_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>axe &nbsp;&nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="hatsovedo_sereg_axe_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="hatsovedo_sereg_axe_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>archer&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="hatsovedo_sereg_archer_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="hatsovedo_sereg_archer_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>spy &nbsp;&nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="hatsovedo_sereg_spy_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="hatsovedo_sereg_spy_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>light &nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="hatsovedo_sereg_light_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="hatsovedo_sereg_light_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>m-arch</label>&nbsp;&nbsp;&nbsp;train: <input id="hatsovedo_sereg_marcher_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="hatsovedo_sereg_marcher_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>heavy&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="hatsovedo_sereg_heavy_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="hatsovedo_sereg_heavy_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>ram &nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="hatsovedo_sereg_ram_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="hatsovedo_sereg_ram_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>cata &nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="hatsovedo_sereg_catapult_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="hatsovedo_sereg_catapult_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;">Farm villages</td> <td style="min-width: 300px;"><label>spear &nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="farm_sereg_spear_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="farm_sereg_spear_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>sword&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="farm_sereg_sword_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="farm_sereg_sword_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>axe &nbsp;&nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="farm_sereg_axe_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="farm_sereg_axe_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>archer&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="farm_sereg_archer_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="farm_sereg_archer_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>spy &nbsp;&nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="farm_sereg_spy_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="farm_sereg_spy_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>light &nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="farm_sereg_light_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="farm_sereg_light_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>m-arch</label>&nbsp;&nbsp;&nbsp;train: <input id="farm_sereg_marcher_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="farm_sereg_marcher_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>heavy&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="farm_sereg_heavy_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="farm_sereg_heavy_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>ram &nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="farm_sereg_ram_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="farm_sereg_ram_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>cata &nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="farm_sereg_catapult_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="farm_sereg_catapult_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;">Spy villages</td> <td style="min-width: 300px;"><label>spear &nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="kem_sereg_spear_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="kem_sereg_spear_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>sword&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="kem_sereg_sword_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="kem_sereg_sword_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>axe &nbsp;&nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="kem_sereg_axe_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="kem_sereg_axe_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>archer&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="kem_sereg_archer_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="kem_sereg_archer_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>spy &nbsp;&nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="kem_sereg_spy_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="kem_sereg_spy_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>light &nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="kem_sereg_light_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="kem_sereg_light_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>m-arch</label>&nbsp;&nbsp;&nbsp;train: <input id="kem_sereg_marcher_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="kem_sereg_marcher_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>heavy&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="kem_sereg_heavy_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="kem_sereg_heavy_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>ram &nbsp;&nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="kem_sereg_ram_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="kem_sereg_ram_max" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;"><label>cata &nbsp;&nbsp;</label>&nbsp;&nbsp;&nbsp;&nbsp;train: <input id="kem_sereg_catapult_train" size="5" type="text" value=0 >&nbsp;&nbsp;&nbsp;&nbsp;max: <input id="kem_sereg_catapult_max" size="5" type="text" value=0 ></td> </tr> </tbody></table>';
                        }
                        if (menu === "premium") {
                            document.getElementById("content_value").getElementsByTagName("table")[0].rows[0].cells[2].innerHTML = '<table class="vis modemenu" style="position: relative;"> <tbody> <tr> <td style="min-width: 120px;">Mass scavenge every circle time</td> <td style="min-width: 300px;"> <input id="korpercenkent_tomeges_gyujti" max="50" min="1" type="range" value="1" ></input> <label id="korpercenkent_tomeges_gyujti_label"> </td> </tr> <tr> <td style="min-width: 120px;">Mass scavenge options unlock every circle time</td> <td style="min-width: 300px;"> <input id="korpercenkent_tomeges_gyujti_feloldas" max="50" min="1" type="range" value="4" ></input> <label id="korpercenkent_tomeges_gyujti_feloldas_label"> </td> </tr> <tr> <td style="min-width: 120px;">Mass train every circle time</td> <td style="min-width: 300px;"> <input id="korpercenkent_tomeges_kikepzes" max="50" min="1" type="range" value="1" ></input> <label id="korpercenkent_tomeges_kikepzes_label"> </td> </tr> <tr> <td style="min-width: 120px;">Mass build every circle time</td> <td style="min-width: 300px;"> <input id="korpercenkent_tomeges_epites" max="50" min="1" type="range" value="2" ></input> <label id="korpercenkent_tomeges_epites_label"> </td> </tr> <tr> <td style="min-width: 120px;">Mass catapult barbarian walls every circle time</td> <td style="min-width: 300px;"> <input id="korpercenkent_tomeges_barbar_faluk_kosozasa" max="50" min="1" type="range" value="20" ></input> <label id="korpercenkent_tomeges_barbar_faluk_kosozasa_label"> </td> </tr> <tr> <td style="min-width: 120px;">Mass res balance every circle time</td> <td style="min-width: 300px;"> <input id="korpercenkent_tomeges_nyersikiegyenlites" max="50" min="1" type="range" value="10" ></input> <label id="korpercenkent_tomeges_nyersikiegyenlites_label"> </td> </tr> <tr> <td style="min-width: 120px;">Mass coin mint every circle time</td> <td style="min-width: 300px;"> <input id="korpercenkent_tomeges_ermeveres" max="50" min="1" type="range" value="10" ></input> <label id="korpercenkent_tomeges_ermeveres_label"> </td> </tr> <tr><td style="min-width: 120px;"></td></tr> <tr> <td style="min-width: 120px;">Mass scavenge options</td> <td style="min-width: 300px;">off time (h) <input id="tomeges_gyujtogetes_tamadobol_ideje" size="5" type="text" value=0 > deff time (h): <input id="tomeges_gyujtogetes_vedobol_ideje" size="5" type="text" value=0 > <p> &nbsp;use premium &nbsp;<label class="switch"> <input id="tomeges_gyujtogetes_premiummal" type="checkbox" /> <span class="slider round"></span></label></p></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;spear: &nbsp;&nbsp;<label class="switch"> <input id="tomeges_landzsa" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;in village: &nbsp;&nbsp;<input id="tomeges_landzsa_faluban_marad" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;sword: &nbsp;<label class="switch"> <input id="tomeges_kardos" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;in village: &nbsp;&nbsp;<input id="tomeges_kardos_faluban_marad" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;axe: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label class="switch"> <input id="tomeges_bardos" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;in village: &nbsp;&nbsp;<input id="tomeges_bardos_faluban_marad" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;archer: &nbsp;<label class="switch"> <input id="tomeges_ijasz" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;in village: &nbsp;&nbsp;<input id="tomeges_ijasz_faluban_marad" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;light: &nbsp;&nbsp;&nbsp;&nbsp;<label class="switch"> <input id="tomeges_konnyulo" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;in village: &nbsp;&nbsp;<input id="tomeges_konnyulo_faluban_marad" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;m-arch:&nbsp;<label class="switch"> <input id="tomeges_lovasij" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;in village: &nbsp;&nbsp;<input id="tomeges_lovasij_faluban_marad" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;heavy: &nbsp;&nbsp;<label class="switch"> <input id="tomeges_nehezlo" type="checkbox" /> <span class="slider round"></span></label>&nbsp;&nbsp;&nbsp;&nbsp;in village: &nbsp;&nbsp;<input id="tomeges_nehezlo_faluban_marad" size="5" type="text" value=0 ></td> </tr><tr> <td style="min-width: 120px;">Resource balance options</td> <td style="min-width: 300px;">&nbsp;farm low: <input id="tomeges_nyersanyagkiegyenlito_tanya_kicsi" size="5" type="text" value=0 >&nbsp; farm high: <input id="tomeges_nyersanyagkiegyenlito_tanya_nagy" size="5" type="text" value=0 ></td> </tr> <tr> <td style="min-width: 120px;"></td> <td style="min-width: 300px;">&nbsp;built out %: <input id="tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek" size="5" type="text" value=0 > &nbsp;needs more %: <input id="tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek" size="5" type="text" value=0 > <p> &nbsp;use premium &nbsp;<label class="switch"> <input id="tomeges_nyersanyagkiegyenlito_premiummal" type="checkbox" /> <span class="slider round"></span></label></p></td> </tr> </tbody></table>';
                        }
                        setTimeout(load_visual_settings(menu), 200);
                    }
                    document.getElementById("setup_visual").addEventListener("click", function () {
                        setup_visual();
                    });
                }
                function load_visual_settings(menu) {
                    if (menu === "basic") {
                        if (premium_fiok === 1) { document.getElementById("premium_fiok").checked = true; }
                        else if (premium_fiok === 0) { document.getElementById("premium_fiok").checked = false; }
                        document.getElementById("kilep_ha_tetlen").value = +kilep_ha_tetlen;
                        if (emberi_mozzanatok === 1) { document.getElementById("emberi_mozzanatok").checked = true; }
                        else if (emberi_mozzanatok === 0) { document.getElementById("emberi_mozzanatok").checked = false; }
                        if (visszalepes === 1) { document.getElementById("visszalepes").checked = true; }
                        else if (visszalepes === 0) { document.getElementById("visszalepes").checked = false; }
                        if (farm === 1) { document.getElementById("farm").checked = true; }
                        else if (farm === 0) { document.getElementById("farm").checked = false; }
                        if (jatekosfarm === 1) { document.getElementById("jatekosfarm").checked = true; }
                        else if (jatekosfarm === 0) { document.getElementById("jatekosfarm").checked = false; }
                        if (gyujtogetes === 1) { document.getElementById("gyujtogetes").checked = true; }
                        else if (gyujtogetes === 0) { document.getElementById("gyujtogetes").checked = false; }
                        if (epites === 1) { document.getElementById("epites").checked = true; }
                        else if (epites === 0) { document.getElementById("epites").checked = false; }
                        if (kepzes === 1) { document.getElementById("kepzes").checked = true; }
                        else if (kepzes === 0) { document.getElementById("kepzes").checked = false; }
                        if (kuldetesek === 1) { document.getElementById("kuldetesek").checked = true; }
                        else if (kuldetesek === 0) { document.getElementById("kuldetesek").checked = false; }
                        if (leltar_nyersi === 1) { document.getElementById("leltar_nyersi").checked = true; }
                        else if (leltar_nyersi === 0) { document.getElementById("leltar_nyersi").checked = false; }
                        if (napi_bonusz === 1) { document.getElementById("napi_bonusz").checked = true; }
                        else if (napi_bonusz === 0) { document.getElementById("napi_bonusz").checked = false; }
                        document.getElementById("botriado").value = +botriado;
                        document.getElementById("korperc").value = +korperc;
                        // Prémium opciók
                        if (tomeges_gyujti === 1) { document.getElementById("tomeges_gyujti").checked = true; }
                        else if (tomeges_gyujti === 0) { document.getElementById("tomeges_gyujti").checked = false; }
                        if (tomeges_gyujti_feloldas === 1) { document.getElementById("tomeges_gyujti_feloldas").checked = true; }
                        else if (tomeges_gyujti_feloldas === 0) { document.getElementById("tomeges_gyujti_feloldas").checked = false; }
                        if (tomeges_kikepzes === 1) { document.getElementById("tomeges_kikepzes").checked = true; }
                        else if (tomeges_kikepzes === 0) { document.getElementById("tomeges_kikepzes").checked = false; }
                        if (tomeges_epites === 1) { document.getElementById("tomeges_epites").checked = true; }
                        else if (tomeges_epites === 0) { document.getElementById("tomeges_epites").checked = false; }
                        if (barbar_faluk_kosozasa === 1) { document.getElementById("barbar_faluk_kosozasa").checked = true; }
                        else if (barbar_faluk_kosozasa === 0) { document.getElementById("barbar_faluk_kosozasa").checked = false; }
                        if (nyersikiegyenlites === 1) { document.getElementById("nyersikiegyenlites").checked = true; }
                        else if (nyersikiegyenlites === 0) { document.getElementById("nyersikiegyenlites").checked = false; }
                        if (ermeveretes === 1) { document.getElementById("ermeveretes").checked = true; }
                        else if (ermeveretes === 0) { document.getElementById("ermeveretes").checked = false; }
                    }
                    if (menu === "server") {
                        document.getElementById("szerver").value = szerver;
                        document.getElementById("nemzet").value = nemzet;
                        document.getElementById("terkepfrissites").value = terkepfrissites;
                    }
                    if (menu === "villages") {
                        document.getElementById("csoport_tamado").value = faluk.csoport.tamado;
                        document.getElementById("csoport_frontvedo").value = faluk.csoport.frontvedo;
                        document.getElementById("csoport_hatsovedo").value = faluk.csoport.hatsovedo;
                        document.getElementById("csoport_farm").value = faluk.csoport.farm;
                        document.getElementById("csoport_kem").value = faluk.csoport.kem;
                        document.getElementById("csoport_barbarfarmolofaluk").value = faluk.csoport.barbarfarmolofaluk;
                        document.getElementById("csoport_jatekosfarmolofaluk").value = faluk.csoport.jatekosfarmolofaluk;
                        document.getElementById("csoport_barbarkosozofaluk").value = faluk.csoport.barbarkosozofaluk;
                    }
                    if (menu === "farm") {
                        document.getElementById("korpercenkent_barbarfarm").value = korpercenkent.barbarfarm;
                        if (a_b_ures_teli === 1) { document.getElementById("a_b_ures_teli").checked = true; }
                        else if (a_b_ures_teli === 0) { document.getElementById("a_b_ures_teli").checked = false; }
                        document.getElementById("max_mezo").value = max_mezo;
                        document.getElementById("template").value = template;
                        document.getElementById("minimum_nyersi").value = minimum_nyersi;
                        document.getElementById("minimum_kl").value = minimum_kl;
                        // playerfarm
                        document.getElementById("korpercenkent_jatekosfarm").value = korpercenkent.jatekosfarm;
                        document.getElementById("coords").value = coords;
                        document.getElementById("sp").value = sp;
                        document.getElementById("sw").value = sw;
                        document.getElementById("ax").value = ax;
                        document.getElementById("scout").value = scout;
                        document.getElementById("lc").value = lc;
                        document.getElementById("hv").value = hv;
                        document.getElementById("ra").value = ra;
                        document.getElementById("cat").value = cat;
                        document.getElementById("snob").value = snob;
                    }
                    if (menu === "exchange") {
                        if (tozsden_vasarlas_ultragyorsan === 1) { document.getElementById("tozsden_vasarlas_ultragyorsan").checked = true; }
                        else if (tozsden_vasarlas_ultragyorsan === 0) { document.getElementById("tozsden_vasarlas_ultragyorsan").checked = false; }
                        if (nyersi_elad === 1) { document.getElementById("nyersi_elad").checked = true; }
                        else if (nyersi_elad === 0) { document.getElementById("nyersi_elad").checked = false; }
                        if (nyersi_vesz === 1) { document.getElementById("nyersi_vesz").checked = true; }
                        else if (nyersi_vesz === 0) { document.getElementById("nyersi_vesz").checked = false; }
                        document.getElementById("nyersi_elad_arfolyam").value = nyersi_elad_arfolyam;
                        document.getElementById("nyersi_vesz_arfolyam").value = nyersi_vesz_arfolyam;
                        document.getElementById("nyersi_vesz_max_pp").value = nyersi_vesz_max_pp;
                        document.getElementById("rakiban_marad").value = rakiban_marad;
                        document.getElementById("minimum_amit_elad").value = minimum_amit_elad;
                        document.getElementById("szabadkapac").value = szabadkapac;
                        if (auto_tozsde === 1) { document.getElementById("auto_tozsde").checked = true; }
                        else if (auto_tozsde === 0) { document.getElementById("auto_tozsde").checked = false; }
                        document.getElementById("tozsdemozgas_szamlalo").value = tozsdemozgas_szamlalo;
                        document.getElementById("legkisebb_profit").value = legkisebb_profit;
                        if (kenyszerített_profit === 1) { document.getElementById("kenyszerített_profit").checked = true; }
                        else if (kenyszerített_profit === 0) { document.getElementById("kenyszerített_profit").checked = false; }
                    }
                    if (menu === "scavenge") {
                        document.getElementById("korpercenkent_gyujtogetes").value = korpercenkent.gyujtogetes;
                        if (támadó_faluból === 1) { document.getElementById("támadó_faluból").checked = true; }
                        else if (támadó_faluból === 0) { document.getElementById("támadó_faluból").checked = false; }
                        if (frontvédő_faluból === 1) { document.getElementById("frontvédő_faluból").checked = true; }
                        else if (frontvédő_faluból === 0) { document.getElementById("frontvédő_faluból").checked = false; }
                        if (hátsóvédő_faluból === 1) { document.getElementById("hátsóvédő_faluból").checked = true; }
                        else if (hátsóvédő_faluból === 0) { document.getElementById("hátsóvédő_faluból").checked = false; }
                        document.getElementById("tamado_gyujti_max_ora").value = faluk.tamado_gyujti[0].max_ora;
                        if (faluk.tamado_gyujti[0].landzsas === true) { document.getElementById("tamado_gyujti_landzsas").checked = true; }
                        else if (faluk.tamado_gyujti[0].landzsas === false) { document.getElementById("tamado_gyujti_landzsas").checked = false; }
                        document.getElementById("tamado_gyujti_landzsas_otthon").value = faluk.tamado_gyujti[0].landzsas_otthon;
                        if (faluk.tamado_gyujti[0].kardos === true) { document.getElementById("tamado_gyujti_kardos").checked = true; }
                        else if (faluk.tamado_gyujti[0].kardos === false) { document.getElementById("tamado_gyujti_kardos").checked = false; }
                        document.getElementById("tamado_gyujti_kardos_otthon").value = faluk.tamado_gyujti[0].kardos_otthon;
                        if (faluk.tamado_gyujti[0].bardos === true) { document.getElementById("tamado_gyujti_bardos").checked = true; }
                        else if (faluk.tamado_gyujti[0].bardos === false) { document.getElementById("tamado_gyujti_bardos").checked = false; }
                        document.getElementById("tamado_gyujti_bardos_otthon").value = faluk.tamado_gyujti[0].bardos_otthon;
                        if (faluk.tamado_gyujti[0].ijasz === true) { document.getElementById("tamado_gyujti_ijasz").checked = true; }
                        else if (faluk.tamado_gyujti[0].ijasz === false) { document.getElementById("tamado_gyujti_ijasz").checked = false; }
                        document.getElementById("tamado_gyujti_ijasz_otthon").value = faluk.tamado_gyujti[0].ijasz_otthon;
                        if (faluk.tamado_gyujti[0].konnyulovas === true) { document.getElementById("tamado_gyujti_konnyulovas").checked = true; }
                        else if (faluk.tamado_gyujti[0].konnyulovas === false) { document.getElementById("tamado_gyujti_konnyulovas").checked = false; }
                        document.getElementById("tamado_gyujti_konnyulovas_otthon").value = faluk.tamado_gyujti[0].konnyulovas_otthon;
                        if (faluk.tamado_gyujti[0].lovasijasz === true) { document.getElementById("tamado_gyujti_lovasijasz").checked = true; }
                        else if (faluk.tamado_gyujti[0].lovasijasz === false) { document.getElementById("tamado_gyujti_lovasijasz").checked = false; }
                        document.getElementById("tamado_gyujti_lovasijasz_otthon").value = faluk.tamado_gyujti[0].lovasijasz_otthon;
                        if (faluk.tamado_gyujti[0].nehezlovas === true) { document.getElementById("tamado_gyujti_nehezlovas").checked = true; }
                        else if (faluk.tamado_gyujti[0].nehezlovas === false) { document.getElementById("tamado_gyujti_nehezlovas").checked = false; }
                        document.getElementById("tamado_gyujti_nehezlovas_otthon").value = faluk.tamado_gyujti[0].nehezlovas_otthon;

                        document.getElementById("frontvedo_gyujti_max_ora").value = faluk.frontvedo_gyujti[0].max_ora;
                        if (faluk.frontvedo_gyujti[0].landzsas === true) { document.getElementById("frontvedo_gyujti_landzsas").checked = true; }
                        else if (faluk.frontvedo_gyujti[0].landzsas === false) { document.getElementById("frontvedo_gyujti_landzsas").checked = false; }
                        document.getElementById("frontvedo_gyujti_landzsas_otthon").value = faluk.frontvedo_gyujti[0].landzsas_otthon;
                        if (faluk.frontvedo_gyujti[0].kardos === true) { document.getElementById("frontvedo_gyujti_kardos").checked = true; }
                        else if (faluk.frontvedo_gyujti[0].kardos === false) { document.getElementById("frontvedo_gyujti_kardos").checked = false; }
                        document.getElementById("frontvedo_gyujti_kardos_otthon").value = faluk.frontvedo_gyujti[0].kardos_otthon;
                        if (faluk.frontvedo_gyujti[0].bardos === true) { document.getElementById("frontvedo_gyujti_bardos").checked = true; }
                        else if (faluk.frontvedo_gyujti[0].bardos === false) { document.getElementById("frontvedo_gyujti_bardos").checked = false; }
                        document.getElementById("frontvedo_gyujti_bardos_otthon").value = faluk.frontvedo_gyujti[0].bardos_otthon;
                        if (faluk.frontvedo_gyujti[0].ijasz === true) { document.getElementById("frontvedo_gyujti_ijasz").checked = true; }
                        else if (faluk.frontvedo_gyujti[0].ijasz === false) { document.getElementById("frontvedo_gyujti_ijasz").checked = false; }
                        document.getElementById("frontvedo_gyujti_ijasz_otthon").value = faluk.frontvedo_gyujti[0].ijasz_otthon;
                        if (faluk.frontvedo_gyujti[0].konnyulovas === true) { document.getElementById("frontvedo_gyujti_konnyulovas").checked = true; }
                        else if (faluk.frontvedo_gyujti[0].konnyulovas === false) { document.getElementById("frontvedo_gyujti_konnyulovas").checked = false; }
                        document.getElementById("frontvedo_gyujti_konnyulovas_otthon").value = faluk.frontvedo_gyujti[0].konnyulovas_otthon;
                        if (faluk.frontvedo_gyujti[0].lovasijasz === true) { document.getElementById("frontvedo_gyujti_lovasijasz").checked = true; }
                        else if (faluk.frontvedo_gyujti[0].lovasijasz === false) { document.getElementById("frontvedo_gyujti_lovasijasz").checked = false; }
                        document.getElementById("frontvedo_gyujti_lovasijasz_otthon").value = faluk.frontvedo_gyujti[0].lovasijasz_otthon;
                        if (faluk.frontvedo_gyujti[0].nehezlovas === true) { document.getElementById("frontvedo_gyujti_nehezlovas").checked = true; }
                        else if (faluk.frontvedo_gyujti[0].nehezlovas === false) { document.getElementById("frontvedo_gyujti_nehezlovas").checked = false; }
                        document.getElementById("frontvedo_gyujti_nehezlovas_otthon").value = faluk.frontvedo_gyujti[0].nehezlovas_otthon;

                        document.getElementById("hatsovedo_gyujti_max_ora").value = faluk.hatsovedo_gyujti[0].max_ora;
                        if (faluk.hatsovedo_gyujti[0].landzsas === true) { document.getElementById("hatsovedo_gyujti_landzsas").checked = true; }
                        else if (faluk.hatsovedo_gyujti[0].landzsas === false) { document.getElementById("hatsovedo_gyujti_landzsas").checked = false; }
                        document.getElementById("hatsovedo_gyujti_landzsas_otthon").value = faluk.hatsovedo_gyujti[0].landzsas_otthon;
                        if (faluk.hatsovedo_gyujti[0].kardos === true) { document.getElementById("hatsovedo_gyujti_kardos").checked = true; }
                        else if (faluk.hatsovedo_gyujti[0].kardos === false) { document.getElementById("hatsovedo_gyujti_kardos").checked = false; }
                        document.getElementById("hatsovedo_gyujti_kardos_otthon").value = faluk.hatsovedo_gyujti[0].kardos_otthon;
                        if (faluk.hatsovedo_gyujti[0].bardos === true) { document.getElementById("hatsovedo_gyujti_bardos").checked = true; }
                        else if (faluk.hatsovedo_gyujti[0].bardos === false) { document.getElementById("hatsovedo_gyujti_bardos").checked = false; }
                        document.getElementById("hatsovedo_gyujti_bardos_otthon").value = faluk.hatsovedo_gyujti[0].bardos_otthon;
                        if (faluk.hatsovedo_gyujti[0].ijasz === true) { document.getElementById("hatsovedo_gyujti_ijasz").checked = true; }
                        else if (faluk.hatsovedo_gyujti[0].ijasz === false) { document.getElementById("hatsovedo_gyujti_ijasz").checked = false; }
                        document.getElementById("hatsovedo_gyujti_ijasz_otthon").value = faluk.hatsovedo_gyujti[0].ijasz_otthon;
                        if (faluk.hatsovedo_gyujti[0].konnyulovas === true) { document.getElementById("hatsovedo_gyujti_konnyulovas").checked = true; }
                        else if (faluk.hatsovedo_gyujti[0].konnyulovas === false) { document.getElementById("hatsovedo_gyujti_konnyulovas").checked = false; }
                        document.getElementById("hatsovedo_gyujti_konnyulovas_otthon").value = faluk.hatsovedo_gyujti[0].konnyulovas_otthon;
                        if (faluk.hatsovedo_gyujti[0].lovasijasz === true) { document.getElementById("hatsovedo_gyujti_lovasijasz").checked = true; }
                        else if (faluk.hatsovedo_gyujti[0].lovasijasz === false) { document.getElementById("hatsovedo_gyujti_lovasijasz").checked = false; }
                        document.getElementById("hatsovedo_gyujti_lovasijasz_otthon").value = faluk.hatsovedo_gyujti[0].lovasijasz_otthon;
                        if (faluk.hatsovedo_gyujti[0].nehezlovas === true) { document.getElementById("hatsovedo_gyujti_nehezlovas").checked = true; }
                        else if (faluk.hatsovedo_gyujti[0].nehezlovas === false) { document.getElementById("hatsovedo_gyujti_nehezlovas").checked = false; }
                        document.getElementById("hatsovedo_gyujti_nehezlovas_otthon").value = faluk.hatsovedo_gyujti[0].nehezlovas_otthon;
                    }
                    if (menu === "build") {
                        document.getElementById("korpercenkent_epites").value = korpercenkent.epites;
                        if (kezdetek === 1) { document.getElementById("kezdetek").checked = true; }
                        else if (kezdetek === 0) { document.getElementById("kezdetek").checked = false; }
                        document.getElementById("Fohadiszallas").value = Fohadiszallas;
                        document.getElementById("Barakk").value = Barakk;
                        document.getElementById("Istallo").value = Istallo;
                        document.getElementById("Muhely").value = Muhely;
                        document.getElementById("Piac").value = Piac;
                        document.getElementById("Tanya").value = Tanya;
                        document.getElementById("Raktar").value = Raktar;
                        document.getElementById("Kovacsmuhely").value = Kovacsmuhely;
                        document.getElementById("Fatelep").value = Fatelep;
                        document.getElementById("Agyagbanya").value = Agyagbanya;
                        document.getElementById("Vasbanya").value = Vasbanya;
                        document.getElementById("Akademia").value = Akademia;
                        document.getElementById("Szobor").value = Szobor;
                        document.getElementById("Gyulekezohely").value = Gyulekezohely;
                        document.getElementById("Rejtekhely").value = Rejtekhely;
                        document.getElementById("Fal").value = Fal;
                        if (Kenyszeritett_lista === true) { document.getElementById("Kenyszeritett_lista").checked = true; }
                        else if (Kenyszeritett_lista === false) { document.getElementById("Kenyszeritett_lista").checked = false; }
                        if (Raktar_epites_ha_kell === true) { document.getElementById("Raktar_epites_ha_kell").checked = true; }
                        else if (Raktar_epites_ha_kell === false) { document.getElementById("Raktar_epites_ha_kell").checked = false; }
                        if (Tanya_epites_ha_kell === true) { document.getElementById("Tanya_epites_ha_kell").checked = true; }
                        else if (Tanya_epites_ha_kell === false) { document.getElementById("Tanya_epites_ha_kell").checked = false; }
                        document.getElementById("Max_raktar_szazalek").value = Max_raktar_szazalek;
                        document.getElementById("Max_tanya_szazalek").value = Max_tanya_szazalek;
                        document.getElementById("Max_raktar_szint").value = Max_raktar_szint;
                        document.getElementById("Max_tanya_szint").value = Max_tanya_szint;
                        document.getElementById("Max_epitesi_sor").value = Max_epitesi_sor;
                    }
                    if (menu === "train") {
                        document.getElementById("korpercenkent_kepzes").value = +korpercenkent.kepzes;
                        if (avoidUnevenResources === true) { document.getElementById("avoidUnevenResources").checked = true; }
                        else if (avoidUnevenResources === false) { document.getElementById("avoidUnevenResources").checked = false; }
                        document.getElementById("tamado_sereg_spear_train").value = faluk.tamado_sereg[0].train;
                        document.getElementById("tamado_sereg_spear_max").value = faluk.tamado_sereg[0].max;
                        document.getElementById("tamado_sereg_sword_train").value = faluk.tamado_sereg[1].train;
                        document.getElementById("tamado_sereg_sword_max").value = faluk.tamado_sereg[1].max;
                        document.getElementById("tamado_sereg_axe_train").value = faluk.tamado_sereg[2].train;
                        document.getElementById("tamado_sereg_axe_max").value = faluk.tamado_sereg[2].max;
                        document.getElementById("tamado_sereg_archer_train").value = faluk.tamado_sereg[3].train;
                        document.getElementById("tamado_sereg_archer_max").value = faluk.tamado_sereg[3].max;
                        document.getElementById("tamado_sereg_spy_train").value = faluk.tamado_sereg[4].train;
                        document.getElementById("tamado_sereg_spy_max").value = faluk.tamado_sereg[4].max;
                        document.getElementById("tamado_sereg_light_train").value = faluk.tamado_sereg[5].train;
                        document.getElementById("tamado_sereg_light_max").value = faluk.tamado_sereg[5].max;
                        document.getElementById("tamado_sereg_marcher_train").value = faluk.tamado_sereg[6].train;
                        document.getElementById("tamado_sereg_marcher_max").value = faluk.tamado_sereg[6].max;
                        document.getElementById("tamado_sereg_heavy_train").value = faluk.tamado_sereg[7].train;
                        document.getElementById("tamado_sereg_heavy_max").value = faluk.tamado_sereg[7].max;
                        document.getElementById("tamado_sereg_ram_train").value = faluk.tamado_sereg[8].train;
                        document.getElementById("tamado_sereg_ram_max").value = faluk.tamado_sereg[8].max;
                        document.getElementById("tamado_sereg_catapult_train").value = faluk.tamado_sereg[9].train;
                        document.getElementById("tamado_sereg_catapult_max").value = faluk.tamado_sereg[9].max;

                        document.getElementById("frontvedo_sereg_spear_train").value = faluk.frontvedo_sereg[0].train;
                        document.getElementById("frontvedo_sereg_spear_max").value = faluk.frontvedo_sereg[0].max;
                        document.getElementById("frontvedo_sereg_sword_train").value = faluk.frontvedo_sereg[1].train;
                        document.getElementById("frontvedo_sereg_sword_max").value = faluk.frontvedo_sereg[1].max;
                        document.getElementById("frontvedo_sereg_axe_train").value = faluk.frontvedo_sereg[2].train;
                        document.getElementById("frontvedo_sereg_axe_max").value = faluk.frontvedo_sereg[2].max;
                        document.getElementById("frontvedo_sereg_archer_train").value = faluk.frontvedo_sereg[3].train;
                        document.getElementById("frontvedo_sereg_archer_max").value = faluk.frontvedo_sereg[3].max;
                        document.getElementById("frontvedo_sereg_spy_train").value = faluk.frontvedo_sereg[4].train;
                        document.getElementById("frontvedo_sereg_spy_max").value = faluk.frontvedo_sereg[4].max;
                        document.getElementById("frontvedo_sereg_light_train").value = faluk.frontvedo_sereg[5].train;
                        document.getElementById("frontvedo_sereg_light_max").value = faluk.frontvedo_sereg[5].max;
                        document.getElementById("frontvedo_sereg_marcher_train").value = faluk.frontvedo_sereg[6].train;
                        document.getElementById("frontvedo_sereg_marcher_max").value = faluk.frontvedo_sereg[6].max;
                        document.getElementById("frontvedo_sereg_heavy_train").value = faluk.frontvedo_sereg[7].train;
                        document.getElementById("frontvedo_sereg_heavy_max").value = faluk.frontvedo_sereg[7].max;
                        document.getElementById("frontvedo_sereg_ram_train").value = faluk.frontvedo_sereg[8].train;
                        document.getElementById("frontvedo_sereg_ram_max").value = faluk.frontvedo_sereg[8].max;
                        document.getElementById("frontvedo_sereg_catapult_train").value = faluk.frontvedo_sereg[9].train;
                        document.getElementById("frontvedo_sereg_catapult_max").value = faluk.frontvedo_sereg[9].max;

                        document.getElementById("hatsovedo_sereg_spear_train").value = faluk.hatsovedo_sereg[0].train;
                        document.getElementById("hatsovedo_sereg_spear_max").value = faluk.hatsovedo_sereg[0].max;
                        document.getElementById("hatsovedo_sereg_sword_train").value = faluk.hatsovedo_sereg[1].train;
                        document.getElementById("hatsovedo_sereg_sword_max").value = faluk.hatsovedo_sereg[1].max;
                        document.getElementById("hatsovedo_sereg_axe_train").value = faluk.hatsovedo_sereg[2].train;
                        document.getElementById("hatsovedo_sereg_axe_max").value = faluk.hatsovedo_sereg[2].max;
                        document.getElementById("hatsovedo_sereg_archer_train").value = faluk.hatsovedo_sereg[3].train;
                        document.getElementById("hatsovedo_sereg_archer_max").value = faluk.hatsovedo_sereg[3].max;
                        document.getElementById("hatsovedo_sereg_spy_train").value = faluk.hatsovedo_sereg[4].train;
                        document.getElementById("hatsovedo_sereg_spy_max").value = faluk.hatsovedo_sereg[4].max;
                        document.getElementById("hatsovedo_sereg_light_train").value = faluk.hatsovedo_sereg[5].train;
                        document.getElementById("hatsovedo_sereg_light_max").value = faluk.hatsovedo_sereg[5].max;
                        document.getElementById("hatsovedo_sereg_marcher_train").value = faluk.hatsovedo_sereg[6].train;
                        document.getElementById("hatsovedo_sereg_marcher_max").value = faluk.hatsovedo_sereg[6].max;
                        document.getElementById("hatsovedo_sereg_heavy_train").value = faluk.hatsovedo_sereg[7].train;
                        document.getElementById("hatsovedo_sereg_heavy_max").value = faluk.hatsovedo_sereg[7].max;
                        document.getElementById("hatsovedo_sereg_ram_train").value = faluk.hatsovedo_sereg[8].train;
                        document.getElementById("hatsovedo_sereg_ram_max").value = faluk.hatsovedo_sereg[8].max;
                        document.getElementById("hatsovedo_sereg_catapult_train").value = faluk.hatsovedo_sereg[9].train;
                        document.getElementById("hatsovedo_sereg_catapult_max").value = faluk.hatsovedo_sereg[9].max;

                        document.getElementById("farm_sereg_spear_train").value = faluk.farm_sereg[0].train;
                        document.getElementById("farm_sereg_spear_max").value = faluk.farm_sereg[0].max;
                        document.getElementById("farm_sereg_sword_train").value = faluk.farm_sereg[1].train;
                        document.getElementById("farm_sereg_sword_max").value = faluk.farm_sereg[1].max;
                        document.getElementById("farm_sereg_axe_train").value = faluk.farm_sereg[2].train;
                        document.getElementById("farm_sereg_axe_max").value = faluk.farm_sereg[2].max;
                        document.getElementById("farm_sereg_archer_train").value = faluk.farm_sereg[3].train;
                        document.getElementById("farm_sereg_archer_max").value = faluk.farm_sereg[3].max;
                        document.getElementById("farm_sereg_spy_train").value = faluk.farm_sereg[4].train;
                        document.getElementById("farm_sereg_spy_max").value = faluk.farm_sereg[4].max;
                        document.getElementById("farm_sereg_light_train").value = faluk.farm_sereg[5].train;
                        document.getElementById("farm_sereg_light_max").value = faluk.farm_sereg[5].max;
                        document.getElementById("farm_sereg_marcher_train").value = faluk.farm_sereg[6].train;
                        document.getElementById("farm_sereg_marcher_max").value = faluk.farm_sereg[6].max;
                        document.getElementById("farm_sereg_heavy_train").value = faluk.farm_sereg[7].train;
                        document.getElementById("farm_sereg_heavy_max").value = faluk.farm_sereg[7].max;
                        document.getElementById("farm_sereg_ram_train").value = faluk.farm_sereg[8].train;
                        document.getElementById("farm_sereg_ram_max").value = faluk.farm_sereg[8].max;
                        document.getElementById("farm_sereg_catapult_train").value = faluk.farm_sereg[9].train;
                        document.getElementById("farm_sereg_catapult_max").value = faluk.farm_sereg[9].max;

                        document.getElementById("kem_sereg_spear_train").value = faluk.kem_sereg[0].train;
                        document.getElementById("kem_sereg_spear_max").value = faluk.kem_sereg[0].max;
                        document.getElementById("kem_sereg_sword_train").value = faluk.kem_sereg[1].train;
                        document.getElementById("kem_sereg_sword_max").value = faluk.kem_sereg[1].max;
                        document.getElementById("kem_sereg_axe_train").value = faluk.kem_sereg[2].train;
                        document.getElementById("kem_sereg_axe_max").value = faluk.kem_sereg[2].max;
                        document.getElementById("kem_sereg_archer_train").value = faluk.kem_sereg[3].train;
                        document.getElementById("kem_sereg_archer_max").value = faluk.kem_sereg[3].max;
                        document.getElementById("kem_sereg_spy_train").value = faluk.kem_sereg[4].train;
                        document.getElementById("kem_sereg_spy_max").value = faluk.kem_sereg[4].max;
                        document.getElementById("kem_sereg_light_train").value = faluk.kem_sereg[5].train;
                        document.getElementById("kem_sereg_light_max").value = faluk.kem_sereg[5].max;
                        document.getElementById("kem_sereg_marcher_train").value = faluk.kem_sereg[6].train;
                        document.getElementById("kem_sereg_marcher_max").value = faluk.kem_sereg[6].max;
                        document.getElementById("kem_sereg_heavy_train").value = faluk.kem_sereg[7].train;
                        document.getElementById("kem_sereg_heavy_max").value = faluk.kem_sereg[7].max;
                        document.getElementById("kem_sereg_ram_train").value = faluk.kem_sereg[8].train;
                        document.getElementById("kem_sereg_ram_max").value = faluk.kem_sereg[8].max;
                        document.getElementById("kem_sereg_catapult_train").value = faluk.kem_sereg[9].train;
                        document.getElementById("kem_sereg_catapult_max").value = faluk.kem_sereg[9].max;
                    }
                    if (menu === "premium") {
                        document.getElementById("korpercenkent_tomeges_gyujti").value = +korpercenkent.tomeges_gyujti;
                        document.getElementById("korpercenkent_tomeges_gyujti_feloldas").value = +korpercenkent.tomeges_gyujti_feloldas;
                        document.getElementById("korpercenkent_tomeges_kikepzes").value = +korpercenkent.tomeges_kikepzes;
                        document.getElementById("korpercenkent_tomeges_epites").value = +korpercenkent.tomeges_epites;
                        document.getElementById("korpercenkent_tomeges_barbar_faluk_kosozasa").value = +korpercenkent.tomeges_barbar_faluk_kosozasa;
                        document.getElementById("korpercenkent_tomeges_nyersikiegyenlites").value = +korpercenkent.tomeges_nyersikiegyenlites;
                        document.getElementById("korpercenkent_tomeges_ermeveres").value = +korpercenkent.tomeges_ermeveres;

                        document.getElementById("tomeges_gyujtogetes_tamadobol_ideje").value = +tomeges_gyujtogetes_tamadobol_ideje;
                        document.getElementById("tomeges_gyujtogetes_vedobol_ideje").value = +tomeges_gyujtogetes_vedobol_ideje;
                        if (tomeges_gyujtogetes_premiummal === true) { document.getElementById("tomeges_gyujtogetes_premiummal").checked = true; }
                        else if (tomeges_gyujtogetes_premiummal === false) { document.getElementById("tomeges_gyujtogetes_premiummal").checked = false; }
                        if (tomeges_landzsa === 1) { document.getElementById("tomeges_landzsa").checked = true; }
                        else if (tomeges_landzsa === 0) { document.getElementById("tomeges_landzsa").checked = false; }
                        document.getElementById("tomeges_landzsa_faluban_marad").value = +tomeges_landzsa_faluban_marad;
                        if (tomeges_kardos === 1) { document.getElementById("tomeges_kardos").checked = true; }
                        else if (tomeges_kardos === 0) { document.getElementById("tomeges_kardos").checked = false; }
                        document.getElementById("tomeges_kardos_faluban_marad").value = +tomeges_kardos_faluban_marad;
                        if (tomeges_bardos === 1) { document.getElementById("tomeges_bardos").checked = true; }
                        else if (tomeges_bardos === 0) { document.getElementById("tomeges_bardos").checked = false; }
                        document.getElementById("tomeges_bardos_faluban_marad").value = +tomeges_bardos_faluban_marad;
                        if (tomeges_ijasz === 1) { document.getElementById("tomeges_ijasz").checked = true; }
                        else if (tomeges_ijasz === 0) { document.getElementById("tomeges_ijasz").checked = false; }
                        document.getElementById("tomeges_ijasz_faluban_marad").value = +tomeges_ijasz_faluban_marad;
                        if (tomeges_konnyulo === 1) { document.getElementById("tomeges_konnyulo").checked = true; }
                        else if (tomeges_konnyulo === 0) { document.getElementById("tomeges_konnyulo").checked = false; }
                        document.getElementById("tomeges_konnyulo_faluban_marad").value = +tomeges_konnyulo_faluban_marad;
                        if (tomeges_lovasij === 1) { document.getElementById("tomeges_lovasij").checked = true; }
                        else if (tomeges_lovasij === 0) { document.getElementById("tomeges_lovasij").checked = false; }
                        document.getElementById("tomeges_lovasij_faluban_marad").value = +tomeges_lovasij_faluban_marad;
                        if (tomeges_nehezlo === 1) { document.getElementById("tomeges_nehezlo").checked = true; }
                        else if (tomeges_nehezlo === 0) { document.getElementById("tomeges_nehezlo").checked = false; }
                        document.getElementById("tomeges_nehezlo_faluban_marad").value = +tomeges_nehezlo_faluban_marad;

                        document.getElementById("tomeges_nyersanyagkiegyenlito_tanya_kicsi").value = +tomeges_nyersanyagkiegyenlito_tanya_kicsi;
                        document.getElementById("tomeges_nyersanyagkiegyenlito_tanya_nagy").value = +tomeges_nyersanyagkiegyenlito_tanya_nagy;
                        document.getElementById("tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek").value = +tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek;
                        document.getElementById("tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek").value = +tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek;
                        if (tomeges_nyersanyagkiegyenlito_premiummal === true) { document.getElementById("tomeges_nyersanyagkiegyenlito_premiummal").checked = true; }
                        else if (tomeges_nyersanyagkiegyenlito_premiummal === false) { document.getElementById("tomeges_nyersanyagkiegyenlito_premiummal").checked = false; }
                    }
                }
                function input_change_checker() {
                    if (document.getElementById("kilep_ha_tetlen_label")?.innerText !== undefined) {
                        function check_license() {
                            document.getElementById("status").innerHTML = '<span class="blink">LICENSED</span>';
                        }
                        check_license();
                        document.getElementById("kilep_ha_tetlen_label").innerHTML = "   " + document.getElementById("kilep_ha_tetlen").value + " min";
                        if (+document.getElementById("botriado").value === 0) { document.getElementById("bot_check_label").innerHTML = "   OFF"; }
                        if (+document.getElementById("botriado").value === 1) { document.getElementById("bot_check_label").innerHTML = "   CLICK BOT-CHECK"; }
                        if (+document.getElementById("botriado").value === 2) { document.getElementById("bot_check_label").innerHTML = "   IMAGE BOT-CHECK"; }
                        document.getElementById("circle_time_label").innerHTML = "   " + document.getElementById("korperc").value + " min";
                    }
                    if (document.getElementById("terkepfrissites_label")?.innerText !== undefined) {
                        document.getElementById("terkepfrissites_label").innerHTML = "   " + document.getElementById("terkepfrissites").value + " hour";
                    }
                    if (document.getElementById("korpercenkent_barbarfarm_label")?.innerText !== undefined) {
                        document.getElementById("korpercenkent_barbarfarm_label").innerHTML = "   x" + document.getElementById("korpercenkent_barbarfarm").value;
                        document.getElementById("max_mezo_label").innerHTML = "   " + document.getElementById("max_mezo").value + " field";
                        document.getElementById("minimum_nyersi_label").innerHTML = "   " + document.getElementById("minimum_nyersi").value + " res";
                        document.getElementById("minimum_kl_label").innerHTML = "   " + document.getElementById("minimum_kl").value + " lc";
                        document.getElementById("korpercenkent_jatekosfarm_label").innerHTML = "   x" + document.getElementById("korpercenkent_jatekosfarm").value;
                    }
                    if (document.getElementById("nyersi_elad_arfolyam_label")?.innerText !== undefined) {
                        document.getElementById("nyersi_elad_arfolyam_label").innerHTML = "   " + document.getElementById("nyersi_elad_arfolyam").value + " res";
                        document.getElementById("nyersi_vesz_arfolyam_label").innerHTML = "   " + document.getElementById("nyersi_vesz_arfolyam").value + " res";
                        document.getElementById("nyersi_vesz_max_pp_label").innerHTML = "   " + document.getElementById("nyersi_vesz_max_pp").value + " PP";
                        document.getElementById("rakiban_marad_label").innerHTML = "   " + document.getElementById("rakiban_marad").value + " res";
                        document.getElementById("minimum_amit_elad_label").innerHTML = "   " + document.getElementById("minimum_amit_elad").value + " res";
                        document.getElementById("szabadkapac_label").innerHTML = "   " + document.getElementById("szabadkapac").value + " %";
                        document.getElementById("tozsdemozgas_szamlalo_label").innerHTML = "   x" + document.getElementById("tozsdemozgas_szamlalo").value;
                        document.getElementById("legkisebb_profit_label").innerHTML = "   " + document.getElementById("legkisebb_profit").value + " x";
                    }
                    if (document.getElementById("korpercenkent_gyujtogetes_label")?.innerText !== undefined) {
                        document.getElementById("korpercenkent_gyujtogetes_label").innerHTML = "   x" + document.getElementById("korpercenkent_gyujtogetes").value;
                        document.getElementById("tamado_gyujti_max_ora_label").innerHTML = "   " + document.getElementById("tamado_gyujti_max_ora").value + " hour";
                        document.getElementById("frontvedo_gyujti_max_ora_label").innerHTML = "   " + document.getElementById("frontvedo_gyujti_max_ora").value + " hour";
                        document.getElementById("hatsovedo_gyujti_max_ora_label").innerHTML = "   " + document.getElementById("hatsovedo_gyujti_max_ora").value + " hour";
                    }
                    if (document.getElementById("korpercenkent_epites_label")?.innerText !== undefined) {
                        document.getElementById("korpercenkent_epites_label").innerHTML = "   x" + document.getElementById("korpercenkent_epites").value;
                    }
                    if (document.getElementById("korpercenkent_kepzes_label")?.innerText !== undefined) {
                        document.getElementById("korpercenkent_kepzes_label").innerHTML = "   x" + document.getElementById("korpercenkent_kepzes").value;
                    }
                    if (document.getElementById("korpercenkent_tomeges_gyujti_label")?.innerText !== undefined) {
                        document.getElementById("korpercenkent_tomeges_gyujti_label").innerHTML = "   x" + document.getElementById("korpercenkent_tomeges_gyujti").value;
                        document.getElementById("korpercenkent_tomeges_gyujti_feloldas_label").innerHTML = "   x" + document.getElementById("korpercenkent_tomeges_gyujti_feloldas").value;
                        document.getElementById("korpercenkent_tomeges_kikepzes_label").innerHTML = "   x" + document.getElementById("korpercenkent_tomeges_kikepzes").value;
                        document.getElementById("korpercenkent_tomeges_epites_label").innerHTML = "   x" + document.getElementById("korpercenkent_tomeges_epites").value;
                        document.getElementById("korpercenkent_tomeges_barbar_faluk_kosozasa_label").innerHTML = "   x" + document.getElementById("korpercenkent_tomeges_barbar_faluk_kosozasa").value;
                        document.getElementById("korpercenkent_tomeges_nyersikiegyenlites_label").innerHTML = "   x" + document.getElementById("korpercenkent_tomeges_nyersikiegyenlites").value;
                        document.getElementById("korpercenkent_tomeges_ermeveres_label").innerHTML = "   x" + document.getElementById("korpercenkent_tomeges_ermeveres").value;
                    }
                }
                function save_bot_settings() {
                    if (document.getElementById("kilep_ha_tetlen_label")?.innerText !== undefined) {
                        ////// Elsődleges módosítók /////////////////////////////////////////////////////////////
                        if (document.getElementById("premium_fiok").checked === true) { bot_settings.premium_fiok = 1; }
                        else if (document.getElementById("premium_fiok").checked === false) { bot_settings.premium_fiok = 0; }
                        bot_settings.kilep_ha_tetlen = +document.getElementById("kilep_ha_tetlen").value;
                        if (document.getElementById("emberi_mozzanatok").checked === true) { bot_settings.emberi_mozzanatok = 1; }
                        else if (document.getElementById("emberi_mozzanatok").checked === false) { bot_settings.emberi_mozzanatok = 0; }
                        if (document.getElementById("visszalepes").checked === true) { bot_settings.visszalepes = 1; }
                        else if (document.getElementById("visszalepes").checked === false) { bot_settings.visszalepes = 0; }
                        if (document.getElementById("farm").checked === true) { bot_settings.farm = 1; }
                        else if (document.getElementById("farm").checked === false) { bot_settings.farm = 0; }
                        if (document.getElementById("jatekosfarm").checked === true) { bot_settings.jatekosfarm = 1; }
                        else if (document.getElementById("jatekosfarm").checked === false) { bot_settings.jatekosfarm = 0; }
                        if (document.getElementById("gyujtogetes").checked === true) { bot_settings.gyujtogetes = 1; }
                        else if (document.getElementById("gyujtogetes").checked === false) { bot_settings.gyujtogetes = 0; }
                        if (document.getElementById("epites").checked === true) { bot_settings.epites = 1; }
                        else if (document.getElementById("epites").checked === false) { bot_settings.epites = 0; }
                        if (document.getElementById("kepzes").checked === true) { bot_settings.kepzes = 1; }
                        else if (document.getElementById("kepzes").checked === false) { bot_settings.kepzes = 0; }
                        if (document.getElementById("kuldetesek").checked === true) { bot_settings.kuldetesek = 1; }
                        else if (document.getElementById("kuldetesek").checked === false) { bot_settings.kuldetesek = 0; }
                        if (document.getElementById("leltar_nyersi").checked === true) { bot_settings.leltar_nyersi = 1; }
                        else if (document.getElementById("leltar_nyersi").checked === false) { bot_settings.leltar_nyersi = 0; }
                        if (document.getElementById("napi_bonusz").checked === true) { bot_settings.napi_bonusz = 1; }
                        else if (document.getElementById("napi_bonusz").checked === false) { bot_settings.napi_bonusz = 0; }
                        bot_settings.botriado = +document.getElementById("botriado").value;
                        bot_settings.korperc = +document.getElementById("korperc").value;
                        // Prémium opciók
                        if (document.getElementById("tomeges_gyujti").checked === true) { bot_settings.tomeges_gyujti = 1; }
                        else if (document.getElementById("tomeges_gyujti").checked === false) { bot_settings.tomeges_gyujti = 0; }
                        if (document.getElementById("tomeges_gyujti_feloldas").checked === true) { bot_settings.tomeges_gyujti_feloldas = 1; }
                        else if (document.getElementById("tomeges_gyujti_feloldas").checked === false) { bot_settings.tomeges_gyujti_feloldas = 0; }
                        if (document.getElementById("tomeges_kikepzes").checked === true) { bot_settings.tomeges_kikepzes = 1; }
                        else if (document.getElementById("tomeges_kikepzes").checked === false) { bot_settings.tomeges_kikepzes = 0; }
                        if (document.getElementById("tomeges_epites").checked === true) { bot_settings.tomeges_epites = 1; }
                        else if (document.getElementById("tomeges_epites").checked === false) { bot_settings.tomeges_epites = 0; }
                        if (document.getElementById("barbar_faluk_kosozasa").checked === true) { bot_settings.barbar_faluk_kosozasa = 1; }
                        else if (document.getElementById("barbar_faluk_kosozasa").checked === false) { bot_settings.barbar_faluk_kosozasa = 0; }
                        if (document.getElementById("nyersikiegyenlites").checked === true) { bot_settings.nyersikiegyenlites = 1; }
                        else if (document.getElementById("nyersikiegyenlites").checked === false) { bot_settings.nyersikiegyenlites = 0; }
                        if (document.getElementById("ermeveretes").checked === true) { bot_settings.ermeveretes = 1; }
                        else if (document.getElementById("ermeveretes").checked === false) { bot_settings.ermeveretes = 0; }
                    }
                    if (document.getElementById("terkepfrissites_label")?.innerText !== undefined) {
                        ////////// Szerver Módosítók ////////////////////////////////////////////////////////////
                        bot_settings.szerver = document.getElementById("szerver").value;
                        bot_settings.nemzet = document.getElementById("nemzet").value;
                        bot_settings.terkepfrissites = +document.getElementById("terkepfrissites").value;
                    }
                    if (document.getElementById("csoport_tamado")?.value !== undefined) {
                        ////////// Falu Módosítók ///////////////////////////////////////////////////////////////
                        bot_settings.faluk.csoport.tamado = document.getElementById("csoport_tamado").value;
                        bot_settings.faluk.csoport.frontvedo = document.getElementById("csoport_frontvedo").value;
                        bot_settings.faluk.csoport.hatsovedo = document.getElementById("csoport_hatsovedo").value;
                        bot_settings.faluk.csoport.farm = document.getElementById("csoport_farm").value;
                        bot_settings.faluk.csoport.kem = document.getElementById("csoport_kem").value;
                        bot_settings.faluk.csoport.barbarfarmolofaluk = document.getElementById("csoport_barbarfarmolofaluk").value;
                        bot_settings.faluk.csoport.jatekosfarmolofaluk = document.getElementById("csoport_jatekosfarmolofaluk").value;
                        bot_settings.faluk.csoport.barbarkosozofaluk = document.getElementById("csoport_barbarkosozofaluk").value;
                    }
                    if (document.getElementById("korpercenkent_barbarfarm_label")?.innerText !== undefined) {
                        ////////// Farm Módosítók ///////////////////////////////////////////////////////////////
                        bot_settings.korpercenkent.barbarfarm = +document.getElementById("korpercenkent_barbarfarm").value;
                        if (document.getElementById("a_b_ures_teli").checked === true) { bot_settings.a_b_ures_teli = 1; }
                        else if (document.getElementById("a_b_ures_teli").checked === false) { bot_settings.a_b_ures_teli = 0; }
                        bot_settings.max_mezo = +document.getElementById("max_mezo").value;
                        bot_settings.template = document.getElementById("template").value;
                        bot_settings.minimum_nyersi = +document.getElementById("minimum_nyersi").value;
                        bot_settings.minimum_kl = +document.getElementById("minimum_kl").value;
                        ////////// Játékos farm Módosítók //////////////////////////////////////////////////////
                        bot_settings.korpercenkent.jatekosfarm = +document.getElementById("korpercenkent_jatekosfarm").value;
                        bot_settings.coords = document.getElementById("coords").value;
                        bot_settings.sp = +document.getElementById("sp").value;
                        bot_settings.sw = +document.getElementById("sw").value;
                        bot_settings.ax = +document.getElementById("ax").value;
                        bot_settings.scout = +document.getElementById("scout").value;
                        bot_settings.lc = +document.getElementById("lc").value;
                        bot_settings.hv = +document.getElementById("hv").value;
                        bot_settings.ra = +document.getElementById("ra").value;
                        bot_settings.cat = +document.getElementById("cat").value;
                        bot_settings.snob = +document.getElementById("snob").value;
                    }
                    if (document.getElementById("nyersi_elad_arfolyam_label")?.innerText !== undefined) {
                        ////////// Tőzsde Módosítók ////////////////////////////////////////////////////////////
                        if (document.getElementById("tozsden_vasarlas_ultragyorsan").checked === true) { bot_settings.tozsden_vasarlas_ultragyorsan = 1; }
                        else if (document.getElementById("tozsden_vasarlas_ultragyorsan").checked === false) { bot_settings.tozsden_vasarlas_ultragyorsan = 0; }
                        if (document.getElementById("nyersi_elad").checked === true) { bot_settings.nyersi_elad = 1; }
                        else if (document.getElementById("nyersi_elad").checked === false) { bot_settings.nyersi_elad = 0; }
                        if (document.getElementById("nyersi_vesz").checked === true) { bot_settings.nyersi_vesz = 1; }
                        else if (document.getElementById("nyersi_vesz").checked === false) { bot_settings.nyersi_vesz = 0; }
                        bot_settings.nyersi_elad_arfolyam = +document.getElementById("nyersi_elad_arfolyam").value;
                        bot_settings.nyersi_vesz_arfolyam = +document.getElementById("nyersi_vesz_arfolyam").value;
                        bot_settings.nyersi_vesz_max_pp = +document.getElementById("nyersi_vesz_max_pp").value;
                        bot_settings.rakiban_marad = +document.getElementById("rakiban_marad").value;
                        bot_settings.minimum_amit_elad = +document.getElementById("minimum_amit_elad").value;
                        bot_settings.szabadkapac = +document.getElementById("szabadkapac").value;
                        // auto tőzsde
                        if (document.getElementById("auto_tozsde").checked === true) { bot_settings.auto_tozsde = 1; }
                        else if (document.getElementById("auto_tozsde").checked === false) { bot_settings.auto_tozsde = 0; }
                        bot_settings.tozsdemozgas_szamlalo = +document.getElementById("tozsdemozgas_szamlalo").value;
                        bot_settings.legkisebb_profit = +document.getElementById("legkisebb_profit").value;
                        if (document.getElementById("kenyszerített_profit").checked === true) { bot_settings.kenyszerített_profit = 1; }
                        else if (document.getElementById("kenyszerített_profit").checked === false) { bot_settings.kenyszerített_profit = 0; }
                    }
                    if (document.getElementById("korpercenkent_gyujtogetes_label")?.innerText !== undefined) {
                        ////////// Gyűjtögetés Módosítók ///////////////////////////////////////////////////////
                        bot_settings.korpercenkent.gyujtogetes = +document.getElementById("korpercenkent_gyujtogetes").value;
                        if (document.getElementById("támadó_faluból").checked === true) { bot_settings.támadó_faluból = 1; }
                        else if (document.getElementById("támadó_faluból").checked === false) { bot_settings.támadó_faluból = 0; }
                        if (document.getElementById("frontvédő_faluból").checked === true) { bot_settings.frontvédő_faluból = 1; }
                        else if (document.getElementById("frontvédő_faluból").checked === false) { bot_settings.frontvédő_faluból = 0; }
                        if (document.getElementById("hátsóvédő_faluból").checked === true) { bot_settings.hátsóvédő_faluból = 1; }
                        else if (document.getElementById("hátsóvédő_faluból").checked === false) { bot_settings.hátsóvédő_faluból = 0; }

                        faluk.tamado_gyujti[0].max_ora = +document.getElementById("tamado_gyujti_max_ora").value;
                        if (document.getElementById("tamado_gyujti_landzsas").checked === true) { faluk.tamado_gyujti[0].landzsas === true; }
                        else if (document.getElementById("tamado_gyujti_landzsas").checked === false) { faluk.tamado_gyujti[0].landzsas === false; }
                        faluk.tamado_gyujti[0].landzsas_otthon = +document.getElementById("tamado_gyujti_landzsas_otthon").value;
                        if (document.getElementById("tamado_gyujti_kardos").checked === true) { faluk.tamado_gyujti[0].kardos === true; }
                        else if (document.getElementById("tamado_gyujti_kardos").checked === false) { faluk.tamado_gyujti[0].kardos === false; }
                        faluk.tamado_gyujti[0].kardos_otthon = +document.getElementById("tamado_gyujti_kardos_otthon").value;
                        if (document.getElementById("tamado_gyujti_bardos").checked === true) { faluk.tamado_gyujti[0].bardos === true; }
                        else if (document.getElementById("tamado_gyujti_bardos").checked === false) { faluk.tamado_gyujti[0].bardos === false; }
                        faluk.tamado_gyujti[0].bardos_otthon = +document.getElementById("tamado_gyujti_bardos_otthon").value;
                        if (document.getElementById("tamado_gyujti_ijasz").checked === true) { faluk.tamado_gyujti[0].ijasz === true; }
                        else if (document.getElementById("tamado_gyujti_ijasz").checked === false) { faluk.tamado_gyujti[0].ijasz === false; }
                        faluk.tamado_gyujti[0].ijasz_otthon = +document.getElementById("tamado_gyujti_ijasz_otthon").value;
                        if (document.getElementById("tamado_gyujti_konnyulovas").checked === true) { faluk.tamado_gyujti[0].konnyulovas === true; }
                        else if (document.getElementById("tamado_gyujti_konnyulovas").checked === false) { faluk.tamado_gyujti[0].konnyulovas === false; }
                        faluk.tamado_gyujti[0].konnyulovas_otthon = +document.getElementById("tamado_gyujti_konnyulovas_otthon").value;
                        if (document.getElementById("tamado_gyujti_lovasijasz").checked === true) { faluk.tamado_gyujti[0].lovasijasz === true; }
                        else if (document.getElementById("tamado_gyujti_lovasijasz").checked === false) { faluk.tamado_gyujti[0].lovasijasz === false; }
                        faluk.tamado_gyujti[0].lovasijasz_otthon = +document.getElementById("tamado_gyujti_lovasijasz_otthon").value;
                        if (document.getElementById("tamado_gyujti_nehezlovas").checked === true) { faluk.tamado_gyujti[0].nehezlovas === true; }
                        else if (document.getElementById("tamado_gyujti_nehezlovas").checked === false) { faluk.tamado_gyujti[0].nehezlovas === false; }
                        faluk.tamado_gyujti[0].nehezlovas_otthon = +document.getElementById("tamado_gyujti_nehezlovas_otthon").value;

                        faluk.frontvedo_gyujti[0].max_ora = +document.getElementById("frontvedo_gyujti_max_ora").value;
                        if (document.getElementById("frontvedo_gyujti_landzsas").checked === true) { faluk.frontvedo_gyujti[0].landzsas === true; }
                        else if (document.getElementById("frontvedo_gyujti_landzsas").checked === false) { faluk.frontvedo_gyujti[0].landzsas === false; }
                        faluk.frontvedo_gyujti[0].landzsas_otthon = +document.getElementById("frontvedo_gyujti_landzsas_otthon").value;
                        if (document.getElementById("frontvedo_gyujti_kardos").checked === true) { faluk.frontvedo_gyujti[0].kardos === true; }
                        else if (document.getElementById("frontvedo_gyujti_kardos").checked === false) { faluk.frontvedo_gyujti[0].kardos === false; }
                        faluk.frontvedo_gyujti[0].kardos_otthon = +document.getElementById("frontvedo_gyujti_kardos_otthon").value;
                        if (document.getElementById("frontvedo_gyujti_bardos").checked === true) { faluk.frontvedo_gyujti[0].bardos === true; }
                        else if (document.getElementById("frontvedo_gyujti_bardos").checked === false) { faluk.frontvedo_gyujti[0].bardos === false; }
                        faluk.frontvedo_gyujti[0].bardos_otthon = +document.getElementById("frontvedo_gyujti_bardos_otthon").value;
                        if (document.getElementById("frontvedo_gyujti_ijasz").checked === true) { faluk.frontvedo_gyujti[0].ijasz === true; }
                        else if (document.getElementById("frontvedo_gyujti_ijasz").checked === false) { faluk.frontvedo_gyujti[0].ijasz === false; }
                        faluk.frontvedo_gyujti[0].ijasz_otthon = +document.getElementById("frontvedo_gyujti_ijasz_otthon").value;
                        if (document.getElementById("frontvedo_gyujti_konnyulovas").checked === true) { faluk.frontvedo_gyujti[0].konnyulovas === true; }
                        else if (document.getElementById("frontvedo_gyujti_konnyulovas").checked === false) { faluk.frontvedo_gyujti[0].konnyulovas === false; }
                        faluk.frontvedo_gyujti[0].konnyulovas_otthon = +document.getElementById("frontvedo_gyujti_konnyulovas_otthon").value;
                        if (document.getElementById("frontvedo_gyujti_lovasijasz").checked === true) { faluk.frontvedo_gyujti[0].lovasijasz === true; }
                        else if (document.getElementById("frontvedo_gyujti_lovasijasz").checked === false) { faluk.frontvedo_gyujti[0].lovasijasz === false; }
                        faluk.frontvedo_gyujti[0].lovasijasz_otthon = +document.getElementById("frontvedo_gyujti_lovasijasz_otthon").value;
                        if (document.getElementById("frontvedo_gyujti_nehezlovas").checked === true) { faluk.frontvedo_gyujti[0].nehezlovas === true; }
                        else if (document.getElementById("frontvedo_gyujti_nehezlovas").checked === false) { faluk.frontvedo_gyujti[0].nehezlovas === false; }
                        faluk.frontvedo_gyujti[0].nehezlovas_otthon = +document.getElementById("frontvedo_gyujti_nehezlovas_otthon").value;

                        faluk.hatsovedo_gyujti[0].max_ora = +document.getElementById("hatsovedo_gyujti_max_ora").value;
                        if (document.getElementById("hatsovedo_gyujti_landzsas").checked === true) { faluk.hatsovedo_gyujti[0].landzsas === true; }
                        else if (document.getElementById("hatsovedo_gyujti_landzsas").checked === false) { faluk.hatsovedo_gyujti[0].landzsas === false; }
                        faluk.hatsovedo_gyujti[0].landzsas_otthon = +document.getElementById("hatsovedo_gyujti_landzsas_otthon").value;
                        if (document.getElementById("hatsovedo_gyujti_kardos").checked === true) { faluk.hatsovedo_gyujti[0].kardos === true; }
                        else if (document.getElementById("hatsovedo_gyujti_kardos").checked === false) { faluk.hatsovedo_gyujti[0].kardos === false; }
                        faluk.hatsovedo_gyujti[0].kardos_otthon = +document.getElementById("hatsovedo_gyujti_kardos_otthon").value;
                        if (document.getElementById("hatsovedo_gyujti_bardos").checked === true) { faluk.hatsovedo_gyujti[0].bardos === true; }
                        else if (document.getElementById("hatsovedo_gyujti_bardos").checked === false) { faluk.hatsovedo_gyujti[0].bardos === false; }
                        faluk.hatsovedo_gyujti[0].bardos_otthon = +document.getElementById("hatsovedo_gyujti_bardos_otthon").value;
                        if (document.getElementById("hatsovedo_gyujti_ijasz").checked === true) { faluk.hatsovedo_gyujti[0].ijasz === true; }
                        else if (document.getElementById("hatsovedo_gyujti_ijasz").checked === false) { faluk.hatsovedo_gyujti[0].ijasz === false; }
                        faluk.hatsovedo_gyujti[0].ijasz_otthon = +document.getElementById("hatsovedo_gyujti_ijasz_otthon").value;
                        if (document.getElementById("hatsovedo_gyujti_konnyulovas").checked === true) { faluk.hatsovedo_gyujti[0].konnyulovas === true; }
                        else if (document.getElementById("hatsovedo_gyujti_konnyulovas").checked === false) { faluk.hatsovedo_gyujti[0].konnyulovas === false; }
                        faluk.hatsovedo_gyujti[0].konnyulovas_otthon = +document.getElementById("hatsovedo_gyujti_konnyulovas_otthon").value;
                        if (document.getElementById("hatsovedo_gyujti_lovasijasz").checked === true) { faluk.hatsovedo_gyujti[0].lovasijasz === true; }
                        else if (document.getElementById("hatsovedo_gyujti_lovasijasz").checked === false) { faluk.hatsovedo_gyujti[0].lovasijasz === false; }
                        faluk.hatsovedo_gyujti[0].lovasijasz_otthon = +document.getElementById("hatsovedo_gyujti_lovasijasz_otthon").value;
                        if (document.getElementById("hatsovedo_gyujti_nehezlovas").checked === true) { faluk.hatsovedo_gyujti[0].nehezlovas === true; }
                        else if (document.getElementById("hatsovedo_gyujti_nehezlovas").checked === false) { faluk.hatsovedo_gyujti[0].nehezlovas === false; }
                        faluk.hatsovedo_gyujti[0].nehezlovas_otthon = +document.getElementById("hatsovedo_gyujti_nehezlovas_otthon").value;

                        bot_settings.faluk.tamado_gyujti = faluk.tamado_gyujti;
                        bot_settings.faluk.frontvedo_gyujti = faluk.frontvedo_gyujti;
                        bot_settings.faluk.hatsovedo_gyujti = faluk.hatsovedo_gyujti;
                    }
                    if (document.getElementById("korpercenkent_epites_label")?.innerText !== undefined) {
                        ////////// Építés Módosítók ////////////////////////////////////////////////////////////
                        bot_settings.korpercenkent.epites = +document.getElementById("korpercenkent_epites").value;
                        if (document.getElementById("kezdetek").checked === true) { bot_settings.kezdetek = 1; }
                        else if (document.getElementById("kezdetek").checked === false) { bot_settings.kezdetek = 0; }
                        bot_settings.Fohadiszallas = +document.getElementById("Fohadiszallas").value;
                        bot_settings.Barakk = +document.getElementById("Barakk").value;
                        bot_settings.Istallo = +document.getElementById("Istallo").value;
                        bot_settings.Muhely = +document.getElementById("Muhely").value;
                        bot_settings.Piac = +document.getElementById("Piac").value;
                        bot_settings.Tanya = +document.getElementById("Tanya").value;
                        bot_settings.Raktar = +document.getElementById("Raktar").value;
                        bot_settings.Kovacsmuhely = +document.getElementById("Kovacsmuhely").value;
                        bot_settings.Fatelep = +document.getElementById("Fatelep").value;
                        bot_settings.Agyagbanya = +document.getElementById("Agyagbanya").value;
                        bot_settings.Vasbanya = +document.getElementById("Vasbanya").value;
                        bot_settings.Akademia = +document.getElementById("Akademia").value;
                        bot_settings.Szobor = +document.getElementById("Szobor").value;
                        bot_settings.Gyulekezohely = +document.getElementById("Gyulekezohely").value;
                        bot_settings.Rejtekhely = +document.getElementById("Rejtekhely").value;
                        bot_settings.Fal = +document.getElementById("Fal").value;
                        if (document.getElementById("Kenyszeritett_lista").checked === true) { bot_settings.Kenyszeritett_lista = true; }
                        else if (document.getElementById("Kenyszeritett_lista").checked === false) { bot_settings.Kenyszeritett_lista = false; }
                        if (document.getElementById("Raktar_epites_ha_kell").checked === true) { bot_settings.Raktar_epites_ha_kell = true; }
                        else if (document.getElementById("Raktar_epites_ha_kell").checked === false) { bot_settings.Raktar_epites_ha_kell = false; }
                        if (document.getElementById("Tanya_epites_ha_kell").checked === true) { bot_settings.Tanya_epites_ha_kell = true; }
                        else if (document.getElementById("Tanya_epites_ha_kell").checked === false) { bot_settings.Tanya_epites_ha_kell = false; }
                        bot_settings.Max_raktar_szazalek = +document.getElementById("Max_raktar_szazalek").value;
                        bot_settings.Max_tanya_szazalek = +document.getElementById("Max_tanya_szazalek").value;
                        bot_settings.Max_raktar_szint = +document.getElementById("Max_raktar_szint").value;
                        bot_settings.Max_tanya_szint = +document.getElementById("Max_tanya_szint").value;
                        bot_settings.Max_epitesi_sor = +document.getElementById("Max_epitesi_sor").value;
                    }
                    if (document.getElementById("korpercenkent_kepzes_label")?.innerText !== undefined) {
                        ////////// Képzés Módosítók ////////////////////////////////////////////////////////////
                        bot_settings.korpercenkent.kepzes = +document.getElementById("korpercenkent_kepzes").value;
                        if (document.getElementById("avoidUnevenResources").checked === true) { bot_settings.avoidUnevenResources = true; }
                        else if (document.getElementById("avoidUnevenResources").checked === false) { bot_settings.avoidUnevenResources = false; }
                        bot_settings.faluk.tamado_sereg = [
                            { troop: "spear", train: +document.getElementById("tamado_sereg_spear_train").value, max: +document.getElementById("tamado_sereg_spear_max").value },
                            { troop: "sword", train: +document.getElementById("tamado_sereg_sword_train").value, max: +document.getElementById("tamado_sereg_sword_max").value },
                            { troop: "axe", train: +document.getElementById("tamado_sereg_axe_train").value, max: +document.getElementById("tamado_sereg_axe_max").value },
                            { troop: "archer", train: +document.getElementById("tamado_sereg_archer_train").value, max: +document.getElementById("tamado_sereg_archer_max").value },
                            { troop: "spy", train: +document.getElementById("tamado_sereg_spy_train").value, max: +document.getElementById("tamado_sereg_spy_max").value },
                            { troop: "light", train: +document.getElementById("tamado_sereg_light_train").value, max: +document.getElementById("tamado_sereg_light_max").value },
                            { troop: "marcher", train: +document.getElementById("tamado_sereg_marcher_train").value, max: +document.getElementById("tamado_sereg_marcher_max").value },
                            { troop: "heavy", train: +document.getElementById("tamado_sereg_heavy_train").value, max: +document.getElementById("tamado_sereg_heavy_max").value },
                            { troop: "ram", train: +document.getElementById("tamado_sereg_ram_train").value, max: +document.getElementById("tamado_sereg_ram_max").value },
                            { troop: "catapult", train: +document.getElementById("tamado_sereg_catapult_train").value, max: +document.getElementById("tamado_sereg_catapult_max").value }];
                        bot_settings.faluk.frontvedo_sereg = [
                            { troop: "spear", train: +document.getElementById("frontvedo_sereg_spear_train").value, max: +document.getElementById("frontvedo_sereg_spear_max").value },
                            { troop: "sword", train: +document.getElementById("frontvedo_sereg_sword_train").value, max: +document.getElementById("frontvedo_sereg_sword_max").value },
                            { troop: "axe", train: +document.getElementById("frontvedo_sereg_axe_train").value, max: +document.getElementById("frontvedo_sereg_axe_max").value },
                            { troop: "archer", train: +document.getElementById("frontvedo_sereg_archer_train").value, max: +document.getElementById("frontvedo_sereg_archer_max").value },
                            { troop: "spy", train: +document.getElementById("frontvedo_sereg_spy_train").value, max: +document.getElementById("frontvedo_sereg_spy_max").value },
                            { troop: "light", train: +document.getElementById("frontvedo_sereg_light_train").value, max: +document.getElementById("frontvedo_sereg_light_max").value },
                            { troop: "marcher", train: +document.getElementById("frontvedo_sereg_marcher_train").value, max: +document.getElementById("frontvedo_sereg_marcher_max").value },
                            { troop: "heavy", train: +document.getElementById("frontvedo_sereg_heavy_train").value, max: +document.getElementById("frontvedo_sereg_heavy_max").value },
                            { troop: "ram", train: +document.getElementById("frontvedo_sereg_ram_train").value, max: +document.getElementById("frontvedo_sereg_ram_max").value },
                            { troop: "catapult", train: +document.getElementById("frontvedo_sereg_catapult_train").value, max: +document.getElementById("frontvedo_sereg_catapult_max").value }];
                        bot_settings.faluk.hatsovedo_sereg = [
                            { troop: "spear", train: +document.getElementById("hatsovedo_sereg_spear_train").value, max: +document.getElementById("hatsovedo_sereg_spear_max").value },
                            { troop: "sword", train: +document.getElementById("hatsovedo_sereg_sword_train").value, max: +document.getElementById("hatsovedo_sereg_sword_max").value },
                            { troop: "axe", train: +document.getElementById("hatsovedo_sereg_axe_train").value, max: +document.getElementById("hatsovedo_sereg_axe_max").value },
                            { troop: "archer", train: +document.getElementById("hatsovedo_sereg_archer_train").value, max: +document.getElementById("hatsovedo_sereg_archer_max").value },
                            { troop: "spy", train: +document.getElementById("hatsovedo_sereg_spy_train").value, max: +document.getElementById("hatsovedo_sereg_spy_max").value },
                            { troop: "light", train: +document.getElementById("hatsovedo_sereg_light_train").value, max: +document.getElementById("hatsovedo_sereg_light_max").value },
                            { troop: "marcher", train: +document.getElementById("hatsovedo_sereg_marcher_train").value, max: +document.getElementById("hatsovedo_sereg_marcher_max").value },
                            { troop: "heavy", train: +document.getElementById("hatsovedo_sereg_heavy_train").value, max: +document.getElementById("hatsovedo_sereg_heavy_max").value },
                            { troop: "ram", train: +document.getElementById("hatsovedo_sereg_ram_train").value, max: +document.getElementById("hatsovedo_sereg_ram_max").value },
                            { troop: "catapult", train: +document.getElementById("hatsovedo_sereg_catapult_train").value, max: +document.getElementById("hatsovedo_sereg_catapult_max").value }];
                        bot_settings.faluk.farm_sereg = [
                            { troop: "spear", train: +document.getElementById("farm_sereg_spear_train").value, max: +document.getElementById("farm_sereg_spear_max").value },
                            { troop: "sword", train: +document.getElementById("farm_sereg_sword_train").value, max: +document.getElementById("farm_sereg_sword_max").value },
                            { troop: "axe", train: +document.getElementById("farm_sereg_axe_train").value, max: +document.getElementById("farm_sereg_axe_max").value },
                            { troop: "archer", train: +document.getElementById("farm_sereg_archer_train").value, max: +document.getElementById("farm_sereg_archer_max").value },
                            { troop: "spy", train: +document.getElementById("farm_sereg_spy_train").value, max: +document.getElementById("farm_sereg_spy_max").value },
                            { troop: "light", train: +document.getElementById("farm_sereg_light_train").value, max: +document.getElementById("farm_sereg_light_max").value },
                            { troop: "marcher", train: +document.getElementById("farm_sereg_marcher_train").value, max: +document.getElementById("farm_sereg_marcher_max").value },
                            { troop: "heavy", train: +document.getElementById("farm_sereg_heavy_train").value, max: +document.getElementById("farm_sereg_heavy_max").value },
                            { troop: "ram", train: +document.getElementById("farm_sereg_ram_train").value, max: +document.getElementById("farm_sereg_ram_max").value },
                            { troop: "catapult", train: +document.getElementById("farm_sereg_catapult_train").value, max: +document.getElementById("farm_sereg_catapult_max").value }];
                        bot_settings.faluk.kem_sereg = [
                            { troop: "spear", train: +document.getElementById("kem_sereg_spear_train").value, max: +document.getElementById("kem_sereg_spear_max").value },
                            { troop: "sword", train: +document.getElementById("kem_sereg_sword_train").value, max: +document.getElementById("kem_sereg_sword_max").value },
                            { troop: "axe", train: +document.getElementById("kem_sereg_axe_train").value, max: +document.getElementById("kem_sereg_axe_max").value },
                            { troop: "archer", train: +document.getElementById("kem_sereg_archer_train").value, max: +document.getElementById("kem_sereg_archer_max").value },
                            { troop: "spy", train: +document.getElementById("kem_sereg_spy_train").value, max: +document.getElementById("kem_sereg_spy_max").value },
                            { troop: "light", train: +document.getElementById("kem_sereg_light_train").value, max: +document.getElementById("kem_sereg_light_max").value },
                            { troop: "marcher", train: +document.getElementById("kem_sereg_marcher_train").value, max: +document.getElementById("kem_sereg_marcher_max").value },
                            { troop: "heavy", train: +document.getElementById("kem_sereg_heavy_train").value, max: +document.getElementById("kem_sereg_heavy_max").value },
                            { troop: "ram", train: +document.getElementById("kem_sereg_ram_train").value, max: +document.getElementById("kem_sereg_ram_max").value },
                            { troop: "catapult", train: +document.getElementById("kem_sereg_catapult_train").value, max: +document.getElementById("kem_sereg_catapult_max").value }];
                    }
                    if (document.getElementById("korpercenkent_tomeges_gyujti_label")?.innerText !== undefined) {
                        ////////// Prémium Módosítók ///////////////////////////////////////////////////////////
                        bot_settings.korpercenkent.tomeges_gyujti = +document.getElementById("korpercenkent_tomeges_gyujti").value;
                        bot_settings.korpercenkent.tomeges_gyujti_feloldas = +document.getElementById("korpercenkent_tomeges_gyujti_feloldas").value;
                        bot_settings.korpercenkent.tomeges_kikepzes = +document.getElementById("korpercenkent_tomeges_kikepzes").value;
                        bot_settings.korpercenkent.tomeges_epites = +document.getElementById("korpercenkent_tomeges_epites").value;
                        bot_settings.korpercenkent.tomeges_barbar_faluk_kosozasa = +document.getElementById("korpercenkent_tomeges_barbar_faluk_kosozasa").value;
                        bot_settings.korpercenkent.tomeges_nyersikiegyenlites = +document.getElementById("korpercenkent_tomeges_nyersikiegyenlites").value;
                        bot_settings.korpercenkent.tomeges_ermeveres = +document.getElementById("korpercenkent_tomeges_ermeveres").value;
                        // tömeges gyűjtögetés
                        bot_settings.tomeges_gyujtogetes_tamadobol_ideje = +document.getElementById("tomeges_gyujtogetes_tamadobol_ideje").value;
                        bot_settings.tomeges_gyujtogetes_vedobol_ideje = +document.getElementById("tomeges_gyujtogetes_vedobol_ideje").value;
                        if (document.getElementById("tomeges_gyujtogetes_premiummal").checked === true) { bot_settings.tomeges_gyujtogetes_premiummal = true; }
                        else if (document.getElementById("tomeges_gyujtogetes_premiummal").checked === false) { bot_settings.tomeges_gyujtogetes_premiummal = false; }
                        if (document.getElementById("tomeges_landzsa").checked === true) { bot_settings.tomeges_landzsa = 1; }
                        else if (document.getElementById("tomeges_landzsa").checked === false) { bot_settings.tomeges_landzsa = 0; }
                        if (document.getElementById("tomeges_kardos").checked === true) { bot_settings.tomeges_kardos = 1; }
                        else if (document.getElementById("tomeges_kardos").checked === false) { bot_settings.tomeges_kardos = 0; }
                        if (document.getElementById("tomeges_bardos").checked === true) { bot_settings.tomeges_bardos = 1; }
                        else if (document.getElementById("tomeges_bardos").checked === false) { bot_settings.tomeges_bardos = 0; }
                        if (document.getElementById("tomeges_ijasz").checked === true) { bot_settings.tomeges_ijasz = 1; }
                        else if (document.getElementById("tomeges_ijasz").checked === false) { bot_settings.tomeges_ijasz = 0; }
                        if (document.getElementById("tomeges_konnyulo").checked === true) { bot_settings.tomeges_konnyulo = 1; }
                        else if (document.getElementById("tomeges_konnyulo").checked === false) { bot_settings.tomeges_konnyulo = 0; }
                        if (document.getElementById("tomeges_lovasij").checked === true) { bot_settings.tomeges_lovasij = 1; }
                        else if (document.getElementById("tomeges_lovasij").checked === false) { bot_settings.tomeges_lovasij = 0; }
                        if (document.getElementById("tomeges_nehezlo").checked === true) { bot_settings.tomeges_nehezlo = 1; }
                        else if (document.getElementById("tomeges_nehezlo").checked === false) { bot_settings.tomeges_nehezlo = 0; }
                        bot_settings.tomeges_landzsa_faluban_marad = +document.getElementById("tomeges_landzsa_faluban_marad").value;
                        bot_settings.tomeges_kardos_faluban_marad = +document.getElementById("tomeges_kardos_faluban_marad").value;
                        bot_settings.tomeges_bardos_faluban_marad = +document.getElementById("tomeges_bardos_faluban_marad").value;
                        bot_settings.tomeges_ijasz_faluban_marad = +document.getElementById("tomeges_ijasz_faluban_marad").value;
                        bot_settings.tomeges_konnyulo_faluban_marad = +document.getElementById("tomeges_konnyulo_faluban_marad").value;
                        bot_settings.tomeges_lovasij_faluban_marad = +document.getElementById("tomeges_lovasij_faluban_marad").value;
                        bot_settings.tomeges_nehezlo_faluban_marad = +document.getElementById("tomeges_nehezlo_faluban_marad").value;
                        // tömeges nyersanyagkiegyenlítő
                        bot_settings.tomeges_nyersanyagkiegyenlito_tanya_nagy = +document.getElementById("tomeges_nyersanyagkiegyenlito_tanya_kicsi").value;
                        bot_settings.tomeges_nyersanyagkiegyenlito_tanya_kicsi = +document.getElementById("tomeges_nyersanyagkiegyenlito_tanya_nagy").value;
                        bot_settings.tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek = +document.getElementById("tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek").value;
                        bot_settings.tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek = +document.getElementById("tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek").value;
                        if (document.getElementById("tomeges_nyersanyagkiegyenlito_premiummal").checked === true) { bot_settings.tomeges_nyersanyagkiegyenlito_premiummal = true; }
                        else if (document.getElementById("tomeges_nyersanyagkiegyenlito_premiummal").checked === false) { bot_settings.tomeges_nyersanyagkiegyenlito_premiummal = false; }
                    }
                    function save_bot_settings_basic() {
                        ////// Elsődleges módosítók /////////////////////////////////////////////////////////////
                        premium_fiok = bot_settings.premium_fiok;
                        kilep_ha_tetlen = bot_settings.kilep_ha_tetlen;
                        emberi_mozzanatok = bot_settings.emberi_mozzanatok;
                        visszalepes = bot_settings.visszalepes;
                        tozsde = bot_settings.tozsde;
                        farm = bot_settings.farm;
                        jatekosfarm = bot_settings.jatekosfarm;
                        gyujtogetes = bot_settings.gyujtogetes;
                        epites = bot_settings.epites;
                        kepzes = bot_settings.kepzes;
                        kuldetesek = bot_settings.kuldetesek;
                        leltar_nyersi = bot_settings.leltar_nyersi;
                        napi_bonusz = bot_settings.napi_bonusz;
                        botriado = bot_settings.botriado;
                        korperc = bot_settings.korperc;
                        // Prémium opciók
                        tomeges_gyujti = bot_settings.tomeges_gyujti;
                        tomeges_gyujti_feloldas = bot_settings.tomeges_gyujti_feloldas;
                        tomeges_kikepzes = bot_settings.tomeges_kikepzes;
                        tomeges_epites = bot_settings.tomeges_epites;
                        barbar_faluk_kosozasa = bot_settings.barbar_faluk_kosozasa;
                        nyersikiegyenlites = bot_settings.nyersikiegyenlites;
                        ermeveretes = bot_settings.ermeveretes;
                        ////////// Falu Módosítók ///////////////////////////////////////////////////////////////
                        faluk.csoport.tamado = bot_settings.faluk.csoport.tamado;
                        faluk.csoport.frontvedo = bot_settings.faluk.csoport.frontvedo;
                        faluk.csoport.hatsovedo = bot_settings.faluk.csoport.hatsovedo;
                        faluk.csoport.farm = bot_settings.faluk.csoport.farm;
                        faluk.csoport.kem = bot_settings.faluk.csoport.kem;
                        faluk.csoport.barbarfarmolofaluk = bot_settings.faluk.csoport.barbarfarmolofaluk;
                        faluk.csoport.jatekosfarmolofaluk = bot_settings.faluk.csoport.jatekosfarmolofaluk;
                        faluk.csoport.barbarkosozofaluk = bot_settings.faluk.csoport.barbarkosozofaluk;
                        ////////// Szerver Módosítók ////////////////////////////////////////////////////////////
                        szerver = bot_settings.szerver;
                        nemzet = bot_settings.nemzet;
                        terkepfrissites = bot_settings.terkepfrissites;
                        ////////// Farm Módosítók ///////////////////////////////////////////////////////////////
                        korpercenkent.barbarfarm = bot_settings.korpercenkent.barbarfarm;
                        a_b_ures_teli = bot_settings.a_b_ures_teli;
                        max_mezo = bot_settings.max_mezo;
                        template = bot_settings.template;
                        minimum_nyersi = bot_settings.minimum_nyersi;
                        minimum_kl = bot_settings.minimum_kl;
                        ////////// Játékos farm Módosítók //////////////////////////////////////////////////////
                        korpercenkent.jatekosfarm = bot_settings.korpercenkent.jatekosfarm;
                        coords = bot_settings.coords;
                        sp = bot_settings.sp;
                        sw = bot_settings.sw;
                        ax = bot_settings.ax;
                        scout = bot_settings.scout;
                        lc = bot_settings.lc;
                        hv = bot_settings.hv;
                        ra = bot_settings.ra;
                        cat = bot_settings.cat;
                        snob = bot_settings.snob;
                        ////////// Tőzsde Módosítók ////////////////////////////////////////////////////////////
                        tozsden_vasarlas_ultragyorsan = bot_settings.tozsden_vasarlas_ultragyorsan;
                        nyersi_elad = bot_settings.nyersi_elad;
                        nyersi_vesz = bot_settings.nyersi_vesz;
                        nyersi_elad_arfolyam = bot_settings.nyersi_elad_arfolyam;
                        nyersi_vesz_arfolyam = bot_settings.nyersi_vesz_arfolyam;
                        nyersi_vesz_max_pp = bot_settings.nyersi_vesz_max_pp;
                        rakiban_marad = bot_settings.rakiban_marad;
                        minimum_amit_elad = bot_settings.minimum_amit_elad;
                        szabadkapac = bot_settings.szabadkapac;
                        szabad_kereskedo = bot_settings.szabad_kereskedo;
                        // auto tőzsde
                        auto_tozsde = bot_settings.auto_tozsde;
                        tozsdemozgas_szamlalo = bot_settings.tozsdemozgas_szamlalo;
                        legkisebb_profit = bot_settings.legkisebb_profit;
                        kenyszerített_profit = bot_settings.kenyszerített_profit;
                        ////////// Gyűjtögetés Módosítók ///////////////////////////////////////////////////////
                        korpercenkent.gyujtogetes = bot_settings.korpercenkent.gyujtogetes;
                        támadó_faluból = bot_settings.támadó_faluból;
                        frontvédő_faluból = bot_settings.frontvédő_faluból;
                        hátsóvédő_faluból = bot_settings.hátsóvédő_faluból;
                        faluk.tamado_gyujti = bot_settings.faluk.tamado_gyujti;
                        faluk.frontvedo_gyujti = bot_settings.faluk.frontvedo_gyujti;
                        faluk.hatsovedo_gyujti = bot_settings.faluk.hatsovedo_gyujti;
                        ////////// Építés Módosítók ////////////////////////////////////////////////////////////
                        korpercenkent.epites = bot_settings.korpercenkent.epites;
                        kezdetek = bot_settings.kezdetek;
                        Fohadiszallas = bot_settings.Fohadiszallas;
                        Barakk = bot_settings.Barakk;
                        Istallo = bot_settings.Istallo;
                        Muhely = bot_settings.Muhely;
                        Piac = bot_settings.Piac;
                        Tanya = bot_settings.Tanya;
                        Raktar = bot_settings.Raktar;
                        Kovacsmuhely = bot_settings.Kovacsmuhely;
                        Fatelep = bot_settings.Fatelep;
                        Agyagbanya = bot_settings.Agyagbanya;
                        Vasbanya = bot_settings.Vasbanya;
                        Akademia = bot_settings.Akademia;
                        Szobor = bot_settings.Szobor;
                        Gyulekezohely = bot_settings.Gyulekezohely;
                        Rejtekhely = bot_settings.Rejtekhely;
                        Fal = bot_settings.Fal;
                        Kenyszeritett_lista = bot_settings.Kenyszeritett_lista;
                        Raktar_epites_ha_kell = bot_settings.Raktar_epites_ha_kell;
                        Tanya_epites_ha_kell = bot_settings.Tanya_epites_ha_kell;
                        Max_raktar_szazalek = bot_settings.Max_raktar_szazalek;
                        Max_tanya_szazalek = bot_settings.Max_tanya_szazalek;
                        Max_raktar_szint = bot_settings.Max_raktar_szint;
                        Max_tanya_szint = bot_settings.Max_tanya_szint;
                        Max_epitesi_sor = bot_settings.Max_epitesi_sor;
                        ////////// Képzés Módosítók ////////////////////////////////////////////////////////////
                        korpercenkent.kepzes = bot_settings.korpercenkent.kepzes;
                        faluk.tamado_sereg = bot_settings.faluk.tamado_sereg;
                        faluk.frontvedo_sereg = bot_settings.faluk.frontvedo_sereg;
                        faluk.hatsovedo_sereg = bot_settings.faluk.hatsovedo_sereg;
                        faluk.farm_sereg = bot_settings.faluk.farm_sereg;
                        faluk.kem_sereg = bot_settings.faluk.kem_sereg;
                        avoidUnevenResources = bot_settings.avoidUnevenResources;
                        ////////// Prémium Módosítók ///////////////////////////////////////////////////////////
                        korpercenkent.tomeges_gyujti = bot_settings.korpercenkent.tomeges_gyujti;
                        korpercenkent.tomeges_gyujti_feloldas = bot_settings.korpercenkent.tomeges_gyujti_feloldas;
                        korpercenkent.tomeges_kikepzes = bot_settings.korpercenkent.tomeges_kikepzes;
                        korpercenkent.tomeges_epites = bot_settings.korpercenkent.tomeges_epites;
                        korpercenkent.tomeges_barbar_faluk_kosozasa = bot_settings.korpercenkent.tomeges_barbar_faluk_kosozasa;
                        korpercenkent.tomeges_nyersikiegyenlites = bot_settings.korpercenkent.tomeges_nyersikiegyenlites;
                        korpercenkent.tomeges_ermeveres = bot_settings.korpercenkent.tomeges_ermeveres;
                        // tömeges gyűjtögetés
                        tomeges_gyujtogetes_tamadobol_ideje = bot_settings.tomeges_gyujtogetes_tamadobol_ideje;
                        tomeges_gyujtogetes_vedobol_ideje = bot_settings.tomeges_gyujtogetes_vedobol_ideje;
                        tomeges_gyujtogetes_premiummal = bot_settings.tomeges_gyujtogetes_premiummal;
                        tomeges_landzsa = bot_settings.tomeges_landzsa;
                        tomeges_kardos = bot_settings.tomeges_kardos;
                        tomeges_bardos = bot_settings.tomeges_bardos;
                        tomeges_ijasz = bot_settings.tomeges_ijasz;
                        tomeges_konnyulo = bot_settings.tomeges_konnyulo;
                        tomeges_lovasij = bot_settings.tomeges_lovasij;
                        tomeges_nehezlo = bot_settings.tomeges_nehezlo;
                        tomeges_landzsa_faluban_marad = bot_settings.tomeges_landzsa_faluban_marad;
                        tomeges_kardos_faluban_marad = bot_settings.tomeges_kardos_faluban_marad;
                        tomeges_bardos_faluban_marad = bot_settings.tomeges_bardos_faluban_marad;
                        tomeges_ijasz_faluban_marad = bot_settings.tomeges_ijasz_faluban_marad;
                        tomeges_konnyulo_faluban_marad = bot_settings.tomeges_konnyulo_faluban_marad;
                        tomeges_lovasij_faluban_marad = bot_settings.tomeges_lovasij_faluban_marad;
                        tomeges_nehezlo_faluban_marad = bot_settings.tomeges_nehezlo_faluban_marad;
                        // tömeges nyersanyagkiegyenlítő
                        tomeges_nyersanyagkiegyenlito_tanya_nagy = bot_settings.tomeges_nyersanyagkiegyenlito_tanya_nagy;
                        tomeges_nyersanyagkiegyenlito_tanya_kicsi = bot_settings.tomeges_nyersanyagkiegyenlito_tanya_kicsi;
                        tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek = bot_settings.tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek;
                        tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek = bot_settings.tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek;
                        tomeges_nyersanyagkiegyenlito_premiummal = bot_settings.tomeges_nyersanyagkiegyenlito_premiummal;
                        // tömeges érmézés
                        tomeges_ermezes_itt = bot_settings.tomeges_ermezes_itt;
                        tomeges_ermezes_max_erme = bot_settings.tomeges_ermezes_max_erme;
                        ///////////////////////////////////////////////////////////////////////////////////////
                    }
                    save_bot_settings_basic();
                    save_localstorage();
                }
                create_visual();
            }
        }
        load_bot_settings();
        //if(kilep_ha_tetlen > 0){Relog();}
        if (botriado === 1) { pipalos_captcha(); }
        bot_refresh();
        function captcha_solver_sam() { }
        function pipalos_captcha() {
            var CHECK_BOX = "#checkbox";
            var ARIA_CHECKED = "aria-checked";
            var ARIA_HIDDEN = "aria-hidden";
            function isHidden(el) {
                return (el.offsetParent === null)
            }
            function qSelectorAll(selector) {
                return document.querySelectorAll(selector);
            }
            function qSelector(selector) {
                return document.querySelector(selector);
            }
            if (window.location.href.includes("checkbox")) {
                var checkboxInterval = setInterval(function () {
                    if (!qSelector(CHECK_BOX)) {
                        clearInterval(checkboxInterval);
                    } else if (qSelector(CHECK_BOX).getAttribute(ARIA_CHECKED) == "true") {
                        clearInterval(checkboxInterval);
                    } else if (!isHidden(qSelector(CHECK_BOX)) && qSelector(CHECK_BOX).getAttribute(ARIA_CHECKED) == "false") {
                        qSelector(CHECK_BOX).click();
                        var delay = Math.floor((Math.random() * 3000) + 4000);
                        setTimeout(window.location.reload(true), delay);
                    } else {
                        return;
                    }
                }, 5000);
            }
        }
        function bot_refresh() {
            try {
                if (BotProtect.forced) {
                    if (botriado === 2) {
                        captcha_solver_sam();
                        return;
                    }
                    else if (botriado === 1) {
                        pipalos_captcha();
                        return;
                    }
                }
                else { setTimeout(bot_refresh, 3000); }
            }
            catch (err) { setTimeout(bot_refresh, 3000); }
        }
        function Relog() {
            var relog_link;
            if (document.URL.match("klanhaboru.hu")) { relog_link = "https://www.klanhaboru.hu"; }
            else if (document.URL.match("tribalwars.net")) { relog_link = "https://www.tribalwars.net"; }
            else if (document.URL.match("die-staemme.de")) { relog_link = "https://www.die-staemme.de"; }
            else if (document.URL.match("staemme.ch")) { relog_link = "https://www.staemme.ch"; }
            else if (document.URL.match("tribalwars.nl")) { relog_link = "https://www.tribalwars.nl"; }
            else if (document.URL.match("plemiona.pl")) { relog_link = "https://www.plemiona.pl"; }
            else if (document.URL.match("tribalwars.com.br")) { relog_link = "https://www.tribalwars.com.br"; }
            else if (document.URL.match("tribalwars.com.pt")) { relog_link = "https://www.tribalwars.com.pt"; }
            else if (document.URL.match("divokekmeny.cz")) { relog_link = "https://www.divokekmeny.cz"; }
            else if (document.URL.match("triburile.ro")) { relog_link = "https://www.triburile.ro"; }
            else if (document.URL.match("voyna-plemyon.ru")) { relog_link = "https://www.voyna-plemyon.ru"; }
            else if (document.URL.match("fyletikesmaxes.gr")) { relog_link = "https://www.fyletikesmaxes.gr"; }
            else if (document.URL.match("divoke-kmene.sk")) { relog_link = "https://www.divoke-kmene.sk"; }
            else if (document.URL.match("tribals.it")) { relog_link = "https://www.tribals.it"; }
            else if (document.URL.match("klanlar.org")) { relog_link = "https://www.klanlar.org"; }
            else if (document.URL.match("guerretribale.fr")) { relog_link = "https://www.guerretribale.fr"; }
            else if (document.URL.match("guerrastribales.es")) { relog_link = "https://www.guerrastribales.es"; }
            else if (document.URL.match("tribalwars.ae")) { relog_link = "https://www.tribalwars.ae"; }
            else if (document.URL.match("tribalwars.co.uk")) { relog_link = "https://www.tribalwars.co.uk"; }
            else if (document.URL.match("tribalwars.works")) { relog_link = "https://www.tribalwars.works"; }
            else if (document.URL.match("tribalwars.us")) { relog_link = "https://www.tribalwars.us"; }
            setTimeout(function () { window.location.replace(relog_link); }, (kilep_ha_tetlen * 60 * 1000));
        }
        function vezerli() {
            "INSERT_LICENSE_CHECK_HERE"
            var delay_between_overview_switch = Math.floor((Math.random() * 1200) + 400);
            var delay_between_stuff = Math.floor((Math.random() * 2000) + 1500);
            setInterval(function () { delay_between_stuff = Math.floor((Math.random() * 2000) + 1500); }, 100); // ms
            var delay_between_1 = Math.floor((Math.random() * 6000) + 2000);
            setInterval(function () { delay_between_1 = Math.floor((Math.random() * 6000) + 2000); }, 100); // ms
            var kuldirendszer = game_data.quest.use_questlines;
            if (leltar_nyersi === 1) {
                var leltar_nyersi_delay = Math.floor((Math.random() * 1000000) + 5400000);
                var leltar_nyersi_now = Date.now();
                var leltar_nyersi_post = Date.now() + leltar_nyersi_delay;
                if (item_not_exist.includes(typeof (SAM.multi_village_bot.inventory))) {
                    setTimeout(inventory, delay_between_stuff);
                    SAM.multi_village_bot.inventory = leltar_nyersi_post;
                    save_localstorage();
                }
                else { leltar_nyersi_post = +SAM.multi_village_bot.inventory }

                if (leltar_nyersi_post < leltar_nyersi_now) {
                    setTimeout(inventory, delay_between_stuff);
                    leltar_nyersi_post = Date.now() + leltar_nyersi_delay;
                    SAM.multi_village_bot.inventory = leltar_nyersi_post;
                    save_localstorage();
                }
            }
            if (napi_bonusz === 1) {
                var napi_bonusz_delay = Math.floor((Math.random() * 15000000) + 15000000);
                var napi_bonusz_now = Date.now();
                var napi_bonusz_post = Date.now() + napi_bonusz_delay;
                if (item_not_exist.includes(typeof (SAM.multi_village_bot.daily_bonus))) {
                    setTimeout(daily_reward, delay_between_stuff);
                    SAM.multi_village_bot.daily_bonus = napi_bonusz_post;
                    save_localstorage();
                }
                else { napi_bonusz_post = +SAM.multi_village_bot.daily_bonus }

                if (napi_bonusz_post < napi_bonusz_now) {
                    setTimeout(daily_reward, delay_between_stuff);
                    napi_bonusz_post = Date.now() + napi_bonusz_delay;
                    SAM.multi_village_bot.daily_bonus = napi_bonusz_post;
                    save_localstorage();
                }
            }
            if (item_not_exist.includes(typeof (SAM.multi_village_bot.phase))) {
                SAM.multi_village_bot.phase = phase;
                save_localstorage();
            }
            else { phase = +SAM.multi_village_bot.phase }
            if (phase < 99 && kuldetesek === 1 && kuldirendszer === true) {
                var delay_between_quest_reward = Math.floor((Math.random() * 20000) + 25000);
                function start_phase_reward() { setTimeout(quest_system_new_reward, delay_between_1); delay_between_quest_reward = Math.floor((Math.random() * 20000) + 25000); setTimeout(start_phase_reward, delay_between_quest_reward) }
                start_phase_reward();
            }
            else if (phase === 99 && kuldetesek === 1 && kuldirendszer === true) {
                var delay_between_quest_reward_long = Math.floor((Math.random() * 1800000) + 1000000);
                function start_phase_reward() { setTimeout(quest_system_new_reward, delay_between_1); delay_between_quest_reward_long = Math.floor((Math.random() * 1800000) + 1000000); setTimeout(start_phase_reward, delay_between_quest_reward_long) }
                start_phase_reward();
            }
            if (kuldirendszer === false && phase !== 99 && kuldetesek === 1) {
                if (document.URL.match("main")) { quest_system_old(); }
                else if (document.URL.match("settings")) { }
                else { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=main"); return; }, delay_between_overview_switch); }
            }
            if (kuldirendszer === true && phase !== 99 && kuldetesek === 1) {
                if (document.URL.match("main")) { quest_system_new(); }
                else if (document.URL.match("settings")) { }
                else { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=main"); return; }, delay_between_overview_switch); }
            }
            if (phase === 99 || kuldetesek === 0) {
                "INSERT_LICENSE_CHECK_HERE"
                var date_most = Date.now() / 1000 / 60 / 60;
                var date_post = date_most + terkepfrissites;
                var korperc_most = Date.now();
                var ennyiperc = korperc * 1000 * 60;
                var ennyiperc_delay = Math.floor((Math.random() * 300000) + +ennyiperc);
                var korperc_post = Date.now() + ennyiperc_delay;
                var korperc_start_new = Date.now() + ennyiperc_delay + ennyiperc_delay + ennyiperc_delay;
                var korperc_start_new_back = Date.now() - ennyiperc_delay - ennyiperc_delay - ennyiperc_delay;
                var this_world = game_data.world;
                var this_player = game_data.player.name;

                vezerlo.kikuldve.barbarfarm = 1;
                vezerlo.kikuldve.gyujtogetes = 1;
                vezerlo.kikuldve.epites = 1;
                vezerlo.kikuldve.kepzes = 1;
                vezerlo.kikuldve.jatekosfarm = 1;
                vezerlo.kikuldve.tomeges_gyujti = 1;
                vezerlo.kikuldve.tomeges_gyujti_feloldas = 1;
                vezerlo.kikuldve.tomeges_kikepzes = 1;
                vezerlo.kikuldve.tomeges_epites = 1;
                vezerlo.kikuldve.tomeges_barbar_faluk_kosozasa = 1;
                vezerlo.kikuldve.tomeges_nyersikiegyenlites = 1;
                vezerlo.kikuldve.tomeges_ermeveres = 1;
                vezerlo.korpercenkent = korpercenkent;
                vezerlo.next_kor = 0;
                vezerlo.start_new = korperc_start_new;
                vezerlo.wdata = 0;
                vezerlo.faluk = faluk;
                vezerlo.index.barbarfarm = 0;
                vezerlo.index.jatekosfarm = 0;

                if (item_not_exist.includes(typeof (SAM.multi_village_bot.vezerlo.next_kor))) {
                    save_localstorage();
                }
                else {
                    vezerlo = SAM.multi_village_bot.vezerlo;
                }
                var this_worldmap_localstorage = "map_data" + this_player + this_world;

                if (vezerlo.kikuldve.barbarfarm > vezerlo.korpercenkent.barbarfarm) { vezerlo.kikuldve.barbarfarm = 1; }
                if (vezerlo.kikuldve.gyujtogetes > vezerlo.korpercenkent.gyujtogetes) { vezerlo.kikuldve.gyujtogetes = 1; }
                if (vezerlo.kikuldve.jatekosfarm > vezerlo.korpercenkent.jatekosfarm) { vezerlo.kikuldve.jatekosfarm = 1; }
                if (vezerlo.kikuldve.epites > vezerlo.korpercenkent.epites) { vezerlo.kikuldve.epites = 1; }
                if (vezerlo.kikuldve.kepzes > vezerlo.korpercenkent.kepzes) { vezerlo.kikuldve.kepzes = 1; }
                if (vezerlo.kikuldve.tomeges_gyujti > vezerlo.korpercenkent.tomeges_gyujti) { vezerlo.kikuldve.tomeges_gyujti = 1; }
                if (vezerlo.kikuldve.tomeges_gyujti_feloldas > vezerlo.korpercenkent.tomeges_gyujti_feloldas) { vezerlo.kikuldve.tomeges_gyujti_feloldas = 1; }
                if (vezerlo.kikuldve.tomeges_kikepzes > vezerlo.korpercenkent.tomeges_kikepzes) { vezerlo.kikuldve.tomeges_kikepzes = 1; }
                if (vezerlo.kikuldve.tomeges_epites > vezerlo.korpercenkent.tomeges_epites) { vezerlo.kikuldve.tomeges_epites = 1; }
                if (vezerlo.kikuldve.tomeges_barbar_faluk_kosozasa > vezerlo.korpercenkent.tomeges_barbar_faluk_kosozasa) { vezerlo.kikuldve.tomeges_barbar_faluk_kosozasa = 1; }
                if (vezerlo.kikuldve.tomeges_nyersikiegyenlites > vezerlo.korpercenkent.tomeges_nyersikiegyenlites) { vezerlo.kikuldve.tomeges_nyersikiegyenlites = 1; }
                if (vezerlo.kikuldve.tomeges_ermeveres > vezerlo.korpercenkent.tomeges_ermeveres) { vezerlo.kikuldve.tomeges_ermeveres = 1; }

                if (vezerlo.faluk !== faluk) { vezerlo.faluk = faluk; }
                if (vezerlo.korpercenkent !== korpercenkent) { vezerlo.korpercenkent = korpercenkent; }

                if (vezerlo.start_new > vezerlo.next_kor || vezerlo.start_new === undefined) { vezerlo.start_new = korperc_start_new; }
                else if (vezerlo.start_new < korperc_start_new_back) {
                    vezerlo.kikuldve.barbarfarm = 1;
                    vezerlo.kikuldve.gyujtogetes = 1;
                    vezerlo.kikuldve.epites = 1;
                    vezerlo.kikuldve.kepzes = 1;
                    vezerlo.kikuldve.jatekosfarm = 1;
                    vezerlo.kikuldve.tomeges_gyujti = 1;
                    vezerlo.kikuldve.tomeges_gyujti_feloldas = 1;
                    vezerlo.kikuldve.tomeges_kikepzes = 1;
                    vezerlo.kikuldve.tomeges_epites = 1;
                    vezerlo.kikuldve.tomeges_barbar_faluk_kosozasa = 1;
                    vezerlo.kikuldve.tomeges_nyersikiegyenlites = 1;
                    vezerlo.kikuldve.tomeges_ermeveres = 1;
                }

                save_localstorage();
                mapper();

                function mapper() {
                    if (localStorage.getItem(this_worldmap_localstorage) === null || localStorage.getItem(this_worldmap_localstorage) === "NaN") { mapper_setup(); }
                    else if (vezerlo.wdata === 0 || vezerlo.wdata < date_most - terkepfrissites) { mapper_setup(); }
                    else { map_id = JSON.parse(localStorage.getItem(this_worldmap_localstorage)); }

                    function mapper_setup() {
                        var w_data_link = "https://" + window.location.hostname + "/map/village.txt";
                        var w_data = $.get(w_data_link);

                        function w_data_pretty() {
                            var text = w_data.responseText;
                            var ids = text.split('\n');
                            var lines = ids.length;
                            var format = ["id", "name", "x", "y", "player", "points", "rank"]; // 0,1,2,3,4,5,6
                            var map_id = ids.map(t => t.split(","));
                            localStorage.setItem(this_worldmap_localstorage, JSON.stringify(map_id));
                            vezerlo.wdata = date_post;
                            save_localstorage();
                        }
                        setTimeout(w_data_pretty, 2000);
                    }
                    setTimeout(trallala, 2500);
                }

                function trallala() {
                    "INSERT_LICENSE_CHECK_HERE"
                    if (BotProtect.forced) { setTimeout((function () { window.location.reload(true); }, (Math.floor((Math.random() * 300000) + 500000)))); }
                    else if (visszalepes === 1 && !BotProtect.forced && (document.URL.match("intro"))) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=main"); }, delay_between_stuff); }
                    else if (visszalepes === 1 && !BotProtect.forced && (document.URL.match("screen=overview") && !document.URL.match("screen=overview_villages"))) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=main"); }, delay_between_stuff); }
                    else if (farm === 1 && !BotProtect.forced && document.URL.match("screen=am_farm") && (vezerlo.kikuldve.barbarfarm === 1)) { setTimeout(auto_building_finish, delay_between_stuff); setTimeout(farmi, delay_between_stuff); }
                    else if (farm === 1 && !BotProtect.forced && document.URL.match("screen=am_farm") && (vezerlo.kikuldve.barbarfarm <= vezerlo.korpercenkent.barbarfarm && vezerlo.kikuldve.barbarfarm !== 1)) { vezerlo.kikuldve.barbarfarm = +vezerlo.kikuldve.barbarfarm + 1; save_localstorage(); setTimeout(atlepes, delay_between_stuff); }
                    else if (gyujtogetes === 1 && tomeges_gyujti === 0 && !BotProtect.forced && document.URL.match("screen=place") && document.URL.match("mode=scavenge") && (vezerlo.kikuldve.gyujtogetes === 1)) { setTimeout(gyujti, delay_between_stuff); }
                    else if (gyujtogetes === 1 && tomeges_gyujti === 0 && !BotProtect.forced && document.URL.match("screen=place") && document.URL.match("mode=scavenge") && (vezerlo.kikuldve.gyujtogetes < vezerlo.korpercenkent.gyujtogetes && vezerlo.kikuldve.gyujtogetes !== 1)) { vezerlo.kikuldve.gyujtogetes = +vezerlo.kikuldve.gyujtogetes + 1; save_localstorage(); setTimeout(atlepes, delay_between_stuff); }
                    else if (gyujtogetes === 1 && premium_fiok === 1 && tomeges_gyujti === 1 && !BotProtect.forced && document.URL.match("screen=place") && document.URL.match("mode=scavenge_mass") && (vezerlo.kikuldve.tomeges_gyujti === 1)) { setTimeout(mass_scav, delay_between_stuff); }
                    else if (gyujtogetes === 1 && premium_fiok === 1 && tomeges_gyujti === 1 && !BotProtect.forced && document.URL.match("screen=place") && document.URL.match("mode=scavenge_mass") && (vezerlo.kikuldve.tomeges_gyujti < vezerlo.korpercenkent.tomeges_gyujti && vezerlo.kikuldve.tomeges_gyujti !== 1)) { vezerlo.kikuldve.tomeges_gyujti = +vezerlo.kikuldve.tomeges_gyujti + 1; save_localstorage(); setTimeout(atlepes, delay_between_stuff); }
                    else if (epites === 0 && tomeges_epites === 0 && !BotProtect.forced && document.URL.match("screen=main")) { setTimeout(auto_building_finish, delay_between_stuff); }
                    else if (epites === 1 && tomeges_epites === 0 && !BotProtect.forced && document.URL.match("screen=main") && (vezerlo.kikuldve.epites === 1)) { setTimeout(auto_building_finish, delay_between_stuff); setTimeout(epiti, (delay_between_stuff + 1000)); }
                    else if (epites === 1 && tomeges_epites === 0 && !BotProtect.forced && document.URL.match("screen=main") && (vezerlo.kikuldve.epites <= vezerlo.korpercenkent.epites && vezerlo.kikuldve.epites !== 1)) { vezerlo.kikuldve.epites = +vezerlo.kikuldve.epites + 1; save_localstorage(); setTimeout(atlepes, delay_between_stuff); }
                    else if (epites === 1 && premium_fiok === 1 && tomeges_epites === 1 && !BotProtect.forced && document.URL.match("screen=overview_villages") && document.URL.match("mode=buildings") && (vezerlo.kikuldve.tomeges_epites === 1)) { setTimeout(auto_building_finish, delay_between_stuff); setTimeout(mass_build, (delay_between_stuff + 1000)); }
                    else if (epites === 1 && premium_fiok === 1 && tomeges_epites === 1 && !BotProtect.forced && document.URL.match("screen=overview_villages") && document.URL.match("mode=buildings") && (vezerlo.kikuldve.tomeges_epites <= vezerlo.korpercenkent.tomeges_epites && vezerlo.kikuldve.tomeges_epites !== 1)) { vezerlo.kikuldve.tomeges_epites = +vezerlo.kikuldve.tomeges_epites + 1; save_localstorage(); setTimeout(atlepes, delay_between_stuff); }
                    else if (kepzes === 1 && tomeges_kikepzes === 0 && !BotProtect.forced && document.URL.match("screen=train") && (vezerlo.kikuldve.kepzes === 1)) { setTimeout(auto_building_finish, delay_between_stuff); setTimeout(kepzi, delay_between_stuff); }
                    else if (kepzes === 1 && tomeges_kikepzes === 0 && !BotProtect.forced && document.URL.match("screen=train") && (vezerlo.kikuldve.kepzes <= vezerlo.korpercenkent.kepzes && vezerlo.kikuldve.kepzes !== 1)) { vezerlo.kikuldve.kepzes = +vezerlo.kikuldve.kepzes + 1; save_localstorage(); setTimeout(atlepes, delay_between_stuff); }
                    else if (kepzes === 1 && premium_fiok === 1 && tomeges_kikepzes === 1 && !BotProtect.forced && document.URL.match("screen=train") && document.URL.match("mode=mass") && (vezerlo.kikuldve.tomeges_kikepzes === 1)) { setTimeout(auto_building_finish, delay_between_stuff); setTimeout(mass_train, delay_between_stuff); }
                    else if (kepzes === 1 && premium_fiok === 1 && tomeges_kikepzes === 1 && !BotProtect.forced && document.URL.match("screen=train") && document.URL.match("mode=mass") && (vezerlo.kikuldve.tomeges_kikepzes <= vezerlo.korpercenkent.tomeges_kikepzes && vezerlo.kikuldve.tomeges_kikepzes !== 1)) { vezerlo.kikuldve.tomeges_kikepzes = +vezerlo.kikuldve.tomeges_kikepzes + 1; save_localstorage(); setTimeout(atlepes, delay_between_stuff); }
                    else if (kepzes === 1 && premium_fiok === 1 && tomeges_kikepzes === 1 && !BotProtect.forced && document.URL.match("screen=train") && document.URL.match("mode=success")) { vezerlo.kikuldve.tomeges_kikepzes = +vezerlo.kikuldve.tomeges_kikepzes + 1; save_localstorage(); setTimeout(atlepes, delay_between_stuff); }
                    else if (jatekosfarm === 1 && !BotProtect.forced && document.URL.match("screen=place") && (!document.URL.match("mode=scavenge") || document.URL.match("try=confirm")) && (vezerlo.kikuldve.jatekosfarm === 1)) { setTimeout(auto_building_finish, delay_between_stuff); setTimeout(jatekos_farmi, delay_between_stuff); }
                    else if (jatekosfarm === 1 && !BotProtect.forced && document.URL.match("screen=place") && (!document.URL.match("mode=scavenge") || document.URL.match("try=confirm")) && (vezerlo.kikuldve.jatekosfarm <= vezerlo.korpercenkent.jatekosfarm && vezerlo.kikuldve.jatekosfarm !== 1)) { vezerlo.kikuldve.jatekosfarm = +vezerlo.kikuldve.jatekosfarm + 1; save_localstorage(); setTimeout(atlepes, delay_between_stuff); }
                    else if (premium_fiok === 1 && barbar_faluk_kosozasa === 1 && !BotProtect.forced && document.URL.match("screen=map") && (vezerlo.kikuldve.tomeges_barbar_faluk_kosozasa === 1)) { setTimeout(auto_building_finish, delay_between_stuff); setTimeout(mass_destroy_wall, (delay_between_stuff + 1000)); }
                    else if (premium_fiok === 1 && barbar_faluk_kosozasa === 1 && !BotProtect.forced && document.URL.match("screen=map") && (vezerlo.kikuldve.tomeges_barbar_faluk_kosozasa < vezerlo.korpercenkent.tomeges_barbar_faluk_kosozasa && vezerlo.kikuldve.tomeges_barbar_faluk_kosozasa !== 1)) { vezerlo.kikuldve.tomeges_barbar_faluk_kosozasa = +vezerlo.kikuldve.tomeges_barbar_faluk_kosozasa + 1; save_localstorage(); setTimeout(atlepes, delay_between_stuff); }
                    else if (premium_fiok === 1 && nyersikiegyenlites === 1 && !BotProtect.forced && document.URL.match("screen=overview_villages") && document.URL.match("mode=prod") && (vezerlo.kikuldve.tomeges_nyersikiegyenlites === 1)) { setTimeout(auto_building_finish, delay_between_stuff); setTimeout(mass_nyersi, (delay_between_stuff + 1000)); }
                    else if (premium_fiok === 1 && nyersikiegyenlites === 1 && !BotProtect.forced && document.URL.match("screen=overview_villages") && document.URL.match("mode=prod") && (vezerlo.kikuldve.tomeges_nyersikiegyenlites < vezerlo.korpercenkent.tomeges_nyersikiegyenlites && vezerlo.kikuldve.tomeges_nyersikiegyenlites !== 1)) { vezerlo.kikuldve.tomeges_nyersikiegyenlites = +vezerlo.kikuldve.tomeges_nyersikiegyenlites + 1; save_localstorage(); setTimeout(atlepes, delay_between_stuff); }
                    else if (premium_fiok === 1 && ermeveretes === 1 && !BotProtect.forced && document.URL.match("screen=snob") && document.URL.match("mode=coin") && (vezerlo.kikuldve.tomeges_ermeveres === 1)) { setTimeout(auto_building_finish, delay_between_stuff); setTimeout(mass_coin, (delay_between_stuff + 1000)); }
                    else if (premium_fiok === 1 && ermeveretes === 1 && !BotProtect.forced && document.URL.match("screen=snob") && document.URL.match("mode=coin") && (vezerlo.kikuldve.tomeges_ermeveres < vezerlo.korpercenkent.tomeges_ermeveres && vezerlo.kikuldve.tomeges_ermeveres !== 1)) { vezerlo.kikuldve.tomeges_ermeveres = +vezerlo.kikuldve.tomeges_ermeveres + 1; save_localstorage(); setTimeout(atlepes, delay_between_stuff); }
                    else if (tozsde === 1 && !BotProtect.forced && document.URL.match("screen=market") && document.URL.match("mode=exchange") && (nyersi_elad === 1 || nyersi_vesz === 1)) { setTimeout(auto_building_finish, delay_between_stuff); setTimeout(tozsdi, delay_between_stuff); }
                    else if (tozsde === 1 && !BotProtect.forced && document.URL.match("screen=market") && document.URL.match("mode=exchange") && nyersi_elad === 0 && nyersi_vesz === 0) { tovabblepes(); }
                    else if (tozsde === 1 && !BotProtect.forced && document.URL.match("screen=mail") && emberi_mozzanatok === 0) { tovabblepes(); }
                    else if (tozsde === 1 && !BotProtect.forced && document.URL.match("screen=mail") && emberi_mozzanatok === 1) { vezerlo.next_kor = korperc_post; save_localstorage(); humanize(); }
                    else if (tozsde === 1 && !BotProtect.forced && (document.URL.match("screen=ally&mode") || document.URL.match("screen=forum") || document.URL.match("screen=ranking") || document.URL.match("screen=info_player") || document.URL.match("screen=report") || document.URL.match("screen=inventory") || document.URL.match("screen=settings") || (document.URL.match("screen=map") && barbar_faluk_kosozasa === 0)) && emberi_mozzanatok === 1) { humanize(); }
                }
            }
        }
        function tovabblepes() {
            "INSERT_LICENSE_CHECK_HERE"
            if (BotProtect.forced) {
                if (botriado === 2) {
                    captcha_solver_sam();
                    return;
                }
                else if (botriado === 1) {
                    pipalos_captcha();
                    return;
                }
            }
            var mapi;
            var this_world = game_data.world;
            var this_player = game_data.player.name;
            var this_worldmap_localstorage = "map_data" + this_player + this_world;
            vezerlo = SAM.multi_village_bot.vezerlo
            map_id = JSON.parse(localStorage.getItem(this_worldmap_localstorage));
            var id = game_data.village.id;
            function get_id(nx, ny) {
                return +map_id.filter(k => +k[2] === nx && +k[3] === ny)[0][0];
            }
            var ennyiperc = korperc * 1000 * 60;
            var ennyiperc_delay = Math.floor((Math.random() * 300000) + +ennyiperc);
            var lepes_random = Math.floor((Math.random() * 8000) + 1000); // ms
            var lepes_random2 = Math.floor((Math.random() * 4000) + 100); // ms
            var delay_between_stuff;
            setInterval(function () { delay_between_stuff = Math.floor((Math.random() * 2000) + 1500); }, 100); // ms
            var csopik = {};
            csopik.hossz = {};
            csopik.pretty = {};
            csopik.pretty.tamado = vezerlo.faluk.csoport.tamado.replaceAll("  ", " ");
            if (csopik.pretty.tamado.endsWith(" ")) { csopik.pretty.tamado = csopik.pretty.tamado.slice(0, -1); }
            if (csopik.pretty.tamado.startsWith(" ")) { csopik.pretty.tamado = csopik.pretty.tamado.slice(1); }
            csopik.pretty.frontvedo = vezerlo.faluk.csoport.frontvedo.replaceAll("  ", " ");
            if (csopik.pretty.frontvedo.endsWith(" ")) { csopik.pretty.frontvedo = csopik.pretty.frontvedo.slice(0, -1); }
            if (csopik.pretty.frontvedo.startsWith(" ")) { csopik.pretty.frontvedo = csopik.pretty.frontvedo.slice(1); }
            csopik.pretty.hatsovedo = vezerlo.faluk.csoport.hatsovedo.replaceAll("  ", " ");
            if (csopik.pretty.hatsovedo.endsWith(" ")) { csopik.pretty.hatsovedo = csopik.pretty.hatsovedo.slice(0, -1); }
            if (csopik.pretty.hatsovedo.startsWith(" ")) { csopik.pretty.hatsovedo = csopik.pretty.hatsovedo.slice(1); }
            csopik.pretty.farm = vezerlo.faluk.csoport.farm.replaceAll("  ", " ");
            if (csopik.pretty.farm.endsWith(" ")) { csopik.pretty.farm = csopik.pretty.farm.slice(0, -1); }
            if (csopik.pretty.farm.startsWith(" ")) { csopik.pretty.farm = csopik.pretty.farm.slice(1); }
            csopik.pretty.kem = vezerlo.faluk.csoport.kem.replaceAll("  ", " ");
            if (csopik.pretty.kem.endsWith(" ")) { csopik.pretty.kem = csopik.pretty.kem.slice(0, -1); }
            if (csopik.pretty.kem.startsWith(" ")) { csopik.pretty.kem = csopik.pretty.kem.slice(1); }
            csopik.pretty.barbarfarm = vezerlo.faluk.csoport.barbarfarmolofaluk.replaceAll("  ", " ");
            if (csopik.pretty.barbarfarm.endsWith(" ")) { csopik.pretty.barbarfarm = csopik.pretty.barbarfarm.slice(0, -1); }
            if (csopik.pretty.barbarfarm.startsWith(" ")) { csopik.pretty.barbarfarm = csopik.pretty.barbarfarm.slice(1); }
            csopik.pretty.jatekosfarm = vezerlo.faluk.csoport.jatekosfarmolofaluk.replaceAll("  ", " ");
            if (csopik.pretty.jatekosfarm.endsWith(" ")) { csopik.pretty.jatekosfarm = csopik.pretty.jatekosfarm.slice(0, -1); }
            if (csopik.pretty.jatekosfarm.startsWith(" ")) { csopik.pretty.jatekosfarm = csopik.pretty.jatekosfarm.slice(1); }
            csopik.pretty.barbarkosozofaluk = vezerlo.faluk.csoport.barbarkosozofaluk.replaceAll("  ", " ");
            if (csopik.pretty.barbarkosozofaluk.endsWith(" ")) { csopik.pretty.barbarkosozofaluk = csopik.pretty.barbarkosozofaluk.slice(0, -1); }
            if (csopik.pretty.barbarkosozofaluk.startsWith(" ")) { csopik.pretty.barbarkosozofaluk = csopik.pretty.barbarkosozofaluk.slice(1); }

            csopik.tamado = csopik.pretty.tamado.split(" ");
            csopik.frontvedo = csopik.pretty.frontvedo.split(" ");
            csopik.hatsovedo = csopik.pretty.hatsovedo.split(" ");
            csopik.farm = csopik.pretty.farm.split(" ");
            csopik.kem = csopik.pretty.kem.split(" ");
            csopik.barbarfarm = csopik.pretty.barbarfarm.split(" ");
            csopik.jatekosfarm = csopik.pretty.jatekosfarm.split(" ");
            csopik.barbarkosozofaluk = csopik.pretty.barbarkosozofaluk.split(" ");
            csopik.hossz.tamado = csopik.tamado[0].length;
            csopik.hossz.frontvedo = csopik.frontvedo[0].length;
            csopik.hossz.hatsovedo = csopik.hatsovedo[0].length;
            csopik.hossz.farm = csopik.farm[0].length;
            csopik.hossz.kem = csopik.kem[0].length;
            csopik.hossz.barbarfarm = csopik.barbarfarm[0].length;
            csopik.hossz.jatekosfarm = csopik.jatekosfarm[0].length;
            csopik.hossz.barbarkosozofaluk = csopik.barbarkosozofaluk[0].length;
            if (csopik.tamado.indexOf("") !== -1) { csopik.tamado.splice(csopik.tamado.indexOf(""), 1) }
            if (csopik.frontvedo.indexOf("") !== -1) { csopik.frontvedo.splice(csopik.frontvedo.indexOf(""), 1) }
            if (csopik.hatsovedo.indexOf("") !== -1) { csopik.hatsovedo.splice(csopik.hatsovedo.indexOf(""), 1) }
            if (csopik.farm.indexOf("") !== -1) { csopik.farm.splice(csopik.farm.indexOf(""), 1) }
            if (csopik.kem.indexOf("") !== -1) { csopik.kem.splice(csopik.kem.indexOf(""), 1) }
            if (csopik.barbarfarm.indexOf("") !== -1) { csopik.barbarfarm.splice(csopik.barbarfarm.indexOf(""), 1) }
            if (csopik.jatekosfarm.indexOf("") !== -1) { csopik.jatekosfarm.splice(csopik.jatekosfarm.indexOf(""), 1) }
            if (csopik.barbarkosozofaluk.indexOf("") !== -1) { csopik.barbarkosozofaluk.splice(csopik.barbarkosozofaluk.indexOf(""), 1) }
            var most_falu, get_index, get_max, next_coord, nx, ny, nid, base_link;

            if (támadó_faluból === 1 && frontvédő_faluból === 1 && hátsóvédő_faluból === 1) { csopik.gyujti = csopik.tamado.concat(csopik.frontvedo.concat(csopik.hatsovedo)); }
            else if (támadó_faluból === 1 && frontvédő_faluból === 1 && hátsóvédő_faluból === 0) { csopik.gyujti = csopik.tamado.concat(csopik.frontvedo); }
            else if (támadó_faluból === 1 && frontvédő_faluból === 0 && hátsóvédő_faluból === 1) { csopik.gyujti = csopik.tamado.concat(csopik.hatsovedo); }
            else if (támadó_faluból === 1 && frontvédő_faluból === 0 && hátsóvédő_faluból === 0) { csopik.gyujti = csopik.tamado; }
            else if (támadó_faluból === 0 && frontvédő_faluból === 1 && hátsóvédő_faluból === 1) { csopik.gyujti = csopik.frontvedo.concat(csopik.hatsovedo); }
            else if (támadó_faluból === 0 && frontvédő_faluból === 0 && hátsóvédő_faluból === 1) { csopik.gyujti = csopik.hatsovedo; }
            else if (támadó_faluból === 0 && frontvédő_faluból === 1 && hátsóvédő_faluból === 0) { csopik.gyujti = csopik.frontvedo; }
            csopik.epit = csopik.tamado.concat(csopik.frontvedo, csopik.hatsovedo, csopik.farm, csopik.kem);
            csopik.kepzes = csopik.tamado.concat(csopik.frontvedo, csopik.hatsovedo, csopik.farm, csopik.kem);

            if (navigator.onLine === false) { setTimeout(tovabblepes, lepes_random) }
            else if (navigator.onLine === true) {
                if (document.URL.match("screen=am_farm")) {
                    if (farm === 1 && csopik.hossz.barbarfarm !== 0) {
                        most_falu = game_data.village.x + "|" + game_data.village.y;
                        get_index = csopik.barbarfarm.indexOf(most_falu);
                        get_max = csopik.barbarfarm.length - 1;
                        if (get_index < get_max) {
                            next_coord = csopik.barbarfarm[get_index + 1];
                            nx = +next_coord.split("|")[0];
                            ny = +next_coord.split("|")[1];
                            nid = get_id(nx, ny);
                            base_link = game_data.link_base_pure.replace(id, nid);
                            self.location = base_link + "am_farm";
                        }
                        else if (get_index >= get_max) { vezerlo.kikuldve.barbarfarm = +vezerlo.kikuldve.barbarfarm + 1; save_localstorage(); atlepes(); }
                    }
                    else if (farm === 1 && csopik.hossz.barbarfarm === 0) { atlepes(); }
                    else if (farm === 0) { atlepes(); }
                }
                else if (document.URL.match("screen=place") && document.URL.match("mode=scavenge") && !document.URL.match("mode=scavenge_mass")) {
                    if (gyujtogetes === 1 && (csopik.hossz.tamado !== 0 || csopik.hossz.frontvedo !== 0 || csopik.hossz.hatsovedo !== 0)) {
                        most_falu = game_data.village.x + "|" + game_data.village.y;
                        get_index = csopik.gyujti.indexOf(most_falu);
                        get_max = csopik.gyujti.length - 1;
                        if (get_index < get_max) {
                            next_coord = csopik.gyujti[get_index + 1];
                            nx = +next_coord.split("|")[0];
                            ny = +next_coord.split("|")[1];
                            nid = get_id(nx, ny);
                            base_link = game_data.link_base_pure.replace(id, nid);
                            self.location = base_link + "place&mode=scavenge";
                        }
                        else if (get_index >= get_max) { vezerlo.kikuldve.gyujtogetes = +vezerlo.kikuldve.gyujtogetes + 1; save_localstorage(); atlepes(); }
                    }
                    else if (gyujtogetes === 1 && csopik.hossz.tamado === 0 && csopik.hossz.frontvedo === 0 && csopik.hossz.hatsovedo === 0) { atlepes(); }
                    else if (gyujtogetes === 0) { atlepes(); }
                }
                else if (document.URL.match("screen=place") && document.URL.match("mode=scavenge_mass")) {
                    if (gyujtogetes === 1 && (csopik.hossz.tamado !== 0 || csopik.hossz.frontvedo !== 0 || csopik.hossz.hatsovedo !== 0)) {
                        document.getElementById("x").click();
                        if (tomeges_gyujti_feloldas === 1) {
                            if (vezerlo.kikuldve.tomeges_gyujti_feloldas === 1) {
                                vezerlo.kikuldve.tomeges_gyujti_feloldas = +vezerlo.kikuldve.tomeges_gyujti_feloldas + 1; save_localstorage();
                                setTimeout(mass_scav_unlock, delay_between_stuff);
                            }
                        }
                        else {
                            vezerlo.kikuldve.tomeges_gyujti = +vezerlo.kikuldve.tomeges_gyujti + 1; save_localstorage(); atlepes();
                        }
                    }
                    else if (gyujtogetes === 1 && csopik.hossz.tamado === 0 && csopik.hossz.frontvedo === 0 && csopik.hossz.hatsovedo === 0) { atlepes(); }
                    else if (gyujtogetes === 0) { atlepes(); }
                }
                else if (document.URL.match("screen=place") && (!document.URL.match("mode=scavenge") && !document.URL.match("mode=scavenge_mass"))) {
                    if (jatekosfarm === 1 && csopik.hossz.jatekosfarm !== 0) {
                        most_falu = game_data.village.x + "|" + game_data.village.y;
                        get_index = csopik.jatekosfarm.indexOf(most_falu);
                        get_max = csopik.jatekosfarm.length - 1;
                        if (get_index < get_max) {
                            next_coord = csopik.jatekosfarm[get_index + 1];
                            nx = +next_coord.split("|")[0];
                            ny = +next_coord.split("|")[1];
                            nid = get_id(nx, ny);
                            base_link = game_data.link_base_pure.replace(id, nid);
                            self.location = base_link + "place&mode=command";
                        }
                        else if (get_index >= get_max) { vezerlo.kikuldve.jatekosfarm = +vezerlo.kikuldve.jatekosfarm + 1; save_localstorage(); atlepes(); }
                    }
                    else if (jatekosfarm === 1 && csopik.hossz.jatekosfarm === 0) { atlepes(); }
                    else if (jatekosfarm === 0) { atlepes(); }

                }
                else if (document.URL.match("screen=main")) {
                    if (epites === 1 && (csopik.hossz.tamado !== 0 || csopik.hossz.frontvedo !== 0 || csopik.hossz.hatsovedo !== 0 || csopik.hossz.farm !== 0 || csopik.hossz.kem !== 0)) {
                        most_falu = game_data.village.x + "|" + game_data.village.y;
                        get_index = csopik.epit.indexOf(most_falu);
                        get_max = csopik.epit.length - 1;
                        if (get_index < get_max) {
                            next_coord = csopik.epit[get_index + 1];
                            nx = +next_coord.split("|")[0];
                            ny = +next_coord.split("|")[1];
                            nid = get_id(nx, ny);
                            base_link = game_data.link_base_pure.replace(id, nid);
                            self.location = base_link + "main";
                        }
                        else if (get_index >= get_max) { vezerlo.kikuldve.epites = +vezerlo.kikuldve.epites + 1; save_localstorage(); atlepes(); }
                    }
                    else if (epites === 1 && csopik.hossz.tamado === 0 && csopik.hossz.frontvedo === 0 && csopik.hossz.hatsovedo === 0 && csopik.hossz.farm === 0 && csopik.hossz.kem === 0) { atlepes(); }
                    else if (epites === 0) { atlepes(); }
                }
                else if (document.URL.match("overview_villages") && document.URL.match("mode=buildings")) {
                    vezerlo.kikuldve.tomeges_epites = +vezerlo.kikuldve.tomeges_epites + 1; save_localstorage();
                    atlepes();
                }
                else if (document.URL.match("overview_villages") && document.URL.match("mode=prod")) {
                    vezerlo.kikuldve.tomeges_nyersikiegyenlites = +vezerlo.kikuldve.tomeges_nyersikiegyenlites + 1; save_localstorage();
                    atlepes();
                }
                else if (document.URL.match("screen=train") && !document.URL.match("mode=mass")) {
                    if (kepzes === 1 && (csopik.hossz.tamado !== 0 || csopik.hossz.frontvedo !== 0 || csopik.hossz.hatsovedo !== 0 || csopik.hossz.farm !== 0 || csopik.hossz.kem !== 0)) {
                        most_falu = game_data.village.x + "|" + game_data.village.y;
                        get_index = csopik.kepzes.indexOf(most_falu);
                        get_max = csopik.kepzes.length - 1;
                        if (get_index < get_max) {
                            next_coord = csopik.kepzes[get_index + 1];
                            nx = +next_coord.split("|")[0];
                            ny = +next_coord.split("|")[1];
                            nid = get_id(nx, ny);
                            base_link = game_data.link_base_pure.replace(id, nid);
                            self.location = base_link + "train";
                        }
                        else if (get_index >= get_max) { vezerlo.kikuldve.kepzes = +vezerlo.kikuldve.kepzes + 1; save_localstorage(); atlepes(); }
                    }
                    else if (kepzes === 1 && csopik.hossz.tamado === 0 && csopik.hossz.frontvedo === 0 && csopik.hossz.hatsovedo === 0 && csopik.hossz.farm === 0 && csopik.hossz.kem === 0) { atlepes(); }
                    else if (kepzes === 0) { atlepes(); }
                }
                else if (document.URL.match("screen=snob") && document.URL.match("mode=coin")) {
                    vezerlo.kikuldve.tomeges_ermeveres = +vezerlo.kikuldve.tomeges_ermeveres + 1; save_localstorage();
                    atlepes();
                }
                else if (document.URL.match("screen=map")) {
                    if (barbar_faluk_kosozasa === 1 && csopik.hossz.barbarkosozofaluk !== 0) {
                        most_falu = game_data.village.x + "|" + game_data.village.y;
                        get_index = csopik.barbarkosozofaluk.indexOf(most_falu);
                        get_max = csopik.barbarkosozofaluk.length - 1;
                        if (get_index < get_max) {
                            next_coord = csopik.barbarkosozofaluk[get_index + 1];
                            nx = +next_coord.split("|")[0];
                            ny = +next_coord.split("|")[1];
                            nid = get_id(nx, ny);
                            base_link = game_data.link_base_pure.replace(id, nid);
                            self.location = base_link + "map";
                        }
                        else if (get_index >= get_max) { vezerlo.kikuldve.barbar_faluk_kosozasa = +vezerlo.kikuldve.barbar_faluk_kosozasa + 1; save_localstorage(); atlepes(); }
                    }
                    else if (barbar_faluk_kosozasa === 1 && csopik.hossz.barbarkosozofaluk === 0) { atlepes(); }
                    else if (barbar_faluk_kosozasa === 0) { atlepes(); }
                }
                else if (document.URL.match("screen=market") && document.URL.match("mode=exchange")) { atlepes(); }
                else if (document.URL.match("screen=mail") || document.URL.match("screen=ally&mode") || document.URL.match("screen=forum") || document.URL.match("screen=ranking") || document.URL.match("screen=info_player") || document.URL.match("screen=report") || document.URL.match("screen=inventory") || document.URL.match("screen=settings")) { atlepes(); }
            }
        }
        function atlepes() {
            "INSERT_LICENSE_CHECK_HERE"
            if (BotProtect.forced) {
                if (botriado === 2) {
                    captcha_solver_sam();
                    return;
                }
                else if (botriado === 1) {
                    pipalos_captcha();
                    return;
                }
            }
            var mapi;
            var this_world = game_data.world;
            var this_player = game_data.player.name;
            var this_worldmap_localstorage = "map_data" + this_player + this_world;
            map_id = JSON.parse(localStorage.getItem(this_worldmap_localstorage));
            var id = game_data.village.id;
            var ennyiperc = korperc * 1000 * 60;
            var ennyiperc_delay = Math.floor((Math.random() * 300000) + +ennyiperc);
            var lepes_random = Math.floor((Math.random() * 8000) + 1000); // ms
            var csopik = {};
            csopik.pretty = {};
            csopik.pretty.tamado = vezerlo.faluk.csoport.tamado.replaceAll("  ", " ");
            if (csopik.pretty.tamado.endsWith(" ")) { csopik.pretty.tamado = csopik.pretty.tamado.slice(0, -1); }
            if (csopik.pretty.tamado.startsWith(" ")) { csopik.pretty.tamado = csopik.pretty.tamado.slice(1); }
            csopik.pretty.frontvedo = vezerlo.faluk.csoport.frontvedo.replaceAll("  ", " ");
            if (csopik.pretty.frontvedo.endsWith(" ")) { csopik.pretty.frontvedo = csopik.pretty.frontvedo.slice(0, -1); }
            if (csopik.pretty.frontvedo.startsWith(" ")) { csopik.pretty.frontvedo = csopik.pretty.frontvedo.slice(1); }
            csopik.pretty.hatsovedo = vezerlo.faluk.csoport.hatsovedo.replaceAll("  ", " ");
            if (csopik.pretty.hatsovedo.endsWith(" ")) { csopik.pretty.hatsovedo = csopik.pretty.hatsovedo.slice(0, -1); }
            if (csopik.pretty.hatsovedo.startsWith(" ")) { csopik.pretty.hatsovedo = csopik.pretty.hatsovedo.slice(1); }
            csopik.pretty.farm = vezerlo.faluk.csoport.farm.replaceAll("  ", " ");
            if (csopik.pretty.farm.endsWith(" ")) { csopik.pretty.farm = csopik.pretty.farm.slice(0, -1); }
            if (csopik.pretty.farm.startsWith(" ")) { csopik.pretty.farm = csopik.pretty.farm.slice(1); }
            csopik.pretty.kem = vezerlo.faluk.csoport.kem.replaceAll("  ", " ");
            if (csopik.pretty.kem.endsWith(" ")) { csopik.pretty.kem = csopik.pretty.kem.slice(0, -1); }
            if (csopik.pretty.kem.startsWith(" ")) { csopik.pretty.kem = csopik.pretty.kem.slice(1); }
            csopik.pretty.barbarfarm = vezerlo.faluk.csoport.barbarfarmolofaluk.replaceAll("  ", " ");
            if (csopik.pretty.barbarfarm.endsWith(" ")) { csopik.pretty.barbarfarm = csopik.pretty.barbarfarm.slice(0, -1); }
            if (csopik.pretty.barbarfarm.startsWith(" ")) { csopik.pretty.barbarfarm = csopik.pretty.barbarfarm.slice(1); }
            csopik.pretty.jatekosfarm = vezerlo.faluk.csoport.jatekosfarmolofaluk.replaceAll("  ", " ");
            if (csopik.pretty.jatekosfarm.endsWith(" ")) { csopik.pretty.jatekosfarm = csopik.pretty.jatekosfarm.slice(0, -1); }
            if (csopik.pretty.jatekosfarm.startsWith(" ")) { csopik.pretty.jatekosfarm = csopik.pretty.jatekosfarm.slice(1); }
            csopik.tamado = csopik.pretty.tamado.split(" ");
            csopik.frontvedo = csopik.pretty.frontvedo.split(" ");
            csopik.hatsovedo = csopik.pretty.hatsovedo.split(" ");
            csopik.farm = csopik.pretty.farm.split(" ");
            csopik.kem = csopik.pretty.kem.split(" ");
            csopik.barbarfarm = csopik.pretty.barbarfarm.split(" ");
            csopik.jatekosfarm = csopik.pretty.jatekosfarm.split(" ");
            if (csopik.tamado.indexOf("") !== -1) { csopik.tamado.splice(csopik.tamado.indexOf(""), 1) }
            if (csopik.frontvedo.indexOf("") !== -1) { csopik.frontvedo.splice(csopik.frontvedo.indexOf(""), 1) }
            if (csopik.hatsovedo.indexOf("") !== -1) { csopik.hatsovedo.splice(csopik.hatsovedo.indexOf(""), 1) }
            if (csopik.farm.indexOf("") !== -1) { csopik.farm.splice(csopik.farm.indexOf(""), 1) }
            if (csopik.kem.indexOf("") !== -1) { csopik.kem.splice(csopik.kem.indexOf(""), 1) }
            if (csopik.barbarfarm.indexOf("") !== -1) { csopik.barbarfarm.splice(csopik.barbarfarm.indexOf(""), 1) }
            if (csopik.jatekosfarm.indexOf("") !== -1) { csopik.jatekosfarm.splice(csopik.jatekosfarm.indexOf(""), 1) }
            var most_falu, get_index, get_max, next_coord, nx, ny, nid, base_link;

            if (támadó_faluból === 1 && frontvédő_faluból === 1 && hátsóvédő_faluból === 1) { csopik.gyujti = csopik.tamado.concat(csopik.frontvedo.concat(csopik.hatsovedo)); }
            else if (támadó_faluból === 1 && frontvédő_faluból === 1 && hátsóvédő_faluból === 0) { csopik.gyujti = csopik.tamado.concat(csopik.frontvedo); }
            else if (támadó_faluból === 1 && frontvédő_faluból === 0 && hátsóvédő_faluból === 1) { csopik.gyujti = csopik.tamado.concat(csopik.hatsovedo); }
            else if (támadó_faluból === 1 && frontvédő_faluból === 0 && hátsóvédő_faluból === 0) { csopik.gyujti = csopik.tamado; }
            else if (támadó_faluból === 0 && frontvédő_faluból === 1 && hátsóvédő_faluból === 1) { csopik.gyujti = csopik.frontvedo.concat(csopik.hatsovedo); }
            else if (támadó_faluból === 0 && frontvédő_faluból === 0 && hátsóvédő_faluból === 1) { csopik.gyujti = csopik.hatsovedo; }
            else if (támadó_faluból === 0 && frontvédő_faluból === 1 && hátsóvédő_faluból === 0) { csopik.gyujti = csopik.frontvedo; }
            csopik.epit = csopik.tamado.concat(csopik.frontvedo, csopik.hatsovedo, csopik.farm, csopik.kem);
            csopik.kepzes = csopik.tamado.concat(csopik.frontvedo, csopik.hatsovedo, csopik.farm, csopik.kem);

            var nextcoord_farm, nextcoord_jatekosfarm, nextcoord_gyujti, nextcoord_epites, nextcoord_kepzes;
            nextcoord_farm = csopik.barbarfarm[0];
            nextcoord_jatekosfarm = csopik.jatekosfarm[0];
            nextcoord_gyujti = csopik.gyujti[0];
            nextcoord_epites = csopik.epit[0];
            nextcoord_kepzes = csopik.kepzes[0];

            if (nextcoord_farm !== undefined) {
                var nextcoord_farm_x = +nextcoord_farm.split("|")[0];
                var nextcoord_farm_y = +nextcoord_farm.split("|")[1];
            }
            if (nextcoord_jatekosfarm !== undefined) {
                var nextcoord_jatekosfarm_x = +nextcoord_jatekosfarm.split("|")[0];
                var nextcoord_jatekosfarm_y = +nextcoord_jatekosfarm.split("|")[1];
            }
            if (nextcoord_gyujti !== undefined) {
                var nextcoord_gyujti_x = +nextcoord_gyujti.split("|")[0];
                var nextcoord_gyujti_y = +nextcoord_gyujti.split("|")[1];
            }
            if (nextcoord_epites !== undefined) {
                var nextcoord_epites_x = +nextcoord_epites.split("|")[0];
                var nextcoord_epites_y = +nextcoord_epites.split("|")[1];
            }
            if (nextcoord_kepzes !== undefined) {
                var nextcoord_kepzes_x = +nextcoord_kepzes.split("|")[0];
                var nextcoord_kepzes_y = +nextcoord_kepzes.split("|")[1];
            }

            var nextid_farm, nextid_jatekosfarm, nextid_gyujti, nextid_epites, nextid_kepzes;
            function get_id(nx, ny) {
                return +map_id.filter(k => +k[2] === nx && +k[3] === ny)[0][0];
            }
            if (nextcoord_farm !== undefined) { nextid_farm = get_id(nextcoord_farm_x, nextcoord_farm_y); }
            if (nextcoord_jatekosfarm !== undefined) { nextid_jatekosfarm = get_id(nextcoord_jatekosfarm_x, nextcoord_jatekosfarm_y); }
            if (nextcoord_gyujti !== undefined) { nextid_gyujti = get_id(nextcoord_gyujti_x, nextcoord_gyujti_y); }
            if (nextcoord_epites !== undefined) { nextid_epites = get_id(nextcoord_epites_x, nextcoord_epites_y); }
            if (nextcoord_kepzes !== undefined) { nextid_kepzes = get_id(nextcoord_kepzes_x, nextcoord_kepzes_y); }

            if (navigator.onLine === false) { setTimeout(atlepes, lepes_random) }
            else if (navigator.onLine === true) {
                if (document.URL.match("screen=market") && document.URL.match("mode=exchange")) {
                    if (farm === 1 && game_data.features.FarmAssistent.active === true) { base_link = game_data.link_base_pure.replace(id, nextid_farm); setTimeout(function () { self.location = base_link + "am_farm"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && gyujtogetes === 1 && (tomeges_gyujti === 0 || premium_fiok === 0) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && gyujtogetes === 1 && (tomeges_gyujti === 1 && premium_fiok === 1) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge_mass"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 1 && (tomeges_epites === 0 || premium_fiok === 0)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "main"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 1 && (tomeges_epites === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "overview_villages&mode=buildings"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && kepzes === 1 && (tomeges_kikepzes === 0 || premium_fiok === 0) && +game_data.village.buildings.barracks >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && kepzes === 1 && (tomeges_kikepzes === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train&mode=mass"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && jatekosfarm === 1 && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_jatekosfarm); setTimeout(function () { self.location = base_link + "place&mode=command"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 1 && nyersi_elad === 0 && nyersi_vesz === 0) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=mail"); }, lepes_random); }
                    else { setTimeout(function () { window.location.reload(true); }, ennyiperc_delay); }
                }
                else if (document.URL.match("screen=am_farm")) {
                    if (gyujtogetes === 1 && (tomeges_gyujti === 0 || premium_fiok === 0) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge"; }, lepes_random); }
                    else if (gyujtogetes === 1 && (tomeges_gyujti === 1 && premium_fiok === 1) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge_mass"; }, lepes_random); }
                    else if ((gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 1 && (tomeges_epites === 0 || premium_fiok === 0)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "main"; }, lepes_random); }
                    else if ((gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 1 && (tomeges_epites === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "overview_villages&mode=buildings"; }, lepes_random); }
                    else if ((gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && kepzes === 1 && (tomeges_kikepzes === 0 || premium_fiok === 0) && +game_data.village.buildings.barracks >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train"; }, lepes_random); }
                    else if ((gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && kepzes === 1 && (tomeges_kikepzes === 1 || premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train&mode=mass"; }, lepes_random); }
                    else if ((gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && jatekosfarm === 1 && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_jatekosfarm); setTimeout(function () { self.location = base_link + "place&mode=command"; }, lepes_random); }
                    else if ((gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 1 && (nyersi_elad === 1 || nyersi_vesz === 1) && +game_data.village.buildings.market >= 1) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=market&mode=exchange"); }, lepes_random); }
                    else if ((gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 1 && nyersi_elad === 0 && nyersi_vesz === 0) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=mail"); }, lepes_random); }
                    else { base_link = game_data.link_base_pure.replace(id, nextid_farm); setTimeout(function () { self.location = base_link + "am_farm"; }, ennyiperc_delay); }
                }
                else if (document.URL.match("screen=place") && (document.URL.match("mode=scavenge") || document.URL.match("mode=scavenge_mass"))) {
                    if (epites === 1 && (tomeges_epites === 0 || premium_fiok === 0)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "main"; }, lepes_random); }
                    else if (epites === 1 && (tomeges_epites === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "overview_villages&mode=buildings"; }, lepes_random); }
                    else if (epites === 0 && kepzes === 1 && (tomeges_kikepzes === 0 || premium_fiok === 0) && +game_data.village.buildings.barracks >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train"; }, lepes_random); }
                    else if (epites === 0 && kepzes === 1 && (tomeges_kikepzes === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train&mode=mass"; }, lepes_random); }
                    else if (epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && jatekosfarm === 1 && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_jatekosfarm); setTimeout(function () { self.location = base_link + "place&mode=command"; }, lepes_random); }
                    else if (epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 1 && (nyersi_elad === 1 || nyersi_vesz === 1) && +game_data.village.buildings.market >= 1) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=market&mode=exchange"); }, lepes_random); }
                    else if (epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 1 && ((nyersi_elad === 0 && nyersi_vesz === 0) || +game_data.village.buildings.market <= 0)) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=mail"); }, lepes_random); }
                    else if (epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 0 && farm === 1 && game_data.features.FarmAssistent.active === true) { base_link = game_data.link_base_pure.replace(id, nextid_farm); setTimeout(function () { self.location = base_link + "am_farm"; }, lepes_random); }
                    else {
                        if (gyujtogetes === 1 && (tomeges_gyujti === 0 || premium_fiok === 0)) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge"; }, ennyiperc_delay); }
                        else if (gyujtogetes === 1 && (tomeges_gyujti === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge_mass"; }, ennyiperc_delay); }
                    }
                }
                else if (document.URL.match("screen=main") || (document.URL.match("screen=overview_villages") && document.URL.match("mode=buildings"))) {
                    if (kepzes === 1 && (tomeges_kikepzes === 0 || premium_fiok === 0) && +game_data.village.buildings.barracks >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train"; }, lepes_random); }
                    else if (kepzes === 1 && (tomeges_kikepzes === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train&mode=mass"; }, lepes_random); }
                    else if ((kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && jatekosfarm === 1 && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_jatekosfarm); setTimeout(function () { self.location = base_link + "place&mode=command"; }, lepes_random); }
                    else if ((kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 1 && (nyersi_elad === 1 || nyersi_vesz === 1) && +game_data.village.buildings.market >= 1) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=market&mode=exchange"); }, lepes_random); }
                    else if ((kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 1 && ((nyersi_elad === 0 && nyersi_vesz === 0) || +game_data.village.buildings.market <= 0)) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=mail"); }, lepes_random); }
                    else if ((kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 0 && farm === 1 && game_data.features.FarmAssistent.active === true) { base_link = game_data.link_base_pure.replace(id, nextid_farm); setTimeout(function () { self.location = base_link + "am_farm"; }, lepes_random); }
                    else if ((kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 0 && (farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && gyujtogetes === 1 && (tomeges_gyujti === 0 || premium_fiok === 0) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge"; }, lepes_random); }
                    else if ((kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 0 && (farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && gyujtogetes === 1 && (tomeges_gyujti === 1 && premium_fiok === 1) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge_mass"; }, lepes_random); }
                    else {
                        if (epites === 1 && (tomeges_epites === 0 || premium_fiok === 0)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "main"; }, ennyiperc_delay); }
                        else if (epites === 1 && (tomeges_epites === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "overview_villages&mode=buildings"; }, ennyiperc_delay); }
                    }
                }
                else if (document.URL.match("screen=train") || (document.URL.match("screen=train") && document.URL.match("mode=mass"))) {
                    if (jatekosfarm === 1 && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_jatekosfarm); setTimeout(function () { self.location = base_link + "place&mode=command"; }, lepes_random); }
                    else if ((jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 1 && (nyersi_elad === 1 || nyersi_vesz === 1) && +game_data.village.buildings.market >= 1) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=market&mode=exchange"); }, lepes_random); }
                    else if ((jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 1 && ((nyersi_elad === 0 && nyersi_vesz === 0) || +game_data.village.buildings.market <= 0)) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=mail"); }, lepes_random); }
                    else if ((jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 0 && farm === 1 && game_data.features.FarmAssistent.active === true) { base_link = game_data.link_base_pure.replace(id, nextid_farm); setTimeout(function () { self.location = base_link + "am_farm"; }, lepes_random); }
                    else if ((jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 0 && (farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && gyujtogetes === 1 && (tomeges_gyujti === 0 || premium_fiok === 0) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge"; }, lepes_random); }
                    else if ((jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 0 && (farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && gyujtogetes === 1 && (tomeges_gyujti === 1 && premium_fiok === 1) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge_mass"; }, lepes_random); }
                    else if ((jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 0 && (farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 1 && (tomeges_epites === 0 || premium_fiok === 0)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "main"; }, lepes_random); }
                    else if ((jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 0 && (farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 1 && (tomeges_epites === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "overview_villages&mode=buildings"; }, lepes_random); }
                    else {
                        if (kepzes === 1 && (tomeges_kikepzes === 0 || premium_fiok === 0)) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train"; }, ennyiperc_delay); }
                        else if (kepzes === 1 && (tomeges_kikepzes === 1 || premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train&mode=mass"; }, ennyiperc_delay); }
                    }
                }
                else if (document.URL.match("screen=place") && (!document.URL.match("mode=scavenge") || !document.URL.match("mode=scavenge_mass"))) {
                    if (tozsde === 1 && (nyersi_elad === 1 || nyersi_vesz === 1) && +game_data.village.buildings.market >= 1) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=market&mode=exchange"); }, lepes_random); }
                    else if (tozsde === 1 && ((nyersi_elad === 0 && nyersi_vesz === 0) || +game_data.village.buildings.market <= 0)) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=mail"); }, lepes_random); }
                    else if (tozsde === 0 && farm === 1 && game_data.features.FarmAssistent.active === true) { base_link = game_data.link_base_pure.replace(id, nextid_farm); setTimeout(function () { self.location = base_link + "am_farm"; }, lepes_random); }
                    else if (tozsde === 0 && (farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && gyujtogetes === 1 && (tomeges_gyujti === 0 || premium_fiok === 0) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge"; }, lepes_random); }
                    else if (tozsde === 0 && (farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && gyujtogetes === 1 && (tomeges_gyujti === 1 && premium_fiok === 1) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge_mass"; }, lepes_random); }
                    else if (tozsde === 0 && (farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 1 && (tomeges_epites === 0 || premium_fiok === 0)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "main"; }, lepes_random); }
                    else if (tozsde === 0 && (farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 1 && (tomeges_epites === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "overview_villages&mode=buildings"; }, lepes_random); }
                    else if (tozsde === 0 && (farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && kepzes === 1 && (tomeges_kikepzes === 0 || premium_fiok === 0) && +game_data.village.buildings.barracks >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train"; }, lepes_random); }
                    else if (tozsde === 0 && (farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && kepzes === 1 && (tomeges_kikepzes === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train&mode=mass"; }, lepes_random); }
                    else { base_link = game_data.link_base_pure.replace(id, nextid_jatekosfarm); setTimeout(function () { self.location = base_link + "place&mode=command"; }, ennyiperc_delay); }
                }
                else if (document.URL.match("screen=mail") && emberi_mozzanatok === 0) {
                    if (farm === 1 && game_data.features.FarmAssistent.active === true) { base_link = game_data.link_base_pure.replace(id, nextid_farm); setTimeout(function () { self.location = base_link + "am_farm"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && gyujtogetes === 1 && (tomeges_gyujti === 0 || premium_fiok === 0) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && gyujtogetes === 1 && (tomeges_gyujti === 1 && premium_fiok === 1) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); setTimeout(function () { self.location = base_link + "place&mode=scavenge_mass"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 1 && (tomeges_epites === 0 || premium_fiok === 0)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "main"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 1 && (tomeges_epites === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); setTimeout(function () { self.location = base_link + "overview_villages&mode=buildings"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && kepzes === 1 && (tomeges_kikepzes === 0 || premium_fiok === 0) && +game_data.village.buildings.barracks >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && kepzes === 1 && (tomeges_kikepzes === 1 || premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); setTimeout(function () { self.location = base_link + "train&mode=mass"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && jatekosfarm === 1 && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_jatekosfarm); setTimeout(function () { self.location = base_link + "place&mode=command"; }, ennyiperc_delay); }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 1 && (nyersi_elad === 1 || nyersi_vesz === 1) && +game_data.village.buildings.market >= 1) { setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=market&mode=exchange"); }, ennyiperc_delay); }
                    else { setTimeout(function () { window.location.reload(true); }, ennyiperc_delay); }
                }
                else if ((document.URL.match("screen=mail") || document.URL.match("screen=ally&mode") || document.URL.match("screen=forum") || document.URL.match("screen=ranking") || document.URL.match("screen=info_player") || document.URL.match("screen=report") || document.URL.match("screen=inventory") || document.URL.match("screen=map") || document.URL.match("screen=settings")) && emberi_mozzanatok === 1) {
                    if (farm === 1 && game_data.features.FarmAssistent.active === true) { base_link = game_data.link_base_pure.replace(id, nextid_farm); self.location = base_link + "am_farm"; }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && gyujtogetes === 1 && (tomeges_gyujti === 0 || premium_fiok === 0) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); self.location = base_link + "place&mode=scavenge"; }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && gyujtogetes === 1 && (tomeges_gyujti === 1 && premium_fiok === 1) && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_gyujti); self.location = base_link + "place&mode=scavenge_mass"; }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 1 && (tomeges_epites === 0 || premium_fiok === 0)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); self.location = base_link + "main"; }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 1 && (tomeges_epites === 1 && premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_epites); self.location = base_link + "overview_villages&mode=buildings"; }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && kepzes === 1 && (tomeges_kikepzes === 0 || premium_fiok === 0) && +game_data.village.buildings.barracks >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); self.location = base_link + "train"; }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && kepzes === 1 && (tomeges_kikepzes === 1 || premium_fiok === 1)) { base_link = game_data.link_base_pure.replace(id, nextid_kepzes); self.location = base_link + "train&mode=mass"; }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && jatekosfarm === 1 && +game_data.village.buildings.place >= 1) { base_link = game_data.link_base_pure.replace(id, nextid_jatekosfarm); self.location = base_link + "place&mode=command"; }
                    else if ((farm === 0 || (farm === 1 && game_data.features.FarmAssistent.active === false)) && (gyujtogetes === 0 || (gyujtogetes === 1 && +game_data.village.buildings.place <= 0)) && epites === 0 && (kepzes === 0 || (kepzes === 1 && +game_data.village.buildings.barracks <= 0)) && (jatekosfarm === 0 || (jatekosfarm === 1 && +game_data.village.buildings.place <= 0)) && tozsde === 1 && (nyersi_elad === 1 || nyersi_vesz === 1) && +game_data.village.buildings.market >= 1) { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, "screen=market&mode=exchange"); }
                    else { setTimeout(function () { window.location.reload(true); }, ennyiperc_delay); }
                }
            }
        }
        function visszalepesi() {
            "INSERT_LICENSE_CHECK_HERE"
            var kilepett = document.getElementsByClassName("right login").length;
            var delay_between_stuff = Math.floor((Math.random() * 8000) + 1500); // ms
            if (visszalepes === 1 && kilepett === 1) { setTimeout(belepes, delay_between_stuff); }
            else {
                try {
                    if (BotProtect.forced) {
                        if (botriado === 2) {
                            captcha_solver_sam();
                            return;
                        }
                        else if (botriado === 1) {
                            pipalos_captcha();
                            return;
                        }
                    }
                    else { lmst_hwov(); }
                }
                catch (err) { lmst_hwov(); }
            }
            function belepes() {
                if (document.URL.match("tribalwars.net") && nemzet === "en") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("die-staemme.de") && nemzet === "de") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("klanhaboru.hu") && nemzet === "hu") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("staemme.ch") && nemzet === "ch") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("tribalwars.nl") && nemzet === "nl") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("plemiona.pl") && nemzet === "pl") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("tribalwars.com.br") && nemzet === "br") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("tribalwars.com.pt") && nemzet === "pt") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("divokekmeny.cz") && nemzet === "cs") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("triburile.ro") && nemzet === "ro") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("voyna-plemyon.ru") && nemzet === "ru") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("fyletikesmaxes.gr") && nemzet === "gr") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("divoke-kmene.sk") && nemzet === "sk") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("tribals.it") && nemzet === "it") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("klanlar.org") && nemzet === "tr") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("guerretribale.fr") && nemzet === "fr") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("guerrastribales.es") && nemzet === "es") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("tribalwars.ae") && nemzet === "ae") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("tribalwars.co.uk") && nemzet === "uk") { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("tribalwars.works") && (nemzet === "zz1" || nemzet === "zz2" || nemzet === "zz3")) { window.location.href = "/page/play/" + nemzet + szerver; }
                else if (document.URL.match("tribalwars.us") && nemzet === "us") { window.location.href = "/page/play/" + nemzet + szerver; }
            }
        }
        setTimeout(visszalepesi, 2000);
        function lmst_hwov() {
            "INSERT_LICENSE_CHECK_HERE"
            vezerli();
        }
        function auto_building_finish() {
            (async () => {
                'use strict';
                //****************************** Configuration ******************************//
                var mediumDelay = 7000;
                var delayRange = 3000;
                //*************************** End Configuration ***************************//

                var intervalRange = Math.floor((Math.random() * mediumDelay) + delayRange);
                setInterval(function () { intervalRange = Math.floor((Math.random() * mediumDelay) + delayRange); }, 200);
                // Loop
                setInterval(() => {
                    var tr1 = $('[id="buildqueue"]').find('tr').eq(1);
                    var text1 = tr1.find('td').eq(1).find('span').eq(0).text().split(" ").join("").split("\n").join("");
                    var timeSplit1 = text1.split(':');

                    // Free completition
                    if (timeSplit1[0] * 60 * 60 + timeSplit1[1] * 60 + timeSplit1[2] * 1 < 3 * 60) {
                        tr1.find('td').eq(2).find('a').eq(2).click();
                    }

                    // Completed mission
                    $('[class="btn btn-confirm-yes"]').click();

                    // Daily rewards
                    var dailyreward = document.getElementsByClassName("btn btn-default").length;
                    var scavunlock = document.getElementsByClassName("btn btn-default unlock-button").length;
                    if (dailyreward > 0 && scavunlock === 0) { var b = 0; document.getElementsByClassName("btn btn-default")[b].click() }
                }, intervalRange);

            })();
        }
        function farmi() {
            "INSERT_LICENSE_CHECK_HERE"
            var delay_between_clicks = Math.floor((Math.random() * 400) + 250); // ms
            setInterval(function () { delay_between_clicks = Math.floor((Math.random() * 500) + 250); }, 100); // ms
            var current_units = {};
            var send_units = {};
            for (let i = 0; i < game_data.units.length; i++) {
                var unnit = game_data.units[i];
                if (unnit === "spear") { send_units.spear = 0; }
                if (unnit === "sword") { send_units.sword = 0; }
                if (unnit === "axe") { send_units.axe = 0; }
                if (unnit === "archer") { send_units.archer = 0; }
                if (unnit === "spy") { send_units.spy = 0; }
                if (unnit === "light") { send_units.light = 0; }
                if (unnit === "marcher") { send_units.marcher = 0; }
                if (unnit === "heavy") { send_units.heavy = 0; }
                if (unnit === "knight") { send_units.knight = 0; }
            }
            var farm_units_table = document.querySelectorAll('input[type="text"]');
            for (let i = 0; i < farm_units_table.length; i++) {
                if (send_units.spear !== undefined && farm_units_table[i].name.search("spear") > -1) {
                    if (send_units.spear < +farm_units_table[i].value) [send_units.spear = +farm_units_table[i].value]
                }
                if (send_units.sword !== undefined && farm_units_table[i].name.search("sword") > -1) {
                    if (send_units.sword < +farm_units_table[i].value) [send_units.sword = +farm_units_table[i].value]
                }
                if (send_units.axe !== undefined && farm_units_table[i].name.search("axe") > -1) {
                    if (send_units.axe < +farm_units_table[i].value) [send_units.axe = +farm_units_table[i].value]
                }
                if (send_units.archer !== undefined && farm_units_table[i].name.search("archer") > -1) {
                    if (send_units.archer < +farm_units_table[i].value) [send_units.archer = +farm_units_table[i].value]
                }
                if (send_units.spy !== undefined && farm_units_table[i].name.search("spy") > -1) {
                    if (send_units.spy < +farm_units_table[i].value) [send_units.spy = +farm_units_table[i].value]
                }
                if (send_units.light !== undefined && farm_units_table[i].name.search("light") > -1) {
                    if (send_units.light < +farm_units_table[i].value) [send_units.light = +farm_units_table[i].value]
                }
                if (send_units.marcher !== undefined && farm_units_table[i].name.search("marcher") > -1) {
                    if (send_units.marcher < +farm_units_table[i].value) [send_units.marcher = +farm_units_table[i].value]
                }
                if (send_units.heavy !== undefined && farm_units_table[i].name.search("heavy") > -1) {
                    if (send_units.heavy < +farm_units_table[i].value) [send_units.heavy = +farm_units_table[i].value]
                }
                if (send_units.knight !== undefined && farm_units_table[i].name.search("knight") > -1) {
                    if (send_units.knight < +farm_units_table[i].value) [send_units.knight = +farm_units_table[i].value]
                }
            }

            //local storage több oldalas farmhoz
            var farmpage = {};
            farmpage.page = 1;
            if (document.readyState === "complete") {
                if (BotProtect.forced) { setTimeout((function () { window.location.reload(true); }, (Math.floor((Math.random() * 50000) + 70000)))); }
                else if (item_not_exist.includes(typeof (SAM.multi_village_bot.fampage)) && !BotProtect.forced) {
                    SAM.multi_village_bot.fampage = farmpage;
                    save_localstorage();
                    if (document.readyState === "complete") {
                        setTimeout(farm_start, 800);
                    }
                }
                else {
                    setInterval(function () {
                        farmpage = SAM.multi_village_bot.fampage;
                    }, 100);
                    if (document.readyState === "complete") {
                        setTimeout(farm_start, 800);
                    }
                }
            }
            else { setTimeout(farmi, 1000); }

            var attackSenderInterval;
            var currentIndex = 1;
            var all;

            function a_b() {
                var kekzoldpirossarga = document.getElementById("plunder_list").rows[currentIndex + 1].cells[1].firstChild.currentSrc;
                if (kekzoldpirossarga.includes("green.png")) {
                    //https://dshu.innogamescdn.com/8.144/38929/graphic/max_loot/0.png
                    var ures_teli = document.getElementById("plunder_list").rows[currentIndex + 1].cells[2].firstChild.currentSrc;
                    var ures_teli_slice = ures_teli.slice(-5);
                    if (ures_teli_slice === "0.png" && a_b_ures_teli === 1) { all = document.getElementsByClassName("farm_icon_a"); }
                    else if (ures_teli_slice === "1.png" && a_b_ures_teli === 1) { all = document.getElementsByClassName("farm_icon_b"); }
                    else { all = document.getElementsByClassName("farm_icon_" + template); }
                }
            }

            function farm_start() {

                if (farm === 1) {
                    send_attacks_update2();

                    function send_attacks_update2() {
                        if (BotProtect.forced) { setTimeout(send_attacks_update2, 3000); return; }
                        if (!BotProtect.forced) {
                            GetCurrentLight();
                            var kl_most = +document.getElementById("light").innerText;
                            var tav_x = +document.getElementById("plunder_list").rows[currentIndex + 1].cells[7].innerText;
                            var nem_kemlelt_nincs_c = document.getElementById("plunder_list").rows[currentIndex + 1].cells[10].innerText;
                            var fal = document.getElementById("plunder_list").rows[currentIndex + 1].cells[6].innerText;
                            if (fal === "?") { fal = +0; }
                            else { fal = +document.getElementById("plunder_list").rows[currentIndex + 1].cells[6].innerText; }
                            var nyersik_0 = document.getElementById("plunder_list").rows[currentIndex + 1].cells[10].children[0].attributes.class.textContent.search("disabled");
                            var oldalszam = document.getElementById("plunder_list_nav").getElementsByTagName("table")[0].rows[0].cells[0].childElementCount;
                            var khlocation = window.location.href;
                            var khlocation2 = "&order=distance&dir=asc&Farm_page=";
                            var khlocation3 = khlocation.slice(0, -1);
                            var khnewlocation = khlocation + khlocation2 + farmpage.page;
                            var khnewlocation2 = khlocation3 + farmpage.page;
                            var khcurpage = +khlocation.slice(-1);
                            var nyersi, nyersi_ossz;
                            all = document.getElementsByClassName("farm_icon_" + template);
                            if (template === "c") {
                                if (template === "c" && (nyersik_0 < 0 || nyersik_0 > 0)) {
                                    nyersi = document.getElementById("plunder_list").rows[currentIndex + 1].cells[5].innerText.replaceAll(".", "").split(" ");
                                    nyersi_ossz = +nyersi[0] + +nyersi[1] + +nyersi[2];
                                }
                            }
                            if (compare_units() === false) { clearInterval(attackSenderInterval); delete SAM.multi_village_bot.fampage; save_localstorage(); tovabblepes(); return; }
                            if (tav_x > max_mezo) { clearInterval(attackSenderInterval); delete SAM.multi_village_bot.fampage; save_localstorage(); tovabblepes(); return; }
                            if (template === "c" && nyersik_0 > 0) { currentIndex++; }
                            else if (a_b_ures_teli === 1 && template !== "c" && nem_kemlelt_nincs_c === "?" && fal === 0) {
                                a_b();
                                all[currentIndex].click();
                                currentIndex++;
                            }
                            else if (a_b_ures_teli === 1 && template !== "c" && nem_kemlelt_nincs_c !== "?" && fal === 0) {
                                all[currentIndex].click();
                                currentIndex++;
                            }
                            else if (a_b_ures_teli === 0 && template !== "c" && nem_kemlelt_nincs_c !== "?" && fal === 0) {
                                all[currentIndex].click();
                                currentIndex++;
                            }
                            else if (template === "c" && nyersik_0 < 0 && +nyersi_ossz >= +minimum_nyersi && kl_most >= minimum_kl) { all = document.getElementsByClassName("farm_icon_" + template); all[currentIndex - 1].click(); currentIndex++; }
                            else if (template === "c" && nyersik_0 < 0 && (+nyersi_ossz <= +minimum_nyersi || kl_most <= minimum_kl)) { currentIndex++; }
                            else if (template !== "c" && nyersik_0 < 0) { currentIndex++; }
                            else { currentIndex++; }

                            delay_between_clicks = Math.floor((Math.random() * 400) + 250); // ms

                            if (currentIndex >= (+all.length - 0) && oldalszam == 1) { clearInterval(attackSenderInterval); delete SAM.multi_village_bot.fampage; save_localstorage(); tovabblepes(); return; }
                            else if (currentIndex >= (+all.length - 0) && (oldalszam) > farmpage.page && (window.location.href.length) < 70) { clearInterval(attackSenderInterval); SAM.multi_village_bot.farmpage.page = farmpage.page + 1; save_localstorage(); setTimeout(function () { window.location.replace(khnewlocation); }, 500); return; }
                            else if (currentIndex >= (+all.length - 0) && (oldalszam) > farmpage.page && (window.location.href.length) > 70) { clearInterval(attackSenderInterval); SAM.multi_village_bot.farmpage.page = farmpage.page + 1; save_localstorage(); setTimeout(function () { window.location.replace(khnewlocation2); }, 500); return; }
                            else if (currentIndex >= (+all.length - 0) && (oldalszam) == farmpage.page) { clearInterval(attackSenderInterval); delete SAM.multi_village_bot.fampage; save_localstorage(); tovabblepes(); return; }
                            else { setTimeout(send_attacks_update2, delay_between_clicks); }
                        }
                    }
                    function GetCurrentLight() {
                        current_units = {};
                        for (let i = 1; i < Object.keys(send_units).length; i++) {
                            var units_home_table = document.getElementById("units_home").rows[1];
                            if (send_units.spear !== undefined && units_home_table.cells[i].id.search("spear") > -1) {
                                current_units.spear = +units_home_table.cells[i].innerHTML;
                            }
                            if (send_units.sword !== undefined && units_home_table.cells[i].id.search("sword") > -1) {
                                current_units.sword = +units_home_table.cells[i].innerHTML;
                            }
                            if (send_units.axe !== undefined && units_home_table.cells[i].id.search("axe") > -1) {
                                current_units.axe = +units_home_table.cells[i].innerHTML;
                            }
                            if (send_units.archer !== undefined && units_home_table.cells[i].id.search("archer") > -1) {
                                current_units.archer = +units_home_table.cells[i].innerHTML;
                            }
                            if (send_units.spy !== undefined && units_home_table.cells[i].id.search("spy") > -1) {
                                current_units.spy = +units_home_table.cells[i].innerHTML;
                            }
                            if (send_units.light !== undefined && units_home_table.cells[i].id.search("light") > -1) {
                                current_units.light = +units_home_table.cells[i].innerHTML;
                            }
                            if (send_units.marcher !== undefined && units_home_table.cells[i].id.search("marcher") > -1) {
                                current_units.marcher = +units_home_table.cells[i].innerHTML;
                            }
                            if (send_units.heavy !== undefined && units_home_table.cells[i].id.search("heavy") > -1) {
                                current_units.heavy = +units_home_table.cells[i].innerHTML;
                            }
                            if (send_units.knight !== undefined && units_home_table.cells[i].id.search("knight") > -1) {
                                current_units.knight = +units_home_table.cells[i].innerHTML;
                            }
                        }
                    }
                    function compare_units() {
                        var compare_cansend = true;
                        for (let i = 1; i < Object.keys(send_units).length; i++) {
                            if (send_units.spear !== undefined) {
                                if (send_units.spear > 0 && current_units.spear < send_units.spear) { compare_cansend = false; }
                            }
                            if (send_units.sword !== undefined) {
                                if (send_units.sword > 0 && current_units.sword < send_units.sword) { compare_cansend = false; }
                            }
                            if (send_units.axe !== undefined) {
                                if (send_units.axe > 0 && current_units.axe < send_units.axe) { compare_cansend = false; }
                            }
                            if (send_units.archer !== undefined) {
                                if (send_units.archer > 0 && current_units.archer < send_units.archer) { compare_cansend = false; }
                            }
                            if (send_units.spy !== undefined) {
                                if (send_units.spy > 0 && current_units.spy < send_units.spy) { compare_cansend = false; }
                            }
                            if (send_units.light !== undefined) {
                                if (send_units.light > 0 && current_units.light < send_units.light) { compare_cansend = false; }
                            }
                            if (send_units.marcher !== undefined) {
                                if (send_units.marcher > 0 && current_units.marcher < send_units.marcher) { compare_cansend = false; }
                            }
                            if (send_units.heavy !== undefined) {
                                if (send_units.heavy > 0 && current_units.heavy < send_units.heavy) { compare_cansend = false; }
                            }
                            if (send_units.knight !== undefined) {
                                if (send_units.knight > 0 && current_units.knight < send_units.knight) { compare_cansend = false; }
                            }
                        }
                        return compare_cansend;
                    }
                }
                else { tovabblepes(); }
            }
        }
        function tozsdi() {
            "INSERT_LICENSE_CHECK_HERE"
            if (tozsden_vasarlas_ultragyorsan === 0) { tozsdi_sima(); }
            if (tozsden_vasarlas_ultragyorsan === 1) { tozsdi_ultra(); }
        }
        function tozsdi_sima() {
            "INSERT_LICENSE_CHECK_HERE"
            tovabblepes();
            //tozsde_auto_data();
            setTimeout(start, 800);
            var keya;
            var key_value;
            get_market_key();
            var toltikapac;
            if (szabadkapac < 10) { toltikapac = +("0.0" + szabadkapac); }
            else if (szabadkapac < 100) { toltikapac = +("0." + szabadkapac); }
            else if (szabadkapac > 100) { toltikapac = szabadkapac / 100; }
            else { toltikapac = 1; }
            var merchAvail = document.getElementById("market_merchant_available_count").innerText; // Get number of available merchants
            var rakimeret = document.getElementById("storage").innerText;
            var delay_between_clicks;
            var delay_between_reset;
            var tozsde_i = 0;
            var woodInc = 0;
            var stoneInc = 0;
            var ironInc = 0;
            var this_world = game_data.world;
            var this_player = game_data.player.name;
            var adas_interval;
            setInterval(function () { delay_between_clicks = Math.floor((Math.random() * 1000) + 2000); }, 100); // ms
            setInterval(function () { delay_between_reset = Math.floor((Math.random() * 8000) + 8000); }, 100); // ms
            setInterval(function () { adas_interval = Math.floor((Math.random() * 1500) + 2000); }, 100); // ms

            var tozsde_history = JSON.parse(localStorage.getItem("exchange_auto_data"));
            var elso = Object.keys(tozsde_history).slice(-(tozsdemozgas_szamlalo))[0];
            var utolso = Object.keys(tozsde_history).length;
            var lista = {};
            var r = 0;
            if (utolso > 200) {
                for (elso; elso < utolso; elso++) {
                    lista[r] = tozsde_history[elso];
                    r++;
                }
            }

            var auto_wood_max = Math.max.apply(null, Object.keys(lista).map(function (x) { return lista[x].wood }));
            var auto_stone_max = Math.max.apply(null, Object.keys(lista).map(function (x) { return lista[x].stone }));
            var auto_iron_max = Math.max.apply(null, Object.keys(lista).map(function (x) { return lista[x].iron }));
            var auto_wood_min = Math.min.apply(null, Object.keys(lista).map(function (x) { return lista[x].wood }));
            var auto_stone_min = Math.min.apply(null, Object.keys(lista).map(function (x) { return lista[x].stone }));
            var auto_iron_min = Math.min.apply(null, Object.keys(lista).map(function (x) { return lista[x].iron }));

            var wood = resInfo("wood");
            var stone = resInfo("stone");
            var iron = resInfo("iron");
            var allRes = [wood, stone, iron];

            var profit_fa = ((auto_wood_max * 0.9) / 1.05) / ((auto_wood_min * 1.1) * 1.05);
            var profit_agyag = ((auto_stone_max * 0.9) / 1.05) / ((auto_stone_min * 1.1) * 1.05);
            var profit_vas = ((auto_iron_max * 0.9) / 1.05) / ((auto_iron_min * 1.1) * 1.05);
            var current_profit_fa_sell = ((auto_wood_max * 0.9) / 1.05) / ((wood.price) * 1.05);
            var current_profit_agyag_sell = ((auto_stone_max * 0.9) / 1.05) / ((stone.price) * 1.05);
            var current_profit_vas_sell = ((auto_iron_max * 0.9) / 1.05) / ((iron.price) * 1.05);
            var current_profit_sell = [current_profit_fa_sell, current_profit_agyag_sell, current_profit_vas_sell];
            var current_profit_fa_buy = ((wood.price * 0.9) / 1.05) / ((auto_wood_min) * 1.05);
            var current_profit_agyag_buy = ((stone.price * 0.9) / 1.05) / ((auto_stone_min) * 1.05);
            var current_profit_vas_buy = ((iron.price * 0.9) / 1.05) / ((auto_iron_min) * 1.05);
            var current_profit_buy = [current_profit_fa_buy, current_profit_agyag_buy, current_profit_vas_buy];
            var auto_profit_fa_sell = Math.max(profit_fa / 1.1, current_profit_fa_sell);
            var auto_profit_agyag_sell = Math.max(profit_agyag / 1.1, current_profit_agyag_sell);
            var auto_profit_vas_sell = Math.max(profit_vas / 1.1, current_profit_vas_sell);
            var auto_profit_sell = [auto_profit_fa_sell, auto_profit_agyag_sell, auto_profit_vas_sell];
            var auto_profit_fa_buy = Math.max(profit_fa / 1.1, current_profit_fa_buy);
            var auto_profit_agyag_buy = Math.max(profit_agyag / 1.1, current_profit_agyag_buy);
            var auto_profit_vas_buy = Math.max(profit_vas / 1.1, current_profit_vas_buy);
            var auto_profit_buy = [auto_profit_fa_buy, auto_profit_agyag_buy, auto_profit_vas_buy];

            function ress_info() {
                wood = resInfo("wood");
                stone = resInfo("stone");
                iron = resInfo("iron");
                allRes = [wood, stone, iron];
                profit_fa = ((auto_wood_max * 0.9) / 1.05) / ((auto_wood_min * 1.1) * 1.05);
                profit_agyag = ((auto_stone_max * 0.9) / 1.05) / ((auto_stone_min * 1.1) * 1.05);
                profit_vas = ((auto_iron_max * 0.9) / 1.05) / ((auto_iron_min * 1.1) * 1.05);
                current_profit_fa_sell = ((auto_wood_max * 0.9) / 1.05) / ((wood.price) * 1.05);
                current_profit_agyag_sell = ((auto_stone_max * 0.9) / 1.05) / ((stone.price) * 1.05);
                current_profit_vas_sell = ((auto_iron_max * 0.9) / 1.05) / ((iron.price) * 1.05);
                current_profit_sell = [current_profit_fa_sell, current_profit_agyag_sell, current_profit_vas_sell];
                current_profit_fa_buy = ((wood.price * 0.9) / 1.05) / ((auto_wood_min) * 1.05);
                current_profit_agyag_buy = ((stone.price * 0.9) / 1.05) / ((auto_stone_min) * 1.05);
                current_profit_vas_buy = ((iron.price * 0.9) / 1.05) / ((auto_iron_min) * 1.05);
                current_profit_buy = [current_profit_fa_buy, current_profit_agyag_buy, current_profit_vas_buy];
                auto_profit_fa_sell = Math.max(profit_fa / 1.1, current_profit_fa_sell);
                auto_profit_agyag_sell = Math.max(profit_agyag / 1.1, current_profit_agyag_sell);
                auto_profit_vas_sell = Math.max(profit_vas / 1.1, current_profit_vas_sell);
                auto_profit_sell = [auto_profit_fa_sell, auto_profit_agyag_sell, auto_profit_vas_sell];
                auto_profit_fa_buy = Math.max(profit_fa / 1.1, current_profit_fa_buy);
                auto_profit_agyag_buy = Math.max(profit_agyag / 1.1, current_profit_agyag_buy);
                auto_profit_vas_buy = Math.max(profit_vas / 1.1, current_profit_vas_buy);
                auto_profit_buy = [auto_profit_fa_buy, auto_profit_agyag_buy, auto_profit_vas_buy];
                merchAvail = document.getElementById("market_merchant_available_count").textContent;
            }
            setInterval(ress_info, 428);

            function start() {
                merchAvail = document.getElementById("market_merchant_available_count").innerText;
                var delay_between_sleep = Math.round((Math.random() * 6) + 6);

                if (merchAvail > 0 && tozsde_i > delay_between_sleep) {
                    tozsde_i = 0;
                    var delay_between_sleep_time = Math.floor((Math.random() * 5000) + 20000);
                    setTimeout(start, delay_between_sleep_time);
                }
                else if (auto_tozsde === 1 && kenyszerített_profit === 1 && nyersi_elad === 1 && merchAvail > 0 && tozsdemozgas_szamlalo < utolso && tozsde_i <= delay_between_sleep && ((legkisebb_profit <= current_profit_fa_sell && wood.price < wood.inVillage) || (legkisebb_profit <= current_profit_agyag_sell && stone.price < stone.inVillage) || (legkisebb_profit <= current_profit_vas_sell && iron.price < iron.inVillage))) {
                    auto_tozsde_sell();
                    tozsde_i++;
                }
                else if (auto_tozsde === 1 && kenyszerített_profit === 0 && nyersi_elad === 1 && merchAvail > 0 && tozsdemozgas_szamlalo < utolso && tozsde_i <= delay_between_sleep && ((auto_profit_fa_sell <= current_profit_fa_sell && wood.price < wood.inVillage) || (auto_profit_agyag_sell <= current_profit_agyag_sell && stone.price < stone.inVillage) || (auto_profit_vas_sell <= current_profit_vas_sell && iron.price < iron.inVillage))) {
                    auto_tozsde_sell();
                    tozsde_i++;
                }
                else if (auto_tozsde === 1 && nyersi_elad === 1 && merchAvail > 0 && tozsdemozgas_szamlalo > utolso && tozsde_i <= delay_between_sleep && ((wood.price <= nyersi_elad_arfolyam && wood.price < wood.inVillage) || (stone.price <= nyersi_elad_arfolyam && stone.price < stone.inVillage) || (iron.price <= nyersi_elad_arfolyam && iron.price < iron.inVillage))) {
                    sellResource();
                    tozsde_i++;
                }
                else if (auto_tozsde === 1 && kenyszerített_profit === 1 && nyersi_vesz === 1 && tozsdemozgas_szamlalo < utolso && tozsde_i <= delay_between_sleep && (current_profit_fa_buy >= legkisebb_profit || current_profit_agyag_buy >= legkisebb_profit || current_profit_vas_buy >= legkisebb_profit)) {
                    auto_tozsde_buy();
                    tozsde_i++;
                }
                else if (auto_tozsde === 1 && kenyszerített_profit === 0 && nyersi_vesz === 1 && tozsdemozgas_szamlalo < utolso && tozsde_i <= delay_between_sleep && (current_profit_fa_buy >= auto_profit_fa_buy || current_profit_agyag_buy >= auto_profit_agyag_buy || current_profit_vas_buy >= auto_profit_vas_buy)) {
                    auto_tozsde_buy();
                    tozsde_i++;
                }
                else if (auto_tozsde === 1 && nyersi_vesz === 1 && tozsdemozgas_szamlalo > utolso && tozsde_i <= delay_between_sleep && (wood.price >= nyersi_vesz_arfolyam || stone.price >= nyersi_vesz_arfolyam || iron.price >= nyersi_vesz_arfolyam)) {
                    buyResource();
                    tozsde_i++;
                }
                else if (auto_tozsde === 0 && nyersi_elad === 1 && merchAvail > 0 && tozsde_i <= delay_between_sleep && ((wood.price <= nyersi_elad_arfolyam && wood.price < wood.inVillage) || (stone.price <= nyersi_elad_arfolyam && stone.price < stone.inVillage) || (iron.price <= nyersi_elad_arfolyam && iron.price < iron.inVillage))) {
                    sellResource();
                    tozsde_i++;
                }
                else if (auto_tozsde === 0 && nyersi_vesz === 1 && tozsde_i <= delay_between_sleep && (wood.price >= nyersi_vesz_arfolyam || stone.price >= nyersi_vesz_arfolyam || iron.price >= nyersi_vesz_arfolyam)) {
                    buyResource();
                    tozsde_i++;
                }
                else {
                    delay_between_reset = Math.floor((Math.random() * 1) + 1);
                    setTimeout(start, delay_between_reset);
                }
            }
            function isInteger(x) {
                "use strict";
                return (typeof x === 'number') && (x % 1 === 0);
            }
            function setZeroIfNaN(x) {
                "use strict";
                if ((typeof x === 'number') && (x % 1 === 0)) {
                    return x;
                } else {
                    return 0;
                };
            }
            function __(selector) {
                return document.querySelector(selector);
            }
            function resInfo(res) {
                var number;
                switch (res) {
                    case "wood":
                        number = 0;
                        break;
                    case "stone":
                        number = 1;
                        break;
                    case "iron":
                        number = 2;
                        break;
                }
                var info = {
                    num: number,
                    name: res,
                    price: parseInt(document.getElementById("premium_exchange_rate_" + res).children[0].innerText),
                    max: parseInt(document.getElementById("premium_exchange_capacity_" + res).innerHTML),
                    stock: parseInt(document.getElementById("premium_exchange_stock_" + res).innerHTML),
                    inVillage: parseInt(document.getElementById(res).innerText),
                    init: function () {
                        this.cap = this.inVillage - rakiban_marad;
                        return this;
                    }
                }.init();
                return info;
            }
            function res_inc() {
                var incoming;
                if (document.URL.match("klanhaboru.hu")) { incoming = "Beérkező"; }
                else if (document.URL.match("tribalwars.net")) { incoming = "Incoming"; }
                else if (document.URL.match("die-staemme.de")) { incoming = "Eintreffend"; }
                else if (document.URL.match("staemme.ch")) { incoming = "Ihträffänd"; }
                else if (document.URL.match("tribalwars.nl")) { incoming = "Aankomend"; }
                else if (document.URL.match("plemiona.pl")) { incoming = "Przybywające"; }
                else if (document.URL.match("tribalwars.com.br")) { incoming = "Entrada"; }
                else if (document.URL.match("tribalwars.com.pt")) { incoming = "A chegar"; }
                else if (document.URL.match("divokekmeny.cz")) { incoming = "Přicházející"; }
                else if (document.URL.match("triburile.ro")) { incoming = "Sosire"; }
                else if (document.URL.match("voyna-plemyon.ru")) { incoming = "Прибывающие"; }
                else if (document.URL.match("fyletikesmaxes.gr")) { incoming = "Εισερχόμενοι"; }
                else if (document.URL.match("divoke-kmene.sk")) { incoming = "Prichádzajúce"; }
                else if (document.URL.match("tribals.it")) { incoming = "In arrivo"; }
                else if (document.URL.match("klanlar.org")) { incoming = "Gelen"; }
                else if (document.URL.match("guerretribale.fr")) { incoming = "Arrivant"; }
                else if (document.URL.match("guerrastribales.es")) { incoming = "Entrante"; }
                else if (document.URL.match("tribalwars.ae")) { incoming = "القادمة"; }
                else if (document.URL.match("tribalwars.co.uk")) { incoming = "Incoming"; }
                else if (document.URL.match("tribalwars.works")) { incoming = "Incoming"; }
                else if (document.URL.match("tribalwars.us")) { incoming = "Incoming"; }
                var parentInc;

                try {
                    if (__("#market_status_bar > table:nth-child(2) > tbody > tr > th:nth-child(1)").innerHTML.split(" ")[0].replace(":", "") === incoming) {
                        parentInc = __("#market_status_bar > table:nth-child(2) > tbody > tr > th:nth-child(1)");
                    }
                } catch (e) { }
                try {
                    if (__("#market_status_bar > table:nth-child(2) > tbody > tr > th:nth-child(2)").innerHTML.split(" ")[0].replace(":", "") === incoming) {
                        parentInc = __("#market_status_bar > table:nth-child(2) > tbody > tr > th:nth-child(2)");
                    }
                } catch (e) { }

                try {
                    woodInc = setZeroIfNaN(parseInt(parentInc.querySelector(".wood").parentElement.innerText.replace(".", "")));
                } catch (e) { }
                try {
                    stoneInc = setZeroIfNaN(parseInt(parentInc.querySelector(".stone").parentElement.innerText.replace(".", "")));
                } catch (e) { }
                try {
                    ironInc = setZeroIfNaN(parseInt(parentInc.querySelector(".iron").parentElement.innerText.replace(".", "")));
                } catch (e) { }
            }
            function sellResource() {
                "use strict";
                merchAvail = document.getElementById("market_merchant_available_count").textContent;
                var sellThis;
                var wood = resInfo("wood");
                var stone = resInfo("stone");
                var iron = resInfo("iron");
                var allRes = [wood, stone, iron];
                function ress_info() {
                    wood = resInfo("wood");
                    stone = resInfo("stone");
                    iron = resInfo("iron");
                    allRes = [wood, stone, iron];
                }
                setInterval(ress_info, 200);
                var i = 1;
                var resbeir;
                var interval = setInterval(function () {
                    if (i === 1) { resbeir = "wood"; }
                    if (i === 2) { resbeir = "stone"; }
                    if (i === 3) { resbeir = "iron"; }
                    merchAvail = document.getElementById("market_merchant_available_count").innerText;
                    if (allRes[i - 1].stock < allRes[i - 1].max && allRes[i - 1].inVillage > rakiban_marad && allRes[i - 1].price <= nyersi_elad_arfolyam) {

                        var w = i - 1;
                        sellThis = Math.round(Math.min(((allRes[i - 1].max - allRes[i - 1].stock) / 1.025), ((allRes[i - 1].inVillage - rakiban_marad - allRes[i - 1].price) / 1.025)));
                        if (Math.ceil(((sellThis + allRes[i - 1].price) * 1.025) / 1000) > merchAvail) {
                            sellThis = Math.round((merchAvail * 1000 - allRes[i - 1].price) / 1.025);
                        }
                        if (sellThis < minimum_amit_elad) {
                            sellThis = 0;
                        }
                        else if (sellThis > minimum_amit_elad) {
                            sell(resbeir, sellThis);
                            clearInterval(interval);
                            setTimeout(start, (delay_between_clicks + Math.floor((Math.random() * 4000) + 7550)));
                            return;
                        }
                    }
                    i++;
                    if (i >= 4) {
                        clearInterval(interval);
                        i = 1;
                        delay_between_reset = Math.floor((Math.random() * 30) + 1);
                        setTimeout(start, delay_between_reset);
                    }
                }, (Math.floor((Math.random() * 100) + 10)))

            }
            function buyResource() {
                "use strict";
                merchAvail = document.getElementById("market_merchant_available_count").textContent;
                var buyThis;
                res_inc();
                var wood = resInfo("wood");
                var stone = resInfo("stone");
                var iron = resInfo("iron");
                var allRes = [wood, stone, iron];
                function ress_info() {
                    wood = resInfo("wood");
                    stone = resInfo("stone");
                    iron = resInfo("iron");
                    allRes = [wood, stone, iron];
                }
                setInterval(ress_info, 200);
                var i = 1;
                var resbeir;
                var interval = setInterval(function () {
                    if (i === 1) { resbeir = "wood"; }
                    if (i === 2) { resbeir = "stone"; }
                    if (i === 3) { resbeir = "iron"; }
                    var w = i - 1;
                    res_inc();
                    var this_inc = [woodInc, stoneInc, ironInc];
                    if (allRes[w].stock <= allRes[w].max && (allRes[w].inVillage + this_inc[w]) < (rakimeret * toltikapac) && allRes[w].price >= nyersi_vesz_arfolyam && allRes[w].stock >= nyersi_vesz_arfolyam) {

                        buyThis = Math.round(Math.min((allRes[w].price * nyersi_vesz_max_pp - allRes[w].price), (rakimeret * toltikapac - allRes[w].inVillage - this_inc[w])));
                        if (allRes[w].stock < buyThis && allRes[w].price >= nyersi_vesz_arfolyam && allRes[w].stock >= nyersi_vesz_arfolyam && allRes[w].stock > allRes[w].price) { buyThis = allRes[w].stock - allRes[w].price; }
                        else if (allRes[w].stock < buyThis && allRes[w].price >= nyersi_vesz_arfolyam && allRes[w].stock >= nyersi_vesz_arfolyam && allRes[w].stock <= allRes[w].price) { buyThis = nyersi_vesz_arfolyam - 1; }

                        if (buyThis < 0) {
                            buyThis = 0;
                        }
                        if (buyThis != 0) {
                            buy(resbeir, buyThis);
                            clearInterval(interval);
                            setTimeout(start, (delay_between_clicks + Math.floor((Math.random() * 4000) + 7550)));
                            return;
                        }
                    }
                    i++;
                    if (i >= 4) {
                        clearInterval(interval);
                        i = 1;
                        delay_between_reset = Math.floor((Math.random() * 30) + 1);
                        setTimeout(start, delay_between_reset);
                    }
                }, (Math.floor((Math.random() * 100) + 10)))

            }
            function tozsde_auto_data() {
                var this_world = game_data.world;
                var this_player = game_data.player.name;
                var tozsde_auto_data = {};
                var old_wood = 0;
                var old_stone = 0;
                var old_iron = 0;
                var wood = resInfo("wood");
                var stone = resInfo("stone");
                var iron = resInfo("iron");
                var info_i;
                var get_local_this_world;
                var create_local_this_world;
                var local_info_i_this_world = "info_i" + this_player + this_world;
                var tozsde_auto_data_this_world = "tozsde_auto_data" + this_player + this_world;
                if (localStorage.getItem(local_info_i_this_world) === null || localStorage.getItem(local_info_i_this_world) === "NaN") { info_i = 0; localStorage.setItem(local_info_i_this_world, info_i); }
                else { info_i = localStorage.getItem(local_info_i_this_world); }
                var old_data = { wood: old_wood, stone: old_stone, iron: old_iron };
                function info() {
                    wood = resInfo("wood");
                    stone = resInfo("stone");
                    iron = resInfo("iron");
                    var new_data = { wood: wood.price, stone: stone.price, iron: iron.price };

                    var serverdate = document.getElementById("serverDate").innerHTML;
                    var servertime = document.getElementById("serverTime").innerHTML;
                    var timedate = serverdate + " " + servertime;
                    if ((Object.entries(old_data).toString()) !== (Object.entries(new_data).toString())) {
                        if (localStorage.getItem(tozsde_auto_data_this_world) === null || localStorage.getItem(tozsde_auto_data_this_world) === "NaN") {
                            tozsde_auto_data[info_i] = { time: timedate, wood: wood.price, stone: stone.price, iron: iron.price };
                            localStorage.setItem(tozsde_auto_data_this_world, JSON.stringify(tozsde_auto_data));
                        }
                        else {
                            get_local_this_world = localStorage.getItem(tozsde_auto_data_this_world);
                            create_local_this_world = JSON.parse(get_local_this_world);
                            old_data = new_data;
                            var new_local_this_world = Object.assign(create_local_this_world, { [info_i]: { time: timedate, wood: old_data.wood, stone: old_data.stone, iron: old_data.iron } });
                            localStorage.setItem(tozsde_auto_data_this_world, JSON.stringify(new_local_this_world));
                            info_i++;
                            localStorage.setItem(local_info_i_this_world, info_i);
                        }
                    }
                }
                info();
                setInterval(info, 5000);
            }
            function auto_tozsde_buy() {
                var buyThis;
                res_inc();
                var j = 1;
                var resbeir;
                var interval = setInterval(function () {
                    if (j === 1) { resbeir = "wood"; }
                    if (j === 2) { resbeir = "stone"; }
                    if (j === 3) { resbeir = "iron"; }
                    var w = j - 1;
                    res_inc();
                    var this_inc = [woodInc, stoneInc, ironInc];
                    if (allRes[w].stock < allRes[w].max && (allRes[w].inVillage + this_inc[w]) < (rakimeret * toltikapac) && (current_profit_buy[w] >= auto_profit_buy[w] || current_profit_buy[w] >= legkisebb_profit)) {

                        buyThis = Math.round(Math.min((allRes[w].price * nyersi_vesz_max_pp - allRes[w].price), (rakimeret * toltikapac - allRes[w].inVillage - this_inc[w])));

                        if (buyThis < 0) {
                            buyThis = 0;
                        }
                        if (buyThis != 0) {
                            buy(resbeir, buyThis);
                            clearInterval(interval);
                            setTimeout(start, (delay_between_clicks + Math.floor((Math.random() * 4000) + 7550)));
                            return;
                        }
                    }
                    j++;
                    if (j >= 4) {
                        clearInterval(interval);
                        j = 1;
                        delay_between_reset = Math.floor((Math.random() * 30) + 1);
                        setTimeout(start, delay_between_reset);
                    }
                }, (Math.floor((Math.random() * 100) + 10)))
            }
            function auto_tozsde_sell() {
                var sellThis;
                var k = 1;
                var resbeir;
                var interval = setInterval(function () {
                    if (k === 1) { resbeir = "wood"; }
                    if (k === 2) { resbeir = "stone"; }
                    if (k === 3) { resbeir = "iron"; }
                    merchAvail = document.getElementById("market_merchant_available_count").innerText;

                    if (allRes[k - 1].stock < allRes[k - 1].max && allRes[k - 1].inVillage > rakiban_marad && (auto_profit_sell[k - 1] <= current_profit_sell[k - 1] || legkisebb_profit <= current_profit_sell[k - 1])) {

                        var w = k - 1;
                        sellThis = Math.round(Math.min(((allRes[k - 1].max - allRes[k - 1].stock) / 1.025), ((allRes[k - 1].inVillage - rakiban_marad - allRes[k - 1].price) / 1.025)));
                        if (Math.ceil(((sellThis + allRes[k - 1].price) * 1.025) / 1000) > merchAvail) {
                            sellThis = Math.round((merchAvail * 1000 - allRes[k - 1].price) / 1.025);
                        }
                        if (sellThis < minimum_amit_elad) {
                            sellThis = 0;
                        }
                        else if (sellThis > minimum_amit_elad) {
                            sell(resbeir, sellThis);
                            clearInterval(interval);
                            setTimeout(start, (delay_between_clicks + Math.floor((Math.random() * 4000) + 7550)));
                            return;
                        }
                    }
                    k++;
                    if (k >= 4) {
                        clearInterval(interval);
                        k = 1;
                        delay_between_reset = Math.floor((Math.random() * 30) + 1);
                        setTimeout(start, delay_between_reset);
                    }
                }, (Math.floor((Math.random() * 100) + 10)))
            }
            function buy(res, amnt) {
                var response = PremiumExchange.showConfirmationDialog.toString();
                var splitted = response.split("TribalWars._ah={")[1];
                var splitted_split = splitted.split(":");
                var keya = splitted_split[0].toString();
                var key_value;
                var trust_value = splitted_split[1].split("}")[0];
                if (trust_value === "!r") { key_value = false; }
                else if (trust_value === "r") { key_value = true; }
                var isBuying = true;
                let data = {};
                data["buy_" + res] = amnt;
                data.h = game_data.csrf;
                TribalWars.post("market", { ajaxaction: "exchange_begin" }, data, function (r) {
                    if (r[0].error) {
                        isBuying = false;
                        return;
                    }
                    let rate_hash = r[0].rate_hash;
                    let buy_amnt = r[0].amount;
                    data["rate_" + res] = rate_hash;
                    data["buy_" + res] = buy_amnt;
                    data["mb"] = 1;
                    data.h = game_data.csrf;
                    TribalWars._ah = { [keya]: key_value };
                    TribalWars.post("market", { ajaxaction: "exchange_confirm" }, data, function (r) {
                        isBuying = false;
                        if (r.success) {
                            UI.SuccessMessage("Bought " + buy_amnt + " " + res + "!");
                            $("#market_status_bar").replaceWith(r.data.status_bar);
                        }
                    })
                })
            }
            function sell(res, amnt) {
                var response = PremiumExchange.showConfirmationDialog.toString();
                var splitted = response.split("TribalWars._ah={")[1];
                var splitted_split = splitted.split(":");
                var keya = splitted_split[0].toString();
                var key_value;
                var trust_value = splitted_split[1].split("}")[0];
                if (trust_value === "!r") { key_value = false; }
                else if (trust_value === "r") { key_value = true; }
                var isBuying = true;
                let data = {};
                data["sell_" + res] = amnt;
                data.h = game_data.csrf;
                TribalWars.post("market", { ajaxaction: "exchange_begin" }, data, function (r) {
                    if (r[0].error) {
                        isBuying = false;
                        return;
                    }
                    let rate_hash = r[0].rate_hash;
                    let buy_amnt = -r[0].amount;
                    data["rate_" + res] = rate_hash;
                    data["sell_" + res] = buy_amnt;
                    data["mb"] = 1;
                    data.h = game_data.csrf;
                    TribalWars._ah = { [keya]: key_value };
                    TribalWars.post("market", { ajaxaction: "exchange_confirm" }, data, function (r) {
                        isBuying = false;
                        if (r.success) {
                            UI.SuccessMessage("Sold " + buy_amnt + " " + res + "!");
                            $("#market_status_bar").replaceWith(r.data.status_bar);
                        }
                    })
                })
            }
            function get_market_key() {
                var response = PremiumExchange.showConfirmationDialog.toString();
                var splitted = response.split("TribalWars._ah={")[1];
                var splitted_split = splitted.split(":");
                keya = splitted_split[0].toString();
                var trust_value = splitted_split[1].split("}")[0];
                if (trust_value === "!r") { key_value = false; }
                else if (trust_value === "r") { key_value = true; }
            }
        }
        function tozsdi_ultra() {
            "INSERT_LICENSE_CHECK_HERE"
            tovabblepes();
            setTimeout(start, 800);
            var toltikapac;
            if (szabadkapac < 10) { toltikapac = +("0.0" + szabadkapac); }
            else if (szabadkapac < 100) { toltikapac = +("0." + szabadkapac); }
            else if (szabadkapac > 100) { toltikapac = szabadkapac / 100; }
            else { toltikapac = 1; }
            var merchAvail = document.getElementById("market_merchant_available_count").innerText; // Get number of available merchants
            var rakimeret = document.getElementById("storage").innerText;
            var delay_between_clicks;
            var delay_between_reset;
            var tozsde_i = 0;
            var woodInc = 0;
            var stoneInc = 0;
            var ironInc = 0;
            var adas_interval;
            setInterval(function () { delay_between_clicks = Math.floor((Math.random() * 50) + 10); }, 100); // ms
            setInterval(function () { delay_between_reset = Math.floor((Math.random() * 8000) + 8000); }, 100); // ms
            setInterval(function () { adas_interval = Math.floor((Math.random() * 1500) + 2000); }, 100); // ms

            var wood = resInfo("wood");
            var stone = resInfo("stone");
            var iron = resInfo("iron");
            var allRes = [wood, stone, iron];

            function ress_info() {
                wood = resInfo("wood");
                stone = resInfo("stone");
                iron = resInfo("iron");
                allRes = [wood, stone, iron];
                merchAvail = document.getElementById("market_merchant_available_count").textContent;
            }
            setInterval(ress_info, 1);
            function start() {
                merchAvail = document.getElementById("market_merchant_available_count").innerText;
                var delay_between_sleep = Math.round((Math.random() * 6) + 1000);

                if ((wood.price >= nyersi_vesz_arfolyam || stone.price >= nyersi_vesz_arfolyam || iron.price >= nyersi_vesz_arfolyam)) {

                    buyResource();
                }
                else {
                    delay_between_reset = Math.floor((Math.random() * 1) + 1);
                    setTimeout(start, delay_between_reset);
                }
            }
            function isInteger(x) {
                "use strict";
                return (typeof x === 'number') && (x % 1 === 0);
            }
            function setZeroIfNaN(x) {
                "use strict";
                if ((typeof x === 'number') && (x % 1 === 0)) {
                    return x;
                } else {
                    return 0;
                };
            }
            function __(selector) {
                return document.querySelector(selector);
            }
            function resInfo(res) {
                var number;
                switch (res) {
                    case "wood":
                        number = 0;
                        break;
                    case "stone":
                        number = 1;
                        break;
                    case "iron":
                        number = 2;
                        break;
                }
                var info = {
                    num: number,
                    name: res,
                    price: parseInt(document.getElementById("premium_exchange_rate_" + res).children[0].innerText),
                    max: parseInt(document.getElementById("premium_exchange_capacity_" + res).innerHTML),
                    stock: parseInt(document.getElementById("premium_exchange_stock_" + res).innerHTML),
                    inVillage: parseInt(document.getElementById(res).innerText),
                    init: function () {
                        this.cap = this.inVillage - rakiban_marad;
                        return this;
                    }
                }.init();
                return info;
            }
            function res_inc() {
                var incoming;
                if (document.URL.match("klanhaboru.hu")) { incoming = "Beérkező"; }
                else if (document.URL.match("tribalwars.net")) { incoming = "Incoming"; }
                else if (document.URL.match("die-staemme.de")) { incoming = "Eintreffend"; }
                else if (document.URL.match("staemme.ch")) { incoming = "Ihträffänd"; }
                else if (document.URL.match("tribalwars.nl")) { incoming = "Aankomend"; }
                else if (document.URL.match("plemiona.pl")) { incoming = "Przybywające"; }
                else if (document.URL.match("tribalwars.com.br")) { incoming = "Entrada"; }
                else if (document.URL.match("tribalwars.com.pt")) { incoming = "A chegar"; }
                else if (document.URL.match("divokekmeny.cz")) { incoming = "Přicházející"; }
                else if (document.URL.match("triburile.ro")) { incoming = "Sosire"; }
                else if (document.URL.match("voyna-plemyon.ru")) { incoming = "Прибывающие"; }
                else if (document.URL.match("fyletikesmaxes.gr")) { incoming = "Εισερχόμενοι"; }
                else if (document.URL.match("divoke-kmene.sk")) { incoming = "Prichádzajúce"; }
                else if (document.URL.match("tribals.it")) { incoming = "In arrivo"; }
                else if (document.URL.match("klanlar.org")) { incoming = "Gelen"; }
                else if (document.URL.match("guerretribale.fr")) { incoming = "Arrivant"; }
                else if (document.URL.match("guerrastribales.es")) { incoming = "Entrante"; }
                else if (document.URL.match("tribalwars.ae")) { incoming = "القادمة"; }
                else if (document.URL.match("tribalwars.co.uk")) { incoming = "Incoming"; }
                else if (document.URL.match("tribalwars.works")) { incoming = "Incoming"; }
                else if (document.URL.match("tribalwars.us")) { incoming = "Incoming"; }
                var parentInc;

                try {
                    if (__("#market_status_bar > table:nth-child(2) > tbody > tr > th:nth-child(1)").innerHTML.split(" ")[0].replace(":", "") === incoming) {
                        parentInc = __("#market_status_bar > table:nth-child(2) > tbody > tr > th:nth-child(1)");
                    }
                } catch (e) { }
                try {
                    if (__("#market_status_bar > table:nth-child(2) > tbody > tr > th:nth-child(2)").innerHTML.split(" ")[0].replace(":", "") === incoming) {
                        parentInc = __("#market_status_bar > table:nth-child(2) > tbody > tr > th:nth-child(2)");
                    }
                } catch (e) { }

                try {
                    woodInc = setZeroIfNaN(parseInt(parentInc.querySelector(".wood").parentElement.innerText.replace(".", "")));
                } catch (e) { }
                try {
                    stoneInc = setZeroIfNaN(parseInt(parentInc.querySelector(".stone").parentElement.innerText.replace(".", "")));
                } catch (e) { }
                try {
                    ironInc = setZeroIfNaN(parseInt(parentInc.querySelector(".iron").parentElement.innerText.replace(".", "")));
                } catch (e) { }
            }
            function buyResource() {
                "use strict";
                merchAvail = document.getElementById("market_merchant_available_count").textContent;
                var buyThis;
                res_inc();
                var wood = resInfo("wood");
                var stone = resInfo("stone");
                var iron = resInfo("iron");
                var allRes = [wood, stone, iron];
                function ress_info() {
                    wood = resInfo("wood");
                    stone = resInfo("stone");
                    iron = resInfo("iron");
                    allRes = [wood, stone, iron];
                }
                setInterval(ress_info, 1);
                var i = 1;
                var resbeir;
                var interval = setInterval(function () {
                    if (i === 1) { resbeir = "wood"; }
                    if (i === 2) { resbeir = "stone"; }
                    if (i === 3) { resbeir = "iron"; }
                    var w = i - 1;
                    //res_inc();
                    //var this_inc = [woodInc, stoneInc, ironInc];
                    if (allRes[w].stock <= allRes[w].max && allRes[w].price >= nyersi_vesz_arfolyam && allRes[w].stock >= nyersi_vesz_arfolyam) {

                        buyThis = Math.round(Math.min((allRes[w].price * nyersi_vesz_max_pp - allRes[w].price)));
                        if (allRes[w].stock < buyThis && allRes[w].price >= nyersi_vesz_arfolyam && allRes[w].stock >= nyersi_vesz_arfolyam) { buyThis = allRes[w].stock - 5 }
                        else if (allRes[w].stock < buyThis && allRes[w].price >= nyersi_vesz_arfolyam && allRes[w].stock >= nyersi_vesz_arfolyam && allRes[w].stock <= allRes[w].price) { buyThis = nyersi_vesz_arfolyam - 5; }

                        if (buyThis < 0) {
                            buyThis = 0;
                        }
                        if (buyThis != 0) {
                            buy(resbeir, buyThis);
                            vesz_hang.play();
                            clearInterval(interval);
                            setTimeout(start, (delay_between_clicks + Math.floor((Math.random() * 4000) + 7550)));
                            return;
                        }
                    }
                    i++;
                    if (i >= 4) {
                        clearInterval(interval);
                        i = 1;
                        delay_between_reset = Math.floor((Math.random() * 30) + 1);
                        setTimeout(start, delay_between_reset);
                    }
                }, (Math.floor((Math.random() * 100) + 10)))

            }
            function buy(res, amnt) {
                var response = PremiumExchange.showConfirmationDialog.toString();
                var splitted = response.split("TribalWars._ah={")[1];
                var splitted_split = splitted.split(":");
                var keya = splitted_split[0].toString();
                var key_value;
                var trust_value = splitted_split[1].split("}")[0];
                if (trust_value === "!r") { key_value = false; }
                else if (trust_value === "r") { key_value = true; }
                var isBuying = true;
                let data = {};
                data["buy_" + res] = amnt;
                data.h = game_data.csrf;
                TribalWars.post("market", { ajaxaction: "exchange_begin" }, data, function (r) {
                    if (r[0].error) {
                        isBuying = false;
                        return;
                    }
                    let rate_hash = r[0].rate_hash;
                    let buy_amnt = r[0].amount;
                    data["rate_" + res] = rate_hash;
                    data["buy_" + res] = buy_amnt;
                    data["mb"] = 1;
                    data.h = game_data.csrf;
                    TribalWars._ah = { [keya]: key_value };
                    TribalWars.post("market", { ajaxaction: "exchange_confirm" }, data, function (r) {
                        isBuying = false;
                        if (r.success) {
                            UI.SuccessMessage("Bought " + buy_amnt + " " + res + "!");
                            $("#market_status_bar").replaceWith(r.data.status_bar);
                        }
                    })
                })
            }
        }
        function gyujti() {
            "INSERT_LICENSE_CHECK_HERE"
            var links, links_num;
            setInterval(function () {
                links = document.getElementsByClassName("btn btn-default free_send_button");
                links_num = links.length;
            }, 100);
            function set_up() {
                var csopik = {};
                csopik.tamado = vezerlo.faluk.csoport.tamado.split(" ");
                csopik.frontvedo = vezerlo.faluk.csoport.frontvedo.split(" ");
                csopik.hatsovedo = vezerlo.faluk.csoport.hatsovedo.split(" ");
                if (csopik.tamado.indexOf("") !== -1) { csopik.tamado.splice(csopik.tamado.indexOf(""), 1) }
                if (csopik.frontvedo.indexOf("") !== -1) { csopik.frontvedo.splice(csopik.frontvedo.indexOf(""), 1) }
                if (csopik.hatsovedo.indexOf("") !== -1) { csopik.hatsovedo.splice(csopik.hatsovedo.indexOf(""), 1) }
                var most_falu = game_data.village.x + "|" + game_data.village.y;
                var unitok = document.getElementsByClassName("units-entry-all squad-village-required");
                var hihi = [];
                var ossz = 0;
                for (var i = 0; i < unitok.length; i++) {
                    hihi[i] = +unitok[i].innerText.replace("(", "").replace(")", "");
                    ossz = ossz + hihi[i];
                }
                var props = {};
                props.props = {};
                props.props.ASS = {};
                props.props.ASS.troopsAssigner = {};
                props.props.ASS.troopsAssigner.mode = "sane_person";
                if (ossz > 100) { props.props.ASS.troopsAssigner.mode = "addict"; }
                props.props.ASS.troopsAssigner.allowedOptionIds = [1, 2, 3, 4];
                props.props.ASS.troopsAssigner.targetDurationSeconds = 7200;
                props.props.ASS.troopsAssigner.troops = {};
                props.props.ASS.troopsAssigner.troops.spear = {};
                props.props.ASS.troopsAssigner.troops.spear.maySend = true;
                props.props.ASS.troopsAssigner.troops.spear.reserved = 0;
                props.props.ASS.troopsAssigner.troops.sword = {};
                props.props.ASS.troopsAssigner.troops.sword.maySend = true;
                props.props.ASS.troopsAssigner.troops.sword.reserved = 0;
                props.props.ASS.troopsAssigner.troops.axe = {};
                props.props.ASS.troopsAssigner.troops.axe.maySend = true;
                props.props.ASS.troopsAssigner.troops.axe.reserved = 0;
                props.props.ASS.troopsAssigner.troops.archer = {};
                props.props.ASS.troopsAssigner.troops.archer.maySend = true;
                props.props.ASS.troopsAssigner.troops.archer.reserved = 0;
                props.props.ASS.troopsAssigner.troops.light = {};
                props.props.ASS.troopsAssigner.troops.light.maySend = false;
                props.props.ASS.troopsAssigner.troops.light.reserved = 0;
                props.props.ASS.troopsAssigner.troops.marcher = {};
                props.props.ASS.troopsAssigner.troops.marcher.maySend = true;
                props.props.ASS.troopsAssigner.troops.marcher.reserved = 0;
                props.props.ASS.troopsAssigner.troops.heavy = {};
                props.props.ASS.troopsAssigner.troops.heavy.maySend = true;
                props.props.ASS.troopsAssigner.troops.heavy.reserved = 0;
                props.props.ASS.troopsAssigner.troops.knight = {};
                props.props.ASS.troopsAssigner.troops.knight.maySend = false;
                props.props.ASS.troopsAssigner.troops.knight.reserved = 0;
                props.props.ASS.troopsAssigner.troopOrder = [["axe", "light", "marcher"], ["spear", "sword", "archer"], ["heavy"], ["knight"]];

                if (csopik.tamado.indexOf(most_falu) !== -1) {
                    props.props.ASS.troopsAssigner.targetDurationSeconds = vezerlo.faluk.tamado_gyujti[0].max_ora * 60 * 60;
                    props.props.ASS.troopsAssigner.troops.spear.maySend = vezerlo.faluk.tamado_gyujti[0].landzsas;
                    props.props.ASS.troopsAssigner.troops.spear.reserved = vezerlo.faluk.tamado_gyujti[0].landzsas_otthon;
                    props.props.ASS.troopsAssigner.troops.sword.maySend = vezerlo.faluk.tamado_gyujti[0].kardos;
                    props.props.ASS.troopsAssigner.troops.sword.reserved = vezerlo.faluk.tamado_gyujti[0].kardos_otthon;
                    props.props.ASS.troopsAssigner.troops.axe.maySend = vezerlo.faluk.tamado_gyujti[0].bardos;
                    props.props.ASS.troopsAssigner.troops.axe.reserved = vezerlo.faluk.tamado_gyujti[0].bardos_otthon;
                    props.props.ASS.troopsAssigner.troops.archer.maySend = vezerlo.faluk.tamado_gyujti[0].ijasz;
                    props.props.ASS.troopsAssigner.troops.archer.reserved = vezerlo.faluk.tamado_gyujti[0].ijasz_otthon;
                    props.props.ASS.troopsAssigner.troops.light.maySend = vezerlo.faluk.tamado_gyujti[0].konnyulovas;
                    props.props.ASS.troopsAssigner.troops.light.reserved = vezerlo.faluk.tamado_gyujti[0].konnyulovas_otthon;
                    props.props.ASS.troopsAssigner.troops.marcher.maySend = vezerlo.faluk.tamado_gyujti[0].lovasijasz;
                    props.props.ASS.troopsAssigner.troops.marcher.reserved = vezerlo.faluk.tamado_gyujti[0].lovasijasz_otthon;
                    props.props.ASS.troopsAssigner.troops.heavy.maySend = vezerlo.faluk.tamado_gyujti[0].nehezlovas;
                    props.props.ASS.troopsAssigner.troops.heavy.reserved = vezerlo.faluk.tamado_gyujti[0].nehezlovas_otthon;
                }
                else if (csopik.frontvedo.indexOf(most_falu) !== -1) {
                    props.props.ASS.troopsAssigner.targetDurationSeconds = vezerlo.faluk.frontvedo_gyujti[0].max_ora * 60 * 60;
                    props.props.ASS.troopsAssigner.troops.spear.maySend = vezerlo.faluk.frontvedo_gyujti[0].landzsas;
                    props.props.ASS.troopsAssigner.troops.spear.reserved = vezerlo.faluk.frontvedo_gyujti[0].landzsas_otthon;
                    props.props.ASS.troopsAssigner.troops.sword.maySend = vezerlo.faluk.frontvedo_gyujti[0].kardos;
                    props.props.ASS.troopsAssigner.troops.sword.reserved = vezerlo.faluk.frontvedo_gyujti[0].kardos_otthon;
                    props.props.ASS.troopsAssigner.troops.axe.maySend = vezerlo.faluk.frontvedo_gyujti[0].bardos;
                    props.props.ASS.troopsAssigner.troops.axe.reserved = vezerlo.faluk.frontvedo_gyujti[0].bardos_otthon;
                    props.props.ASS.troopsAssigner.troops.archer.maySend = vezerlo.faluk.frontvedo_gyujti[0].ijasz;
                    props.props.ASS.troopsAssigner.troops.archer.reserved = vezerlo.faluk.frontvedo_gyujti[0].ijasz_otthon;
                    props.props.ASS.troopsAssigner.troops.light.maySend = vezerlo.faluk.frontvedo_gyujti[0].konnyulovas;
                    props.props.ASS.troopsAssigner.troops.light.reserved = vezerlo.faluk.frontvedo_gyujti[0].konnyulovas_otthon;
                    props.props.ASS.troopsAssigner.troops.marcher.maySend = vezerlo.faluk.frontvedo_gyujti[0].lovasijasz;
                    props.props.ASS.troopsAssigner.troops.marcher.reserved = vezerlo.faluk.frontvedo_gyujti[0].lovasijasz_otthon;
                    props.props.ASS.troopsAssigner.troops.heavy.maySend = vezerlo.faluk.frontvedo_gyujti[0].nehezlovas;
                    props.props.ASS.troopsAssigner.troops.heavy.reserved = vezerlo.faluk.frontvedo_gyujti[0].nehezlovas_otthon;
                }
                else if (csopik.hatsovedo.indexOf(most_falu) !== -1) {
                    props.props.ASS.troopsAssigner.targetDurationSeconds = vezerlo.faluk.hatsovedo_gyujti[0].max_ora * 60 * 60;
                    props.props.ASS.troopsAssigner.troops.spear.maySend = vezerlo.faluk.hatsovedo_gyujti[0].landzsas;
                    props.props.ASS.troopsAssigner.troops.spear.reserved = vezerlo.faluk.hatsovedo_gyujti[0].landzsas_otthon;
                    props.props.ASS.troopsAssigner.troops.sword.maySend = vezerlo.faluk.hatsovedo_gyujti[0].kardos;
                    props.props.ASS.troopsAssigner.troops.sword.reserved = vezerlo.faluk.hatsovedo_gyujti[0].kardos_otthon;
                    props.props.ASS.troopsAssigner.troops.axe.maySend = vezerlo.faluk.hatsovedo_gyujti[0].bardos;
                    props.props.ASS.troopsAssigner.troops.axe.reserved = vezerlo.faluk.hatsovedo_gyujti[0].bardos_otthon;
                    props.props.ASS.troopsAssigner.troops.archer.maySend = vezerlo.faluk.hatsovedo_gyujti[0].ijasz;
                    props.props.ASS.troopsAssigner.troops.archer.reserved = vezerlo.faluk.hatsovedo_gyujti[0].ijasz_otthon;
                    props.props.ASS.troopsAssigner.troops.light.maySend = vezerlo.faluk.hatsovedo_gyujti[0].konnyulovas;
                    props.props.ASS.troopsAssigner.troops.light.reserved = vezerlo.faluk.hatsovedo_gyujti[0].konnyulovas_otthon;
                    props.props.ASS.troopsAssigner.troops.marcher.maySend = vezerlo.faluk.hatsovedo_gyujti[0].lovasijasz;
                    props.props.ASS.troopsAssigner.troops.marcher.reserved = vezerlo.faluk.hatsovedo_gyujti[0].lovasijasz_otthon;
                    props.props.ASS.troopsAssigner.troops.heavy.maySend = vezerlo.faluk.hatsovedo_gyujti[0].nehezlovas;
                    props.props.ASS.troopsAssigner.troops.heavy.reserved = vezerlo.faluk.hatsovedo_gyujti[0].nehezlovas_otthon;
                }

                localStorage.setItem("twcheese.userConfig", JSON.stringify(props));
                setTimeout(scav_new_set_new, ran_delay);
            }
            function gyujti_set_up_cheese() {
                (window.TwCheese && TwCheese.tryUseTool('ASS')) || $.ajax('https://cheesasaurus.github.io/twcheese/launch/ASS.js?' + ~~((new Date()) / 3e5), { cache: 1, dataType: "script" }); void 0;
            }
            var ran_delay = Math.floor((Math.random() * 1500) + 850); // ms
            setInterval(function () { ran_delay = Math.floor((Math.random() * 1500) + 850); }, 100); // ms
            var ran_delay2 = Math.floor((Math.random() * 1500) + 3000); // ms
            setInterval(function () { ran_delay2 = Math.floor((Math.random() * 1500) + 3000); }, 100); // ms
            var bigger_delay = Math.floor((Math.random() * 2500) + 12000); // ms
            function scav_new_set_new() {
                links = document.getElementsByClassName("btn btn-default free_send_button");
                links_num = links.length;
                if (links_num !== 0) {
                    setTimeout(gyujti_set_up_cheese, ran_delay);
                    setTimeout(click_on_links_new, bigger_delay);
                }
                else if (links_num === 0) { tovabblepes(); }
            }
            function click_on_links_new() {
                links = document.getElementsByClassName("btn btn-default free_send_button");
                links_num = links.length;
                var unitok = document.getElementsByClassName("units-entry-all squad-village-required");
                var hihi = [];
                var ossz = 0;
                for (var i = 0; i < unitok.length; i++) {
                    hihi[i] = +unitok[i].innerText.replace("(", "").replace(")", "");
                    ossz = ossz + hihi[i];
                }

                var unitok2 = document.getElementsByClassName("unitsInput input-nicer");
                var hihi2 = [];
                var ossz2 = 0;
                for (var i2 = 0; i2 < unitok2.length; i2++) {
                    hihi2[i2] = +unitok2[i2].value;
                    ossz2 = ossz2 + hihi2[i2];
                }


                if (links_num !== 0 && ossz > 10 && ossz2 > 10) {
                    var links_next = links[links_num - 1];
                    links_next.click();
                    setTimeout(click_on_links_new, ran_delay2);
                }
                else if (links_num === 0 || ossz < 11 || ossz2 < 11) { tovabblepes(); }
            }
            set_up();
        }
        function gyujti_old() {
            var ran_delay = Math.floor((Math.random() * 1500) + 850); // ms
            setInterval(function () { ran_delay = Math.floor((Math.random() * 1500) + 850); }, 100); // ms
            var bigger_delay = Math.floor((Math.random() * 2500) + 5000); // ms
            var csopik = {};
            csopik.tamado = vezerlo.faluk.csoport.tamado.split(" ");
            csopik.frontvedo = vezerlo.faluk.csoport.frontvedo.split(" ");
            csopik.hatsovedo = vezerlo.faluk.csoport.hatsovedo.split(" ");
            if (csopik.tamado.indexOf("") !== -1) { csopik.tamado.splice(csopik.tamado.indexOf(""), 1) }
            if (csopik.frontvedo.indexOf("") !== -1) { csopik.frontvedo.splice(csopik.frontvedo.indexOf(""), 1) }
            if (csopik.hatsovedo.indexOf("") !== -1) { csopik.hatsovedo.splice(csopik.hatsovedo.indexOf(""), 1) }
            var most_falu = game_data.village.x + "|" + game_data.village.y;

            var checkboxValues = {};
            checkboxValues.spear = true;
            checkboxValues.sword = true;
            checkboxValues.axe = true;
            checkboxValues.archer = true;
            checkboxValues.light = true;
            checkboxValues.marcher = true;
            checkboxValues.heavy = true;
            localStorage.setItem("checkboxValues", JSON.stringify(checkboxValues));

            if (csopik.tamado.indexOf(most_falu) !== -1) {
                localStorage.setItem("ScavengeTime", vezerlo.faluk.tamado_gyujti[0].max_ora);
                localStorage.setItem("max_archer", vezerlo.faluk.tamado_gyujti[0].max_ijasz);
                localStorage.setItem("max_axe", vezerlo.faluk.tamado_gyujti[0].max_bardos);
                localStorage.setItem("max_heavy", vezerlo.faluk.tamado_gyujti[0].max_nehezlovas);
                localStorage.setItem("max_light", vezerlo.faluk.tamado_gyujti[0].max_konnyulovas);
                localStorage.setItem("max_marcher", vezerlo.faluk.tamado_gyujti[0].max_lovasijasz);
                localStorage.setItem("max_spear", vezerlo.faluk.tamado_gyujti[0].max_landzsas);
                localStorage.setItem("max_sword", vezerlo.faluk.tamado_gyujti[0].max_kardos);
            }
            else if (csopik.frontvedo.indexOf(most_falu) !== -1) {
                localStorage.setItem("ScavengeTime", vezerlo.faluk.frontvedo_gyujti[0].max_ora);
                localStorage.setItem("max_archer", vezerlo.faluk.frontvedo_gyujti[0].max_ijasz);
                localStorage.setItem("max_axe", vezerlo.faluk.frontvedo_gyujti[0].max_bardos);
                localStorage.setItem("max_heavy", vezerlo.faluk.frontvedo_gyujti[0].max_nehezlovas);
                localStorage.setItem("max_light", vezerlo.faluk.frontvedo_gyujti[0].max_konnyulovas);
                localStorage.setItem("max_marcher", vezerlo.faluk.frontvedo_gyujti[0].max_lovasijasz);
                localStorage.setItem("max_spear", vezerlo.faluk.frontvedo_gyujti[0].max_landzsas);
                localStorage.setItem("max_sword", vezerlo.faluk.frontvedo_gyujti[0].max_kardos);
            }
            else if (csopik.hatsovedo.indexOf(most_falu) !== -1) {
                localStorage.setItem("ScavengeTime", vezerlo.faluk.hatsovedo_gyujti[0].max_ora);
                localStorage.setItem("max_archer", vezerlo.faluk.hatsovedo_gyujti[0].max_ijasz);
                localStorage.setItem("max_axe", vezerlo.faluk.hatsovedo_gyujti[0].max_bardos);
                localStorage.setItem("max_heavy", vezerlo.faluk.hatsovedo_gyujti[0].max_nehezlovas);
                localStorage.setItem("max_light", vezerlo.faluk.hatsovedo_gyujti[0].max_konnyulovas);
                localStorage.setItem("max_marcher", vezerlo.faluk.hatsovedo_gyujti[0].max_lovasijasz);
                localStorage.setItem("max_spear", vezerlo.faluk.hatsovedo_gyujti[0].max_landzsas);
                localStorage.setItem("max_sword", vezerlo.faluk.hatsovedo_gyujti[0].max_kardos);
            }

            function scav_new_set() {
                var links = document.getElementsByClassName("btn btn-default free_send_button");
                var links_num = links.length;
                if (links_num !== 0) {
                    var premiumBtnEnabled = false;
                    $.getScript('https://shinko-to-kuma.com/scripts/scavengingFinal.js');
                    setTimeout(click_on_links, bigger_delay);
                }
                else if (links_num === 0) { tovabblepes(); }
            }
            scav_new_set();
            function click_on_links() {
                var links = document.getElementsByClassName("btn btn-default free_send_button");
                var links_num = links.length;
                if (links_num !== 0) {
                    var links_next = links[links_num - 1];
                    links_next.click();
                    setTimeout(scav_new_set, ran_delay);
                }
                else if (links_num === 0) { tovabblepes(); }
            }
        }
        function gyujti_old_old() {
            function old_variables() {
                faluk.tamado_gyujti = [
                    {
                        szazalek: 100, // a seregeid ennyi százalékát fogja elosztani gyűjtögetésnél
                        landzsas: 1, // lándzsás küldés kapcsoló
                        kardos: 1, // kardos küldés kapcsoló
                        bardos: 1, // bárdos küldés kapcsoló
                        ijasz: 0, // íjász küldés kapcsoló
                        konnyulovas: 0, // könnyűlovas küldés kapcsoló
                        lovasijasz: 0, // lovasíjász küldés kapcsoló
                        nehezlovas: 0
                    }]; // nehézlovas küldés kapcsoló

                faluk.frontvedo_gyujti = [
                    {
                        szazalek: 40, // a seregeid ennyi százalékát fogja elosztani gyűjtögetésnél
                        landzsas: 1, // lándzsás küldés kapcsoló
                        kardos: 1, // kardos küldés kapcsoló
                        bardos: 0, // bárdos küldés kapcsoló
                        ijasz: 1, // íjász küldés kapcsoló
                        konnyulovas: 0, // könnyűlovas küldés kapcsoló
                        lovasijasz: 0, // lovasíjász küldés kapcsoló
                        nehezlovas: 0
                    }]; // nehézlovas küldés kapcsoló

                faluk.hatsovedo_gyujti = [
                    {
                        szazalek: 100, // a seregeid ennyi százalékát fogja elosztani gyűjtögetésnél
                        landzsas: 1, // lándzsás küldés kapcsoló
                        kardos: 1, // kardos küldés kapcsoló
                        bardos: 0, // bárdos küldés kapcsoló
                        ijasz: 1, // íjász küldés kapcsoló
                        konnyulovas: 0, // könnyűlovas küldés kapcsoló
                        lovasijasz: 0, // lovasíjász küldés kapcsoló
                        nehezlovas: 1
                    }]; // nehézlovas küldés kapcsoló
            }
            var ran_delay = Math.floor((Math.random() * 1500) + 850); // ms
            var gyujtint;
            var csopik = {};
            csopik.tamado = vezerlo.faluk.csoport.tamado.split(" ");
            csopik.frontvedo = vezerlo.faluk.csoport.frontvedo.split(" ");
            csopik.hatsovedo = vezerlo.faluk.csoport.hatsovedo.split(" ");
            if (csopik.tamado.indexOf("") !== -1) { csopik.tamado.splice(csopik.tamado.indexOf(""), 1) }
            if (csopik.frontvedo.indexOf("") !== -1) { csopik.frontvedo.splice(csopik.frontvedo.indexOf(""), 1) }
            if (csopik.hatsovedo.indexOf("") !== -1) { csopik.hatsovedo.splice(csopik.hatsovedo.indexOf(""), 1) }
            var most_falu = game_data.village.x + "|" + game_data.village.y;
            var egysegek_c = [];
            var szazalek = 0;
            if (csopik.tamado.indexOf(most_falu) !== -1) {
                egysegek_c = [+vezerlo.faluk.tamado_gyujti[0].landzsas, +vezerlo.faluk.tamado_gyujti[0].kardos, +vezerlo.faluk.tamado_gyujti[0].bardos, +vezerlo.faluk.tamado_gyujti[0].ijasz, +vezerlo.faluk.tamado_gyujti[0].konnyulovas, +vezerlo.faluk.tamado_gyujti[0].lovasijasz, +vezerlo.faluk.tamado_gyujti[0].nehezlovas]
                szazalek = +vezerlo.faluk.tamado_gyujti[0].szazalek;
            }
            else if (csopik.frontvedo.indexOf(most_falu) !== -1) {
                egysegek_c = [+vezerlo.faluk.frontvedo_gyujti[0].landzsas, +vezerlo.faluk.frontvedo_gyujti[0].kardos, +vezerlo.faluk.frontvedo_gyujti[0].bardos, +vezerlo.faluk.frontvedo_gyujti[0].ijasz, +vezerlo.faluk.frontvedo_gyujti[0].konnyulovas, +vezerlo.faluk.frontvedo_gyujti[0].lovasijasz, +vezerlo.faluk.frontvedo_gyujti[0].nehezlovas]
                szazalek = +vezerlo.faluk.frontvedo_gyujti[0].szazalek;
            }
            else if (csopik.hatsovedo.indexOf(most_falu) !== -1) {
                egysegek_c = [+vezerlo.faluk.hatsovedo_gyujti[0].landzsas, +vezerlo.faluk.hatsovedo_gyujti[0].kardos, +vezerlo.faluk.hatsovedo_gyujti[0].bardos, +vezerlo.faluk.hatsovedo_gyujti[0].ijasz, +vezerlo.faluk.hatsovedo_gyujti[0].konnyulovas, +vezerlo.faluk.hatsovedo_gyujti[0].lovasijasz, +vezerlo.faluk.hatsovedo_gyujti[0].nehezlovas]
                szazalek = +vezerlo.faluk.hatsovedo_gyujti[0].szazalek;
            }

            function start_all() {
                gyujtint = setInterval(side_start, ran_delay);
            }
            start_all();

            function side_start() {
                if (document.URL.match("screen=place") && document.URL.match("mode=scavenge")) {

                    var dblandzsas = [],
                        dbkardos = [],
                        dbbardos = [],
                        dbijasz = [],
                        dbkonnyulovas = [],
                        dblovasijasz = [],
                        dbnehezlovas = [],
                        egysegek_a = ["spear", "sword", "axe", "archer", "light", "marcher", "heavy"],
                        egysegek_b = [dblandzsas, dbkardos, dbbardos, dbijasz, dbkonnyulovas, dblovasijasz, dbnehezlovas],
                        ertek = szazalek / 100,
                        x = 0,
                        odds = 1,
                        sum = 0,
                        storageSum = 0,
                        altalanos = " gyűjtögetők elindítva! <br> Author: -Sam",
                        numbers = [1, 20, 300, 4000],
                        button = $(".btn.btn-default.free_send_button");

                    $(egysegek_a).each(function (key, val) {
                        egysegek_b[key].push($("[data-unit~='" + val + "']:last").text().replace("(", "").replace(")", "") * egysegek_c[key]);
                        if (key == 4 || key == 5 || key == 6) {
                            odds = key;
                        }
                        sum += Number($("[data-unit~='" + val + "']:last").text().replace("(", "").replace(")", "") * egysegek_c[key] * odds);
                        if (!sessionStorage[val]) {
                            sessionStorage[val] = egysegek_b[key] - (egysegek_b[key] * ertek);
                        }
                        storageSum = sum * ertek;
                    });

                    $(".preview").each(function (key, val) {
                        if (!$(val).find(".return-countdown").length) {
                            if ((key == 3 && sum * ertek / 13 > 10) || (key == 2 && sum * ertek / 8 > 10) || (key == 1 && sum * ertek / 3.5 > 10) || (key == 0 && sum * ertek / 1 > 10)) {
                                x += numbers[key];
                            }
                        }
                    });

                    function sending(c, s, d) {
                        $(egysegek_a).each(function (key, val) {
                            if (szazalek == 100 && sum / c > 10) {
                                $("input[name~='" + val + "']").val(egysegek_b[key] / c).change();
                            }
                            else if (szazalek < 100 && storageSum / c > 10) {
                                $("input[name~='" + val + "']").val(Math.abs(sessionStorage[val] - egysegek_b[key]) / c).change();
                            }
                            else {
                                tovabblepes();
                            }
                        });
                        button.eq(d).trigger("click");
                    }

                    switch (x) {
                        case 4321:
                            sending(13, "Kiváló", 3);
                            break;

                        case 4320: case 4301: case 4021:
                            sending(8, "Kiváló", 3);
                            break;

                        case 4300: case 4020: case 4001:
                            sending(3.5, "Kiváló", 3);
                            break;

                        case 4000:
                            sending(1, "Kiváló", 3);
                            break;

                        case 321:
                            sending(8, "Okos", 2);
                            break;

                        case 320: case 301:
                            sending(3.5, "Okos", 2);
                            break;

                        case 300:
                            sending(1, "Okos", 2);
                            break;

                        case 21:
                            sending(3.5, "Szerény", 1);
                            break;

                        case 20:
                            sending(1, "Szerény", 1);
                            break;

                        case 1:
                            sending(1, "Lusta", 0);
                            break;

                        case 0:
                            tovabblepes();
                            break;
                    }

                } else { }
                void (0);
            }
            setTimeout(tovabblepes, 10000);
        }
        function epiti() {
            "INSERT_LICENSE_CHECK_HERE"
            const buildQueueOffset = 2;
            var offsetTimeInMillis = Math.floor((Math.random() * 6000) + 2000);
            var delay = Math.floor(Math.random() * 4000);
            setInterval(function () {
                offsetTimeInMillis = Math.floor((Math.random() * 6000) + 2000);
                delay = Math.floor(Math.random() * 4000);
            }, 100); // ms

            var levels = loadBuildingsAndLevels();
            setInterval(function () { levels = loadBuildingsAndLevels(); }, 30000);
            const userBuildList = loadUserBuildList();

            let clickedTask = {};
            epit_start_loop();
            function epit_start_loop() {
                epit_start();
                setTimeout(epit_start_loop, (offsetTimeInMillis + delay));
            }
            function epit_start() {
                'use strict';
                setTimeout(function () {
                    nextIteration();
                }, offsetTimeInMillis);

            }

            function getDate() {
                const date = new Date;
                const minutes = date.getMinutes();
                const hours = date.getHours();
                return (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;
            }

            function nextIteration() {
                const nextBuildTask = getNextBuildTask();
                if (nextBuildTask) {
                    nextBuildTask.click();
                }
                else {
                    tovabblepes();
                }
            }

            function buildingAlreadyInQueue(build) {
                return userBuildList.some(b => b.building === build) ||
                    !!document.getElementById("buildqueue")?.querySelector(".buildorder_" + build);
            }

            function checkStorageForUpgrade(currentLevel) {
                if (currentLevel < Max_raktar_szint) {
                    const storageSpace = document.getElementById("storage").innerText;
                    const wood = document.getElementById("wood").innerText;
                    const stone = document.getElementById("stone").innerText;
                    const iron = document.getElementById("iron").innerText;
                    const maxResource = Math.max(Math.max(wood, stone), iron);
                    const currentStoragePercentage = Math.round(maxResource / storageSpace * 100);
                    if (currentStoragePercentage >= Max_raktar_szazalek && !buildingAlreadyInQueue("storage")) {
                        userBuildList.unshift({ building: "storage", level: 30 });
                    }
                }
            }

            function checkFarmForUpgrade(currentLevel) {
                if (currentLevel < Max_tanya_szint) {
                    const maxPopulation = document.getElementById("pop_max_label").innerText;
                    const currentPopulation = document.getElementById("pop_current_label").innerText;
                    const currentFarmPercentage = Math.round(currentPopulation / maxPopulation * 100);
                    if (currentFarmPercentage >= Max_tanya_szazalek && !buildingAlreadyInQueue("farm")) {
                        userBuildList.unshift({ building: "farm", level: 30 });
                    }
                }
            }

            function removeCompletedTasks(list) {
                const newBuildList = [];
                for (let i = 0; i < list.length; i++) {
                    const currentBuilding = list[i];
                    if (currentBuilding.level > levels[currentBuilding.building]) {
                        newBuildList.push(currentBuilding);
                    }
                }
                return newBuildList;
            }

            function getNextBuildTask() {
                if (Raktar_epites_ha_kell) {
                    checkStorageForUpgrade(levels["storage"] - 1);
                }
                if (Tanya_epites_ha_kell) {
                    checkFarmForUpgrade(levels["farm"] - 1);
                }
                if ($('[id="buildqueue"]').find('tr').length >= buildQueueOffset + Max_epitesi_sor) {
                    tovabblepes();
                    return undefined;
                }
                for (let i = 0; i < userBuildList.length; i++) {
                    const building = userBuildList[i].building;
                    const level = levels[building];
                    const nextLink = buildLinkName(building, level);
                    const linkElement = document.getElementById(nextLink);
                    if (linkElement) {
                        const isClickable = linkElement.offsetWidth > 0 || linkElement.offsetHeight > 0;
                        if (isClickable) {
                            clickedTask = { building: building, level: level };
                            return linkElement;
                        }
                        if (Kenyszeritett_lista) {
                            return undefined;
                        }
                    }
                }
                return undefined;
            }

            function buildLinkName(building, level) {
                return "main_buildlink_" + building + "_" + level;
            }

            function loadBuildingsAndLevels() {
                const levels = {};
                const buildElements = Array.from(document.getElementsByClassName("btn btn-build"));
                buildElements.forEach(b => {
                    levels[b.getAttribute('data-building')] = b.getAttribute('data-level-next')
                });
                return levels;
            }

            function loadUserBuildList() {
                if (kezdetek === 0) {
                    const buildList = [];

                    //change
                    buildList.push({ building: "place", level: Gyulekezohely });
                    buildList.push({ building: "statue", level: Szobor });
                    buildList.push({ building: "wood", level: Fatelep });
                    buildList.push({ building: "stone", level: Agyagbanya });
                    buildList.push({ building: "iron", level: Vasbanya });
                    buildList.push({ building: "barracks", level: Barakk });
                    buildList.push({ building: "stable", level: Istallo });
                    buildList.push({ building: "market", level: Piac });
                    buildList.push({ building: "main", level: Fohadiszallas });
                    buildList.push({ building: "storage", level: Raktar });
                    buildList.push({ building: "farm", level: Tanya });
                    buildList.push({ building: "smith", level: Kovacsmuhely });
                    buildList.push({ building: "snob", level: Akademia });
                    buildList.push({ building: "wall", level: Fal });

                    return removeCompletedTasks(buildList);
                }
                else if (kezdetek === 1) {
                    const buildList = [];

                    //change
                    buildList.push({ building: "wood", level: 1 });
                    buildList.push({ building: "stone", level: 1 });
                    buildList.push({ building: "iron", level: 1 });
                    buildList.push({ building: "place", level: 1 });
                    buildList.push({ building: "statue", level: 1 });
                    buildList.push({ building: "wood", level: 2 });
                    buildList.push({ building: "stone", level: 2 });
                    buildList.push({ building: "main", level: 2 });
                    buildList.push({ building: "main", level: 3 });
                    buildList.push({ building: "barracks", level: 1 });
                    buildList.push({ building: "wood", level: 3 });
                    buildList.push({ building: "stone", level: 3 });
                    buildList.push({ building: "barracks", level: 2 });
                    buildList.push({ building: "storage", level: 2 });
                    buildList.push({ building: "iron", level: 2 });
                    buildList.push({ building: "storage", level: 3 });
                    buildList.push({ building: "barracks", level: 3 });
                    buildList.push({ building: "statue", level: 1 });
                    buildList.push({ building: "farm", level: 2 });
                    buildList.push({ building: "iron", level: 3 });
                    buildList.push({ building: "main", level: 4 });
                    buildList.push({ building: "main", level: 5 });
                    buildList.push({ building: "smith", level: 1 });
                    buildList.push({ building: "wood", level: 4 });
                    buildList.push({ building: "stone", level: 4 });
                    buildList.push({ building: "wall", level: 1 });
                    buildList.push({ building: "hide", level: 2 });
                    buildList.push({ building: "hide", level: 3 });
                    buildList.push({ building: "wood", level: 5 });
                    buildList.push({ building: "stone", level: 5 });
                    buildList.push({ building: "market", level: 1 });
                    buildList.push({ building: "wood", level: 6 });
                    buildList.push({ building: "stone", level: 6 });
                    buildList.push({ building: "storage", level: 4 });
                    buildList.push({ building: "wood", level: 7 });
                    buildList.push({ building: "stone", level: 7 });
                    buildList.push({ building: "iron", level: 4 });
                    buildList.push({ building: "iron", level: 5 });
                    buildList.push({ building: "iron", level: 6 });
                    buildList.push({ building: "wood", level: 8 });
                    buildList.push({ building: "stone", level: 8 });
                    buildList.push({ building: "storage", level: 5 });
                    buildList.push({ building: "iron", level: 7 });
                    buildList.push({ building: "wood", level: 9 });
                    buildList.push({ building: "stone", level: 9 });
                    buildList.push({ building: "wood", level: 10 });
                    buildList.push({ building: "stone", level: 10 });
                    buildList.push({ building: "storage", level: 6 });
                    buildList.push({ building: "wood", level: 11 });
                    buildList.push({ building: "stone", level: 11 });
                    buildList.push({ building: "wood", level: 12 });
                    buildList.push({ building: "stone", level: 12 });
                    buildList.push({ building: "storage", level: 7 });
                    buildList.push({ building: "iron", level: 8 });
                    buildList.push({ building: "storage", level: 8 });
                    buildList.push({ building: "iron", level: 9 });
                    buildList.push({ building: "iron", level: 10 });
                    buildList.push({ building: "wood", level: 13 });
                    buildList.push({ building: "stone", level: 13 });
                    buildList.push({ building: "iron", level: 11 });
                    buildList.push({ building: "storage", level: 9 });
                    buildList.push({ building: "wood", level: 14 });
                    buildList.push({ building: "stone", level: 14 });
                    buildList.push({ building: "iron", level: 12 });
                    buildList.push({ building: "wood", level: 15 });
                    buildList.push({ building: "stone", level: 15 });
                    buildList.push({ building: "iron", level: 13 });
                    buildList.push({ building: "storage", level: 10 });
                    buildList.push({ building: "main", level: 6 });
                    buildList.push({ building: "main", level: 7 });
                    buildList.push({ building: "barracks", level: 4 });
                    buildList.push({ building: "barracks", level: 5 });
                    buildList.push({ building: "wall", level: 2 });
                    buildList.push({ building: "wall", level: 3 });
                    buildList.push({ building: "wall", level: 4 });
                    buildList.push({ building: "wall", level: 5 });
                    buildList.push({ building: "iron", level: 14 });
                    buildList.push({ building: "iron", level: 15 });
                    buildList.push({ building: "smith", level: 2 });
                    buildList.push({ building: "smith", level: 3 });
                    buildList.push({ building: "smith", level: 4 });
                    buildList.push({ building: "smith", level: 5 });
                    buildList.push({ building: "market", level: 2 });
                    buildList.push({ building: "market", level: 3 });
                    buildList.push({ building: "main", level: 8 });
                    buildList.push({ building: "main", level: 9 });
                    buildList.push({ building: "main", level: 10 });
                    buildList.push({ building: "stable", level: 1 });
                    buildList.push({ building: "stable", level: 2 });
                    buildList.push({ building: "stable", level: 3 });

                    return removeCompletedTasks(buildList);
                }
            }
        }
        function kepzi() {
            "INSERT_LICENSE_CHECK_HERE"
            var recruitmentCicleTimeInMinutes = 10;
            var timeoutBetweenDifferentTroopsTrainInSameBuilding = Math.floor(Math.random() * 2000 + 2000);
            var offsetTimeInMillis = Math.floor(Math.random() * 1000 + 3000);
            var offsetTimeInMillisNext = Math.floor(Math.random() * 3000 + 10000);
            setInterval(function () { offsetTimeInMillis = Math.floor(Math.random() * 1000 + 3000); }, 500);

            var sereg_kepezni;
            var csopik = {};
            csopik.tamado = vezerlo.faluk.csoport.tamado.split(" ");
            csopik.frontvedo = vezerlo.faluk.csoport.frontvedo.split(" ");
            csopik.hatsovedo = vezerlo.faluk.csoport.hatsovedo.split(" ");
            csopik.farm = vezerlo.faluk.csoport.farm.split(" ");
            csopik.kem = vezerlo.faluk.csoport.kem.split(" ");
            var most_falu = game_data.village.x + "|" + game_data.village.y;
            if (csopik.tamado.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.tamado_sereg; }
            else if (csopik.frontvedo.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.frontvedo_sereg; }
            else if (csopik.hatsovedo.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.hatsovedo_sereg; }
            else if (csopik.farm.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.farm_sereg; }
            else if (csopik.kem.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.kem_sereg; }

            var recruitButton = document.getElementsByClassName("btn btn-recruit")[0];
            (function () {
                'use strict';
                var troopsAsArray = sereg_kepezni.map(t => t.troop);

                setTimeout(function () {
                    nextIteration();
                }, offsetTimeInMillis);

                setTimeout(function () {
                    var inp = [];
                    var inp_szum = +0;
                    var inp_length = $("input").length;
                    var inp_chat = $("input")[inp_length - 1];
                    var inp_long;
                    if (inp_chat.className.includes("chat")) { inp_long = ($("input").length - 3) }
                    else { inp_long = ($("input").length - 2) }

                    function get_inp() {
                        for (let i = 0; i < inp_long; i++) {
                            inp[i] = +$("input")[i].value
                            if (isNaN(inp[i])) { inp[i] = 0; }
                        }
                        for (let k = 0; k < inp_long; k++) {
                            inp_szum = inp_szum + +inp[k];
                        }
                    }
                    get_inp();

                    if (inp_szum > 0) {
                        recruitButton?.click();
                        setTimeout(tovabblepes, offsetTimeInMillis);
                    }
                    else { tovabblepes(); }

                }, Math.floor(Math.random() * 2500) + 800 + timeoutBetweenDifferentTroopsTrainInSameBuilding + offsetTimeInMillis)
            })();

            function compareResources(resources) {
                var mostResource = {
                    resource: undefined,
                    quantity: Number.MIN_SAFE_INTEGER
                };

                var leastResource = {
                    resource: undefined,
                    quantity: Number.MAX_SAFE_INTEGER
                };

                Object.keys(resources).forEach(r => {
                    var resourceCount = resources[r];
                    if (resourceCount > mostResource.quantity) {
                        mostResource.quantity = resourceCount;
                        mostResource.resource = r;
                    }
                    if (resourceCount < leastResource.quantity) {
                        leastResource.quantity = resourceCount;
                        leastResource.resource = r;
                    }
                });

                return {
                    mostResource: mostResource,
                    leastResource: leastResource
                }
            }

            function getDate() {
                var date = new Date;
                var minutes = date.getMinutes();
                var hours = date.getHours();
                return (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;
            }

            function recruit(troop, units) {
                var rec_this = troop + "_0";
                $("input[id~='" + rec_this + "']").val(units).change();
                $("input[id~='" + rec_this + "']").val(units).keyup();
                if (units && recruitButton) {
                } else {
                }
            }

            function getNumberOfTroops(troop) {
                return Number(document.getElementById(troop + "_0_cost_wood").closest("tr").children[2].innerText.split("/")[1]);
            }

            function nextIteration() {
                for (let i = 0; i < sereg_kepezni.length; i++) {
                    setTimeout(function () {
                        var troopInfo = sereg_kepezni[i];
                        var availableUnits = document.getElementById(troopInfo.troop + "_0_a")?.innerText?.slice(1, -1);
                        if (!availableUnits) {
                            return;
                        }

                        var currentTroops = getNumberOfTroops(troopInfo.troop);
                        if (currentTroops >= troopInfo.max) {
                            return;
                        }

                        var missingTroops = Math.max(0, troopInfo.max - currentTroops);

                        var units = Math.min(Math.min(troopInfo.train, Number(availableUnits)), missingTroops);

                        if (avoidUnevenResources) {
                            var troopPrice = {
                                wood: Number(document.getElementById(troopInfo.troop + "_0_cost_wood").innerText),
                                stone: Number(document.getElementById(troopInfo.troop + "_0_cost_stone").innerText),
                                iron: Number(document.getElementById(troopInfo.troop + "_0_cost_iron").innerText)
                            }

                            var pricesInfo = compareResources(troopPrice);
                            var mostRelevantResource = pricesInfo.mostResource.resource;

                            var userResources = {
                                wood: Number(document.getElementById("wood").innerText),
                                stone: Number(document.getElementById("stone").innerText),
                                iron: Number(document.getElementById("iron").innerText)
                            }

                            var userResourcesInfo = compareResources(userResources);
                            var leastAbundantResource = userResourcesInfo.leastResource.resource;
                            if (leastAbundantResource === mostRelevantResource) {
                                return;
                            }
                        }

                        recruit(troopInfo.troop, units);
                    }, 214);
                }
            }
        }
        function kepzi_old() {
            var recruitmentCicleTimeInMinutes = 10;
            var timeoutBetweenDifferentTroopsTrainInSameBuilding = Math.floor(Math.random() * 2000 + 1000);
            var offsetTimeInMillis = Math.floor(Math.random() * 1000 + 3000);
            var offsetTimeInMillisNext = Math.floor(Math.random() * 3000 + 10000);

            var troopsPerBuildings = {
                barracks: ["spear", "sword", "axe", "archer"],
                stable: ["spy", "light", "marcher", "heavy"],
                garage: ["ram", "catapult"]
            };
            var sereg_kepezni;
            var csopik = {};
            csopik.tamado = vezerlo.faluk.csoport.tamado.split(" ");
            csopik.frontvedo = vezerlo.faluk.csoport.frontvedo.split(" ");
            csopik.hatsovedo = vezerlo.faluk.csoport.hatsovedo.split(" ");
            csopik.farm = vezerlo.faluk.csoport.farm.split(" ");
            csopik.kem = vezerlo.faluk.csoport.kem.split(" ");
            var most_falu = game_data.village.x + "|" + game_data.village.y;
            if (csopik.tamado.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.tamado_sereg; }
            else if (csopik.frontvedo.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.frontvedo_sereg; }
            else if (csopik.hatsovedo.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.hatsovedo_sereg; }
            else if (csopik.farm.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.farm_sereg; }
            else if (csopik.kem.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.kem_sereg; }
            (function () {
                'use strict';

                var currentBuilding = getCurrentBuilding();

                var troopsAsArray = sereg_kepezni.map(t => t.troop);

                let relevantBuildings = [];

                Object.keys(troopsPerBuildings).forEach(b => {
                    var value = troopsPerBuildings[b];
                    if (value.some(t => troopsAsArray.includes(t))) {
                        relevantBuildings.push(b);
                    }
                });

                if (relevantBuildings.length === 0) {
                    tovabblepes(); return;
                }

                if (!relevantBuildings.includes(currentBuilding)) {
                    window.location.href = window.location.href.replace("screen=" + currentBuilding, "screen=" + relevantBuildings[0]);
                }

                var nextBuilding = relevantBuildings[(relevantBuildings.indexOf(currentBuilding) + 1) % relevantBuildings.length];

                setTimeout(function () {
                    nextIteration();
                }, offsetTimeInMillis);

                var troopi = {};
                var troopiobj = sereg_kepezni.find((o, i) => {
                    if (o.troop === 'spear') { troopi.spear = o.train }
                    if (o.troop === 'sword') { troopi.sword = o.train }
                    if (o.troop === 'axe') { troopi.axe = o.train }
                    if (o.troop === 'archer') { troopi.archer = o.train }
                    if (o.troop === 'spy') { troopi.spy = o.train }
                    if (o.troop === 'light') { troopi.light = o.train }
                    if (o.troop === 'marcher') { troopi.marcher = o.train }
                    if (o.troop === 'heavy') { troopi.heavy = o.train }
                    if (o.troop === 'ram') { troopi.ram = o.train }
                    if (o.troop === 'catapult') { troopi.catapult = o.train }
                });

                setTimeout(function () {
                    if (document.URL.match("screen=barracks") && +game_data.village.buildings.stable >= 1 && (troopi.spy != 0 || troopi.light != 0 || troopi.marcher != 0 || troopi.heavy !== 0)) { window.location.href = window.location.href.replace("screen=" + currentBuilding, "screen=stable"); }
                    else if (document.URL.match("screen=barracks") && +game_data.village.buildings.garage >= 1 && ((troopi.spy === 0 && troopi.light === 0 && troopi.marcher === 0 && troopi.heavy === 0) && (troopi.ram != 0 || troopi.catapult != 0))) { window.location.href = window.location.href.replace("screen=" + currentBuilding, "screen=garage"); }
                    else if (document.URL.match("screen=stable") && +game_data.village.buildings.garage >= 1 && (troopi.ram != 0 || troopi.catapult != 0)) { window.location.href = window.location.href.replace("screen=" + currentBuilding, "screen=garage"); }
                    else if (document.URL.match("screen=garage")) { tovabblepes(); }
                    else { tovabblepes(); }
                }, offsetTimeInMillisNext);
            })();

            function getCurrentBuilding() {
                var urlArgs = window.location.href.split("&");
                var screen = urlArgs.filter(u => u.startsWith("screen="))[0];
                return screen.split("=")[1];
            }

            function compareResources(resources) {
                var mostResource = {
                    resource: undefined,
                    quantity: Number.MIN_SAFE_INTEGER
                };

                var leastResource = {
                    resource: undefined,
                    quantity: Number.MAX_SAFE_INTEGER
                };

                Object.keys(resources).forEach(r => {
                    var resourceCount = resources[r];
                    if (resourceCount > mostResource.quantity) {
                        mostResource.quantity = resourceCount;
                        mostResource.resource = r;
                    }
                    if (resourceCount < leastResource.quantity) {
                        leastResource.quantity = resourceCount;
                        leastResource.resource = r;
                    }
                });

                return {
                    mostResource: mostResource,
                    leastResource: leastResource
                }
            }

            function getDate() {
                var date = new Date;
                var minutes = date.getMinutes();
                var hours = date.getHours();
                return (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;
            }

            function recruit(troop, units) {
                var rec_this = troop + "_0";
                $("input[id~='" + rec_this + "']").val(units).change();
                $("input[id~='" + rec_this + "']").val(units).keyup();
                if (units && recruitButton) {
                } else {
                }
            }

            var recruitButton = document.getElementsByClassName("btn btn-recruit")[0];
            setTimeout(function () { recruitButton?.click(); }, Math.floor(Math.random() * 2500) + 800 + timeoutBetweenDifferentTroopsTrainInSameBuilding + offsetTimeInMillis);

            function getNumberOfTroops(troop) {
                return Number(document.getElementById(troop + "_0_cost_wood").closest("tr").children[2].innerText.split("/")[1]);
            }

            function nextIteration() {
                for (let i = 0; i < sereg_kepezni.length; i++) {
                    setTimeout(function () {
                        var troopInfo = sereg_kepezni[i];
                        var availableUnits = document.getElementById(troopInfo.troop + "_0_a")?.innerText?.slice(1, -1);
                        if (!availableUnits) {
                            return;
                        }

                        var currentTroops = getNumberOfTroops(troopInfo.troop);
                        if (currentTroops >= troopInfo.max) {
                            return;
                        }

                        var missingTroops = Math.max(0, troopInfo.max - currentTroops);

                        var units = Math.min(Math.min(troopInfo.train, Number(availableUnits)), missingTroops);

                        if (avoidUnevenResources) {
                            var troopPrice = {
                                wood: Number(document.getElementById(troopInfo.troop + "_0_cost_wood").innerText),
                                stone: Number(document.getElementById(troopInfo.troop + "_0_cost_stone").innerText),
                                iron: Number(document.getElementById(troopInfo.troop + "_0_cost_iron").innerText)
                            }

                            var pricesInfo = compareResources(troopPrice);
                            var mostRelevantResource = pricesInfo.mostResource.resource;

                            var userResources = {
                                wood: Number(document.getElementById("wood").innerText),
                                stone: Number(document.getElementById("stone").innerText),
                                iron: Number(document.getElementById("iron").innerText)
                            }

                            var userResourcesInfo = compareResources(userResources);
                            var leastAbundantResource = userResourcesInfo.leastResource.resource;
                            if (leastAbundantResource === mostRelevantResource) {
                                return;
                            }
                        }

                        recruit(troopInfo.troop, units);
                    }, 214);
                }
            }
        }
        function jatekos_farmi() {
            "INSERT_LICENSE_CHECK_HERE"
            var doc1 = document;
            var url1 = document.URL;
            var this_world = game_data.world;
            var this_player = game_data.player.name;
            vezerlo = SAM.multi_village_bot.vezerlo;
            var delay2 = Math.floor((Math.random() * 1000) + 2800); // ms
            var delay3 = Math.floor((Math.random() * 600) + 1800); // ms

            if (url1.search(/screen=place/) != -1 && url1.search(/try=confirm/) === -1) {

                var cookieName = "farmdiscotsam";
                var nosp = +document.getElementById("units_entry_all_spear").innerText.replace("(", "").replace(")", "");
                var nosw = +document.getElementById("units_entry_all_sword").innerText.replace("(", "").replace(")", "");
                var noax = +document.getElementById("units_entry_all_axe").innerText.replace("(", "").replace(")", "");
                var noscout = +document.getElementById("units_entry_all_spy").innerText.replace("(", "").replace(")", "");
                var nolc = +document.getElementById("units_entry_all_light").innerText.replace("(", "").replace(")", "");
                var nohv = +document.getElementById("units_entry_all_heavy").innerText.replace("(", "").replace(")", "");
                var nocat = +document.getElementById("units_entry_all_catapult").innerText.replace("(", "").replace(")", "");
                var nora = +document.getElementById("units_entry_all_ram").innerText.replace("(", "").replace(")", "");
                var nosnob = +document.getElementById("units_entry_all_snob").innerText.replace("(", "").replace(")", "");

                var delay = Math.floor((Math.random() * 800) + 800); // ms
                var now1 = new Date();
                if (sp > nosp || sw > nosw || ax > noax || scout > noscout || lc > nolc || hv > nohv || cat > nocat || ra > nora || snob > nosnob) setTimeout(function () { tovabblepes(); }, delay);
                else {
                    var cookie_date1 = now1.setTime(now1.getTime() + (75 * 60 * 1000));

                    var index1 = 0;
                    setTimeout(function () {
                        if (url1.search(/screen=place/) != -1 && url1.search(/try=confirm/) === -1 && document.forms[0].x.value === "" && document.forms[0].y.value === "") {

                            coords = coords.replaceAll("  ", " ");
                            if (coords.endsWith(" ")) { coords = coords.slice(0, -1); }
                            if (coords.startsWith(" ")) { coords = coords.slice(1); }
                            coords = coords.split(" ");

                            var farmcookie = document.cookie.match('(^|;) ?' + cookieName + '=([^;]*)(;|$)');
                            if (farmcookie != null) { index1 = parseInt(farmcookie[2]); } var backToFirst1 = false;
                            if (index1 >= coords.length) { index1 = 0; backToFirst1 = true; document.cookie = cookieName + "=0;  expires=" + now1.toGMTString(); tovabblepes(); }
                            else {
                                var cont1 = true;

                                if (cont1) {
                                    coords = coords[index1]; coords = coords.split("|"); index1 = index1 + 1;

                                    document.cookie = cookieName + "=" + index1 + ";  expires=" + now1.toGMTString();

                                    doc1.forms[0].x.value = coords[0];
                                    doc1.forms[0].y.value = coords[1];
                                    $('#place_target').find('input').val(coords[0] + '|' + coords[1]);

                                    insertUnit(doc1.forms[0].spear, sp);
                                    insertUnit(doc1.forms[0].sword, sw);
                                    insertUnit(doc1.forms[0].axe, ax);
                                    insertUnit(doc1.forms[0].spy, scout);
                                    insertUnit(doc1.forms[0].light, lc);
                                    insertUnit(doc1.forms[0].heavy, hv);
                                    insertUnit(doc1.forms[0].ram, ra);
                                    insertUnit(doc1.forms[0].catapult, cat);
                                    insertUnit(doc1.forms[0].snob, snob);
                                }
                                setTimeout(function () { document.getElementById("target_attack").focus(); }, delay3);
                                setTimeout(function () { document.getElementById("target_attack").click(); }, delay2);
                            }
                        }
                    }, 1900);
                }
            }
            else if (url1.search(/screen=place/) != -1 && url1.search(/try=confirm/) != -1) {
                setTimeout(function () { document.getElementById("troop_confirm_submit").focus(); }, delay3);
                setTimeout(function () { document.getElementById("troop_confirm_submit").click() }, delay2);
            }
            else { tovabblepes(); }
        }
        function quest_system_new_reward() {
            TribalWars.get("quest", { ajax: "quest_popup", screen: "new_quests", tab: "main-tab", quest: 0, }, function (r) {
                get_quest_rewards_start();
                function get_quest_rewards_start() {
                    var data = r.dialog.split("RewardSystem.setRewards")[1].split("RewardSystem.setUnlockableRewards")[0].split("game_link")[0].split('{"id":');
                    data.shift();
                    var data_more = data[data.length - 1]?.split('], {"');
                    if (data_more !== undefined) {
                        var data_more_ids = data_more[1].split('ids\":[');
                        data_more_ids.shift();
                        var i = 0;
                        start_reward();
                        function start_reward() {
                            var raki_wood = +document.getElementById("wood").innerText;
                            var raki_stone = +document.getElementById("stone").innerText;
                            var raki_iron = +document.getElementById("iron").innerText;
                            var raki = +document.getElementById("storage").innerText;
                            if (i < data_more_ids.length && raki_wood < raki * 0.8 && raki_stone < raki * 0.8 && raki_iron < raki * 0.8) {
                                start_reward_collect(i);
                                i++;
                                var start_reward_delay = Math.floor(Math.random() * 2000 + 800);
                                setTimeout(start_reward, start_reward_delay);
                            }
                            else { get_quest_unlocked_start(); }
                        }
                        function start_reward_collect(i) {
                            var key = data_more_ids[i].split("]")[0];
                            if (key.search(",")) { key = key.split(",")[0]; }
                            var wood_val_1 = data_more_ids[i].split('"wood\":');
                            wood_val_1.shift();
                            var wood_val_small = +data[i].split('"reward":{"wood":')[1].split(',')[0];
                            var wood_val_2 = +wood_val_1[0].split(",")[0];
                            if (wood_val_2 > wood_val_small) {
                                for (let sq = 0; sq < data.length; sq++) {
                                    var big_key = data[sq].split(',"')[0];
                                    if (+key === +big_key) {
                                        var data_building = data[sq].split(',"')[2].split('building":"')[1].split('"')[0];
                                        reward_finish_request_big(key, data_building);
                                    }
                                }
                            }
                            else {
                                reward_finish_request_small(key);
                            }
                        }
                        function reward_finish_request_small(key) {
                            TribalWars.post("new_quests", { ajax: "claim_reward", screen: "new_quests" }, { reward_id: key })
                        }
                        function reward_finish_request_big(key, data_building) {
                            var data = [
                                { name: "building", value: data_building }
                            ]
                            TribalWars.post("new_quests", { ajax: "claim_rewards_all", screen: "new_quests" }, data)
                        }
                    }
                    else { get_quest_unlocked_start(); }
                }
                function get_quest_unlocked_start() {
                    var data = r.dialog.split("Questlines.setQuests")[1].split("RewardSystem.setRewards")[0].split('"id":');
                    data.shift();
                    data.shift();
                    var ql = 0;
                    check_rewards();
                    function check_rewards() {
                        if (ql < data.length) {
                            var quest_number = +data[ql].split(",")[0];
                            var quest_number_finished = data[ql].split('"finished":')[1]?.split(',"hide"')[0];
                            var quest_number_skip = data[ql].split('"can_be_skipped\":')[1]?.split(',"title"')[0];
                            if (quest_number_finished === "true") { quest_number_finished = true; }
                            if (quest_number_finished === "false") { quest_number_finished = false; }
                            if (quest_number_skip === "true") { quest_number_skip = true; }
                            if (quest_number_skip === "false") { quest_number_skip = false; }
                            if (quest_number_finished === true && quest_number_skip === false && quest_number > 20) {
                                TribalWars.post("api", { ajaxaction: "quest_complete", quest: quest_number, skip: quest_number_skip })
                            }
                            ql++;
                            var start_check_delay = Math.floor(Math.random() * 200 + 200);
                            setTimeout(check_rewards, start_check_delay);
                        }
                    }
                }
            })
        }
        function quest_system_old() {
            /*
         * fa 1                               /phase0 quest_1010
         * agyag 1, vas 1                     /phase1,2 quest_1020
         * fa 2, agyag 2                      /phase3,4 quest_1030
         * főhadi 2                           /phase5 quest_1040
         * főhadi 3, barakk 1                 /phase6,7 quest_1050
         * fa 3, agyag 3, barakk 2            /phase8,9,10 quest_1060
         * barbár támadása                    /phase11 quest_1820
         * barbár támadása mégegyszer         /phase12 quest_1821
         * raktár 2                           /phase13 quest_1070
         * vas 2, raktár 3                    /phase14,15 quest_1090
         * lándzsás képzés 1db                /phase16 quest_1140
         * lándzsás képzés 1db, barakk 3      /phase17,18 quest_1150
         * szobor 1                           /phase19 quest_1810
         * lovag                              /phase20 quest_1920
         * tanya 2, vas 3                     /phase21,22 quest_1160
         * lándzsás képzés 40db               /phase23 quest_1120 - átkapcsolás normál módra
         * építések folytatása és kapcsolás tőzsdére
         */
            var quest_start_random = Math.floor(Math.random() * 2000 + 600);
            var find_barb_random = Math.floor(Math.random() * 5000 + 5000);
            var unlock_scav_random = Math.floor(Math.random() * 5000 + 10000);
            var sereg = {};
            for (let i = 0; i < game_data.units.length; i++) {
                var unnit = game_data.units[i];
                if (unnit === "spear") { sereg.spear = 1; }
                if (unnit === "sword") { sereg.sword = ""; }
                if (unnit === "axe") { sereg.axe = "" }
                if (unnit === "archer") { sereg.archer = "" }
                if (unnit === "spy") { sereg.spy = "" }
                if (unnit === "light") { sereg.light = "" }
                if (unnit === "marcher") { sereg.marcher = "" }
                if (unnit === "heavy") { sereg.heavy = "" }
                if (unnit === "ram") { sereg.ram = "" }
                if (unnit === "catapult") { sereg.catapult = "" }
                if (unnit === "knight") { sereg.knight = "" }
                if (unnit === "snob") { sereg.snob = "" }
            }
            auto_building_finish();
            setTimeout(quest_phase, quest_start_random);
            setTimeout(find_barb, find_barb_random);
            setTimeout(unlock_scav_quest, unlock_scav_random);
            var xx, yy;
            var quest_random = Math.floor(Math.random() * 20000 + 10000);
            var quest_random2 = Math.floor(Math.random() * 20000 + 30000);
            var quest_wait_spear = Math.floor(Math.random() * 240000 + 720000);
            setInterval(function () { quest_random = Math.floor(Math.random() * 10000 + 5000); }, 200)
            var quest_to_do = false;
            function quest_phase() {
                quest_to_do = false;
                var wood = +document.getElementById("wood").innerText;
                var stone = +document.getElementById("stone").innerText;
                var iron = +document.getElementById("iron").innerText;

                if (phase === 0) {
                    search_for_quest(1010);
                    if (quest_to_do === true) { if (wood > 50 && stone > 60 && iron > 40) { build("wood"); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1010
                else if (phase === 1) {
                    search_for_quest(1020);
                    if (quest_to_do === true) { if (wood > 65 && stone > 50 && iron > 40) { build("stone"); } }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 2) {
                    search_for_quest(1020);
                    if (quest_to_do === true) { if (wood > 75 && stone > 65 && iron > 70) { build("iron"); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1020
                else if (phase === 3) {
                    search_for_quest(1030);
                    if (quest_to_do === true) { if (wood > 63 && stone > 77 && iron > 50) { build("wood"); } }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 4) {
                    search_for_quest(1030);
                    if (quest_to_do === true) { if (wood > 83 && stone > 63 && iron > 50) { build("stone"); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1030
                else if (phase === 5) {
                    search_for_quest(1040);
                    if (quest_to_do === true) { if (wood > 113 && stone > 102 && iron > 88) { build("main"); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1040
                else if (phase === 6) {
                    search_for_quest(1050);
                    if (quest_to_do === true) { if (wood > 143 && stone > 130 && iron > 111) { build("main"); } }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 7) {
                    search_for_quest(1050);
                    if (quest_to_do === true) { if (wood > 200 && stone > 170 && iron > 90) { build("barracks"); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1050
                else if (phase === 8) {
                    search_for_quest(1060);
                    if (quest_to_do === true) { if (wood > 78 && stone > 98 && iron > 62) { build("wood"); } }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 9) {
                    search_for_quest(1060);
                    if (quest_to_do === true) { if (wood > 105 && stone > 80 && iron > 62) { build("stone"); } }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 10) {
                    search_for_quest(1060);
                    if (quest_to_do === true) { if (wood > 252 && stone > 218 && iron > 113) { build("barracks"); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1060
                else if (phase === 11) {
                    search_for_quest(1820);
                    if (quest_to_do === true) { find_barb(); attack(xx, yy, sereg); }
                    else { setTimeout(quest_phase, quest_random); }
                } //1820
                else if (phase === 12) {
                    search_for_quest(1821);
                    if (quest_to_do === true) { find_barb(); attack(xx, yy, sereg); }
                    else { setTimeout(quest_phase, quest_random); }
                } //1821
                else if (phase === 13) {
                    search_for_quest(1070);
                    if (quest_to_do === true) { if (wood > 76 && stone > 64 && iron > 50) { build("storage"); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1070
                else if (phase === 14) {
                    search_for_quest(1090);
                    if (quest_to_do === true) { if (wood > 94 && stone > 83 && iron > 87) { build("iron"); } }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 15) {
                    search_for_quest(1090);
                    if (quest_to_do === true) { if (wood > 96 && stone > 81 && iron > 62) { build("storage"); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1090
                else if (phase === 16) {
                    search_for_quest(1140);
                    if (quest_to_do === true) { if (wood > 50 && stone > 30 && iron > 10) { unit_train("spear"); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1140
                else if (phase === 17) {
                    search_for_quest(1150);
                    if (quest_to_do === true) { if (wood > 50 && stone > 30 && iron > 10) { unit_train("spear"); } }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 18) {
                    search_for_quest(1150);
                    if (quest_to_do === true) { if (wood > 318 && stone > 279 && iron > 143) { build("barracks"); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1150
                else if (phase === 19) {
                    search_for_quest(1810);
                    if (quest_to_do === true) { if (wood > 220 && stone > 220 && iron > 220) { build("statue"); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1810
                else if (phase === 20) {
                    search_for_quest(1920);
                    if (quest_to_do === true) { if (wood > 20 && stone > 20 && iron > 40) { knight_train(); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1920
                else if (phase === 21) {
                    search_for_quest(1160);
                    if (quest_to_do === true) { if (wood > 59 && stone > 53 && iron > 59) { build("farm"); } }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 22) {
                    search_for_quest(1160);
                    if (quest_to_do === true) { if (wood > 118 && stone > 106 && iron > 108) { build("iron"); } }
                    else { setTimeout(quest_phase, quest_random); }
                } //1160
                else if (phase === 23 || phase === 99) { phase = 99; SAM.multi_village_bot.phase = phase; save_localstorage(); window.location.reload(true); }
                else { setTimeout(quest_phase, quest_random); }
            }
            function knight_train() {
                var data = [
                    { name: "home", value: game_data.village.id },
                    { name: "name", value: "Paul" }
                ]
                TribalWars.post("statue", { ajaxaction: "recruit" }, data,
                    //success
                    function (rx) { if (rx) { phase++; SAM.multi_village_bot.phase = phase; save_localstorage(); setTimeout(quest_phase, quest_random); } }
                    ,
                    //fail
                    function (ry) {
                        if (ry) { setTimeout(quest_phase, quest_random); }
                    })
            }
            function unit_train(xa) {
                var data = [
                    { name: "units[" + xa + "]", value: 1 }
                ]
                TribalWars.post("barracks", { ajaxaction: "train", mode: "train", "": "" }, data,
                    //success
                    function (rx) {
                        if (rx) {
                            if (phase === 12) { phase++; SAM.multi_village_bot.phase = phase; save_localstorage(); setTimeout(quest_phase, quest_random2); }
                            else { phase++; SAM.multi_village_bot.phase = phase; save_localstorage(); setTimeout(quest_phase, quest_random); }
                        }
                    }
                    ,
                    //fail
                    function (ry) {
                        if (ry) { setTimeout(quest_phase, quest_random); }
                    })
            }
            function build(building) {
                var data = {};
                data["id"] = building;
                data["force"] = 1;
                data["destroy"] = 0;
                data["source"] = game_data.village.id;
                data.h = game_data.csrf;
                TribalWars.post("main", { ajaxaction: "upgrade_building", type: "main", "": "" }, data,
                    //success
                    function (rx) {
                        if (rx) {
                            BuildingMain.init_buildqueue("main");
                            BuildingMain.update_all(rx);
                            phase++; SAM.multi_village_bot.phase = phase; save_localstorage(); setTimeout(quest_phase, quest_random);
                        }
                    }
                    ,
                    //fail
                    function (ry) {
                        if (ry) { setTimeout(quest_phase, quest_random); }
                    })
            }
            function search_for_quest(quest) {
                var quests_current = document.getElementById("questlog")?.innerHTML.split('id="quest_');
                quests_current?.shift();
                for (let i = 0; i < quests_current.length; i++) {
                    var quests_current_num = +quests_current[i].split('" style')[0];
                    if (quests_current_num === quest) { quest_to_do = true; }
                }
            }

            async function find_barb() {
                var nearest_coordi = barb_finder();

                async function barb_finder() {
                    var villages = [];
                    var barbarians = [];
                    var barbariansWithDistance = [];
                    var filteredByRadiusBarbs;
                    var map_barb;

                    fetchVillagesData();

                    async function fetchVillagesData() {
                        $.get('map/village.txt', function (data) {
                            villages = CSVToArray(data);
                        })
                            .done(function () {
                                findBarbarianVillages();
                            })
                    }

                    async function findBarbarianVillages() {
                        villages.forEach((village) => {
                            if (village[4] == '0') {
                                barbarians.push(village);
                            }
                        });
                        await filterBarbs();
                    }

                    async function filterBarbs() {
                        var minPoints = 26;
                        var maxPoints = 12154;
                        var radius = 20;
                        var currentVillage = game_data.village.coord;

                        // Filter by min and max points
                        var filteredBarbs = barbarians.filter((barbarian) => {
                            return barbarian[5] >= minPoints && barbarian[5] <= maxPoints;
                        });

                        // Filter by radius
                        filteredByRadiusBarbs = filteredBarbs.filter((barbarian) => {
                            var barbCoord = barbarian[2] + '|' + barbarian[3];
                            var distance = calculateDistance(currentVillage, barbCoord);
                            if (distance <= radius) {
                                return barbarian;
                            }
                        });
                        await generateBarbariansTable(filteredByRadiusBarbs, currentVillage);
                        xx = +barbariansWithDistance[0][2];
                        yy = +barbariansWithDistance[0][3];
                        map_barb = xx + "|" + yy;
                        return map_barb;
                    }
                    // line up barbs by distance
                    function generateBarbariansTable(barbs, currentVillage) {
                        barbs.forEach((barb) => {
                            var barbCoord = barb[2] + '|' + barb[3];
                            var distance = calculateDistance(currentVillage, barbCoord);
                            barbariansWithDistance.push([...barb, distance]);
                        });

                        barbariansWithDistance.sort((a, b) => {
                            return a[7] - b[7];
                        });
                    }
                    // Helper: Calculate distance between 2 villages
                    function calculateDistance(from, to) {
                        var [x1, y1] = from.split('|');
                        var [x2, y2] = to.split('|');
                        var deltaX = Math.abs(x1 - x2);
                        var deltaY = Math.abs(y1 - y2);
                        let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                        distance = distance.toFixed(2);
                        return distance;
                    }
                    // Helper: Get Villages Coords Array
                    function getVillageCoord(villages) {
                        var villageCoords = [];
                        villages.forEach((village) => {
                            villageCoords.push(village[2] + '|' + village[3]);
                        });
                        return villageCoords;
                    }
                    //Helper: Convert CSV data into Array
                    function CSVToArray(strData, strDelimiter) {
                        strDelimiter = strDelimiter || ',';
                        var objPattern = new RegExp(
                            '(\\' + strDelimiter + '|\\r?\\n|\\r|^)' + '(?:"([^"]*(?:""[^"]*)*)"|' + '([^"\\' + strDelimiter + '\\r\\n]*))',
                            'gi'
                        );
                        var arrData = [[]];
                        var arrMatches = null;
                        while ((arrMatches = objPattern.exec(strData))) {
                            var strMatchedDelimiter = arrMatches[1];
                            if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
                                arrData.push([]);
                            }
                            var strMatchedValue;

                            if (arrMatches[2]) {
                                strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
                            } else {
                                strMatchedValue = arrMatches[3];
                            }
                            arrData[arrData.length - 1].push(strMatchedValue);
                        }
                        return arrData;
                    }
                }
            }
            async function attack(x, y, sereg) {
                var xa = x;
                var ya = y;
                async function getKey() {
                    $.get("game.php?village=" + game_data.village.id + "&screen=place", function (response) {
                        var parser = new DOMParser();
                        var dom = parser.parseFromString(response, "text/html");
                        var key = dom.querySelector("#command-data-form > input:nth-child(1)").getAttribute("name");
                        var value = dom.querySelector("#command-data-form > input:nth-child(1)").value;
                        var attack_name = dom.getElementById("target_attack").value;
                        var support_name = dom.getElementById("target_support").value;
                        prep_attack(key, value, attack_name);
                    })
                }
                getKey();
                async function prep_attack(key, value) {
                    var keya = key;
                    var valuea = value;
                    // Form data for entering the attack dialog
                    var data = [];
                    data.push({ name: key, value: value });
                    data.push({ name: "template_id", value: "" });
                    data.push({ name: "source_village", value: game_data.village.id });
                    if (sereg.spear !== undefined) { data.push({ name: "spear", value: sereg.spear }); }
                    if (sereg.sword !== undefined) { data.push({ name: "sword", value: sereg.sword }); }
                    if (sereg.axe !== undefined) { data.push({ name: "axe", value: sereg.axe }); }
                    if (sereg.archer !== undefined) { data.push({ name: "archer", value: sereg.archer }); }
                    if (sereg.spy !== undefined) { data.push({ name: "spy", value: sereg.spy }); }
                    if (sereg.light !== undefined) { data.push({ name: "light", value: sereg.light }); }
                    if (sereg.marcher !== undefined) { data.push({ name: "marcher", value: sereg.marcher }); }
                    if (sereg.heavy !== undefined) { data.push({ name: "heavy", value: sereg.heavy }); }
                    if (sereg.ram !== undefined) { data.push({ name: "ram", value: sereg.ram }); }
                    if (sereg.catapult !== undefined) { data.push({ name: "catapult", value: sereg.catapult }); }
                    if (sereg.knight !== undefined) { data.push({ name: "knight", value: sereg.knight }); }
                    if (sereg.snob !== undefined) { data.push({ name: "snob", value: sereg.snob }); }
                    data.push({ name: "x", value: xa });
                    data.push({ name: "y", value: ya });
                    data.push({ name: "input", value: "" });
                    data.push({ name: "attack", value: "l" });
                    data.push({ name: "h", value: game_data.csrf });

                    var url = "game.php?village=" + game_data.village.id + "&screen=place&ajax=confirm";
                    $.post(url, data).done(function (response) { // Post request to prepare attack
                        if (response.dialog.includes('name="ch" value="')) {
                            var ch = response.dialog.split('name="ch" value="')[1].split('" />')[0];
                            sendAttack(ch, sereg);
                        } else {
                            UI.ErrorMessage("Nincs elegendő sereg!");
                        }
                    });
                }
                async function sendAttack(ch, sereg) {
                    var url = "game.php?village=" + game_data.village.id + "&screen=place&ajaxaction=popup_command"/*&h=" +
            game_data.csrf + "&client_time" + Math.floor(Timing.getCurrentServerTime() / 1000);*/

                    if (sereg.spear !== undefined) { if (sereg.spear === "") { sereg.spear = 0; } }
                    if (sereg.sword !== undefined) { if (sereg.sword === "") { sereg.sword = 0; } }
                    if (sereg.axe !== undefined) { if (sereg.axe === "") { sereg.axe = 0; } }
                    if (sereg.archer !== undefined) { if (sereg.archer === "") { sereg.archer = 0; } }
                    if (sereg.spy !== undefined) { if (sereg.spy === "") { sereg.spy = 0; } }
                    if (sereg.light !== undefined) { if (sereg.light === "") { sereg.light = 0; } }
                    if (sereg.marcher !== undefined) { if (sereg.marcher === "") { sereg.marcher = 0; } }
                    if (sereg.heavy !== undefined) { if (sereg.heavy === "") { sereg.heavy = 0; } }
                    if (sereg.ram !== undefined) { if (sereg.ram === "") { sereg.ram = 0; } }
                    if (sereg.catapult !== undefined) { if (sereg.catapult === "") { sereg.catapult = 0; } }
                    if (sereg.knight !== undefined) { if (sereg.knight === "") { sereg.knight = 0; } }
                    if (sereg.snob !== undefined) { if (sereg.snob === "") { sereg.snob = 0; } }

                    // Form data to confirm attack, needs to be duplicated due to different order (ban prevention)
                    var data = [];
                    data.push({ name: "attack", value: true });
                    data.push({ name: "ch", value: ch });
                    data.push({ name: "cb", value: "troop_confirm_submit" });
                    data.push({ name: "x", value: xa });
                    data.push({ name: "y", value: ya });
                    data.push({ name: "source_village", value: game_data.village.id });
                    data.push({ name: "village", value: game_data.village.id });
                    data.push({ name: "attack_name", value: "" });
                    if (sereg.spear !== undefined) { data.push({ name: "spear", value: sereg.spear }); }
                    if (sereg.sword !== undefined) { data.push({ name: "sword", value: sereg.sword }); }
                    if (sereg.axe !== undefined) { data.push({ name: "axe", value: sereg.axe }); }
                    if (sereg.archer !== undefined) { data.push({ name: "archer", value: sereg.archer }); }
                    if (sereg.spy !== undefined) { data.push({ name: "spy", value: sereg.spy }); }
                    if (sereg.light !== undefined) { data.push({ name: "light", value: sereg.light }); }
                    if (sereg.marcher !== undefined) { data.push({ name: "marcher", value: sereg.marcher }); }
                    if (sereg.heavy !== undefined) { data.push({ name: "heavy", value: sereg.heavy }); }
                    if (sereg.ram !== undefined) { data.push({ name: "ram", value: sereg.ram }); }
                    if (sereg.catapult !== undefined) { data.push({ name: "catapult", value: sereg.catapult }); }
                    if (sereg.knight !== undefined) { data.push({ name: "knight", value: sereg.knight }); }
                    if (sereg.snob !== undefined) { data.push({ name: "snob", value: sereg.snob }); }
                    data.push({ name: "building", value: "main" });
                    data.push({ name: "h", value: game_data.csrf });
                    data.push({ name: "h", value: game_data.csrf });

                    $.post(url, data).done(function (response) { // Post request to send attack
                        if (response.includes("redirect")) {
                            UI.SuccessMessage("Támadás sikeresen elküldve!");
                            phase++; SAM.multi_village_bot.phase = phase; save_localstorage(); setTimeout(quest_phase, quest_random);
                        } else {
                            phase++; SAM.multi_village_bot.phase = phase; save_localstorage(); setTimeout(quest_phase, quest_random);
                        }
                    });
                }
            }
            function unlock_scav_quest() {
                var wait_scav_unlock = Math.floor(Math.random() * 350000 + 120000);
                $.get("game.php?village=" + game_data.village.id + "&screen=place&mode=scavenge", function (response) {
                    var wood = +document.getElementById("wood").innerText;
                    var stone = +document.getElementById("stone").innerText;
                    var iron = +document.getElementById("iron").innerText;
                    var xs = response.split("function(ScavengeScreen)")[1].split('base_id":');
                    xs.shift();
                    var gy_r_1 = xs[0].split('is_locked":')[1].split(',"unlock_time":')[0];
                    var gy_r_1_time = xs[0].split('is_locked":')[1].split(',"unlock_time":')[1].split(',"scavenging_squad"')[0];
                    var gy_r_2 = xs[1].split('is_locked":')[1].split(',"unlock_time":')[0];
                    var gy_r_2_time = xs[1].split('is_locked":')[1].split(',"unlock_time":')[1].split(',"scavenging_squad"')[0];
                    var gy_r_3 = xs[2].split('is_locked":')[1].split(',"unlock_time":')[0];
                    var gy_r_3_time = xs[2].split('is_locked":')[1].split(',"unlock_time":')[1].split(',"scavenging_squad"')[0];
                    if (gy_r_1 === "true") {
                        if (gy_r_1_time === "null") { unlock_scav_options(1); }
                        else { setTimeout(unlock_scav_quest, wait_scav_unlock); }
                    }
                    else if (gy_r_1 === "false" && gy_r_2 === "true") {
                        if (gy_r_2_time === "null" && wood > 250 && stone > 300 && iron > 250) { unlock_scav_options(2); }
                        else { setTimeout(unlock_scav_quest, wait_scav_unlock); }
                    }
                    else if (gy_r_1 === "false" && gy_r_2 === "false" && gy_r_3 === "true") {
                        if (gy_r_3_time === "null" && wood > 1000 && stone > 1200 && iron > 1000) { unlock_scav_options(3); }
                        else { setTimeout(unlock_scav_quest, wait_scav_unlock); }
                    }
                    else { setTimeout(unlock_scav_quest, wait_scav_unlock); }

                    function unlock_scav_options(gy_r) {
                        var data = {};
                        data["village_id"] = game_data.village.id;
                        data["option_id"] = gy_r;
                        data.h = game_data.csrf;
                        TribalWars.post("scavenge_api", { ajaxaction: "start_unlock" }, data)
                    }
                })
            }
        }
        function quest_system_new() {
            /*
         * fa 1 1000
         * agyag 1, vas 1 1005
         * fa 2, agyag 2 1010
         * főhadi 2 1015
         * fa 3, agyag 3 1020
         * főhadi 3, barakk 1 1025
         * barakk 2 1200
         * raktár 2, tanya 2 1030
         * lándzsás képzés 1db 1205
         * barbár támadása 1215
         * barakk 3 1210
         * lándzsás képzés 1db 1220
         * fa 4, agyag 4 1035
        */
            /*
        wood lv 1 /1000
        iron lv1
        stone lv 1 /1005
        wood lv 2
        stone lv 2 /1010
        main 2 /1015
        wood 3
        stone 3 /1020
        main 3
        barracks 1 /1025
        barracks 2 /1200
        storage 2
        farm 2 /1030
        barracks 3 /1210
        iron 2
        storage 3
        market 1
        market 2
        hide 2
        farm 3
        iron 3
        wall 1
        wall 2
        hide 3
        wood 4
        stone 4 /1035
        farm 4
        wall 3
        market 3
        wall 4
        storage 4
        hide 4
        storage 5
        wall 5
        hide 4
        hide 5
        farm 5
        market 4
        market 5
        market 6
        */

            var quest_start_random = Math.floor(Math.random() * 2000 + 600);
            var find_barb_random = Math.floor(Math.random() * 5000 + 5000);
            var unlock_scav_random = Math.floor(Math.random() * 5000 + 10000);
            var sereg = {};
            for (let i = 0; i < game_data.units.length; i++) {
                var unnit = game_data.units[i];
                if (unnit === "spear") { sereg.spear = 1; }
                if (unnit === "sword") { sereg.sword = ""; }
                if (unnit === "axe") { sereg.axe = "" }
                if (unnit === "archer") { sereg.archer = "" }
                if (unnit === "spy") { sereg.spy = "" }
                if (unnit === "light") { sereg.light = "" }
                if (unnit === "marcher") { sereg.marcher = "" }
                if (unnit === "heavy") { sereg.heavy = "" }
                if (unnit === "ram") { sereg.ram = "" }
                if (unnit === "catapult") { sereg.catapult = "" }
                if (unnit === "knight") { sereg.knight = "" }
                if (unnit === "snob") { sereg.snob = "" }
            }
            auto_building_finish();
            setTimeout(quest_phase, quest_start_random);
            setTimeout(find_barb, find_barb_random);
            setTimeout(unlock_scav_quest, unlock_scav_random);
            var xx, yy;
            var quest_random = Math.floor(Math.random() * 10000 + 5000);
            var quest_finish_delay = Math.floor(Math.random() * 1000 + 1000);
            setInterval(function () { quest_finish_delay = Math.floor(Math.random() * 1000 + 1000); }, 200)
            var quest_random2 = Math.floor(Math.random() * 20000 + 30000);
            var quest_wait_spear = Math.floor(Math.random() * 240000 + 720000);
            setInterval(function () { quest_random = Math.floor(Math.random() * 10000 + 5000); }, 200)
            var quest_to_do = false;
            async function quest_phase() {
                quest_to_do = false;
                var wood = +document.getElementById("wood").innerText;
                var stone = +document.getElementById("stone").innerText;
                var iron = +document.getElementById("iron").innerText;
                var build_start_que = $('[id="buildqueue"]').find('tr').length - 2;

                if (phase === 0 && build_start_que < 2) {
                    if (wood > 65 && stone > 50 && iron > 40) { build("wood"); setTimeout(quest_system_new_reward, quest_finish_delay); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 1 && build_start_que < 2) {
                    if (wood > 65 && stone > 50 && iron > 40) { build("stone"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 2 && build_start_que < 2) {
                    if (wood > 75 && stone > 65 && iron > 70) { get_quest_to_open(1005); build("iron"); setTimeout(quest_system_new_reward, quest_finish_delay); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 3 && build_start_que < 2) {
                    if (wood > 63 && stone > 77 && iron > 50) { build("wood"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 4 && build_start_que < 2) {
                    if (wood > 83 && stone > 63 && iron > 50) { get_quest_to_open(1010); build("stone"); setTimeout(quest_system_new_reward, quest_finish_delay); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 5 && build_start_que < 2) {
                    if (wood > 113 && stone > 102 && iron > 88) { get_quest_to_open(1015); build("main"); setTimeout(quest_system_new_reward, quest_finish_delay); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 6 && build_start_que < 2) {
                    if (wood > 78 && stone > 98 && iron > 62) { build("wood"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 7 && build_start_que < 2) {
                    if (wood > 105 && stone > 80 && iron > 62) { get_quest_to_open(1020); build("stone"); setTimeout(quest_system_new_reward, quest_finish_delay); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 8 && build_start_que < 2) {
                    if (wood > 143 && stone > 130 && iron > 111) { build("main"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 9 && build_start_que < 2) {
                    if (wood > 200 && stone > 170 && iron > 90) { get_quest_to_open(1025); build("barracks"); setTimeout(quest_system_new_reward, quest_finish_delay); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 10 && build_start_que < 2) {
                    if (wood > 252 && stone > 218 && iron > 113) { get_quest_to_open(1200); build("barracks"); setTimeout(quest_system_new_reward, quest_finish_delay); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 11 && build_start_que < 2) {
                    if (wood > 76 && stone > 64 && iron > 50) { build("storage"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 12 && build_start_que < 2) {
                    if (wood > 59 && stone > 53 && iron > 59) { get_quest_to_open(1030); build("farm"); setTimeout(quest_system_new_reward, quest_finish_delay); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 13) {
                    check_opened_quests(1205);
                    setTimeout(function () {
                        if (quest_to_do === true) {
                            if (wood > 50 && stone > 30 && iron > 10) { unit_train("spear"); setTimeout(quest_system_new_reward, quest_finish_delay); }
                            else { setTimeout(quest_phase, quest_random); }
                        }
                        else { get_quest_to_open(1205); setTimeout(quest_phase, quest_random); }
                    }, quest_finish_delay);
                }
                else if (phase === 14) {
                    check_opened_quests(1215);
                    setTimeout(function () {
                        if (quest_to_do === true) { find_barb(); setTimeout(function () { attack(xx, yy, sereg); setTimeout(quest_system_new_reward, quest_finish_delay); }, quest_finish_delay); }
                        else { get_quest_to_open(1215); setTimeout(quest_phase, quest_random); }
                    }, quest_finish_delay);
                }
                else if (phase === 15 && build_start_que < 2) {
                    if (wood > 318 && stone > 279 && iron > 143) { build("barracks"); setTimeout(quest_system_new_reward, quest_finish_delay); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 16) {
                    check_opened_quests(1220);
                    setTimeout(function () {
                        if (quest_to_do === true) {
                            if (wood > 50 && stone > 30 && iron > 10) { unit_train("spear"); setTimeout(quest_system_new_reward, quest_finish_delay); }
                            else { setTimeout(quest_phase, quest_random); }
                        }
                        else { get_quest_to_open(1220); setTimeout(quest_phase, quest_random); }
                    }, quest_finish_delay);
                }
                else if (phase === 17 && build_start_que < 2) {
                    if (wood > 94 && stone > 83 && iron > 87) { build("iron"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 18 && build_start_que < 2) {
                    if (wood > 96 && stone > 81 && iron > 62) { build("storage"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 19 && build_start_que < 2) {
                    if (wood > 100 && stone > 100 && iron > 100) { build("market"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 20 && build_start_que < 2) {
                    if (wood > 126 && stone > 127 && iron > 126) { build("market"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 21 && build_start_que < 2) {
                    if (wood > 63 && stone > 75 && iron > 63) { build("hide"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 22 && build_start_que < 2) {
                    if (wood > 76 && stone > 70 && iron > 50) { build("farm"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 23 && build_start_que < 2) {
                    if (wood > 118 && stone > 106 && iron > 108) { build("iron"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 24 && build_start_que < 2) {
                    if (wood > 50 && stone > 100 && iron > 20) { build("wall"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 25 && build_start_que < 2) {
                    if (wood > 63 && stone > 127 && iron > 25) { build("wall"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 26 && build_start_que < 2) {
                    if (wood > 78 && stone > 94 && iron > 78) { build("hide"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 27 && build_start_que < 2) {
                    if (wood > 98 && stone > 124 && iron > 77) { build("wood"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 28 && build_start_que < 2) {
                    if (wood > 133 && stone > 101 && iron > 76) { get_quest_to_open(1035); build("stone"); setTimeout(quest_system_new_reward, quest_finish_delay); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 29 && build_start_que < 2) {
                    if (wood > 99 && stone > 92 && iron > 64) { build("farm"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 30 && build_start_que < 2) {
                    if (wood > 79 && stone > 163 && iron > 32) { build("market"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 31 && build_start_que < 2) {
                    if (wood > 100 && stone > 207 && iron > 40) { build("wall"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 32 && build_start_que < 2) {
                    if (wood > 147 && stone > 135 && iron > 133) { build("iron"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 33) {
                    if (wood > 50 && stone > 30 && iron > 10) { unit_train("spear"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 34 && build_start_que < 2) {
                    if (wood > 121 && stone > 102 && iron > 77) { build("storage"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 35 && build_start_que < 2) {
                    if (wood > 98 && stone > 117 && iron > 98) { build("hide"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 36 && build_start_que < 2) {
                    if (wood > 154 && stone > 130 && iron > 96) { build("storage"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 37 && build_start_que < 2) {
                    if (wood > 126 && stone > 264 && iron > 50) { build("wall"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 38 && build_start_que < 2) {
                    if (wood > 122 && stone > 146 && iron > 122) { build("hide"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 39 && build_start_que < 2) {
                    if (wood > 129 && stone > 121 && iron > 83) { build("farm"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 40 && build_start_que < 2) {
                    if (wood > 159 && stone > 163 && iron > 159) { build("wall"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 41) {
                    if (wood > 50 && stone > 30 && iron > 10) { unit_train("spear"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 42 && build_start_que < 2) {
                    if (wood > 200 && stone > 207 && iron > 200) { build("market"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 43 && build_start_que < 2) {
                    if (wood > 252 && stone > 264 && iron > 252) { build("market"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 44) {
                    if (wood > 50 && stone > 30 && iron > 10) { unit_train("spear"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 45 && build_start_que < 2) {
                    if (wood > 318 && stone > 337 && iron > 318) { build("market"); }
                    else { setTimeout(quest_phase, quest_random); }
                }
                else if (phase === 46 || phase === 99) { phase = 99; SAM.multi_village_bot.phase = phase; save_localstorage(); window.location.reload(true); }
                else { setTimeout(quest_phase, quest_random); }
            }
            function knight_train() {
                var data = [
                    { name: "home", value: game_data.village.id },
                    { name: "name", value: "Paul" }
                ]
                TribalWars.post("statue", { ajaxaction: "recruit" }, data,
                    //success
                    function (rx) { if (rx) { phase++; SAM.multi_village_bot.phase = phase; save_localstorage(); setTimeout(quest_phase, quest_random); } }
                    ,
                    //fail
                    function (ry) {
                        if (ry) { setTimeout(quest_phase, quest_random); }
                    })
            }
            function unit_train(xa) {
                var data = [
                    { name: "units[" + xa + "]", value: 1 }
                ]
                TribalWars.post("barracks", { ajaxaction: "train", mode: "train", "": "" }, data,
                    //success
                    function (rx) {
                        if (rx) {
                            if (phase === 12) { phase++; SAM.multi_village_bot.phase = phase; save_localstorage(); setTimeout(quest_phase, quest_random2); }
                            else { phase++; SAM.multi_village_bot.phase = phase; save_localstorage(); setTimeout(quest_phase, quest_random); }
                        }
                    }
                    ,
                    //fail
                    function (ry) {
                        if (ry) { setTimeout(quest_phase, quest_random); }
                    })
            }
            function build(building) {
                var data = {};
                data["id"] = building;
                data["force"] = 1;
                data["destroy"] = 0;
                data["source"] = game_data.village.id;
                data.h = game_data.csrf;
                TribalWars.post("main", { ajaxaction: "upgrade_building", type: "main", "": "" }, data,
                    //success
                    function (rx) {
                        if (rx) {
                            BuildingMain.init_buildqueue("main");
                            BuildingMain.update_all(rx);
                            phase++; SAM.multi_village_bot.phase = phase; save_localstorage(); setTimeout(quest_phase, quest_random);
                        }
                    }
                    ,
                    //fail
                    function (ry) {
                        if (ry) { setTimeout(quest_phase, quest_random); }
                    })
            }
            function check_opened_quests(key) {
                TribalWars.get("quest", { ajax: "quest_popup", screen: "new_quests", tab: "main-tab", quest: 0, }, function (r) {
                    get_quest_unlocked_start();
                    function get_quest_unlocked_start() {
                        var data = r.dialog.split("Questlines.setQuests")[1].split("RewardSystem.setRewards")[0].split('"id":');
                        data.shift();
                        data.shift();
                        var ql = 0;
                        check_rewards();
                        function check_rewards() {
                            if (ql < data.length) {
                                var quest_number = +data[ql].split(",")[0];
                                var quest_number_opened = data[ql].split('"opened":')[1]?.split(',"finished')[0];
                                if (quest_number_opened === "true") {
                                    if (key === quest_number) { quest_to_do = true; }
                                }
                                ql++;
                                check_rewards();
                            }
                        }
                    }
                })
            }
            function get_quest_to_open(key) {
                TribalWars.get("quest", { ajax: "get_quest", screen: "new_quests", quest_id: key })
            }
            async function find_barb() {
                var nearest_coordi = barb_finder();

                async function barb_finder() {
                    var villages = [];
                    var barbarians = [];
                    var barbariansWithDistance = [];
                    var filteredByRadiusBarbs;
                    var map_barb;

                    fetchVillagesData();

                    async function fetchVillagesData() {
                        $.get('map/village.txt', function (data) {
                            villages = CSVToArray(data);
                        })
                            .done(function () {
                                findBarbarianVillages();
                            })
                    }

                    async function findBarbarianVillages() {
                        villages.forEach((village) => {
                            if (village[4] == '0') {
                                barbarians.push(village);
                            }
                        });
                        await filterBarbs();
                    }

                    async function filterBarbs() {
                        var minPoints = 26;
                        var maxPoints = 12154;
                        var radius = 20;
                        var currentVillage = game_data.village.coord;

                        // Filter by min and max points
                        var filteredBarbs = barbarians.filter((barbarian) => {
                            return barbarian[5] >= minPoints && barbarian[5] <= maxPoints;
                        });

                        // Filter by radius
                        filteredByRadiusBarbs = filteredBarbs.filter((barbarian) => {
                            var barbCoord = barbarian[2] + '|' + barbarian[3];
                            var distance = calculateDistance(currentVillage, barbCoord);
                            if (distance <= radius) {
                                return barbarian;
                            }
                        });
                        await generateBarbariansTable(filteredByRadiusBarbs, currentVillage);
                        xx = +barbariansWithDistance[0][2];
                        yy = +barbariansWithDistance[0][3];
                        map_barb = xx + "|" + yy;
                        return map_barb;
                    }
                    // line up barbs by distance
                    function generateBarbariansTable(barbs, currentVillage) {
                        barbs.forEach((barb) => {
                            var barbCoord = barb[2] + '|' + barb[3];
                            var distance = calculateDistance(currentVillage, barbCoord);
                            barbariansWithDistance.push([...barb, distance]);
                        });

                        barbariansWithDistance.sort((a, b) => {
                            return a[7] - b[7];
                        });
                    }
                    // Helper: Calculate distance between 2 villages
                    function calculateDistance(from, to) {
                        var [x1, y1] = from.split('|');
                        var [x2, y2] = to.split('|');
                        var deltaX = Math.abs(x1 - x2);
                        var deltaY = Math.abs(y1 - y2);
                        let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                        distance = distance.toFixed(2);
                        return distance;
                    }
                    // Helper: Get Villages Coords Array
                    function getVillageCoord(villages) {
                        var villageCoords = [];
                        villages.forEach((village) => {
                            villageCoords.push(village[2] + '|' + village[3]);
                        });
                        return villageCoords;
                    }
                    //Helper: Convert CSV data into Array
                    function CSVToArray(strData, strDelimiter) {
                        strDelimiter = strDelimiter || ',';
                        var objPattern = new RegExp(
                            '(\\' + strDelimiter + '|\\r?\\n|\\r|^)' + '(?:"([^"]*(?:""[^"]*)*)"|' + '([^"\\' + strDelimiter + '\\r\\n]*))',
                            'gi'
                        );
                        var arrData = [[]];
                        var arrMatches = null;
                        while ((arrMatches = objPattern.exec(strData))) {
                            var strMatchedDelimiter = arrMatches[1];
                            if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
                                arrData.push([]);
                            }
                            var strMatchedValue;

                            if (arrMatches[2]) {
                                strMatchedValue = arrMatches[2].replace(new RegExp('""', 'g'), '"');
                            } else {
                                strMatchedValue = arrMatches[3];
                            }
                            arrData[arrData.length - 1].push(strMatchedValue);
                        }
                        return arrData;
                    }
                }
            }
            async function attack(x, y, sereg) {
                var xa = x;
                var ya = y;
                async function getKey() {
                    $.get("game.php?village=" + game_data.village.id + "&screen=place", function (response) {
                        var parser = new DOMParser();
                        var dom = parser.parseFromString(response, "text/html");
                        var key = dom.querySelector("#command-data-form > input:nth-child(1)").getAttribute("name");
                        var value = dom.querySelector("#command-data-form > input:nth-child(1)").value;
                        var attack_name = dom.getElementById("target_attack").value;
                        var support_name = dom.getElementById("target_support").value;
                        prep_attack(key, value, attack_name);
                    })
                }
                getKey();
                async function prep_attack(key, value) {
                    var keya = key;
                    var valuea = value;
                    // Form data for entering the attack dialog
                    var data = [];
                    data.push({ name: key, value: value });
                    data.push({ name: "template_id", value: "" });
                    data.push({ name: "source_village", value: game_data.village.id });
                    if (sereg.spear !== undefined) { data.push({ name: "spear", value: sereg.spear }); }
                    if (sereg.sword !== undefined) { data.push({ name: "sword", value: sereg.sword }); }
                    if (sereg.axe !== undefined) { data.push({ name: "axe", value: sereg.axe }); }
                    if (sereg.archer !== undefined) { data.push({ name: "archer", value: sereg.archer }); }
                    if (sereg.spy !== undefined) { data.push({ name: "spy", value: sereg.spy }); }
                    if (sereg.light !== undefined) { data.push({ name: "light", value: sereg.light }); }
                    if (sereg.marcher !== undefined) { data.push({ name: "marcher", value: sereg.marcher }); }
                    if (sereg.heavy !== undefined) { data.push({ name: "heavy", value: sereg.heavy }); }
                    if (sereg.ram !== undefined) { data.push({ name: "ram", value: sereg.ram }); }
                    if (sereg.catapult !== undefined) { data.push({ name: "catapult", value: sereg.catapult }); }
                    if (sereg.knight !== undefined) { data.push({ name: "knight", value: sereg.knight }); }
                    if (sereg.snob !== undefined) { data.push({ name: "snob", value: sereg.snob }); }
                    data.push({ name: "x", value: xa });
                    data.push({ name: "y", value: ya });
                    data.push({ name: "input", value: "" });
                    data.push({ name: "attack", value: "l" });
                    data.push({ name: "h", value: game_data.csrf });

                    var url = "game.php?village=" + game_data.village.id + "&screen=place&ajax=confirm";
                    $.post(url, data).done(function (response) { // Post request to prepare attack
                        if (response.dialog.includes('name="ch" value="')) {
                            var ch = response.dialog.split('name="ch" value="')[1].split('" />')[0];
                            sendAttack(ch, sereg);
                        } else {
                            UI.ErrorMessage("Nincs elegendő sereg!");
                        }
                    });
                }
                async function sendAttack(ch, sereg) {
                    var url = "game.php?village=" + game_data.village.id + "&screen=place&ajaxaction=popup_command"/*&h=" +
            game_data.csrf + "&client_time" + Math.floor(Timing.getCurrentServerTime() / 1000);*/

                    if (sereg.spear !== undefined) { if (sereg.spear === "") { sereg.spear = 0; } }
                    if (sereg.sword !== undefined) { if (sereg.sword === "") { sereg.sword = 0; } }
                    if (sereg.axe !== undefined) { if (sereg.axe === "") { sereg.axe = 0; } }
                    if (sereg.archer !== undefined) { if (sereg.archer === "") { sereg.archer = 0; } }
                    if (sereg.spy !== undefined) { if (sereg.spy === "") { sereg.spy = 0; } }
                    if (sereg.light !== undefined) { if (sereg.light === "") { sereg.light = 0; } }
                    if (sereg.marcher !== undefined) { if (sereg.marcher === "") { sereg.marcher = 0; } }
                    if (sereg.heavy !== undefined) { if (sereg.heavy === "") { sereg.heavy = 0; } }
                    if (sereg.ram !== undefined) { if (sereg.ram === "") { sereg.ram = 0; } }
                    if (sereg.catapult !== undefined) { if (sereg.catapult === "") { sereg.catapult = 0; } }
                    if (sereg.knight !== undefined) { if (sereg.knight === "") { sereg.knight = 0; } }
                    if (sereg.snob !== undefined) { if (sereg.snob === "") { sereg.snob = 0; } }

                    // Form data to confirm attack, needs to be duplicated due to different order (ban prevention)
                    var data = [];
                    data.push({ name: "attack", value: true });
                    data.push({ name: "ch", value: ch });
                    data.push({ name: "cb", value: "troop_confirm_submit" });
                    data.push({ name: "x", value: xa });
                    data.push({ name: "y", value: ya });
                    data.push({ name: "source_village", value: game_data.village.id });
                    data.push({ name: "village", value: game_data.village.id });
                    data.push({ name: "attack_name", value: "" });
                    if (sereg.spear !== undefined) { data.push({ name: "spear", value: sereg.spear }); }
                    if (sereg.sword !== undefined) { data.push({ name: "sword", value: sereg.sword }); }
                    if (sereg.axe !== undefined) { data.push({ name: "axe", value: sereg.axe }); }
                    if (sereg.archer !== undefined) { data.push({ name: "archer", value: sereg.archer }); }
                    if (sereg.spy !== undefined) { data.push({ name: "spy", value: sereg.spy }); }
                    if (sereg.light !== undefined) { data.push({ name: "light", value: sereg.light }); }
                    if (sereg.marcher !== undefined) { data.push({ name: "marcher", value: sereg.marcher }); }
                    if (sereg.heavy !== undefined) { data.push({ name: "heavy", value: sereg.heavy }); }
                    if (sereg.ram !== undefined) { data.push({ name: "ram", value: sereg.ram }); }
                    if (sereg.catapult !== undefined) { data.push({ name: "catapult", value: sereg.catapult }); }
                    if (sereg.knight !== undefined) { data.push({ name: "knight", value: sereg.knight }); }
                    if (sereg.snob !== undefined) { data.push({ name: "snob", value: sereg.snob }); }
                    data.push({ name: "building", value: "main" });
                    data.push({ name: "h", value: game_data.csrf });
                    data.push({ name: "h", value: game_data.csrf });

                    $.post(url, data).done(function (response) { // Post request to send attack
                        if (response.includes("redirect")) {
                            UI.SuccessMessage("Támadás sikeresen elküldve!");
                            phase++; SAM.multi_village_bot.phase = phase; save_localstorage(); setTimeout(quest_phase, quest_random);
                        } else {
                            phase++; SAM.multi_village_bot.phase = phase; save_localstorage(); setTimeout(quest_phase, quest_random);
                        }
                    });
                }
            }
            function unlock_scav_quest() {
                var wait_scav_unlock = Math.floor(Math.random() * 350000 + 120000);
                $.get("game.php?village=" + game_data.village.id + "&screen=place&mode=scavenge", function (response) {
                    var wood = +document.getElementById("wood").innerText;
                    var stone = +document.getElementById("stone").innerText;
                    var iron = +document.getElementById("iron").innerText;
                    var xs = response.split("function(ScavengeScreen)")[1].split('base_id":');
                    xs.shift();
                    var gy_r_1 = xs[0].split('is_locked":')[1].split(',"unlock_time":')[0];
                    var gy_r_1_time = xs[0].split('is_locked":')[1].split(',"unlock_time":')[1].split(',"scavenging_squad"')[0];
                    var gy_r_2 = xs[1].split('is_locked":')[1].split(',"unlock_time":')[0];
                    var gy_r_2_time = xs[1].split('is_locked":')[1].split(',"unlock_time":')[1].split(',"scavenging_squad"')[0];
                    var gy_r_3 = xs[2].split('is_locked":')[1].split(',"unlock_time":')[0];
                    var gy_r_3_time = xs[2].split('is_locked":')[1].split(',"unlock_time":')[1].split(',"scavenging_squad"')[0];
                    if (gy_r_1 === "true") {
                        if (gy_r_1_time === "null") { unlock_scav_options(1); }
                        else { setTimeout(unlock_scav_quest, wait_scav_unlock); }
                    }
                    else if (gy_r_1 === "false" && gy_r_2 === "true") {
                        if (gy_r_2_time === "null" && wood > 250 && stone > 300 && iron > 250) { unlock_scav_options(2); }
                        else { setTimeout(unlock_scav_quest, wait_scav_unlock); }
                    }
                    else if (gy_r_1 === "false" && gy_r_2 === "false" && gy_r_3 === "true") {
                        if (gy_r_3_time === "null" && wood > 1000 && stone > 1200 && iron > 1000) { unlock_scav_options(3); }
                        else { setTimeout(unlock_scav_quest, wait_scav_unlock); }
                    }
                    else { setTimeout(unlock_scav_quest, wait_scav_unlock); }

                    function unlock_scav_options(gy_r) {
                        var data = {};
                        data["village_id"] = game_data.village.id;
                        data["option_id"] = gy_r;
                        data.h = game_data.csrf;
                        TribalWars.post("scavenge_api", { ajaxaction: "start_unlock" }, data)
                    }
                })
            }
        }
        function inventory() {
            async function get_inventory() {
                TribalWars.get("api", { ajax: "get_inventory", screen: "inventory", }, function (response) {
                    var items = response.inventory;
                    var inventory_delay = Math.floor(Math.random() * 8000 + 800);

                    for (var key in items) {
                        if (key.includes("1000")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1001")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1002")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1003")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1004")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1005")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1006")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1007")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1008")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1009")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1010")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1011")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1012")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1013")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1014")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1015")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1016")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1017")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1018")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1019")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1020")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        if (key.includes("1021")) {
                            inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(consume_pack(key), inventory_delay);
                        }
                        function consume_pack(key) {
                            var amount = response.inventory[key].amount;
                            var data = [
                                { name: "item_key", value: key },
                                { name: "amount", value: amount }
                            ]
                            var inventory_delay = Math.floor(Math.random() * 8000 + 800);
                            setTimeout(post_consume, inventory_delay);
                            function post_consume() {
                                TribalWars.post("inventory", { ajaxaction: "consume" }, data)
                            }
                        }
                    }
                })
            }
            get_inventory();
        }
        function daily_reward() {
            async function get_daily() {
                TribalWars.get("daily_bonus", { ajax: "widget", screen: "daily_bonus", }, function (response) {
                    var data = response.dialog;
                    var split = data.split("day");
                    var split_length = split.length;
                    for (let i = 0; i < split_length; i++) {
                        var search = split[i].substring(2, 3);
                        if (search === "1" || search === "2" || search === "3" || search === "4" || search === "5" || search === "6" || search === "7" || search === "8" || search === "9") {
                            var locked = split[i].split("is_locked")[1]?.split("is_collected")[0]?.substring(0, 9).search("false");
                            var collected = split[i].split("is_locked")[1]?.split("is_collected")[1].substring(0, 9).search("false");
                            var that_day = split[i].substring(2, 3);
                            if (locked > 0 && collected > 0) {
                                var inventory_delay = Math.floor(Math.random() * 3000 + 200);
                                setTimeout(consume_daily(that_day), inventory_delay);
                            }
                        }
                    }
                    function consume_daily(that_day) {
                        var data = [
                            { name: "day", value: that_day },
                            { name: "from_screen", value: "profile" }
                        ]
                        setTimeout(post_consume_daily, inventory_delay);
                        function post_consume_daily() {
                            TribalWars.post("daily_bonus", { ajaxaction: "open" }, data)
                        }
                    }
                })
            }
            get_daily();
        }

        function humanize() {
            "INSERT_LICENSE_CHECK_HERE"
            var links = [
                "screen=ally",
                "screen=inventory",
                "screen=ranking",
                "screen=ranking&mode=con_player",
                "screen=ranking&mode=in_a_day&type=scavenge",
                "screen=ranking&mode=in_a_day&type=loot_res",
                "screen=ranking&mode=in_a_day&type=loot_vil",
                "screen=info_player&mode=awards",
                "screen=info_player&mode=stats_own",
                "screen=report",
            ];
            if (emberi_mozzanatok === 1 && barbar_faluk_kosozasa === 0) { links.push("screen=map"); }

            var ido_mostan = Date.now();
            var link_szam = links.length - 1;
            var link_random = Math.round(Math.random() * link_szam);
            var randelay = Math.floor((Math.random() * 120000) + 50000); // ms
            var kor_hatra = vezerlo.next_kor - ido_mostan;

            if (emberi_mozzanatok === 1 && kor_hatra > 200000) {
                setTimeout(function () { self.location = game_data.link_base_pure.replace(/screen\=\w*/i, links[link_random]); }, randelay);
            }
            else if (emberi_mozzanatok === 1 && kor_hatra <= 200000) {
                if (kor_hatra > 0) { setTimeout(tovabblepes, kor_hatra); }
                else if (kor_hatra <= 0) { tovabblepes(); }
            }
            else { }
        }
        function tribe_stat() {
            $.getScript("https://shinko-to-kuma.com/scripts/tribeStats.js");
        }
        function mass_scav_unlock() {
            "INSERT_LICENSE_CHECK_HERE"
            function mass_scav_unlock_set() {
                var scriptData = {
                    name: 'Mass Scavenging Unlock',
                    version: 'v1.0',
                    author: '-Sam',
                    authorUrl: 'sztsam3@gmail.com',
                    helpLink: 'https://discord.gg/JGEs2729br',
                };

                // User Input
                if (typeof DEBUG !== 'boolean') var DEBUG = false;

                // Define main mass scav url
                if (game_data.player.sitter > 0) {
                    var URLReq = `game.php?t=${game_data.player.id}&screen=place&mode=scavenge_mass`;
                } else {
                    URLReq = 'game.php?&screen=place&mode=scavenge_mass';
                }

                // Translations
                var translations = {
                    en_DK: {
                        'Mass Scavenging Unlock': 'Mass Scavenging Unlock',
                        Help: 'Help',
                        'Premium Account is required for this script to run!': 'Premium Account is required for this script to run!',
                        'Mass Scavenging Unlock script is running!': 'Mass Scavenging Unlock script is running!',
                        'Collecting scavenging options ...': 'Collecting scavenging options ...',
                        'All scavenging options are unlocked!': 'All scavenging options are unlocked!',
                        'Start Mass Unlock': 'Start Mass Unlock',
                        'Possible unlocks:': 'Possible unlocks:',
                        'Village Name': 'Village Name',
                        Actions: 'Actions',
                        Unlock: 'Unlock',
                        'Script finished working!': 'Script finished working!',
                    },
                    en_US: {
                        'Mass Scavenging Unlock': 'Mass Scavenging Unlock',
                        Help: 'Help',
                        'Premium Account is required for this script to run!': 'Premium Account is required for this script to run!',
                        'Mass Scavenging Unlock script is running!': 'Mass Scavenging Unlock script is running!',
                        'Collecting scavenging options ...': 'Collecting scavenging options ...',
                        'All scavenging options are unlocked!': 'All scavenging options are unlocked!',
                        'Start Mass Unlock': 'Start Mass Unlock',
                        'Possible unlocks:': 'Possible unlocks:',
                        'Village Name': 'Village Name',
                        Actions: 'Actions',
                        Unlock: 'Unlock',
                        'Script finished working!': 'Script finished working!',
                    },
                    hu_HU: {
                        'Mass Scavenging Unlock': 'Tömeges gyűjtögetés feloldás',
                        Help: 'Segítség',
                        'Premium Account is required for this script to run!': 'Prémium fiók szükséges a sript futtatásához!',
                        'Mass Scavenging Unlock script is running!': 'Tömeges gyűjtögetés feloldó script fut!',
                        'Collecting scavenging options ...': 'Gyűjtögetési opciók begyűjtése ...',
                        'All scavenging options are unlocked!': 'Minden gyűjtögetési opció feloldva!',
                        'Start Mass Unlock': 'Tömeges feloldás indítása',
                        'Possible unlocks:': 'Elérhető feloldás:',
                        'Village Name': 'Falu Név',
                        Actions: 'Műveletek',
                        Unlock: 'Felold',
                        'Script finished working!': 'A script befejezte a működést!',
                    },
                };

                // Init Debug
                initDebug();

                // Init Translations Notice
                initTranslationsNotice();

                // Initialize mass scavenging unlock
                function initMassScavengeUnlock() {
                    UI.SuccessMessage(tt('Mass Scavenging Unlock script is running!'));
                    var amountOfPages;
                    var URLs = [];

                    $.get(URLReq, function () {
                        if ($('.paged-nav-item').length > 0) {
                            amountOfPages = parseInt(
                                $('.paged-nav-item')[$('.paged-nav-item').length - 1].href.match(/page=(\d+)/)[1]
                            );
                        } else {
                            amountOfPages = 0;
                        }
                        for (var i = 0; i <= amountOfPages; i++) {
                            URLs.push(URLReq + '&page=' + i);
                        }
                    })
                        .done(function () {
                            var thisPageData;
                            let arrayWithData = '[';
                            $.getAll(
                                URLs,
                                (_, data) => {
                                    UI.SuccessMessage(tt('Collecting scavenging options ...'));
                                    thisPageData = $(data)
                                        .find('script:contains("ScavengeMassScreen")')
                                        .html()
                                        .match(/\{.*\:\{.*\:.*\}\}/g)[2];
                                    arrayWithData += thisPageData + ',';
                                },
                                () => {
                                    arrayWithData = arrayWithData.substring(0, arrayWithData.length - 1);
                                    arrayWithData += ']';

                                    const scavengingInfo = JSON.parse(arrayWithData);
                                    const scavengeTable = [];

                                    scavengingInfo.forEach((scavObj) => {
                                        if (DEBUG) {
                                            console.debug(`${scriptInfo()} scavObj:`, scavObj);
                                        }

                                        const { village_id, options } = scavObj;
                                        const validOptions = [];
                                        for (let [_, value] of Object.entries(options)) {
                                            if (value.is_locked === true && value.unlock_time === null) {
                                                validOptions.push(value.base_id);
                                            }
                                        }
                                        if (validOptions.length > 0) {
                                            scavengeTable.push({
                                                village_id: village_id,
                                                option_id: validOptions.sort()[0],
                                                village: scavObj,
                                            });
                                        }
                                    });

                                    if (DEBUG) {
                                        console.debug(`${scriptInfo()} scavengeTable :`, scavengeTable);
                                    }

                                    if (scavengeTable.length === 0) {
                                        UI.SuccessMessage(tt('All scavenging options are unlocked!'));
                                    } else {
                                        let htmlString = `
							<table class="ra-table vis" width="100%">
								<thead>
									<th class="ra-text-left">
										${tt('Village Name')}
									</th>
									<th>
										${tt('Actions')}
									</th>
								</thead>
								<tbody>
						`;

                                        scavengeTable.forEach((scavItem) => {
                                            const { option_id, village } = scavItem;
                                            const { village_id, village_name } = village;
                                            htmlString += `
								<tr data-row-village-id="${village_id}">
									<td>
										<a href="/game.php?screen=info_village&id=${village_id}" rel="noreferrer noopener" target="_blank">
											${village_name}
										</a>
									</td>
									<td class="ra-text-center">
										<a href="#" class="btn btn-single-scav" data-village-id="${village_id}" data-option-id="${option_id}">
											${tt('Unlock')} #${option_id}
										</a>
									</td>
								</tr>
							`;
                                        });

                                        htmlString += `
								</tbody>
							</table>
						`;

                                        const content = `
							<div class="ra-mb14">
								<p><b>${tt('Possible unlocks:')}</b> ${scavengeTable.length}</p>
								<a href="javascript" class="btn btn-confirm-yes" id="startMassUnlock">
									${tt('Start Mass Unlock')}
								</a>
							</div>
							<h4 style="display:none;" class="ra-success-message ra-mb14">
								<b>${tt('Script finished working!')}</b>
							</h4>
							<div class="ra-villages-container">
								${htmlString}
							</div>
						`;

                                        renderIncomingsOverviewUI(content);

                                        // action handlers
                                        unlockScavOption();

                                        $('#startMassUnlock').on('click', function (e) {
                                            e.preventDefault();
                                            $(this).attr('disabled', 'disabled');
                                            scavengeTable.forEach((scavengeItem, i) => {
                                                setTimeout(() => {
                                                    const { village_id, option_id } = scavengeItem;
                                                    TribalWars.post(
                                                        'scavenge_api',
                                                        { ajaxaction: 'start_unlock' },
                                                        {
                                                            village_id: village_id,
                                                            option_id: option_id,
                                                        }
                                                    );
                                                    $(`.ra-table tr[data-row-village-id="${village_id}"]`).addClass(
                                                        'ra-already-unlocked'
                                                    );
                                                    //console.debug(
                                                    //    `${scriptInfo()} Unlocked Scavenging Option ${option_id} for village: ${village_id}`
                                                    //);
                                                    if (scavengeTable.length === i + 1) {
                                                        $(this).removeAttr('disabled');
                                                        $('.ra-success-message').show();
                                                    }
                                                }, 400 * i);
                                            });
                                        });
                                    }
                                },
                                (error) => {
                                    //console.error(error);
                                }
                            );
                        });
                }

                $.getAll = function (
                    urls, // array of URLs
                    onLoad, // called when any URL is loaded, params (index, data)
                    onDone, // called when all URLs successfully loaded, no params
                    onError // called when a URL load fails or if onLoad throws an exception, params (error)
                ) {
                    var numDone = 0;
                    var lastRequestTime = 0;
                    var minWaitTime = 250; // ms between requests
                    loadNext();
                    function loadNext() {
                        if (numDone == urls.length) {
                            onDone();
                            return;
                        }

                        let now = Date.now();
                        let timeElapsed = now - lastRequestTime;
                        if (timeElapsed < minWaitTime) {
                            let timeRemaining = minWaitTime - timeElapsed;
                            setTimeout(loadNext, timeRemaining);
                            return;
                        }
                        lastRequestTime = now;
                        $.get(urls[numDone])
                            .done((data) => {
                                try {
                                    onLoad(numDone, data);
                                    ++numDone;
                                    loadNext();
                                } catch (e) {
                                    onError(e);
                                }
                            })
                            .fail((xhr) => {
                                onError(xhr);
                            });
                    }
                };

                // Render UI
                function renderIncomingsOverviewUI(body) {
                    const content = `
		<div class="ra-mass-scav-unlock vis" id="raMassScavUnlock">
            <h3>${tt(scriptData.name)}</h3>
            <div class="ra-mass-scav-unlock-content">
                ${body}
            </div>
            <br>
            <small>
                <strong>
                    ${tt(scriptData.name)} ${scriptData.version}
                </strong> -
                <a href="${scriptData.authorUrl}" target="_blank" rel="noreferrer noopener">
                    ${scriptData.author}
                </a> -
                <a href="${scriptData.helpLink}" target="_blank" rel="noreferrer noopener">
                    ${tt('Help')}
                </a>
			</small>
			<a class="popup_box_close custom-close-button" onClick="closeDraggableEl();" href="#">&nbsp;</a>
        </div>
        <style>
            .ra-mass-scav-unlock { position: fixed; z-index: 99999; top: 10vh; right: 10vw; display: block; width: 500px; height: auto; clear: both; margin: 0 auto 15px; padding: 10px; border: 1px solid #603000; box-sizing: border-box; background: #f4e4bc; }
			.ra-mass-scav-unlock * { box-sizing: border-box; }
			.custom-close-button { right: 0; top: 0; }
			.ra-mb14 { margin-bottom: 14px; }
			.ra-table { border-spacing: 2px; border-collapse: separate; border: 2px solid #f0e2be; }
			.ra-table th { text-align: center; }
            .ra-table td { padding: 1px 2px; }
            .ra-table td a { word-break: break-all; }
			.ra-table tr:nth-of-type(2n) td { background-color: #f0e2be }
			.ra-table tr:nth-of-type(2n+1) td { background-color: #fff5da; }
			.ra-text-left { text-align: left !important; }
			.ra-text-center { text-align: center; }
			.ra-villages-container { max-height: 300px; overflow-y: auto; overflow-x: hidden; }
			.ra-already-unlocked { opacity: 0.7; pointer-events: none; }
        </style>
    `;

                    if ($('#raMassScavUnlock').length < 1) {
                        $('body').append(content);
                        $('#raMassScavUnlock').draggable();
                    } else {
                        $('.ra-mass-scav-unlock-content').html(body);
                    }
                }

                // Helper: Unlock Scavenging Option
                function unlockScavOption() {
                    $('.btn-single-scav').on('click', function (e) {
                        e.preventDefault();
                        $(this).attr('disabled', 'disabled');
                        const villageId = $(this).attr('data-village-id');
                        const optionId = $(this).attr('data-option-id');
                        TribalWars.post(
                            'scavenge_api',
                            { ajaxaction: 'start_unlock' },
                            {
                                village_id: villageId,
                                option_id: optionId,
                            }
                        );
                        $(this).parent().parent().addClass('ra-already-unlocked');
                    });
                }

                // Helper: Close draggable element
                function closeDraggableEl() {
                    $('#raMassScavUnlock').remove();
                }

                // Helper: Get parameter by name
                function getParameterByName(name, url = window.location.href) {
                    return new URL(url).searchParams.get(name);
                }

                // Helper: Generates script info
                function scriptInfo() {
                    return `[${scriptData.name} ${scriptData.version}]`;
                }

                // Helper: Prints universal debug information
                function initDebug() {
                    //console.debug(`${scriptInfo()} It works ðŸš€!`);
                    //console.debug(`${scriptInfo()} HELP:`, scriptData.helpLink);
                    if (DEBUG) {
                        console.debug(`${scriptInfo()} Market:`, game_data.market);
                        console.debug(`${scriptInfo()} World:`, game_data.world);
                        console.debug(`${scriptInfo()} Screen:`, game_data.screen);
                        console.debug(`${scriptInfo()} Game Version:`, game_data.majorVersion);
                        console.debug(`${scriptInfo()} Game Build:`, game_data.version);
                        console.debug(`${scriptInfo()} Locale:`, game_data.locale);
                        console.debug(`${scriptInfo()} Premium:`, game_data.features.Premium.active);
                    }
                }

                // Helper: Text Translator
                function tt(string) {
                    var gameLocale = game_data.locale;

                    if (translations[gameLocale] !== undefined) {
                        return translations[gameLocale][string];
                    } else {
                        return translations['en_DK'][string];
                    }
                }

                // Helper: Translations Notice
                function initTranslationsNotice() {
                    const gameLocale = game_data.locale;

                    if (translations[gameLocale] === undefined) {
                        UI.ErrorMessage(
                            `No translation found for <b>${gameLocale}</b>. <a href="${scriptData.helpLink}" class="btn" target="_blank" rel="noreferrer noopener">Add Yours</a> by replying to the thread.`,
                            4000
                        );
                    }
                }

                // Initialize Script
                (function () {
                    if (game_data.features.Premium.active) {
                        const gameScreen = getParameterByName('screen');
                        const gameMode = getParameterByName('mode');

                        if (gameScreen === 'place' && gameMode === 'scavenge_mass') {
                            initMassScavengeUnlock();
                        } else {
                            window.location.assign(game_data.link_base_pure + 'place&mode=scavenge_mass');
                        }
                    } else {
                        UI.ErrorMessage(tt('Premium Account is required for this script to run!'));
                    }
                })();
            }
            function mass_scav_unlock_go() {
                document.getElementById("startMassUnlock").click();
                wait_for_success();
            }
            function wait_for_success() {
                if (document.getElementsByClassName("ra-success-message ra-mb14")[0].style.display === "none") { setTimeout(wait_for_success, 500); }
                else { tovabblepes(); }
                var dellay = Math.floor((Math.random() * 10000) + 25000); // ms
                setTimeout(tovabblepes, dellay);
            }
            mass_scav_unlock_set();
            var delay = Math.floor((Math.random() * 8000) + 8000); // ms
            setTimeout(mass_scav_unlock_go, delay);
        }
        function mass_scav() {
            "INSERT_LICENSE_CHECK_HERE"
            function mass_scav_set() {
                var premiumBtnEnabled = tomeges_gyujtogetes_premiummal;
                $.getScript('https://shinko-to-kuma.com/scripts/massScavenge.js');
            }
            function mass_scav_go_link() {
                var spear = document.getElementById("imgRow").cells[0].children[0].rows[1].cells[0].children[0];
                var sword = document.getElementById("imgRow").cells[1].children[0].rows[1].cells[0].children[0];
                var axe = document.getElementById("imgRow").cells[2].children[0].rows[1].cells[0].children[0];
                var archer = document.getElementById("imgRow").cells[3].children[0].rows[1].cells[0].children[0];
                var light = document.getElementById("imgRow").cells[4].children[0].rows[1].cells[0].children[0];
                var marcher = document.getElementById("imgRow").cells[5].children[0].rows[1].cells[0].children[0];
                var heavy = document.getElementById("imgRow").cells[6].children[0].rows[1].cells[0].children[0];

                if (spear.checked === true && tomeges_landzsa === 0) { spear.click(); }
                else if (spear.checked === false && tomeges_landzsa === 1) { spear.click(); }
                if (sword.checked === true && tomeges_kardos === 0) { sword.click(); }
                else if (sword.checked === false && tomeges_kardos === 1) { sword.click(); }
                if (axe.checked === true && tomeges_bardos === 0) { axe.click(); }
                else if (axe.checked === false && tomeges_bardos === 1) { axe.click(); }
                if (archer.checked === true && tomeges_ijasz === 0) { archer.click(); }
                else if (archer.checked === false && tomeges_ijasz === 1) { archer.click(); }
                if (light.checked === true && tomeges_konnyulo === 0) { light.click(); }
                else if (light.checked === false && tomeges_konnyulo === 1) { light.click(); }
                if (marcher.checked === true && tomeges_lovasij === 0) { marcher.click(); }
                else if (marcher.checked === false && tomeges_lovasij === 1) { marcher.click(); }
                if (heavy.checked === true && tomeges_nehezlo === 0) { heavy.click(); }
                else if (heavy.checked === false && tomeges_nehezlo === 1) { heavy.click(); }

                document.getElementById("imgRow").cells[0].children[0].rows[3].cells[0].children[0].value = tomeges_landzsa_faluban_marad;
                document.getElementById("imgRow").cells[1].children[0].rows[3].cells[0].children[0].value = tomeges_kardos_faluban_marad;
                document.getElementById("imgRow").cells[2].children[0].rows[3].cells[0].children[0].value = tomeges_bardos_faluban_marad;
                document.getElementById("imgRow").cells[3].children[0].rows[3].cells[0].children[0].value = tomeges_ijasz_faluban_marad;
                document.getElementById("imgRow").cells[4].children[0].rows[3].cells[0].children[0].value = tomeges_konnyulo_faluban_marad;
                document.getElementById("imgRow").cells[5].children[0].rows[3].cells[0].children[0].value = tomeges_lovasij_faluban_marad;
                document.getElementById("imgRow").cells[6].children[0].rows[3].cells[0].children[0].value = tomeges_nehezlo_faluban_marad;

                document.getElementById("timeSelectorHours").click();
                document.getElementsByClassName("runTime_off")[0].value = tomeges_gyujtogetes_tamadobol_ideje;
                document.getElementsByClassName("runTime_def")[0].value = tomeges_gyujtogetes_vedobol_ideje;
                document.getElementById("settingPriorityBalanced").click();

                var dellay = Math.floor((Math.random() * 2000) + 2000); // ms
                setTimeout(function () {
                    document.getElementById("sendMass").focus();
                    document.getElementById("sendMass").click();
                }, dellay);
            }
            function mass_scav_go_link_go() {
                var delay = Math.floor((Math.random() * 8000) + 8000); // ms
                var mass_scav_start_buttons = document.querySelectorAll("input[id='sendMass']");
                var mass_scav_start_buttons_length = mass_scav_start_buttons.length;
                mass_scav_start_buttons.forEach(function (x, index) {
                    setTimeout(function () { x.click(); }, delay * index)
                    if (index === mass_scav_start_buttons_length - 1) { setTimeout(tovabblepes, delay * (index + 1)) }
                    else { tovabblepes(); }
                })
            }
            mass_scav_set();
            var delay = Math.floor((Math.random() * 2000) + 3000); // ms
            var delay2 = Math.floor((Math.random() * 6000) + 9000); // ms
            var delay3 = Math.floor((Math.random() * 20000) + 40000); // ms
            setTimeout(mass_scav_go_link, delay);
            setTimeout(mass_scav_go_link_go, delay2);
            setTimeout(tovabblepes, delay3);
        }
        function mass_destroy_wall() {
            function mass_destroy_wall_set() {
                var scriptData = {
                    name: 'Clear Barbarian Walls',
                    version: 'v1.3.2',
                    author: '-Sam',
                    authorUrl: 'sam@tw-premium.site',
                    helpLink: 'https://discord.gg/JGEs2729br',
                };

                // Globals
                var ALLOWED_GAME_SCREENS = ['map']; // list of game screens where script can be executed
                var COORDS_REGEX = /[0-9]{1,3}\|[0-9]{1,3}/g; // regex for coordinates

                if (typeof TWMap === 'undefined') var TWMap = {};
                if ('TWMap' in window) var mapOverlay = TWMap;

                // Data Store Config
                var STORAGE_KEY = 'RA_CBW_STORE'; // key for sessionStorage
                var DEFAULT_STATE = {
                    MAX_BARBARIANS: 100,
                    MAX_FA_PAGES_TO_FETCH: 20,
                    WALL_LEVEL: 1,
                    PARTIAL_LOSSES_REPORTS: true,
                };

                // Translations
                var translations = {
                    en_DK: {
                        'Clear Barbarian Walls': 'Clear Barbarian Walls',
                        Help: 'Help',
                        'This script requires PA and FA to be active!': 'This script requires PA and FA to be active!',
                        'Redirecting...': 'Redirecting...',
                        'Fetching FA pages...': 'Fetching FA pages...',
                        'Finished fetching FA pages!': 'Finished fetching FA pages!',
                        Fetching: 'Fetching',
                        'No barbarian villages found fitting the criteria!': 'No barbarian villages found fitting the criteria!',
                        Type: 'Type',
                        Barbarian: 'Barbarian',
                        Report: 'Report',
                        Distance: 'Distance',
                        Wall: 'Wall',
                        'Last Attack Time': 'Last Attack Time',
                        Actions: 'Actions',
                        Attack: 'Attack',
                        'barbarian villages where found': 'barbarian villages where found',
                        'Showing the first': 'Showing the first',
                        'barbarian villages.': 'barbarian villages.',
                        Settings: 'Settings',
                        'Save Settings': 'Save Settings',
                        'Maximum villages to show on the table': 'Maximum villages to show on the table',
                        'Maximum FA Pages to fetch': 'Maximum FA Pages to fetch',
                        'Minimum Wall Level': 'Minimum Wall Level',
                        'Settings saved!': 'Settings saved!',
                        'Include reports with partial losses': 'Include reports with partial losses',
                    },
                    hu_HU: {
                        'Clear Barbarian Walls': 'Barbár falak kosozása',
                        Help: 'Segítség',
                        'This script requires PA and FA to be active!': 'A script működéséhez PF és FA kell!',
                        'Redirecting...': 'Átlépés...',
                        'Fetching FA pages...': 'FA oldalak begyűjtése...',
                        'Finished fetching FA pages!': 'FA oldalak begyűjtve!',
                        Fetching: 'Begyűjtés',
                        'No barbarian villages found fitting the criteria!': 'Nincs olyan barbár falu amiben van fal!',
                        Type: 'Típus',
                        Barbarian: 'Barbár',
                        Report: 'Jelentés',
                        Distance: 'Távolság',
                        Wall: 'Fal',
                        'Last Attack Time': 'Utolsó támadás',
                        Actions: 'Műveletek',
                        Attack: 'Támadás',
                        'barbarian villages where found': 'barbár faluk ahol talált',
                        'Showing the first': 'Első mutatása',
                        'barbarian villages.': 'barbár faluk.',
                        Settings: 'Beállítások',
                        'Save Settings': 'Beállítások mentése',
                        'Maximum villages to show on the table': 'Maximum faluszám amit a táblázatban mutat',
                        'Maximum FA Pages to fetch': 'Maximum FA oldalak gyűjtése',
                        'Minimum Wall Level': 'Minimum Fal Szint',
                        'Settings saved!': 'Beállítások elmentve!',
                        'Include reports with partial losses': 'Tartalmazza a nem kémlelt veszteséges jelentéseket',
                    },
                };

                // Initialize script logic
                async function initClearBarbarianWalls(store) {
                    const { MAX_BARBARIANS, MAX_FA_PAGES_TO_FETCH, WALL_LEVEL, PARTIAL_LOSSES_REPORTS } = store;
                    const faURLs = await fetchFAPages(MAX_FA_PAGES_TO_FETCH);

                    // Show progress bar and notify user
                    startProgressBar(faURLs.length);
                    UI.SuccessMessage(tt('Fetching FA pages...'));

                    const faPages = [];
                    jQuery.fetchAll(
                        faURLs,
                        function (index, data) {
                            updateProgressBar(index, faURLs.length);
                            const { plunder_list } = data;
                            faPages.push(...plunder_list);
                        },
                        function () {
                            const faTableRows = getFATableRows(faPages);
                            const barbarians = getFABarbarians(faTableRows, WALL_LEVEL, PARTIAL_LOSSES_REPORTS);

                            const content = prepareContent(barbarians, MAX_BARBARIANS);
                            renderUI(content);
                            jQuery('#barbVillagesCount').text(barbarians.length);

                            updateMap(barbarians);

                            // event handlers
                            showSettingsPanel(store);
                        },
                        function (error) {
                            UI.ErrorMessage('Error fetching FA pages!');
                            console.error(`${scriptInfo()} Error:`, error);
                        }
                    );
                }

                // Update map to include barbarians
                function updateMap(barbarians) {
                    const barbCoords = barbarians.map((barbarian) => barbarian.coord);
                    // Show wall level of barbarian villages on the Map
                    if (mapOverlay.mapHandler._spawnSector) {
                        //exists already, don't recreate
                    } else {
                        //doesn't exist yet
                        mapOverlay.mapHandler._spawnSector = mapOverlay.mapHandler.spawnSector;
                    }

                    TWMap.mapHandler.spawnSector = function (data, sector) {
                        // Override Map Sector Spawn
                        mapOverlay.mapHandler._spawnSector(data, sector);
                        var beginX = sector.x - data.x;
                        var endX = beginX + mapOverlay.mapSubSectorSize;
                        var beginY = sector.y - data.y;
                        var endY = beginY + mapOverlay.mapSubSectorSize;
                        for (var x in data.tiles) {
                            var x = parseInt(x, 10);
                            if (x < beginX || x >= endX) {
                                continue;
                            }
                            for (var y in data.tiles[x]) {
                                var y = parseInt(y, 10);

                                if (y < beginY || y >= endY) {
                                    continue;
                                }
                                var xCoord = data.x + x;
                                var yCoord = data.y + y;
                                var v = mapOverlay.villages[xCoord * 1000 + yCoord];
                                if (v) {
                                    var vXY = '' + v.xy;
                                    var vCoords = vXY.slice(0, 3) + '|' + vXY.slice(3, 6);
                                    if (barbCoords.includes(vCoords)) {
                                        const currentBarbarian = barbarians.find((obj) => obj.villageId == v.id);

                                        const eleDIV = $('<div></div>')
                                            .css({
                                                border: '1px coral solid',
                                                position: 'absolute',
                                                backgroundColor: '#000',
                                                color: '#fff',
                                                width: '30px',
                                                height: '15px',
                                                marginTop: '20px',
                                                marginLeft: '10px',
                                                display: 'block',
                                                zIndex: '10',
                                                fontWeight: 'normal',
                                                textAlign: 'center',
                                            })
                                            .attr('id', 'dsm' + v.id)
                                            .html(currentBarbarian.wall);

                                        sector.appendElement(eleDIV[0], data.x + x - sector.x, data.y + y - sector.y);
                                    }
                                }
                            }
                        }
                    };

                    mapOverlay.reload();
                }

                // Prepare content
                function prepareContent(villages, maxBarbsToShow) {
                    if (villages.length) {
                        const barbsTable = buildBarbsTable(villages, maxBarbsToShow);
                        var content = `
		<div>
			<p>
				<b><span id="barbVillagesCount"></span> ${tt('barbarian villages where found')}</b><br>
				<em>${tt('Showing the first')} ${maxBarbsToShow} ${tt('barbarian villages.')}</em>
			</p>
		</div>
		<div class="ra-table-container">
			${barbsTable}
		</div>
    `;

                        return content;
                    } else {
                        return `<b>${tt('No barbarian villages found fitting the criteria!')}</b>`;
                    }
                }

                // Render UI
                function renderUI(body) {
                    const content = `
        <div class="ra-clear-barbs-walls" id="raClearBarbWalls">
			<div class="ra-clear-barbs-walls-header">
				<h3>${tt(scriptData.name)}</h3>
				<a href="javascript:void(0);" id="showSettingsPanel" class="btn-show-settings">
					<span class="icon header settings"></span>
				</a>
			</div>
            <div class="ra-clear-barbs-walls-body">
                ${body}
            </div>
			<div class="ra-clear-barbs-walls-footer">
				<small>
					<strong>
						${tt(scriptData.name)} ${scriptData.version}
					</strong> -
					<a href="${scriptData.authorUrl}" target="_blank" rel="noreferrer noopener">
						${scriptData.author}
					</a> -
					<a href="${scriptData.helpLink}" target="_blank" rel="noreferrer noopener">
						${tt('Help')}
					</a>
				</small>
			</div>
        </div>
        <style>
            .ra-clear-barbs-walls { position: relative; display: block; width: 100%; height: auto; clear: both; margin: 10px 0 15px; border: 1px solid #603000; box-sizing: border-box; background: #f4e4bc; }
            .ra-clear-barbs-walls * { box-sizing: border-box; }
			.ra-clear-barbs-walls > div { padding: 10px; }
            .ra-clear-barbs-walls .btn-confirm-yes { padding: 3px; }
			.ra-clear-barbs-walls-header { display: flex; align-items: center; justify-content: space-between; background-color: #c1a264 !important; background-image: url(/graphic/screen/tableheader_bg3.png); background-repeat: repeat-x; }
			.ra-clear-barbs-walls-header h3 { margin: 0; padding: 0; line-height: 1; }
			.ra-clear-barbs-walls-body p { font-size: 14px; }
            .ra-clear-barbs-walls-body label { display: block; font-weight: 600; margin-bottom: 6px; }

			/* Table Styling */
			.ra-table-container { overflow-y: auto; overflow-x: hidden; height: auto; max-height: 312px;border: 1px solid #bc6e1f; }
			.ra-table th { font-size: 14px; }
			.ra-table th,
            .ra-table td { padding: 3px; text-align: center; }
            .ra-table td a { word-break: break-all; }
			.ra-table a:focus { color: blue; }
			.ra-table a.btn:focus { color: #fff; }
			.ra-table tr:nth-of-type(2n) td { background-color: #f0e2be }
			.ra-table tr:nth-of-type(2n+1) td { background-color: #fff5da; }

			/* Popup */
			.ra-popup-content { width: 360px; }
			.ra-popup-content * { box-sizing: border-box; }
			.ra-popup-content input[type="text"] { padding: 3px; width: 100%; }

			/* Helpers */
            .ra-mb15 { margin-bottom: 15px; }

			/* Elements */
			.already-sent-command { opacity: 0.6; }
        </style>
    `;

                    if (jQuery('#raClearBarbWalls').length < 1) {
                        jQuery('#contentContainer').prepend(content);
                    } else {
                        jQuery('.ra-clear-barbs-walls-body').html(body);
                    }
                }

                // Action Handlers: Show Settings Panel
                function showSettingsPanel(store) {
                    jQuery('#showSettingsPanel').on('click', function (e) {
                        e.preventDefault();

                        const { MAX_BARBARIANS, MAX_FA_PAGES_TO_FETCH, WALL_LEVEL, PARTIAL_LOSSES_REPORTS } = store;

                        const content = `
			<div class="ra-popup-content">
				<div class="ra-popup-header">
					<h3>${tt('Settings')}</h3>
				</div>
				<div class="ra-popup-body ra-mb15">
					<table class="ra-settings-table" width=100%">
						<tbody>
							<tr>
								<td width="80%">
									<label for="maxBarbVillages">
										${tt('Maximum villages to show on the table')}
									</label>
								</td>
								<td width="30%">
									<input type="text" name="max_barb_villages" id="maxBarbVillages" value="${MAX_BARBARIANS}" />
								</td>
							</tr>
							<tr>
								<td width="80%">
									<label for="maxFApages">
										${tt('Maximum FA Pages to fetch')}
									</label>
								</td>
								<td width="30%">
									<input type="text" name="max_fa_pages" id="maxFApages" value="${MAX_FA_PAGES_TO_FETCH}" />
								</td>
							</tr>
							<tr>
								<td width="80%">
									<label for="minWallLevel">
										${tt('Minimum Wall Level')}
									</label>
								</td>
								<td width="30%">
									<input type="text" name="min_wall_level" id="minWallLevel" value="${WALL_LEVEL}" />
								</td>
							</tr>
							<tr>
								<td width="80%">
									<label for="minWallLevel">
										${tt('Include reports with partial losses')}
									</label>
								</td>
								<td width="30%">
									<input type="checkbox" name="partial_losses_reports" id="partialLossesReports" ${PARTIAL_LOSSES_REPORTS ? 'checked' : ''
                            } />
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="ra-popup-footer">
					<a href="javascript:void(0);" id="saveSettingsBtn" class="btn btn-confirm-yes">
						${tt('Save Settings')}
					</a>
				</div>
			</div>
		`;

                        Dialog.show('SettingsPanel', content);

                        saveSettings();
                    });
                }

                // Action Handlers: Save Settings
                function saveSettings() {
                    jQuery('#saveSettingsBtn').on('click', function (e) {
                        e.preventDefault();

                        const maxBarbVillages = jQuery('#maxBarbVillages').val();
                        const maxFApages = jQuery('#maxFApages').val();
                        const minWallLevel = jQuery('#minWallLevel').val();
                        const partialLossesReports = jQuery('#partialLossesReports').is(':checked');

                        const data = {
                            MAX_BARBARIANS: maxBarbVillages,
                            MAX_FA_PAGES_TO_FETCH: maxFApages,
                            WALL_LEVEL: minWallLevel,
                            PARTIAL_LOSSES_REPORTS: partialLossesReports,
                        };

                        writeStorage(data, readStorage(DEFAULT_STATE));
                        UI.SuccessMessage(tt('Settings saved!'), 1000);

                        // Update UI to reflect new settings
                        initClearBarbarianWalls(data);
                    });
                }

                // Build barbs table
                function buildBarbsTable(villages, maxBarbsToShow) {
                    villages = villages.slice(0, maxBarbsToShow);
                    let barbsTable = `
		<table class="ra-table" width="100%">
			<thead>
				<tr>
					<th>
						#
					</th>
					<th>
						${tt('Type')}
					</th>
					<th>
						${tt('Barbarian')}
					</th>
					<th>
						${tt('Report')}
					</th>
					<th>
						${tt('Distance')}
					</th>
					<th>
						${tt('Wall')}
					</th>
					<th>
						${tt('Last Attack Time')}
					</th>
					<th>
						${tt('Actions')}
					</th>
				</tr>
			</thead>
			<tbody>
	`;

                    villages.forEach((village, index) => {
                        index++; // update index so it starts at 1 instead of 0
                        const { villageId, coord, wall, reportId, reportTime, type, distance } = village;

                        const unitsToSend = calculateUnitsToSend(wall);

                        const villageUrl = `${game_data.link_base_pure}info_village&id=${villageId}`;
                        const reportUrl = `${game_data.link_base_pure}report&mode=all&view=${reportId}`;
                        const commandUrl = `${game_data.link_base_pure}place&target=${villageId}${unitsToSend}&wall=${wall}`;

                        barbsTable += `
			<tr>
				<td>
					${index}
				</td>
				<td>
					<img src="${type}">
				</td>
				<td>
					<a href="${villageUrl}" target="_blank" rel="noopener noreferrer">
						${coord}
					</a>
				</td>
				<td>
					<a href="${reportUrl}" target="_blank" rel="noopener noreferrer">
						<span class="icon header new_report"></span>
					</a>
				</td>
				<td>
					${distance}
				</td>
				<td>
					${wall !== '?' ? wall : '<b style="color:red;">?</b>'}
				</td>
				<td>
					${reportTime}
				</td>
				<td>
					<a href="${commandUrl}" onClick="highlightOpenedCommands(this);" class="ra-clear-barb-wall-btn btn" target="_blank" rel="noopener noreferrer">
						${tt('Attack')}
					</a>
				</td>
			</tr>
		`;
                    });
                    barbsTable += `
			</tbody>
		</table>
	`;

                    return barbsTable;
                }

                // Action Handler: Highlight Opened Commands
                function highlightOpenedCommands(element) {
                    element.classList.add('btn-confirm-yes');
                    element.classList.add('btn-already-sent');
                    element.parentElement.parentElement.classList.add('already-sent-command');
                }

                // Helper: Get FA pages URLs for AJAX
                async function fetchFAPages(maxFAPagesToFetch) {
                    const faPageURLs = await jQuery
                        .get(game_data.link_base_pure + 'am_farm')
                        .then((response) => {
                            const htmlDoc = jQuery.parseHTML(response);
                            const plunderListNav = jQuery(htmlDoc).find('#plunder_list_nav:eq(0) a');
                            const firstFApage = game_data.link_base_pure + `am_farm&ajax=page_entries&Farm_page=0&class=&extended=1`;

                            // Getting amount of LA pages
                            const faPageURLs = [firstFApage];
                            jQuery(plunderListNav).each(function (index) {
                                index++;
                                if (index <= maxFAPagesToFetch - 1) {
                                    const currentPageNumber = parseInt(
                                        getParameterByName('Farm_page', window.location.origin + jQuery(this).attr('href'))
                                    );
                                    faPageURLs.push(
                                        game_data.link_base_pure +
                                        `am_farm&ajax=page_entries&Farm_page=${currentPageNumber}&class=&extended=1&order=distance&dir=asc`
                                    );
                                }
                            });

                            return faPageURLs;
                        })
                        .catch((error) => {
                            UI.ErrorMessage('Error fetching FA page!');
                            console.error(`${scriptInfo()} Error:`, error);
                        });

                    return faPageURLs;
                }

                // Helper: Get FA table rows for all pages
                function getFATableRows(pages) {
                    let barbariansText = '';
                    pages.forEach((page) => {
                        barbariansText += page;
                    });
                    return jQuery.parseHTML(barbariansText);
                }

                // Helper: Get barbarian villages with wall bigger then 0
                function getFABarbarians(rows, wallLevel, partialLossesReports) {
                    const barbarians = [];
                    rows.forEach((row) => {
                        if (parseInt(jQuery(row).find('td:eq(6)').text()) >= wallLevel) {
                            const villageId = parseInt(
                                getParameterByName(
                                    'target',
                                    window.location.origin + jQuery(row).find('td').last().find('a').attr('href')
                                )
                            );
                            const coord = jQuery(row).find('td:eq(3) a').text().match(COORDS_REGEX)[0];
                            const wall = parseInt(jQuery(row).find('td:eq(6)').text());
                            const distance = jQuery(row).find('td:eq(7)').text().trim();
                            const reportId = parseInt(
                                getParameterByName('view', window.location.origin + jQuery(row).find('td:eq(3) a').attr('href'))
                            );
                            const reportTime = jQuery(row).find('td:eq(4)').text().trim();
                            const type = jQuery(row).find('td:eq(1) img').attr('src');

                            barbarians.push({
                                villageId: villageId,
                                coord: coord,
                                distance: distance,
                                wall: wall,
                                reportId: reportId,
                                reportTime: reportTime,
                                type: type,
                            });
                        } else {
                            if (jQuery(row).find('td:eq(6)').text() === '?' && partialLossesReports) {
                                const villageId = parseInt(
                                    getParameterByName(
                                        'target',
                                        window.location.origin + jQuery(row).find('td').last().find('a').attr('href')
                                    )
                                );
                                const coord = jQuery(row).find('td:eq(3) a').text().match(COORDS_REGEX)[0];
                                const wall = jQuery(row).find('td:eq(6)').text();
                                const distance = jQuery(row).find('td:eq(7)').text().trim();
                                const reportId = parseInt(
                                    getParameterByName('view', window.location.origin + jQuery(row).find('td:eq(3) a').attr('href'))
                                );
                                const reportTime = jQuery(row).find('td:eq(4)').text().trim();
                                const type = jQuery(row).find('td:eq(1) img').attr('src');

                                barbarians.push({
                                    villageId: villageId,
                                    coord: coord,
                                    distance: distance,
                                    wall: wall,
                                    reportId: reportId,
                                    reportTime: reportTime,
                                    type: type,
                                });
                            }
                        }
                    });
                    return barbarians;
                }

                // Helper: Calculate units to send based on wall level
                function calculateUnitsToSend(wall) {
                    switch (wall) {
                        case 1:
                            return `&axe=15&ram=3&spy=1`;
                        case 2:
                            return `&axe=150&ram=10&spy=1`;
                        case 3:
                            return `&axe=300&ram=20&spy=1`;
                        default:
                            return '';
                    }
                }

                // Helper: Make consecutive AJAX (GET) requests
                $.fetchAll = function (
                    urls, // array of URLs
                    onLoad, // called when any URL is loaded, params (index, data)
                    onDone, // called when all URLs successfully loaded, no params
                    onError // called when a URL load fails or if onLoad throws an exception, params (error)
                ) {
                    var numDone = 0;
                    var lastRequestTime = 0;
                    var minWaitTime = 250; // ms between requests
                    loadNext();
                    function loadNext() {
                        if (numDone == urls.length) {
                            onDone();
                            return;
                        }

                        let now = Date.now();
                        let timeElapsed = now - lastRequestTime;
                        if (timeElapsed < minWaitTime) {
                            let timeRemaining = minWaitTime - timeElapsed;
                            setTimeout(loadNext, timeRemaining);
                            return;
                        }
                        lastRequestTime = now;
                        $.get(urls[numDone])
                            .done((data) => {
                                try {
                                    onLoad(numDone, data);
                                    ++numDone;
                                    loadNext();
                                } catch (e) {
                                    onError(e);
                                }
                            })
                            .fail((xhr) => {
                                onError(xhr);
                            });
                    }
                };

                // Helper: Progress bar UI
                function startProgressBar(total) {
                    const width = jQuery('#contentContainer')[0].clientWidth;
                    const preloaderContent = `
		<div id="progressbar" class="progress-bar" style="margin-bottom:12px;">
        	<span class="count label">0/${total}</span>
        	<div id="progress">
				<span class="count label" style="width: ${width}px;">
					0/${total}
				</span>
			</div>
    	</div>
	`;
                    $('#contentContainer').eq(0).prepend(preloaderContent);
                }

                // Helper: Updates progress bar
                function updateProgressBar(index, total) {
                    jQuery('#progress').css('width', `${((index + 1) / total) * 100}%`);
                    jQuery('.count').text(`${tt('Fetching')} ${index + 1}/${total}`);
                    if (index + 1 == total) {
                        UI.SuccessMessage(tt('Finished fetching FA pages!'));
                        jQuery('#progressbar').fadeOut(1000);
                    }
                }

                // Helper: Read client-side storage
                function readStorage(defaultState) {
                    let storedState = sessionStorage.getItem(STORAGE_KEY);
                    if (!storedState) return defaultState;
                    if (typeof storedState === 'object') return defaultState;
                    storedState = JSON.parse(storedState);
                    return storedState;
                }

                // Helper: Write into client-side storage
                function writeStorage(data, initialState) {
                    const dataToBeSaved = {
                        ...initialState,
                        ...data,
                    };
                    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToBeSaved));
                }

                // Helper: Get parameter by name
                function getParameterByName(name, url = window.location.href) {
                    return new URL(url).searchParams.get(name);
                }

                // Helper: Generates script info
                function scriptInfo() {
                    return `[${scriptData.name} ${scriptData.version}]`;
                }

                // Helper: Text Translator
                function tt(string) {
                    var gameLocale = game_data.locale;

                    if (translations[gameLocale] !== undefined) {
                        return translations[gameLocale][string];
                    } else {
                        return translations['en_DK'][string];
                    }
                }

                // Initialize Script
                (function () {
                    if (game_data.features.FarmAssistent.active && game_data.features.Premium.active) {
                        const gameScreen = getParameterByName('screen');
                        if (ALLOWED_GAME_SCREENS.includes(gameScreen)) {
                            const state = readStorage(DEFAULT_STATE);
                            initClearBarbarianWalls(state);
                        } else {
                            UI.InfoMessage(tt('Redirecting...'));
                            window.location.assign(game_data.link_base_pure + 'map');
                        }
                    } else {
                        UI.ErrorMessage(tt('This script requires PA and FA to be active!'));
                    }
                })();
            }
            function mass_destroy_wall_go() { }
        } //TODO
        function mass_build() {
            "INSERT_LICENSE_CHECK_HERE"
            document.getElementById("get_all_possible_build").click()
            function mass_build_start() {
                //list
                var table = document.getElementById("buildings_table").rows;
                var r = 1;
                var buildings = {};
                var delay = Math.floor(Math.random() * 4000);
                var offsetTimeInMillis = Math.floor((Math.random() * 6000) + 2000);
                setInterval(function () {
                    offsetTimeInMillis = Math.floor((Math.random() * 6000) + 2000);
                    delay = Math.floor(Math.random() * 4000);
                }, 100); // ms
                function get_buildings() {
                    buildings.queue = table[r].cells[table[r].cells.length - 1];
                    buildings.main = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_main"]')?.[0];
                    buildings.barracks = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_barracks"]')?.[0];
                    buildings.stable = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_stable"]')?.[0];
                    buildings.garage = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_garage"]')?.[0];
                    buildings.snob = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_snob"]')?.[0];
                    buildings.smith = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_smith"]')?.[0];
                    buildings.place = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_place"]')?.[0];
                    buildings.statue = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_statue"]')?.[0];
                    buildings.market = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_market"]')?.[0];
                    buildings.wood = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_wood"]')?.[0];
                    buildings.stone = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_stone"]')?.[0];
                    buildings.iron = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_iron"]')?.[0];
                    buildings.farm = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_farm"]')?.[0];
                    buildings.storage = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_storage"]')?.[0];
                    buildings.hide = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_hide"]')?.[0];
                    buildings.wall = document.querySelectorAll('table[id="buildings_table"]')[0].rows[r].querySelectorAll('td[class="upgrade_building b_wall"]')?.[0];

                    buildings.queue.num = +buildings.queue.children[0]?.childElementCount;
                    if (isNaN(buildings.queue.num)) { buildings.queue.num = 0; }
                }
                var clickedTask = {};
                var newBuildList = [];
                function build() {
                    var levels = {};
                    get_buildings();
                    levels = loadBuildingsAndLevels();
                    function loadUserBuildList() {
                        var buildList = [];
                        if (kezdetek === 0) {
                            buildList = [];
                            //change
                            buildList.push({ building: "place", level: Gyulekezohely });
                            buildList.push({ building: "statue", level: Szobor });
                            buildList.push({ building: "wood", level: Fatelep });
                            buildList.push({ building: "stone", level: Agyagbanya });
                            buildList.push({ building: "iron", level: Vasbanya });
                            buildList.push({ building: "barracks", level: Barakk });
                            buildList.push({ building: "stable", level: Istallo });
                            buildList.push({ building: "garage", level: Muhely });
                            buildList.push({ building: "market", level: Piac });
                            buildList.push({ building: "main", level: Fohadiszallas });
                            buildList.push({ building: "storage", level: Raktar });
                            buildList.push({ building: "farm", level: Tanya });
                            buildList.push({ building: "smith", level: Kovacsmuhely });
                            buildList.push({ building: "snob", level: Akademia });
                            buildList.push({ building: "wall", level: Fal });
                            buildList.push({ building: "hide", level: Rejtekhely });

                            return removeCompletedTasks(buildList);
                        }
                        else if (kezdetek === 1) {
                            buildList = [];
                            //change
                            buildList.push({ building: "wood", level: 1 });
                            buildList.push({ building: "stone", level: 1 });
                            buildList.push({ building: "iron", level: 1 });
                            buildList.push({ building: "place", level: 1 });
                            buildList.push({ building: "statue", level: 1 });
                            buildList.push({ building: "wood", level: 2 });
                            buildList.push({ building: "stone", level: 2 });
                            buildList.push({ building: "main", level: 2 });
                            buildList.push({ building: "main", level: 3 });
                            buildList.push({ building: "barracks", level: 1 });
                            buildList.push({ building: "wood", level: 3 });
                            buildList.push({ building: "stone", level: 3 });
                            buildList.push({ building: "barracks", level: 2 });
                            buildList.push({ building: "storage", level: 2 });
                            buildList.push({ building: "iron", level: 2 });
                            buildList.push({ building: "storage", level: 3 });
                            buildList.push({ building: "barracks", level: 3 });
                            buildList.push({ building: "statue", level: 1 });
                            buildList.push({ building: "farm", level: 2 });
                            buildList.push({ building: "iron", level: 3 });
                            buildList.push({ building: "main", level: 4 });
                            buildList.push({ building: "main", level: 5 });
                            buildList.push({ building: "smith", level: 1 });
                            buildList.push({ building: "wood", level: 4 });
                            buildList.push({ building: "stone", level: 4 });
                            buildList.push({ building: "wall", level: 1 });
                            buildList.push({ building: "hide", level: 2 });
                            buildList.push({ building: "hide", level: 3 });
                            buildList.push({ building: "wood", level: 5 });
                            buildList.push({ building: "stone", level: 5 });
                            buildList.push({ building: "market", level: 1 });
                            buildList.push({ building: "wood", level: 6 });
                            buildList.push({ building: "stone", level: 6 });
                            buildList.push({ building: "storage", level: 4 });
                            buildList.push({ building: "wood", level: 7 });
                            buildList.push({ building: "stone", level: 7 });
                            buildList.push({ building: "iron", level: 4 });
                            buildList.push({ building: "iron", level: 5 });
                            buildList.push({ building: "iron", level: 6 });
                            buildList.push({ building: "wood", level: 8 });
                            buildList.push({ building: "stone", level: 8 });
                            buildList.push({ building: "storage", level: 5 });
                            buildList.push({ building: "iron", level: 7 });
                            buildList.push({ building: "wood", level: 9 });
                            buildList.push({ building: "stone", level: 9 });
                            buildList.push({ building: "wood", level: 10 });
                            buildList.push({ building: "stone", level: 10 });
                            buildList.push({ building: "storage", level: 6 });
                            buildList.push({ building: "wood", level: 11 });
                            buildList.push({ building: "stone", level: 11 });
                            buildList.push({ building: "wood", level: 12 });
                            buildList.push({ building: "stone", level: 12 });
                            buildList.push({ building: "storage", level: 7 });
                            buildList.push({ building: "iron", level: 8 });
                            buildList.push({ building: "storage", level: 8 });
                            buildList.push({ building: "iron", level: 9 });
                            buildList.push({ building: "iron", level: 10 });
                            buildList.push({ building: "wood", level: 13 });
                            buildList.push({ building: "stone", level: 13 });
                            buildList.push({ building: "iron", level: 11 });
                            buildList.push({ building: "storage", level: 9 });
                            buildList.push({ building: "wood", level: 14 });
                            buildList.push({ building: "stone", level: 14 });
                            buildList.push({ building: "iron", level: 12 });
                            buildList.push({ building: "wood", level: 15 });
                            buildList.push({ building: "stone", level: 15 });
                            buildList.push({ building: "iron", level: 13 });
                            buildList.push({ building: "storage", level: 10 });
                            buildList.push({ building: "main", level: 6 });
                            buildList.push({ building: "main", level: 7 });
                            buildList.push({ building: "barracks", level: 4 });
                            buildList.push({ building: "barracks", level: 5 });
                            buildList.push({ building: "wall", level: 2 });
                            buildList.push({ building: "wall", level: 3 });
                            buildList.push({ building: "wall", level: 4 });
                            buildList.push({ building: "wall", level: 5 });
                            buildList.push({ building: "iron", level: 14 });
                            buildList.push({ building: "iron", level: 15 });
                            buildList.push({ building: "smith", level: 2 });
                            buildList.push({ building: "smith", level: 3 });
                            buildList.push({ building: "smith", level: 4 });
                            buildList.push({ building: "smith", level: 5 });
                            buildList.push({ building: "market", level: 2 });
                            buildList.push({ building: "market", level: 3 });
                            buildList.push({ building: "main", level: 8 });
                            buildList.push({ building: "main", level: 9 });
                            buildList.push({ building: "main", level: 10 });
                            buildList.push({ building: "stable", level: 1 });
                            buildList.push({ building: "stable", level: 2 });
                            buildList.push({ building: "stable", level: 3 });

                            return removeCompletedTasks(buildList);
                        }
                    }
                    var userBuildList = loadUserBuildList();
                    epit_start_loop();
                    function epit_start_loop() {
                        epit_start();
                        setTimeout(epit_start_loop, (offsetTimeInMillis + delay));
                    }
                    function epit_start() {
                        get_buildings();
                        levels = loadBuildingsAndLevels();
                        userBuildList = loadUserBuildList();
                        'use strict';
                        setTimeout(function () {
                            nextIteration();
                        }, offsetTimeInMillis);
                    }
                    function nextIteration() {
                        var nextBuildTask = getNextBuildTask();
                        if (nextBuildTask) {
                            nextBuildTask.click();
                        }
                        else {
                            tovabblepes();
                        }
                    }

                    function removeCompletedTasks(list) {
                        var newBuildList = [];
                        for (let i = 0; i < list.length; i++) {
                            var currentBuilding = list[i];
                            if (currentBuilding.level > levels[currentBuilding.building]) {
                                newBuildList.push(currentBuilding);
                            }
                        }
                        return newBuildList;
                    }
                    function getNextBuildTask() {
                        get_buildings();
                        if (buildings.queue.num >= Max_epitesi_sor) {
                            if (r < table.length - 1) { r++; return; }
                            else { tovabblepes(); return; }
                            return;
                        }
                        var i = 0;
                        if (buildings.queue.num = 1 && Max_epitesi_sor > 1) { i = 1; }
                        else if (buildings.queue.num = 2 && Max_epitesi_sor > 2) { i = 2; }
                        else if (buildings.queue.num = 3 && Max_epitesi_sor > 3) { i = 3; }
                        else if (buildings.queue.num = 4 && Max_epitesi_sor > 4) { i = 4; }
                        else if (buildings.queue.num = 5 && Max_epitesi_sor > 5) { i = 5; }
                        for (i; i < userBuildList.length; i++) {
                            var building = userBuildList[i].building;
                            var level = levels[building];
                            var nextLink = buildLinkName(building, level);
                            var linkElement = nextLink;
                            if (linkElement) {
                                var isClickable = false;
                                if ((linkElement.childNodes.length > 0)) { isClickable = true; }
                                if (isClickable) {
                                    clickedTask = { building: building, level: level };
                                    return linkElement;
                                }
                                if (Kenyszeritett_lista) {
                                    return undefined;
                                }
                            }
                        }
                        if (buildings.queue.num >= Max_epitesi_sor) {
                            if (r < table.length - 1) { r++; }
                            else { tovabblepes(); }
                        }
                    }
                    function loadBuildingsAndLevels() {
                        var elem;
                        var buildElements = {};
                        buildElements[buildings.main.classList[1].slice(2)] = +buildings.main.innerText;
                        buildElements[buildings.barracks.classList[1].slice(2)] = +buildings.barracks.innerText;
                        buildElements[buildings.stable.classList[1].slice(2)] = +buildings.stable.innerText;
                        buildElements[buildings.garage.classList[1].slice(2)] = +buildings.garage.innerText;
                        buildElements[buildings.snob.classList[1].slice(2)] = +buildings.snob.innerText;
                        buildElements[buildings.smith.classList[1].slice(2)] = +buildings.smith.innerText;
                        buildElements[buildings.place.classList[1].slice(2)] = +buildings.place.innerText;
                        buildElements[buildings.statue.classList[1].slice(2)] = +buildings.statue.innerText;
                        buildElements[buildings.market.classList[1].slice(2)] = +buildings.market.innerText;
                        buildElements[buildings.wood.classList[1].slice(2)] = +buildings.wood.innerText;
                        buildElements[buildings.stone.classList[1].slice(2)] = +buildings.stone.innerText;
                        buildElements[buildings.iron.classList[1].slice(2)] = +buildings.iron.innerText;
                        buildElements[buildings.farm.classList[1].slice(2)] = +buildings.farm.innerText;
                        buildElements[buildings.storage.classList[1].slice(2)] = +buildings.storage.innerText;
                        buildElements[buildings.hide.classList[1].slice(2)] = +buildings.hide.innerText;
                        buildElements[buildings.wall.classList[1].slice(2)] = +buildings.wall.innerText;

                        if (buildings.queue.num === 0) { }
                        else if (buildings.queue.num === 1) {
                            elem = buildings.queue.children[0].children[0].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                        }
                        else if (buildings.queue.num === 2) {
                            elem = buildings.queue.children[0].children[0].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                            elem = buildings.queue.children[0].children[1].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                        }
                        else if (buildings.queue.num === 3) {
                            elem = buildings.queue.children[0].children[0].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                            elem = buildings.queue.children[0].children[1].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                            elem = buildings.queue.children[0].children[2].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                        }
                        else if (buildings.queue.num === 4) {
                            elem = buildings.queue.children[0].children[0].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                            elem = buildings.queue.children[0].children[1].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                            elem = buildings.queue.children[0].children[2].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                            elem = buildings.queue.children[0].children[3].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                        }
                        else if (buildings.queue.num === 5) {
                            elem = buildings.queue.children[0].children[0].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                            elem = buildings.queue.children[0].children[1].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                            elem = buildings.queue.children[0].children[2].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                            elem = buildings.queue.children[0].children[3].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                            elem = buildings.queue.children[0].children[4].children[2].children[0].src.split("/")[buildings.queue.children[0].children[0].children[2].children[0].src.split("/").length - 1].slice(0, -4);
                            eval("buildElements" + "[buildings." + elem + ".classList[1].slice(2)] =" + "+buildings." + elem + ".innerText" + "+1")
                        }
                        levels = buildElements;
                        return levels;
                    }
                    function buildLinkName(building, level) {
                        var x = eval("buildings." + building + ".childNodes[0]");
                        return x;
                    }
                }
                build();
            }
            var delay = Math.floor((Math.random() * 4000) + 5000); // ms
            setTimeout(mass_build_start, delay);
        }
        function mass_train() {
            "INSERT_LICENSE_CHECK_HERE"
            function mass_train_set() {
                var configuration = [0, 0, 6000, 0, 0, 2500, 500, 0, 400, 0];

                var units;
                var unitsNET;
                var costs;
                var doc = document;
                var win = (window.frames.length > 0) ? window.main : window;

                if (doc.URL.indexOf('mode=mass') != -1) {
                    function arrayMin(array) {
                        var value = array[0];
                        for (var t = 1; t < array.length; t++) {
                            if (array[t] < value) { value = array[t]; }
                        }
                        return value;
                    }
                    function linearDivideArray(array1, array2) {
                        var value = [];
                        if (array1.length == array2.length) {
                            for (var t = 0; t < array1.length; t++) {
                                if (array2[t] != 0) { value[t] = array1[t] * 1.0 / array2[t]; }
                                else { value[t] = 0; }
                            }
                        }
                        return value;
                    }
                    function linearAddArray(array1, array2) {
                        var value = [];
                        if (array1.length == array2.length) {
                            for (var t = 0; t < array1.length; t++) { value[t] = array1[t] + array2[t]; }
                        }
                        return value;
                    }
                    function getUnitId(unit) {
                        for (var t = 0; t < units.length; t++) {
                            if (unit == unitsNET[t]) { return t; }
                        }
                        return -1;
                    }
                    function getQueue(record) {
                        var value = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        for (var u = 3; u < record.cells.length; u++) {
                            try { value[u - 3] = parseInt(record.cells[u].childNodes[1].childNodes[1].firstChild.title, 10); }
                            catch (e) { }
                            if (isNaN(value[u - 3])) { value[u - 3] = 0; }
                        }
                        return value;
                    }
                    function getResources(record) {
                        var value = [0, 0, 0, 0];
                        var res = record.cells[1].textContent.split("\n");
                        var farm = record.cells[2].innerHTML.split('/');
                        value[0] = parseInt(res[1].replace(".", ""), 10);
                        value[1] = parseInt(res[2].replace(".", ""), 10);
                        value[2] = parseInt(res[3].replace(".", ""), 10);
                        value[3] = farm[1] - farm[0];
                        return value;
                    }
                    function getProduced(record) {
                        var value = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        for (var u = 3; u < record.cells.length; u++) {
                            try { value[u - 3] = parseInt(record.cells[u].childNodes[1].textContent, 10); }
                            catch (e) { }
                            if (isNaN(value[u - 3])) { value[u - 3] = 0; }
                        }
                        return value;
                    }
                    if (document.URL.match('screen=train') && document.URL.match('mode=mass')) {
                        var records = document.getElementById('mass_train_table').rows;
                        var archers = document.querySelectorAll("input[id=unit_input_archer]").length;

                        if (archers > 0) {
                            units = ['spear', 'sword', 'axe', 'archer', 'spy', 'light', 'marcher', 'heavy', 'ram', 'catapult'];
                            unitsNET = ['Spear Fighter', 'Swordsman', 'Axeman', 'Archer', 'Scout', 'Light Cavalry', 'Mounted Archer', 'Heavy Cavalry', 'Ram', 'Catapult'];
                            costs = [[50, 30, 10, 1], [30, 30, 70, 1], [60, 30, 40, 1], [100, 30, 60, 1], [50, 50, 20, 2], [125, 100, 250, 4], [250, 100, 150, 5], [200, 150, 600, 6], [300, 200, 200, 5], [320, 400, 100, 8]];
                        }
                        else {
                            units = ['spear', 'sword', 'axe', 'spy', 'light', 'heavy', 'ram', 'catapult'];
                            unitsNET = ['Spear Fighter', 'Swordsman', 'Axeman', 'Scout', 'Light Cavalry', 'Heavy Cavalry', 'Ram', 'Catapult'];
                            costs = [[50, 30, 10, 1], [30, 30, 70, 1], [60, 30, 40, 1], [50, 50, 20, 2], [125, 100, 250, 4], [200, 150, 600, 6], [300, 200, 200, 5], [320, 400, 100, 8]];
                        }
                        for (var r = 1; r < records.length; r++) {
                            var most_falu = records[r].cells[0].innerText.slice(-12).slice(0, 7);
                            var sereg_kepezni;
                            var csopik = {};
                            csopik.tamado = vezerlo.faluk.csoport.tamado.split(" ");
                            csopik.frontvedo = vezerlo.faluk.csoport.frontvedo.split(" ");
                            csopik.hatsovedo = vezerlo.faluk.csoport.hatsovedo.split(" ");
                            csopik.farm = vezerlo.faluk.csoport.farm.split(" ");
                            csopik.kem = vezerlo.faluk.csoport.kem.split(" ");
                            if (csopik.tamado.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.tamado_sereg; }
                            else if (csopik.frontvedo.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.frontvedo_sereg; }
                            else if (csopik.hatsovedo.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.hatsovedo_sereg; }
                            else if (csopik.farm.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.farm_sereg; }
                            else if (csopik.kem.indexOf(most_falu) !== -1) { sereg_kepezni = vezerlo.faluk.kem_sereg; }
                            sereg_kepezni = sereg_kepezni.map(t => t.max);
                            if (archers < 1) {
                                sereg_kepezni.splice(3, 1)
                                sereg_kepezni.splice(5, 1)
                            }
                            configuration = sereg_kepezni;
                            var subconf = [];
                            var total_costs = [0, 0, 0, 0];
                            var i;
                            /* 0: fa, 1: agyag, 2: vas, 3: üres a tanyán */
                            var resources = getResources(records[r]);
                            /* ennyi készül */
                            var queue = getQueue(records[r]);
                            /* ennyi van meg */
                            var produced = getProduced(records[r]);
                            for (i = 0; i < units.length; i++) {
                                /* ennyi kell */
                                subconf[i] = configuration[i] - (queue[i] + produced[i]);
                                if (subconf[i] < 0) { subconf[i] = 0; }
                                /* fa, agyag, vas, ember menni kell */
                                for (var j = 0; j < 4; j++) { total_costs[j] += costs[i][j] * subconf[i]; }
                            };
                            var factor = arrayMin(linearDivideArray(resources, total_costs));
                            if (factor > 1.0) { factor = 1.0; }
                            for (i = 0; i < units.length; i++) {
                                var number = subconf[i] * factor;
                                if (number < 0) { number = 0; }
                                if (number != 0) {
                                    if (records[r].cells[3 + i].childNodes[3] && records[r].cells[3 + i].childNodes[3].disabled == false) {
                                        var ibox = records[r].cells[3 + i].childNodes[3];
                                        try { ibox.value = parseInt(number, 10); }
                                        catch (e) { alert(e); }
                                    }
                                }
                            }
                            var e = $.Event('keyup');
                            e.keyCode = 37; // ArrowLeft
                            $('input').trigger(e);
                        }
                        stop();
                    }
                }
            }
            function mass_train_go() {
                document.getElementsByClassName("btn btn-recruit")[1].click()
            }
            mass_train_set();
            var delay = Math.floor((Math.random() * 2000) + 3000); // ms
            setTimeout(mass_train_go, delay);
        }
        function mass_nyersi() {
            "INSERT_LICENSE_CHECK_HERE"
            function mass_nyersi_set() {
                var settings = {
                    "highFarm": tomeges_nyersanyagkiegyenlito_tanya_nagy,
                    "lowPoints": tomeges_nyersanyagkiegyenlito_tanya_kicsi,
                    "builtOutPercentage": tomeges_nyersanyagkiegyenlito_kiepult_raktar_szazalek,
                    "needsMorePercentage": tomeges_nyersanyagkiegyenlito_epitendo_raktar_szazalek
                };
                var premiumBtnEnabled = tomeges_nyersanyagkiegyenlito_premiummal;
                var locale = game_data.locale;
                if (locale = "hu_HU") { $.getScript('https://media.innogamescdn.com/com_DS_HU/scripts/res_balancer.js'); void (0); }
                else { $.getScript('https://shinko-to-kuma.com/scripts/WHBalancerShinkoToKuma.js'); }
                var go_delay = Math.floor((Math.random() * 3000) + 4000); // ms
                setTimeout(mass_nyersi_go, go_delay);
            }
            var i = 0;
            function mass_nyersi_go() {
                var table = document.getElementById("sendResources").getElementsByTagName("input");
                var table_length = document.getElementById("sendResources").getElementsByTagName("input").length;
                var nyersi_delay = Math.floor((Math.random() * 800) + 400); // ms
                if (table_length > 0) { table[i].click(); setTimeout(mass_nyersi_go, nyersi_delay); }
                else { tovabblepes; }
            }
            mass_nyersi_set();
        }
        function mass_coin() { } //TODO

        async function attack(x, y, sereg, epulet, id) {
            "INSERT_LICENSE_CHECK_HERE"
            var xa = x;
            var ya = y;
            async function getKey() {
                $.get("game.php?village=" + game_data.village.id + "&screen=place", function (response) {
                    var parser = new DOMParser();
                    var dom = parser.parseFromString(response, "text/html");
                    var key = dom.querySelector("#command-data-form > input:nth-child(1)").getAttribute("name");
                    var value = dom.querySelector("#command-data-form > input:nth-child(1)").value;
                    var attack_name = dom.getElementById("target_attack").value;
                    var support_name = dom.getElementById("target_support").value;
                    prep_attack(key, value, attack_name);
                })
            }
            async function getKey_new() {
                TribalWars.get({ screen: "place", ajax: "command", target: "" + id }, "", function (response) {
                    var parser = new DOMParser();
                    var dom = parser.parseFromString(response.dialog, "text/html");
                    var key = dom.querySelector("#command-data-form > input:nth-child(1)").getAttribute("name");
                    var value = dom.querySelector("#command-data-form > input:nth-child(1)").value;
                    var attack_name = dom.getElementById("target_attack").value;
                    var support_name = dom.getElementById("target_support").value;
                    prep_attack(key, value, attack_name);
                }
                )
            }
            getKey();
            async function prep_attack(key, value) {
                var keya = key;
                var valuea = value;
                if (sereg.spear !== undefined) { if (sereg.spear === 0) { sereg.spear = ""; } }
                if (sereg.sword !== undefined) { if (sereg.sword === 0) { sereg.sword = ""; } }
                if (sereg.axe !== undefined) { if (sereg.axe === 0) { sereg.axe = ""; } }
                if (sereg.archer !== undefined) { if (sereg.archer === 0) { sereg.archer = ""; } }
                if (sereg.spy !== undefined) { if (sereg.spy === 0) { sereg.spy = ""; } }
                if (sereg.light !== undefined) { if (sereg.light === 0) { sereg.light = ""; } }
                if (sereg.marcher !== undefined) { if (sereg.marcher === 0) { sereg.marcher = ""; } }
                if (sereg.heavy !== undefined) { if (sereg.heavy === 0) { sereg.heavy = ""; } }
                if (sereg.ram !== undefined) { if (sereg.ram === 0) { sereg.ram = ""; } }
                if (sereg.catapult !== undefined) { if (sereg.catapult === 0) { sereg.catapult = ""; } }
                if (sereg.knight !== undefined) { if (sereg.knight === 0) { sereg.knight = ""; } }
                if (sereg.snob !== undefined) { if (sereg.snob === 0) { sereg.snob = ""; } }
                // Form data for entering the attack dialog
                var data = [];
                data.push({ name: "" + key, value: "" + value });
                data.push({ name: "template_id", value: "" });
                data.push({ name: "source_village", value: "" + game_data.village.id });
                if (sereg.spear !== undefined) { data.push({ name: "spear", value: "" + sereg.spear }); }
                if (sereg.sword !== undefined) { data.push({ name: "sword", value: "" + sereg.sword }); }
                if (sereg.axe !== undefined) { data.push({ name: "axe", value: "" + sereg.axe }); }
                if (sereg.archer !== undefined) { data.push({ name: "archer", value: "" + sereg.archer }); }
                if (sereg.spy !== undefined) { data.push({ name: "spy", value: "" + sereg.spy }); }
                if (sereg.light !== undefined) { data.push({ name: "light", value: "" + sereg.light }); }
                if (sereg.marcher !== undefined) { data.push({ name: "marcher", value: "" + sereg.marcher }); }
                if (sereg.heavy !== undefined) { data.push({ name: "heavy", value: "" + sereg.heavy }); }
                if (sereg.ram !== undefined) { data.push({ name: "ram", value: "" + sereg.ram }); }
                if (sereg.catapult !== undefined) { data.push({ name: "catapult", value: "" + sereg.catapult }); }
                if (sereg.knight !== undefined) { data.push({ name: "knight", value: "" + sereg.knight }); }
                if (sereg.snob !== undefined) { data.push({ name: "snob", value: "" + sereg.snob }); }
                data.push({ name: "x", value: "" + xa });
                data.push({ name: "y", value: "" + ya });
                data.push({ name: "input", value: "" });
                data.push({ name: "attack", value: "l" });
                //data.push({ name: "h", value: game_data.csrf});

                TribalWars.post("place", { ajax: "confirm" }, data, function (response) {
                    if (response.dialog.includes('name="ch" value="')) {
                        var ch = response.dialog.split('name="ch" value="')[1].split('" />')[0];
                        sendAttack(ch, sereg);
                    } else {
                        UI.ErrorMessage("Nincs elegendő sereg!");
                    }
                });
            }
            async function sendAttack(ch, sereg) {
                if (sereg.spear !== undefined) { if (sereg.spear === "") { sereg.spear = 0; } }
                if (sereg.sword !== undefined) { if (sereg.sword === "") { sereg.sword = 0; } }
                if (sereg.axe !== undefined) { if (sereg.axe === "") { sereg.axe = 0; } }
                if (sereg.archer !== undefined) { if (sereg.archer === "") { sereg.archer = 0; } }
                if (sereg.spy !== undefined) { if (sereg.spy === "") { sereg.spy = 0; } }
                if (sereg.light !== undefined) { if (sereg.light === "") { sereg.light = 0; } }
                if (sereg.marcher !== undefined) { if (sereg.marcher === "") { sereg.marcher = 0; } }
                if (sereg.heavy !== undefined) { if (sereg.heavy === "") { sereg.heavy = 0; } }
                if (sereg.ram !== undefined) { if (sereg.ram === "") { sereg.ram = 0; } }
                if (sereg.catapult !== undefined) { if (sereg.catapult === "") { sereg.catapult = 0; } }
                if (sereg.knight !== undefined) { if (sereg.knight === "") { sereg.knight = 0; } }
                if (sereg.snob !== undefined) { if (sereg.snob === "") { sereg.snob = 0; } }

                // Form data to confirm attack, needs to be duplicated due to different order (ban prevention)
                var data = [];
                data.push({ name: "attack", value: "" + true });
                data.push({ name: "ch", value: "" + ch });
                data.push({ name: "cb", value: "troop_confirm_submit" });
                data.push({ name: "x", value: "" + xa });
                data.push({ name: "y", value: "" + ya });
                data.push({ name: "source_village", value: "" + game_data.village.id });
                data.push({ name: "village", value: "" + game_data.village.id });
                data.push({ name: "attack_name", value: "" });
                if (sereg.spear !== undefined) { data.push({ name: "spear", value: "" + sereg.spear }); }
                if (sereg.sword !== undefined) { data.push({ name: "sword", value: "" + sereg.sword }); }
                if (sereg.axe !== undefined) { data.push({ name: "axe", value: "" + sereg.axe }); }
                if (sereg.archer !== undefined) { data.push({ name: "archer", value: "" + sereg.archer }); }
                if (sereg.spy !== undefined) { data.push({ name: "spy", value: "" + sereg.spy }); }
                if (sereg.light !== undefined) { data.push({ name: "light", value: "" + sereg.light }); }
                if (sereg.marcher !== undefined) { data.push({ name: "marcher", value: "" + sereg.marcher }); }
                if (sereg.heavy !== undefined) { data.push({ name: "heavy", value: "" + sereg.heavy }); }
                if (sereg.ram !== undefined) { data.push({ name: "ram", value: "" + sereg.ram }); }
                if (sereg.catapult !== undefined) { data.push({ name: "catapult", value: "" + sereg.catapult }); }
                if (sereg.knight !== undefined) { data.push({ name: "knight", value: "" + sereg.knight }); }
                if (sereg.snob !== undefined) { data.push({ name: "snob", value: "" + sereg.snob }); }
                data.push({ name: "building", value: epulet });
                data.push({ name: "h", value: "" + game_data.csrf });
                //data.push({ name: "h", value: game_data.csrf});

                TribalWars.post("place", { ajaxaction: "popup_command" }, data, function (response) {
                    if (response.message.length > 0) {
                        UI.SuccessMessage("Támadás sikeresen elküldve!");
                    } else {
                    }
                });
            }
        }
    },
    START: function start() {
        var item_not_exist = [null, "NaN", "undefined", undefined];
        if (item_not_exist.includes(typeof SAM)) { SAM = {}; }
        if (item_not_exist.includes(localStorage.getItem("SAM"))) {
            localStorage.setItem("SAM", JSON.stringify(SAM));
        }
        else { SAM = JSON.parse(localStorage.getItem("SAM")); }
        var backend_xhr = new XMLHttpRequest();
        var data = {
            type: "license_check",
            script: "multi_village_bot"
        };
        backend_xhr.open("POST", process.env.SELL_NODE_DOMAIN, true);
        backend_xhr.setRequestHeader("Content-Type", "application/json");
        backend_xhr.setRequestHeader("developer", "-Sam");
        backend_xhr.onreadystatechange = function () {
            if (backend_xhr.readyState === 4 && backend_xhr.status === 200) {
                var response_data = JSON.parse(backend_xhr.responseText);
                if (response_data.status === "OK") {
                    if (item_not_exist.includes(typeof SAM.multi_village_bot)) { SAM.multi_village_bot = {}; }
                    SAM.multi_village_bot.license_check = Function(`return ${response_data.snippet}`)();
                    SAM.multi_village_bot.license_check();
                }
            } else {
                // show popup with error and license buy info
            }
        }
        backend_xhr.send(JSON.stringify(data));
    },
    LICENSE_CHECK: async function license_check() {
        var get_player_data = new Promise((resolve) => {
            $.get(window.location.href, function (r) {
                resolve(`${r.split('TribalWars.updateGameData({"player":')[1].split('}')[0]}};${Date.now()}`);
            })
        });
        "INSERT_ENCODE_DECODE_PAYLOAD_HERE"
        SAM.multi_village_bot.get_player_data = encode(await get_player_data);
        var backend_xhr = new XMLHttpRequest();
        var data = {
            type: "get_script",
            script: "multi_village_bot",
            player: encode(await get_player_data)
        };
        backend_xhr.open("POST", process.env.SELL_NODE_DOMAIN, true);
        backend_xhr.setRequestHeader("Content-Type", "application/json");
        backend_xhr.setRequestHeader("developer", "-Sam");
        backend_xhr.onreadystatechange = function () {
            if (backend_xhr.readyState === 4 && backend_xhr.status === 200) {
                var response_data = JSON.parse(backend_xhr.responseText);
                if (response_data.status === "OK" && response_data.license.valid) {
                    SAM.multi_village_bot.start = Function(`return ${response_data.snippet}`)();
                    SAM.multi_village_bot.start(response_data.license);
                    delete SAM.multi_village_bot.license_check;
                    delete SAM.multi_village_bot.start;
                }
            } else {
                // show popup with error and license buy info
            }
        }
        backend_xhr.send(encode(JSON.stringify(data)));
    },
    BOTPROTECT: require(`${require.main.path}/SCRIPTS/botprotect/botprotect.js`),
    POP_UP: "",
    PRE_OBFUSCATED: JSON.parse(fs.readFileSync(`${__dirname}/preobfuscated_snippets.json`))
}