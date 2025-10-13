'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Student_Enrollment extends Model {
    static associate(models) {
      // Associations
      this.hasMany(models.ResultAssignment, {
        foreignKey: "student_enroll_id",
        onDelete: "CASCADE",
      });
      Student_Enrollment.belongsTo(models.Student, {
        foreignKey: 'student_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      Student_Enrollment.belongsTo(models.Course, {
        foreignKey: 'course_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      Student_Enrollment.belongsTo(models.Batches, {
        foreignKey: 'batch_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      Student_Enrollment.belongsTo(models.Session, {
        foreignKey: 'session_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      Student_Enrollment.hasMany(models.exam_result, {
        foreignKey: 'student_enrollment_id',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      // Student_Enrollment.hasMany(models.Emi, {
      //   foreignKey: 'student_id',
      //   onDelete: 'CASCADE',
      // });
      Student_Enrollment.hasMany(models.Emi, {
        foreignKey: 'enrollment_id',
        onDelete: 'CASCADE',
      });

    }
  }

  Student_Enrollment.init({
    // firstName: DataTypes.STRING,
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Students',
        key: 'id',
      },
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id',
      },
    },
    batch_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Batches',
        key: 'id',
      },
    },
    session_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fees: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    discount_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    number_of_emi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    course_status: {
      type: DataTypes.ENUM('ongoing', 'dropped', 'promoted', 'repeat'),
      allowNull: false,
      defaultValue: 'ongoing'
    },
    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_DATE')
    },

  }, {
    sequelize,
    modelName: 'Student_Enrollment',
    tableName: 'Student_Enrollments',
  });


  return Student_Enrollment;
};
