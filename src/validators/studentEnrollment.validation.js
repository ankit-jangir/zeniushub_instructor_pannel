const {z} = require('zod');

const StudentEnrollmentSchema = z.object({
    course_id:z.number({
        required_error:"course id is required",
        invalid_type_error:"course_id must be a number",
    }).int().positive(),
    batch_id:z.number({
        required_error:"batch_id is required",
        invalid_type_error:"batch_id must be a number",
    }).int().positive(),
    session_id:z.number({
        required_error:"session_id is required",
        invalid_type_error:"session_id must be a number",
    }).int().positive(),
    new_course_id:z.number({
        required_error:"new_course_id is required",
        invalid_type_error:"new_course_id must be a number",
    }).int().positive(),
    new_batch_id:z.number({
        required_error:"new_batch_id  is required",
        invalid_type_error:"new_batch_id must be a number",
    }).int().positive(),
    new_session_id:z.number({
        required_error:"new_session_id  is required",
        invalid_type_error:"new_session_id must be a number",
    }).int().positive(),
    student_exclude:z.array(z.number().int().positive()).optional().nullable()
})

module.exports = StudentEnrollmentSchema