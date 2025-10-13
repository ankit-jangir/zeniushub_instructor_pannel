const express = require("express");
// const { addEmi } = require("../../controllers/emis.controller");
const emiController = require("../../controller/emis.controller");
const authenticate = require("../../middleware/verifyToken");
const { checkAccessMiddleware } = require("../../middleware/checkAccessMiddleware");
// const { addOneShotEmi } = require("../../service/emis.services");
const emiRoute = express.Router();


emiRoute.get("/getEmisTotalAmounts", authenticate,
    checkAccessMiddleware("account"), emiController.getEmisTotalAmounts);
emiRoute.get("/emis", authenticate,
    checkAccessMiddleware("account"), emiController.getFilteredEmis);
emiRoute.get("/emis/today-summary", authenticate,
    checkAccessMiddleware("account"), emiController.getTodayEmiSummary);
emiRoute.get('/emis/download/excel', authenticate,
    checkAccessMiddleware("account"), emiController.getFilteredEmisExcel);


emiRoute.get("/emis/update-payment", authenticate,
    checkAccessMiddleware("account"), emiController.updateEmiPayment);


module.exports = { emiRoute };


