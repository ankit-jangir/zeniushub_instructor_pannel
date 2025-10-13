'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Salary extends Model {
    static associate(models) {
      this.belongsTo(models.Employee, {
        foreignKey: 'emp_id',
        onDelete: 'CASCADE',
      });
    }
  }

  Salary.init(
    {
      emp_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Employees',
          key: 'id',
        },
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      present: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      absent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      halfday: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      from_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      to_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Salary',
      tableName: 'Salaries',
      timestamps: true,
      // underscored: true,
    }
  );

  return Salary;
};
