const { CrudRepository } = require("./crude.repo");
const {
  quizz,
  batch_Quizz,
  Course,
  Batches,
  Student_Enrollment,
  Subject,
  result_quiz,
  Student
} = require("../models");
const { Op, Sequelize } = require("sequelize");

class quizzrepo extends CrudRepository {
  constructor() {
    super(quizz);
  }

  async getQuizzesBySessionAndBatch({
    sessionId,
    batchId,
    userId,
    limit = 10,
    offset = 0,
  }) {
    return await quizz.findAndCountAll({
      where: { employee_id: userId },
      include: [
        {
          model: Course,
          attributes: ["id", "course_name"],
          required: true,
          include: [
            {
              model: Student_Enrollment,
              required: true,
              where: {
                session_id: sessionId,
                batch_id: batchId,
              },
              attributes: [],
            },
            {
              model: Subject,
              attributes: ["id", "subject_name"],
              through: { attributes: [] },
            },
          ],
        },
        {
          model: batch_Quizz,
          required: true,
          where: { batch_id: batchId },
          include: [
            {
              model: Batches,
              attributes: ["id", "BatchesName"],
            },
          ],
        },
      ],
      order: [["quizz_timing", "ASC"]],
      limit,
      offset,
      distinct: true,
    });
  }

  // In your repository (quizzRepo)
  async getdatawithsection(session_id, title, employee_id) {
    const whereClause = {};

    if (title?.trim()) {
      whereClause.title = { [Op.like]: `%${title.trim()}%` };
    }

    if (session_id != null) {
      whereClause.session_id = Number(session_id);
    }

    if (employee_id != null) {
      whereClause.employee_id = Number(employee_id); 
    }

     whereClause.quizz_timing = { [Op.gte]: new Date() };

    const quizzes = await quizz.findAll({
      where: whereClause,
      include: [
        {
          model: batch_Quizz,
          required: false,
          attributes: ["batch_id"],
          include: [{ model: Batches, attributes: ["id", "BatchesName"] }],
        },
        { model: Course, attributes: ["id", "course_name"] },
      ],
      distinct: true,
    });

    return quizzes;
}


  async declaredResult(sessionId) {
    return await result_quiz.findAll({
      where: { batch_quiz_id: sessionId },
      attributes: [
        "id",
        "batch_quiz_id",
        "status",
        "marks_obtained",
        "marks_percentage",
        "student_enrollment_id"
      ],
      include: [
        {
          model: Student_Enrollment,
          attributes: ["id"],
          include:[
            {
              model:Student,
               attributes: ["id", "name","profile_image"],
            }
          ]
        },
      ],
    });
  }
}

module.exports = new quizzrepo();
