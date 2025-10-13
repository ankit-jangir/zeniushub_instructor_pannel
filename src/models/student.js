// "use strict";
// const { Model } = require("sequelize");
// const bcrypt = require("bcryptjs");
// // const redis = require("../config/redis.config"); // Import Redis instance

// module.exports = (sequelize, DataTypes) => {
//   class Student extends Model {
//     static associate(models) {
//       this.hasMany(models.PaymentReceipt, {
//         foreignKey: "student_id",
//         onDelete: "CASCADE",
//       });
//       Student.belongsTo(models.Batches, {
//         foreignKey: "batch_id",
//         onUpdate: "CASCADE",
//       });
//       Student.belongsTo(models.Course, {
//         foreignKey: "course_id",
//         onUpdate: "CASCADE",
//       });

//       this.hasMany(models.ResultAssignment, {
//         foreignKey: "student_id",
//         onDelete: "CASCADE",
//       });
//       this.hasMany(models.Emi, {
//         foreignKey: "student_id",
//         onDelete: "CASCADE",
//       });
//       this.hasMany(models.marksheet, {
//         foreignKey: "student_id",
//         onDelete: "SET NULL",
//       });
//     }
//   }

//   Student.init(
//     {
//       course_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//           model: "courses",
//           key: "id",
//         },
//       },
//       batch_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//           model: "batches",
//           key: "id",
//         },
//       },
//       enrollment_id: {
//         type: DataTypes.STRING,
//         allowNull: true,
//         unique: true,
//       },
//       name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         validate: {
//           notEmpty: { msg: "Name cannot be empty" },
//           len: {
//             args: [3, 50],
//             msg: "Name must be between 3 to 50 characters",
//           },
//         },
//       },
//       address: {
//         type: DataTypes.TEXT,
//         allowNull: false,
//       },
//       adhar_no: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true,
//         validate: {
//           isNumeric: { msg: "Aadhaar number must be numeric" },
//           len: {
//             args: [12, 12],
//             msg: "Aadhaar number must be exactly 12 digits",
//           },
//         },
//       },
//       adhar_front_back: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       pancard_no: {
//         //optional
//         type: DataTypes.STRING,
//         allowNull: true,
//         unique: true,
//         validate: {
//           is: {
//             args: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
//             msg: "Invalid PAN card format",
//           },
//         },
//       },
//       pancard_front_back: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       email: {
//         //optional
//         type: DataTypes.STRING,
//         allowNull: true,
//         unique: true,
//         validate: {
//           isEmail: { msg: "Invalid email format" },
//         },
//       },
//       password: {
//         type: DataTypes.STRING,
//         allowNull: true,
//         validate: {
//           isStrongPassword(value) {
//             if (
//               value &&
//               !/^(?=.[A-Za-z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
//                 value
//               )
//             ) {
//               throw new Error(
//                 "Password must be at least 8 characters long and contain at least one letter, one number, and one special character."
//               );
//             }
//           },
//         },
//       },
//       contact_no: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true,
//         validate: {
//           isNumeric: { msg: "Contact number must contain only numbers" },
//           len: {
//             args: [10, 10],
//             msg: "Contact number must be exactly 10 digits",
//           },
//         },
//       },
//       father_name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       mother_name: {
//         type: DataTypes.STRING,
//         allowNull: false,
//       },
//       parent_adhar_no: {
//         type: DataTypes.STRING,
//         allowNull: true,
//         unique: false,
//       },
//       parent_adhar_front_back: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       parent_account_no: {
//         type: DataTypes.STRING,
//         allowNull: true,
//         validate: {
//           isNumeric: { msg: "Account number must contain only numbers" },
//           len: {
//             args: [9, 18],
//             msg: "Account number must be between 9 to 18 digits",
//           },
//         },
//       },
//       ifsc_no: {
//         type: DataTypes.STRING,
//         allowNull: true,
//         validate: {
//           is: {
//             args: /^[A-Z]{4}0[A-Z0-9]{6}$/,
//             msg: "Invalid IFSC code format",
//           },
//         },
//       },
//       count_emi: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//       },
//       discount_amount: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//       },
//       final_amount: {
//         type: DataTypes.FLOAT,
//         allowNull: true,
//         defaultValue: 0,
//       },
//       status: {
//         type: DataTypes.ENUM("active", "inactive"),
//         defaultValue: "active",
//         allowNull: false,
//       },
//       invoice_status: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       created_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//         allowNull: false,
//       },
//       updated_at: {
//         type: DataTypes.DATE,
//         defaultValue: DataTypes.NOW,
//         allowNull: false,
//       },
//       socket_id: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       fcm_key: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       dob: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         validate: {
//           isBefore: {
//             args: new Date().toISOString().split("T")[0],
//             msg: "Date of Birth cannot be in the future",
//           },
//         },
//       },
//       serial_no: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       rt: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: false,
//         allowNull: false,
//       },
//       gender: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         validate: {
//           isIn: {
//             args: [["Male", "Female", "Other"]],
//             msg: "Gender must be either Male, Female, or Other",
//           },
//         },
//       },
//       ex_school: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//     },
//     {
//       sequelize,
//       modelName: "Student",
//       tableName: "students",
//       timestamps: true,
//       underscored: true,

