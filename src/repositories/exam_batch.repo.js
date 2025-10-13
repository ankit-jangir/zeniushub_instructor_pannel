const { CrudRepository } = require('./crude.repo');
const { exam_batch, Batches, Course, Subject } = require('../models');
const { Student } = require('../models/index');
const { exam_result } = require('../models/index');
const { Student_Enrollment } = require('../models/index');
const { Exam, SubjectCourse } = require('../models/index');

class ExamBatchRepository extends CrudRepository {
  constructor() {
    super(exam_batch);
  }

  async accessdata(id) {
    const result = await exam_batch.findOne({
      where: { id: id },
      include: [
        {
          model: Batches,
          attributes: ['id', 'BatchesName'],
        }
      ]
    });

    return result;
  }






  // async getbatchdetailsbyId(batchid) {
  //   const data = await exam_batch.findAll({
  //     include: [
  //       {
  //         model: exam_result,
  //         where: batchid ? { exam_batch_id: batchid } : undefined,
  //         attributes: ["student_id"],
  //         required: true,
  //         include: [
  //           {
  //             model: Student,
  //             attributes: ['id', 'name'],
  //             include: [
  //               {
  //                 model: Batches,
  //                 attributes: ["BatchesName"],
  //                   include: [
  //               {
  //                 model: Course,
  //                 attributes:["course_name"]
  //               }
  //             ]
  //               }
  //             ]
  //           }
  //         ]

  //       },
  //       {
  //         model: Exam,
  //          include: [
  //         {
  //           model: Subject, 
  //           attributes: ["subject_name"]
  //         }
  //       ]
  //       },
  //     ]
  //   });

  //   return data
  // }

  // async getbatchdetailsbyId(batchid) {
  //   const data = await exam_batch.findAll({
  //     include: [
  //       {
  //         model: exam_result,
  //         where: batchid ? { exam_batch_id: batchid } : undefined,
  //         required: true,
  //         include: [
  //           {
  //             model: Student_Enrollment,
  //             include: [
  //               {
  //                 model: Batches,
  //                 attributes: ["BatchesName"],
  //                 include: [
  //                   {
  //                     model: Course,
  //                     attributes: ["course_name"],
  //                   },
  //                 ]
  //               },
  //               {
  //                 model: Student,   // Student include
  //                 attributes: ["id", "name"]
  //               },
                


  //             ]
  //           },
  //         ]
  //       },
  //       {
  //         model: Exam,

  //         // include: [
  //         //   {
  //         //     model: Subject,
  //         //     attributes: ["subject_name"]
  //         //   }
  //         // ]
  //       }
  //     ]
  //   });
  //   return data
  //   const formatted = [];
  //   console.log("&&&&&&&&&&&&&&&&&&&&&&", data, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6");
  //   console.log("&&&&&&&&&&&&&&&&&&&&&&", data[0].exam_results, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6");

  //   data.forEach(item => {
  //     const exam = item.Exam;
  //     // console.log("&&&&&&&&&&&&&&&&&&&&&&",exam,"^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6");
  //     item.exam_results.forEach(result => {
  //       const studentEnrollment = result.Student_Enrollment;
  //       // console.log("&&&&&&&&&&&&&&&&&&&&&&",result.Student_Enrollment,"^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6");
  //       // console.log("&&&&&&&&&&&&&&&&&&&&&&",result.Student_Enrollment.batch_id,"^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6");

  //       // ⚠ Check if Student_Enrollment exists
  //       if (!studentEnrollment) return;

  //       const student = studentEnrollment.Student;

  //       formatted.push({
  //         id: item.id,
  //         exam_id: item.exam_id,
  //         batch_id: item.batch_id,

  //         // Exam details
  //         subject_id: exam?.subject_id ?? null,
  //         course_id: exam?.course_id ?? null,
  //         category_id: exam?.category_id ?? null,
  //         exam_name: exam?.exam_name ?? null,
  //         total_marks: exam?.total_marks ?? null,
  //         pass_percent: exam?.pass_percent ?? null,
  //         ques_paper: exam?.ques_paper ?? null,
  //         subject_name: exam?.Subject?.subject_name ?? null,
  //         is_result_dec: exam?.is_result_dec ?? null,
  //         start_time: exam?.start_time ?? null,
  //         end_time: exam?.end_time ?? null,
  //         employee_id: exam?.employee_id ?? null,
  //         schedule_date: exam?.schedule_date ?? null,
  //         result_dec_date: exam?.result_dec_date ?? null,

  //         // Student details
  //         student_id: studentEnrollment?.student_id ?? null,
  //         student_name: student?.name ?? null, // ✅ safe now
  //         course_name: studentEnrollment?.Batch?.Course?.course_name ?? null,

  //         // Batch
  //         batch: [
  //           {
  //             batch_name: studentEnrollment?.Batch?.BatchesName ?? null
  //           }
  //         ]
  //       });
  //     });
  //   });

  //   return formatted;
  // }








  async getbatchdetailsbyId(batchid) {
    const data = await exam_batch.findAll({
      include: [
        {
          model: exam_result,
          where: batchid ? { exam_batch_id: batchid } : undefined,
          required: true,
          include: [
            {
              model: Student_Enrollment,
              include: [
                {
                  model: Batches,
                  attributes: ["BatchesName"],
                  include: [
                    {
                      model: Course,
                      attributes: ["course_name"],
                    },
                  ]
                },
                {
                  model: Student,   // Student include
                  attributes: ["id", "name"]
                },
              ]
            },
          ]
        },
        {
  model: Exam,
  attributes: [
    "id",
    "exam_name",
    "subject_id",
    "course_id",
    "category_id",
    "total_marks",
    "pass_percent",
    "ques_paper",
    "is_result_dec",
    "start_time",
    "end_time",
    "employee_id",
    "schedule_date",
    "result_dec_date"
  ],
  include: [
    {
      model: Subject,
      attributes: ["id", "subject_name"]
    }
  ]
}

      ]
    });

    // ✅ Remove "return data" from here
    const formatted = [];
    console.log("RAW DATA:", data);

    data.forEach(item => {
      const exam = item.Exam;

      item.exam_results.forEach(result => {
        const studentEnrollment = result.Student_Enrollment;
        if (!studentEnrollment) return;

        const student = studentEnrollment.Student;

        formatted.push({
          id: item.id,
          exam_id: item.exam_id,
          batch_id: item.batch_id,

          // Exam details
          subject_id: exam?.subject_id ?? null,
          course_id: exam?.course_id ?? null,
          category_id: exam?.category_id ?? null,
          exam_name: exam?.exam_name ?? null,
          total_marks: exam?.total_marks ?? null,
          pass_percent: exam?.pass_percent ?? null,
          ques_paper: exam?.ques_paper ?? null,
          subject_name: exam?.Subject?.subject_name ?? null,
          is_result_dec: exam?.is_result_dec ?? null,
          start_time: exam?.start_time ?? null,
          end_time: exam?.end_time ?? null,
          employee_id: exam?.employee_id ?? null,
          schedule_date: exam?.schedule_date ?? null,
          result_dec_date: exam?.result_dec_date ?? null,

          // Student details
          student_id: studentEnrollment?.student_id ?? null,
          student_name: student?.name ?? null,
          course_name: studentEnrollment?.Batch?.Course?.course_name ?? null,

          // Batch
          batch: [
            {
              batch_name: studentEnrollment?.Batch?.BatchesName ?? null
            }
          ]
        });
      });
    });

    console.log("FORMATTED DATA:", formatted);
    return formatted;
}


}

module.exports = { ExamBatchRepository };
