const { Op } = require("sequelize");
const { batchesRepositories } = require("../repositories/Batches.repo");
// const { quizzrepo } = require("../repositories/quizz.repo");
// const quizzRepositries = new quizzrepo();
const { SubjectRepositories } = require("../repositories/Subject.repo");
const quizzRepositries = require("../repositories/quizz.repo");
const {
  mystuaccessRepositories,
} = require("../repositories/studentEmrollment.repo");
const studentEnrollmentRepository = new mystuaccessRepositories();
const subjectReposity = new SubjectRepositories();
const batchrepository = new batchesRepositories();
const customError = require("../utils/error.handle");
const {
  Subject,
  Batches,
  Course,
  Student,
  quizz,
  batch_Quizz,
  result_quiz,
  Student_Enrollment,
} = require("../models");
const { batch_quizzrepo } = require("../repositories/batch_quizz.repo");
const { quizQueue } = require("../queues/quizQueue");
const batch_quizz_repositries = new batch_quizzrepo();

const { studentRepositories } = require("../repositories/student.repo");
const studentRepository = new studentRepositories();
const { quizzResultRepositries } = require("../repositories/result_quizz_repo");
const quizzRepo = require("../repositories/quizz.repo");
const resultQuizRepository = new quizzResultRepositries();

const quizzservice = {
  //   createQuizz: async (payload) => {
  //     const { subject_compostition, batch_id, ...quizData } = payload;

  //     if (
  //       !subject_compostition ||
  //       typeof subject_compostition !== "object" ||
  //       Array.isArray(subject_compostition)
  //     ) {
  //       throw new customError("subject_compostition must be a valid object");
  //     }

  //     const entries = Object.entries(subject_compostition);
  //     const subjectIds = [];
  //     let totalWeight = 0;

  //     for (const [key, value] of entries) {
  //       const subjectId = Number(key);
  //       if (
  //         !Number.isInteger(subjectId) ||
  //         typeof value !== "number" ||
  //         value < 0
  //       ) {
  //         throw new customError(
  //           "Each key must be an integer subject_id and value a non-negative number"
  //         );
  //       }
  //       subjectIds.push(subjectId);
  //       totalWeight += value;
  //     }

  //     if (totalWeight !== 100) {
  //       throw new customError(
  //         "Sum of subject_compostition values must be exactly 100"
  //       );
  //     }

  //     const foundSubjects = await subjectReposity.findAll({
  //       id: { [Op.in]: subjectIds },
  //     });

  //     const foundIds = foundSubjects.map((s) => s.id);
  //     const missing = subjectIds.filter((id) => !foundIds.includes(id));
  //     if (missing.length > 0) {
  //       throw new customError(`Invalid subject IDs: ${missing.join(", ")}`);
  //     }

  //     if (!Array.isArray(batch_id) || batch_id.length === 0) {
  //       throw new customError("batch_id must be a non-empty array of integers");
  //     }

  //     const allInts = batch_id.every((id) => Number.isInteger(id));
  //     if (!allInts) {
  //       throw new customError("batch_id must contain only integers");
  //     }

  //     const foundBatches = await batchrepository.findAll({
  //       id: { [Op.in]: batch_id },
  //     });
  // console.log('foundBatches : ====================================');
  // console.log(foundBatches);
  // console.log('====================================');
  //     const foundBatchIds = foundBatches.map((b) => b.id);
  //     const missingBatchIds = batch_id.filter(
  //       (id) => !foundBatchIds.includes(id)
  //     );
  //     if (missingBatchIds.length > 0) {
  //       throw new customError(`Invalid batch IDs: ${missingBatchIds.join(", ")}`);
  //     }

  //     const createdQuiz = await quizzRepositries.create({
  //       ...quizData,
  //       subject_compostition,
  //     });

  //     // Create batch_quizz entries
  //     const batchQuizPayload = batch_id.map((batchId) => ({
  //       quiz_id: createdQuiz.id,
  //       batch_id: batchId,
  //     }));

  //     const createdBatchQuizEntries =
  //       await batch_quizz_repositries.model.bulkCreate(batchQuizPayload, {
  //         returning: true,
  //       });
  // console.log('====================================');
  // console.log(quizzRepositries);
  // console.log('====================================');
  //     const resultEntries = [];

  //     for (const batchQuiz of createdBatchQuizEntries) {
  //       const enrollments = await studentEnrollmentRepository.findAll({
  //         batch_id: batchQuiz.batch_id,
  //       });

  //       for (const enrollment of enrollments) {
  //         resultEntries.push({
  //           student_enrollment_id: enrollment.id,
  //           batch_quiz_id: batchQuiz.id,
  //           status: "unattempted",
  //         });
  //       }
  //     }

  //     if (resultEntries.length > 0) {
  //       await resultQuizRepository.model.bulkCreate(resultEntries);
  //     }

  //     return {
  //       quiz: createdQuiz,
  //       assigned_batches: batch_id,
  //       result_quiz_count: resultEntries.length,
  //     };
  //   },

  createQuizz: async (employee_id, payload) => {
    const {
      subject_compostition,
      course_id,
      quizz_timing,
      title,
      ...quizData
    } = payload;

    // 1. Validate subject_composition
    if (
      !Array.isArray(subject_compostition) ||
      subject_compostition.length === 0
    ) {
      throw new customError("subject_compostition must be an array object ");
    }

    // 2. Validate and trim title
    if (!title || typeof title !== "string") {
      throw new customError("Title is required and must be a string");
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      throw new customError("Title cannot be empty after trimming");
    }
    if (!/^[a-zA-Z]/.test(trimmedTitle)) {
      throw new customError("Title must start with an alphabet after trimming");
    }

    const session_id = payload.session_id;
    if (!session_id) {
      throw new customError("session_id is required");
    }

    const subjectIds = [];
    let totalComposition = 0;

    for (const entry of subject_compostition) {
      const [key, value] = Object.entries(entry)[0]; // { "43": 100 } → key=43, value=100
      const subjectId = Number(key);
      const composition = Number(value);

      if (
        !Number.isInteger(subjectId) ||
        isNaN(composition) ||
        composition < 0
      ) {
        throw new customError(
          "Each subject_compostition item must be { subjectId: composition }"
        );
      }

      subjectIds.push(subjectId);
      totalComposition += composition;
    }

    if (totalComposition !== 100) {
      throw new customError(
        "Sum of subject_compostition values must be exactly 100"
      );
    }

    // 3. Validate subjects exist
    const foundSubjects = await subjectReposity.findAll({
      id: { [Op.in]: subjectIds },
    });

    const foundIds = foundSubjects.map((s) => s.id);
    const missing = subjectIds.filter((id) => !foundIds.includes(id));
    if (missing.length > 0) {
      throw new customError(`Invalid subject IDs: ${missing.join(", ")}`);
    }

    // 4. Fetch batches
    const foundBatches = await batchrepository.findAll({ course_id });
    if (!foundBatches || foundBatches.length === 0) {
      throw new customError("No batches found for this course_id");
    }

    const batch_id = foundBatches.map((b) => b.id);

    // 5. Create quiz (store subject_composition as-is, use trimmed title)
    const createdQuiz = await quizzRepo.create({
      ...quizData,
      course_id,
      session_id,
      subject_compostition,
      employee_id,
      quizz_timing: payload.quizz_timing,
      total_marks: payload.total_marks ?? 0,
      result_date: payload.result_date || null,
      title: trimmedTitle, // Use trimmed title
    });

    console.log(" Created Quiz: ", createdQuiz);

    // 6. Create batch_quizz entries for each batch
    const batchQuizPayload = batch_id.map((batchId) => ({
      quiz_id: createdQuiz.id,
      batch_id: batchId,
    }));

    const createdBatchQuizEntries =
      await batch_quizz_repositries.model.bulkCreate(batchQuizPayload, {
        returning: true,
      });

    // 7. Create result_quiz entries for each student enrollment in each batch
    const resultEntries = [];

    for (const batchQuiz of createdBatchQuizEntries) {
      const enrollments = await studentEnrollmentRepository.getAllWithCondition(
        { batch_id: batchQuiz.batch_id },
        [
          "id",
          "student_id",
          "course_id",
          "batch_id",
          "session_id",
          "fees",
          "discount_amount",
          "number_of_emi",
          "status",
          "course_status",
          "joining_date",
          "createdAt",
          "updatedAt",
        ]
      );

      for (const enrollment of enrollments) {
        resultEntries.push({
          student_enrollment_id: enrollment.id,
          batch_quiz_id: batchQuiz.id,
          status: "unattempted",
        });
      }
    }

    if (resultEntries.length > 0) {
      await resultQuizRepository.model.bulkCreate(resultEntries);
    }

    // 8. Return final response
    return {
      quiz: createdQuiz,
      assigned_batches: batch_id,
      session_id: session_id,
      result_quiz_count: resultEntries.length,
    };
  },

  // const { Op } = require("sequelize"); // Make sure Op is imported

  getAllQuizzes: async ({
    title,
    page = 1,
    limit = 10,
    employee_id,
    session_id,
  }) => {
    const offset = (page - 1) * limit;

    console.log("Service input - session_id:", session_id, "title:", title);

    // Fetch quizzes using repo function
    const quizzes = await quizzRepo.getdatawithsection(
      session_id,
      title,
      employee_id
    );

    console.log(
      "Service Fetched quizzes:",
      quizzes.map((q) => q.id)
    );

    // Map subjects
    const allSubjectIds = [];
    quizzes.forEach((q) => {
      (q.subject_compostition || []).forEach((obj) => {
        const key = Object.keys(obj)[0];
        const id = Number(key);
        if (!allSubjectIds.includes(id)) allSubjectIds.push(id);
      });
    });

    const subjects = await Subject.findAll({
      where: { id: allSubjectIds },
      attributes: ["id", "subject_name"],
      raw: true,
    });

    const subjectMap = {};
    subjects.forEach((s) => (subjectMap[s.id] = s.subject_name));

    // Format result
    const formatted = quizzes.map((quiz) => {
      const subjectNames = (quiz.subject_compostition || [])
        .map((obj) => subjectMap[Number(Object.keys(obj)[0])])
        .filter(Boolean);

      const batchNames =
        quiz.batch_Quizzs?.map((bq) => bq.Batch?.BatchesName).filter(Boolean) ||
        [];

      return {
        id: quiz.id,
        title: quiz.title,
        subject_names: subjectNames,
        course_name: quiz.Course?.course_name || null,
        batch_names: batchNames,
        total_question: quiz.total_question,
        passing_percentage: quiz.passing_percentage,
        quizz_time: quiz.quizz_timing || null,
      };
    });

    return {
      quizzes: formatted,
      pagination: {
        page,
        limit,
        totalRecords: quizzes.length,
        totalPages: Math.ceil(quizzes.length / limit),
      },
    };
  },

  getQuizById: async (quizId) => {
    const quiz = await quizz.findOne({
      where: { id: quizId },
      include: [
        {
          model: batch_Quizz,
          attributes: ["id", "batch_id", "quiz_id"],
          include: [
            {
              model: Batches,
              attributes: ["id", "BatchesName"],
            },
          ],
        },
        {
          model: Course,
          attributes: ["id", "course_name"],
        },
      ],
    });

    if (!quiz) return null;

    let subjectComposition = quiz.subject_compostition;

    console.log(" Raw subject_compostition:", subjectComposition);

    if (typeof subjectComposition === "string") {
      try {
        subjectComposition = JSON.parse(subjectComposition);
      } catch (err) {
        subjectComposition = [];
      }
    }

    if (Array.isArray(subjectComposition)) {
      subjectComposition = subjectComposition.flatMap((item) =>
        Object.entries(item).map(([subjectId, percentage]) => ({
          subjectId,
          percentage,
        }))
      );
    } else if (
      !Array.isArray(subjectComposition) &&
      typeof subjectComposition === "object"
    ) {
      subjectComposition = Object.entries(subjectComposition).map(
        ([subjectId, percentage]) => ({
          subjectId,
          percentage,
        })
      );
    }

    const subjectIds = subjectComposition.map((s) => s.subjectId);

    const subjects = await Subject.findAll({
      where: { id: subjectIds },
      attributes: ["id", "subject_name"],
      raw: true,
    });

    const subjectMap = {};
    subjects.forEach((subj) => {
      subjectMap[subj.id.toString()] = subj.subject_name;
    });

    const subjectCompositionWithNames = {};
    const subjectNames = [];

    for (const item of subjectComposition) {
      const idAsString = item.subjectId.toString();
      if (subjectMap[idAsString]) {
        const name = subjectMap[idAsString];
        subjectCompositionWithNames[name] = item.percentage;
        subjectNames.push(name);
      } else {
        console.log(" No match for subjectId:", item.subjectId);
      }
    }

    const timing = new Date(quiz.quizz_timing);
    const quizz_date = timing.toISOString().split("T")[0];
    const quizz_time = timing.toTimeString().split(" ")[0];

    return {
      ...quiz.toJSON(),
      subject_names: subjectNames,
      subject_compostition: subjectCompositionWithNames,
      course_name: quiz.Course?.course_name || null,
      quizz_date,
      quizz_time,
    };
  },
  // getQuizById: async (quizId) => {
  //   const quiz = await quizz.findOne({
  //     where: { id: quizId },
  //     include: [
  //       {
  //         model: batch_Quizz,
  //         attributes: ["id", "batch_id", "quiz_id"],
  //         include: [
  //           {
  //             model: Batches,
  //             attributes: ["id", "BatchesName"],
  //           },
  //         ],
  //       },
  //       {
  //         model: Course,
  //         attributes: ["id", "course_name"],
  //       },
  //     ],
  //   });

  //   if (!quiz) return null;

  //   // ----------------------------
  //   // 1. Handle subject_compostition with names
  //   // ----------------------------
  //   const subjectIds = Object.keys(quiz.subject_compostition || {});
  //   const subjects = await Subject.findAll({
  //     where: { id: subjectIds },
  //     attributes: ["id", "subject_name"],
  //     raw: true,
  //   });

  //   const subjectMap = {};
  //   subjects.forEach((subj) => {
  //     subjectMap[subj.id] = subj.subject_name;
  //   });

  //   const subjectCompositionWithNames = {};
  //   for (const [subjId, percentage] of Object.entries(
  //     quiz.subject_compostition || {}
  //   )) {
  //     const name = subjectMap[subjId] || `Subject ${subjId}`;
  //     subjectCompositionWithNames[name] = percentage;
  //   }

  //   // ----------------------------
  //   // 2. Split date and time
  //   // ----------------------------
  //   const timing = new Date(quiz.quizz_timing);
  //   const quizz_date = timing.toISOString().split("T")[0]; // YYYY-MM-DD
  //   const quizz_time = timing.toTimeString().split(" ")[0]; // HH:mm:ss

  //   // ----------------------------
  //   // 3. Final Response
  //   // ----------------------------
  //   return {
  //     ...quiz.toJSON(),
  //     // course_name: quiz.Course?.course_name || null,
  //     subject_compostition: subjectCompositionWithNames,
  //     quizz_date,
  //     quizz_time,
  //   };
  // },
  getBatchesByQuiz: async (quiz_id) => {
    return await batch_Quizz.findAll({
      where: { quiz_id: Number(quiz_id) },
      include: [
        {
          model: Batches,
          attributes: ["BatchesName"],
        },
      ],
    });
  },

  updateQuizz: async (id, payload) => {
    const quiz = await quizzRepositries.getDataById(id);
    if (!quiz) {
      return null; // not found
    }
    58;

    if (!payload.title || typeof payload.title !== "string") {
      throw new customError("Title is required and must be a string");
    }
    const trimmedTitle = payload.title.trim();
    if (trimmedTitle.length === 0) {
      throw new customError("Title cannot be empty after trimming");
    }
    if (!/^[a-zA-Z]/.test(trimmedTitle)) {
      throw new customError("Title must start with an alphabet after trimming");
    }

    const session_id = payload.session_id;
    if (!session_id) {
      throw new customError("session_id is required");
    }
    // update quiz
    await quiz.update(payload);
    return quiz;
  },
  addQuizJob: async (quizData) => {
    await quizQueue.add("quizAttempt", quizData);
    console.log("quizz service");
  },
  quizdel: async (quiz_id) => {
    console.log(quiz_id, "quiz id");
    const deletedCount = await quizzRepositries.deleteData(quiz_id);

    if (deletedCount === 0) {
      throw new Error("this quiz is already deleted or not found ");
    }

    return { message: "Quiz deleted successfully", count: deletedCount };
  },

  getQuizHistory: async ({ session_id, title, page, limit, employee_id }) => {
    if (!session_id) {
      throw {
        status: 400,
        message: "Session ID is required",
      };
    }

    const offset = (page - 1) * limit;
    const now = new Date();

    // ✅ Base filter
    const whereClause = {
      quizz_timing: { [Op.lt]: now },
      employee_id: employee_id, // ✅ सिर्फ उसी employee के quizzes
    };

    if (title?.trim()) {
      whereClause.title = { [Op.iLike]: `%${title.trim()}%` };
    }

    // ✅ Session के enrollments से batches निकालो
    const enrollments = await studentEnrollmentRepository.findAll({
      session_id: Number(session_id),
    });

    const batchIdFilter = [
      ...new Set(enrollments.map((e) => e.batch_id).filter(Boolean)),
    ];

    if (batchIdFilter.length === 0) {
      return {
        quizzes: [],
        pagination: {
          page,
          limit,
          totalRecords: 0,
          totalPages: 0,
        },
      };
    }

    const batchQuizInclude = {
      model: batch_Quizz,
      required: true,
      attributes: ["batch_id"],
      where: { batch_id: { [Op.in]: batchIdFilter } },
      include: [
        {
          model: Batches,
          attributes: ["id", "BatchesName"],
        },
      ],
    };

    // ✅ Get total count
    const totalRecords = await quizz.count({
      where: whereClause,
      include: [batchQuizInclude],
      distinct: true,
    });

    // ✅ Get quizzes
    const quizzes = await quizz.findAll({
      where: whereClause,
      include: [
        batchQuizInclude,
        {
          model: Course,
          attributes: ["id", "course_name"],
        },
      ],
      limit,
      offset,
      distinct: true,
    });

    // ✅ Collect all subject IDs
    const allSubjectIds = [];
    quizzes.forEach((quiz) => {
      const subjectComp = quiz.subject_compostition || [];
      if (Array.isArray(subjectComp)) {
        subjectComp.forEach((obj) => {
          const key = Object.keys(obj)[0];
          const id = Number(key);
          if (!allSubjectIds.includes(id)) {
            allSubjectIds.push(id);
          }
        });
      }
    });

    // ✅ Fetch subject names
    const subjects = await Subject.findAll({
      where: { id: allSubjectIds },
      attributes: ["id", "subject_name"],
      raw: true,
    });

    const subjectMap = {};
    subjects.forEach((s) => {
      subjectMap[s.id] = s.subject_name;
    });

    // ✅ Format output
    const formatted = quizzes.map((quiz) => {
      const subjectComp = quiz.subject_compostition || [];
      const subjectNames = Array.isArray(subjectComp)
        ? subjectComp
            .map((obj) => {
              const key = Object.keys(obj)[0];
              return subjectMap[Number(key)];
            })
            .filter(Boolean)
        : [];

      const batchNames =
        quiz.batch_Quizzs?.map((bq) => bq.Batch?.BatchesName).filter(Boolean) ??
        [];

      let quizz_date = null;
      let quizz_time = null;

      if (quiz.quizz_timing && !isNaN(new Date(quiz.quizz_timing))) {
        const dateObj = new Date(quiz.quizz_timing);
        quizz_date = dateObj.toISOString().split("T")[0];
        quizz_time = dateObj.toTimeString().split(" ")[0];
      }

      return {
        id: quiz.id,
        title: quiz.title,
        subject_names: subjectNames, // ✅ अब subject name आएगा
        course_name: quiz.Course?.course_name || null,
        batch_names: batchNames,
        total_question: quiz.total_question,
        passing_percentage: quiz.passing_percentage,
        quizz_date,
        quizz_time,
      };
    });

    return {
      quizzes: formatted,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    };
  },
  getQuizzesBySessionAndBatch: async ({
    sessionId,
    batchId,
    userId,
    page = 1,
    pageSize = 10,
  }) => {
    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    const { rows: quizzes, count } =
      await quizzRepo.getQuizzesBySessionAndBatch({
        sessionId,
        batchId,
        userId,
        limit,
        offset,
      });

    if (!quizzes || quizzes.length === 0) {
      return {
        quizzes: [],
        pagination: {
          totalRecords: 0,
          totalPages: 0,
          currentPage: page,
          pageSize,
        },
      };
    }

    const formattedQuizzes = quizzes.map((quiz) => {
      const dateObj = quiz.quizz_timing ? new Date(quiz.quizz_timing) : null;

      return {
        id: quiz.id,
        title: quiz.title,
        course_name: quiz.Course?.course_name || null,
        batches:
          quiz.batch_Quizzes?.map((bq) => ({
            id: bq.Batch?.id,
            name: bq.Batch?.BatchesName,
          })) || [],
        subjects: quiz.Course?.Subjects?.map((subj) => subj.subject_name) || [],
        total_question: quiz.total_question,
        passing_percentage: quiz.passing_percentage,
        quizz_date: dateObj ? dateObj.toISOString().split("T")[0] : null,
        quizz_time: dateObj ? dateObj.toTimeString().split(" ")[0] : null,
      };
    });

    return {
      quizzes: formattedQuizzes,
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  },

  declaredResult: async (sessionId) => {
    return await quizzRepo.declaredResult(sessionId);
  },
};

module.exports = quizzservice;
