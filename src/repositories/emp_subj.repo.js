const {emp_subj} = require("../models");
const { CrudRepository } = require("./crude.repo");


class empSubjRepositories extends CrudRepository {
  constructor() {
    super(emp_subj);
  }
}
module.exports = {empSubjRepositories}