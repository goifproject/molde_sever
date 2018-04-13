var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var favSchema = new Schema({
    fav_id: {type: String},
    fav_addr: {type: String},
    fav_lat: {type: Number}, // 위도
    fav_lon: {type: Number}// 경도
});

var Favorite = mongoose.model("Favorite",favSchema);

module.exports = Favorite;