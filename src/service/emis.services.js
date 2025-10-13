const { emisRepositories } = require("../repositories/emis.repo");
const emisRepositorie = new emisRepositories();
const { Op, fn, col, literal, sequelize } = require("sequelize");
// const { Op } = require("sequelize");
// const { sequelize, Op } = require("sequelize");
const moment = require("../utils/time-zone");
const { try_catch } = require("../utils/tryCatch.handle");
// const { Emi, Student, Batches, Course } = require("../models");
const {
  Student,
  Batches,
  Course,
  Emi,
  Student_Enrollment,
} = require("../models"); // Import from models
const customError = require("../utils/error.handle");
const { PaymentReceiptRepositories } = require("../repositories/payment.repo");

// const { studentRepositories } = require("../repositories/student.repo");
// const { CoursesRepositories } = require("../repositories/courses.repo");
// const { batchesRepositories } = require("../repositories/Batches.repo");
// const batchesRepositorie = new batchesRepositories();
// const studentRepository = new studentRepositories();
// const coursesRepository = new CoursesRepositories();


const receiptRepository = new PaymentReceiptRepositories();

const Emiservices = {
  getFilteredEmis: async ({
    status,
    fromDate,
    toDate,
    courseId,
    batchId,
    sessionid,
    page = 1,
    limit = 10,
  }) => {


    console.log(fromDate, " and : ", toDate)
    // const start = moment(fromDate, "YYYY-MM-DD");
    // const end = moment(toDate, "YYYY-MM-DD");

    // if (!start.isValid() || !end.isValid()) {
    //   return { success: false, message: "Invalid date format" };
    // }

    // const offset = (page - 1) * limit;

    const { rows: emis, count: total } =
      await emisRepositorie.getFilteredEmiskaran({
        fromDate,
        toDate,
        status,
        courseId,
        batchId,
        sessionid,
        page,
        limit,
      });

    if (!emis || emis.length === 0) {
      return {
        success: false,
        message: `No ${status} EMIs found for selected filters`,
      };
    }

    return {
      success: true,
      data: emis,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getEmisTotalAmounts: async (req) => {
    async function formatDateToSQL(date) {
      return date
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d{3}Z$/, "+00");
    }

    if (!req || !req.query) {
      throw new customError("Invalid request object");
    }

    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);

    if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
      throw new customError("Valid month (1-12) and year are required");
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1));

    const formattedStartDate = await formatDateToSQL(startDate);
    const formattedEndDate = await formatDateToSQL(endDate);
    const todayStart = moment().startOf("day").format("YYYY-MM-DD HH:mm:ssZ");
    console.log("formattedStartDate,formattedEndDate");
    console.log(formattedStartDate, formattedEndDate);

    const result = await emisRepositorie.model.findAll({
      attributes: [
        [
          fn(
            "SUM",
            literal(`CASE 
        WHEN payment_date >= '${formattedStartDate}' 
          AND payment_date < '${formattedEndDate}' 
        THEN (amount - due_amount) ELSE 0 END`)
          ),
          "totalPaid",
        ],
        [
          fn(
            "SUM",
            literal(`CASE 
        WHEN due_amount > 0 
          AND emi_duedate >= '${formattedStartDate}' 
          AND emi_duedate < '${formattedEndDate}' 
          AND emi_duedate < '${todayStart}' 
        THEN due_amount ELSE 0 END`)
          ),
          "totalMissed",
        ],
        [
          fn(
            "SUM",
            literal(`CASE 
        WHEN due_amount > 0 
          AND emi_duedate >= '${formattedStartDate}' 
          AND emi_duedate < '${formattedEndDate}' 
          AND emi_duedate >= '${todayStart}' 
        THEN due_amount ELSE 0 END`)
          ),
          "totalUpcoming",
        ],
        [fn("COUNT", col("Emi.id")), "totalEmis"],
      ],
      include: [
        {
          model: Student_Enrollment,
          attributes: [],
          required: true,
          include: [
            {
              model: Student,
              attributes: [],
              // where: { status: "active" },
              required: true,
            },
          ],
        },
      ],
      raw: true,
    });

    const { totalPaid, totalMissed, totalUpcoming, totalEmis } = result[0];

    const totalAmount =
      parseFloat(totalPaid || 0) +
      parseFloat(totalMissed || 0) +
      parseFloat(totalUpcoming || 0);

    return {
      totalAmount,
      breakdown: {
        totalCollectedFees: parseFloat(totalPaid || 0),
        totalMissedFees: parseFloat(totalMissed || 0),
        totalUpcomingFees: parseFloat(totalUpcoming || 0),
        totalEmis: parseInt(totalEmis || 0),
      },
    };
  },

    getEmiSummaryByDate: async () => {
    const today = moment().startOf("day");
    const startOfDay = today.toDate();

    // Get current day at 23:59:59.999
    const endOfDay = moment().endOf("day").toDate();
    console.log(startOfDay, endOfDay);

    const emis = await emisRepositorie.getEmisByDate(startOfDay, endOfDay);

    // const totalExpected = emis.reduce((sum, e) => sum + Number(e.amount), 0);
    // const totalReceived = emis
    //   .filter((e) => e.is_paid)
    //   .reduce((sum, e) => sum + Number(e.amount), 0);
    // const toCollect = totalExpected - totalReceived;

    return {
      success: true,
      date: today.format("YYYY-MM-DD"),
      data: emis,
    };
  },
  getFilteredEmisExcel: async ({
    status,
    fromDate,
    toDate,
    batchId,
    courseId,
  }) => {
    return await emisRepositorie.downloadGetFilteredEmiskaran({
      status,
      fromDate,
      toDate,
      batchId,
      courseId,
    });
  },








  updateEmiPayment: async (emi_id, payment_date) => {

    const emi = await emisRepositorie.findOne({id:emi_id});
    console.log('====================================');
    console.log(emi);
    console.log('====================================');
    if (!emi) {
      throw new customError("EMI not found");
    }

    if (emi.is_paid) {
      throw new customError("EMI already paid", 400);
    }

    const unpaidPreviousEmis = await emisRepositorie.findAll({
      enrollment_id: emi.enrollment_id,    
      is_paid: false,
      emi_duedate: {
        [Op.lt]: emi.emi_duedate,       
      },

    });

    if (unpaidPreviousEmis.length > 0) {
      throw new customError("You must pay earlier EMIs before paying this one.");
    }
console.log('emi.due_amount', emi.due_amount);
console.log('emi.amount', emi.amount);

console.log('emi.amount ===>', emi.amount, typeof emi.amount);


  const adddata=   await receiptRepository.create({
      student_id: emi.enrollment_id,  
      amount: emi.amount,
      payment_date: payment_date,

    });
    console.log('====================================');
    console.log("TTTT");
    console.log('====================================');
console.log("this isn my receiptRepository console ",adddata)
 
    return await emisRepositorie.update(
      { payment_date: payment_date, is_paid: true, due_amount: 0 },
      { id: emi_id }
    );



  }
};

module.exports = Emiservices;
