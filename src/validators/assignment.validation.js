const { z } = require('zod');

const assignmentSchema = z.object({
    id: z.number().int().positive(),
    title: z.string({
        required_error: "Title is required"
    }),

    total_marks: z.number({
        required_error: "Total marks are required"
    }).int(),

    min_percentage: z.number({
        required_error: "Minimum percentage is required"
    }).min(0, { message: "Percentage cannot be less than 0" })
        .max(100, { message: "Percentage cannot be more than 100" }),

    due_date: z.string({
        required_error: "Due date is required"
    }).regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, {
        message: "Due date must be in the format YYYY-MM-DD HH:mm"
    }),

    is_result_dec: z.boolean().optional(),

    attachments: z
        .string()
        .optional()
        .refine(
            (val) => !val || /\.pdf$/i.test(val),
            { message: 'Only PDF files are allowed in attachments.' }
        ),

    subject_id: z.number({
        required_error: "Subject ID is required"
    }).int(),

    course_id: z.number({
        required_error: "Course ID is required"
    }).int(),

    session_id: z.number({
        required_error: "Session ID is required"
    }).int(),

    assign_by: z.number({
        required_error: "Assigned by (employee id) is required"
    }).int(),
    batch_id: z
        .array(
            z.number().int().positive({ message: "Each Batch ID must be a positive integer" })
        )
        .nonempty({ message: "At least one batch ID is required" })
});


module.exports = assignmentSchema;