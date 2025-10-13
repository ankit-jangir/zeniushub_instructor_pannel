'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ResultAssignments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      batch_assignment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'BatchAssignments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      student_enroll_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Student_Enrollments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      attachments: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('unattempted', 'attempted'),
        allowNull: false,
        defaultValue: 'unattempted'
      },
      obtained_marks: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      result_declare_date: {
        type: Sequelize.STRING,
        allowNull: true
    
      },
      number_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ResultAssignments');
  }
};
