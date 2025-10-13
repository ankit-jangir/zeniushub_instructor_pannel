const Emiservices = require("../service/emis.services");
const { try_catch } = require("../utils/tryCatch.handle");
const ExcelJS = require("exceljs");
const moment = require("../utils/time-zone");

const emiController = {
  getEmisTotalAmounts: try_catch(async (req, res) => {
    const result = await Emiservices.getEmisTotalAmounts(req);
    res.status(200).json({
      success: true,
      message: "EMI total amounts retrieved successfully",
      data: result,
    });
  }),

  getFilteredEmis: try_catch(async (req, res) => {
    const {
      status,
      fromDate,
      toDate,
      courseId,
      batchId,
      page = 1,
      limit = 10,
      sessionid
    } = req.query;

    console.log(req.body, "********************** req.bodyy")
    const validStatuses = ["paid", "upcoming", "missed"];

    if (!status || !fromDate || !toDate) {
      return res
        .status(400)
        .json({ message: "Status, fromDate, and toDate are required" });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'paid', 'upcoming', or 'missed'",
      });
    }

    const result = await Emiservices.getFilteredEmis({
      status,
      fromDate,
      toDate,
      courseId,
      batchId,
      sessionid,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.send(result);
  }),

  getTodayEmiSummary: try_catch(async (req, res) => {
    const result = await Emiservices.getEmiSummaryByDate(); // No date passed
    res.status(200).json(result);
  }),


  getFilteredEmisExcel: try_catch(async (req, res) => {
    const { status, fromDate, toDate, batchId, courseId } = req.query;

    if (!status || !fromDate || !toDate) {
      return res.status(400).json({
        message: "Status, fromDate, toDate, and batchId are required",
      });
    }

    try {
      const result = await Emiservices.getFilteredEmisExcel({
        status,
        fromDate,
        toDate,
        batchId,
        courseId,
      });
      console.log(result, "   res   ");
      // return
      if (result.rows.length < 1) {
        return res.status(404).json({ message: "No EMI data found" });
      }

      const emis = result.rows;

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("EMI Report");

      worksheet.columns = [
        // { header: "ID", key: "id", width: 10 },
        { header: "Enrollment ID", key: "enrollment_id", width: 15 },
        { header: "Student Name", key: "student_name", width: 25 },
        { header: "Batch Name", key: "batch_name", width: 25 },
        { header: "Amount", key: "amount", width: 10 },
        { header: "due amount", key: "due_amount", width: 20 },
        // { header: "total_received", key: "total_received", width: 20 },
        { header: "Is Paid", key: "is_paid", width: 10 },
        { header: "Payment Date", key: "payment_date", width: 20 },
        { header: "EMI Due Date", key: "emi_duedate", width: 20 },
      ];
      emis.forEach((emi) => {
        worksheet.addRow({
          enrollment_id:
            emi.Student_Enrollment?.Student?.enrollment_id || "N/A",
          student_name: emi.Student_Enrollment?.Student?.name || "N/A",
          batch_name: emi.Student_Enrollment?.Batch?.BatchesName || "N/A",
          amount: emi.amount,
          due_amount: emi.due_amount,
          is_paid: emi.is_paid ? "Yes" : "No",
          payment_date: emi.payment_date || "N/A",
          emi_duedate: emi.emi_duedate,
        });
      });
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=emi_report.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error generating EMI report:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }),











  updateEmiPayment: try_catch(async (req, res) => {
    const { emi_id, payment_date } = req.query;

    if (!emi_id || !payment_date) {
      return res
        .status(400)
        .json({ message: "emi_id and payment_date are required" });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(payment_date)) {
      return res
        .status(400)
        .json({ message: "payment_date must be in YYYY-MM-DD format" });
    }
    const inputDate = moment(payment_date, "YYYY-MM-DD", true); // strict parsing
    const today = moment().startOf("day");

    if (!inputDate.isValid()) {
      return res.status(400).json({ message: "Invalid payment_date" });
    }


    if (inputDate.isAfter(today)) {
      return res
        .status(400)
        .json({ message: "payment_date cannot be in the future" });
    }
    const result = await Emiservices.updateEmiPayment(emi_id, payment_date);

    // if (!result.success) {
    //   return res.status(400).json({ message: result.message });
    // }

    return res
      .status(200)
      .json({ success: true, message: "emi paid successfully", emi: result });
  })
};
module.exports = emiController;
