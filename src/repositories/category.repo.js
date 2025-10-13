const { CrudRepository } = require("./crude.repo");
// const category = require("../models");
const { category } = require("../models/index");

class categoryRepositories extends CrudRepository {
  constructor() {
    super(category);
  }
}

module.exports =  {categoryRepositories} 
