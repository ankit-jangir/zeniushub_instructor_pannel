'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('batch_Quizz', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      batch_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Batches',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      quiz_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'quizz',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('batch_Quizz');
  }
};
