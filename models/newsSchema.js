var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var photoSchema = new Schema({
    filename: {type: String, default: null},
    filepath: {type: String, default: null},
    size: {type: String, default: null}
});

var newsSchema = new Schema({
    news_id: {type: String, required: true},
    title: {type: String},
    contents: {type: String},
    news_date: {type: Date},
    user_id: {type: String},
    news_img: [photoSchema],
});

// 뉴스 추가
newsSchema.statics.addOnNews = function (news_id, title, contents, news_date, user_id, news_img, callback) {
    this.model("News").collection.insert({
        news_id: news_id,
        title: title,
        contents: contents,
        news_date: news_date,
        user_id: user_id,
        news_img: news_img,
    }, function (err, news) {
        if (err) callback(err);
        else {
            return callback(null, news);
        }
    })
};
// 뉴스 갱신
/*
news_id랑 user_id가지고 먼저 찾기 >> 내가 올린 정보를 먼저 찾고 이걸 가지고
category,title,contents,news_date,news_img,sm_img 수정
 */
newsSchema.statics.findOnNews = function (news_id, user_id, callback) {
    this.model("News").collection.findOne({
        news_id: news_id,
        user_id: user_id
    }, function (err, users) {
        if (err) callback(err);
        else {
            callback(null, users);
        }
    });
};
// findOnNews를 통해서 내가 올린 뉴스 정보를 먼저 찾는다.
// users.news_id / users.user_id로 찾고 업데이트하기
newsSchema.statics.updateOnNews = function (news_id, user_id, title, contents,
                                            news_date, news_img, callback) {
    this.model("News").collection.update({
        news_id: news_id,
        user_id: user_id
    }, {
        $set: {
            title: title,
            contents: contents,
            news_date: news_date,
            news_img: news_img,
        }
    } , {
        upsert: true, multi: true
    }, callback);
};

// 기존 내용에 추가 하기
newsSchema.statics.pushOnNews = function (news_id, user_id, news_img, callback) {
    this.model("News").collection.update({
        news_id: news_id,
        user_id: user_id
    }, {
        $push: {
            news_img: news_img,
        }
    }, callback);
};


// news_id와 user_id로 올린거 찾고 지우기
newsSchema.statics.dropOnNews = function (news_id, user_id, callback) {
    this.model("News").collection.remove({
        news_id: news_id,
        user_id: user_id
    }, {
        justOne: true // 하나만 지우도록!!
    }, callback);
};

// 카드 뉴스 목록 불러오기
// 배열로 불러올 것임
/*
newsSchema.statics.showNewsByCategory = function (category,callback) {
    this.model("News").collection.find({category : category},function (err,news) {
        if(err) callback(err);
        else{
            callback(null,news);
        }
    })
};
*/

// 처음엔 news_date를 가지고 최근꺼 10개만 해서 뿌려주기
newsSchema.statics.showNewsByUpToDate = function (news_date,callback) {
    this.model("News").collection.find({news_date : news_date},function (err,news) {
        if(err) callback(news);
        else{
            callback(null,news)
        }
    })
};
var News = mongoose.model("News", newsSchema);

module.exports = News;