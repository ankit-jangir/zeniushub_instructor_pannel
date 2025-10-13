const express = require("express");
const { instructorRouter } = require("./employee.route");
const QuestionRouter  = require("./questoin.route");
const quizzRouter = require("./quizz.route");

const v1Router = express.Router();
v1Router.use("/instructor",instructorRouter );

const { employeeTaskRoute } = require("./employeeTask");
const { employeeAttendenceRoute } = require("./employeeAttendence");
const { batchRouter } = require("./batch.route");
const { assignmentRoute } = require("./assignment");
const { emiRoute } = require("./emis.routes");
const { chatRouter } = require("./chat.route");
const resultrouter = require("./result.router");
const examrouter = require("./exam.routes");
// const studentRouter = require("./student.route");
const Stu_EnrollmentRouter = require("./stu_enrollment.route");
const { sessionRoute } = require("./session");
const categoryrouter = require("./category");

v1Router.use("/employee/task", employeeTaskRoute);
v1Router.use("/employee/attendence", employeeAttendenceRoute);

v1Router.use("/instructor",instructorRouter );
v1Router.use("/batch",batchRouter );
v1Router.use("/assignment",assignmentRoute );
v1Router.use("/Question",QuestionRouter);
v1Router.use('/Quizz',quizzRouter)
v1Router.use('/emi',emiRoute)
v1Router.use("/exams",examrouter);
v1Router.use("/chat",chatRouter);
// v1Router.use("/student",studentRouter)
v1Router.use("/studentEnrollment",Stu_EnrollmentRouter);
// v1Router.use("/chat",chatRouter)
v1Router.use("/exams",resultrouter);

v1Router.use("/session", sessionRoute);

v1Router.use("/category", categoryrouter);
module.exports = { v1Router };