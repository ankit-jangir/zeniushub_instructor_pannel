"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Batches extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Batches.belongsTo(models.Course, { foreignKey: 'course_id', onUpdate: 'CASCADE' });
      // Batches.belongsTo(models.Session, { foreignKey: 'Session_id', targetKey: 'id', onUpdate: 'CASCADE', onDelete: 'CASCADE' });
      // Batches.hasMany(models.Student, { foreignKey: 'batch_id', onUpdate: 'CASCADE', onDelete: 'CASCADE' }),
      Batches.hasMany(models.emp_batch, {
        foreignKey: "employee_id", 
        onDelete: "CASCADE",
      });
      Batches.hasMany(models.batch_Quizz, { foreignKey: "batch_id" });
      Batches.hasMany(models.BatchAssignment, {
        foreignKey: "batch_id",
        onDelete: "CASCADE",
      });
      Batches.hasMany(models.exam_batch, {
        foreignKey: "batch_id",
        onDelete: "CASCADE",
      });
      Batches.hasMany(models.Student_Enrollment, { foreignKey: "batch_id" });
    }
  }

  Batches.init(
    {
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
      },

      BatchesName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      StartTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    EndTime: {
      type: DataTypes.TIME,
      allowNull: false
    },

      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
        allowNull: false,
      },
      // GracePeriod: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true
      // },
      // Session_id: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      // },
      // BatchFees: {
      //   type: DataTypes.FLOAT,
      //   allowNull: false
      // },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Batches",
      tableName: "Batches",
      timestamps: true,
      // underscored:true
    }
  );

  return Batches;
};
