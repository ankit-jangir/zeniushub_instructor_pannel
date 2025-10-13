const { CrudRepository } = require("./crude.repo");
const { Attendance } = require("../models"); 
// const attendance = require("../models/attendance");

class attendencerepositries extends CrudRepository {
  constructor() {
    super(Attendance); 
  }
}

module.exports = { attendencerepositries };
