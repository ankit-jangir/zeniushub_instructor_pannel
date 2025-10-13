
const { Student, Batches, Session, Course } = require("../models/index");
// const { CrudRepository } = require("./crud.repo");
const { Op, where } = require("sequelize");
const { CrudRepository } = require("./crude.repo");


class studentRepositories extends CrudRepository {
  constructor() {
    super(Student);
  }


  async getInactiveStudentsBySession(sessionId, name, email, contact_no, limit, offset) {
    let whereCondition = { status: "inactive" };

    if (name) {
      whereCondition['name'] = { [Op.iLike]: `%${name}%` };
    }

    if (email) {
      whereCondition['email'] = { [Op.iLike]: `%${email}%` };
    }

    if (contact_no) {
      whereCondition['contact_no'] = { [Op.iLike]: `%${contact_no}%` };
    }

    let batchWhere = {};
    if (sessionId) {
      batchWhere['Session_id'] = sessionId;
    }

    return await this.model.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Batches,
          where: batchWhere,
          include: [{ model: Session }]
        }
      ],
      limit,
      offset
    });
  }

  async getFilteredStudents(course_id, batch_id, session_id) {

    return await this.model.findAll({
      where: {
        ...(course_id && { course_id }),
        ...(batch_id && { batch_id })
      },

      include: [
        {
          model: Batches,
          as: "Batch",
          attributes: ["BatchesName", "Session_id"],
          required: true,
          where: { Session_id: session_id },
          include: [
            {
              model: Session,
              attributes: ["session_year"],
              required: true
            }
          ]
        },
        {
          model: Course,
          attributes: ["course_name"],
          required: true
        }
      ]

    });
  }








  async getSectionById(id) {
    const student = await Student.findByPk(id, {
      include: [
        {
          model: Batches,
          attributes: ['Session_id'],
          include: [
            {
              model: Session,
              attributes: ['id', 'session_year'] // ya jo bhi fields chahiye
            }
          ]
        }
      ]
    });

    return student;
  }

  async getStudentByBatchId(batch_id) {
    return await Student.findAll({
      where: { batch_id: batch_id },

    })
  }



}

module.exports = { studentRepositories };
