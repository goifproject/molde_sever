var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var port = process.env.PORT || 2721;

// db 연결
var mongoose = require("mongoose");
var db = mongoose.connection;
let fs = require("fs");
let dbFile = fs.readFileSync("./db_config/db.json");
let dbConfig = JSON.parse(dbFile);
var dbUrl = dbConfig.dbUrl;



var MongoClient = require("mongodb").MongoClient;
var promise = mongoose.connect(dbUrl, {
    }, function (mongoError) {
        if (mongoError) console.log(new Error("DB연결 에러"));
        else {
            console.log("DB 연결 성공");
        }
    }
);


/*
Router
 */
var sign_up = require("./routes/user_router");
var pin_upload = require("./routes/pin_router");
var report_router = require("./routes/read_file_router");

//promise.then()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', port);
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/v1',sign_up);
app.use('/v1',pin_upload);
app.use('/v1',report_router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

var http = require("http");
var server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log("서버 연동 완료 : " + app.get('port'));
});

module.exports = app;
