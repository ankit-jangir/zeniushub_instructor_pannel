const { StatusCodes } = require("http-status-codes");
const quizzservice = require("../service/quizz.service");
const { try_catch } = require("../utils/tryCatch.handle");
const { Subject } = require("../models");
const customError = require("../utils/error.handle");

const quizzcontroller = {
  createQuizz: try_catch(async (req, res) => {
    const payload = req.body;
    const employee_id = req.user.id;
    console.log(payload, "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    const response = await quizzservice.createQuizz(employee_id, payload);

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Quiz created successfully",
      data: response,
    });
  }),

  getAllQuizzes: try_catch(async (req, res) => {
    const { title = "", session_id, page = 1, limit = 10 } = req.query;
    console.log("user id for get all quizze : ", req.user.id);
    const employee_id = req.user.id;

    const response = await quizzservice.getAllQuizzes({
      title,
      session_id,
      
      page: Number(page),
      limit: Number(limit),
      employee_id,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Quizzes fetched successfully",
      data: response.quizzes,
      pagination: response.pagination,
    });
  }),

  getQuizById: try_catch(async (req, res) => {
    const { id } = req.params;

    const quiz = await quizzservice.getQuizById(id);
    if (!quiz) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Quiz not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Quiz fetched successfully",
      data: quiz,
    });
  }),

  getBatchesByQuiz: try_catch(async (req, res) => {
    const { quiz_id } = req.params;
    console.log(quiz_id);

    if (isNaN(quiz_id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid quiz_id",
      });
    }

    const batches = await quizzservice.getBatchesByQuiz(quiz_id);

    if (!batches || batches.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "No batches found for the given quiz",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Batches fetched successfully",
      data: batches,
    });
  }),

  updateQuizz: try_catch(async (req, res) => {
    const { id } = req.params;
    const { subject_compostition } = req.body;

    // Basic validation for subject_compostition
    if (subject_compostition) {
      if (typeof subject_compostition !== "object") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "subject_compostition must be a valid object",
        });
      }

      const entries = Object.entries(subject_compostition);

      const subjectIds = [];
      let totalWeight = 0;

      for (const [key, value] of entries) {
        const subjectId = Number(key);
        if (
          !Number.isInteger(subjectId) ||
          typeof value !== "number" ||
          value < 0
        ) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message:
              "Each key must be an integer subject_id and value a non-negative number",
          });
        }
        subjectIds.push(subjectId);
        totalWeight += value;
      }

      if (totalWeight !== 100) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Sum of subject_compostition values must be exactly 100",
        });
      }

      // Validate subject IDs exist in DB
      const { count } = await Subject.findAndCountAll({
        where: { id: subjectIds },
      });

      if (count !== subjectIds.length) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message:
            "One or more subject IDs in subject_compostition do not exist in DB",
        });
      }
    }

    // Call service to update quiz
    const updatedQuiz = await quizzservice.updateQuizz(id, req.body);

    if (!updatedQuiz) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Quiz not found with this ID",
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Quiz updated successfully",
      data: updatedQuiz,
    });
  }),
  submitQuiz: try_catch(async (req, res) => {
    const payload = req.body;

    // You may optionally validate `payload` here

    await quizzservice.addQuizJob(payload); // Add to BullMQ queue

    return res.status(StatusCodes.ACCEPTED).json({
      success: true,
      message: "Quiz job queued for processing",
    });
  }),

  deletequiz: try_catch(async (req, res) => {
    const { quiz_id } = req.params;
    console.log(quiz_id, "data");
    const data = await quizzservice.quizdel(quiz_id);

    return res.status(StatusCodes.ACCEPTED).json({
      success: true,
      message: data.message,
    });
  }),

  getQuizHistory: try_catch(async (req, res) => {
    const { title = "", page = 1, limit = 10, session_id } = req.query;
    const employee_id = req.user.id;

    const response = await quizzservice.getQuizHistory({
      session_id: session_id ? Number(session_id) : null,
      title,
      page: Number(page),
      limit: Number(limit),
      employee_id,
    });

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Past quizzes fetched successfully",
      data: response.quizzes,
      pagination: response.pagination,
    });
  }),

  getQuizzesBySessionAndBatch: async (req, res) => {
    try {
      const { sessionId, batchId, page, pageSize } = req.query;

      const userId = req.user.id;
      console.log(userId, "userId>>>>>>>>");

      if (!sessionId || !batchId) {
        return res.status(400).json({
          success: false,
          message: "sessionId and batchId are required",
        });
      }

      const quizzes = await quizzservice.getQuizzesBySessionAndBatch({
        sessionId,
        batchId,
        userId,
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 6,
      });

      return res.status(200).json({
        success: true,
        message: "Quizzes fetched successfully",
        data: quizzes,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message || "Something went wrong",
      });
    }
  },

  declaredResult: try_catch(async (req, res) => {
    const { sessionId } = req.query;

    if (!sessionId) throw new customError("SessionId is required!");

    const response = await quizzservice.declaredResult(sessionId);

    if (!response || response.length === 0)
      throw new customError("No data found!!!");

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully ^_^",
      data: response,
    });
  }),
};

module.exports = quizzcontroller;
