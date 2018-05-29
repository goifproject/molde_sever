var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var commSchema = new Schema({
    news_id: {type: String},
    comm_id: {type: String},
    comment: {type: String},
    rpt_sue: {type: Number}, // 게시물 신고 : 숫자가 높아질수록 신고 수 높아져서 아웃
    comm_sue: {type: Number}, // 댓글 신고 : 숫자가 높아질수록 신고 수 높아져서 아웃
    comm_date: {type: Date}
});

commSchema.statics.uploadComments = function (news_id, comm_id, comment, rpt_sue, comm_sue, comm_date, callback) {
    this.model("Comment").collection.insert({
        news_id: news_id, comm_id: comm_id, comment: comment,
        rpt_sue: rpt_sue, comm_sue: comm_sue, comm_date: comm_date
    }, function (err, comments) {
        if (err) callback(new Error(err));
        else {
            callback(null, comments);
        }
    });
};

commSchema.statics.findAndCommModified = function(comm_id,news_id,callback){
    this.model("Comment").findAndModify({
        query : { comm_id : comm_id , news_id : news_id },
        sort : {comm_id : 1},
        update : { R}
    })
}
var Comment = mongoose.model("Comment", commSchema);

module.exprots = Comment;