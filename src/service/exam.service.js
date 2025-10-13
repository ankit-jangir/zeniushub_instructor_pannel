const { sequelize, Student_Enrollment } = require("../models");
const { ExamBatchRepository } = require("../repositories/exam_batch.repo");
const { ExamResultRepository } = require("../repositories/exam_result.repo");
const { ExamRepository } = require("../repositories/exam.repository");
const { studentRepositories } = require("../repositories/student.repo");
const { Op } = require("sequelize");
const moment = require("moment");
const { batchesRepositories } = require("../repositories/Batches.repo");
const { categoryRepositories } = require("../repositories/category.repo");
const {
  employeeTaskRepositories,
} = require("../repositories/employeeTask.repo");
const customError = require("../utils/error.handle");
const {
  mystuaccessRepositories,
} = require("../repositories/studentEmrollment.repo");
const { uploadFileToAzure } = require("../utils/azureUploader");
const { SessionRepositories } = require("../repositories/session.repo");
// const { SessionRepositories } = require("../repositories/Session.repo");

const examRepo = new ExamRepository();
const batchRepo = new ExamBatchRepository();
const resultRepo = new ExamResultRepository();
const studentRepo = new studentRepositories();
const batchModelRepo = new batchesRepositories();
const categoryRepo = new categoryRepositories();
const employeeTaskRepositorie = new employeeTaskRepositories();
const studentEnrollmentRepo = new mystuaccessRepositories();
const sessionRepo = new SessionRepositories();

