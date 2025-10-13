"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class QuestionPaper extends Model {
    static associate(models) {
      this.belongsTo(models.Subject, {
        foreignKey: "subject_id",
        onDelete: "CASCADE",
      });
      // QuestionPaper.hasMany(models.exam_result, {
      //   foreignKey: 'ques_paper_id',
      //     onDelete: "CASCADE",
      // });

    }
  }

  QuestionPaper.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull:false
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      pdf: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      set: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "QuestionPaper",
      tableName: "QuestionPapers",
      underscored: true,
    }
  );

  return QuestionPaper;
};
