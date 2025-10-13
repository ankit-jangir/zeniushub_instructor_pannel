'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentReceipt extends Model {
    static associate(models) {
      PaymentReceipt.belongsTo(models.Student, {
        foreignKey: 'student_id',
        as: 'student',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });

      // ❌ emi_id removed, so association also removed
    }
  }

  PaymentReceipt.init({
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    receipt_url: {
      type: DataTypes.STRING,
      defaultValue:null,
      allowNull: true,
    },
    serial_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: "TEMP"
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }

  }, {
    sequelize,
    modelName: 'PaymentReceipt',
    tableName: 'PaymentReceipts',
    timestamps: true,
    hooks: {
      beforeValidate: async (receipt, options) => {
        if (!receipt.serial_no || receipt.serial_no === "TEMP") {
          const lastReceipt = await sequelize.models.PaymentReceipt.findOne({
            order: [[sequelize.literal("CAST(SUBSTRING(serial_no, 4) AS INTEGER)"), "DESC"]],
            attributes: ["serial_no"]
          });

          let newSerial;
          if (lastReceipt && lastReceipt.serial_no) {
            const lastNumber = parseInt(lastReceipt.serial_no.replace("INV", ""));
            newSerial = `INV${lastNumber + 1}`;
          } else {
            newSerial = "INV1001";
          }

          receipt.serial_no = newSerial;
        }
      }
    }
  });

  return PaymentReceipt;
};


