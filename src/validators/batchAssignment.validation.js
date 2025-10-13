const { z } = require('zod');

const batchAssignmentSchema = z.object({
  assignment_id: z.number({
    required_error: "Assignment ID is required"
  }).int().positive({ message: "Assignment ID must be a positive integer" }),

  batch_id: z
    .array(
      z.number().int().positive({ message: "Each Batch ID must be a positive integer" })
    )
    .nonempty({ message: "At least one batch ID is required" })
});


module.exports = batchAssignmentSchema;