"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class marksheet extends Model {
    static associate(models) {
      marksheet.belongsTo(models.Student, {
        foreignKey: 'student_id',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });

      marksheet.belongsTo(models.Session, {
        foreignKey: 'session_id',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });

      marksheet.belongsTo(models.category, {
        foreignKey: 'category_id',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      });
    }
  }

  marksheet.init(
    {
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "marksheet",
      tableName: "marksheet",
    }
  );

  return marksheet;
};
