'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {
      // Define associations here (e.g., Employee hasMany Courses, etc.)
      this.hasMany(models.EmployeeTask, {
        foreignKey: 'assigned_by',
        onDelete: 'CASCADE',
      });
    }
  }

  Admin.init({
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      }
    },
    email_verified_at: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
      }
    },
  
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    m_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^\d{10}$/,  // Ensures it's a 10-digit number
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive']],
      }
    },
    socket_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fcm_key: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Admin',
    tableName: 'Admins',
    timestamps: true,
    underscored: true,
  });

  return Admin;
};
