const express = require("express");
// const authenticate = require('../../middleware/v        erifyToken');
const {
  checkAccessMiddleware,
} = require("../../middleware/checkAccessMiddleware");
const { batchController } = require("../../controller/batchAccess.controller");
const authenticate = require("../../middleware/verifyToken");

const batchRouter = express.Router();

batchRouter.get(
  "/details",
  authenticate,
  checkAccessMiddleware("batch"),
  batchController.getBatchById
);

batchRouter.get(
  "/getallbatchescontroller",
  authenticate,

  checkAccessMiddleware("batch"),
  batchController.getallbatchescontroller
);

batchRouter.get(
  "/",
  authenticate,
  checkAccessMiddleware("batch"),
  batchController.getAllBatch
);

// module.exports = {batchRouter}
batchRouter.get(
  "/batch-by-session",
  authenticate,

  checkAccessMiddleware("batch"),
  batchController.getBatchBySession
);
batchRouter.get(
  "/batchById",
  authenticate,
  checkAccessMiddleware("batch"),
  batchController.getBatch
);

batchRouter.get(
  "/assignment-by-batch",
  authenticate,

  checkAccessMiddleware("batch"),
  batchController.getAssignmentByBatchId
)
// batchRouter.get(
//   "tokenbatchdetails/:id",
//   authenticate,
//   batchController.batchdetails
// );

module.exports = { batchRouter };
