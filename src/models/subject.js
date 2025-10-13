"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Subject extends Model {
    static associate(models) {
      this.hasMany(models.SubjectCourse, {  
        foreignKey: 'subject_id',
        onDelete: 'CASCADE',
      }),
       this.hasMany(models.emp_subj, {
          foreignKey: "employee_id",
          onDelete: "CASCADE",
        }),
        this.hasMany(models.QuestionPaper, {
        foreignKey: 'subject_id',
        onDelete: 'CASCADE'
        }),
         this.hasMany(models.Assignment, {
        foreignKey: 'subject_id',
        onDelete: 'CASCADE',
      }),
      this.belongsToMany(models.Course, {
        through: models.SubjectCourse,
        foreignKey: "subject_id",
        otherKey: "course_id",
      });
    }
  }

  Subject.init(
    {
      subject_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Subject",
      tableName: "Subjects",
      underscored: true,
    }
  );

  return Subject;
};
