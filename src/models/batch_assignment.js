'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BatchAssignment extends Model {
    static associate(models) {


      BatchAssignment.belongsTo(models.Batches, { foreignKey: 'batch_id', onDelete: 'CASCADE', });
  this.hasMany(models.ResultAssignment, {
        foreignKey: 'batch_assignment_id',
        onDelete: 'CASCADE',
      });
      BatchAssignment.belongsTo(models.Assignment, {
        foreignKey: 'assignment_id',

        onDelete: 'CASCADE',
      });
    }
  }

  BatchAssignment.init(
    {
      batch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Batches',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      assignment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Assignment',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
       result_dec: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    },
    {
      sequelize,
      modelName: 'BatchAssignment',
      tableName: 'BatchAssignments',
      underscored: true,
      timestamps: true
    }
  );

  return BatchAssignment;
};
