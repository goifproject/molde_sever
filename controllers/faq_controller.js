let Faq = require("../models/faqSchema");

module.exports = function (router) {
    router.post("/faq", function (req, res, next) {
        let user_id = req.body.sns_id;
        let sns_id = req.body.sns_id;
        let faq_contents = req.body.faq_contents;
        let faq_email = req.body.faq_email;

        Faq.insertFaqData(user_id, sns_id, faq_contents, faq_email, function (error, faq) {
            if (error) {
                console.error(new Error(error));
            } else {
                res.status(200).send(JSON.stringify(faq));
            }
        })
    })
};