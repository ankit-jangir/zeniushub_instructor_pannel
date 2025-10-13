const express = require('express');
const examrouter = express.Router();
const examcontroller = require('../../controller/exam.controller');
const authenticate = require('../../middleware/verifyToken');
const { upload, uploadPdf } = require('../../utils/multer');
const { checkAccessMiddleware } = require('../../middleware/checkAccessMiddleware');

examrouter.post(
  '/add-exam',
  authenticate,
  checkAccessMiddleware("exam"),
  uploadPdf.single("ques_paper"),
  examcontroller.addCompleteExam
);

examrouter.post('/getoneExamDetails', authenticate,
  checkAccessMiddleware("exam"), examcontroller.getoneExamDetails);
examrouter.get('/clicktobatchdetails', authenticate,
  checkAccessMiddleware("exam"), examcontroller.clicktobatchdetails);
examrouter.get('/getOneStudentResultAssignmentDetails', authenticate,
  checkAccessMiddleware("exam"), examcontroller.getOneStudentResultAssignmentDetails);
examrouter.get('/getOnestudentExamDetails', authenticate,
  checkAccessMiddleware("exam"), examcontroller.getOnestudentExamDetails);
examrouter.get('/getOnestudentQuizDetails', authenticate,
  checkAccessMiddleware("exam"), examcontroller.getOnestudentQuizDetails);
examrouter.get("/get-exams", authenticate,
  checkAccessMiddleware("exam"), examcontroller.getAllExams);
examrouter.get("/exam-history", authenticate,
  checkAccessMiddleware("exam"), examcontroller.getExamHistoryBySession);
examrouter.get("/getalltaskfordeshbord", authenticate,
  checkAccessMiddleware("exam"), examcontroller.getalltaskfordeshbord);
examrouter.get("/getalltaskforemploye", authenticate,
  checkAccessMiddleware("exam"), examcontroller.getalltaskforemploye);
examrouter.put("/updatestatustask", authenticate,
  checkAccessMiddleware("exam"), examcontroller.updatestatusTask);
examrouter.delete("/deleteexam", authenticate,
  checkAccessMiddleware("exam"), examcontroller.deleteexam);
examrouter.get("/by-session-batch", authenticate,
  checkAccessMiddleware("exam"), examcontroller.getExamsBySessionAndBatch);
examrouter.get("/exam_batch_id/:exam_batch_id", authenticate,
  checkAccessMiddleware("exam"), examcontroller.getResultByExamBatchId);
examrouter.put("/save-result/:exam_batch_id", authenticate,
  checkAccessMiddleware("exam"), examcontroller.saveResultByExamBatchId);


module.exports = examrouter;
