const {
  studentEnrollment_Repositories,
} = require("../repositories/studentEnrollment.repo");
const studentEnrollment_Repositorie = new studentEnrollment_Repositories();
const { CoursesRepositories } = require("../repositories/courses.repo");
const CoursesRepositorie = new CoursesRepositories();
const customError = require("../utils/error.handle");
const { Student_Enrollment } = require("../models");
const { Op } = require("sequelize");
const { SessionRepositories } = require("../repositories/Session.repo");
// const { SessionRepositories } = require("../repositories/session.repo");
const SessionRepositorie = new SessionRepositories();
// SessionRepositories

// CoursesRepositories
const student_Enrollment_Service = {
  studentPromote: async (getParse) => {
    const {
      course_id,
      batch_id,
      session_id,
      new_course_id,
      new_batch_id,
      new_session_id,
      student_exclude,
    } = getParse;

    const whereClause = {
      course_id,
      batch_id,
      session_id,
    };

    // purane enrollments nikaalo
    const oldEnrollments = await Student_Enrollment.findAll({
      where: whereClause,
      raw: true,
    });

    if (!oldEnrollments.length) {
      throw new customError("No student enrollments found for promotion");
    }

    for (const singleStudent of oldEnrollments) {
      // agar exclude mein h, to skip
      if (student_exclude.includes(singleStudent.student_id)) {
        continue;
      }

      // check karo already promoted hai ya nahi
      if (singleStudent.course_status === "promoted") {
        throw new customError(
          `Student ${singleStudent.student_id} is already promoted`
        );
      }

      // purane enrollment ko promoted mark karo
      await studentEnrollment_Repositorie.update(
        { course_status: "promoted" },
        { id: singleStudent.id }
      );

      // naye enrollment create karo
      await Student_Enrollment.create({
        student_id: singleStudent.student_id,
        course_id: new_course_id,
        batch_id: new_batch_id,
        session_id: new_session_id,
      });
    }
  },

  studentCourse: async (getId) => {
    console.log(getId);
    const getCourse = await CoursesRepositorie.getCourse(getId);
    return getCourse;
  },
  getsessionYear: async () => {
    const currentYear = new Date().getFullYear();
    const getResponse = await SessionRepositorie.findOne({ session_year: currentYear });
    return getResponse;
  }

};

module.exports = { student_Enrollment_Service };
