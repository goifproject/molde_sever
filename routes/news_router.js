let express = require("express");
let router = express.Router();
let news_controller = require("../controllers/news_controller");

news_controller(router);


module.exports = router;