const examService = require("../service/exam.service");
const customError = require("../utils/error.handle");
const { try_catch } = require("../utils/tryCatch.handle");
const { z } = require("zod");
const EmployeeTaskSchema = require("../validators/employeeTask.validation");

const examController = {
  addCompleteExam: try_catch(async (req, res) => {
  try {
    const employee_id = req.user?.id;
    console.log("Employee ID:", employee_id);
    console.log("Headers:", req.headers["content-type"]);
    console.log("Method:", req.method);
    console.log("Request Body:", req.body);

    if (req.file) {
      console.log("Single File Uploaded:", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    }

    if (req.files) {
      console.log("Multiple Files Uploaded:");
      Object.keys(req.files).forEach((key) => {
        req.files[key].forEach((file) => {
          console.log({
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
          });
        });
      });
    }

    const response = await examService.addCompleteExam(
      {
        body: req.body,
        file: req.file,
        files: req.files,
      },
      employee_id
    );

    if (!response.success) {
      return res.status(400).json({
        success: false,
        message: response.message || "Validation failed while adding exam.",
        error: response.error || null,
      });
    }

    res.status(201).json({
      success: true,
      message: response.message,
    });
  } catch (error) {
    console.error("Error in addCompleteExam Controller:", error);

    // Past date error handling
    if (error.message?.includes("Schedule date cannot be in the past")) {
      return res.status(400).json({
        success: false,
        message: "Schedule date cannot be in the past.",
      });
    }

    if (error.message?.includes("Invalid schedule date")) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule date format. Please provide a valid date.",
      });
    }

    if (error.message?.includes("Schedule date is required")) {
      return res.status(400).json({
        success: false,
        message: "Schedule date is required to create an exam.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add exam data.",
      error: error.message,
    });
  }
}),


  getOneStudentResultAssignmentDetails: try_catch(async (req, res) => {
    const studentSchema = z.object({
      Student_Enrollment_id: z
        .number({
          required_error: "Student_Enrollment_id is required",
          invalid_type_error: "Student_Enrollment_id must be a number",
        })
        .int()
        .positive(),
    });

    const result = studentSchema
      .pick({ Student_Enrollment_id: true })
      .safeParse({
        Student_Enrollment_id: parseInt(req.query.Student_Enrollment_id),
      });

    if (!result.success) {
      throw new customError(
        result.error.errors.map((err) => err.message).join(", "),
        400
      );
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const studentDetails = await examService.studentResultAssignmentdetails(
      req.query.Student_Enrollment_id,
      req.user.id,
      page,
      pageSize
    );

    return res.status(200).send({
      success: true,
      studentDetails,
    });
  }),

  getOnestudentExamDetails: try_catch(async (req, res) => {
    const studentSchema = z.object({
      Student_Enrollment_id: z
        .number({
          required_error: "Student_Enrollment_id is required",
          invalid_type_error: "Student_Enrollment_id must be a number",
        })
        .int()
        .positive(),
    });

    const result = studentSchema
      .pick({ Student_Enrollment_id: true })
      .safeParse({
        Student_Enrollment_id: parseInt(req.query.Student_Enrollment_id),
      });

    if (!result.success) {
      throw new customError(
        result.error.errors.map((err) => err.message).join(", "),
        400
      );
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const studentDetails = await examService.studentExamDetails(
      req.query.Student_Enrollment_id,
      req.user.id,
      page,
      pageSize
    );

    return res.status(200).send({
      success: true,
      studentDetails,
    });
  }),

  getOnestudentQuizDetails: try_catch(async (req, res) => {
  const studentSchema = z.object({
    Student_Enrollment_id: z
      .number({
        required_error: "Student_Enrollment_id is required",
        invalid_type_error: "Student_Enrollment_id must be a number",
      })
      .int()
      .positive(),
  });

  const result = studentSchema
    .pick({ Student_Enrollment_id: true })
    .safeParse({
      Student_Enrollment_id: parseInt(req.query.Student_Enrollment_id),
    });

  if (!result.success) {
    throw new customError(
      result.error.errors.map((err) => err.message).join(", "),
      400
    );
  }

  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  const employee_id = req.user.id; 

  const studentDetails = await examService.studentQuizDetails(
    req.query.Student_Enrollment_id,
    employee_id,   
    page,
    pageSize
  );

  return res.status(200).send({
    success: true,
    studentDetails,
  });
}),


  getAllExams: try_catch(async (req, res) => {
    const { session_id, exam_name, page = 1, limit = 10 } = req.query;


    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "session_id is required",
      });
    }

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    

    const result = await examService.getAllExams(
      session_id,
      exam_name,
      req.user.id,
      parsedPage,
      parsedLimit
    );

    const totalPages = result.totalPages;

    if (result.totalRecords === 0) {
      return res.status(200).json({
        success: true,
        message: "No exams found for the given filters.",
        data: [],
        totalRecords: 0,
        totalPages: 0,
        currentPage: 0,
      });
    }

    if (parsedPage > totalPages) {
      return res.status(400).json({
        success: false,
        message: `No data found in page number ${parsedPage}.`,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exams fetched successfully",
      data: result.data,
      totalRecords: result.totalRecords,
      totalPages,
      currentPage: parsedPage,
    });
  }),

  getExamHistoryBySession: try_catch(async (req, res) => {
  const { session_id, exam_name, category_name, status, page = 1, limit = 10 } = req.query;
  const employee_id = req.user.id;

  if (!session_id) {
    return res.status(400).json({
      success: false,
      message: "session_id is required",
    });
  }

  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  const result = await examService.getExamHistoryBySession(
    session_id,
    exam_name,
    employee_id,
    category_name,
    status,
    parsedPage,
    parsedLimit
  );

  if (!result.success || result.totalRecords === 0) {
    return res.status(202).json(result);
  }

  if (parsedPage > result.totalPages) {
    return res.status(400).json({
      success: false,
      message: `No data found in page number ${parsedPage}.`,
      data: [],
      totalRecords: result.totalRecords,
      totalPages: result.totalPages,
      currentPage: parsedPage,
    });
  }

  return res.status(200).json(result);
}),


  getoneExamDetails: async (req, res) => {
    const data = await examService.getOneExamDetailss(req.query.id);
    res.status(200).json(data);
  },
  clicktobatchdetails: try_catch(async (req, res) => {
    const data = await examService.clicktoBatch(req.query.id);
    res.status(200).json(data);
  }),
  getalltaskfordeshbord: try_catch(async (req, res) => {
    const employee_id = req.user.id;
    // const result = EmployeeTaskSchema.pick({  task_tittle: true }).safeParse(req.query);

    // if (!result.success) {

    //   throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
    // }

    const tasks = await examService.getalltask({ employee_id, ...req.query });
    return res.status(200).json({ success: true, tasks });
  }),
  getalltaskforemploye: try_catch(async (req, res) => {
    const data = await examService.deshborddata();
    res.status(200).json(data);
  }),

  updatestatusTask: try_catch(async (req, res) => {
    const { id, status } = req.query
    const data = await examService.getalltaskupdate(id, status)
    res.status(200).json(
      {
        success: true,
        data: data
      }
    )

  }),
  deleteexam: try_catch(async (req, res) => {
    const { id } = req.query
    if (!id) {
      throw new customError("Exam id is required")
    }
    const data = await examService.deleteExamdata(id)
    res.status(200).json(
      {
        success: true,
        data: data
      }
    )

  }),


