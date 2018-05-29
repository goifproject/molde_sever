let multer = require('multer');
let AWS = require("aws-sdk");
AWS.config.loadFromPath(__dirname + "/../config/awsconfig.json");
let s3 = new AWS.S3();
let multerS3 = require("multer-s3");
let path = require("path");
let bodyParser = require("body-parser");

let express = require("express");
let thumbnail = require("node-thumbnail").thumb;
let Report = require("../models/reportSchema");
//const sharp = require("sharp");

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
    // router.use(cookieParser());
    // router.use(expressSession({
    //     secret: 'moldi',
    //     resave: true,
    //     saveUninitialized: true
    // }));

    //s3Upload.array('imgFiles',5),
    // 신고 내역 정리


    router.post("/pin", function (req, res, next) {
        /*  let rep_id = req.body.rep_id;
          let rep_nm = req.body.rep_nm;
          let rep_contents = req.body.rep_contents;
          let rep_lat = req.body.rep_lat;
          let rep_lon = req.body.rep_lon;
          let rep_addr = req.body.rep_addr;
          let user_id = req.body.user_id;
          let rep_date = req.body.rep_date;*/

        let img_filename = [];
        let img_filepath = [];
        let img_filesize = [];
        let img_array = [];

        //router.use(express.json());
        router.use(bodyParser.json({limit: '50mb'}));
        router.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

        /*
        s3 upload
         */
        let util = require("util");
        let multiparty = require("multiparty");
        let form = new multiparty.Form();

        form.parse(req, function (err, fields, files) {

            //res.writeHead(200, {'content-type': 'multipart/form-data'});
            res.write('received data');
            res.end(util.inspect({fields: fields, files: files}));


            for (let elem in files.imgFiles) {
                //console.log(req.files[elem].location);
                img_filename.push(files.imgFiles[elem].originalFilename);
                img_filepath.push(files.imgFiles[elem].path);
                img_filesize.push(files.imgFiles[elem].size + "kb");
            }


            for (var index = 0; index < img_filepath.length; index++) {
                let img_object = {};
                img_object.filename = img_filename[index];
                img_object.filepath = img_filepath[index];
                img_object.filesize = img_filesize[index];
                img_array.push(img_object);
            }

            let rep_id = fields.rep_id;
            let rep_nm = fields.rep_nm;
            let rep_contents = fields.rep_contents;
            let rep_lat = fields.rep_lat;
            let rep_lon = fields.rep_lon;
            let rep_addr = fields.rep_addr;
            let user_id = fields.user_id;
            let rep_date = fields.rep_date;

            let multiparty2 = require("connect-multiparty");
            let multipartyMiddleware = multiparty2();

            let multipartParams = {
                Bucket: "moldibucket.report_image",
                Key : files.imgFiles
            }


            // report id , report 이름(제목) , report 내용 , report 위도 , report 경도 , report 주소 , 사용자 아이디(유일) , 이미지 정보들 , 업로드 시간
            Report.insertReportFunc(rep_id, rep_nm, rep_contents, rep_lat, rep_lon, rep_addr, user_id, img_array, rep_date, function (err, report) {
                if (err) console.log(new Error(err));
                else {

                }
            })
        });
    });
    // 관리자가 수정할 때 사용할 라우터
    router.put("/pin/:rep_id", function (req, res, next) {
        let rep_id = req.params.rep_id;
        let rep_state = req.body.rep_state;

        switch (rep_state) {
            case 0 :
                // 접수중 (default) : 빨간색
                rptCommitFunc(rep_id, 0, function (err, report) {
                    if (err) console.error(new Error(err));
                    else {
                        res.status(200).send(JSON.stringify(report));
                    }
                });
                break;

            case 1:
                // 접수 완료(탐지완료) : 빨간색
                detRptFunc(rep_id, 1, function (err, report) {
                    if (err) console.error(new Error(err));
                    else {
                        res.status(200).send(JSON.stringify(report));
                    }
                });
                break;

            case 2:
                // 접수 완료(제거) : 파란색
                rmRptFunc(rep_id, 2, function (err, report) {
                    if (err) console.error(new Error(err));
                    else {
                        res.status(200).send(JSON.stringify(report));
                    }
                });
                break;

            case 3:
                // 접수 완료(미발견 or 허위신고) : 하얀색
                clearRptFunc(rep_id, 3, function (err, report) {
                    if (err) console.error(new Error(err));
                    else {
                        res.status(200).send(JSON.stringify(report));
                    }
                });
                break;

        }

    });

    // 신고중
    function rptCommitFunc(rep_id, rep_state, cb) {
        Report.updateRptMarker(rep_id, rep_state, function (err, report) {
            if (err) console.error(new Error(err));
            else {
                cb(null, report);
            }
        });
    }

    // 발견(탐지)
    function detRptFunc(rep_id, rep_state, cb) {
        Report.updateRptMarker(rep_id, rep_state, function (err, report) {
            if (err) console.error(new Error(err));
            else {
                cb(null, report);
            }
        });
    }

    // 제거
    function rmRptFunc(rep_id, rep_state, cb) {
        Report.updateRptMarker(rep_id, rep_state, function (err, report) {
            if (err) console.error(new Error(err));
            else {
                cb(null, report);
            }
        });
    }

    // 미발견 or 허위신고 >> 장소 clear
    function clearRptFunc(rep_id, rep_state, cb) {
        Report.updateRptMarker(rep_id, rep_state, function (err, report) {
            if (err) console.error(new Error(err));
            else {
                cb(null, report);
            }
        });
    }

    // 특정 위치에 대해서 신고내역 보내주기
    router.get("/pin", function (req, res, next) {
        let rep_lat = req.query.rep_lat;
        let rep_lon = req.query.rep_lon;
        Report.showRptSpot(rep_lat, rep_lon, function (err, report) {
            if (err) console.error(new Error(err));
            else {
                res.status(200).send(JSON.stringify(report));
            }
        })
    })
};