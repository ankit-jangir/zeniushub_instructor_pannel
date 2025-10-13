const { where } = require("sequelize");
const { assignmentRepositories } = require("../repositories/assignment.repo");
const { batchAssignmentRepositories } = require("../repositories/batchAssignment.repo");
const customError = require("../utils/error.handle");
const { uploadFileToAzure } = require("../utils/azureUploader");
const fs = require("fs");
const { studentRepositories } = require("../repositories/student.repo");
const { resultAssignmentRepositories } = require("../repositories/resultAssignment.repo");
const { SubjectCoursesRepositories } = require("../repositories/subeject_courses.repo");
const { batchesRepositories } = require("../repositories/Batches.repo");
const { CoursesRepositories } = require("../repositories/courses.repo");
const { SubjectRepositories } = require("../repositories/Subject.repo");

const { SessionRepositories } = require("../repositories/Session.repo");
const { Student_EnrollmentRepositories } = require("../repositories/student_enrollment.repo");

const moment = require("moment");
const assignmentRepository = new assignmentRepositories();
const batchAssignmentRepository = new batchAssignmentRepositories();
const studentRepository = new studentRepositories();
const resultAssignmentRepository = new resultAssignmentRepositories();
const subjectCourseRepository = new SubjectCoursesRepositories();
const batchRepository = new batchesRepositories();
const courseRepository = new CoursesRepositories();
const subjectRepository = new SubjectRepositories();
const sessionRepository = new SessionRepositories();
const Student_EnrollmentRepository = new Student_EnrollmentRepositories();




