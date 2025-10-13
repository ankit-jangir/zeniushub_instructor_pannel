const { UUIDV4 } = require("sequelize");
const questionservice = require("../service/question.service");
const { try_catch } = require("../utils/tryCatch.handle");
const { StatusCodes } = require("http-status-codes");
const { uploadFileToAzure } = require("../utils/azureUploader");


const questionController = {
  importQuestions: try_catch(async (req, res) => {
    const buffer = req.file?.buffer;
    const { subject_id, course_id } = req.body;
    const employee_id = req.user?.id;

    console.log("11111", req.body, "employee:", employee_id);

    if (!subject_id || !course_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "subject_id and course_id are required",
      });
    }

    if (!buffer) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Excel file is required",
      });
    }

    if (!employee_id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Unauthorized: employee_id not found in token",
      });
    }

    const result = await questionservice.importQuestionsFromExcel(
      buffer,
      subject_id,
      course_id,
      employee_id // ✅ pass added_by
    );

    return res.status(StatusCodes.ACCEPTED).json({
      success: true,
      message: "Questions imported successfully",
      data: result,
    });
  }),

  addQuestionPaper: try_catch(async (req, res) => {
    const { subject_id, set, name } = req.body;
    const file = req.file;

    const result = await questionservice.addQuestionPaper(
      { subject_id, set, name },
      file
    );

    return res.status(201).json({
      success: true,
      message: "Question paper added successfully",
      data: result,
    });
  }),

  // QuestionsBySubject : try_catch(async (req, res) => {
  //   const { subjectId } = req.params;
  //   console.log(subjectId);

  //   const questions = await questionservice.getQuestionsBySubject(subjectId);

  //   return res.status(StatusCodes.OK).json({
  //       success: true,
  //       message: 'Questions fetched successfully',
  //       data: questions,
  //   })
  //   }),

  updateStatus: try_catch(async (req, res) => {
    const { id } = req.params;
    console.log(id);

    const result = await questionservice.updateQuestionStatus(id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Questions fetched successfully",
      data: result,
    });
  }),

  getAllQuestionPapers: try_catch(async (req, res) => {
  const employee_id = req.user?.id;

  if (!employee_id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized: employee_id not found in token",
    });
  }

  const { name, subject_name, page = 1, limit = 10 } = req.query;

  const filters = { added_by: employee_id };
  if (name?.trim()) filters.name = name.trim();
  if (subject_name?.trim()) filters.subject_name = subject_name.trim();

  const result = await questionservice.getAllQuestionPapers(filters, Number(page), Number(limit));

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Fetched question papers successfully",
    data: result.data,
    pagination: result.pagination,
  });
})
,

  getSingleQuestionPaper: try_catch(async (req, res) => {
    const id = req.params.id;

    const data = await questionservice.getSingleQuestionPaper(id);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Question paper fetched successfully",
      data,
    });
  }),






 createQuestion: try_catch(async (req, res) => {
  let { question, option1, option2, option3, option4, answer, subject_id, course_id, is_image_option } = req.body;
  const employee_id = req.user?.id;

  if (!subject_id || !course_id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "subject_id and course_id are required",
    });
  }

  if (!employee_id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: "Unauthorized: employee_id not found in token",
    });
  }

  if (!answer) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Answer is required",
    });
  }

  let imageUrl = null;
  if (req.files && req.files["question_img"]?.length) {
    const file = req.files["question_img"][0];
    const ext = file.originalname.split(".").pop();
    const uniqueName = `questions/${UUIDV4()}.${ext}`;
    const uploadResult = await uploadFileToAzure(file.buffer, uniqueName, ext);

    if (uploadResult.success) {
      imageUrl = uploadResult.url; 
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to upload question file",
      });
    }
  }

  if (!question && !imageUrl) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Either question text or question file is required",
    });
  }

  const textOptions = [option1, option2, option3, option4].filter(o => !!o);
  const fileOptionsExist = req.files && (
    req.files.option1?.length || req.files.option2?.length || req.files.option3?.length || req.files.option4?.length
  );

 
  if (textOptions.length > 0 && fileOptionsExist) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Options can either be text OR files, not both together",
    });
  }

  const finalOptions = {};

  if (fileOptionsExist) {
    is_image_option = true;
    for (let i = 1; i <= 4; i++) {
      if (!req.files[`option${i}`]) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Option${i} file is required because is_image_option=true`,
        });
      }
      const file = req.files[`option${i}`][0];
      const ext = file.originalname.split('.').pop();
      const uniqueName = `questions/options/${UUIDV4()}.${ext}`;
      const uploadResult = await uploadFileToAzure(file.buffer, uniqueName, ext);
      if (!uploadResult.success) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: `Failed to upload option ${i}`,
        });
      }
      finalOptions[`option${i}`] = uploadResult.url;
    }
  } else {
    is_image_option = false;
    for (let i = 1; i <= 4; i++) {
      const opt = req.body[`option${i}`];
      if (!opt || typeof opt !== "string") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: `Option${i} text is required because is_image_option=false`,
        });
      }
      finalOptions[`option${i}`] = opt;
    }
  }

  const newQuestion = await questionservice.createQuestion({
    question: question || null,   
    question_url: imageUrl || null, 
    ...finalOptions,
    answer,
    subject_id,
    course_id,
    added_by: employee_id,
    is_image_option,
    img: null, 
  });

  return res.status(StatusCodes.ACCEPTED).json({
    success: true,
    message: "Question added successfully",
    data: newQuestion,
  });
}),






allcoursegetapi: try_catch(async (req, res) => {
  const { courseid, subject_id, page = 1, limit = 10, search = "" } = req.query;

  const result = await questionservice.questiondetailsforcourseid(
    courseid,
    subject_id,
    Number(page),
    Number(limit),
    search
  );

  res.status(200).json({
    success: true,
    currentPage: Number(page),
    limit: Number(limit),
    totalRecords: result.totalRecords,
    totalPages: result.totalPages,
    data: result.data
  });
})


  
};

module.exports = questionController;
