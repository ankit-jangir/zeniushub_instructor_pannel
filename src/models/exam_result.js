"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class exam_result extends Model {
    static associate(models) {
      // exam_result.belongsTo(models.Student, { foreignKey: "student_id" });
      exam_result.belongsTo(models.Student_Enrollment, { foreignKey: "student_enrollment_id" });
      // exam_result.belongsTo(models.Exam, { foreignKey: "exam_id" });
      exam_result.belongsTo(models.exam_batch, { foreignKey: "exam_batch_id" });
      // exam_result.belongsTo(models.category, { foreignKey: "category_id" });
      // exam_result.belongsTo(models.QuestionPaper, { foreignKey: "ques_paper_id" });
      // exam_result.hasMany(models.exam_batch, {
      //   foreignKey: 'exam_batch_id',
      //     onDelete: "CASCADE",
      // });
    }
  }

  exam_result.init(
    {
      student_enrollment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      exam_batch_id: {
        type: DataTypes.INTEGER,
        allowNull: false, 
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      marks_obtained: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      student_result: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pass", "fail", "not attempted"), 
        allowNull: false,
        defaultValue: "not attempted",
      },
      student_percent: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      result_dec_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "exam_result",
      tableName: "exam_results",
      timestamps: true,
    }
  );

  return exam_result;
};
