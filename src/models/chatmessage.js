'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class chatMessage extends Model {
    static associate(models) {
      // Optional: Define associations if you have a Room model
      // this.belongsTo(models.Room, { foreignKey: 'room_id' });
      // No direct foreign key associations due to polymorphism
    }
  }

  chatMessage.init({
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sender_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiver_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    delivered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'chatMessage',
    tableName: 'chatMessages',
    timestamps: true,
    // underscored: true
  });

  return chatMessage;
};


