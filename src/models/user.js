'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.chatMessage,{
        foreignKey:'sender_id',
      });

      User.hasMany(models.chatMessage,{
        foreignKey:'receiver_id',
      })
      // define association here
    }
  }
  User.init({
    userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
    role:{ 
     type:DataTypes.STRING,
     allowNull:false
    }
  }, {
    sequelize,
    modelName: 'User',
     tableName: 'Users',
  timestamps: true,
  underscored: true
  });
  return User;
};