"use strict";
exports.__esModule = true;
var axios_1 = require("axios");
var API_BASE_URL = 'https://getpocket.com/v3/';
var CONSUMER_KEY = '95404-252645ae045dca79c4a8e13c';
var ACCESS_TOKEN = '8903345c-7c8c-4da5-8915-525b74';
var CODE = '1923ac23-1555-ffb3-71ab-bffb05';
var USER = 'gatzn';
axios_1["default"]
    .get('https://randomuser.me/api?callback=jsonData')
    .then(function (res) {
    console.log(res.data);
})["catch"](function (e) {
    console.log(e);
});
