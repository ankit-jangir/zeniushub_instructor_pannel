"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class EmployeeAttendence extends Model {
    static associate(models) {
      // An attendance record is linked to an Employee
      this.belongsTo(models.Employee, {
        foreignKey: "employee_id",
        onDelete: "CASCADE",
      });
    }
  }

  EmployeeAttendence.init(
    {
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Employees", // Ensure this matches the Employees table name
          key: "id",
        },
      },
      status: {
        type: DataTypes.ENUM("present", "half_day"),
        allowNull: false,
      },
      attendence_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      in_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      out_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "EmployeeAttendence",
      tableName: "EmployeeAttendences", // Explicitly specifying the table name
      timestamps: true,
      underscored: false, // Automatically convert column names to snake_case
    }
  );

  return EmployeeAttendence;
};
