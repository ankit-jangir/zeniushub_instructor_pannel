const express = require("express");
const { assignment } = require("../../controller/assignment");
const getMulterConfig = require("../../utils/file.handler");
const authenticate = require("../../middleware/verifyToken");
const { checkAccessMiddleware } = require("../../middleware/checkAccessMiddleware");
const assignmentRoute = express.Router();


const pdfUpload = getMulterConfig(/pdf/);

assignmentRoute.post("/add", authenticate, checkAccessMiddleware("assignment"), pdfUpload.single('attachments'), assignment.addAssignment);
assignmentRoute.get("/historygetby", authenticate, checkAccessMiddleware("assignment"), assignment.getAssignmentBySessionIdHistory);
assignmentRoute.get("/upcominggetby", authenticate, checkAccessMiddleware("assignment"), assignment.getAssignmentBySessionIdUpcoming);
assignmentRoute.get("/getbatchbyassignmentid/:assignment_id", authenticate, checkAccessMiddleware("assignment"), assignment.getBatchByAssignmentId);
assignmentRoute.get("/getstudentby", authenticate, checkAccessMiddleware("assignment"), assignment.getStudentByBatchIdOrAssignmentId);
assignmentRoute.patch("/resultdeclare", authenticate, checkAccessMiddleware("assignment"), assignment.declareResults);
assignmentRoute.get("/getresultbybatchassignmentid/:batch_assignment_id", authenticate, checkAccessMiddleware("assignment"), assignment.getResultByBatchAssignmentId);
assignmentRoute.get("/getstudentdetailbyresultassignmentid/:result_assignment_id", authenticate, checkAccessMiddleware("assignment"), assignment.getStudentDetailByBatchOrAssignmentId);


module.exports = { assignmentRoute }
