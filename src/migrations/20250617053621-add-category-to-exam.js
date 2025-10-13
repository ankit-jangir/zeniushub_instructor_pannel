'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("exams", "category_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "category", 
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("exams", "category_id");
  },
};

