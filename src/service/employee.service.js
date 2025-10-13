const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const bcryptjs = require("bcryptjs");
const {
  Employee,
  Department,
  AccessControl,
  Subject,
  Batches,
} = require("../models");
const { JWT_SECRET } = require("../config/server.config");
const { CoursesRepositories } = require("../repositories/courses.repo");
const { empSubjRepositories } = require("../repositories/emp_subj.repo");
const { SubjectRepositories } = require("../repositories/Subject.repo");
const { batchesRepositories } = require("../repositories/Batches.repo");
const { empBatchRepositories } = require("../repositories/emp_batch.repo");
const EmployeeRepository = require("../repositories/employee.repo");

const redisClient = require("../config/redis.config");
const customError = require("../utils/error.handle");
const {
  SubjectCoursesRepositories,
} = require("../repositories/subeject_courses.repo");
const { employeeAttendenceRepositories } = require("../repositories/employeeAttendence.repo");
const { saleryRepositories } = require("../repositories/salery.repo");
const { SessionRepositories } = require("../repositories/Session.repo");
const subjectCourseRepository = new SubjectCoursesRepositories();
const coursesRepository = new CoursesRepositories();
const empSubjRepository = new empSubjRepositories();
const subjectRepository = new SubjectRepositories();
const batchesRepositorie = new batchesRepositories();
const emp_batchRepository = new empBatchRepositories();
const emp_profileRepository = new EmployeeRepository();
const emp_attendenceRepository = new employeeAttendenceRepositories();
const saleryRepositorie =  new saleryRepositories()
const sessionRepository = new SessionRepositories() 

