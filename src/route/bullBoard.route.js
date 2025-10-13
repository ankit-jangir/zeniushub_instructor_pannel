const express = require('express');
const router = express.Router();

const { createBullBoard } = require('@bull-board/api');
const { ExpressAdapter } = require('@bull-board/express');
const { BullMQAdapter } = require('@bull-board/api/dist/src/queueAdapters/bullMQ'); // ✅ Correct fallback path

const { quizQueue } = require('../queues/quizQueue');
const authenticate = require('../middleware/verifyToken');

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(quizQueue)],
  serverAdapter,
});

router.use('/admin/queues',authenticate, serverAdapter.getRouter());

module.exports = router;
