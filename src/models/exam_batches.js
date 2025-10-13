"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class exam_batches extends Model {
    static associate(models) {
      exam_batches.belongsTo(models.Exam, { foreignKey: 'exam_id' });
      exam_batches.belongsTo(models.Batches, { foreignKey: 'batch_id' });
      // exam_batches.belongsTo(models.exam_batch, { foreignKey: 'exam_batch_id' });
 exam_batches.hasMany(models.exam_result, {
        foreignKey: 'exam_batch_id',
          onDelete: "CASCADE",
      });
    }
  }

  exam_batches.init(
    {
      exam_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Exam",
          key: "id",
        },
      },
      batch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "exam_batch",
      tableName: "exam_batches",
      timestamps: true,
    }
  );

  return exam_batches;
};
