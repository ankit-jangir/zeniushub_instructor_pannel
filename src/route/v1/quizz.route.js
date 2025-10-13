const express = require("express");
const quizzcontroller = require("../../controller/quizz.controller");
const authenticate = require("../../middleware/verifyToken");
const { checkAccessMiddleware } = require("../../middleware/checkAccessMiddleware");
const quizzRouter = express.Router();

quizzRouter.post("/create", authenticate,
  checkAccessMiddleware("quiz"), quizzcontroller.createQuizz);
quizzRouter.get("/showquizz", authenticate,
  checkAccessMiddleware("quiz"), quizzcontroller.getAllQuizzes);
quizzRouter.get("/quiz/:id", authenticate,
  checkAccessMiddleware("quiz"), quizzcontroller.getQuizById);
quizzRouter.get("/batch/:quiz_id", authenticate,
  checkAccessMiddleware("quiz"), quizzcontroller.getBatchesByQuiz);
quizzRouter.put("/updating/:id", authenticate,
  checkAccessMiddleware("quiz"), quizzcontroller.updateQuizz);
quizzRouter.post("/submit-quiz", authenticate,
  checkAccessMiddleware("quiz"), quizzcontroller.submitQuiz);

quizzRouter.delete(
  "/quizdelete/:quiz_id",
  authenticate,
  checkAccessMiddleware("quiz"),
  quizzcontroller.deletequiz
);
quizzRouter.get("/quiz-history", authenticate,
  checkAccessMiddleware("quiz"), quizzcontroller.getQuizHistory);

quizzRouter.get(
  "/quiz-historybyid/:id",
  authenticate,
  checkAccessMiddleware("quiz"),
  quizzcontroller.getQuizHistory
);

quizzRouter.get("/quiz-bank", authenticate,
  checkAccessMiddleware("quiz"), quizzcontroller.getQuizHistory);

quizzRouter.get(
  "/quizzes",
  authenticate,
  checkAccessMiddleware("quiz"),
  quizzcontroller.getQuizzesBySessionAndBatch
);

quizzRouter.get("/declaredResult", authenticate,
  checkAccessMiddleware("quiz"), quizzcontroller.declaredResult);

module.exports = quizzRouter;
