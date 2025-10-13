const { z } = require("zod");

const employeeAttendenceSchema = z.object({
  employee_id: z
    .number({
      required_error: "Employee ID is required",
      invalid_type_error: "Employee ID must be a number",
    })
    .int()
    .positive(),

  status: z.enum(["present", "half_day"], {
    required_error: "Status is required",
    invalid_type_error: 'Status must be either "present" or "half_day"',
  }),

  attendence_date: z
    .string({
      required_error: "Attendance date is required",
      invalid_type_error:
        "Attendance date must be a string in YYYY-MM-DD format",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),

  in_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "In-time must be in HH:MM format")
    .optional()
    .or(z.literal(null)),

  out_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Out-time must be in HH:MM format")
    .optional()
    .or(z.literal(null)),

  time: z
    .string({ required_error: "Time is required" })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:MM format"),

  end_date: z
    .string({
      required_error: "end_date is required",
      invalid_type_error:
        "end_date must be a string in YYYY-MM-DD format",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "end_date must be in YYYY-MM-DD format"),

  start_date: z
    .string({
      required_error: "start_date is required",
      invalid_type_error:
        "start_date must be a string in YYYY-MM-DD format",
    })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "start_date must be in YYYY-MM-DD format"),

});

module.exports = {
  employeeAttendenceSchema,
};
