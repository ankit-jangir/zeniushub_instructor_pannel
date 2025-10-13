'use strict';

const { z } = require('zod');

const EmployeeTaskSchema = z.object({
  id: z.number().int().positive(),
  task_tittle: z
    .string()
    .nonempty('Task title is required')
    .regex(/^[A-Za-z\s]+$/, 'Task title must only contain alphabetic characters and spaces'),

  description: z
    .string()
    .nonempty('Description is required'),

  attachments: z
    .string()
    .optional()
    .refine(
      (val) => !val || /\.pdf$/i.test(val),
      { message: 'Only PDF files are allowed in attachments.' }
    ),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, 'Due date must be in the format YYYY-MM-DD HH:MM'),

  employee_id: z
    .number()
    .int('Employee ID must be an integer')
    .positive('Employee ID must be a positive integer'),

  assigned_by: z
    .number()
    .int('Admin ID must be an integer')
    .positive('Admin ID must be a positive integer'),

  status: z
    .enum(['ongoing', 'completed', 'not started', 'not completed'])
    .default('not started')
});

module.exports = EmployeeTaskSchema;
