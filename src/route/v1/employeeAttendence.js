const express = require("express");
const { employeeAttendance } = require("../../controller/employeeAttendence");
const authenticate = require("../../middleware/verifyToken");
const { checkAccessMiddleware } = require("../../middleware/checkAccessMiddleware");
const employeeAttendenceRoute = express.Router();

employeeAttendenceRoute.post("/mark", authenticate,
    checkAccessMiddleware("setting"), employeeAttendance.mark_attendance);
employeeAttendenceRoute.get('/attendance', authenticate, checkAccessMiddleware("setting"), employeeAttendance.getAttendanceByDateRange);

module.exports = { employeeAttendenceRoute }
