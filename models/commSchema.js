var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var commSchema = new Schema({
    comm_id : {type : String },
    comment : {type : String},
    rpt_sue : {type : Number}, // 게시물 신고 : 숫자가 높아질수록 신고 수 높아져서 아웃
    comm_sue : {type : Number} // 댓글 신고 : 숫자가 높아질수록 신고 수 높아져서 아웃
});

var Comment = mongoose.model("Comment",commSchema);

module.exprots = Comment;