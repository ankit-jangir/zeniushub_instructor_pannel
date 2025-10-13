const express = require("express");
const instructorController = require("../../controller/employee.controller");
const authenticate = require("../../middleware/verifyToken");
const { batchController } = require("../../controller/batchAccess.controller");
const {
  checkAccessMiddleware,
} = require("../../middleware/checkAccessMiddleware");

const rateLimit = require('express-rate-limit');

const instructorRouter = express.Router();



const otpRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,  // 2 minutes window
  max: 4,  // Allow only 4 request per window per IP
  handler: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - new Date()) / 1000);
    const minutes = Math.floor(retryAfter / 60);
    const seconds = retryAfter % 60;

    let timeMsg = "";
    if (minutes > 0) timeMsg += `${minutes} minute${minutes > 1 ? "s" : ""} `;
    if (seconds > 0) timeMsg += `${seconds} second${seconds > 1 ? "s" : ""}`;

    return res.status(429).json({
      status: "429",
      message: `Too many requests. Please try again after ${timeMsg.trim()}.`
    });
  }
});


instructorRouter.post("/login", otpRateLimiter, instructorController.loginEmployee);

instructorRouter.get(
  "/emp/subject",
  authenticate,
  checkAccessMiddleware("setting"),
  instructorController.getInstructorSubjects
);
instructorRouter.get(
  "/emp/batches",
  authenticate, checkAccessMiddleware("setting"),
  instructorController.getInstructorBatches
);
instructorRouter.get(
  "/student",
  authenticate,
  checkAccessMiddleware("batch"),
  batchController.getBatch
);
instructorRouter.post("/logout", authenticate, instructorController.logout);
instructorRouter.get("/profile", authenticate,
  checkAccessMiddleware("setting"), instructorController.getProfile),
  instructorRouter.get(
    "/EmpBatch",
    authenticate,

    checkAccessMiddleware("batch"),
    instructorController.getLoggedInStudentBatch
  ),

  instructorRouter.get("/Empsubject", authenticate,
    checkAccessMiddleware("setting"), instructorController.getMySubjects)

instructorRouter.get("/employesalery", authenticate,
  checkAccessMiddleware("setting"), instructorController.employesalery)



// employeeRoute.get("/assignbatchsubject/:employee_id", authenticate, employeeController.getEmployeeBatchSubject)
instructorRouter.get("/assignbatchsubject",authenticate, instructorController.getEmployeeBatchSubject)
instructorRouter.post("/assignEmployee",authenticate, instructorController.assignEmployee)


// instructorRouter.get(
//   "/student",
//   authenticate,
//   checkAccessMiddleware("batch"),
//   accessController.getStudent
// );

module.exports = { instructorRouter };
