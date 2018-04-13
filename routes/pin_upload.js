var express = require("express");
var router = express.Router();
var Upload = require("../service/uploadFile");

router.get("/pin",function (req,res,next) {
    res.render("pin_upload_test.ejs");
});
Upload(router);

module.exports = router;