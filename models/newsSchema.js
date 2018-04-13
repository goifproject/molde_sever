var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var photoSchema = new Schema({
    filename: {type: String, default: null},
    filepath: {type: String, default: null},
    size: {type: String, default: null}
});

var newsSchema = new Schema({
    news_id : {type : String , required: true},
    category : {type : String},
    title : { type : String },
    contents : { type : String },
    news_date : { type : Date },
    user_id : {type :String },
    news_img : [photoSchema],
    sm_img : [photoSchema]
});

var News = mongoose.model("News",newsSchema);

module.exports = News;