const express = require("express");
const authenticate = require("../../middleware/verifyToken");
const { session } = require("../../controller/session");
const { checkAccessMiddleware } = require("../../middleware/checkAccessMiddleware");
const sessionRoute = express.Router();

sessionRoute.get("/fetch", authenticate,
    checkAccessMiddleware("dashboard"), session.getSessions);

module.exports = { sessionRoute }



