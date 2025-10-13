const { StatusCodes } = require("http-status-codes");
const {
  Batches,
  Course,
  SubjectCourse,
  Subject,
  Student,
  Student_Enrollment,
  emp_batch,
  Assignment,
} = require("../models/");
const customError = require("../utils/error.handle");
const { CrudRepository } = require("./crude.repo");
const { Op } = require("sequelize");

class batchesRepositories extends CrudRepository {
  constructor() {
    super(Batches);
  }

// repo file
async findBatchDetails(id, requestedSessionId) {
  console.log(id, requestedSessionId, "*************************** my batch");

  const batch = await Batches.findByPk(id, { 
    attributes: { exclude: ["createdAt", "updatedAt"] },
    include: [
      {
        model: Course,
        required: false,
        attributes: ["id", "course_name"],
        include: [
          {
            model: SubjectCourse,
            attributes: { exclude: ["createdAt", "updatedAt"] },
            include: [
              {
                model: Subject,
                attributes: ["id", "subject_name"],
              },
            ],
          },
          {
            model: Student_Enrollment,
            required: false,
            attributes: ["id", "student_id", "course_id", "batch_id"],
            where: {
              status: true,
              batch_id: id,

              // ✅ add session filter only if value present
              ...(requestedSessionId && { session_id: requestedSessionId }),
            },
            include: [
              {
                model: Student,
                attributes: ["name", "enrollment_id", "contact_no"],
                required: false,
              },
            ],
          },
        ],
      },
    ],
    distinct: true,
  });

  if (!batch) {
    throw new customError("Batch Does not Exist", StatusCodes.BAD_REQUEST);
  }

  // count students separately (same optional session filter)
  const courseId = batch.Course?.id;
  const totalStudentCount = courseId
    ? await Student_Enrollment.count({
        where: {
          course_id: courseId,
          status: true,
          batch_id: id,
          // course_status: { [Op.ne]: "promoted" },
          ...(requestedSessionId && { session_id: requestedSessionId }),
        },
      })
    : 0;

  return {
    ...batch.toJSON(),
    total_student_count: totalStudentCount,
  };
}




  async searchapidta(batchName, course_id, page, limit) {
    const offset = (page - 1) * limit;

    const whereClause = {
      BatchesName: { [Op.like]: `%${batchName}%` },
    };

    if (course_id) {
      whereClause.course_id = course_id;
    }

    const { count, rows } = await Batches.findAndCountAll({
      where: whereClause,
      offset,
      limit: parseInt(limit),
    });

    const totalPages = Math.ceil(count / limit);

    return {
      totalRecords: count,
      totalPages,
      currentPage: parseInt(page),
      data: rows,
    };
  }

  async getbatchData(sessionId) {
    const batches = await Batches.findAll({
      where: { Session_id: sessionId },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    return batches;
  }

  // async getAllBatch(getEmployeeId, sessionId,search) {
  //   try{
  //   const batch = await emp_batch.findAll({
  //     where: { employee_id: getEmployeeId,session_Id: sessionId, },
  //     // include: [
  //     //   {
  //     //     model: Batches,
  //     //     where: {
  //     //       status: "active",
  //     //       // Session_id: sessionId,
  //     //       ...(search && {
  //     //         BatchesName:{
  //     //           [Op.iLike]: `%${search}%`
  //     //         }
  //     //       })
  //     //     },
  //     //     as: "batch",
  //     //     attributes: [
  //     //       "id",
  //     //       "BatchesName",
  //     //       // "StartDate",
  //     //       // "EndDate",
  //     //       "StartTime",
  //     //       "EndTime",
  //     //       // "Session_id",
  //     //     ],
  //     //   },
  //       include: [
  //         {
  //           model: Batches,
  //           as: "batch",
  //           where: {
  //             status: "active",
  //             ...(search && {
  //               BatchesName: {
  //                 [Op.iLike]: `%${search}%`,
  //               },
  //             }),
  //           },
  //           attributes: [
  //             "id",
  //             "BatchesName",
  //             "StartTime",
  //             "EndTime",
  //           ],
  async getAllBatch(getEmployeeId, sessionId, search) {
    console.log(getEmployeeId, "******************** getEmployeeid");
    const batch = await emp_batch.findAll({
      where: { employee_id: getEmployeeId, session_Id: sessionId },
      include: [
        {
          model: Batches,
          as: "batch",
          where: {
            status: "active",
            // Session_id: sessionId,
            ...(search && {
              BatchesName: {
                [Op.iLike]: `%${search}%`,
              },
            }),
          },
        },
      ],
    });

    return batch;
  }

  async getAssignmentByBatchId(batchId, sessionId, page, limit, userId) {
    try {
      // Validate input
      if (!batchId || !sessionId || !userId || page < 1 || limit < 1) {
        return {
          success: false,
          message: "Invalid input parameters",
          error: [
            {
              message:
                "batchId, sessionId, userId, page, and limit are required.",
            },
          ],
        };
      }

      const offset = (page - 1) * limit;

      // Fetch batch with course and subjects
      const batch = await Batches.findByPk(batchId, {
        include: [
          {
            model: Course,
            include: [
              {
                model: SubjectCourse,
                include: [
                  {
                    model: Subject,
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!batch) {
        return {
          success: false,
          message: "Batch not found",
          error: [{ message: `No batch found with ID ${batchId}` }],
        };
      }

      // Get subject IDs from batch
      const subjectIds =
        batch?.Course?.SubjectCourses?.map((sc) => sc.Subject?.id).filter(
          Boolean
        ) || [];

      if (!subjectIds.length) {
        return {
          success: true,
          message: "No subjects found in the batch",
          data: {
            assignments: [],
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: 0,
              totalPages: 0,
            },
          },
        };
      }

      // Build subject_id → subject_name map
      const subjectMap = {};
      batch.Course.SubjectCourses.forEach((sc) => {
        if (sc?.Subject?.id && sc?.Subject?.subject_name) {
          subjectMap[sc.Subject.id] = sc.Subject.subject_name;
        }
      });

      const courseName = batch.Course?.course_name || null;

      // Fetch assignments
      const assignments = await Assignment.findAll({
        where: {
          subject_id: subjectIds,
          assign_by: userId,
          session_id: sessionId,
        },
        limit,
        offset,
      });

      // Add subject_name and course_name to each assignment
      const enrichedAssignments = assignments.map((assignment) => {
        const plain = assignment.toJSON();
        plain.subject_name = subjectMap[plain.subject_id] || null;
        plain.course_name = courseName; // ✅ Add course_name to each assignment
        return plain;
      });

      // Get total count
      const totalAssignments = await Assignment.count({
        where: {
          subject_id: subjectIds,
          assign_by: userId,
          session_id: sessionId,
        },
      });

      return {
        success: true,
        message: enrichedAssignments.length
          ? "Assignments retrieved successfully"
          : "No assignments found",
        data: {
          assignments: enrichedAssignments,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: totalAssignments,
            totalPages: Math.ceil(totalAssignments / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error in getAssignmentByBatchId:", error);
      return {
        success: false,
        message: "Failed to retrieve assignments",
        error: [
          {
            message: error.message || "Internal server error",
            type: error.name || "unknown",
          },
        ],
      };
    }
  }
}

module.exports = { batchesRepositories };
