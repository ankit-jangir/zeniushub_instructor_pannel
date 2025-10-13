const express = require("express");
const { employeeTask } = require("../../controller/employeeTask");
const authenticate = require("../../middleware/verifyToken");
const { checkAccessMiddleware } = require("../../middleware/checkAccessMiddleware");

const employeeTaskRoute = express.Router();

employeeTaskRoute.get("/get", authenticate,
    checkAccessMiddleware("dashboard"), employeeTask.getTasksByStatus);
employeeTaskRoute.get("/task-status-counts", authenticate,
    checkAccessMiddleware("dashboard"), employeeTask.getTaskStatusCount)
employeeTaskRoute.get('/:taskId', authenticate,
    checkAccessMiddleware("dashboard"), employeeTask.getTaskDetailsById);

module.exports = { employeeTaskRoute }
