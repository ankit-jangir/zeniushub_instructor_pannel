const { StatusCodes } = require("http-status-codes");
const { student_Enrollment_Service } = require("../service/stu_enrollment.service");
const { try_catch } = require("../utils/tryCatch.handle")
const StudentEnrollmentSchema = require("../validators/studentEnrollment.validation")

const student_Enrollment_Controller = {
    studentPromote: try_catch(async(req,res)=>{
        const getParse = StudentEnrollmentSchema.safeParse(req.body);

        if(!getParse.success){
            return res.status(StatusCodes.BAD_REQUEST).json({
                success:false,
                message:"Validation failed",
                errors:getParse.error.format(),
            })
        }
        
        const promoteStudentResponse = await student_Enrollment_Service.studentPromote(getParse.data);
        return res.status(StatusCodes.OK).json({
            success:true,
            message:"successfully student promote"
        })
    }),
    getStudentPromotedCourse:try_catch(async(req,res)=>{
        const getId = req.params.id;
        if(!getId){
            throw new customError("Course Id is Required.", 500);
        }

        const getStudentPromotedCourseResponse = await student_Enrollment_Service.studentCourse(getId);
        return res.status(StatusCodes.OK).json({
            success:true,
            message:"successfully Get Course",
            data:getStudentPromotedCourseResponse
        })
    }),
    getSessionForPromotedStudent:try_catch(async(req,res)=>{
        const getSessionForPromotedStudentResponse = await student_Enrollment_Service.getsessionYear();
        return res.status(StatusCodes.OK).json({
            success:true,
            message:"successfully get session",
            data:getSessionForPromotedStudentResponse
        })
    })
}

module.exports = student_Enrollment_Controller