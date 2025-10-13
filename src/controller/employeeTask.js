const { logger } = require("sequelize/lib/utils/logger");
const employeeTaskService = require("../service/employeeTask.service");
const { try_catch } = require("../utils/tryCatch.handle");
const customError = require("../utils/error.handle");
const { StatusCodes } = require("http-status-codes");



const employeeTask = {

  getTasksByStatus: try_catch(
    async (req, res) => {
      const { status } = req.query;
      const employee_id = req.user.id
      // if (!status) {
      //     throw new customError("Status query parameter is required", 400);
      // }

      // const result = EmployeeTaskSchema.pick({ status: true }).safeParse({ status: status });

      // if (!result.success) {

      //     throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
      // }

      const validStatuses = ['ongoing', 'completed', 'not started', 'not completed', 'missed', ''];

      if (!validStatuses.includes(status)) {
        throw new customError("Invalid status value", 400);
      }


      const tasks = await employeeTaskService.getTasksByStatus(status, employee_id);
      return res.status(200).send({ status: "001", tasks });
    }
  ),

  //task count 
  getTaskStatusCount: try_catch(
    async (req, res) => {

      const employee_id = req.user.id;
      console.log(employee_id, "!!!!!!!!!!!!!!!!!!!11");

      const data = await employeeTaskService.getTaskCountByStatusForEmployee(employee_id);

      return res.status(StatusCodes.ACCEPTED).json({
        success: true,
        message: 'Task status counts fetched successfully',
        data
      });

    }
  )
  , getTaskDetailsById: async (req, res) => {
    try {
      const { taskId } = req.params;
      const taskDetails = await employeeTaskService.getTaskDetails(taskId);

      if (!taskDetails) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.status(200).json({ task: taskDetails });
    } catch (err) {
      console.error('Error fetching task details:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
module.exports = { employeeTask }




