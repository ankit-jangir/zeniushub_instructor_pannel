"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("exam_results", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      student_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "students",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      exam_batch_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "exam_batches",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false,
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      marks_obtained: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      student_result: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pass", "fail", "not attempted"),
        defaultValue:'not attempted'
      },
      student_percent: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      result_dec_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("exam_results");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_exam_results_status";'
    );
  },
};