getExamsBySessionAndBatch: try_catch(async (req, res) => {
  const { sessionId, batchId, page = 1, pageSize, limit } = req.query;
  const userId = req.user.id;   
  const finalPageSize = Number(pageSize || limit || 10);

  const result = await examService.getExamsBySessionAndBatch({
    sessionId: Number(sessionId),
    batchId: Number(batchId),
    userId,
    page: Number(page),
    pageSize: finalPageSize,
  });

  res.status(200).json({
    success: true,
    data: result,   
  });
}),

  
  deleteexam: try_catch(async (req, res) => {
    const { id } = req.query;
    if (!id) {
      throw new customError("Exam id is required");
    }
    const data = await examService.deleteExamdata(id);
    res.status(200).json({
      success: true,
      data: data,
    });

    0;
  }),

  getExamsBySessionAndBatch: try_catch(async (req, res, next) => {
    try {
      const { sessionId, batchId, page = 1, pageSize, limit } = req.query;
      const userId = req.user.id;

      const finalPageSize = Number(pageSize || limit || 10);

      const result = await examService.getExamsBySessionAndBatch({
        sessionId: Number(sessionId),
        batchId: Number(batchId),
        userId,
        page: Number(page),
        pageSize: finalPageSize,
      });

      res.status(200).json({
        success: true,
        message: "Exams fetched successfully",  
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }),

  getResultByExamBatchId: try_catch(async (req, res) => {
    try {
      const { exam_batch_id } = req.params;
      console.log(exam_batch_id, ">>>>>>exam_batch_id");

      const response = await examService.getResultByExamBatchId(exam_batch_id);

      if (!response.success) {
        return res.status(400).json(response);
      }

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }),

  saveResultByExamBatchId: try_catch(async (req, res) => {
    try {
      const { exam_batch_id } = req.params;
      const { results } = req.body;

      if (!exam_batch_id) {
        return res
          .status(400)
          .json({ success: false, message: "Exam Batch ID is required" });
      }

      if (!Array.isArray(results) || results.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Results data is required" });
      }

      const response = await examService.saveResultByExamBatchId(
        exam_batch_id,
        results
      );

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }),
};

module.exports = examController;
