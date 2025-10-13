const express = require("express");
const student_Enrollment_Controller = require("../../controller/stu_enrollment.controller");
const authenticate = require("../../middleware/verifyToken");
const { checkAccessMiddleware } = require("../../middleware/checkAccessMiddleware");

const Stu_EnrollmentRouter = express.Router();

Stu_EnrollmentRouter.post("/PromoteStudent", authenticate,
    checkAccessMiddleware("batch"), student_Enrollment_Controller.studentPromote);
Stu_EnrollmentRouter.get("/getCourse/:id", authenticate,
    checkAccessMiddleware("batch"), student_Enrollment_Controller.getStudentPromotedCourse);
Stu_EnrollmentRouter.get("/getSession", authenticate,
    checkAccessMiddleware("batch"), student_Enrollment_Controller.getSessionForPromotedStudent);

module.exports = Stu_EnrollmentRouter;
