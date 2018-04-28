var express = require("express");
var router = express.Router();
let readFemaleSafety = require("../service/crawlingFile");

// 여성 알림 서비스 읽기
readFemaleSafety(router);

module.exports = router;