"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("result_quiz", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "students", // Ensure this matches your actual students table name
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      batch_quiz_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "batch_Quizz", // ✅ Correct reference from your model
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("attempted", "unattempted"),
        allowNull: false,
        defaultValue: "unattempted",
      },
      is_result_declared: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      result_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      marks_obtained: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      marks_percentage: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("result_quiz");
  },
};
