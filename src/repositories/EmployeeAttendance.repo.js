const { EmployeeAttendence } = require('../models');
const { CrudRepository } = require("./crude.repo");

class EmployeeAttendanceRepository extends CrudRepository {
    constructor() {
        super(EmployeeAttendence);
    }

    async markEmployeeAttendance(employee_id, attendance_date, status) {
        await EmployeeAttendence.upsert({
            employee_id,
            attendance_date,
            status,
        });
    }


    async getAttendanceInRange(employee_id, startDate, endDate) {
  return await EmployeeAttendence.findAll({
    where: {
      employee_id,
      attendence_date: {
        [Op.between]: [startDate, endDate],
      },
    },
    order: [['attendence_date', 'ASC']],
  });
}

}


module.exports = {
    EmployeeAttendanceRepository
};
