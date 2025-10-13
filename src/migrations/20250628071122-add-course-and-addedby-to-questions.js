'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('questions', 'course_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('questions', 'added_by', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees', 
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('questions', 'course_id');
    await queryInterface.removeColumn('questions', 'added_by');
  },
};
