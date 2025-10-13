const express = require("express");
const questoincontroller = require("../../controller/question.controller");
const QuestionRouter = express.Router();
const authenticate = require("../../middleware/verifyToken");

const { upload, uploadPdf, uploadImage } = require("../../utils/multer");
const { checkAccessMiddleware } = require("../../middleware/checkAccessMiddleware");

QuestionRouter.post(
  "/QuestionCreate",
  authenticate,
  checkAccessMiddleware("quiz"),
  upload.single("file"),
  questoincontroller.importQuestions
);

QuestionRouter.post(
  "/add",
  authenticate,
  checkAccessMiddleware("quiz"),
  uploadPdf.single("pdf"),
  questoincontroller.addQuestionPaper
);

// const upload = require("../../utils/multer");

// QuestionRouter.post("/QuestionCreate",upload.single("file"),questoincontroller.importQuestions);
// QuestionRouter.get("/:subjectId",questoincontroller.QuestionsBySubject);
QuestionRouter.put("/update-status/:id", authenticate,
  checkAccessMiddleware("quiz"), questoincontroller.updateStatus);
QuestionRouter.get(
  "/question-papers",
  authenticate,
  checkAccessMiddleware("quiz"),
  questoincontroller.getAllQuestionPapers
);
QuestionRouter.get("/get/:id", authenticate,
  checkAccessMiddleware("quiz"), questoincontroller.getSingleQuestionPaper);


QuestionRouter.get("/allcoursegetapi", authenticate,
  checkAccessMiddleware("quiz"), questoincontroller.allcoursegetapi);



QuestionRouter.post(
  "/upload/Ques",
  authenticate,
  checkAccessMiddleware("quiz"),
  uploadImage.fields([
    { name: "question_img", maxCount: 1 },
    { name: "option1", maxCount: 1 },
    { name: "option2", maxCount: 1 },
    { name: "option3", maxCount: 1 },
    { name: "option4", maxCount: 1 },
  ]),
  questoincontroller.createQuestion
);


module.exports = QuestionRouter;
