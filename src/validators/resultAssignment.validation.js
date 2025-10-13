const { z } = require('zod');

const ResultAssignmentSchema = z.object({
    id: z.number().int().positive(),
    batch_assignment_id: z
        .number({
            required_error: 'batch_assignment_id is required',
            invalid_type_error: 'batch_assignment_id must be a number',
        })
        .int()
        .positive(),

    student_enroll_id: z
        .number({
            required_error: 'student_enroll_id is required',
            invalid_type_error: 'student_enroll_id must be a number',
        })
        .int()
        .positive(),

    attachments: z
        .string()
        .optional()
        .refine(
            (val) => !val || /\.pdf$/i.test(val),
            { message: 'Only PDF files are allowed in attachments.' }
        ),

    status: z
        .enum(['unattempted', 'attempted'])
        .default('unattempted'),

    obtained_marks: z
        .number()
        .optional()
        .nullable(),

    note: z
        .string()
        .optional()
        .nullable(),

    result_declare_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, {
            message: 'result_declare_date must be in the format YYYY-MM-DD HH:mm',
        })
        .optional()
        .nullable(),

    number_attempts: z
        .number()
        .int()
        .min(0)
        .max(3)
        .default(0),
});

module.exports = ResultAssignmentSchema;
