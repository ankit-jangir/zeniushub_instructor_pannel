"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SubjectCourse extends Model {
    static associate(models) {
      SubjectCourse.belongsTo(models.Course, {
        foreignKey: "course_id",
        onUpdate: "CASCADE",
      });
      SubjectCourse.belongsTo(models.Subject, {
        foreignKey: "subject_id",
        onUpdate: "CASCADE",
      });
    }
  }

  SubjectCourse.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Subjects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "SubjectCourse",
      tableName: "SubjectCourses",
      underscored: true,
    }
  );

  return SubjectCourse;
};
