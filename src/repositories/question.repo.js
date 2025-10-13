const { CrudRepository } = require("../repositories/crude.repo");
const { Question, Subject, Course, Batches } = require("../models/index");

class questionrepo extends CrudRepository {
  constructor() {
    super(Question);
  }

  async bulkCreate(dataArray) {
    return await this.model.bulkCreate(dataArray);
  }

  async getAllWithSubjectName(filters = {}, { offset = 0, limit = 10 } = {}) {
  const whereClause = {};
  const subjectWhere = {};

  if (filters.question) {
    whereClause.question = filters.question;
  }

  if (filters.added_by) {
    whereClause.added_by = filters.added_by;
  }

  if (filters.subject_name) {
    subjectWhere.subject_name = filters.subject_name;
  }

  console.log("whereclause ::::::::::::::", whereClause);

  return await Question.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Subject,
        attributes: ["subject_name", "id"],
        where: subjectWhere,
        required: true,
      },
      {
        model: Course, 
        attributes: ["id", "course_name"],
        include: [
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
    order: [["createdAt", "DESC"]],
  });
}


}

module.exports = { questionrepo };
