
const {category} = require("../models/index");
const { CrudRepository } = require("./crud.repo");

class CategoryRepositories extends CrudRepository {
  constructor() {
    super(category);
  }
}

module.exports = { CategoryRepositories };
