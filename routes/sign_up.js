var User = require("../models/userSchema");
var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");

router.post("/login", function (req, res, next) {

    console.log(req.headers);

    let user_id = req.body.user_id;
    let sns_id = req.body.sns_id;
    console.log(user_id + " / " + sns_id);
    User.signUpUser(user_id, sns_id, function (err, users) {
        if (err) {
            console.log(new Error(err));
        } else {
            console.log(users);
        }
    })
});
module.exports = router;