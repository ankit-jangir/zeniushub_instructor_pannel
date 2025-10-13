const { logger } = require("sequelize/lib/utils/logger");
const { try_catch } = require("../utils/tryCatch.handle");
const customError = require("../utils/error.handle");
const assignmentService = require("../service/assignment.service");
const assignmentSchema = require("../validators/assignment.validation");
const { z } = require('zod');
const ResultAssignmentSchema = require("../validators/resultAssignment.validation");


const assignment = {

    addAssignment: try_catch(
        async (req, res) => {

            const fileData = {
                assign_by: req.user.id,
                ...req.body
            };

            fileData.batch_id = JSON.parse(fileData.batch_id)
            fileData.course_id = parseInt(fileData.course_id);
            fileData.session_id = parseInt(fileData.session_id);
            fileData.subject_id = parseInt(fileData.subject_id);
            fileData.min_percentage = parseInt(fileData.min_percentage);
            fileData.total_marks = parseInt(fileData.total_marks);
            fileData.batch_id = fileData.batch_id.map(id => parseInt(id));

            if (req.file) {
                fileData._rawFile = req.file;
            }

            const result = assignmentSchema.pick({ assign_by: true, course_id: true, subject_id: true, attachments: true, due_date: true, min_percentage: true, total_marks: true, title: true, batch_id: true, session_id: true }).safeParse(fileData);

            if (!result.success) {

                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            await assignmentService.addAssignment(fileData);
            return res.status(201).send({ status: "001", message: "Assignment created successfully" });
        }
    ),


    getAssignmentBySessionIdHistory: try_catch(
        async (req, res) => {
            const assign_by = req.user.id
            const result = assignmentSchema.pick({ title: true, session_id: true, assign_by: true }).safeParse({ title: req.query.title, session_id: parseInt(req.query.session_id), assign_by: assign_by });

            if (!result.success) {

                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const assignments = await assignmentService.searchAssignments({ ...req.query, assign_by });
            return res.status(200).send({ status: "001", assignments });
        }
    ),

    getAssignmentBySessionIdUpcoming: try_catch(
        async (req, res) => {
            const assign_by = req.user.id
            const result = assignmentSchema.pick({ title: true, session_id: true, assign_by: true }).safeParse({ title: req.query.title, session_id: parseInt(req.query.session_id), assign_by: assign_by });

            if (!result.success) {

                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }

            const assignments = await assignmentService.searchAssignment({ ...req.query, assign_by });
            return res.status(200).send({ status: "001", assignments });
        }
    ),

    getBatchByAssignmentId: try_catch(
        async (req, res) => {
            const result = assignmentSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.assignment_id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            const batches = await assignmentService.getBatchByAssignmentId(req.params.assignment_id);
            return res.status(200).send({ status: "001", batches });
        }
    ),

    getStudentByBatchIdOrAssignmentId: try_catch(
        async (req, res) => {

            const batchAssignmentSchema = z.object({
                batch_id: z.number({
                    required_error: "Batch ID is required"
                }).int().positive({ message: "Batch ID must be a positive integer" }),
                assignment_id: z.number({
                    required_error: "Assignment ID is required"
                }).int().positive({ message: "Assignment ID must be a positive integer" }),

            });

            const result = batchAssignmentSchema.safeParse({ batch_id: parseInt(req.query.batch_id), assignment_id: parseInt(req.query.assignment_id) });

            if (!result.success) {

                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            const students = await assignmentService.getStudentByBatchId({ batch_id: req.query.batch_id, assignment_id: req.query.assignment_id });
            return res.status(200).send({ status: "001", students });
        }
    ),

    declareResults: try_catch(async (req, res) => {

        const resultItemSchema = z.object({
            id: z.number({
                required_error: "ID is required",
                invalid_type_error: "ID must be a number"
            }),
            obtained_marks: z.number({
                required_error: "Obtained marks are required",
                invalid_type_error: "Obtained marks must be a number"
            }).optional().nullable(),
            note: z.string({
                required_error: "Note is required",
                invalid_type_error: "Note must be a string"
            }).optional().nullable(),
        });

        const resultSheetSchema = z.object({
            resultSheet: z.array(resultItemSchema).min(1, "At least one result is required"),
        });


        const result = resultSheetSchema.safeParse(req.body);

        if (!result.success) {

            throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
        }

        await assignmentService.declareResults(req.body.resultSheet);
        return res.status(200).json({ status: "001", message: "Results declared successfully" });
    }),

    getResultByBatchAssignmentId: try_catch(
        async (req, res) => {
            const result = ResultAssignmentSchema.pick({ batch_assignment_id: true }).safeParse({ batch_assignment_id: parseInt(req.params.batch_assignment_id) });

            if (!result.success) {

                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            const results = await assignmentService.getResultByBatchAssignmentId(req.params.batch_assignment_id);
            return res.status(200).send({ status: "001", results });
        }
    ),

    getStudentDetailByBatchOrAssignmentId: try_catch(
        async (req, res) => {
            const result = ResultAssignmentSchema.pick({ id: true }).safeParse({ id: parseInt(req.params.result_assignment_id) });

            if (!result.success) {


                throw new customError(result.error.errors.map(err => err.message).join(", "), 400);
            }
            const studentDetail = await assignmentService.getStudentDetailByBatchOrAssignmentId(req.params.result_assignment_id);
            return res.status(200).send({ status: "001", studentDetail });
        }
    ),


 
}
module.exports = { assignment }

