"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove columns from result_quiz
    await queryInterface.removeColumn("result_quiz", "result_date");
    await queryInterface.removeColumn("result_quiz", "is_result_declared");

    // Add columns to quizz
    await queryInterface.addColumn("quizz", "result_date", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.addColumn("quizz", "is_result_declared", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Add columns back to result_quiz
    await queryInterface.addColumn("result_quiz", "result_date", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("result_quiz", "is_result_declared", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    // Remove columns from quizz
    await queryInterface.removeColumn("quizz", "result_date");
    await queryInterface.removeColumn("quizz", "is_result_declared");
  },
};
