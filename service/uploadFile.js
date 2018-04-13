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
let Report = require("../models/reportSchema");

/*
local storage
 */
const uploadPath = "public/original_image";
const thumbnailPath = "public/thumbnail_image";

let locStorage = multer.diskStorage({
    // 서버에 저장할 폴더
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {

        file.uploadedFile = {
            name: file.originalname,
            ext: 'jpg'
        };

        /*  file.uploadedFile = {
              name: req.files[0].originalname,
              ext: "jpg"
          };*/
        cb(null, file.uploadedFile.name);
    }
});

let locUpload = multer({storage: locStorage});

module.exports = function (router) {
    router.use(bodyParser.urlencoded({extended: true}));
    router.use(cookieParser());
    router.use(expressSession({
        secret: 'moldi',
        resave: true,
        saveUninitialized: true
    }));
//    router.use(express.static(path.join(__dirname, +"../", "public")));
//,

    function checkImage() {


        s3Upload.array('imgFiles', 5);

    }

    router.post("/upload", s3Upload.array('imgFiles', 5), function (req, res, cb) {
        let repId = req.body.rep_id;
        let repNm = req.body.rep_nm;
        let repContents = req.body.rep_contents;

     /*   thumbnail({
            source: uploadPath,
            destination: thumbnailPath,
            concurrency: 5
        }, function (files, err, stdout, stderr) {
            next();
            setTimeout(locUpload.array('imgFiles', 5), 1000);
        });*/


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

        Report.uploadPin(repId, repNm, repContents, img_array, function (err, report) {
            if (err) console.error(err);
            else {
                console.log("저장 완료");
            }
        });
        res.json(req.files);
    })
};