'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.removeColumn('exam_results', 'student_id');
    await queryInterface.addColumn('exam_results', 'student_enrollment_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Student_Enrollments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    
    await queryInterface.removeColumn('result_quiz', 'student_id');
    await queryInterface.addColumn('result_quiz', 'student_enrollment_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Student_Enrollments',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    
    await queryInterface.removeColumn('exam_results', 'student_enrollment_id');
    await queryInterface.addColumn('exam_results', 'student_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    
    await queryInterface.removeColumn('result_quiz', 'student_enrollment_id');
    await queryInterface.addColumn('result_quiz', 'student_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
};
