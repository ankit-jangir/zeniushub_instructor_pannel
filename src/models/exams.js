"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Exam extends Model {
    static associate(models) {
      Exam.belongsTo(models.Subject, {
        foreignKey: "subject_id",
        onDelete: "CASCADE",
      });
      Exam.belongsTo(models.Course, {
        foreignKey: "course_id",
        onDelete: "CASCADE",
      });
      // Exam.belongsTo(models.QuestionPaper, { foreignKey: "ques_paper_id", onDelete: "CASCADE" });
      Exam.belongsTo(models.Employee, {
        foreignKey: "employee_id",
        onDelete: "CASCADE",
      });
    this.hasMany(models.exam_batch, {
  foreignKey: "exam_id",
  onDelete: "CASCADE",
  // as: 'exam_batch'  // 🔧 Add this
});

      Exam.belongsTo(models.category, {
        foreignKey: "category_id",
        onDelete: "SET NULL",
      });
      Exam.belongsTo(models.Session, {
  foreignKey: "session_id",
  onDelete: "CASCADE",
});
    }
  }

  Exam.init(
    {
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      exam_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      total_marks: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      pass_percent: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      ques_paper: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_result_dec: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      session_id: {
  type: DataTypes.INTEGER,
  allowNull: false,
},
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      schedule_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      result_dec_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Exam",
      tableName: "exams",
      timestamps: true,
    }
  );

  return Exam;
};