//       hooks: {
//         beforeCreate: async (student) => {
//           const lastStudent = await Student.findOne({
//             order: [
//               [sequelize.literal("CAST(enrollment_id AS INTEGER)"), "DESC"],
//             ],
//             attributes: ["enrollment_id"],
//           });

//           student.enrollment_id = lastStudent?.enrollment_id
//             ? String(parseInt(lastStudent.enrollment_id) + 1)
//             : "1234001";

//           const salt = await bcrypt.genSalt(10);
//           student.password = await bcrypt.hash(student.enrollment_id, salt);
//         },
//       },
//     }
//   );

//   // Student.addHook("afterCreate", async (student, options) => {
//   //   try {
//   //     const batch = await sequelize.models.Batches.findByPk(student.batch_id);
//   //     const sessionId = batch?.Session_id;

//   //     await redis.set("student:check", "true"); // Ensure the flag is set

//   //     await redis.json.set(student:${student.id}, "$", {
//   //       status: student.status,
//   //       session_id: ${sessionId},
//   //       enrollment_id: student.enrollment_id,
//   //       serial_no: student.serial_no,
//   //       name: student.name || "",
//   //       father_name: student.father_name || "",
//   //       rt: student.rt !== undefined ? String(student.rt) : "false",
//   //     });

//   //     console.log(✅ Redis: student:${student.id} added);
//   //   } catch (err) {
//   //     console.error("❌ Redis insert error (afterCreate):", err.message);
//   //   }
//   // });

//   return Student;
// };


"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");
const redis = require("../config/redis.config"); // Import Redis instance
const customError = require("../utils/error.handle");
// const customError = require("../utils/error.handler");

