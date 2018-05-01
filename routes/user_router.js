let express = require("express");
let router = express.Router();
let bodyParser = require("body-parser");
let UserController = require("../controllers/user_controller");

UserController(router);  // 사용자 관련된 것 (로그인,사용자 정보 가져오기, 사용자 이미지 변경)

module.exports = router;