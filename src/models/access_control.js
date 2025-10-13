'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AccessControl extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.Department, {
        foreignKey: 'access_control',
        onDelete: 'CASCADE',
      });
    }
  }

  AccessControl.init(
    {

      name: {
        type: DataTypes.STRING,
        allowNull: false, // Set to false if the name is required
      },
    },
    {
      sequelize,
      modelName: 'AccessControl',
      tableName: 'AccessControls', // Optional: to define table name explicitly
      timestamps: true, // Adds createdAt and updatedAt fields
    }
  );

  return AccessControl;
};
