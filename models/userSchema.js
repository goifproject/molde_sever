var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var photoSchema = new Schema({
    filename: {type: String, default: null},
    filepath: {type: String, default: null},
    size: {type: String, default: null}
});
var userSchema = new Schema({
    user_id: {type: String, required: true},
    sns_id: {type: String, required: true},
    comm_id: {type: String},
    rep_id: {type: String},
    fav_id: {type: String},
    news_id: {type: String},
    last_login: {type: Date},
    auth: {type: Number, default: 1}, // 1 : 사용자 , 2: 관리자
    del: {type: Boolean},  // true : 삭제함 , false : 삭제하지 않음
    sea_his: {type: String}, // 주소 검색 내역
    dvc_id: {type: String},
    push_chk: {type: Boolean}, // true : 푸시
    user_img: [photoSchema]
});
// user_id : UUID , sns_id : sns login id
userSchema.statics.signUpUser = function (user_id, sns_id, callback) {
    this.model("User").collection.insert({user_id: user_id, sns_id: sns_id}
        , function (error, users) {
            if (error) callback(error);
            else {
                return callback(null, users);
            }
        })
};

/*userSchema.statics.signUpUser = function (user_id, sns_id) {
    this.model("User").collection.insert({user_id: user_id, sns_id: sns_id}
        , function (error, next) {
            if (err) next(error);
            else {
                return next();
            }
        })
};*/

var User = mongoose.model("User", userSchema);

module.exports = User;