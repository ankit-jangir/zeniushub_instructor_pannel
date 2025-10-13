const { BatchAssignment, Assignment, Batches, Course, Subject } = require("../models/");
const { CrudRepository } = require("./crude.repo");

class batchAssignmentRepositories extends CrudRepository {
    constructor() {
        super(BatchAssignment);
    }


    async getBatchByAssignmentId(assignment_id) {
        return await BatchAssignment.findAll({
            where: { assignment_id: assignment_id },
            include: [
                {
                    model: Batches,
                    attributes: ["BatchesName"]

                },
                {
                    model: Assignment,
                    include: [
                        {
                            model: Subject,
                            attributes: ['subject_name'],

                        }, {
                            model: Course,
                            attributes: ['course_name', 'course_type'],

                        },
                    ]

                }
            ]
            ,
            order: [["id", "DESC"]],
        })
    }

    async getBatches(assignment_id) {
        return await BatchAssignment.findAll({
        where: { assignment_id: assignment_id },
    })
    }






}

module.exports = { batchAssignmentRepositories }
