'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ResultAssignment extends Model {
    static associate(models) {
      ResultAssignment.belongsTo(models.BatchAssignment, {
        foreignKey: 'batch_assignment_id',
        onDelete: 'CASCADE',
      });
      ResultAssignment.belongsTo(models.Student_Enrollment, {
        foreignKey: 'student_enroll_id',
        onDelete: 'CASCADE',
      });
    }
  }

  ResultAssignment.init({
    batch_assignment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'BatchAssignment',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    student_enroll_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Student_Enrollment',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    attachments: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('unattempted', 'attempted'),
      allowNull: false,
      defaultValue: 'unattempted'
    },
    obtained_marks: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    result_declare_date: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
      }
    },
    number_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      max: 3
    }
  }, {
    sequelize,
    modelName: 'ResultAssignment',
    tableName: 'ResultAssignments',
    timestamps: true,
    underscored: true,
  });

  return ResultAssignment;
};
