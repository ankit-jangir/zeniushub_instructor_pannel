"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Exam table me session_id add
    await queryInterface.addColumn("exams", "session_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Sessions", // 👈 ye table name hona chahiye (case-sensitive)
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // ya CASCADE, business logic ke hisaab se
    });

    // quizz table me session_id add
    await queryInterface.addColumn("quizz", "session_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Sessions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Assignments table me session_id add
    await queryInterface.addColumn("Assignments", "session_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Sessions",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // rollback ke time tino column remove
    await queryInterface.removeColumn("exams", "session_id");
    await queryInterface.removeColumn("quizz", "session_id");
    await queryInterface.removeColumn("Assignments", "session_id");
  },
};
