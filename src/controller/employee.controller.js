const instructorService = require("../service/employee.service");
const { StatusCodes } = require("http-status-codes");
const { try_catch } = require("../utils/tryCatch.handle");
const customError = require("../utils/error.handle");
const { z } = require("zod");

const instructorController = {
  loginEmployee: try_catch(async (req, res) => {
    const { email, password } = req.body;
    const response = await instructorService.login(email, password);
    if (!response.success) {
    throw new customError(response.message, 400);

    }

    return res.status(StatusCodes.ACCEPTED).json({
      success: true,
      message: "Login successful",
      data: { token: response.token, accessControls: response.accessControls },
    });
  }),
  getInstructorSubjects: try_catch(async (req, res) => {
    const employee_id = req.user.id;
    console.log(employee_id);

    const subjects = await instructorService.getSubjectsByEmployee(employee_id);
    return res.status(StatusCodes.ACCEPTED).json({
      success: true,
      message: "Login successful",
      data: { subjects },
    });
  }),
  getInstructorBatches: try_catch(async (req, res) => {
    const employee_id = req.user.id;
    console.log(employee_id);

    const batches = await instructorService.getBatchesByEmployee(employee_id);
    return res.status(StatusCodes.ACCEPTED).json({
      success: true,
      message: "Login successful",
      data: { batches },
    });
  }),
getProfile: try_catch(async (req, res) => {
  const employee_id = req.user?.id;

  if (!employee_id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized or missing token",
    });
  }

  const profile = await instructorService.getProfileEmployee(employee_id);

  // 👇 Use plain JS object safely
  const data = typeof profile.toJSON === 'function' ? profile.toJSON() : profile;

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Employee profile fetched successfully",
    data: {
      ...data,
      employee_name: data.name,
    },
  });
}),

  //logout employeee
  logout: try_catch(async (req, res) => {
    const employee_id = req.user.id;

    if (!employee_id) {
      throw new customError("Employee ID is required", StatusCodes.BAD_REQUEST);
    }
    await instructorService.logout(employee_id);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Logout successful.",
    });
  }),
  
  getLoggedInStudentBatch: try_catch(async (req, res) => {
    const emp_id = req.user?.id;
    const courseId = req.query.course_id;

    if (!emp_id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid or missing token",
      });
    }

    const result = await instructorService.getStudentBatchAndCourses(
      emp_id,
      courseId
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: courseId
        ? "Batches fetched successfully"
        : "Courses fetched successfully",
      data: result,
    });
  }),

getMySubjects: try_catch(async (req, res) => {
  const employee_id = req.user?.id;
  const { course_id } = req.query;

  if (!employee_id || !course_id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "employee_id and course_id are required",
    });
  }

  const result = await instructorService.getSubjectsByEmployeeId({ employee_id, course_id });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Success",
    data: result,
  });
}),






 employesalery : try_catch(async(req,res)=>{
  const {employesalery} = req.query
const data = await instructorService.perteculeremployesalery(employesalery)
 return res.status(StatusCodes.OK).json({
    success: true,
    message: "Success",
    data: data,
  });
}),

getEmployeeBatchSubject: try_catch(async (req, res) => {

    const employee_id = req.user?.id;
    
   
    const employeeBatchSubject = await instructorService.getEmployeeBatchSubject(
      employee_id
    );
    return res.status(200).send({ status: "001", employeeBatchSubject });
  }),

  assignEmployee: try_catch(async (req, res) => {
  const employee_id = req.user?.id;
  console.log("User employe id : ", employee_id);

  // ✅ employeeId field hata diya
  const assignEmployeeSchema = z.object({
    course_id: z
      .number({
        required_error: "course_id is required",
        invalid_type_error: "course_id must be a number",
      })
      .int()
      .positive(),

    batch_id: z.union(
      [
        z
          .number({
            required_error: "batch_id is required",
            invalid_type_error: "batch_id must be a number",
          })
          .int()
          .positive(),
        z
          .array(
            z
              .number({
                invalid_type_error: "Each batch_id must be a number",
              })
              .int()
              .positive()
          )
          .nonempty({
            message: "batch_id array must not be empty",
          }),
      ],
      {
        invalid_type_error: "batch_id must be a number or an array of numbers",
        required_error: "batch_id is required",
      }
    ),

    subjectId: z.union(
      [
        z
          .number({
            required_error: "subject_id is required",
            invalid_type_error: "subject_id must be a number",
          })
          .int()
          .positive(),
        z
          .array(
            z
              .number({
                invalid_type_error: "Each subject_id must be a number",
              })
              .int()
              .positive()
          )
          .nonempty({
            message: "subject_id array must not be empty",
          }),
      ],
      {
        invalid_type_error: "subject_id must be a number or an array of numbers",
        required_error: "subject_id is required",
      }
    ),

    session_Id: z
      .number({
        required_error: "session_Id is required",
        invalid_type_error: "session_Id must be a number",
      })
      .int()
      .positive(),
  });

  const result = assignEmployeeSchema.safeParse(req.body);

  if (!result.success) {
    throw new customError(
      result.error.errors.map((err) => err.message).join(", "),
      400
    );
  }

  // ✅ yahan employeeId backend me merge kiya
  const data = {
    ...result.data,
    employeeId: employee_id,
  };

  console.log(data);
  await instructorService.assignEmployee(data);

  return res.status(200).send({
    status: "001",
    message: "Employee assigned to batches and subjects successfully",
  });
})


};

module.exports = instructorController;