const examService = {
  addCompleteExam: async (payload, employee_id) => {
  const transaction = await sequelize.transaction();

  try {
    const body = payload.body || {};
    if (!Object.keys(body).length) {
      throw new Error("Request body is missing.");
    }

    if (!payload.file) {
      throw new Error("Question paper (ques_paper) PDF is required.");
    }

    // ------------------- File Upload -------------------
    const file = payload.file;
    const blobPath = `exam-papers/${Date.now()}_${file.originalname}`;
    const uploaded = await uploadFileToAzure(
      file.buffer,
      blobPath,
      file.mimetype
    );
    if (!uploaded.success)
      throw new Error("Failed to upload ques_paper to Azure");
    body.ques_paper = blobPath;

    // ------------------- Exam Name Validation -------------------
    if (!body.exam_name || typeof body.exam_name !== "string") {
      throw new Error("Exam name is required.");
    }

    const examName = body.exam_name.trim();

    if (examName.length === 0) {
      throw new Error("Exam name cannot be empty or only spaces.");
    }
    if (!/^[A-Za-z]/.test(examName)) {
      throw new Error("Exam name must start with an alphabetic character.");
    }
    if (/^\d+$/.test(examName)) {
      throw new Error("Exam name cannot be only numbers.");
    }

    // ✅ overwrite with trimmed
    body.exam_name = examName;

    // ------------------- Batches Parse -------------------
    if (typeof body.batches === "string") {
      try {
        body.batches = JSON.parse(body.batches);
      } catch (e) {
        body.batches = [body.batches];
      }
    }

    // ------------------- Schedule Date Validation -------------------
    if (!body.schedule_date) {
      throw new Error("Schedule date is required.");
    }
    const scheduleDate = new Date(body.schedule_date);
    if (isNaN(scheduleDate)) {
      throw new Error("Invalid schedule date format.");
    }
    if (scheduleDate < new Date()) {
      throw new Error("Schedule date cannot be in the past.");
    }

    // ------------------- Session Validation -------------------
    const session = await sessionRepo.findOne({ id: body.session_id });
    if (!session) throw new Error("Invalid session ID. No such session found.");

    const currentYear = moment().year();
    if (session.session_year !== currentYear) {
      throw new Error(
        `Exam can only be added in current year (${currentYear}).`
      );
    }

    // ------------------- Category Validation -------------------
    const category = await categoryRepo.findOne({ id: body.category_id });
    if (!category)
      throw new Error("Invalid category ID. No such category found.");

    // ------------------- Batch Validation -------------------
    const validBatches = await batchModelRepo.findAll({
      id: { [Op.in]: body.batches },
    });
    if (validBatches.length !== body.batches.length) {
      throw new Error("Some batches do not exist.");
    }

    // ------------------- Exam Creation -------------------
    body.employee_id = employee_id;
    const exam = await examRepo.create(body, { transaction });

    // ------------------- Exam_Batches Creation -------------------
    const examBatchData = validBatches.map((batch) => ({
      exam_id: exam.id,
      batch_id: batch.id,
    }));
    const createdBatches = await batchRepo.bulkCreate(examBatchData, {
      transaction,
    });

    // ------------------- Student Enrollments -------------------
    const studentEnrollments =
      await studentEnrollmentRepo.findActiveEnrollmentsByBatchesAndSession(
        {
          batches: body.batches,
          session_id: body.session_id,
        },
        transaction
      );

    console.log("Active Enrollments Found:", studentEnrollments.length);

    if (!studentEnrollments.length) {
      throw new Error(
        "No active enrollments found for these batches/session."
      );
    }

    // ------------------- Exam_Results Creation -------------------
    const results = [];
    for (let batch of createdBatches) {
      for (let enrollment of studentEnrollments) {
        if (enrollment.batch_id === batch.batch_id) {
          results.push({
            student_enrollment_id: enrollment.id,
            exam_batch_id: batch.id,
            status: "not attempted",
            category_id: body.category_id,
          });
        }
      }
    }

    console.log("exam_results to insert:", results.length);
    await resultRepo.bulkCreate(results, { transaction });

    // ------------------- Commit Transaction -------------------
    await transaction.commit();
    return {
      success: true,
      message: `Exam (${category.name}) added successfully with ${results.length} results.`,
    };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in addCompleteExam:", error);
    return {
      success: false,
      message: "Failed to add exam data.",
      error: error.message,
    };
  }
}

,


  getAllExams: async (session_id, exam_name,employee_id, page, limit) => {
    return await examRepo.getallbatchdetails(
      session_id,
      exam_name,
      employee_id,
      page,
      limit
    );
  },

  getOneExamDetailss: async (id) => {
    const newdata = await examRepo.fixdata(id);
    console.log("newdata", newdata[0].id);
    const daya = newdata[0].id;

    const result = await batchRepo.accessdata(daya);

    return {
      newdata,
      result,
    };
  },
  getExamHistoryBySession: async (
  session_id,
  exam_name,
  employee_id,
  category_name,
  status,
  page = 1,
  limit = 10
) => {
  try {
    const {
      data: exams,
      totalRecords,
      totalPages,
      currentPage,
    } = await examRepo.getExamHistoryBySession(
      session_id,
      exam_name,
      employee_id,
      category_name,
      status,
      page,
      limit
    );

    if (!exams || exams.length === 0) {
      return {
        success: false,
        message: "No exam history found for given filters.",
        data: [],
        totalRecords: 0,
        totalPages: 0,
        currentPage,
      };
    }

    const formatted = exams.map((exam) => {
      const examBatch = exam.exam_batches?.[0];
      return {
        id: exam.id,
        exam_name: exam.exam_name || "",
        subject_name: exam.Subject?.subject_name || "",
        course_name: exam.Course?.course_name || "",
        employee_id:exam.employee_id,
        schedule_date: exam.schedule_date,
        start_time: exam.start_time,
        end_time: exam.end_time,
        pass_percent: exam.pass_percent,
        status: exam.is_result_dec ? "Declared" : "Pending",
        ques_paper: exam.ques_paper,
        is_result_dec: exam.is_result_dec,
        total_marks: exam.total_marks,
        result_dec_date: exam.result_dec_date,
        exam_batch_id: examBatch?.id || null,
        batch_name: examBatch?.Batch?.BatchesName || "",
      };
    });

    return {
      success: true,
      message: "Exam history fetched successfully",
      data: formatted,
      totalRecords,
      totalPages,
      currentPage,
    };
  } catch (error) {
    console.error("Service Error:", error);
    return {
      success: false,
      message: "Failed to fetch exam history",
      error: error.message,
    };
  }
},



  clicktoBatch: async (batchid) => {
    const data = await batchRepo.getbatchdetailsbyId(batchid);
    return data;
  },
  clicktoBatch: async (batchid) => {
    const data = await batchRepo.getbatchdetailsbyId(batchid);
    return data;
  },

  studentResultAssignmentdetails: async (Student_Enrollment_id, employee_id, page = 1, pageSize = 10) => {
  let check = await studentEnrollmentRepo.getOneData({ id: Student_Enrollment_id });
  if (!check) {
    throw new customError("Student not found", 404);
  }

  return await resultRepo.getonestudentResultAssignment(Student_Enrollment_id, employee_id, page, pageSize);
},



studentExamDetails: async (Student_Enrollment_id, employee_id, page = 1, pageSize = 10) => {
  let check = await studentEnrollmentRepo.getOneData({ id: Student_Enrollment_id });
  if (!check) {
    throw new customError("Student not found", 404);
  }

  return await resultRepo.getonestudentExamDetails(
    Student_Enrollment_id,
    employee_id,   
    page,
    pageSize
  );
},




studentQuizDetails: async (Student_Enrollment_id,employee_id, page = 1, pageSize = 10) => {
  let check = await studentEnrollmentRepo.getOneData({ id: Student_Enrollment_id });
  if (!check) {
    throw new customError("Student not found", 404);
  }

  return await resultRepo.getonestudentQuizDetails(Student_Enrollment_id,employee_id, page, pageSize);
},

  getalltask: async (employee_id, task_tittle, status, page, limit) => {
    return await employeeTaskRepositorie.getalldata(
      employee_id,
      task_tittle,
      employee_id,
      status,
      page,
      limit
    );
  },

  deshborddata: async () => {
    const data = await employeeTaskRepositorie.getalldataforemployebatch();
    return data;
  },

  getalltaskupdate: async (id, status) => {
    const data = await employeeTaskRepositorie.update(
      { status: status },
      { id: id }
    );
    return data;
  },
  deleteExamdata: async (id) => {
    console.log("id : ", id, "type:", typeof id);

    const data = await examRepo.deleteData(id);

    if (data === 0) {
      // Already deleted or not found
      throw new customError("This data already deleted or not found.", 404);
    }

    return data; // return number of rows deleted
  },

 getExamsBySessionAndBatch: async ({
  sessionId,
  batchId,
  userId,
  page = 1,
  pageSize = 10,
}) => {
  const limit = Number(pageSize);
  const offset = (Number(page) - 1) * limit;

  const { rows: Exams, count } = await examRepo.getExamsBySessionAndBatch({
    sessionId,
    batchId,
    userId,   
    offset,
    limit,
  });

  if (!Exams || Exams.length === 0) {
    return {
      exams: [],
      pagination: {
        totalRecords: 0,
        totalPages: 0,
        currentPage: Number(page),
        pageSize: limit,
      },
    };
  }

  return {
    exams: Exams,
    pagination: {
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      pageSize: limit,
    },
  };
},


  getResultByExamBatchId: async (exam_batch_id) => {
    try {
      if (!exam_batch_id) {
        throw new Error("Exam Batch ID is required");
      }

      const results = await resultRepo.getResultByexambatchtId(exam_batch_id);

      return {
        success: true,
        message: "Exam results fetched successfully",
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to fetch exam results",
      };
    }
  },

  saveResultByExamBatchId: async (exam_batch_id, results) => {
  try {
    for (const result of results) {
      let status = "not attempted";

      if (
        result.marks_obtained !== null &&
        result.marks_obtained !== undefined
      ) {
        status = result.marks_obtained >= 33 ? "pass" : "fail";
      }

      await resultRepo.updateResult(result.id, {
        marks_obtained: result.marks_obtained,
        note: result.note,
        status: status,
        result_dec_date: new Date(),
        student_percent: result.marks_obtained
          ? (result.marks_obtained / 100) * 100
          : null,
      });
    }

    
    const examBatch = await batchRepo.getDataById(exam_batch_id);

if (examBatch) {
  
  await examRepo.update(
    { 
      is_result_dec: true,
      result_dec_date: new Date()   
    },
    { id: examBatch.exam_id },
  );
}

    return {
      success: true,
      message: "Results saved successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Failed to save results",
    };
  }
},

};

module.exports = examService;
