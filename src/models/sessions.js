'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      this.hasMany(models.Assignment, {
        foreignKey: 'session_id',
        onDelete: 'CASCADE',
      }),
        // define association here
        // Session.hasMany(models.Batches, { foreignKey: 'Session_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
        Session.hasMany(models.Leads, { foreignKey: 'session_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });

    }
  }

  Session.init(
    {
      session_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        min: 2000

      },
      is_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
    },
    {
      sequelize,
      modelName: 'Session',
      tableName: 'Sessions',
      underscored: true,
      timestamps: true
    }
  );

  return Session;
};
