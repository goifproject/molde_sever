let express = require("express");
let router = express.Router();
let Upload = require("../service/uploadFile");
let ReportController = require("../controllers/report_controller");
router.get("/pin",function (req,res,next) {
    res.render("pin_upload_test.ejs");
});

// S3에 업로드 (파일)
Upload(router);

// 신고 내역 정리 컨트롤러
ReportController(router);

module.exports = router;