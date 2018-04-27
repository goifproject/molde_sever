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
    push_chk: {type: Boolean , default : false}, // true : 푸시
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
// 사용자 아이디 가지고 사용자 정보 가져오기
userSchema.statics.getUserInfo = function (user_id,callback) {
    this.model("User").collection.findOne({
        user_id : user_id,
    },function (err,users) {
        if(err) callback(err);
        else{
            return callback(null,users);
        }
    })
};
// 사용자 정보 업데이트 (사진 정보)
userSchema.statics.updateUserImg = function (user_id,user_img,callback) {
    this.model("User").collection.update({
        user_id:user_id,
    })
};
// 사용자 정보 업데이트 (푸시 여부), push_chk : true >> 푸시 ok
userSchema.statics.updateUserPush = function (user_id,sns_id,push_chk,dvc_id,callback) {

};
// 사용자 정보 업데이트 (신고 하기)

// 사용자 정보 업데이트 (건물 위치 -- 즐겨 찾기)

// 사용자 정보 업데이트 (카드 뉴스 -- 즐겨 찾기)

// 사용자 정보 업데이트 (
var User = mongoose.model("User", userSchema);

module.exports = User;