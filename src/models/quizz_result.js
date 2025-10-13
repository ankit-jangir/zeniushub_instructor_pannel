"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class result_quiz extends Model {
    static associate(models) {
     result_quiz.belongsTo(models.Student_Enrollment, {
  foreignKey: "student_enrollment_id",
});

      result_quiz.belongsTo(models.batch_Quizz, {
        foreignKey: "batch_quiz_id",
      });
//       result_quiz.belongsTo(models.Student, {
//   foreignKey: "student_id",
// });

    }
  }

  result_quiz.init(
    {
      student_enrollment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      batch_quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("attempted", "unattempted"),
        allowNull: false,
        defaultValue: "unattempted",
      },
      // is_result_declared: {
      //   type: DataTypes.BOOLEAN,
      //   allowNull: false,
      //   defaultValue: false,
      // },
      // result_date: {
      //   type: DataTypes.DATE,
      //   allowNull: true,
      // },
      marks_obtained: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      marks_percentage: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "result_quiz",
      tableName: "result_quiz",
      // underscored: true,
      timestamps: true,
    }
  );

  return result_quiz;
};
