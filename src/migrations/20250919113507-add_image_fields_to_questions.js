'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('questions', 'question_url', {
      type: Sequelize.STRING,
      allowNull: true,
      
    });

    await queryInterface.addColumn('questions', 'is_image_option', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('questions', 'question_url');
    await queryInterface.removeColumn('questions', 'is_image_option');
  },
};
