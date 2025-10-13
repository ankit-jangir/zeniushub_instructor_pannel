const { CrudRepository } = require("./crude.repo");
const {Student_Enrollment} = require('../models/')

class studentEnrollment_Repositories extends CrudRepository{
    constructor(){
        super(Student_Enrollment)
    }
}

module.exports = {studentEnrollment_Repositories}