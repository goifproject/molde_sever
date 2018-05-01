let mongoose = require("mongoose");
let Schema = mongoose.Schema;


let faqSchema = new Schema({
    user_id: {type: String},
    sns_id: {type: String},
    faq_contents: {type: String},
    faq_email: {type: String}
});

faqSchema.statics.insertFaqData = function (user_id, sns_id, faq_contents, faq_email, callback) {
    this.model("FaQ").collection.insert({
        user_id: user_id,
        sns_id: sns_id,
        faq_contents: faq_contents,
        faq_email: faq_email
    }, function (error, faq) {
        if (error) callback(new Error(error));
        else {
            callback(null, faq);
        }
    })
};

let FaQ = mongoose.model("FaQ", faqSchema);

module.exports = FaQ;