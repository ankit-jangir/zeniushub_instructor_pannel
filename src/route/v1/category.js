const express = require("express");
const authenticate = require("../../middleware/verifyToken");
const categoryController = require("../../controller/category");
const { checkAccessMiddleware } = require("../../middleware/checkAccessMiddleware");
const categoryrouter = express.Router()

categoryrouter.get("/fetch", authenticate,
    checkAccessMiddleware("exam"), categoryController.getallcategorycontroller)

module.exports = categoryrouter