const { Worker } = require('bullmq');
const { REDIS } = require('../config/server.config');

const connection = {
  host: REDIS.host,
  port: REDIS.port,
  password: REDIS.password,
};


//??*******************

const quizWorker = new Worker(
  'quizQueue',
  async (job) => {
    console.log('Processing quiz job:', job.name, job.data);
    
    // const {
    //   employee_id,
    //   subject_compostition,
    //   quizz_rules,
    //   quizz_timing,
    //   total_question,
    //   passing_percentage,
    //   time_period,
    //   title,
    //   course_id,
    // } = job.data;

    // await quizz.create({
    //   employee_id,
    //   subject_compostition,
    //   quizz_rules,
    //   quizz_timing,
    //   total_question,
    //   passing_percentage,
    //   time_period,
    //   title,
    //   course_id,
    // });

    console.log('Quiz saved successfully.');
  },
  { connection }
);

module.exports = quizWorker;
