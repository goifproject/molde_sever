let express = require("express");
let router = express.Router();
let bodyParser = require("body-parser");
let UserController = require("../controllers/user_controller");

UserController(router);

module.exports = router;