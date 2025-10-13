const { ResultAssignment, BatchAssignment, Student, Student_Enrollment, Course, Batches, Subject, Assignment } = require("../models/");
const { CrudRepository } = require("./crude.repo");


class resultAssignmentRepositories extends CrudRepository {
    constructor() {
        super(ResultAssignment);
    }

    async getStudentByBatchId(data) {

        return await ResultAssignment.findAll({
            include: [
                {
                    model: BatchAssignment,
                    where: { batch_id: data.batch_id, assignment_id: data.assignment_id },
                    required: true
                }
            ]
        });
    }


    async getResultByBatchAssignmentId(batch_assignment_id) {
        return await ResultAssignment.findAll({
            where: { batch_assignment_id: batch_assignment_id },
            include: [
                {
                    model: Student_Enrollment,
                    attributes: ["student_id", "course_id"],
                    include: [
                        {
                            model: Student,
                            attributes: ["name", "enrollment_id", "profile_image"]

                        }
                    ]

                }
            ]
        })
    }



    async getStudentDetailByBatchOrAssignmentId(result_assignment_id) {
        return await ResultAssignment.findByPk(result_assignment_id, {
            include: [
                {
                    model: Student_Enrollment,
                    attributes: ["student_id", "course_id", "session_id"],
                    include: [
                        {
                            model: Student,

                        },
                        {
                            model: Batches,
                            attributes: ["BatchesName"]
                        }, {
                            model: Course,
                            attributes: ["course_name"]

                        },
                    ]

                },
                {
                    model: BatchAssignment,
                    attributes: ["assignment_id"],
                    include: [
                        {
                            model: Assignment,
                            attributes: ["subject_id", "attachments", "due_date", "min_percentage", "total_marks", "title"],
                            include: [
                                {
                                    model: Subject,
                                    attributes: ["subject_name"]

                                }
                            ]
                        }
                    ]
                }
            ]
        });
    }


}

module.exports = { resultAssignmentRepositories }
