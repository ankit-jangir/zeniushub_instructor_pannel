const {emp_batch} = require("../models");
const { CrudRepository } = require("./crude.repo");


class empBatchRepositories extends CrudRepository {
  constructor() {
    super(emp_batch); 
  }
}
module.exports = {empBatchRepositories}