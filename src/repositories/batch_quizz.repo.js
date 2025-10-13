const { CrudRepository } = require("./crude.repo");
const { batch_Quizz } = require("../models/index");

class batch_quizzrepo extends CrudRepository {
  constructor() {
    super(batch_Quizz);
  }

  async deleteByQuizId(quiz_id) {
    return await batch_Quizz.destroy({
      where: { quiz_id },
    });
  }
}

module.exports = { batch_quizzrepo };