module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    static associate(models) {
      this.hasMany(models.PaymentReceipt, {
        foreignKey: "student_id",
        onDelete: "CASCADE",
      });
      // Student.belongsTo(models.Batches, {
      //   foreignKey: "batch_id",
      //   onUpdate: "CASCADE",
      //   onDelete: "CASCADE",
      // });
      Student.hasMany(models.Attendance, {
        foreignKey: "enrollment_id",
        sourceKey: "enrollment_id",
        // as: "Attendances", // MUST MATCH your include alias
      });
      Student.hasMany(models.Student_Enrollment, {
        foreignKey: "student_id",
        // sourceKey: "enrollment_id",
        // as: "Attendances", // MUST MATCH your include alias
      });
      // Student.belongsTo(models.Course, {
      //   foreignKey: "course_id",
      //   onUpdate: "CASCADE",
      //   onDelete: "CASCADE",
      // });
      // this.hasMany(models.Emi, {
      //   foreignKey: "student_id",
      //   onDelete: "CASCADE",
      // });
    }
  }

  Student.init(
    {
      // course_id: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      //   references: {
      //     model: "courses",
      //     key: "id",
      //   },
      // },
      // batch_id: {
      //   type: DataTypes.INTEGER,
      //   allowNull: false,
      //   references: {
      //     model: "batches",
      //     key: "id",
      //   },
      // },
      enrollment_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Name cannot be empty" },
          len: {
            args: [3, 50],
            msg: "Name must be between 3 to 50 characters",
          },
        },
      },
      joining_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      adhar_no: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isNumeric: { msg: "Aadhaar number must be numeric" },
          len: {
            args: [12, 12],
            msg: "Aadhaar number must be exactly 12 digits",
          },
        },
      },
      adhar_front_back: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pancard_no: {
        //optional
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          is: {
            args: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
            msg: "Invalid PAN card format",
          },
        },
      },
      pancard_front_back: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        //optional
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        // validate: {
        //   isEmail: { msg: "Invalid email format" },
        // },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isStrongPassword(value) {
            if (
              value &&
              !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                value
              )
            ) {
              throw new customError(
                "Password must be at least 8 characters long and contain at least one letter, one number, and one special character."
              );
            }
          },
        },
      },
      contact_no: {
        type: DataTypes.STRING,
        allowNull: true,
        // unique: false,
        validate: {
          isNumeric: {
            msg: "Contact number must contain only numbers",
          },
          len: {
            args: [10, 10],
            msg: "Contact number must be exactly 10 digits",
          },
          is: {
            args: /^[6-9]\d{9}$/,
            msg: "Contact number must be a valid Indian number starting with 6, 7, 8, or 9",
          },
        },
      },
      father_contact_no: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
        validate: {
          notEmpty: { msg: "Name cannot be empty" },
          isNumeric: {
            msg: "Father's contact number must contain only numbers",
          },
          len: {
            args: [10, 10],
            msg: "Father's contact number must be exactly 10 digits",
          },
        },
      },
      mother_contact_no: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
        validate: {
          notEmpty: { msg: "Name cannot be empty" },
          isNumeric: {
            msg: "Mother's contact number must contain only numbers",
          },
          len: {
            args: [10, 10],
            msg: "Mother's contact number must be exactly 10 digits",
          },
        },
      },

      father_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mother_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      parent_adhar_no: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
      },
      parent_adhar_front_back: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      parent_account_no: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isNumeric: { msg: "Account number must contain only numbers" },
          len: {
            args: [9, 18],
            msg: "Account number must be between 9 to 18 digits",
          },
        },
      },
      ifsc_no: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: {
            args: /^[A-Z]{4}0[A-Z0-9]{6}$/,
            msg: "Invalid IFSC code format",
          },
        },
      },
      // count_emi: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true,
      // },
      // discount_amount: {
      //   type: DataTypes.FLOAT,
      //   allowNull: true,
      // },
      // final_amount: {
      //   type: DataTypes.FLOAT,
      //   allowNull: true,
      //   defaultValue: 0,
      // },
      // status: {
      //   type: DataTypes.ENUM("active", "inactive"),
      //   defaultValue: "active",
      //   allowNull: false,
      // },
      // invoice_status: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
      socket_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fcm_key: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dob: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isBefore: {
            args: new Date().toISOString().split("T")[0],
            msg: "Date of Birth cannot be in the future",
          },
        },
      },
      // serial_no: {
      //   type: DataTypes.STRING,
      //   allowNull: true,
      // },
      rt: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [["Male", "Female", "Other"]],
            msg: "Gender must be either Male, Female, or Other",
          },
        },
      },
      ex_school: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profile_image: {
        type: DataTypes.STRING,
        allowNull: true,
        // validate: {
        //   isUrl: { msg: "Profile image must be a valid URL" },
        // },
      },
    },
    {
      sequelize,
      modelName: "Student",
      tableName: "students",
      timestamps: true,
      underscored: true,

      hooks: {
        beforeCreate: async (student) => {
          const lastStudent = await Student.findOne({
            order: [
              [sequelize.literal("CAST(enrollment_id AS INTEGER)"), "DESC"],
            ],
            attributes: ["enrollment_id"],
          });

          student.enrollment_id = lastStudent?.enrollment_id
            ? String(parseInt(lastStudent.enrollment_id) + 1)
            : "1234001";

          const salt = await bcrypt.genSalt(10);
          student.password = await bcrypt.hash(student.enrollment_id, salt);
        },
      },
    }
  );

  // Student.addHook("afterCreate", async (student, options) => {
  //   try {
  //     const batch = await sequelize.models.Batches.findByPk(student.batch_id);
  //     const sessionId = batch?.Session_id;

  //     await redis.set("student:check", "true"); // Ensure the flag is set

  //     await redis.json.set(`student:${student.id}`, "$", {
  //       status: student.status,
  //       session_id: `${sessionId}`,
  //       enrollment_id: student.enrollment_id,
  //       serial_no: student.serial_no,
  //       name: student.name || "",
  //       father_name: student.father_name || "",
  //       rt: student.rt !== undefined ? String(student.rt) : "false",
  //     });

  //     console.log(`✅ Redis: student:${student.id} added`);
  //   } catch (err) {
  //     console.error("❌ Redis insert error (afterCreate):", err.message);
  //   }
  // });

  return Student;
};

