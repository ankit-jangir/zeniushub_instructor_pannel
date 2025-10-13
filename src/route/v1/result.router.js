const express = require("express");
const { getExamResults, examresultdecliare } = require("../../controller/result.controller");
const authenticate = require("../../middleware/verifyToken");
const { checkAccessMiddleware } = require("../../middleware/checkAccessMiddleware");


const resultrouter = express.Router();
// const resultController = require("../controllers/result.controller");

// resultrouter.get("/download-marksheet", resultController.getStudentResult);
resultrouter.get("/exam-results", authenticate,
    checkAccessMiddleware("exam"), getExamResults);
resultrouter.get("/examresultdecliare", authenticate, checkAccessMiddleware("exam"), getExamResults);


module.exports = resultrouter;
