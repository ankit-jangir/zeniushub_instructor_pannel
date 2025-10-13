const { sequelize } = require("../models");
const { z } = require("zod");
const { ValidationError, UniqueConstraintError } = require("sequelize");
const customError = require("./error.handle");

const try_catch = (handler) => {
  return async (req, reply, next) => {
    const t = await sequelize.transaction();
    try {
      await handler(req, reply, next, t);

      await t.commit();
    } catch (err) {
      await t.rollback();
      console.log("Rolling back due to the following error:", err);

      // ✅ Zod Validation Error
      if (err instanceof z.ZodError) {
        const errors = err.errors.map((e) => ({
          message: e.message,
        }));

        return reply.status(400).send({
          success: false,
          message: "something went wrongg",
          error: errors,
        });
      }

      // ✅ Sequelize Validation or Unique Constraint Errors
      if (err instanceof ValidationError || err instanceof UniqueConstraintError) {
        const errors = err.errors.map((e) => ({
          message: e.message,
        }));

        return reply.status(400).send({
          success: false,
          message: "something went wrong",
          error: errors,
        });
      }

      // ✅ Custom error with statusCode
      if (err instanceof customError || (err.statusCode && err.message)) {
        return reply.status(err.statusCode || 400).send({
          success: false,
          message: "something went wrong",
          error: [{ message: err.message }],
        });
      }

      // ✅ Unknown error
      return reply.status(500).send({
        success: false,
        message: "something went wrong",
        error: [{ message: err.message || "Internal Server Error" }],
      });
    }
  };
};

module.exports = { try_catch };