const instructorService = {
  login: async (email, password) => {
    // Step 1: Find employee by email
    const employee = await Employee.findOne({ where: { email } });
    if (!employee) {
      throw new customError("invalid credential", 400);
    }

    // ✅ Step 1.5: Check employee status
    // ✅ Step 1.5: Check employee status
    if ((employee.status || "").trim() !== "Active") {
      return {
        success: false,
        message: "Your account is inactive. Please contact the administrator.",
      };
    }

    // Step 2: Compare password
    const isPasswordValid = await bcryptjs.compare(password, employee.password);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password" };
    }

    // Step 3: Extract department IDs
    const departmentIds = employee.department;
    console.log("department id ::: ", departmentIds);

    // Step 4: Get accessControl IDs from departments
    const departments = await Department.findAll({
      where: { id: departmentIds },
      attributes: ["access_control"],
    });
    console.log("department", departments);

    // Step 5: Flatten access control IDs
    const accessControlIds = departments
      .map((dep) => dep.access_control || [])
      .flat();
    console.log("ids of access control ::: ", accessControlIds);

    // Step 6: Fetch AccessControl names
    const accessControlRecords = await AccessControl.findAll({
      where: { id: accessControlIds },
      attributes: ["name"],
    });
    console.log("accessControlRecords :::", accessControlRecords);

    const accessControlNames = accessControlRecords.map((item) => item.name);
    // console.log("accessControlNames ::: ", JWT_SECRET);

    // Step 7: Generate JWT token
    const token = jwt.sign(
      {
        id: employee.id,
        department: departmentIds,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log(token);

    // ✅ Store token in Redis (no expiry)
    const redisKey = `${employee.id}`;
    await redisClient.set(redisKey, token);
    console.log(`Token stored in Redis for user: ${employee.id} => ${token}`);

    // Step 8: Return
    return {
      success: true,
      token,
      employee,
      accessControls: accessControlNames,
    };
  },

  getSubjectsByEmployee: async (employee_id) => {
    const empSubjRecords = await empSubjRepository.findAll({ employee_id });

    const subjectIds = empSubjRecords.map((r) => r.subject_id);

    if (!subjectIds.length) return [];

    const subjects = await Subject.findAll({
      where: {
        id: {
          [Op.in]: subjectIds,
        },
      },
      attributes: ["id", "subject_name"],
    });

    return subjects;
  },

  getBatchesByEmployee: async (employee_id) => {
    // Get all emp_batch records for this employee
    const empBatchRecords = await emp_batchRepository.findAll({ employee_id });

    const batchIds = empBatchRecords.map((r) => r.batch_id);

    if (!batchIds.length) return [];

    // Fetch batch details using those IDs
    const allBatches = await batchesRepositorie.getData();

    const filteredBatches = allBatches.filter((b) => batchIds.includes(b.id));
    console.log(filteredBatches);

    return filteredBatches;
  },

  // get profile
  getProfileEmployee: async (employee_id) => {
    const employeeProfile = await Employee.findOne({
      where: { id: employee_id },
      attributes: { exclude: ["password"] }
    });

    if (!employeeProfile) {
      throw new Error("Employee not found");
    }

    const jsonProfile = employeeProfile.toJSON();
    const departmentIds = Array.isArray(jsonProfile.department)
      ? jsonProfile.department
      : [];

    let departments = [];

    if (departmentIds.length > 0) {
      departments = await Department.findAll({
        where: { id: { [Op.in]: departmentIds } },
        attributes: ["id", "name"],
      });
    }

    return {
      ...jsonProfile,
      department_details: departments, // full department details
    };
  },

  //logout employeee
  logout: async (employee_id) => {
    const redisKey = `${employee_id}`;
    await redisClient.del(redisKey);
    return;
  },

  getStudentBatchAndCourses: async (employeeId, courseId = null) => {
    const empBatch = await emp_batchRepository.model.findAll({
      where: { employee_id: employeeId },
      include: [
        {
          model: Batches,
          as: "batch",
          attributes: ["id", "BatchesName","course_id"],
        },
      ],
    });

    // if (!empBatch || empBatch.length === 0) {
    //   throw new Error("No batches found for the given employee");
    // }

    const batches = empBatch.map((eb) => eb.batch).filter(Boolean);

    if (!courseId) {
      // 🔁 Return only distinct courses
      const courseIds = [...new Set(batches.map((b) => b.course_id))];

      const courses = await coursesRepository.model.findAll({
        where: { id: { [Op.in]: courseIds } },
        attributes: ["id", "course_name"],
      });

      return { courses };
    }

    // 🎯 course_id is present → return only batches matching course
    const filteredBatches = batches.filter(
      (batch) => batch.course_id === Number(courseId)
    );

    return { batches: filteredBatches };
  },

  
  getSubjectsByEmployeeId: async ({ employee_id, course_id }) => {
    // 1. Get subject IDs mapped to the given course
    const subjectCourseMappings = await subjectCourseRepository.model.findAll({
      where: { course_id },
      attributes: ["subject_id"],
    });

    const subjectIdsForCourse = subjectCourseMappings.map(
      (item) => item.subject_id
    );
    console.log("Subjects for Course:", subjectIdsForCourse);

    if (!subjectIdsForCourse.length) return [];

    // 2. Get subject IDs assigned to this employee
    const empSubjectMappings = await empSubjRepository.model.findAll({
      where: { employee_id },
      attributes: ["subject_id"],
    });
    console.log("1111111111111111111111", empSubjectMappings);

    const subjectIdsForEmployee = empSubjectMappings.map(
      (item) => item.subject_id
    );
    console.log("Subjects for Employee:", subjectIdsForEmployee);

    if (!subjectIdsForEmployee.length) return [];

    // 3. Intersection
    const finalSubjectIds = subjectIdsForCourse.filter((id) =>
      subjectIdsForEmployee.includes(id)
    );
    console.log("Matched Subject IDs:", finalSubjectIds);

    if (!finalSubjectIds.length) return [];

    // 4. Fetch subject data
    const subjects = await subjectRepository.model.findAll({
      where: {
        id: { [Op.in]: finalSubjectIds },
      },
      attributes: ["id", "subject_name"],
    });

    return subjects;
  },


perteculeremployesalery: async (employeId) => {
   const dateOnly = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  const ymdLocal = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
 
  const data = await emp_profileRepository.findOne({ id: employeId });
  if (!data) throw new Error("Employee not found");

  const baseSalary = Number(data.salary || 0);  
  const joiningDate = dateOnly(new Date(data.joining_date));

   const employeattendensdata = await emp_attendenceRepository.findAll({
    employee_id: employeId
  });

   const lastSalaryRecord = await saleryRepositorie.findOne({ emp_id: employeId });

  let startDate = new Date(joiningDate);
  if (lastSalaryRecord && lastSalaryRecord.to_date) {
    const t = new Date(lastSalaryRecord.to_date);
    startDate = dateOnly(new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1));
  }

  const today = dateOnly(new Date());
 
  const attendanceMap = {};
  for (const a of employeattendensdata) {
    const k = ymdLocal(dateOnly(new Date(a.attendence_date)));
    attendanceMap[k] = a.status;  
  }

   const monthWise = [];
  let loopMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (
    loopMonth.getFullYear() < today.getFullYear() ||
    (loopMonth.getFullYear() === today.getFullYear() && loopMonth.getMonth() <= today.getMonth())
  ) {
    const monthStart = new Date(loopMonth.getFullYear(), loopMonth.getMonth(), 1);
    const monthEndFull = new Date(loopMonth.getFullYear(), loopMonth.getMonth() + 1, 0);
    const monthEnd = (monthStart.getFullYear() === today.getFullYear() && monthStart.getMonth() === today.getMonth())
      ? today
      : monthEndFull;

    const daysInThisMonth = monthEndFull.getDate();
    const perDaySalary = daysInThisMonth > 0 ? (baseSalary / daysInThisMonth) : 0;

    const rangeStart = monthStart < startDate ? new Date(startDate) : dateOnly(monthStart);
    const rangeEnd = monthEnd > today ? new Date(today) : dateOnly(monthEnd);

    if (rangeStart > rangeEnd) {
      monthWise.push({
        month: `${monthStart.getFullYear()}-${monthStart.getMonth() + 1}`,
        totalDays: daysInThisMonth,
        presentDays: 0,
        halfDays: 0,
        absentDays: daysInThisMonth,
        perDaySalary,
        totalSalary: 0
      });
      loopMonth.setMonth(loopMonth.getMonth() + 1);
      continue;
    }

    let presentDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let totalSalary = 0;

    let d = new Date(rangeStart);
    while (d <= rangeEnd) {
      const key = ymdLocal(d);
      const status = attendanceMap[key];

      if (status === "present") {
        presentDays += 1;
        totalSalary += perDaySalary;
      } else if (status === "half_day") {
        halfDays += 1;
        totalSalary += perDaySalary / 2;
      } else {
        absentDays += 1;
      }

      d.setDate(d.getDate() + 1);
    }
 
    absentDays = daysInThisMonth - (presentDays + halfDays);
    if (absentDays < 0) absentDays = 0;

    monthWise.push({
      month: `${monthStart.getFullYear()}-${monthStart.getMonth() + 1}`,
      totalDays: daysInThisMonth,
      presentDays,
      halfDays,
      absentDays,
      perDaySalary,
      totalSalary: Number(totalSalary.toFixed(2))
    });

    loopMonth.setMonth(loopMonth.getMonth() + 1);
  }

  const salerydata = await saleryRepositorie.findAll({ emp_id: employeId });

  return {
    employee: data,
    salerydata,
    employeattendensdata,
    monthWiseSalary: monthWise
  };
}
,
getEmployeeBatchSubject: async (id) => {

    // let checkBatch = await empBatchRepository.getOneData({ employee_id: id });
    // if (!checkBatch) {
    //   throw new customError("Employee not found", 404);
    // }
    // let checkSubject = await empSubjRepository.getOneData({ employee_id: id });
    // if (!checkSubject) {
    //   throw new customError("Employee not found", 404);
    // }
    return await emp_profileRepository.getEmployeeBatchSubject(id);
  },

  assignEmployee: async (data) => {
    const {
      batch_id: batchIds,
      subjectId: subjectIds,
      course_id,
      employeeId,
      session_Id, // ✅ new field
    } = data;

    const course = await coursesRepository.findOne({ id: course_id });
    if (!course || course.status === "inactive") {
      throw new customError(`Course is inactive`, 400);
    }

    const session = await sessionRepository.findOne({ id: session_Id });
    if (!session || session.status === "inactive") {
      throw new customError(`Session is inactive or not found`, 400);
    }

    const validBatches = await batchesRepositorie.findAll({
      id: { [Op.in]: batchIds },
      course_id,
      status: "active",
    });

    if (validBatches.length !== batchIds.length) {
      throw new customError(`One or more Batches are inactive or do not belong to the Course`, 400);
    }

    const validSubjects = await subjectCourseRepository.findAll({
      subject_id: { [Op.in]: subjectIds },
      course_id,
    });

    if (validSubjects.length !== subjectIds.length) {
      throw new customError(`One or more Subjects do not belong to the Course`, 400);
    }

    const activeSubjects = await subjectRepository.findAll({
      id: { [Op.in]: subjectIds },
      status: "active",
    });

    if (activeSubjects.length !== subjectIds.length) {
      throw new customError(`One or more Subjects are inactive`, 400);
    }

    const alreadyAssignedBatches = await emp_batchRepository.findAll({
      employee_id: employeeId,
      batch_id: { [Op.in]: batchIds },
      session_Id, // ✅ check within session context
    });

    if (alreadyAssignedBatches.length > 0) {
      throw new customError(`One or more Batches already assigned to the Employee for this Session`, 400);
    }

    const alreadyAssignedSubjects = await empSubjRepository.findAll({
      employee_id: employeeId,
      subject_id: { [Op.in]: subjectIds },
      session_Id, // ✅ check within session context
    });

    if (alreadyAssignedSubjects.length > 0) {
      throw new customError(`One or more Subjects already assigned to the Employee for this Session`, 400);
    }

    const empBatchData = batchIds.map((batchId) => ({
      employee_id: employeeId,
      batch_id: batchId,
      session_Id:session_Id , // ✅ include in insert
    }));

    const empSubjectData = subjectIds.map((subjectId) => ({
      employee_id: employeeId,
      subject_id: subjectId,
      course_id,
      session_Id:session_Id , // ✅ include in insert
    }));

    console.log("empBatchData", empBatchData);
console.log("empSubjectData", empSubjectData);

    await Promise.all([
      emp_batchRepository.insertMany(empBatchData),
      empSubjRepository.insertMany(empSubjectData),
    ]);
  },



};

module.exports = instructorService;
