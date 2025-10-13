"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      this.hasMany(models.SubjectCourse, {
        foreignKey: "course_id",
        onDelete: "CASCADE",
      });
      // this.hasMany(models.Student, {
      //   foreignKey: "course_id",
      //   onDelete: "CASCADE",
      // });
      this.hasMany(models.Student_Enrollment,{
        foreignKey:"course_id",
        onDelete:"CASCADE"
      });
      this.hasMany(models.Batches, {
        foreignKey: "course_id",
        onDelete: "CASCADE",
      });
      this.hasMany(models.Assignment, {
        foreignKey: "course_id",
        onDelete: "CASCADE",
      });
      this.hasMany(models.quizz, { foreignKey: "course_id", onDelete: "CASCADE" });

      // this.belongsToMany(models.Employee, {
      //   through: models.SubjectCourse,
      //   foreignKey: "course_id",
      //   otherKey: "employee_id",
      // });

      this.belongsToMany(models.Employee, {
        through: models.emp_subj,
        foreignKey: "course_id",
        otherKey: "employee_id",
        as: "AnotherCourseEmployeeRelation", // must give alias to avoid conflict
      });
      this.hasMany(models.Exam, {
        foreignKey: "course_id",
        onDelete: "CASCADE",
      });
      this.belongsToMany(models.Subject, {
  through: models.SubjectCourse,
  foreignKey: "course_id",
  otherKey: "subject_id",
});
this.hasMany(models.Question, {
    foreignKey: 'course_id',
    onDelete: 'CASCADE',
  });
    }
  }

  Course.init(
    {
      course_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      course_type: {
        type: DataTypes.ENUM("offline", "online"),
        allowNull: true,
        defaultValue: "offline",
      },
      course_duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      banner: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      course_price: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      discount_price: {
        type: DataTypes.FLOAT,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
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
      modelName: "Course",
      tableName: "Courses",
      timestamps: true, // Ensures createdAt and updatedAt are automatically managed
      underscored: true,
    }
  );

  return Course;
};
