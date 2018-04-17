let multer = require('multer');
let AWS = require("aws-sdk");
AWS.config.loadFromPath(__dirname + "/../config/awsconfig.json");
let s3 = new AWS.S3();
let multerS3 = require("multer-s3");
let path = require("path");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");
let expressSession = require("express-session");
let express = require("express");
let thumbnail = require("node-thumbnail").thumb;
let Report = require("../models/reportSchema");
const sharp = require("sharp");
let s3Upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "moldibucket/report_image",
        shouldTransform: function (req, file, cb) {
            cb(null, /^image/i.test(file.mimetype))
        },
        acl: 'public-read-write',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            cb(null, file.originalname);
        }
        /*transforms: [{
            id: 'original',
            key: function (req, file, cb) {
                cb(null, file.originalname);
            },
            transform: function (req, file, cb) {
                cb(null, sharp().jpg());
            },

        },
            {
                id: 'thumbnail',
                key: function (req, file, cb) {
                    cb(null, 'image-thumbnail.jpg');
                },
                transform: function (req, file, cb) {
                    cb(null, sharp().resize(100, 100).jpg());
                }
            }],
*/
    })
});
module.exports = function (router) {
    router.use(bodyParser.urlencoded({extended: true}));
    router.use(cookieParser());
    router.use(expressSession({
        secret: 'moldi',
        resave: true,
        saveUninitialized: true
    }));
    // 신고 내역 정리
    router.post("/pin", s3Upload.array('imgFiles', 5), function (req, res, next) {
        let rep_id = req.body.rep_id;
        let rep_nm = req.body.rep_nm;
        let rep_contents = req.body.rep_contents;
        let rep_lat = req.body.rep_lat;
        let rep_lon = req.body.rep_lon;
        let rep_addr = req.body.rep_addr;
        let user_id = req.body.user_id;
        let img_filename = [];
        let img_filepath = [];
        let img_filesize = [];
        let img_array = [];

        for (let elem in req.files) {
            console.log(req.files[elem].location);
            img_filename.push(req.files[elem].originalname);
            img_filepath.push(req.files[elem].location);
            img_filesize.push(req.files[elem].size + 'kb');
        }


        for (var index = 0; index < img_filepath.length; index++) {
            let img_object = {};
            img_object.filename = img_filename[index];
            img_object.filepath = img_filepath[index];
            img_object.filesize = img_filesize[index];
            img_array.push(img_object);
        }

        Report.insertReportFunc(rep_id,rep_nm,rep_contents,rep_lat,rep_lon,rep_addr,user_id,img_array,function (err,report) {
            if(err) console.log(new Error(err));
            else{
                console.log("데이터 베이스에 저장 완료");
                res.status(200).send(JSON.stringify("저장이 완료되었습니다"));
            }
        })
    })
};