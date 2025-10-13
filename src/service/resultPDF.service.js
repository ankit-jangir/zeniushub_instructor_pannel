const { ExamResultRepository } = require("../repositories/exam_result.repo");

const resultRepo = new ExamResultRepository();

const examResultService = {
  getResultsByExamId: async (student_id, session_id, category_id) => {
  return await resultRepo.getResultsByStudentEnrollmentAndCategoryWithGrade(
    parseInt(student_id), parseInt(session_id), parseInt(category_id)
  );
},

};

module.exports = { examResultService };
