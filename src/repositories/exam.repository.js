const { CrudRepository } = require("./crude.repo");
const { Exam } = require("../models/index");
const { exam_batch } = require("../models/index");
const { Batches } = require("../models/index");
const { Subject } = require("../models/index");
const { Course } = require("../models/index");
const { category } = require("../models/index");
const { Op } = require("sequelize");
const { Student_Enrollment } = require("../models/index");
const { Employee } = require("../models/index");
const { Student } = require("../models/index");

class ExamRepository extends CrudRepository {
  constructor() {
    super(Exam);
  }
  async getallbatchdetails(
  session_id,
  exam_name,
  employee_id,
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit;

  if (!session_id) {
    throw new Error("session_id is required");
  }

  
  const nameFilter = exam_name
    ? { exam_name: { [Op.iLike]: `%${exam_name}%` } }
    : {};

  const now = new Date();
  const currentDate = now.toISOString().split("T")[0]; 
  const currentTime = now.toTimeString().split(" ")[0]; 

  
  const dateFilter = {
    [Op.or]: [
      { schedule_date: { [Op.gt]: currentDate } },
      {
        schedule_date: currentDate,
        end_time: { [Op.gte]: currentTime },
      },
    ],
  };

  
  const employeeFilter = employee_id ? { employee_id } : {};

  
  const finalFilter = {
    ...nameFilter,
    ...employeeFilter,
    ...dateFilter,
    session_id,
  };

  const { count, rows } = await Exam.findAndCountAll({
    where: finalFilter,
    include: [
      {
        model: exam_batch,
        attributes: ["batch_id"],
        include: [
          {
            model: Batches,
            attributes: ["BatchesName"],
            required: true,
          },
        ],
      },
      {
        model: Subject,
        attributes: ["subject_name"],
      },
      {
        model: Course,
        attributes: ["course_name"],
      },
    ],
    offset,
    limit,
    distinct: true,
  });

  return {
    data: rows,
    totalRecords: count,
    totalPages: Math.ceil(count / limit),
    currentPage: count === 0 ? 1 : page,
  };
}


  async getExamHistoryBySession(
  session_id,
  exam_name,
  employee_id,
  category_name,
  status,
  page = 1,
  limit = 10
) {
  const offset = (page - 1) * limit;

  if (!session_id) {
    throw new Error("session_id is required");
  }

  
  const nameFilter = exam_name
    ? { exam_name: { [Op.iLike]: `%${exam_name}%` } }
    : {};

  const categoryFilter = category_name
    ? { name: { [Op.iLike]: `%${category_name}%` } }
    : {};

  let statusFilter = {};
  if (status) {
    const lower = status.toLowerCase();
    if (lower === "declared") {
      statusFilter = { is_result_dec: true };
    } else if (lower === "pending") {
      statusFilter = { is_result_dec: false };
    }
  }

  const employeeFilter = employee_id ? { employee_id } : {};

  
  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];
  const currentTime = now.toTimeString().split(" ")[0]; 

  const dateFilter = {
    [Op.or]: [
      { schedule_date: { [Op.lt]: currentDate } }, 
      {
        [Op.and]: [
          { schedule_date: currentDate },          
          { end_time: { [Op.lt]: currentTime } },  
        ],
      },
    ],
  };

  const { count, rows } = await Exam.findAndCountAll({
    where: {
      ...nameFilter,
      ...statusFilter,
      ...employeeFilter,
      ...dateFilter,
      session_id,
    },
    include: [
      {
        model: exam_batch,
        as: "exam_batches",
        include: [
          {
            model: Batches,
            attributes: ["id", "BatchesName"],
          },
        ],
      },
      {
        model: Subject,
        attributes: ["id", "subject_name"],
      },
      {
        model: Course,
        attributes: ["id", "course_name"],
      },
      {
        model: category,
        attributes: ["id", "name"],
        where: categoryFilter,
      },
    ],
    order: [["schedule_date", "DESC"]],
    offset,
    limit,
    distinct: true,
  });

  return {
    data: rows,
    totalRecords: count,
    totalPages: Math.ceil(count / limit),
    currentPage: count === 0 ? 1 : page,
  };
}



  async getExamsBySessionAndBatch({
    sessionId,
    batchId,
    userId,
    limit = 10,
    offset = 0,
  }) {
    return await Exam.findAndCountAll({
      where: {
        employee_id: userId,
        session_id: sessionId,
      },
      include: [
        {
          model: Subject,
          attributes: ["id", "subject_name"],
        },
        {
          model: Course,
          attributes: ["id", "course_name"],
        },
        {
          model: exam_batch,
          required: true,
          where: { batch_id: batchId },
          include: [
            {
              model: Batches,
              attributes: ["id", "BatchesName"],
            },
          ],
        },
      ],
      order: [["schedule_date", "ASC"]],
      limit,
      offset,
      distinct: true,
    });
  }
}

module.exports = { ExamRepository };
