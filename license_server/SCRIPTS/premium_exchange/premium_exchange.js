require('dotenv').config()
var fs = require('fs');
var scripts = JSON.parse(fs.readFileSync('./scripts.json'));
module.exports = {
    VERSION: "1.0.1",
    HANDLE_REQUEST: async function (request_data) {
        var types = scripts[request_data.script].request_types;
        switch (types[request_data.type]) {
            case "LICENSE_CHECK":
                return {
                    status: true,
                    snippet: this.PRE_OBFUSCATED.LICENSE_CHECK
                };
            case "PREMIUM_EXCHANGE":
                return {
                    status: true,
                    snippet: this.PRE_OBFUSCATED.PREMIUM_EXCHANGE
                };
        }
    },
    PREMIUM_EXCHANGE: function premium_exchange(license) {
        "INSERT_LICENSE_CHECK_HERE"
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
        
        /* The slider */
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            -webkit-transition: 0.4s;
            transition: 0.4s;
        }
        
        .slider:before {
            position: absolute;
            content: "";
            height: 13px;
            width: 20px;
            left: 4px;
            bottom: 3px;
            background-color: white;
            -webkit-transition: 0.4s;
            transition: 0.4s;
        }
        
        input:checked + .slider {
            background-color: #2196f3;
        }
        
        input:focus + .slider {
            box-shadow: 0 0 1px #2196f3;
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
        
        /* Blinking status text */
        .blink {
            animation: blink 1s steps(2, end) infinite;
        }
        
        @keyframes blink {
            0% {
                opacity: 1;
            }
            50% {
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
        }
        `;
        document.head.appendChild(style);

        ////////// Tozsde Módosítók ////////////////////////////////////////////////////////////
        var hang = 1;
        var bot_check = 0;
        var tozsden_vasarlas_ultragyorsan = 1; // csak vesz, azonnal kiszedi a bennt levo nyersit, nem nézi a raktárat.
        var nyersi_elad = 0; // Állítsd 1-re ha nyersit szeretnél eladni
        var nyersi_vesz = 0; // Állítsd 1-re ha nyersit szeretnél venni
        var fa_elad = 1;
        var agyag_elad = 1;
        var vas_elad = 1;
        var fa_vesz = 0;
        var agyag_vesz = 0;
        var vas_vesz = 1;
        var fa_elad_arfolyam = 1200;
        var agyag_elad_arfolyam = 1200;
        var vas_elad_arfolyam = 1200;
        var fa_vesz_arfolyam = 60;
        var agyag_vesz_arfolyam = 60;
        var vas_vesz_arfolyam = 60;
        var nyersi_elad_arfolyam = 1200; // tozsde árfolyam ami alatt eladja a nyersit
        var nyersi_vesz_arfolyam = 60; // tozsde árfolyam ami felett veszi a nyersit
        var nyersi_vesz_max_pp = 1; // ennyi pp-t költhet egyszerre vásárláskor
        var rakiban_marad = 500; // eladáskor ennyi marad a raktárban
        var minimum_amit_elad = 100; // eladáskor ennyi nyersitol kezd el eladni
        var szabadkapac = 300; // ennyi százalékig tölti fel a raktárat amikor nyersit vesz
        var szabad_kereskedo = 0; // ennyi kereskedot hagy a faluban amikor nyersizik

        var auto_tozsde = 0; // kapcsold be ha nem szeretnéd nézni a tozsdét, automatán figyeli a piacot és a kívánt profit alapján dolgozik
        var tozsdemozgas_szamlalo = 1000; // ennyi tozsdemozgási adatból számol minimum, ha nincs ennyi még akkor a beírt értékeket veszi figyelembe
        var legkisebb_profit = 2; // legkisebb profit pp-ben adott nyersanyag eladás és vétel között (1 = nulla profit)
        var kenyszerített_profit = 1; // ha a profit sokkal nagyobb is lehetne az adatok alapján, akkor nem tozsdéz a legkisebb profit értékénél
        ////////////////////////////////////////////////////////////////////////////////////////
        var elad_hang = new Audio('https://freesound.org/data/previews/80/80921_1022651-lq.mp3');
        var vesz_hang = new Audio('https://freesound.org/data/previews/91/91926_7037-lq.mp3');
        var bot_hang = new Audio('https://freesound.org/data/previews/135/135613_2477074-lq.mp3');
        var settings = {};
        settings.hang = hang;
        settings.tozsden_vasarlas_ultragyorsan = tozsden_vasarlas_ultragyorsan;
        settings.nyersi_elad = nyersi_elad;
        settings.nyersi_vesz = nyersi_vesz;
        settings.fa_elad = fa_elad;
        settings.agyag_elad = agyag_elad;
        settings.vas_elad = vas_elad;
        settings.fa_vesz = fa_vesz;
        settings.agyag_vesz = agyag_vesz;
        settings.vas_vesz = vas_vesz;
        settings.fa_elad_arfolyam = fa_elad_arfolyam;
        settings.agyag_elad_arfolyam = agyag_elad_arfolyam;
        settings.vas_elad_arfolyam = vas_elad_arfolyam;
        settings.fa_vesz_arfolyam = fa_vesz_arfolyam;
        settings.agyag_vesz_arfolyam = agyag_vesz_arfolyam;
        settings.vas_vesz_arfolyam = vas_vesz_arfolyam;
        settings.nyersi_vesz_max_pp = nyersi_vesz_max_pp;
        settings.rakiban_marad = rakiban_marad;
        settings.minimum_amit_elad = minimum_amit_elad;
        settings.szabadkapac = szabadkapac;
        settings.szabad_kereskedo = szabad_kereskedo;
        settings.auto_tozsde = auto_tozsde;
        settings.tozsdemozgas_szamlalo = tozsdemozgas_szamlalo;
        settings.legkisebb_profit = legkisebb_profit;
        settings.kenyszerített_profit = kenyszerített_profit;
        settings.bot_check = bot_check;
        settings.start = 0;

        var item_not_exist = [null, "NaN", "undefined", undefined];
        var get_localstorage = JSON.parse(localStorage.getItem("SAM"));
        if (item_not_exist.includes(typeof (get_localstorage.premium_exchange))) {
            SAM.premium_exchange.settings = settings;
            localStorage.setItem("SAM", JSON.stringify(SAM));
        }
        else if (item_not_exist.includes(typeof (get_localstorage.premium_exchange.settings))) {
            SAM.premium_exchange.settings = settings;
            localStorage.setItem("SAM", JSON.stringify(SAM));
        }
        else {
            settings = get_localstorage.premium_exchange.settings;
        }
        function save_localstorage() {
            SAM.premium_exchange.settings = settings;
            localStorage.setItem("SAM", JSON.stringify(SAM));
        }
        start_pp();
        function start_pp() {
            createInput();
            function createInput() {
                var userInputParent = document.getElementById("premium_exchange_form"); // Parent element
                // Create input for setting how much res should be bought
                var divScript = document.createElement("div");
                divScript.setAttribute("id", "divScript");
                userInputParent.parentNode.insertBefore(divScript, userInputParent);
                document.getElementById("divScript").innerHTML = '<table class="vis modemenu" style="position: relative;"><tbody><tr><td style="min-width: 120px; text-align: center; vertical-align: middle;" colspan="4"><b>Premium Exchange Bot by <a href="https://discord.com/users/314454000949002241">-Sam</a></b></td></tr><tr><td style="min-width: 120px;">Buy ultrafast</td><td style="min-width: 200px;"><label class="switch"><input id="tozsden_vasarlas_ultragyorsan" type="checkbox" /><span class="slider round"></span></label></td><td style="min-width: 120px;">Sound</td><td style="min-width: 200px;"><label class="switch"><input id="hang" type="checkbox" /><span class="slider round"></span></label></td></tr><tr><td style="min-width: 120px;">Buy res</td><td style="min-width: 200px;"><label class="switch"><input id="nyersi_vesz" type="checkbox" /><span class="slider round"></span></label></td><td style="min-width: 120px;">Sell res </td><td style="min-width: 200px;"><label class="switch"><input id="nyersi_elad" type="checkbox" /><span class="slider round"></span></label></td></tr><tr><td style="min-width: 120px;">Buy wood</td><td style="min-width: 200px;"><label class="switch"><input id="fa_vesz" type="checkbox" /><span class="slider round"></span></label>&nbsp;above price: <input id="fa_vesz_arfolyam" size="5" value=100></td><td style="min-width: 120px;">Sell wood </td><td style="min-width: 200px;"><label class="switch"><input id="fa_elad" type="checkbox" /><span class="slider round"></span></label>&nbsp;under price: <input id="fa_elad_arfolyam" size="5" value=100></td></tr><tr><td style="min-width: 120px;">Buy stone</td><td style="min-width: 200px;"><label class="switch"><input id="agyag_vesz" type="checkbox" /><span class="slider round"></span></label>&nbsp;above price: <input id="agyag_vesz_arfolyam" size="5" value=100></td><td style="min-width: 120px;">Sell stone </td><td style="min-width: 200px;"><label class="switch"><input id="agyag_elad" type="checkbox" /><span class="slider round"></span></label>&nbsp;under price: <input id="agyag_elad_arfolyam" size="5" value=100></td></tr><tr><td style="min-width: 120px;">Buy iron</td><td style="min-width: 200px;"><label class="switch"><input id="vas_vesz" type="checkbox" /><span class="slider round"></span></label>&nbsp;above price: <input id="vas_vesz_arfolyam" size="5" value=100></td><td style="min-width: 120px;">Sell iron </td><td style="min-width: 200px;"><label class="switch"><input id="vas_elad" type="checkbox" /><span class="slider round"></span></label>&nbsp;under price: <input id="vas_elad_arfolyam" size="5" value=100></td></tr><tr><td style="min-width: 120px; vertical-align: middle;">Buy max PP</td><td style="min-width: 200px; vertical-align: middle;"><input id="nyersi_vesz_max_pp" max="100" min="2" type="range" value="15"></input><label id="nyersi_vesz_max_pp_label"></label></td></tr><tr><td style="min-width: 120px; vertical-align: middle;">Leave in village</td><td style="min-width: 200px; vertical-align: middle;"><input id="rakiban_marad" size="10" value=100></td><td style="min-width: 120px; vertical-align: middle;">Buy capacity </td><td style="min-width: 200px; vertical-align: middle;"><input id="szabadkapac" max="100" min="0" type="range" value="70"></input><label id="szabadkapac_label"></label></td></tr><tr><td style="min-width: 120px;">Min res to sell</td><td style="min-width: 200px;"><input id="minimum_amit_elad" size="10" value=500></td><td style="min-width: 120px;">Free merchants </td><td style="min-width: 200px;"><input id="szabad_kereskedo" size="10" value=0></td></tr><tr><tr><td></td></tr><tr><td style="min-width: 120px;">AUTO Exchange</td><td style="min-width: 200px;"><label class="switch"><input id="auto_tozsde" type="checkbox" /><span class="slider round"></span></label></td><td style="min-width: 120px;">Exchange data</td><td style="min-width: 200px;"><input id="tozsdemozgas_szamlalo" max="5000" min="300" type="range" value="1000"></input><label id="tozsdemozgas_szamlalo_label"></label></td></tr><tr><td style="min-width: 120px; vertical-align: middle;">Desired profit</td><td style="min-width: 200px; vertical-align: middle;"><input id="legkisebb_profit" max="4" min="1" type="range" step="0.1" value="2"></input><label id="legkisebb_profit_label"></label></td><td style="min-width: 120px; vertical-align: middle;">Forced profit</td><td style="min-width: 200px; vertical-align: middle;"><label class="switch"><input id="kenyszerített_profit" type="checkbox" /><span class="slider round"></span></label></td></tr><tr><td style="min-width: 120px; text-align: center; vertical-align: middle;"><button id="start_buy" class="btn">START</button></td><td style="min-width: 200px; text-align: center; vertical-align: middle;"><button id="start_save" class="btn">SAVE SETTINGS</button></td><td style="min-width: 120px; vertical-align: middle;">Bot check</td><td style="min-width: 200px; vertical-align: middle;"><input id="botriado" max="1" min="0" type="range" value="0"></input></td></tr><tr><td style="min-width: 120px;">Status:</td><td style="min-width: 200px; text-align: center; vertical-align: middle;"><label id="status"></label></td><td style="min-width: 120px;">Have issues?</td><td style="min-width: 200px; text-align: center; vertical-align: middle;"><button id="start_clear" class="btn">Clear script database</button></td></tr></tbody></table>';
            }
            function input_change_checker() {
                document.getElementById("nyersi_vesz_max_pp_label").innerHTML = "   " + document.getElementById("nyersi_vesz_max_pp").value + " PP";
                document.getElementById("szabadkapac_label").innerHTML = "   " + document.getElementById("szabadkapac").value + "%";
                document.getElementById("legkisebb_profit_label").innerHTML = "   " + document.getElementById("legkisebb_profit").value + "x";
                document.getElementById("tozsdemozgas_szamlalo_label").innerHTML = "   " + document.getElementById("tozsdemozgas_szamlalo").value;
            }
            setInterval(input_change_checker, 100);
            if (settings.hang === 1) { document.getElementById("hang").checked = true; }
            else if (settings.hang === 0) { document.getElementById("hang").checked = false; }
            if (settings.tozsden_vasarlas_ultragyorsan === 1) { document.getElementById("tozsden_vasarlas_ultragyorsan").checked = true; }
            else if (settings.tozsden_vasarlas_ultragyorsan === 1) { document.getElementById("tozsden_vasarlas_ultragyorsan").checked = false; }
            if (settings.nyersi_elad === 1) { document.getElementById("nyersi_elad").checked = true; }
            else if (settings.nyersi_elad === 1) { document.getElementById("nyersi_elad").checked = false; }
            if (settings.nyersi_vesz === 1) { document.getElementById("nyersi_vesz").checked = true; }
            else if (settings.nyersi_vesz === 1) { document.getElementById("nyersi_vesz").checked = false; }
            if (settings.fa_elad === 1) { document.getElementById("fa_elad").checked = true; }
            else if (settings.fa_elad === 1) { document.getElementById("fa_elad").checked = false; }
            if (settings.agyag_elad === 1) { document.getElementById("agyag_elad").checked = true; }
            else if (settings.agyag_elad === 1) { document.getElementById("agyag_elad").checked = false; }
            if (settings.vas_elad === 1) { document.getElementById("vas_elad").checked = true; }
            else if (settings.vas_elad === 1) { document.getElementById("vas_elad").checked = false; }
            if (settings.fa_vesz === 1) { document.getElementById("fa_vesz").checked = true; }
            else if (settings.fa_vesz === 1) { document.getElementById("fa_vesz").checked = false; }
            if (settings.agyag_vesz === 1) { document.getElementById("agyag_vesz").checked = true; }
            else if (settings.agyag_vesz === 1) { document.getElementById("agyag_vesz").checked = false; }
            if (settings.vas_vesz === 1) { document.getElementById("vas_vesz").checked = true; }
            else if (settings.vas_vesz === 1) { document.getElementById("vas_vesz").checked = false; }
            document.getElementById("fa_elad_arfolyam").value = +settings.fa_elad_arfolyam;
            document.getElementById("agyag_elad_arfolyam").value = +settings.agyag_elad_arfolyam;
            document.getElementById("vas_elad_arfolyam").value = +settings.vas_elad_arfolyam;
            document.getElementById("fa_vesz_arfolyam").value = +settings.fa_vesz_arfolyam;
            document.getElementById("agyag_vesz_arfolyam").value = +settings.agyag_vesz_arfolyam;
            document.getElementById("vas_vesz_arfolyam").value = +settings.vas_vesz_arfolyam;
            document.getElementById("nyersi_vesz_max_pp").value = +settings.nyersi_vesz_max_pp;
            document.getElementById("rakiban_marad").value = +settings.rakiban_marad;
            document.getElementById("minimum_amit_elad").value = +settings.minimum_amit_elad;
            document.getElementById("szabadkapac").value = +settings.szabadkapac;
            document.getElementById("szabad_kereskedo").value = +settings.szabad_kereskedo;
            if (settings.auto_tozsde === 1) { document.getElementById("auto_tozsde").checked = true; }
            else if (settings.auto_tozsde === 1) { document.getElementById("auto_tozsde").checked = false; }
            document.getElementById("tozsdemozgas_szamlalo").value = +settings.tozsdemozgas_szamlalo;
            document.getElementById("legkisebb_profit").value = +settings.legkisebb_profit;
            if (settings.kenyszerített_profit === 1) { document.getElementById("kenyszerített_profit").checked = true; }
            else if (settings.kenyszerített_profit === 1) { document.getElementById("kenyszerített_profit").checked = false; }
            document.getElementById("botriado").value = +settings.bot_check;

            hang = settings.hang;
            tozsden_vasarlas_ultragyorsan = settings.tozsden_vasarlas_ultragyorsan;
            nyersi_elad = settings.nyersi_elad;
            nyersi_vesz = settings.nyersi_vesz;
            fa_elad = settings.fa_elad;
            agyag_elad = settings.agyag_elad;
            vas_elad = settings.vas_elad;
            fa_vesz = settings.fa_vesz;
            agyag_vesz = settings.agyag_vesz;
            vas_vesz = settings.vas_vesz;
            fa_elad_arfolyam = +settings.fa_elad_arfolyam;
            agyag_elad_arfolyam = +settings.agyag_elad_arfolyam;
            vas_elad_arfolyam = +settings.vas_elad_arfolyam;
            fa_vesz_arfolyam = +settings.fa_vesz_arfolyam;
            agyag_vesz_arfolyam = +settings.agyag_vesz_arfolyam;
            vas_vesz_arfolyam = +settings.vas_vesz_arfolyam;
            nyersi_vesz_max_pp = +settings.nyersi_vesz_max_pp;
            rakiban_marad = +settings.rakiban_marad;
            minimum_amit_elad = +settings.minimum_amit_elad;
            szabadkapac = +settings.szabadkapac;
            szabad_kereskedo = +settings.szabad_kereskedo;
            auto_tozsde = settings.auto_tozsde;
            tozsdemozgas_szamlalo = +settings.tozsdemozgas_szamlalo;
            legkisebb_profit = +settings.legkisebb_profit;
            kenyszerített_profit = settings.kenyszerített_profit;
            bot_check = +settings.bot_check;

            if (+settings.start === 0) { document.getElementById("start_buy").innerHTML = "START"; }
            if (+settings.start === 1) { document.getElementById("start_buy").innerHTML = "STOP"; }
            document.getElementById("start_buy").addEventListener("click", function () {
                if (document.getElementById("hang").checked === true) { hang = 1; }
                else if (document.getElementById("hang").checked === false) { hang = 0; }
                if (document.getElementById("tozsden_vasarlas_ultragyorsan").checked === true) { tozsden_vasarlas_ultragyorsan = 1; }
                else if (document.getElementById("tozsden_vasarlas_ultragyorsan").checked === false) { tozsden_vasarlas_ultragyorsan = 0; }
                if (document.getElementById("nyersi_elad").checked === true) { nyersi_elad = 1; }
                else if (document.getElementById("nyersi_elad").checked === false) { nyersi_elad = 0; }
                if (document.getElementById("nyersi_vesz").checked === true) { nyersi_vesz = 1; }
                else if (document.getElementById("nyersi_vesz").checked === false) { nyersi_vesz = 0; }
                if (document.getElementById("fa_elad").checked === true) { fa_elad = 1; }
                else if (document.getElementById("fa_elad").checked === false) { fa_elad = 0; }
                if (document.getElementById("agyag_elad").checked === true) { agyag_elad = 1; }
                else if (document.getElementById("agyag_elad").checked === false) { agyag_elad = 0; }
                if (document.getElementById("vas_elad").checked === true) { vas_elad = 1; }
                else if (document.getElementById("vas_elad").checked === false) { vas_elad = 0; }
                if (document.getElementById("fa_vesz").checked === true) { fa_vesz = 1; }
                else if (document.getElementById("fa_vesz").checked === false) { fa_vesz = 0; }
                if (document.getElementById("agyag_vesz").checked === true) { agyag_vesz = 1; }
                else if (document.getElementById("agyag_vesz").checked === false) { agyag_vesz = 0; }
                if (document.getElementById("vas_vesz").checked === true) { vas_vesz = 1; }
                else if (document.getElementById("vas_vesz").checked = false) { vas_vesz = 0; }
                fa_elad_arfolyam = +document.getElementById("fa_elad_arfolyam").value;
                agyag_elad_arfolyam = +document.getElementById("agyag_elad_arfolyam").value;
                vas_elad_arfolyam = +document.getElementById("vas_elad_arfolyam").value;
                fa_vesz_arfolyam = +document.getElementById("fa_vesz_arfolyam").value;
                agyag_vesz_arfolyam = +document.getElementById("agyag_vesz_arfolyam").value;
                vas_vesz_arfolyam = +document.getElementById("vas_vesz_arfolyam").value;
                nyersi_vesz_max_pp = +document.getElementById("nyersi_vesz_max_pp").value;
                rakiban_marad = +document.getElementById("rakiban_marad").value;
                minimum_amit_elad = +document.getElementById("minimum_amit_elad").value;
                szabadkapac = +document.getElementById("szabadkapac").value;
                szabad_kereskedo = +document.getElementById("szabad_kereskedo").value;
                if (document.getElementById("auto_tozsde").checked === true) { auto_tozsde = 1; }
                else if (document.getElementById("auto_tozsde").checked === false) { auto_tozsde = 0; }
                tozsdemozgas_szamlalo = +document.getElementById("tozsdemozgas_szamlalo").value;
                legkisebb_profit = +document.getElementById("legkisebb_profit").value;
                if (document.getElementById("kenyszerített_profit").checked === true) { kenyszerített_profit = 1; }
                else if (document.getElementById("kenyszerített_profit").checked === false) { kenyszerített_profit = 0; }
                bot_check = +document.getElementById("botriado").value;

                settings.hang = hang;
                settings.tozsden_vasarlas_ultragyorsan = tozsden_vasarlas_ultragyorsan;
                settings.nyersi_elad = nyersi_elad;
                settings.nyersi_vesz = nyersi_vesz;
                settings.fa_elad = fa_elad;
                settings.agyag_elad = agyag_elad;
                settings.vas_elad = vas_elad;
                settings.fa_vesz = fa_vesz;
                settings.agyag_vesz = agyag_vesz;
                settings.vas_vesz = vas_vesz;
                settings.fa_elad_arfolyam = fa_elad_arfolyam;
                settings.agyag_elad_arfolyam = agyag_elad_arfolyam;
                settings.vas_elad_arfolyam = vas_elad_arfolyam;
                settings.fa_vesz_arfolyam = fa_vesz_arfolyam;
                settings.agyag_vesz_arfolyam = agyag_vesz_arfolyam;
                settings.vas_vesz_arfolyam = vas_vesz_arfolyam;
                settings.nyersi_vesz_max_pp = nyersi_vesz_max_pp;
                settings.rakiban_marad = rakiban_marad;
                settings.minimum_amit_elad = minimum_amit_elad;
                settings.szabadkapac = szabadkapac;
                settings.szabad_kereskedo = szabad_kereskedo;
                settings.auto_tozsde = auto_tozsde;
                settings.tozsdemozgas_szamlalo = tozsdemozgas_szamlalo;
                settings.legkisebb_profit = legkisebb_profit;
                settings.kenyszerített_profit = kenyszerített_profit;
                settings.bot_check = bot_check;
                if (+settings.start === 0) { settings.start = 1; }
                else if (+settings.start === 1) { settings.start = 0; }
                save_localstorage();
                if (+settings.start === 1) { document.getElementById("start_buy").innerHTML = "STOP"; }
                if (+settings.start === 0) { document.getElementById("start_buy").innerHTML = "START"; }
            });
            document.getElementById("start_save").addEventListener("click", function () {
                if (document.getElementById("hang").checked === true) { hang = 1; }
                else if (document.getElementById("hang").checked === false) { hang = 0; }
                if (document.getElementById("tozsden_vasarlas_ultragyorsan").checked === true) { tozsden_vasarlas_ultragyorsan = 1; }
                else if (document.getElementById("tozsden_vasarlas_ultragyorsan").checked === false) { tozsden_vasarlas_ultragyorsan = 0; }
                if (document.getElementById("nyersi_elad").checked === true) { nyersi_elad = 1; }
                else if (document.getElementById("nyersi_elad").checked === false) { nyersi_elad = 0; }
                if (document.getElementById("nyersi_vesz").checked === true) { nyersi_vesz = 1; }
                else if (document.getElementById("nyersi_vesz").checked === false) { nyersi_vesz = 0; }
                if (document.getElementById("fa_elad").checked === true) { fa_elad = 1; }
                else if (document.getElementById("fa_elad").checked === false) { fa_elad = 0; }
                if (document.getElementById("agyag_elad").checked === true) { agyag_elad = 1; }
                else if (document.getElementById("agyag_elad").checked === false) { agyag_elad = 0; }
                if (document.getElementById("vas_elad").checked === true) { vas_elad = 1; }
                else if (document.getElementById("vas_elad").checked === false) { vas_elad = 0; }
                if (document.getElementById("fa_vesz").checked === true) { fa_vesz = 1; }
                else if (document.getElementById("fa_vesz").checked === false) { fa_vesz = 0; }
                if (document.getElementById("agyag_vesz").checked === true) { agyag_vesz = 1; }
                else if (document.getElementById("agyag_vesz").checked === false) { agyag_vesz = 0; }
                if (document.getElementById("vas_vesz").checked === true) { vas_vesz = 1; }
                else if (document.getElementById("vas_vesz").checked = false) { vas_vesz = 0; }
                fa_elad_arfolyam = +document.getElementById("fa_elad_arfolyam").value;
                agyag_elad_arfolyam = +document.getElementById("agyag_elad_arfolyam").value;
                vas_elad_arfolyam = +document.getElementById("vas_elad_arfolyam").value;
                fa_vesz_arfolyam = +document.getElementById("fa_vesz_arfolyam").value;
                agyag_vesz_arfolyam = +document.getElementById("agyag_vesz_arfolyam").value;
                vas_vesz_arfolyam = +document.getElementById("vas_vesz_arfolyam").value;
                nyersi_vesz_max_pp = +document.getElementById("nyersi_vesz_max_pp").value;
                rakiban_marad = +document.getElementById("rakiban_marad").value;
                minimum_amit_elad = +document.getElementById("minimum_amit_elad").value;
                szabadkapac = +document.getElementById("szabadkapac").value;
                szabad_kereskedo = +document.getElementById("szabad_kereskedo").value;
                if (document.getElementById("auto_tozsde").checked === true) { auto_tozsde = 1; }
                else if (document.getElementById("auto_tozsde").checked === false) { auto_tozsde = 0; }
                tozsdemozgas_szamlalo = +document.getElementById("tozsdemozgas_szamlalo").value;
                legkisebb_profit = +document.getElementById("legkisebb_profit").value;
                if (document.getElementById("kenyszerített_profit").checked === true) { kenyszerített_profit = 1; }
                else if (document.getElementById("kenyszerített_profit").checked === false) { kenyszerített_profit = 0; }
                bot_check = +document.getElementById("botriado").value;

                settings.hang = hang;
                settings.tozsden_vasarlas_ultragyorsan = tozsden_vasarlas_ultragyorsan;
                settings.nyersi_elad = nyersi_elad;
                settings.nyersi_vesz = nyersi_vesz;
                settings.fa_elad = fa_elad;
                settings.agyag_elad = agyag_elad;
                settings.vas_elad = vas_elad;
                settings.fa_vesz = fa_vesz;
                settings.agyag_vesz = agyag_vesz;
                settings.vas_vesz = vas_vesz;
                settings.fa_elad_arfolyam = fa_elad_arfolyam;
                settings.agyag_elad_arfolyam = agyag_elad_arfolyam;
                settings.vas_elad_arfolyam = vas_elad_arfolyam;
                settings.fa_vesz_arfolyam = fa_vesz_arfolyam;
                settings.agyag_vesz_arfolyam = agyag_vesz_arfolyam;
                settings.vas_vesz_arfolyam = vas_vesz_arfolyam;
                settings.nyersi_vesz_max_pp = nyersi_vesz_max_pp;
                settings.rakiban_marad = rakiban_marad;
                settings.minimum_amit_elad = minimum_amit_elad;
                settings.szabadkapac = szabadkapac;
                settings.szabad_kereskedo = szabad_kereskedo;
                settings.auto_tozsde = auto_tozsde;
                settings.tozsdemozgas_szamlalo = tozsdemozgas_szamlalo;
                settings.legkisebb_profit = legkisebb_profit;
                settings.kenyszerített_profit = kenyszerített_profit;
                settings.bot_check = bot_check;
                settings.start = settings.start;
                save_localstorage();
                UI.SuccessMessage("Settings saved successfully!")
            });
            document.getElementById("start_clear").addEventListener("click", function () {
                var this_world = game_data.world;
                var this_player = game_data.player.name;
                var tozsde_auto_data_this_world = "exchange_auto_data" + this_player + this_world;
                localStorage.removeItem(tozsde_auto_data_this_world);
                UI.SuccessMessage("Cleared the exchange database!");
            });
            tozsdi();
        }
        function tozsdi() {
            if (game_data.world.includes("p") === true) { document.getElementById("status").innerHTML = '<span class="blink">NOT USEABLE ON CASUAL</span>'; return; }
            else if (game_data.world.includes("p") === false) {
                if (+settings.start === 0) {
                    setTimeout(tozsdi, 500);
                    document.getElementById("status").innerHTML = '<span class="blink">IDLE</span>';
                }
                else if (+settings.start === 1) {
                    if (tozsden_vasarlas_ultragyorsan === 0) { tozsdi_sima(); }
                    if (tozsden_vasarlas_ultragyorsan === 1) { tozsdi_ultra(); }
                }
            }
        }
        function tozsdi_sima() {
            document.getElementById("status").innerHTML = '<span class="blink">STARTING</span>';
            if (game_data.world.includes("p") === true) { document.getElementById("status").innerHTML = '<span class="blink">NOT USEABLE ON CASUAL</span>'; return; }
            if (BotProtect.forced) { document.getElementById("status").innerHTML = '<span class="blink">BOT CHECK!</span>'; setTimeout(tozsdi, 5000); return; }
            setTimeout(start, 800);
            tozsde_auto_data();
            var keya;
            var key_value;
            get_market_key();
            var toltikapac;
            if (szabadkapac < 10) { toltikapac = +("0.0" + szabadkapac); }
            else if (szabadkapac < 100) { toltikapac = +("0." + szabadkapac); }
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
                if (BotProtect.forced) { document.getElementById("status").innerHTML = '<span class="blink">BOT CHECK!</span>'; setTimeout(start, delay_between_reset); return; }
                if (+settings.start === 0) { document.getElementById("status").innerHTML = '<span class="blink">IDLE</span>'; setTimeout(start, delay_between_reset); return; }
                else if (+settings.start === 1) { document.getElementById("status").innerHTML = '<span class="blink">RUNNING</span>'; }
                merchAvail = document.getElementById("market_merchant_available_count").innerText;
                var delay_between_sleep = Math.round((Math.random() * 6) + 100);

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
                else if (auto_tozsde === 1 && nyersi_elad === 1 && merchAvail > 0 && tozsdemozgas_szamlalo > utolso && tozsde_i <= delay_between_sleep && ((wood.price <= fa_elad_arfolyam && wood.price < wood.inVillage) || (stone.price <= agyag_elad_arfolyam && stone.price < stone.inVillage) || (iron.price <= vas_elad_arfolyam && iron.price < iron.inVillage))) {
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
                else if (auto_tozsde === 1 && nyersi_vesz === 1 && tozsdemozgas_szamlalo > utolso && tozsde_i <= delay_between_sleep && (wood.price >= fa_vesz_arfolyam || stone.price >= agyag_vesz_arfolyam || iron.price >= vas_vesz_arfolyam)) {
                    buyResource();
                    tozsde_i++;
                }
                else if (auto_tozsde === 0 && nyersi_elad === 1 && (fa_elad === 1 || agyag_elad === 1 || vas_elad === 1) && merchAvail > 0 && tozsde_i <= delay_between_sleep && ((wood.price <= fa_elad_arfolyam && wood.price < wood.inVillage) || (stone.price <= agyag_elad_arfolyam && stone.price < stone.inVillage) || (iron.price <= vas_elad_arfolyam && iron.price < iron.inVillage))) {
                    sellResource();
                    tozsde_i++;
                }
                else if (auto_tozsde === 0 && nyersi_vesz === 1 && (fa_vesz === 1 || agyag_vesz === 1 || vas_vesz === 1) && tozsde_i <= delay_between_sleep && (wood.price >= fa_vesz_arfolyam || stone.price >= agyag_vesz_arfolyam || iron.price >= vas_vesz_arfolyam)) {
                    buyResource();
                    tozsde_i++;
                }
                else {
                    delay_between_reset = Math.floor((Math.random() * 3000) + 1000);
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
                var sellres_type = [fa_elad, agyag_elad, vas_elad];
                var sellres_price = [fa_elad_arfolyam, agyag_elad_arfolyam, vas_elad_arfolyam];
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
                    if (allRes[i - 1].stock < allRes[i - 1].max && allRes[i - 1].inVillage > rakiban_marad && allRes[i - 1].price <= sellres_price[i - 1] && sellres_type[i - 1] !== 0) {
                        sellThis = Math.round(Math.min(((allRes[i - 1].max - allRes[i - 1].stock) / 1.025), ((allRes[i - 1].inVillage - rakiban_marad - allRes[i - 1].price) / 1.025)));
                        if (Math.ceil(((sellThis + allRes[i - 1].price) * 1.025) / 1000) > merchAvail) {
                            sellThis = Math.round((merchAvail * 1000 - allRes[i - 1].price) / 1.025);
                        }
                        if (sellThis < minimum_amit_elad) {
                            sellThis = 0;
                        }
                        else if (sellThis > minimum_amit_elad) {
                            sell(resbeir, sellThis);
                            if (hang === 1) { elad_hang.play(); }
                            clearInterval(interval);
                            setTimeout(start, (delay_between_clicks + Math.floor((Math.random() * 3000) + 6550)));
                            return;
                        }
                    }
                    i++;
                    if (i >= 4) {
                        clearInterval(interval);
                        i = 1;
                        setTimeout(start, delay_between_clicks);
                    }
                }, adas_interval)

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
                var buyres_type = [fa_vesz, agyag_vesz, vas_vesz];
                var buyres_price = [fa_vesz_arfolyam, agyag_vesz_arfolyam, vas_vesz_arfolyam];
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
                    if (allRes[w].stock <= allRes[w].max && (allRes[w].inVillage + this_inc[w]) < (rakimeret * toltikapac) && allRes[w].price >= buyres_price[w] && allRes[w].stock >= buyres_price[w] && buyres_type[w] !== 0) {
                        buyThis = Math.round(Math.min((allRes[w].price * nyersi_vesz_max_pp - allRes[w].price), (rakimeret * toltikapac - allRes[w].inVillage - this_inc[w])));
                        if (allRes[w].stock < buyThis && allRes[w].price >= buyres_price[w] && allRes[w].stock >= buyres_price[w] && allRes[w].stock > allRes[w].price) { buyThis = allRes[w].stock - allRes[w].price; }
                        else if (allRes[w].stock < buyThis && allRes[w].price >= buyres_price[w] && allRes[w].stock >= buyres_price[w] && allRes[w].stock <= allRes[w].price) { buyThis = buyres_price[w] - 10; }
                        if (buyThis < 0) {
                            buyThis = 0;
                        }
                        if (buyThis != 0) {
                            buy(resbeir, buyThis);
                            if (hang === 1) { vesz_hang.play(); }
                            clearInterval(interval);
                            setTimeout(start, (delay_between_clicks + Math.floor((Math.random() * 3000) + 6550)));
                            return;
                        }
                    }
                    i++;
                    if (i >= 4) {
                        clearInterval(interval);
                        i = 1;
                        setTimeout(start, delay_between_clicks);
                    }
                }, adas_interval)

            }
            function tozsde_auto_data() {
                var tozsde_auto_data = {};
                var old_wood = 0;
                var old_stone = 0;
                var old_iron = 0;
                var wood = resInfo("wood");
                var stone = resInfo("stone");
                var iron = resInfo("iron");
                if (settings.tozsde_auto_data_counter === undefined) { settings.tozsde_auto_data_counter = 0; save_localstorage(); }
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
                        if (localStorage.getItem("exchange_auto_data") === null || localStorage.getItem("exchange_auto_data") === "NaN") {
                            tozsde_auto_data[settings.tozsde_auto_data_counter] = { time: timedate, wood: wood.price, stone: stone.price, iron: iron.price };
                            localStorage.setItem("exchange_auto_data", JSON.stringify(tozsde_auto_data));
                        }
                        else {
                            tozsde_auto_data = JSON.parse(localStorage.getItem("tozsde_auto_data"));
                            old_data = new_data;
                            var new_local_this_world = Object.assign(tozsde_auto_data, { [settings.tozsde_auto_data_counter]: { time: timedate, wood: old_data.wood, stone: old_data.stone, iron: old_data.iron } });
                            settings.tozsde_auto_data_counter++;
                            localStorage.setItem("exchange_auto_data", JSON.stringify(new_local_this_world));
                            save_localstorage();
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
                            if (hang === 1) { vesz_hang.play(); }
                            clearInterval(interval);
                            setTimeout(start, (delay_between_clicks + Math.floor((Math.random() * 3000) + 6550)));
                            return;
                        }
                    }
                    j++;
                    if (j >= 4) {
                        clearInterval(interval);
                        j = 1;
                        setTimeout(start, delay_between_clicks);
                    }
                }, adas_interval)
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
                            if (hang === 1) { elad_hang.play(); }
                            clearInterval(interval);
                            setTimeout(start, (delay_between_clicks + Math.floor((Math.random() * 3000) + 6550)));
                            return;
                        }
                    }
                    k++;
                    if (k >= 4) {
                        clearInterval(interval);
                        k = 1;
                        setTimeout(start, delay_between_clicks);
                    }
                }, adas_interval)
            }
            function sell(res, amnt) {
                var isBuying = true;
                var data = [
                    { name: "sell_" + res, value: amnt },
                ]
                TribalWars.post("market", { ajaxaction: "exchange_begin" }, data, function (r) {
                    if (r[0].error) {
                        isBuying = false;
                        return;
                    }
                    let rate_hash = r[0].rate_hash;
                    let buy_amnt = -r[0].amount;
                    var data = [
                        { name: "rate_" + res, value: rate_hash },
                        { name: "sell_" + res, value: buy_amnt },
                        { name: "mb", value: 1 },
                    ]
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
            function buy(res, amnt) {
                var isBuying = true;
                var data = [
                    { name: "buy_" + res, value: amnt },
                ]
                TribalWars.post("market", { ajaxaction: "exchange_begin" }, data, function (r) {
                    if (r[0].error) {
                        isBuying = false;
                        return;
                    }
                    let rate_hash = r[0].rate_hash;
                    let buy_amnt = -r[0].amount;
                    var data = [
                        { name: "rate_" + res, value: rate_hash },
                        { name: "buy_" + res, value: buy_amnt },
                        { name: "mb", value: 1 },
                    ]
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
            document.getElementById("status").innerHTML = '<span class="blink">STARTING</span>';
            if (game_data.world.includes("p") === true) { document.getElementById("status").innerHTML = '<span class="blink">NOT USEABLE ON CASUAL</span>'; return; }
            if (BotProtect.forced) { document.getElementById("status").innerHTML = '<span class="blink">BOT CHECK!</span>'; return; }
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
            setInterval(function () { delay_between_clicks = Math.floor((Math.random() * 50) + 50); }, 100); // ms
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
                if (BotProtect.forced) { document.getElementById("status").innerHTML = '<span class="blink">BOT CHECK!</span>'; setTimeout(start, delay_between_reset); return; }
                if (+settings.start === 0) { document.getElementById("status").innerHTML = '<span class="blink">IDLE</span>'; setTimeout(start, delay_between_reset); return; }
                else if (+settings.start === 1) { document.getElementById("status").innerHTML = '<span class="blink">RUNNING</span>'; }
                merchAvail = document.getElementById("market_merchant_available_count").innerText;
                var delay_between_sleep = Math.round((Math.random() * 6) + 1000);
                if (game_data.world.includes("p") === false & !BotProtect.forced & (wood.price >= fa_vesz_arfolyam || stone.price >= agyag_vesz_arfolyam || iron.price >= vas_vesz_arfolyam)) {
                    buyResource();
                }
                else {
                    delay_between_reset = Math.floor((Math.random() * 40) + 40);
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
                if (document.URL.match("klanhaboru.hu")) { incoming = "Beérkezo"; }
                else if (document.URL.match("tribalwars.net")) { incoming = "Incoming"; }
                else if (document.URL.match("die-staemme.de")) { incoming = "Eintreffend"; }
                else if (document.URL.match("staemme.ch")) { incoming = "Ihträffänd"; }
                else if (document.URL.match("tribalwars.nl")) { incoming = "Aankomend"; }
                else if (document.URL.match("plemiona.pl")) { incoming = "Przybywajace"; }
                else if (document.URL.match("tribalwars.com.br")) { incoming = "Entrada"; }
                else if (document.URL.match("tribalwars.com.pt")) { incoming = "A chegar"; }
                else if (document.URL.match("divokekmeny.cz")) { incoming = "Pricházející"; }
                else if (document.URL.match("triburile.ro")) { incoming = "Sosire"; }
                else if (document.URL.match("voyna-plemyon.ru")) { incoming = "???????????"; }
                else if (document.URL.match("fyletikesmaxes.gr")) { incoming = "??se???µe???"; }
                else if (document.URL.match("divoke-kmene.sk")) { incoming = "Prichádzajúce"; }
                else if (document.URL.match("tribals.it")) { incoming = "In arrivo"; }
                else if (document.URL.match("klanlar.org")) { incoming = "Gelen"; }
                else if (document.URL.match("guerretribale.fr")) { incoming = "Arrivant"; }
                else if (document.URL.match("guerrastribales.es")) { incoming = "Entrante"; }
                else if (document.URL.match("tribalwars.ae")) { incoming = "???????"; }
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
                var buyres_type = [fa_vesz, agyag_vesz, vas_vesz];
                var buyres_price = [fa_vesz_arfolyam, agyag_vesz_arfolyam, vas_vesz_arfolyam];
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
                    if (allRes[w].stock <= allRes[w].max && allRes[w].price >= buyres_price[w] && allRes[w].stock >= buyres_price[w] && buyres_type[w] !== 0) {
                        buyThis = Math.round(Math.min((allRes[w].price * nyersi_vesz_max_pp - allRes[w].price)));
                        if (allRes[w].stock < buyThis && allRes[w].price >= buyres_price[w] && allRes[w].stock >= buyres_price[w]) { buyThis = allRes[w].stock - 5 }
                        else if (allRes[w].stock < buyThis && allRes[w].price >= buyres_price[w] && allRes[w].stock >= buyres_price[w] && allRes[w].stock <= allRes[w].price) { buyThis = buyres_price[w] - 10; }
                        if (buyThis < 0) {
                            buyThis = 0;
                        }
                        if (buyThis != 0) {
                            buy(resbeir, buyThis);
                            if (hang === 1) { vesz_hang.play(); }
                            clearInterval(interval);
                            setTimeout(start, (delay_between_clicks + Math.floor((Math.random() * 4000) + 7550)));
                            return;
                        }
                    }
                    i++;
                    if (i >= 4) {
                        clearInterval(interval);
                        i = 1;
                        delay_between_reset = Math.floor((Math.random() * 30) + 30);
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
            script: "premium_exchange"
        };
        backend_xhr.open("POST", process.env.SELL_NODE_DOMAIN, true);
        backend_xhr.setRequestHeader("Content-Type", "application/json");
        backend_xhr.setRequestHeader("developer", "-Sam");
        backend_xhr.onreadystatechange = function () {
            if (backend_xhr.readyState === 4 && backend_xhr.status === 200) {
                var response_data = JSON.parse(backend_xhr.responseText);
                if (response_data.status === "OK") {
                    if (item_not_exist.includes(typeof SAM.premium_exchange)) { SAM.premium_exchange = {}; }
                    SAM.premium_exchange.license_check = Function(`return ${response_data.snippet}`)();
                    SAM.premium_exchange.license_check();
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
        SAM.premium_exchange.get_player_data = encode(await get_player_data);
        var backend_xhr = new XMLHttpRequest();
        var data = {
            type: "get_script",
            script: "premium_exchange",
            player: encode(await get_player_data)
        };
        backend_xhr.open("POST", process.env.SELL_NODE_DOMAIN, true);
        backend_xhr.setRequestHeader("Content-Type", "application/json");
        backend_xhr.setRequestHeader("developer", "-Sam");
        backend_xhr.onreadystatechange = function () {
            if (backend_xhr.readyState === 4 && backend_xhr.status === 200) {
                var response_data = JSON.parse(backend_xhr.responseText);
                if (response_data.status === "OK" && response_data.license.valid) {
                    SAM.premium_exchange.start = Function(`return ${response_data.snippet}`)();
                    SAM.premium_exchange.start(response_data.license);
                    delete SAM.premium_exchange.license_check;
                    delete SAM.premium_exchange.start;
                }
            } else {
                // show popup with error and license buy info
            }
        }
        backend_xhr.send(encode(JSON.stringify(data)));
    },
    POP_UP: "",
    PRE_OBFUSCATED: JSON.parse(fs.readFileSync(`${__dirname}/preobfuscated_snippets.json`))
}