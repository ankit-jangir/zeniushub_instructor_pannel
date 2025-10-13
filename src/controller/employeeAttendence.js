const { now } = require("moment");
const emp_attendanceService = require("../service/employeeAttendence.service");
const customError = require("../utils/error.handle");
const { try_catch } = require("../utils/tryCatch.handle");
const {
  employeeAttendenceSchema,
} = require("../validators/employeeAttendence.validation");

const employeeAttendance = {
  mark_attendance: try_catch(async (req, res) => {
    const { employee_id, time } = req.body;

    const result = employeeAttendenceSchema
      .pick({ employee_id: true, time: true })
      .safeParse({ employee_id: parseInt(employee_id), time });

    if (!result.success) {
      throw new customError(
        result.error.errors.map((err) => err.message).join(", "),
        400
      );
    }

    const action = await emp_attendanceService.mark_attendance(
      employee_id,
      time
    );

    return res.status(200).json({
      status: "001",
      message: `${action} successful`,
    });
  }),

  getAttendanceByDateRange: try_catch(async (req, res) => {
    const employee_id = req.user.id;
    let { startDate, endDate, page, limit } = req.query;

    if (!startDate) throw new customError("startDate is required", 400);
    if (!endDate) throw new customError("endDate is required", 400);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start))
      throw new customError("startDate is not a valid date", 400);
    if (isNaN(end)) throw new customError("endDate is not a valid date", 400);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);

    if (start > today)
      throw new customError("startDate cannot be in the future", 400);
    if (end > today)
      throw new customError("endDate cannot be in the future", 400);
    if (end < start)
      throw new customError("endDate cannot be before startDate", 400);

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const {
      data,
      totalRecords,
      presentCount,
      absentCount,
      halfDayCount,
      selectedDays,
    } = await emp_attendanceService.getAttendance(
      employee_id,
      startDate,
      endDate,
      offset,
      limit
    );

    res.status(200).json({
      success: true,
      data,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      summary: {
        present: presentCount,
        absent: absentCount,
        halfDay: halfDayCount,
        selectedDays: selectedDays,
      },
    });
  }),
};

module.exports = { employeeAttendance };
