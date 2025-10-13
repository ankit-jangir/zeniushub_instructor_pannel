'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Assignment extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // define association here
      Assignment.belongsTo(models.Session, { foreignKey: 'session_id', onDelete: 'CASCADE', });
      Assignment.belongsTo(models.Subject, { foreignKey: 'subject_id', onDelete: 'CASCADE', });
      Assignment.belongsTo(models.Course, { foreignKey: 'course_id', onDelete: 'CASCADE', });
      Assignment.belongsTo(models.Employee, { foreignKey: 'assign_by', onDelete: 'CASCADE', });

      this.hasMany(models.BatchAssignment, {
        foreignKey: 'assignment_id',
        onDelete: 'CASCADE',
      });
    
    }
  }
  Assignment.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,

    },

    total_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,

    },
    min_percentage: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      }
    },
    due_date: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
      }
    },
    is_result_dec: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    attachments: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Subject',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
      session_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Session',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Course',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },

    assign_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Employee',
        key: 'id'
      },
      onDelete: 'SET NULL'
    }
  }, {
    sequelize,
    modelName: 'Assignment',
    tableName: 'Assignments',
    underscored: true,
    timestamps: true
  });
  return Assignment;
};
