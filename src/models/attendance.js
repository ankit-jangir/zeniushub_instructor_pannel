  module.exports = (sequelize, DataTypes) => {
    const Attendance = sequelize.define('Attendance', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      enrollment_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: 'students', // Make sure your student table is named 'students'
          key: 'enrollment_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: DataTypes.ENUM('present', 'absent', 'half day'),
        allowNull: false,
      },
      attendance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      in_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      out_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
    }, {
      modelName:"Attendance",
      tableName: 'attendances',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['enrollment_id', 'attendance_date'],
        }
      ]
    });

    Attendance.associate = (models) => {
      Attendance.belongsTo(models.Student, {
        foreignKey: 'enrollment_id',
        targetKey: 'enrollment_id',
      });
    };

    return Attendance;
  };
