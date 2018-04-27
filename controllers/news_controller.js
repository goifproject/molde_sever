let News = require("../models/newsSchema");
module.exports = function (router) {
    // 카드 뉴스 추가
    router.post("/news", function (req, res, next) {
        let news_id = req.body.news_id;
        let category = req.body.category;
        let title = req.body.title;
        let contents = req.body.contents;
        let user_id = req.body.user_id;
        let news_img = req.body.news_img;
        let sm_img = req.body.sm_img;

        // 뉴스 (메거진) 추가
        // news_img , sm_img 이거 multiparty로 바꿔서 넣어주기.
        News.addOnNews(news_id, category, title, contents,
            new Date(), user_id, news_img, sm_img, function (err, news) {
                if (err) {
                    console.error((new Error(err)));
                } else {
                    console.log(JSON.stringify(news));
                    res.status(200).send(JSON.stringify(news));
                }
            });
    })
};