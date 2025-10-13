const { Student_Enrollment,Student,Emi } = require("../models/index");
const { CrudRepository } = require("./crude.repo");
const { Op } = require("sequelize");

class mystuaccessRepositories extends CrudRepository {
    constructor() {
        super(Student_Enrollment);
    }

    
    async findActiveEnrollmentsByBatchesAndSession({ batches, session_id }, transaction) {
  return await this.model.findAll({
    where: {
      batch_id: { [Op.in]: batches },
      session_id,
      status: true,   // ✅ only active students
    },
    attributes: ["id", "batch_id"],
    transaction,
  });
}


    // ✅ Get one enrollment record by ID
    async getEnrollmentById(id) {
        return await Student_Enrollment.findByPk(id, {
            attributes: [
                'id',
                'student_id',
                'course_id',
                'batch_id',
                'session_id',
                'fees',
                'discount_amount',
                'number_of_emi',
                'status',
                'createdAt',
                'updatedAt'
            ],
            raw:true
        });
    }
    async OneStudentPayment(id){
        const data = await Student_Enrollment.findAll({
            where:{id:id},
          include:[
            {
                model:Student,
                attributes:["enrollment_id"]
            },
            {
                model:Emi
            }
          ]
        })
        return data
    }

    // ✅ Update enrollment status (optional override, already inherited from CrudRepository if implemented)
   async update(data, whereClause) {
  return await Student_Enrollment.update(data, { where: whereClause });
}

}

module.exports = {
    mystuaccessRepositories,
};
