'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class emp_subj extends Model {
    static associate(models) {
      // Association with Employee
      emp_subj.belongsTo(models.Employee, {
        foreignKey: 'employee_id',
        as: "employee"
        // as: 'employee'
      });

      // Association with Subject
      emp_subj.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
      
      });
      emp_subj.belongsTo(models.Course, {
        foreignKey: 'course_id',
      
      });
    }
  }

  emp_subj.init({
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    session_Id: {               // 🔹 add this
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'session_Id'       // or 'session_id' if DB column name is session_id
    }
  }, {
    sequelize,
    modelName: 'emp_subj',
    tableName: 'emp_subjs', // Sequelize pluralizes by default
  });

  return emp_subj;
};
