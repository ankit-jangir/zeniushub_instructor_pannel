"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class batch_Quizz extends Model {
    static associate(models) {
      batch_Quizz.belongsTo(models.Batches, { foreignKey: "batch_id" });
      batch_Quizz.belongsTo(models.quizz, { foreignKey: "quiz_id" });
      batch_Quizz.hasMany(models.result_quiz, {foreignKey: "batch_quiz_id"});
    }
  }

  batch_Quizz.init(
    {
      batch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "batch_Quizz",
      tableName: "batch_Quizz",
      underscored: true,
      timestamps: true,
    }
  );

  return batch_Quizz;
};
