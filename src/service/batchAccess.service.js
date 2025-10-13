const { StatusCodes } = require("http-status-codes");
const { batchesRepositories } = require("../repositories/Batches.repo");
const { SessionRepositories } = require("../repositories/Session.repo");
const customError = require("../utils/error.handle");
const batchRepo = new batchesRepositories();

const batchAccessService = {
  getBatch: async (id, SessionId) => {
    const getResponse = await batchRepo.findBatchDetails(id, SessionId);
    return getResponse;
  },

  getallbatchesservices: async (batchName, course_id, page, limit) => {
    const data = await batchRepo.searchapidta(
      batchName,
      course_id,
      page,
      limit
    );
    return data;
  },

  getAllBatch: async (id, sessionId, search) => {
    const batchResponse = await batchRepo.getAllBatch(id, sessionId, search);
    return batchResponse;
  },
  //getBatchBySessionId
  getBatchBySessionId: async (Session_id) => {
    return await batchRepo.getbatchData(Session_id);

    // return {
    //     success: true,
    //     data: data || [],
    // };
  },

  getAssignmentByBatchId: async (batchId, sessionId, page, limit, userId) => {
    if (!batchId || !sessionId || !userId) {
      throw new customError("Batch ID, Session ID and User ID are required", 400);
    }

    return await batchRepo.getAssignmentByBatchId(
      batchId,
      sessionId,
      page,
      limit,
      userId
    );
  },
};

module.exports = batchAccessService;
