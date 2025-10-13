const { CrudRepository } = require("./crude.repo");
const {result_quiz} = require("../models/index")
const {Student} = require("../models/index")

class quizzResultRepositries extends CrudRepository {
  constructor() {
    super(result_quiz)
  }
  //   async findAllWithStudent(batch_quiz_id) {
  //    return await result_quiz.findAll({
  //   where: { batch_quiz_id: Number(batch_quiz_id) },
  //   include: [
  //     {
  //       model: Student,
  //       attributes: ["id", "name", "enrollment_id", "batch_id"],
  //     },
  //   ],
  // })
  // }
}

module.exports = {quizzResultRepositries}
