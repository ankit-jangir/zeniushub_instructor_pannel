const employeeRepositories = require("../repositories/employee.repo");
const {
  employeeAttendenceRepositories,
} = require("../repositories/employeeAttendence.repo");
const emp_attendenceRepository = new employeeAttendenceRepositories();
const emp_Repository = new employeeRepositories();
const customError = require("../utils/error.handle");
const { EmployeeAttendence } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

const emp_attendanceService = {
  mark_attendance: async (employee_id, time) => {
    const check = await emp_Repository.getOneData({ id: employee_id });

    if (!check) {
      throw new customError("Employee not found", 404);
    }

    if (check.status === "Inactive") {
      throw new customError("Employee is Inactive", 400);
    }

    const today = new Date().toISOString().slice(0, 10);
    const existing = await emp_attendenceRepository.getOneData({
      employee_id,
      attendence_date: today,
    });

    const [hour, minute] = time.split(":").map(Number);
    const totalMinutes = hour * 60 + minute;

    const startHour = parseInt(check.start_time.split(":")[0]);
    const endHour = parseInt(check.end_time.split(":")[0]);
    const startMinutes = startHour * 60;
    const endMinutes = endHour * 60;

    if (!existing) {
      const status = hour <= startHour ? "half_day" : "half_day";
      await emp_attendenceRepository.create({
        employee_id,
        attendence_date: today,
        in_time: time,
        status,
      });
      return "Check-in";
    } else {
      const checkInHour = parseInt(existing.in_time.split(":")[0]);
      const checkInMinutes = checkInHour * 60;

      let status = "half_day";
      if (checkInMinutes <= startMinutes && totalMinutes >= endMinutes) {
        status = "present";
      }

      await emp_attendenceRepository.update(
        { out_time: time, status },
        { employee_id, attendence_date: today }
      );
      return "Check-out";
    }
  },

  getAttendance: async (employee_id, startDate, endDate, offset, limit) => {
    // 1️⃣ Employee joining date
    const emp = await emp_Repository.findEmployeeWithJoiningDate(employee_id);
    if (!emp) throw new Error("Employee not found");
    const joinDate = new Date(emp.joining_date);

    // 2️⃣ Range: start from joining_date if later than requested start
    const userStart = new Date(startDate);
    const userEnd = new Date(endDate);
    const finalStart = joinDate > userStart ? joinDate : userStart;

    // 3️⃣ Fetch existing attendance records
    const records = await emp_attendenceRepository.findAllAttendencePaginated(
      employee_id,
      finalStart,
      userEnd
    );

    // Map DB records by date
    const recordMap = {};
    records.forEach((rec) => {
      const dateStr =
        rec.attendence_date instanceof Date
          ? rec.attendence_date.toISOString().split("T")[0]
          : rec.attendence_date;

      recordMap[dateStr] = {
        id: rec.id,
        employeeId: rec.employee_id,
        punchIn: rec.in_time || "00:00:00",
        punchOut: rec.out_time || "00:00:00",
        attendanceDate: dateStr,
        status: rec.status, // 'present' or 'half_day'
      };
    });

    // 4️⃣ Build full date list with absent/present counts
    const result = [];
    let current = new Date(finalStart);
    const end = userEnd;

    let presentCount = 0;
    let absentCount = 0;
    let halfDayCount = 0;

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const day = current.getDay();

      if (recordMap[dateStr]) {
        const r = recordMap[dateStr];
        result.push(r);
        if (r.status === "present") presentCount++;
        else if (r.status === "half_day") halfDayCount++;
      } else {
        if (day === 0) {
          // Sunday auto-present
          result.push({
            employeeId: employee_id,
            punchIn: "00:00:00",
            punchOut: "00:00:00",
            attendanceDate: dateStr,
            status: "present",
          });
          presentCount++;
        } else {
          // Auto-absent
          result.push({
            employeeId: employee_id,
            punchIn: "00:00:00",
            punchOut: "00:00:00",
            attendanceDate: dateStr,
            status: "absent",
          });
          absentCount++;
        }
      }
      current.setDate(current.getDate() + 1);
    }

    const paginated = result.slice(offset, offset + limit);

    return {
      data: paginated,
      totalRecords: result.length,
      presentCount,
      absentCount,
      halfDayCount,
      selectedDays: result.length,
    };
  },
};

module.exports = emp_attendanceService;
