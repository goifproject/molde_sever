let multer = require('multer');
let AWS = require("aws-sdk");

let fs = require("fs");
// s3 upload by multiparty

let s3Stream = require("s3-upload-stream")(new AWS.S3());
AWS.config.loadFromPath(__dirname + "/../config/awsconfig.json");


let path = require("path");
let bodyParser = require("body-parser");

let express = require("express");
let thumbnail = require("node-thumbnail").thumb;
let Report = require("../models/reportSchema");


module.exports = function (router) {
    router.use(bodyParser.urlencoded({extended: true}));
    router.use(express.static(path.join(__dirname + "../", "public/images")));

    router.post("/pin", function (req, res, next) {
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
        let options = {
            uploadDir: __dirname + "/../public/images/",
            autoFiles: true,
        };
        let multiparty = require("multiparty");
        let form = new multiparty.Form(options);

        form.parse(req, function (err, fields, files) {

            res.write('received data');
            res.end(util.inspect({fields: fields, files: files}));


            for (let elem in files.imgFiles) {
                //console.log(req.files[elem].location);
                img_filename.push(files.imgFiles[elem].originalFilename);
                img_filepath.push(files.imgFiles[elem].path);
                img_filesize.push(files.imgFiles[elem].size + "kb");
            }

/*

            for (let elem in img_filepath) {
                fs.rename(img_filepath[elem], path.join(__dirname, "../public/images/" + files.imgFiles[elem].originalFilename), function (err) {
                    if (err) throw err;
                });
            }
*/

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


            let now_hour = new Date().getHours() + 9;
            let rep_date = new Date(new Date().setHours(now_hour));

            let count = 0;

            let read_array = new Array();
            // let read = fs.createReadStream(__dirname + "/../public/images/" + files.imgFiles[0].originalFilename);
            for (var i = 0; i < files.imgFiles.length; i++) {
                read_array[i] = fs.createReadStream(path.join(__dirname, "../public/images/" + files.imgFiles[i].originalFilename));
            }

            let upload = new Array();
            let imgContentsArr = new Array(); // 이미지 관련 내용들 배열로 재정의


            for (var i = 0; i < read_array.length; i++) {
                let currentFile = files.imgFiles[i];
                upload[i] = s3Stream.upload({
                    Bucket: "moldebucket",
                    Key: user_id + "_" + files.imgFiles[i].originalFilename,
                    ACL: "public-read",
                    StorageClass: "REDUCED_REDUNDANCY",
                    ContentType: "multipart/form-data"
                });

                upload[i].on('part', function (dt) {
                    console.log(dt);
                });


                upload[i].on('uploaded', function (dt) {
                    console.log("경로입니다1." + dt.Location);
                    let imgContents = new Object();  // 이미지 관련 내용들 오브젝트
                    imgContents.filename = currentFile.originalFilename;
                    imgContents.filepath = dt.Location;
                    imgContentsArr.push(imgContents);

                    count += 1;

                    if (count == read_array.length) {
                        Report.insertReportFunc(rep_id, rep_nm, rep_contents, rep_lat, rep_lon, rep_addr, user_id, imgContentsArr, rep_date, function (err, report) {
                            if (err) console.log(new Error(err));
                            else {
                                console.log("파일 저장 완료");
                            }
                        });
                    }
                });

            }

// S3 전송
            for (var i = 0; i < read_array.length; i++)
                read_array[i].pipe(upload[i]);
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