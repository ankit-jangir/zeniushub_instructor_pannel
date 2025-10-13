const { CrudRepository } = require("./crude.repo");
const {
  exam_result,
  exam_batch,
  Exam,
  category,
  Student,
  Subject,
  Course,
  Batches,
  result_quiz,
  Assignment,
  batch_Quizz,
  ResultAssignment,
  BatchAssignment,
  quizz,
  Student_Enrollment,
  // Course,
  // Assignment
} = require("../models");
const { Sequelize, where, Model } = require("sequelize");

class ExamResultRepository extends CrudRepository {
  constructor() {
    super(exam_result);
  }

  async getResultsByStudentEnrollmentAndCategoryWithGrade(
    student_enrollment_id,
    category_id
  ) {
    const results = await exam_result.findAll({
      where: { student_enrollment_id },
      attributes: [
        "id",
        "marks_obtained",
        [
          Sequelize.literal(`
          CASE
            WHEN marks_obtained >= 90 THEN 'A'
            WHEN marks_obtained >= 75 THEN 'B'
            WHEN marks_obtained >= 60 THEN 'C'
            WHEN marks_obtained >= 40 THEN 'D'
            ELSE 'F'
          END
        `),
          "grade",
        ],
      ],
      include: [
        {
          model: exam_batch,
          attributes: ["id"],
          include: [
            {
              model: Exam,
              where: { category_id },
              attributes: ["exam_name", "total_marks"],
              include: [
                { model: Subject, attributes: ["subject_name"] },
                { model: category, attributes: ["name"] },
              ],
            },
          ],
        },

        {
          model: Student_Enrollment,
          attributes: ["student_id", "session_id"],
          include: [
            {
              model: Student,
              attributes: [
                "enrollment_id",
                "name",
                "father_name",
                "mother_name",
              ],
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    });

    console.log(Student_Enrollment, "Student_Enrollment...........>");

    const uniqueResultsMap = new Map();
    results.forEach((result) => {
      const subjectName = result.exam_batch?.Exam?.Subject?.subject_name;
      if (subjectName && !uniqueResultsMap.has(subjectName)) {
        uniqueResultsMap.set(subjectName, result);
      }
    });

    return Array.from(uniqueResultsMap.values());
  }

  //   async getallstudent(student_id) {
  //     const data = await exam_result.findAll({
  //   where: { student_id: student_id },
  //   attributes: ["marks_obtained", "student_result", "status", "student_percent", "result_dec_date"],
  //   include: [
  //     {
  //       model: Student,
  //       attributes: { exclude: ["createdAt", "updatedAt"] }
  //     },
  //     {
  //       model: exam_batch,
  //       attributes: { exclude: ["createdAt", "updatedAt"] },
  //       include: [
  //         {
  //           model: Exam,
  //           attributes: ["exam_name", "total_marks", "pass_percent", "is_result_dec", "result_dec_date"]
  //         }
  //       ]
  //     }
  //   ]
  // });

  //     const quizedata = await result_quiz.findAll({
  //       where: { student_id: student_id },

  //       attributes: ["status", "is_result_declared", "result_date", "marks_percentage", "marks_obtained"],
  //       include: [
  //         {
  //           model: batch_Quizz,
  //           attributes: {
  //             exclude: ["createdAt", "updatedAt"]
  //           },
  //           include: [{
  //             model: quizz,
  //             attributes: {
  //               exclude: ["updatedAt", "createdAt", "course_id", "quizz_rules", "batch_id", "quiz_id", "id", "employee_id"]
  //             }
  //           }]
  //         }
  //       ]

  //     })

  //     return {
  //       data,
  //       quizedata
  //     }
  //   }

  async getonestudentResultAssignment(
    Student_Enrollment_id,
    employee_id,
    page = 1,
    pageSize = 10
  ) {
    const studentData = await Student_Enrollment.findOne({
      where: { id: Student_Enrollment_id },
      attributes: ["id"],
      include: [
        {
          model: Student,
          attributes: ["id", "gender", "name", "profile_image","email","father_name","mother_name","ex_school","contact_no","enrollment_id"],
        },
      ],
    });

    if (!studentData) return null;

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    // ✅ Assignment ke upar employee_id filter
    const { count, rows } = await ResultAssignment.findAndCountAll({
      where: { student_enroll_id: Student_Enrollment_id },
      attributes: [
        "id",
        "result_declare_date",
        "note",
        "attachments",
        "status",
        "obtained_marks",
      ],
      include: [
        {
          model: BatchAssignment,
          attributes: ["batch_id", "id"],
          required: true,
          include: [
            {
              model: Assignment,
              required: true,
              where: { assign_by: employee_id }, // 👈 filter
              attributes: [
                "title",
                "total_marks",
                "min_percentage",
                "due_date",
                "assign_by",
                "attachments",
                "subject_id",
                "course_id",
              ],
              include: [
                { model: Course, attributes: ["course_name"] },
                { model: Subject, attributes: ["subject_name"] },
              ],
            },
            {
              model: Batches,
              attributes: ["BatchesName"],
            },
          ],
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [["id", "DESC"]],
    });

    // ✅ Counts with employee filter
    const totalAssignments = await ResultAssignment.count({
      where: { student_enroll_id: Student_Enrollment_id },
      include: [
        {
          model: BatchAssignment,
          required: true,
          include: [
            {
              model: Assignment,
              required: true,
              where: { assign_by: employee_id },
            },
          ],
        },
      ],
    });

    const attemptedCount = await ResultAssignment.count({
      where: { student_enroll_id: Student_Enrollment_id, status: "attempted" },
      include: [
        {
          model: BatchAssignment,
          required: true,
          include: [
            {
              model: Assignment,
              required: true,
              where: { assign_by: employee_id },
            },
          ],
        },
      ],
    });

    const unattemptedCount = await ResultAssignment.count({
      where: {
        student_enroll_id: Student_Enrollment_id,
        status: "unattempted",
      },
      include: [
        {
          model: BatchAssignment,
          required: true,
          include: [
            {
              model: Assignment,
              required: true,
              where: { assign_by: employee_id },
            },
          ],
        },
      ],
    });

    return {
      student: studentData,
      results: rows,
      counts: {
        total: totalAssignments,
        attempted: attemptedCount,
        unattempted: unattemptedCount,
      },
      pagination: {
        totalRecords: count,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  }

  async getonestudentExamDetails(
    Student_Enrollment_id,
    employee_id,
    page = 1,
    pageSize = 10
  ) {
    const studentData = await Student_Enrollment.findOne({
      where: { id: Student_Enrollment_id },
      attributes: ["id"],
      include: [
        {
          model: Student,
          attributes: ["id", "gender", "name", "profile_image","email","father_name","mother_name","ex_school","contact_no","enrollment_id"],
        },
      ],
    });

    if (!studentData) return null;

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const { count, rows } = await exam_result.findAndCountAll({
      where: { student_enrollment_id: Student_Enrollment_id },
      include: [
        {
          model: exam_batch,
          required: true,
          include: [
            {
              model: Exam,
              where: { employee_id },
              required: true,
              include: [
                { model: Course, attributes: ["course_name"] },
                { model: Subject, attributes: ["subject_name"] },
              ],
            },
            {
              model: Batches,
              attributes: ["BatchesName"],
            },
          ],
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [["id", "DESC"]],
    });

    const totalExams = await exam_result.count({
      where: { student_enrollment_id: Student_Enrollment_id },
      include: [
        {
          model: exam_batch,
          required: true,
          include: [{ model: Exam, where: { employee_id }, required: true }],
        },
      ],
    });

    const passCount = await exam_result.count({
      where: { student_enrollment_id: Student_Enrollment_id, status: "pass" },
      include: [
        {
          model: exam_batch,
          required: true,
          include: [{ model: Exam, where: { employee_id }, required: true }],
        },
      ],
    });

    const failCount = await exam_result.count({
      where: { student_enrollment_id: Student_Enrollment_id, status: "fail" },
      include: [
        {
          model: exam_batch,
          required: true,
          include: [{ model: Exam, where: { employee_id }, required: true }],
        },
      ],
    });

    const unattemptedCount = await exam_result.count({
      where: {
        student_enrollment_id: Student_Enrollment_id,
        status: "not attempted",
      },
      include: [
        {
          model: exam_batch,
          required: true,
          include: [{ model: Exam, where: { employee_id }, required: true }],
        },
      ],
    });

    return {
      student: studentData,
      results: rows,
      counts: {
        total: totalExams,
        pass: passCount,
        fail: failCount,
        unattempted: unattemptedCount,
      },
      pagination: {
        totalRecords: count,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  }

  async getonestudentQuizDetails(
    Student_Enrollment_id,
    employee_id,
    page = 1,
    pageSize = 10
  ) {
    const studentData = await Student_Enrollment.findOne({
      where: { id: Student_Enrollment_id },
      attributes: ["id"],
      include: [
        {
          model: Student,
          attributes: ["id", "gender", "name", "profile_image","email","father_name","mother_name","ex_school","contact_no","enrollment_id"],
        },
      ],
    });

    if (!studentData) return null;

    const offset = (page - 1) * pageSize;
    const limit = pageSize;

    const { count, rows } = await result_quiz.findAndCountAll({
      where: { student_enrollment_id: Student_Enrollment_id },
      include: [
        {
          model: batch_Quizz,
          required: true,
          include: [
            {
              model: quizz,
              required: true,
              where: { employee_id },
              include: [
                {
                  model: Course,
                  attributes: ["course_name"],
                  include: [{ model: Subject, attributes: ["subject_name"] }],
                },
              ],
            },
            {
              model: Batches,
              attributes: ["id", "BatchesName"],
            },
          ],
        },
      ],
      limit,
      offset,
      distinct: true,
      order: [["id", "DESC"]],
    });

    const totalQuizzes = await result_quiz.count({
      where: { student_enrollment_id: Student_Enrollment_id },
      include: [
        {
          model: batch_Quizz,
          required: true,
          include: [
            {
              model: quizz,
              required: true,
              where: { employee_id },
            },
          ],
        },
      ],
    });

    const attemptedCount = await result_quiz.count({
      where: {
        student_enrollment_id: Student_Enrollment_id,
        status: "attempted",
      },
      include: [
        {
          model: batch_Quizz,
          required: true,
          include: [
            {
              model: quizz,
              required: true,
              where: { employee_id },
            },
          ],
        },
      ],
    });

    const unattemptedCount = await result_quiz.count({
      where: {
        student_enrollment_id: Student_Enrollment_id,
        status: "unattempted",
      },
      include: [
        {
          model: batch_Quizz,
          required: true,
          include: [
            {
              model: quizz,
              required: true,
              where: { employee_id },
            },
          ],
        },
      ],
    });

    return {
      student: studentData,
      results: rows,
      counts: {
        total: totalQuizzes,
        attempted: attemptedCount,
        unattempted: unattemptedCount,
      },
      pagination: {
        totalRecords: count,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  }

  async getResultByexambatchtId(exam_batch_id) {
    return await exam_result.findAll({
      where: { exam_batch_id: exam_batch_id },
      include: [
        {
          model: Student_Enrollment,
          attributes: ["student_id", "course_id"],
          include: [
            {
              model: Student,
              attributes: ["name", "enrollment_id", "profile_image"],
            },
          ],
        },
      ],
    });
  }

  async updateResult(id, data) {
    return await exam_result.update(data, { where: { id } });
  }
}

module.exports = { ExamResultRepository };
