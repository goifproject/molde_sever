var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var photoSchema = new Schema([{
    filename: {type: String, default: null},
    filepath: {type: String, default: null},
    size: {type: String, default: null}
}]);

var reportSchema = new Schema({
    rep_id: {type: String, required: true},
    rep_nm: {type: String},
    rep_contents: {type: String},
    rep_geom: {
        lat: {type: String},
        lon: {type: String}
    },
    rep_addr: {type: String},
    user_id: {type: String},
    rep_state: {type: Number}, // 0. 접수중 - 빨간색 / 1. 접수완료 (탐지완료) : 빨간색 / 2. 접수완료 (제거)  - 파란색 /  3. 접수완료(미발견 또는 허위신고) 흰색
    date: {
        rep_date: {type: Date},
        chk_date: {type: Date},
        conf_date: {type: Date}
    },
    comm_id: {type: String},
    rep_img: [[photoSchema]]
});

reportSchema.statics.uploadPin = function (rep_id, rep_nm, rep_contents, img_object , callback) {

    this.model("Report").collection.insert({
            rep_id: rep_id,
            rep_nm: rep_nm,
            rep_contents: rep_contents,
            rep_img: img_object
        }
        , function (error, report) {
            if (error) callback(error);
            else {
                return callback(null, report);
            }
        })
};


var Report = mongoose.model("Report", reportSchema);

module.exports = Report;