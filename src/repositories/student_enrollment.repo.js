const { CrudRepository } = require("./crude.repo");
const { Student_Enrollment } = require("../models/index");



class Student_EnrollmentRepositories extends CrudRepository {
    constructor() {
        super(Student_Enrollment);
    }

    async getStudentByBatchId(batch_id) {
        return await Student_Enrollment.findAll({
            where: { batch_id: batch_id },

        })
    }


}

module.exports = { Student_EnrollmentRepositories }