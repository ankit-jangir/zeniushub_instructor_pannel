const { Queue } = require('bullmq');
const client = require('../config/redis');
const quizQueue = new Queue('quizQueue', { connection :client});

module.exports = { quizQueue };
