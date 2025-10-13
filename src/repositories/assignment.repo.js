const { Assignment, BatchAssignment, Batches, Subject, Course, Employee, Student_Enrollment, ResultAssignment } = require("../models/");
const { CrudRepository } = require("./crude.repo");
const { Op } = require('sequelize');

class assignmentRepositories extends CrudRepository {
    constructor() {
        super(Assignment);
    }

    async getAssignmentsByTitleAndSessionFuture(title, offset, limit, session_id, assign_by) {


        const whereCondition = {
            due_date: {
                [Op.gt]: new Date()
            }
        };

        if (title) {
            whereCondition.title = { [Op.iLike]: `%${title}%` };
        }
  if (session_id) {
            whereCondition.session_id = session_id;
        }
        if (assign_by) {
            whereCondition.assign_by = assign_by;
        }


        return await Assignment.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: BatchAssignment,
                    attributes: ['batch_id'],
                    include: [
                        {
                            model: Batches,
                            attributes: ["BatchesName"],
                        },
                        {
                            model: ResultAssignment,
                          
                        }
                    ]
                }, {
                    model: Subject,
                    attributes: ['subject_name'],

                }, {
                    model: Course,
                    attributes: ['course_name', 'course_type'],

                }, {
                    model: Employee,
                    attributes: ['email', 'department', 'first_name'],
                }
            ],
            offset,
            limit,
            order: [["id", "DESC"]],
            distinct: true
        });
    }


    async getAssignmentsByTitleAndSession(title, offset, limit, session_id, assign_by) {
        const whereCondition = {
        };

        if (title) {
            whereCondition.title = { [Op.iLike]: `%${title}%` };
        }

        if (assign_by) {
            whereCondition.assign_by = assign_by;
        }
        if (session_id) {
            whereCondition.session_id = session_id;
        }

        whereCondition.due_date = { [Op.lt]: new Date() };

        return await Assignment.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: BatchAssignment,
                    attributes: ['batch_id'],
                    include: [
                        {
                            model: Batches,
                            attributes: ["BatchesName"],
                        },
                        {
                            model: ResultAssignment,
                           
                        }
                    ]
                }, {
                    model: Subject,
                    attributes: ['subject_name'],

                }, {
                    model: Course,
                    attributes: ['course_name', 'course_type'],

                }, {
                    model: Employee,
                    attributes: ['email', 'department', 'first_name'],
                }
            ],
            offset,
            limit,
            order: [["id", "DESC"]],
            distinct: true
        });
    }



}

module.exports = { assignmentRepositories }
