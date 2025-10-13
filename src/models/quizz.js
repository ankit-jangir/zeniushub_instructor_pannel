"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class quizz extends Model {
    static associate(models) {
            quizz.belongsTo(models.Session, { foreignKey: 'session_id', onDelete: 'CASCADE', });
      quizz.belongsTo(models.Employee, { foreignKey: "employee_id" });
      quizz.belongsTo(models.Course, { foreignKey: "course_id" });
      // quizz.belongsTo(models.Subject, { foreignKey: 'subject_id' });
      // For batch_id as array, no direct belongsTo association (foreign key) here
      // You can create custom association or query batches separately if needed
            quizz.hasMany(models.batch_Quizz, { foreignKey: 'quiz_id', onUpdate: 'CASCADE', onDelete:'CASCADE' });

    }
  }

  quizz.init(
    {
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      subject_compostition: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      quizz_rules: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      quizz_timing: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      total_question: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      passing_percentage: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      session_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Session',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
      time_period: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total_marks: {
        type: DataTypes.FLOAT,
        allowNull: true,
      }, 
       is_result_declared: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      result_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "quizz",
      tableName: "quizz",
      underscored: true,
      timestamps: true,
    }
  );

  return quizz;
};
