'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Leads extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       Leads.belongsTo(models.category, { foreignKey: 'category_id',onUpdate: 'CASCADE' });
       Leads.belongsTo(models.Employee, { foreignKey: 'assign_to',onUpdate: 'CASCADE' });
       Leads.belongsTo(models.Session, { foreignKey: 'session_id', onUpdate: 'CASCADE' });
     }
  }

  Leads.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isNumeric: true,
          len: [10, 15],
        },
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          Model: "category",
          key:'id'
        }
      },
      status: {
        type: DataTypes.ENUM('Inconservation', 'Droped', 'Hot','Converted'),
        allowNull: false,
        defaultValue: 'Inconservation',
      },
      assign_to: {
        type: DataTypes.INTEGER,
        references:{
          model: "Employees",
          key: "id"
        }
      },
      time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: false, 
        references: {
          model: 'Sessions', 
          key: 'id',
        },
      }
    },
    {
      sequelize,
      modelName: 'Leads',
      tableName: "Leads",
      timestamps: true, // createdAt, updatedAt ko auto-manage karega
      underscored:true
    }
  );

  return Leads;
};
