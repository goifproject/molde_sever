let News = require("../models/newsSchema");
let AWS = require("aws-sdk");

let fs = require("fs");
// s3 upload by multiparty

let s3Stream = require("s3-upload-stream")(new AWS.S3());
AWS.config.loadFromPath(__dirname + "/../config/awsconfig.json");

let path = require("path");
let bodyParser = require("body-parser");

let express = require("express");

module.exports = function (router) {
    // 카드 뉴스 추가
    router.use(bodyParser.urlencoded({extended: true}));
    router.use(express.static(path.join(__dirname + "../", "public/images")));

    router.post("/news", function (req, res, next) {

        let img_filename = [];
        let img_filepath = [];
        let img_filesize = [];
        let img_array = [];

        router.use(bodyParser.json({limit: '50mb'}));
        router.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

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

                        for (var elem in img_filepath) {
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

            let news_id = fields.news_id;
            let title = fields.title;
            let contents = fields.contents;
            let user_id = fields.user_id;

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
                    Key: news_id + "_" + files.imgFiles[i].originalFilename,
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

                        let now_hour = new Date().getHours() + 9;
                        News.addOnNews(news_id, title, contents, new Date(new Date().setHours(now_hour)), user_id, imgContentsArr, function (err, news) {
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


    // 뉴스 (메거진) 추가

    /*
    여러 개 파일 업로드 (news)
     */
// 카드뉴스 수정

    router.put("/news", function (req, res, next) {

        // 사진 추가 저장 , 교체 등이 업데이트에서 진행
        let multiparty = require("multiparty");
        let options = {
            uploadDir: __dirname + "/../public/images/",
            autoFiles: true,
        };
        let form = new multiparty.Form(options);
        let util = require("util"); // util 정리
        form.parse(req, function (err, fields, files) {
            res.write('received data');
            res.end(util.inspect({fields: fields, files: files}));

            // 변경사항
            let chg_img_filepath = [];
            let chg_img_filename = [];
            let news_id = fields.news_id; // 뉴스 아이디 올린 것 그대로 해서 똑같이 올라와야함
            let user_id = fields.user_id; // 사용자 토큰 다시 보내줘야함
            let title = fields.title;
            let contents = fields.contents;
            let now_hour = new Date().getHours() + 9;
            let news_date = new Date(new Date(new Date().setHours(now_hour)));

            for (let elem in files.imgFiles) {
                chg_img_filepath.push(files.imgFiles[elem].path);
                chg_img_filename.push(files.imgFiles[elem].originalFilename);
            }

            let chg_img_arr = new Array(); // 변경 사항 사진 배열
            for (var i = 0; i < chg_img_filename.length; i++) {
                let img_object = {};
                img_object.filepath = chg_img_filepath[i];
                img_object.filename = chg_img_filename[i];
                chg_img_arr.push(img_object);
            }



            let count = 0;

            let read_array2 = new Array();
            // 파일 생성 --> 서버에 저장
            for (var i = 0; i < files.imgFiles.length; i++) {
                read_array2[i] = fs.createReadStream(path.join(__dirname, "../public/images/" + files.imgFiles[i].originalFilename));
            }

            console.log("길이  : " + read_array2.length);
/*
            for (var elem in chg_img_filepath) {
                fs.rename(chg_img_filepath[elem], path.join(__dirname, "../public/images/" + files.imgFiles[elem].originalFilename), function (err) {
                    if (err) throw err;
                });
            }*/
            let upload = new Array();
            let chg_img_contents_Arr = new Array(); // 변경 사항 사진 내용들 담는 배열


            /*  for (var i = 0; i < files.imgFiles.length; i++) {
                  read_array[i] = fs.createReadStream(path.join(__dirname, "../public/images/" + files.imgFiles[i].originalFilename));
              }
  */

            for (var i = 0; i < read_array2.length ; i++) {
                let currentFile = files.imgFiles[i];
                upload[i] = s3Stream.upload({
                    Bucket: "moldebucket",
                    Key: news_id + "_" + currentFile.originalFilename,
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
                    chg_img_contents_Arr.push(imgContents);

                    count += 1;


                    console.log("여기 걸리나요?");
                    News.updateOnNews(news_id, user_id, title, contents, news_date, chg_img_contents_Arr, function (err, news) {
                        if (err) console.error(new Error(err));
                        else {
                            console.log(JSON.stringify(news));
                        }
                    });

                    News.pushOnNews(news_id,user_id,chg_img_contents_Arr,function (err,news) {
                        if(err) console.error(new Error(err));
                        else{
                            // 파일 추가
                            console.log(JSON.stringify(news));
                        }
                    })
                });
            }


            // S3 전송
            for (var i = 0; i < read_array2.length ; i++) {
                console.log("업로드 완료");
                read_array2[i].pipe(upload[i]);
            }
        });
    })
};