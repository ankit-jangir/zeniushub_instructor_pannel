"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("exams", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Subjects",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      exam_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      total_marks: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      pass_percent: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      ques_paper: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_result_dec: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      start_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      end_time: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Employees",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      schedule_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      result_dec_date: {
        type: Sequelize.DATEONLY,
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("exams");
  },
};
