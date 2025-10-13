"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here (e.g., Employee hasMany Courses, etc.)
      this.hasMany(models.EmployeeTask, {
        foreignKey: "employee_id",
        onDelete: "CASCADE",
      }),
        this.hasMany(models.emp_batch, {
          foreignKey: "employee_id",
          onDelete: "CASCADE",
        });
      this.hasMany(models.emp_subj, {
        foreignKey: "employee_id",
        as: "subjects",
        onDelete: "CASCADE",
      });
      Employee.belongsTo(models.Department, {
        foreignKey: 'department',
        // as: 'department' // optional, but good for clarity
      });

      Employee.hasMany(models.Salary, {
        foreignKey: 'emp_id',
        as: 'salaries'
      });
    }
  }

  Employee.init(
    {
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      highest_qualification: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      institution_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contact_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      emergency_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date_of_birth: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      // Address Details
      residential_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      district: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Active",
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      end_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      permanent_address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      permanent_district: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      permanent_state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      permanent_pincode: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      // Control Details
      department: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false,
        references: {
          model: "Departments",
          key: "id",
        },
      },

      // CTC Management
      salary: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      joining_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      // Bank Account Details
      account_number: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ifsc_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      account_holder_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fcm_key: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      socket_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_path:{
        type:DataTypes.STRING,
        allowNull:true
      }
    },
    {
      sequelize,
      modelName: "Employee",
      tableName: "Employees",
      timestamps: true, // Ensures createdAt and updatedAt are automatically managed
      underscored: true,
    }
  );

  return Employee;
};

