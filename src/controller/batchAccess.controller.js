const { StatusCodes } = require("http-status-codes");
// const { studentRepositories } = require("../repositories/student.repo");
const { try_catch } = require("../utils/tryCatch.handle");
// const { batchesRepositories } = require("../repositories/Batches.repo");
const batchAccessService = require("../service/batchAccess.service");
const customError = require("../utils/error.handle");
// const batchRepo = new batchesRepositories()
// const studentRepo = new studentRepositories();

const batchController = {
  getBatchById: try_catch(async (req, res) => {
    const getId = req.user.id;
    // console.log(req.user)
    // console.log(getId);
    const getData = await batchAccessService.getBatch(getId);
    return res.status(StatusCodes.ACCEPTED).json({
      success: true,
      message: "Success Access",
      data: getData,
    });
  }),

  getallbatchescontroller: try_catch(async (req, res) => {
    const { batchName = "", course_id, page = 1, limit = 10 } = req.query;

    const data = await batchAccessService.getallbatchesservices(
      batchName,
      course_id,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      message: "Batches fetched successfully",
      ...data, // returns { totalPages, currentPage, data }
    });
  }),

  getAllBatch: try_catch(async (req, res) => {
    const employeeId = req.user.id;
    const { sessionId, search } = req.query;
    const getAllBatch = await batchAccessService.getAllBatch(
      employeeId,
      sessionId,
      search
    );

    return res.status(StatusCodes.ACCEPTED).json({
      success: true,
      message: "Success Access",
      data: getAllBatch,
    });
  }),

  getBatch: try_catch(async (req, res) => {
    // const getId = req.params.id
    const { id, SessionId } = req.query;
    console.log(req.query, "****************************** req.query");
    // console.log(getId,"***********************8 getId");
    const getData = await batchAccessService.getBatch(id, SessionId);
    return res.status(StatusCodes.ACCEPTED).json({
      success: true,
      message: "Success Access",
      data: getData,
    });
  }),

  //getbatch by session_id
  getBatchBySession: try_catch(async (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId) {
      throw new customError("Session ID is required", StatusCodes.BAD_REQUEST);
    }
    const result = await batchAccessService.getBatchBySessionId(sessionId);
    if (result.length == 0) {
      throw new customError(
        "No batch in this session",
        StatusCodes.BAD_REQUEST
      );
    }
    return res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    });
  }),

  getAssignmentByBatchId: try_catch(async (req, res) => {
    const { batchId, sessionId, page, limit } = req.query;
    const userId = req.user.id;

    if (!batchId || !sessionId || !userId) {
      throw new customError(
        "Batch ID, Session ID and User ID are required",
        StatusCodes.BAD_REQUEST
      );
    }

    if (!page || !limit) {
      throw new customError(
        "Page and Limit are required for pagination",
        StatusCodes.BAD_REQUEST
      );
    }

    const result = await batchAccessService.getAssignmentByBatchId(
      batchId,
      sessionId,
      page,
      limit,
      userId
    );

    if (result.data.length === 0) {
      throw new customError(
        "No Assignment in this batch",
        StatusCodes.BAD_REQUEST
      );
    }

    return res.status(StatusCodes.OK).json(result);
  }),
};

module.exports = { batchController };
