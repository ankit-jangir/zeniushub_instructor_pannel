"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Department extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Department.belongsTo(models.AccessControl, {
        foreignKey: "access_control",
      });
      this.hasMany(models.Employee, {
        foreignKey: "department",
        // otherKey: "department_id",
        // as: "Departments",
      });
    }
  }

  Department.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      access_control: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "Department",
      tableName: "Departments",
      timestamps: true, // Ensures createdAt and updatedAt are automatically managed
      underscored: true,
    }
  );

  return Department;
};
