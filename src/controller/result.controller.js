const { examResultService } = require("../service/resultPDF.service");
const { uploadFileToAzure } = require("../utils/azureUploader");
const pdf = require("html-pdf-node");
const { marksheet } = require("../models");

const getExamResults = async (req, res) => {
  try {
    const { student_enrollment_id, category_id } = req.query;

    if (!student_enrollment_id || !category_id) {
      return res.status(400).json({
        success: false,
        message: "student_enrollment_id and category_id are required",
      });
    }

    const results = await examResultService.getResultsByExamId(
      parseInt(student_enrollment_id),
      parseInt(category_id)
    );

    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    const examData = results[0];
    const currentDateTime = new Date().toLocaleString("en-IN");

    const subjectRows = results.map((result, index) => {
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${result.exam_batch?.Exam?.Subject?.subject_name || ""}</td>
          <td>${result.exam_batch?.Exam?.total_marks || ""}</td>
          <td>${result.marks_obtained ?? "null"}</td>
          <td>${result.grade || ""}</td>
        </tr>
      `;
    }).join("");

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { width: 90%; margin: auto; padding: 20px; border: 2px solid #001f3f; }
    .header { text-align: center; border-bottom: 2px solid #001f3f; padding-bottom: 10px; }
    .header h1 { margin: 0; color: #001f3f; }
    .header h2 { margin: 0; font-size: 18px; color: #444; }
    .info-row { display: flex; justify-content: space-between; margin-top: 10px; }
    .info { font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #333; padding: 8px; font-size: 14px; }
    th { background-color: #f2f2f2; }
    .footer { margin-top: 40px; font-size: 12px; display: flex; justify-content: space-between; align-items: center; }
    .signature { text-align: right; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>RNS TIPS-G INSTITUTE</h1>
      <h2>Training the Innovators of Tomorrow</h2>
    </div>

    <div class="info-row">
      <div class="info"><strong>Enrollment ID:</strong> ${examData?.Student_Enrollment?.Student?.enrollment_id || ""}</div>
      <div class="info"><strong>Exam:</strong> 1 year</div>
    </div>
    <div class="info-row">
      <div class="info"><strong>Student Name:</strong> ${examData?.Student_Enrollment?.Student?.name || ""}</div>
      <div class="info"><strong>Result ID:</strong> ${examData?.id || ""}</div>
    </div>
    <div class="info-row">
      <div class="info"><strong>Father's Name:</strong> ${examData?.Student_Enrollment?.Student?.father_name || ""}</div>
      <div class="info"><strong>Date:</strong> ${currentDateTime}</div>
    </div>
    <div class="info-row">
      <div class="info"><strong>Mother's Name:</strong> ${examData?.Student_Enrollment?.Student?.mother_name || ""}</div>
    </div>

    <table>
      <tr>
        <th>S.R</th>
        <th>Subjects</th>
        <th>Total Marks</th>
        <th>Marks Obtain</th>
        <th>Grade</th>
      </tr>
      ${subjectRows}
    </table>

    <div class="footer">
      <div>Generated on: ${currentDateTime}</div>
      <div class="signature">Authorized Signature</div>
    </div>
  </div>
</body>
</html>
`;

    // Generate PDF
    const pdfBuffer = await pdf.generatePdf({ content: html }, { format: "A4" });

    // Upload to Azure Blob
    const studentName = examData?.Student_Enrollment?.Student?.name?.replace(/\s+/g, "_") || "student";
    const timestamp = Date.now();
    const blobPath = `marksheets/${studentName}_${timestamp}.pdf`;

    const uploadResult = await uploadFileToAzure(pdfBuffer, blobPath, "pdf");

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: "PDF generated but Azure upload failed",
        error: uploadResult.error,
      });
    }

    // Save marksheet in DB
    await marksheet.create({
      student_enrollment_id: parseInt(student_enrollment_id),
      category_id: parseInt(category_id),
      url: blobPath,
    });

    return res.status(200).json({
      success: true,
      message: "Marksheet generated, uploaded and saved to DB successfully",
      url: uploadResult.url,
    });

  } catch (error) {
    console.error("Error generating marksheet:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate and upload marksheet",
      error: error.message,
    });
  }
};

module.exports = { getExamResults };
