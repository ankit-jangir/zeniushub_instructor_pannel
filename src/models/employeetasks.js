'use strict';
const {
  Model
} = require('sequelize');
 
module.exports = (sequelize, DataTypes) => {
  class EmployeeTask extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The models/index file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      EmployeeTask.belongsTo(models.Employee, { foreignKey: 'employee_id' });
      EmployeeTask.belongsTo(models.Admin, { foreignKey: 'assigned_by' });
    }
  }
    
  EmployeeTask.init({
    task_tittle: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[A-Za-z\s]+$/i,
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    attachments: {
      type: DataTypes.STRING, 
      allowNull: true
    },
    due_date: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
      }
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employees',
        key: 'id'
      }
    },
    assigned_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Admins',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('ongoing', 'completed', 'not started', 'not completed'),
      allowNull: false,
      defaultValue: 'not started'
    }
  }, {
    sequelize,
    modelName: 'EmployeeTask',
    tableName: 'EmployeeTasks',
    underscored: true,
    timestamps: true
  });

  return EmployeeTask;
};