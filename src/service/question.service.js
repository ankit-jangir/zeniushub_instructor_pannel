const ExcelJS = require("exceljs");
const { v4: uuidv4 } = require("uuid");
const XlsxPopulate = require("xlsx-populate");
const { questionrepo } = require("../repositories/question.repo");
const { SubjectRepositories } = require("../repositories/Subject.repo");
const { uploadFileToAzure } = require("../utils/azureUploader");

const customError = require("../utils/error.handle");
const { Op } = require("sequelize");
const { Question } = require("../models"); 


const { name } = require("xlsx-populate/lib/RichText");
const {
  QuestionPaperRepositories,
} = require("../repositories/questionpaper.repo");
const { CoursesRepositories } = require("../repositories/courses.repo");

const questionRepositories = new questionrepo();
const subjectRepositories = new SubjectRepositories();
const questionPaperrepo = new QuestionPaperRepositories();
const coursesRepositor = new CoursesRepositories()

const questionservice = {
  importQuestionsFromExcel: async (buffer, subjectId, course_id, added_by) => {
    const subject = await subjectRepositories.getDataById(subjectId);
    if (!subject) throw new Error("Invalid subject ID");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.worksheets[0];

    const questions = [];

    // Step 1: Extract rows
    for (let i = 2; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);
      const questionObj = {
        question: row.getCell(1).value || "",
        option1: row.getCell(2).value || "",
        option2: row.getCell(3).value || "",
        option3: row.getCell(4).value || "",
        option4: row.getCell(5).value || "",
        answer: row.getCell(6).value || "",
        subject_id: subjectId,
        course_id: course_id,
        added_by: added_by, // ✅ include this
      };
      questions.push(questionObj);
    }

    // Step 2: Attach image if present
    const worksheet = sheet;
    const images = worksheet.getImages();
    const imageMap = {};

    for (const img of images) {
      const imageMeta = workbook.model.media.find(
        (m) => m.index === img.imageId
      );
      if (!imageMeta || !img.range?.tl?.nativeRow) continue;

      const ext = imageMeta.contentType?.split("/")?.[1] || "png";
      const rowNum = img.range.tl.nativeRow + 1;

      const uniqueName = `questions/${uuidv4()}.${ext}`;
      const bufferData = imageMeta.buffer;

      const uploadResult = await uploadFileToAzure(
        Buffer.from(bufferData),
        uniqueName,
        ext
      );

      if (uploadResult.success) {
        imageMap[rowNum] = {
          url: uploadResult.url,
          name: uniqueName,
        };
      }
    }

    // Step 3: Add image URLs to questions
    for (let i = 0; i < questions.length; i++) {
      const rowNum = i + 2;
      if (imageMap[rowNum]) {
        questions[i].img = imageMap[rowNum].url;
      }
    }

    console.log(questions);

    // Step 4: Insert into DB
    const insertedQuestions = await questionRepositories.bulkCreate(questions);
    return insertedQuestions;
  },

  addQuestionPaper: async ({ subject_id, set, name }, file) => {
    if (!file) throw new Error("PDF file is required");
    if (!subject_id || !set) throw new Error("Subject ID and set are required");

    const subject = await subjectRepositories.getDataById(subject_id);
    if (!subject) throw new Error("Subject not found");

    const blobPath = `questionpapers/${file.originalname}`;
    const uploadResult = await uploadFileToAzure(file.buffer, blobPath, "pdf");

    if (!uploadResult.success)
      throw new Error("Failed to upload to Azure Blob");

    const newQP = await questionPaperrepo.create({
      name,
      subject_id,
      set,
      pdf: blobPath,
    });

    return newQP;
  },

  // getQuestionsBySubject: async (subjectId) => {
  //   console.log("sub  ",subjectId);

  //   const subject = await subjectRepositories.getDataById(subjectId);
  //   if (!subject) throw new Error('Invalid subject ID');

  //   return await questionRepositories.findAll({ subject_id: subjectId });
  // },

  updateQuestionStatus: async (id) => {
    const question = await questionRepositories.getDataById(id);

    if (!question) throw new Error("Question not found");

    const newStatus = question.status === "active" ? "inactive" : "active";

    await questionRepositories.update({ status: newStatus }, { id });
    return { message: `Status updated to ${newStatus}` };
  },


  getAllQuestionPapers: async (filters, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  let { rows, count } = await questionRepositories.getAllWithSubjectName(
    filters,
    { offset, limit }
  );

  if (rows.length === 0 && page > 1) {
    const newPage = Math.ceil(count / limit);
    const newOffset = (newPage - 1) * limit;

    ({ rows, count } = await questionRepositories.getAllWithSubjectName(
      filters,
      { offset: newOffset, limit }
    ));

    page = newPage;
  }

  const data = await Promise.all(
    rows.map(async (item) => {
      const plain = item.toJSON();

      const actualCourse = plain.Course || null;
      const courseBatches =
        actualCourse?.Batches?.map((b) => b.BatchesName) || [];

      // ✅ FIX: include employee filter
      const questionCount = await Question.count({
        where: {
          subject_id: plain.subject_id,
          course_id: plain.course_id,
          added_by: filters.added_by, // ✅ only that employee's questions
        },
      });

      return {
        subject_name: plain.Subject?.subject_name || null,
        subject_Id: plain.subject_id,
        course_name: actualCourse?.course_name || null,
        course_id: plain.course_id,
        batches: courseBatches,
        course_question_count: questionCount,
      };
    })
  );

  return {
    data,
    pagination: {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      limit,
    },
  };
},



  
    createQuestion: async (data) => {
    const subject = await subjectRepositories.getDataById(data.subject_id);
    if (!subject) throw new Error("Invalid subject ID");
    console.log('====================================');
    console.log(data);
    console.log('====================================');
    const created = await questionRepositories.create(data);

    return created;
  }
,

  questiondetailsforcourseid: async (courseid, subject_id, page, limit, search) => {
  return await questionPaperrepo.getDataWithId(courseid, subject_id, page, limit, search);
}
};

module.exports = questionservice;
