const express = require("express");
const { try_catch } = require("../../utils/tryCatch.handle");
const redisClient = require("../../config/redis.config");
const {
  Student,
  Employee,
  Course,
  SubjectCourse,
  emp_subj,
  Subject,
  Student_Enrollment,
  sequelize,
} = require("../../models");
const { Op } = require("sequelize");

const chatRouter = express.Router();

// GET /api/v1/chat/instructors/:studentId
chatRouter.get(
  "/instructors/:studentId",
  try_catch(async (req, res) => {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    // Find the student enrollment to get course_id using the primary id
    const enrollment = await Student_Enrollment.findOne({
      where: { id: studentId },
      attributes: ["course_id"],
    });

    if (!enrollment) {
      return res
        .status(400)
        .json({ error: "Invalid enrollment ID or no enrollment found" });
    }

    // Find instructors for the student's course via emp_subj
    const instructors = await Employee.findAll({
      attributes: ["email", "first_name"],
      include: [
        {
          model: emp_subj,
          attributes: [],
          required: true,
          where: { course_id: enrollment.course_id },
        },
      ],
    });

    console.log(
      `Fetching instructors for enrollment ${studentId}:`,
      instructors
    );
    res.json(
      instructors.map((instructor) => ({
        id: instructor.email,
        name: instructor.first_name,
      }))
    );
  })
);

// GET /api/v1/chat/students/:instructorId
chatRouter.get(
  "/students/:instructorId",
  try_catch(async (req, res) => {
    const { instructorId } = req.params;
    if (!instructorId) {
      console.error(`Missing instructorId: ${instructorId}`);
      return res.status(400).json({ error: "Instructor ID is required" });
    }

    // Validate instructorId
    const instructor = await Employee.findOne({
      where: { email: instructorId },
      include: [
        {
          model: emp_subj,
          attributes: ["course_id"],
          required: true, // Ensure instructor is assigned to at least one course
        },
      ],
      attributes: ["id", "email"],
    });

    if (!instructor) {
      console.error(`No instructor found for instructorId: ${instructorId}`);
      return res.status(400).json({ error: "Invalid instructor ID" });
    }

    // Get courses taught by the instructor
    const instructorCourses = instructor.emp_subjs.map((es) => es.course_id);

    // Get studentIds from Redis
    const conversationKey = `conversation:${instructorId}`;
    const studentIds = await redisClient.hkeys(conversationKey);

    // Fetch student details from Student_Enrollment
    const enrollments = await Student_Enrollment.findAll({
      where: {
        id: studentIds,
        course_id: { [Op.in]: instructorCourses }, // Ensure students are in instructor's courses
        batch_id: { [Op.ne]: null }, // Ensure students have a valid batch
      },
      include: [
        {
          model: Student,
          attributes: ["id", "enrollment_id", "name"],
        },
      ],
      attributes: ["id", "course_id", "batch_id"],
    });

    const formattedStudents = enrollments.map((enrollment) => ({
      id: String(enrollment.id), // Match Student_Enrollment.id
      name: enrollment.Student ? enrollment.Student.name : "Unknown",
    }));

    console.log(`Fetching students for ${instructorId}:`, formattedStudents);
    res.json(formattedStudents);
  })
);

// POST /api/v1/chat/conversation
chatRouter.post(
  "/conversation",
  try_catch(async (req, res) => {
    const { studentId, instructorId } = req.body;

    // Validate input
    if (!studentId || !instructorId) {
      console.error(
        `Missing required fields: studentId=${studentId}, instructorId=${instructorId}`
      );
      return res
        .status(400)
        .json({ error: "Student ID and Instructor ID are required" });
    }

    // Validate studentId against Student_Enrollment.id
    const enrollment = await Student_Enrollment.findOne({
      where: { id: studentId },
      include: [
        { model: Student, attributes: ["id", "enrollment_id", "name"] },
      ],
      attributes: ["id", "student_id", "course_id", "batch_id"],
    });

    if (!enrollment) {
      console.error(`No enrollment found for studentId: ${studentId}`);
      return res.status(400).json({ error: "Invalid student ID" });
    }

    if (!enrollment.course_id) {
      console.error(`No course_id for studentId: ${studentId}`);
      return res
        .status(400)
        .json({ error: "No course assigned to this student" });
    }

    if (!enrollment.batch_id) {
      console.error(`No batch_id for studentId: ${studentId}`);
      return res
        .status(400)
        .json({ error: "No batch assigned to this student" });
    }

    // Validate instructorId against Employee.email and ensure they teach the student's course
    const instructor = await Employee.findOne({
      where: { email: instructorId },
      include: [
        {
          model: emp_subj,
          attributes: ["course_id"],
          where: {
            course_id: enrollment.course_id,
          },
          required: true, // Ensure instructor is assigned to the course
        },
      ],
      attributes: ["id", "email", "first_name"],
    });

    if (!instructor) {
      console.error(
        `No instructor found for instructorId: ${instructorId} teaching course_id: ${enrollment.course_id}`
      );
      return res
        .status(400)
        .json({
          error: "Invalid instructor ID or instructor not assigned to student's course",
        });
    }

    const formattedStudentId = studentId; // Use Student_Enrollment.id
    console.log(
      `Registering conversation: student ${formattedStudentId} (course_id: ${enrollment.course_id}, batch_id: ${enrollment.batch_id}), instructor ${instructorId}`
    );

    // Store conversation in Redis
    const conversationKey = `conversation:${instructorId}`;
    const exists = await redisClient.hexists(
      conversationKey,
      formattedStudentId
    );
    if (!exists) {
      await redisClient.hset(
        conversationKey,
        formattedStudentId,
        Date.now().toString()
      );
      console.log(
        `Stored in Redis: ${conversationKey} -> ${formattedStudentId}`
      );
    } else {
      console.log(
        `Conversation already exists in Redis: ${conversationKey} -> ${formattedStudentId}`
      );
    }

    res.status(200).json({ message: "Conversation registered" });
  })
);

// GET /api/v1/chat/student/:studentId
chatRouter.get(
  "/student/:studentId",
  try_catch(async (req, res) => {
    const { studentId } = req.params;
    if (!studentId) {
      console.error(`Missing studentId: ${studentId}`);
      return res.status(400).json({ error: "Student ID is required" });
    }

    // Fetch student details from Student_Enrollment
    const enrollment = await Student_Enrollment.findOne({
      where: { id: studentId },
      include: [
        {
          model: Student,
          attributes: ["id", "enrollment_id", "name"],
        },
      ],
      attributes: ["id", "course_id", "batch_id"],
    });

    if (!enrollment || !enrollment.Student) {
      console.error(`No enrollment or student found for studentId: ${studentId}`);
      return res.status(400).json({ error: "Invalid student ID" });
    }

    if (!enrollment.batch_id) {
      console.error(`No batch_id for studentId: ${studentId}`);
      return res
        .status(400)
        .json({ error: "No batch assigned to this student" });
    }

    res.json({
      id: String(enrollment.id), // Match Student_Enrollment.id
      name: enrollment.Student.name,
    });
  })
);

module.exports = { chatRouter };
