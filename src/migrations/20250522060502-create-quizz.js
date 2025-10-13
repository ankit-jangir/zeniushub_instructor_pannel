"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("quizz", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      employee_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Employees", key: "id" },
        onDelete: "CASCADE",
      },
      // subject_id: {
      //   type: Sequelize.INTEGER,
      //   allowNull: true,
      //   references: { model: 'Subjects', key: 'id' },
      //   onDelete: 'CASCADE',
      //   onUpdate: 'CASCADE',
      // },

      subject_compostition: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      quizz_rules: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      quizz_timing: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      total_question: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      passing_percentage: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      time_period: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Courses", key: "id" },
        onDelete: "CASCADE",
      },
      total_marks: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      // batch_id: {
      //   type: Sequelize.ARRAY(Sequelize.INTEGER),
      //   allowNull: true,
      //   // No references or foreign keys on array columns
      // },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("quizz");
  },
};
