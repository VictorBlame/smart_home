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
            case "COIN_MINT":
                return {
                    status: true,
                    snippet: this.PRE_OBFUSCATED.COIN_MINT
                };
        }
    },
    COIN_MINT: function coin_mint(license) {
        "INSERT_LICENSE_CHECK_HERE"
        var leltarnyersi_hasznalas = 1;
        var nyersi_osszehuzas = 1;
        var raktar_percent = 50;
        var leltarnyersi_hasznalas_ideje = 10; // óránként használ csomagot
        var nyersi_osszehuzas_ideje = 5; // percenkent huzza be a nyersit
        var erme_csekkolas_ideje = 1; // másodpercenként csekkolja az üthető érméket
        var megy_valami = 0;

        var settings = {};
        settings.leltarnyersi_hasznalas = leltarnyersi_hasznalas;
        settings.nyersi_osszehuzas = nyersi_osszehuzas;
        settings.raktar_percent = raktar_percent;
        settings.leltarnyersi_hasznalas_ideje = leltarnyersi_hasznalas_ideje;
        settings.nyersi_osszehuzas_ideje = nyersi_osszehuzas_ideje;
        settings.erme_csekkolas_ideje = erme_csekkolas_ideje;
        settings.start = 0;
        settings.ermezo_kotor_post = 0;
        settings.leltar_nyersi_post = 0;

        var item_not_exist = [null, "NaN", "undefined", undefined];
        var get_localstorage = JSON.parse(localStorage.getItem("SAM"));
        if (item_not_exist.includes(typeof (get_localstorage.coin_mint))) {
            SAM.coin_mint.settings = settings;
            localStorage.setItem("SAM", JSON.stringify(SAM));
        }
        else if (item_not_exist.includes(typeof (get_localstorage.coin_mint.settings))) {
            SAM.coin_mint.settings = settings;
            localStorage.setItem("SAM", JSON.stringify(SAM));
        }
        else {
            settings = get_localstorage.coin_mint.settings;
        }
        function save_localstorage() {
            SAM.coin_mint.settings = settings;
            localStorage.setItem("SAM", JSON.stringify(SAM));
        }
        function createInput() {
            var userInputParent = document.getElementsByClassName("vis")[1]; // Parent element
            var divScript = document.createElement("div");
            divScript.setAttribute("id", "divScript");
            userInputParent.parentNode.insertBefore(divScript, userInputParent);
            document.getElementById("divScript").innerHTML = '<p><input type=\"checkbox\" name=\"nyersi_osszehuzas\" id=\"nyersi_osszehuzas\"><label title="a jelenlegi faluba húzza össze a nyersanyagokat arányosan"> nyersi összehúzás </label>&nbsp;&nbsp;&nbsp;&nbsp; ennyi percenként: <input size=5 id="nyersi_osszehuzas_ideje"><span id="nyersi_osszehuzas_ideje"></span></label></p><p> <input type=\"checkbox\" name=\"leltarnyersi_hasznalas\" id=\"leltarnyersi_hasznalas\"><label title="használ nyersanyagcsomagot amenyiben elfogy a nyersanyag"> leltár nyersi </label> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ennyi óránként ellenőrizze: <input size=5 id="leltarnyersi_hasznalas_ideje"><span id="leltarnyersi_hasznalas_ideje"></span> &nbsp;&nbsp;&nbsp;&nbsp; raktár százalék: <input size=5 id="raktar_percent"><span id="raktar_percent"></span></p><p><button id="start_coin" class="btn">START</button>&nbsp;&nbsp;&nbsp;<button id="save_coin" class="btn">MENTÉS</button></p>';
        }
        createInput();
        if (settings.leltarnyersi_hasznalas === 1) { document.getElementById("leltarnyersi_hasznalas").checked = true; }
        if (settings.nyersi_osszehuzas === 1) { document.getElementById("nyersi_osszehuzas").checked = true; }
        document.getElementById("raktar_percent").value = +settings.raktar_percent;
        document.getElementById("leltarnyersi_hasznalas_ideje").value = +settings.leltarnyersi_hasznalas_ideje;
        document.getElementById("nyersi_osszehuzas_ideje").value = +settings.nyersi_osszehuzas_ideje;

        if (document.getElementById("leltarnyersi_hasznalas").checked === true) { leltarnyersi_hasznalas = 1; }
        else if (document.getElementById("leltarnyersi_hasznalas").checked === false) { leltarnyersi_hasznalas = 0; }
        if (document.getElementById("nyersi_osszehuzas").checked === true) { nyersi_osszehuzas = 1; }
        else if (document.getElementById("nyersi_osszehuzas").checked === false) { nyersi_osszehuzas = 0; }
        raktar_percent = +document.getElementById("raktar_percent").value;
        leltarnyersi_hasznalas_ideje = +document.getElementById("leltarnyersi_hasznalas_ideje").value;
        nyersi_osszehuzas_ideje = +document.getElementById("nyersi_osszehuzas_ideje").value;

        if (+settings.start === 0) { document.getElementById("start_coin").innerHTML = "START"; }
        if (+settings.start === 1) { document.getElementById("start_coin").innerHTML = "STOP"; }
        document.getElementById("start_coin").addEventListener("click", function () {
            if (document.getElementById("leltarnyersi_hasznalas").checked === true) { leltarnyersi_hasznalas = 1; }
            else if (document.getElementById("leltarnyersi_hasznalas").checked === false) { leltarnyersi_hasznalas = 0; }
            if (document.getElementById("nyersi_osszehuzas").checked === true) { nyersi_osszehuzas = 1; }
            else if (document.getElementById("nyersi_osszehuzas").checked === false) { nyersi_osszehuzas = 0; }
            raktar_percent = +document.getElementById("raktar_percent").value;
            leltarnyersi_hasznalas_ideje = +document.getElementById("leltarnyersi_hasznalas_ideje").value;
            nyersi_osszehuzas_ideje = +document.getElementById("nyersi_osszehuzas_ideje").value;
            settings.leltarnyersi_hasznalas = leltarnyersi_hasznalas;
            settings.nyersi_osszehuzas = nyersi_osszehuzas;
            settings.raktar_percent = raktar_percent;
            settings.leltarnyersi_hasznalas_ideje = leltarnyersi_hasznalas_ideje;
            settings.nyersi_osszehuzas_ideje = nyersi_osszehuzas_ideje;
            settings.erme_csekkolas_ideje = erme_csekkolas_ideje;
            if (+settings.start === 0) { settings.start = 1; }
            else if (+settings.start === 1) { settings.start = 0; save_localstorage(); window.location.reload(true); return; }
            save_localstorage();
            if (+settings.start === 1) { document.getElementById("start_coin").innerHTML = "STOP"; }
            if (+settings.start === 0) { document.getElementById("start_coin").innerHTML = "START"; }
        });
        document.getElementById("save_coin").addEventListener("click", function () {
            if (document.getElementById("leltarnyersi_hasznalas").checked === true) { leltarnyersi_hasznalas = 1; }
            else if (document.getElementById("leltarnyersi_hasznalas").checked === false) { leltarnyersi_hasznalas = 0; }
            if (document.getElementById("nyersi_osszehuzas").checked === true) { nyersi_osszehuzas = 1; }
            else if (document.getElementById("nyersi_osszehuzas").checked === false) { nyersi_osszehuzas = 0; }
            raktar_percent = +document.getElementById("raktar_percent").value;
            leltarnyersi_hasznalas_ideje = +document.getElementById("leltarnyersi_hasznalas_ideje").value;
            nyersi_osszehuzas_ideje = +document.getElementById("nyersi_osszehuzas_ideje").value;
            settings.leltarnyersi_hasznalas = leltarnyersi_hasznalas;
            settings.nyersi_osszehuzas = nyersi_osszehuzas;
            settings.raktar_percent = raktar_percent;
            settings.leltarnyersi_hasznalas_ideje = leltarnyersi_hasznalas_ideje;
            settings.nyersi_osszehuzas_ideje = nyersi_osszehuzas_ideje;
            settings.erme_csekkolas_ideje = erme_csekkolas_ideje;
            save_localstorage();
        });
        pre_coin();
        function pre_coin() {
            if (+settings.start === 1) { vezerlo(); }
            else { setTimeout(pre_coin, 500); }
        }
        function vezerlo() {
            var coin_xxx_delay = Math.floor(Math.random() * 500 + 200);
            setTimeout(check_coin, coin_xxx_delay);
            var kotor_nyersi = Math.floor(Math.random() * 120000 + (nyersi_osszehuzas_ideje * 60 * 1000));
            var kotor_nyersi_now = Date.now();
            function check_kotor_nyersi_time() {
                if (settings.ermezo_kotor_post < kotor_nyersi_now && nyersi_osszehuzas === 1) {
                    getRes();
                    kotor_nyersi = Math.floor(Math.random() * 1200000 + (nyersi_osszehuzas_ideje * 60 * 1000));
                    settings.ermezo_kotor_post = Date.now() + kotor_nyersi;
                    save_localstorage();
                }
                else { setTimeout(check_kotor_nyersi_time, 10000); }
            }
            check_kotor_nyersi_time();

            var leltar_nyersi = Math.floor(Math.random() * 1800000 + (leltarnyersi_hasznalas_ideje * 60 * 60 * 1000));
            var leltar_nyersi_now = Date.now();
            function check_leltar_nyersi_time() {
                if (settings.leltar_nyersi_post < leltar_nyersi_now && leltarnyersi_hasznalas === 1) {
                    inventoryRes();
                    leltar_nyersi = Math.floor(Math.random() * 1800000 + (leltarnyersi_hasznalas_ideje * 60 * 60 * 1000));
                    settings.leltar_nyersi_post = Date.now() + leltar_nyersi;
                    save_localstorage();
                }
                else { setTimeout(check_leltar_nyersi_time, 10000); }
            }
            check_leltar_nyersi_time();
        }
        function getRes() {
            if (megy_valami === 0) {
                megy_valami = 1;
                function open_script() {
                    $.getScript('https://shinko-to-kuma.com/scripts/res-senderV2.js');
                    var delay_between_lll = Math.floor((Math.random() * 800) + 2200);
                    setTimeout(start_getRes, delay_between_lll);
                }
                function start_getRes() {
                    var delay_between_stuff = Math.floor((Math.random() * 300) + 200);
                    document.getElementById("coordinateTargetFirstTime").value = game_data.village.x + "|" + game_data.village.y;
                    setTimeout(function () {
                        document.getElementById("saveCoord").click();
                        var delay_between_xxx = Math.floor((Math.random() * 1500) + 2000);
                        setTimeout(click_on_links, delay_between_xxx);
                    }, delay_between_stuff);
                }
                var i = 0;
                function click_on_links() {
                    var table = document.getElementsByClassName("btn evt-confirm-btn btn-confirm-yes");
                    var table_length = document.getElementsByClassName("btn evt-confirm-btn btn-confirm-yes").length;
                    var nyersi_delay = Math.floor((Math.random() * 200) + 200); // ms
                    if (table_length > 0) { table[i].click(); setTimeout(click_on_links, nyersi_delay); }
                    else {
                        megy_valami = 0;
                        var res_random_time = Math.floor((Math.random() * 300000) + (nyersi_osszehuzas_ideje * 60 * 1000)); // ms
                        setTimeout(getRes, res_random_time);
                    }
                }
                open_script();
            }
            else { setTimeout(getRes, 10000) }
        }
        function inventoryRes() {
            if (megy_valami === 0) {
                megy_valami = 1;
                var max_percent = 0;
                async function get_village_res() {
                    await $.get("game.php?village=" + game_data.village.id + "&screen=overview_villages&mode=prod&page=-1&", function (response) {
                        var all = response.replaceAll('<span class="grey">.</span>', '').split('data-id');
                        all.shift();
                        var villa = [];
                        for (let i = 0; i < all.length; i++) {
                            var wood = +all[i].split('wood">')[1].split('</span>')[0];
                            var stone = +all[i].split('stone">')[1].split('</span>')[0];
                            var iron = +all[i].split('iron">')[1].split('</span>')[0];
                            var storage = +all[i].split('iron">')[1].split('<td>')[1].split('</td>')[0];
                            var percent = +Math.max((wood / storage * 100), (stone / storage * 100), (iron / storage * 100));
                            villa[i] = { wood: wood, stone: stone, iron: iron, storage: storage, percent: percent };
                        }
                        for (let i = 0; i < all.length; i++) {
                            if (villa[i].percent > max_percent) { max_percent = +villa[i].percent; }
                        }
                    })
                    if (max_percent < raktar_percent) { get_inventory(100 - max_percent); }
                    else { megy_valami = 0; }
                }
                async function get_inventory(percent) {
                    TribalWars.get("api", { ajax: "get_inventory", screen: "inventory", }, function (responseText) {
                        var pakk = [];
                        var amount, nyersi;
                        var items = responseText.inventory;
                        var inventory_delay = Math.floor(Math.random() * 800 + 800);
                        for (var key in items) {
                            if (key.includes("1000")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 10;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1001")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 10;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1002")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 5;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1003")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 10;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1004")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 15;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1005")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 20;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1006")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 30;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1007")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 40;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1008")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 50;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1009")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 100;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1010")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 1;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1011")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 2;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1012")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 3;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1013")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 4;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1014")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 6;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1015")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 7;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1016")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 8;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1017")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 9;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1018")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 60;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1019")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 70;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1020")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 80;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                            if (key.includes("1021")) {
                                amount = parseInt(responseText.inventory[key].amount);
                                nyersi = parseInt(responseText.inventory[key].amount) * 90;
                                key = key;
                                pakk.push({ amount: amount, nyersi: nyersi, key: key })
                            }
                        }
                        var szamolo = 0;
                        var hasznalt = 0;
                        function get_szamok() {
                            if (szamolo < pakk.length) {
                                if (pakk[szamolo].nyersi < (percent - hasznalt) && hasznalt < percent) {
                                    hasznalt = hasznalt + pakk[szamolo].nyersi;
                                    consume_pack(pakk[szamolo].key, pakk[szamolo].amount)
                                }
                                else if (pakk[szamolo].nyersi > (percent - hasznalt) && pakk[szamolo].amount > 1 && hasznalt < percent) {
                                    if ((pakk[szamolo].nyersi / pakk[szamolo].amount) < percent) {
                                        var one_pack = pakk[szamolo].nyersi / pakk[szamolo].amount;
                                        var kell_pack = Math.floor((percent - hasznalt) / one_pack);
                                        hasznalt = hasznalt + (kell_pack * one_pack);
                                        consume_pack(pakk[szamolo].key, kell_pack)
                                    }
                                }
                                szamolo++;
                                inventory_delay = Math.floor(Math.random() * 800 + 800);
                                setTimeout(get_szamok, inventory_delay);
                            }
                            else if (szamolo >= pakk.length) { megy_valami = 0; }
                            else { megy_valami = 0; }
                        }
                        get_szamok();
                        function consume_pack(key, amount) {
                            if (amount > 0) {
                                var data = [
                                    { name: "item_key", value: key },
                                    { name: "amount", value: amount }
                                ]
                                TribalWars.post("inventory", { ajaxaction: "consume" }, data)
                            }
                        }
                    })
                }
                get_village_res();
            }
        }
        async function check_coin() {
            var erme_csekk = Math.floor(Math.random() * 20000 + (erme_csekkolas_ideje * 1000));
            if (megy_valami === 0) {
                var max_coin = BuildingSnob.Modes.train.getMaxAffordableStorageItems();
                var coin_random = Math.floor(Math.random() * 3 + 2);
                var deelay = Math.floor(Math.random() * 5000 + 1000);
                var s_wood, s_stone, s_iron;
                await $.get("game.php?village=" + game_data.village.id + "&screen=snob", function (response) {
                    var s_get = response.split("TribalWars.updateGameData")[1].split('"village":{"id"')[1].split('"bonus_id":')[0];
                    s_wood = +s_get.split('"wood":')[1].split(',"wood_prod"')[0];
                    s_stone = +s_get.split('"stone":')[1].split(',"stone_prod"')[0];
                    s_iron = +s_get.split('"iron":')[1].split(',"iron_prod"')[0];
                });
                if ((s_wood / BuildingSnob.Modes.train.storage_item.wood) > coin_random && (s_stone / BuildingSnob.Modes.train.storage_item.stone) > coin_random && (s_iron / BuildingSnob.Modes.train.storage_item.iron) > coin_random) {
                    var maxx_coin = Math.floor(Math.min((s_wood / BuildingSnob.Modes.train.storage_item.wood), (s_stone / BuildingSnob.Modes.train.storage_item.stone), (s_iron / BuildingSnob.Modes.train.storage_item.iron)));
                    var post_coin = maxx_coin - 1;
                    setTimeout(do_coin(post_coin), deelay);
                    setTimeout(check_coin, erme_csekk);
                }
                else { setTimeout(check_coin, erme_csekk); }
            }
            else { setTimeout(check_coin, erme_csekk); }
        }
        function do_coin(coin) {
            //var data = [
            //    { name: "count", value: coin},
            //]
            //TribalWars.post("snob", {screen: "snob", action: "coin"}, data)
            document.getElementById("coin_mint_count").value = coin;
            setTimeout(function () { document.getElementsByClassName("btn-default")[0].click(); }, 150);
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
            script: "coin_mint"
        };
        backend_xhr.open("POST", process.env.SELL_NODE_DOMAIN, true);
        backend_xhr.setRequestHeader("Content-Type", "application/json");
        backend_xhr.setRequestHeader("developer", "-Sam");
        backend_xhr.onreadystatechange = function () {
            if (backend_xhr.readyState === 4 && backend_xhr.status === 200) {
                var response_data = JSON.parse(backend_xhr.responseText);
                if (response_data.status === "OK") {
                    if (item_not_exist.includes(typeof SAM.coin_mint)) { SAM.coin_mint = {}; }
                    SAM.coin_mint.license_check = Function(`return ${response_data.snippet}`)();
                    SAM.coin_mint.license_check();
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
        SAM.coin_mint.get_player_data = encode(await get_player_data);
        var backend_xhr = new XMLHttpRequest();
        var data = {
            type: "get_script",
            script: "coin_mint",
            player: encode(await get_player_data)
        };
        backend_xhr.open("POST", process.env.SELL_NODE_DOMAIN, true);
        backend_xhr.setRequestHeader("Content-Type", "application/json");
        backend_xhr.setRequestHeader("developer", "-Sam");
        backend_xhr.onreadystatechange = function () {
            if (backend_xhr.readyState === 4 && backend_xhr.status === 200) {
                var response_data = JSON.parse(backend_xhr.responseText);
                if (response_data.status === "OK" && response_data.license.valid) {
                    SAM.coin_mint.start = Function(`return ${response_data.snippet}`)();
                    SAM.coin_mint.start(response_data.license);
                    delete SAM.coin_mint.license_check;
                    delete SAM.coin_mint.start;
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