"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    static associate(models) {
      // Each question belongs to a subject
      Question.belongsTo(models.Subject, {
        foreignKey: "subject_id",
      });

      // Each question belongs to a subject
      Question.belongsTo(models.Subject, {
        foreignKey: "subject_id",
      });

      // ✅ Each question belongs to a course (missing relation)
      Question.belongsTo(models.Course, {
        foreignKey: "course_id",
      });
    }
  }

  Question.init(
    {
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      answer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      option1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      option2: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      option3: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      option4: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      img: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      added_by: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      question_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_image_option: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Question",
      tableName: "questions",
    }
  );

  return Question;
};