const assignmentService = {


    addAssignment: async (data) => {
        if (data._rawFile) {
            const file = data._rawFile;
            const buffer = fs.readFileSync(file.path);
            const blobName = `assignment-attachment/${file.filename}`;
            const result = await uploadFileToAzure(buffer, blobName);

            if (!result.success) {

                throw new customError(`Azure upload failed: ${result.error}`, 502);
            }

            const fullUrl = result.url;
            const attachmentPath = fullUrl.split('/').slice(-2).join('/');
            data.attachments = attachmentPath;
            delete data._rawFile;
        }
        const { assign_by, course_id, subject_id, attachments, title, total_marks, due_date, min_percentage, batch_id, session_id } = data;
        let check_sub_assignment = await assignmentRepository.getOneData({ title: title, subject_id: subject_id, session_id: session_id });
        if (check_sub_assignment) {

            throw new customError(`Assignment already exsits in this subject ${subject_id} or this session year ${session_id}`, 409);

        }

        const [datePart, timePart] = due_date.split(" ");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);


        const due_dateCheck = new Date(year, month - 1, day, hour, minute);


        const now = new Date();


        if (due_dateCheck < now) {

            throw new customError("Due date cannot be in the past", 400);
        }


        const currentYear = new Date().getFullYear();
        const checkSession = await sessionRepository.getOneData({ id: session_id });


        if (checkSession.session_year !== currentYear) {
            throw new customError(`Assignments can only be added in the current year ${currentYear}.`, 400);
        }


        const check = await courseRepository.getOneData({ id: course_id });

        if (!check) {
            throw new customError("Course not found", 404);
        }

        if (check.status === "inactive") {
            throw new customError("Course is Inactive", 400);
        }

        const checkSubject = await subjectRepository.getOneData({ id: subject_id });

        if (!checkSubject) {
            throw new customError("Subject not found", 404);
        }


        if (checkSubject.status === "inactive") {
            throw new customError("Subject is Inactive", 400);
        }
        const subjectValid = await subjectCourseRepository.getOneData({ subject_id, course_id });
        if (!subjectValid) {
            throw new customError(`Subject ID ${subject_id} does not belong to the given Course`, 400);
        }

        const assignment = await assignmentRepository.create({ assign_by, course_id, subject_id, attachments, title, total_marks, due_date, min_percentage, session_id });


        for (const batch_ids of batch_id) {

            const batchValidForSession = await Student_EnrollmentRepository.getOneData({ batch_id: batch_ids, session_id: session_id });
            if (!batchValidForSession) {
                throw new customError(`Batch ID ${batch_ids} does not belong to the given Session`, 400);
            }


            const batchValid = await batchRepository.getOneData({ id: batch_ids, course_id });
            if (!batchValid) {
                throw new customError(`Batch ID ${batch_ids} does not belong to the given Course`, 400);
            }

            if (batchValid.status === "inactive") {
                throw new customError(`Batch (${batch_ids}) is Inactive`, 400);
            }
            let batchAssignment = await batchAssignmentRepository.create({ assignment_id: assignment.id, batch_id: batch_ids });

            const students = await Student_EnrollmentRepository.getStudentByBatchId(batch_ids);

            for (const student of students) {

                if (student.status) {
                    await resultAssignmentRepository.create({ batch_assignment_id: batchAssignment.id, student_enroll_id: student.id });

                }


            }
        }

    },

    searchAssignments: async (data) => {
        const { title, page, limit, session_id, assign_by } = data;
        const offset = (page - 1) * limit;

        const { rows, count } = await assignmentRepository.getAssignmentsByTitleAndSession(
            title,
            offset,
            limit,
            session_id,
            assign_by
        );


        const percentages = {};
        for (const assignment of rows) {
            const assignmentBatches = await batchAssignmentRepository.getBatches(assignment.id);
            const totalBatches = assignmentBatches.length;
            const declaredResults = assignmentBatches.filter(batch => batch.result_dec).length;
            const percentage = totalBatches === 0 ? 0 : ((declaredResults / totalBatches) * 100).toFixed(2);


            percentages[assignment.id] = Number(percentage);
        }

        return {
            data: rows,
            result_dec_percentage: percentages,
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / limit),
        };
    }
    ,
    searchAssignment: async (data) => {
        const { title, page, limit, session_id, assign_by } = data;
        const offset = (page - 1) * limit;

        const { rows, count } = await assignmentRepository.getAssignmentsByTitleAndSessionFuture(
            title,
            offset,
            limit,
            session_id,
            assign_by
        );

        const percentages = {};
        for (const assignment of rows) {
            const assignmentBatches = await batchAssignmentRepository.getBatches(assignment.id);
            const totalBatches = assignmentBatches.length;
            const declaredResults = assignmentBatches.filter(batch => batch.result_dec).length;
            const percentage = totalBatches === 0 ? 0 : ((declaredResults / totalBatches) * 100).toFixed(2);

            percentages[assignment.id] = Number(percentage);


        }

        return {
            data: rows,
            result_dec_percentage: percentages,
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / limit),
        };
    }
    ,
    getBatchByAssignmentId: async (id) => {

        let check = await assignmentRepository.getOneData({ id: id });
        if (!check) {

            throw new customError("Assignment not found", 404);

        }
        return await batchAssignmentRepository.getBatchByAssignmentId(id);
    },
    getStudentByBatchId: async (data) => {


        const assignment_batch_valid = await batchAssignmentRepository.getOneData({ batch_id: data.batch_id, assignment_id: data.assignment_id });
        if (!assignment_batch_valid) {
            throw new customError(`Assignment ID ${data.assignment_id} has not been assigned to the batch ID ${data.batch_id}`, 400);
        }

        return await resultAssignmentRepository.getStudentByBatchId(data);
    },

    declareResults: async (resultSheet) => {
        const currentDate = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm");

        for (const result of resultSheet) {

            const batchAssignment = await resultAssignmentRepository.getOneData({ id: result.id });

            const batchAssignmentData = await batchAssignmentRepository.getOneData({ id: batchAssignment.batch_assignment_id });

            const assignmentData = await assignmentRepository.getOneData({ id: batchAssignmentData.assignment_id });

            if (result.obtained_marks > assignmentData.total_marks) {
                throw new customError(`Obtained marks (${result.obtained_marks}) cannot be greater than total marks (${assignmentData.total_marks})`);
            }

            await resultAssignmentRepository.update(
                {
                    obtained_marks: result.obtained_marks,
                    note: result.note,
                    result_declare_date: currentDate,
                },
                { id: result.id }
            );

        }
        const batch_assignment_id = await resultAssignmentRepository.getOneData({ id: resultSheet[0].id });
        const allStudents = await resultAssignmentRepository.getResultByBatchAssignmentId(batch_assignment_id.batch_assignment_id);
        const isStudentsResultDeclared = allStudents.every(student => student.obtained_marks !== null && student.obtained_marks !== undefined);


        if (isStudentsResultDeclared) {
            await batchAssignmentRepository.update(
                {
                    result_dec: true,
                },
                { id: batch_assignment_id.batch_assignment_id }
            );
        }

        const assignment_id = await batchAssignmentRepository.getOneData({ id: batch_assignment_id.batch_assignment_id });
        const allBatches = await batchAssignmentRepository.getBatchByAssignmentId(assignment_id.assignment_id);


        const isBatchesResultDeclared = allBatches.every(batch => batch.result_dec === true);

        if (isBatchesResultDeclared) {
            await assignmentRepository.update(
                {
                    is_result_dec: true,
                },
                { id: assignment_id.assignment_id }
            );
        }


    },

    getResultByBatchAssignmentId: async (id) => {

        let check = await resultAssignmentRepository.getOneData({ batch_assignment_id: id });
        if (!check) {

            throw new customError("Batch_assignment_id not found", 404);

        }
        return await resultAssignmentRepository.getResultByBatchAssignmentId(id);
    },

    getStudentDetailByBatchOrAssignmentId: async (id) => {

        let check = await resultAssignmentRepository.getOneData({ id: id });
        if (!check) {

            throw new customError("Result not found", 404);

        }
        return await resultAssignmentRepository.getStudentDetailByBatchOrAssignmentId(id);
    },




}



module.exports = assignmentService