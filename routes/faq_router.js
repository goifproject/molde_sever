let express = require("express");
let router = express.Router();
let FaqController = require("../controllers/faq_controller");

// FaQ 질의응답 관리 , 관련된 서비스도 작업
FaqController(router);

module.exports = router;