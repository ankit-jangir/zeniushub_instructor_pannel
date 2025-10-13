// repositories/questionpaper.repo.js
const { CrudRepository } = require("./crude.repo");
const { QuestionPaper, Question, Subject, Course } = require("../models");
const { Op } = require("sequelize");

class QuestionPaperRepositories extends CrudRepository {
  constructor() {
    super(QuestionPaper);
  }

  async getQuestionPaperById(id) {
    console.log("^^^^^^^^^^^^6 ", id);
    const result = await Question.findOne({
      where: {  subject_id: plain.Subject?.id || null,
    course_id: plain.Course?.id || null, },
      include: [
        {
          model: Subject,
          include: [
            {
              model: Course,
            },
          ],
        },
      ],
      raw: false, // abhi debugging ke liye raw: false rakho
    });

    return result;
  }

  async getDataWithId(courseId, subjectId, page = 1, limit = 10, search = "") {
    try {
      // Validate and parse inputs
      const parsedPage = Math.max(1, parseInt(page, 10));
      const parsedLimit = Math.max(1, parseInt(limit, 10));
      const offset = (parsedPage - 1) * parsedLimit;

      // Build where clause
      const whereClause = {
        course_id: courseId,
        subject_id: subjectId,
      };

      // Add search condition only if search is non-empty
      if (search && search.trim() !== "") {
        whereClause.question = { [Op.iLike]: `%${search.trim()}%` }; // Case-insensitive search
      }

      // Execute query with findAndCountAll
      const { count, rows } = await Question.findAndCountAll({
        where: whereClause,
        offset,
        limit: parsedLimit,
        attributes: ["id", "question", "course_id", "subject_id", "answer", "img"], // Select only necessary columns
        distinct: true, // Ensure accurate count
      });

      return {
        totalRecords: count,
        totalPages: Math.ceil(count / parsedLimit),
        currentPage: parsedPage,
        limit: parsedLimit,
        data: rows,
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error("Failed to fetch data");
    }
  }
}

module.exports = { QuestionPaperRepositories };
