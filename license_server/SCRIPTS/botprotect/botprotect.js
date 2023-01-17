require('dotenv').config()
var fs = require('fs');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
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
            case "BOTPROTECT":
                return {
                    status: true,
                    snippet: this.PRE_OBFUSCATED.BOTPROTECT
                };
            case "DO_CAPTCHA":
                var result = await this.DO_CAPTCHA(request_data);
                return {
                    status: result.status,
                    snippet: result.value
                };
            case "GET_CAPTCHA":
                var result = await this.GET_CAPTCHA(request_data);
                return {
                    status: result.status,
                    snippet: {
                        status: result.value?.status,
                        key: result.value?.key,
                        snippet: result.status ? this.PRE_OBFUSCATED.VALIDATE_CAPTCHA : undefined
                    },
                    error: result?.error
                };
        }
    },
    BOTPROTECT: function botprotect(license) {
        "INSERT_LICENSE_CHECK_HERE"
        "INSERT_ENCODE_DECODE_PAYLOAD_HERE"
        var create_task = async function () {
            var get_player_data = new Promise((resolve) => {
                $.get(window.location.href, function (r) {
                    resolve(`${r.split('TribalWars.updateGameData({"player":')[1].split('}')[0]}};${Date.now()}`);
                })
            });
            SAM.botprotect.get_player_data = encode(await get_player_data);
            var backend_xhr = new XMLHttpRequest();
            var data = {
                type: "do_captcha",
                script: "botprotect",
                player: encode(await get_player_data),
                key: BotProtect.key,
                domain: document.domain
            };
            backend_xhr.open("POST", process.env.SELL_NODE_DOMAIN, true);
            backend_xhr.setRequestHeader("Content-Type", "application/json");
            backend_xhr.setRequestHeader("developer", "-Sam");
            backend_xhr.onreadystatechange = function () {
                if (backend_xhr.readyState === 4 && backend_xhr.status === 200) {
                    var response_data = JSON.parse(backend_xhr.responseText);
                    if (response_data.status === "OK") {
                        setTimeout(function () { get_task(response_data.snippet) }, 8000);
                    }
                } else {
                    // show popup with error and license buy info
                }
            }
            backend_xhr.send(encode(JSON.stringify(data)));
        }
        var get_task = async function (taskId) {
            var backend_xhr = new XMLHttpRequest();
            var data = {
                type: "get_captcha",
                script: "botprotect",
                player: await SAM.botprotect.get_player_data,
                taskId: taskId
            };
            backend_xhr.open("POST", process.env.SELL_NODE_DOMAIN, true);
            backend_xhr.setRequestHeader("Content-Type", "application/json");
            backend_xhr.setRequestHeader("developer", "-Sam");
            backend_xhr.onreadystatechange = function () {
                if (backend_xhr.readyState === 4 && backend_xhr.status === 200) {
                    var response_data = JSON.parse(backend_xhr.responseText);
                    if (response_data.status === "OK" && response_data.snippet.status === "Ready") {
                        SAM.botprotect.validate = Function(`return ${response_data.snippet.snippet}`)();
                        SAM.botprotect.validate(response_data.snippet.key, response_data.license);
                    }
                    else if (response_data.status === "OK" && response_data.snippet.status === "Processing") {
                        setTimeout(function () { get_task(taskId) }, 8000);
                    }
                    else {
                        // show popup with error and license buy info
                    }
                } else {
                    // show popup with error and license buy info
                }
            }
            backend_xhr.send(encode(JSON.stringify(data)));
        }
        function bot_refresh() {
            try {
                if (BotProtect.forced) {
                    create_task();
                    var delay_between_fressh = Math.floor((Math.random() * 50000) + 240000);
                    setTimeout(function () {
                        window.location.reload(true);
                    }, delay_between_fressh);
                }
                else { setTimeout(bot_refresh, 3000); }
            }
            catch (err) { }
        }
        bot_refresh();
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
            script: "botprotect"
        };
        backend_xhr.open("POST", process.env.SELL_NODE_DOMAIN, true);
        backend_xhr.setRequestHeader("Content-Type", "application/json");
        backend_xhr.setRequestHeader("developer", "-Sam");
        backend_xhr.onreadystatechange = function () {
            if (backend_xhr.readyState === 4 && backend_xhr.status === 200) {
                var response_data = JSON.parse(backend_xhr.responseText);
                if (response_data.status === "OK") {
                    if (item_not_exist.includes(typeof SAM.botprotect)) { SAM.botprotect = {}; }
                    SAM.botprotect.license_check = Function(`return ${response_data.snippet}`)();
                    SAM.botprotect.license_check();
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
        SAM.botprotect.get_player_data = encode(await get_player_data);
        var backend_xhr = new XMLHttpRequest();
        var data = {
            type: "get_script",
            script: "botprotect",
            player: encode(await get_player_data)
        };
        backend_xhr.open("POST", process.env.SELL_NODE_DOMAIN, true);
        backend_xhr.setRequestHeader("Content-Type", "application/json");
        backend_xhr.setRequestHeader("developer", "-Sam");
        backend_xhr.onreadystatechange = function () {
            if (backend_xhr.readyState === 4 && backend_xhr.status === 200) {
                var response_data = JSON.parse(backend_xhr.responseText);
                if (response_data.status === "OK" && response_data.license.valid) {
                    SAM.botprotect.start = Function(`return ${response_data.snippet}`)();
                    SAM.botprotect.start(response_data.license);
                    delete SAM.botprotect.license_check;
                    delete SAM.botprotect.start;
                }
            } else {
                // show popup with error and license buy info
            }
        }
        backend_xhr.send(encode(JSON.stringify(data)));
    },
    DO_CAPTCHA: async function (request_data) {
        var apikey = process.env.SELL_NODE_ANTI_CAPTCHA_APIKEY;
        var create_task = new Promise((resolve, reject) => {
            if (apikey == '') {
                reject('API key error. Contact -Sam!');
            }
            if (request_data.domain == '' || request_data.key == '') {
                reject('Invalid domain or site key. Contact -Sam!');
            }
            var payload = {
                'clientKey': apikey,
                'task': {
                    "type": "HCaptchaTaskProxyless",
                    "websiteURL": "http:\/\/" + request_data.domain + "\/",
                    "websiteKey": request_data.key
                }
            };
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'https://api.anti-captcha.com/createTask', true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText);
                    if (json.errorId == 0) {
                        //no errors
                        resolve(json.taskId);
                    } else {
                        //we have some error
                        reject(`Got error from API: ${json.errorCode}, ${json.errorDescription}`);
                    }
                }
            };
            xhr.send(JSON.stringify(payload));
        });
        try {
            return {
                status: true,
                value: await create_task
            };
        }
        catch (err) {
            return {
                status: false,
                value: err
            };
        }
    },
    GET_CAPTCHA: async function (request_data) {
        var apikey = process.env.SELL_NODE_ANTI_CAPTCHA_APIKEY;
        var get_task = new Promise((resolve, reject) => {
            if (apikey == '') {
                reject('API key error. Contact -Sam!');
            }
            if (request_data.taskId == '') {
                reject('Task ID required. Contact -Sam!');
            }
            var payload = {
                'clientKey': apikey,
                'taskId': request_data.taskId
            };
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'https://api.anti-captcha.com/getTaskResult', true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText);
                    if (json.errorId == 0) {
                        //no errors
                        if (json.status == 'ready') {
                            if (json.NOTICE?.search("fake_solution")) {
                                reject('Fake solution, try again!');
                            }
                            resolve({
                                status: "Ready",
                                key: json.solution.gRecaptchaResponse
                            });
                        } else {
                            resolve({
                                status: "Processing"
                            });
                        }
                    } else {
                        //we have some error
                        reject(`Got error from API: ${json.errorCode}, ${json.errorDescription}`);
                    }
                }
            };
            xhr.send(JSON.stringify(payload));
        });
        try {
            return {
                status: true,
                value: await get_task
            };
        }
        catch (err) {
            return {
                status: false,
                error: err
            };
        }
    },
    VALIDATE_CAPTCHA: async function validate_captcha(key, license) {
        "INSERT_LICENSE_CHECK_HERE"
        TribalWars.post("botcheck", { ajaxaction: "verify" }, { response: key }, function (r) {
            if (r.success) { window.location.reload(); }
        });
    },
    POP_UP: "",
    PRE_OBFUSCATED: JSON.parse(fs.readFileSync(`${__dirname}/preobfuscated_snippets.json`))
}