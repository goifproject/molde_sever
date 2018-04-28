let request = require("request");

// 여성 안심 서비스
let fs = require("fs");
let path = require("path");

let file1 = path.join(__dirname,"../read_file/seoul_mapo_female_safety.csv");
module.exports = function(router){
    router.get("/report",function (req,res,next) {
        fs.readFile(file1,"UTF-8",function (err,data) {
            if(err) console.error(new Error(err));
            else{
                res.status(200).send(JSON.stringify(data));
            }
        });
    })
};
