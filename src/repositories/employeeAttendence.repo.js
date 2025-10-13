const { EmployeeAttendence } = require("../models/");
const { CrudRepository } = require("./crude.repo");
const { Op } = require("sequelize");

class employeeAttendenceRepositories extends CrudRepository {
  constructor() {
    super(EmployeeAttendence);
  }

  async findAllAttendencePaginated(employee_id, start_date, end_date) {
    const where = {
      employee_id,
      attendence_date: {
        [Op.between]: [start_date, end_date],
      },
    };
    
    return EmployeeAttendence.findAll({
      where,
      order: [["attendence_date", "ASC"]],
    });
  }

  async countAttendence(employee_id, start_date, end_date) {
    return await EmployeeAttendence.count({
      where: {
        employee_id,
        attendence_date: {
          [Op.between]: [start_date, end_date],
        },
      },
    });
  }
}

module.exports = { employeeAttendenceRepositories };
