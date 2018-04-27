let User = require("../models/userSchema");

module.exports = function (router) {
    let user_id = req.body.user_id;
    let sns_id = req.body.sns_id;
    console.log(user_id + " / " + sns_id);


    router.post("/login", function (req, res, next) {
        User.signUpUser(user_id, sns_id, function (err, users) {
            if (err) {
                console.log(new Error(err));
            } else {
                console.log(users);
            }
        })
    });
    // 사용자 정보 가지고 오기
    router.get("/profile", function (req, res, next) {
        let user_id = req.query.user_id;
        User.getUserInfo(user_id,function (err,userInfo) {
            if(err) console.error(new Error(err));
            else{
                console.log(JSON.stringify(userInfo));
                res.status(200).send(JSON.stringify(userInfo));
            }
        })
    });

    // 사용자 이미지 변경

    router.post("/profile",function (req,res,next) {
        let user_id = req.body.user_id;
        let user_img = req.body.user_img;
        User.updateUserImg(user_id,function (err,userInfo) {
            if(err) console.error(new Error(err));
            else{

            }
        })
    });


};