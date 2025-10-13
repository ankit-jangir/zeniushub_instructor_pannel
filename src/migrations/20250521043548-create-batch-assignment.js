'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BatchAssignments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      batch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Batches',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      assignment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Assignments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
       result_dec: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BatchAssignments');
  } 
};
