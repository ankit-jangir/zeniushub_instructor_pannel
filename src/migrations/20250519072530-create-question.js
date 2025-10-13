'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
     question: {
        type: Sequelize.TEXT('long'), 
        allowNull: false,
      },
      answer: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      option1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      option2: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      option3: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      option4: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Subjects', // make sure this table exists
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active',
        allowNull: false,
      },
      img: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('questions');
  },
};
