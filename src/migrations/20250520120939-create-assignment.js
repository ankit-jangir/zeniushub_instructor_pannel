'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Assignments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      total_marks: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      min_percentage: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      due_date: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_result_dec: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      attachments: {
        type: Sequelize.STRING,
        allowNull: true
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Subjects',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      assign_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Employees',
          key: 'id'
        },
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('Assignments');
  }
};
