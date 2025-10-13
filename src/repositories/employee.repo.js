const { CrudRepository } = require("./crude.repo");
const {
  Employee,
  emp_batch,
  Batches,
  Course,
  emp_subj,
  Subject,
} = require("../models/index");

class EmployeeRepository extends CrudRepository {
  constructor() {
    super(Employee);
  }

  async getEmployeeBatchSubject(employee_id) {
    return await Employee.findAll({
      where: { id: employee_id },
      attributes: ["id", "first_name"],
      include: [
        {
          model: emp_batch,
          // agar emp_batch me koi alias hai to as: 'emp_batches' bhi likho
          include: [
            {
              model: Batches,
              as: "batch", 
              attributes: [
                "course_id",
                "BatchesName",
                "status",
                "EndTime",
                "StartTime",
              ],
              include: [
                {
                  model: Course,
                  attributes: [
                    "status",
                    "course_price",
                    "course_duration",
                    "course_name",
                  ],
                },
              ],
            },
          ],
        },
        {
          model: emp_subj,
          attributes: ["subject_id", "course_id"],
           as: "subjects",
           separate: true,
          include: [
            {
              model: Subject,
              attributes: ["status", "subject_name"],
            },
            {
              model: Course,
              attributes: [
                "status",
                "course_price",
                "course_duration",
                "course_name",
              ],
            },
          ],
        },
      ],
    });
  }

 async findEmployeeWithJoiningDate(employee_id) {
  return Employee.findOne({
    where: { id: employee_id },
    attributes: ["id", "first_name","joining_date"],
    include: [
      {
        model: emp_batch,
         include: [
          {
            model: Batches,
            as: 'batch',  // ✅ alias must match model association
            attributes: ["course_id", "BatchesName", "status", "EndTime", "StartTime"],
            include: [
              {
                model: Course,
                attributes: ["status", "course_price", "course_duration", "course_name"]
              }
            ]
          }
        ]
      },
      {
        model: emp_subj,
        as: "subjects",
        attributes: ["subject_id", "course_id"],
        include: [
          {
            model: Subject,
            attributes: ["status", "subject_name"],
          },
          {
            model: Course,
            attributes: ["status", "course_price", "course_duration", "course_name"]
          }
        ]
      }
    ]
  });
}
}

module.exports = EmployeeRepository;
