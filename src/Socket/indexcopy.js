const {
  chatMessage,
  Student,
  Employee,
  Student_Enrollment,
  emp_subj,
  sequelize,
} = require("../models");
const redisClient = require("../config/redis.config");
const { Op } = require("sequelize");

const userSockets = new Map();

const mapUserIdToId = async (userId, userType) => {
  try {
    if (userType === "instructor") {
      const employee = await Employee.findOne({
        where: { email: userId },
        attributes: ["id"],
      });
      if (!employee) throw new Error(`Invalid instructor ID: ${userId}`);
      console.log(`Mapped instructor userId ${userId} to id ${employee.id}`);
      return employee.id;
    } else if (userType === "student") {
      const enrollment = await Student_Enrollment.findOne({
        where: { id: userId },
        attributes: ["id"],
      });
      if (!enrollment) throw new Error(`Invalid enrollment ID: ${userId}`);
      console.log(`Mapped student userId ${userId} to enrollment id ${userId}`);
      return parseInt(userId); // Return enrollment ID as number
    } else {
      const parsedId = parseInt(userId);
      if (!isNaN(parsedId)) {
        const enrollment = await Student_Enrollment.findOne({
          where: { id: parsedId },
          attributes: ["id"],
        });
        if (enrollment) {
          console.log(`Mapped unknown userId ${userId} to enrollment id ${parsedId}`);
          return parsedId;
        }
      }
      const employee = await Employee.findOne({
        where: { email: userId },
        attributes: ["id"],
      });
      if (!employee) throw new Error(`Invalid user ID: ${userId}`);
      console.log(`Mapped unknown userId ${userId} to instructor id ${employee.id}`);
      return employee.id;
    }
  } catch (err) {
    console.error(`mapUserIdToId error for ${userId} (${userType}): ${err.message}`);
    throw err;
  }
};

const mapIdToUserId = async (id, type) => {
  try {
    if (type === "student") {
      const enrollment = await Student_Enrollment.findOne({
        where: { id },
        attributes: ["id"],
      });
      if (!enrollment) throw new Error(`No enrollment found for id: ${id}`);
      console.log(`Mapped student id ${id} to enrollment id ${id}`);
      return String(id);
    }
    if (type === "instructor") {
      const employee = await Employee.findOne({
        where: { id },
        attributes: ["email"],
      });
      if (!employee) throw new Error(`No instructor found for id: ${id}`);
      console.log(`Mapped instructor id ${id} to email ${employee.email}`);
      return employee.email;
    }
    throw new Error(`Invalid type: ${type}`);
  } catch (err) {
    console.error(`mapIdToUserId error for id ${id} (${type}): ${err.message}`);
    return `user${id}`;
  }
};

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    const heartbeatInterval = setInterval(async () => {
      if (socket.userId) {
        await redisClient.set(
          `user:${socket.userId}:status`,
          "online",
          "EX",
          86400
        );
        console.log(`Heartbeat: Updated Redis status for ${socket.userId}`);
      }
    }, 30000);

    const broadcastUserStatus = async (userId, isOnline, userType) => {
      try {
        console.log(
          `Starting broadcastUserStatus for ${userId} (${
            isOnline ? "online" : "offline"
          }, ${userType})`
        );
        let chatRooms = [];
        const redisRooms = await redisClient.smembers(`user:${userId}:rooms`);
        chatRooms = [...redisRooms];
        const messages = await chatMessage.findAll({
          where: {
            [Op.or]: [
              { sender_id: await mapUserIdToId(userId, userType) },
              { receiver_id: await mapUserIdToId(userId, userType) },
            ],
          },
          attributes: [
            "id",
            "sender_id",
            "sender_type",
            "receiver_id",
            "receiver_type",
            "message",
            "room_id",
            "createdAt",
            "delivered",
            "seen",
          ],
          limit: 50,
        });
        console.log(`Found ${messages.length} messages for ${userId}`);
        const messageRooms = await Promise.all(
          messages.map(async (m) => {
            const senderId = await mapIdToUserId(m.sender_id, m.sender_type);
            const receiverId = await mapIdToUserId(m.receiver_id, m.receiver_type);
            return [senderId, receiverId].sort().join("_");
          })
        );
        chatRooms = [...new Set([...chatRooms, ...messageRooms])];
        if (userType === "instructor") {
          const conversationKey = `conversation:${userId}`;
          const studentIds = await redisClient.hkeys(conversationKey);
          console.log(
            `Found ${studentIds.length} students in Redis for ${userId}: ${JSON.stringify(studentIds)}`
          );
          const convRooms = studentIds.map((studentId) =>
            [userId, studentId].sort().join("_")
          );
          chatRooms = [...new Set([...chatRooms, ...convRooms])];
        }
        console.log(`Chat rooms for ${userId}: ${JSON.stringify(chatRooms)}`);
        const statusPromises = chatRooms.map(async (room) => {
          console.log(
            `Broadcasting ${userId} ${isOnline ? "online" : "offline"} to ${room}`
          );
          return new Promise((resolve) => {
            io.to(room).emit("userStatus", { userId, isOnline }, () => {
              console.log(`Status for ${userId} acknowledged by ${room}`);
              resolve();
            });
          });
        });
        await Promise.all(statusPromises);
      } catch (err) {
        console.error(
          `Error broadcasting status for ${userId} (${userType}): ${err.message}`
        );
      }
    };

    socket.on("registerUser", async ({ userId }) => {
      console.log(`Attempting to register user: ${userId}`);
      if (!userId) {
        console.error(`Invalid userId: ${userId}`);
        socket.emit("error", { message: "Invalid userId" });
        return;
      }
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId).add(socket.id);
      socket.userId = userId;
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room: ${userId}`);
      let userType = "unknown";
      try {
        let user;
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId);
        if (isEmail) {
          user = await Employee.findOne({
            where: { email: userId },
            attributes: ["id", "email", "first_name"],
          });
          userType = user ? "instructor" : "unknown";
        } else {
          const parsedId = parseInt(userId);
          if (isNaN(parsedId)) {
            console.error(`Invalid enrollment ID: ${userId}`);
            socket.emit("error", { message: "Invalid enrollment ID" });
            return;
          }
          const enrollment = await Student_Enrollment.findOne({
            where: { id: parsedId },
            include: [{ model: Student, attributes: ["id", "enrollment_id", "name"] }],
            attributes: ["id", "course_id", "batch_id"],
          });
          user = enrollment ? enrollment.Student : null;
          userType = enrollment ? "student" : "unknown";
        }

        if (!user) {
          console.error(`Invalid user: ${userId}`);
          socket.emit("error", { message: "Invalid user" });
          return;
        }
        console.log(`${userType} ${userId} connected: ${socket.id}`);
        await redisClient.set(`user:${userId}:status`, "online", "EX", 86400);
        console.log(`Redis: user:${userId}:status = online`);
        const Model = userType === "student" ? Student : Employee;
        const where = userType === "student" ? { id: await mapUserIdToId(userId, userType) } : { email: userId };
        const socketId = typeof socket.id === "string" && socket.id.trim() !== "" ? socket.id : null;
        if (socketId) {
          await Model.update({ socket_id: socketId }, { where });
          console.log(`Database updated: socket_id for ${userId} to ${socketId}`);
        } else {
          console.warn(`Invalid socket.id for ${userId}: ${socket.id}`);
        }

        if (userType === "instructor") {
          const conversationKey = `conversation:${userId}`;
          const studentIds = await redisClient.hkeys(conversationKey);
          console.log(`Joining instructor ${userId} to ${studentIds.length} student rooms`);
          for (const studentId of studentIds) {
            const roomId = [userId, studentId].sort().join("_");
            socket.join(roomId);
            await redisClient.sadd(`user:${userId}:rooms`, roomId);
            await redisClient.sadd(`user:${studentId}:rooms`, roomId);
            console.log(`Instructor ${userId} joined room ${roomId}`);
            socket.emit("newStudent", { studentId });
          }
        }

        await broadcastUserStatus(userId, true, userType);
      } catch (err) {
        console.error(`Redis/DB error for ${userId}: ${err.message}`);
        socket.emit("error", { message: `Server error: ${err.message}` });
      }
    });

    socket.on("getUserStatus", async ({ targetId }) => {
      try {
        const redisStatus = await redisClient.get(`user:${targetId}:status`);
        const isOnline = redisStatus === "online";
        console.log(`Emitting status for ${targetId}: ${isOnline ? "online" : "offline"} to ${socket.userId}`);
        socket.emit("userStatus", { userId: targetId, isOnline });
      } catch (err) {
        console.error(`Error fetching status for ${targetId}: ${err.message}`);
        socket.emit("error", { message: `Failed to fetch status: ${err.message}` });
      }
    });

    socket.on(
      "joinRoom",
      async ({ userId, userType, targetId, offset = 0, limit = 20 }) => {
        if (!userId || !targetId) {
          socket.emit("error", { message: "Invalid userId or targetId" });
          return console.error(`Invalid joinRoom: ${JSON.stringify({ userId, userType, targetId })}`);
        }
        try {
          let target, user, courseId;
          const targetType = userType === "student" ? "instructor" : "student";

          if (userType === "student") {
            const enrollment = await Student_Enrollment.findOne({
              where: { id: userId },
              include: [{ model: Student, attributes: ["id", "enrollment_id", "name"] }],
              attributes: ["id", "course_id", "batch_id"],
            });
            if (!enrollment) throw new Error(`Invalid student enrollment ID: ${userId}`);
            user = enrollment.Student;
            courseId = enrollment.course_id;
          } else {
            user = await Employee.findOne({
              where: { email: userId },
              attributes: ["id", "email", "first_name"],
            });
            if (!user) throw new Error(`Invalid instructor ID: ${userId}`);
          }

          if (targetType === "student") {
            const enrollment = await Student_Enrollment.findOne({
              where: { id: targetId },
              include: [{ model: Student, attributes: ["id", "enrollment_id", "name"] }],
              attributes: ["id", "course_id", "batch_id"],
            });
            if (!enrollment) throw new Error(`Invalid student enrollment ID: ${targetId}`);
            target = enrollment.Student;
            if (userType === "instructor") {
              courseId = enrollment.course_id;
            }
          } else {
            target = await Employee.findOne({
              where: { email: targetId },
              attributes: ["id", "email", "first_name"],
            });
            if (!target) throw new Error(`Invalid instructor ID: ${targetId}`);
          }

          const roomId = [userId, targetId].sort().join("_");
          socket.join(roomId);
          await redisClient.sadd(`user:${userId}:rooms`, roomId);
          await redisClient.sadd(`user:${targetId}:rooms`, roomId);
          console.log(`${userType} ${userId} joined ${roomId}`);

          let isTargetOnline = false;
          try {
            const redisStatus = await redisClient.get(`user:${targetId}:status`);
            isTargetOnline = redisStatus === "online";
          } catch (redisErr) {
            console.error(`Redis error for user:${targetId}:status: ${redisErr.message}`);
          }
          socket.emit("userStatus", { userId: targetId, isOnline: isTargetOnline });

          const senderId = await mapUserIdToId(userId, userType);
          const receiverId = await mapUserIdToId(targetId, targetType);
          const total = await chatMessage.count({
            where: {
              [Op.or]: [
                {
                  sender_id: senderId,
                  sender_type: userType,
                  receiver_id: receiverId,
                  receiver_type: targetType,
                },
                {
                  sender_id: receiverId,
                  sender_type: targetType,
                  receiver_id: senderId,
                  receiver_type: userType,
                },
              ],
              room_id: null,
            },
          });

          const messages = await chatMessage.findAll({
            where: {
              [Op.or]: [
                {
                  sender_id: senderId,
                  sender_type: userType,
                  receiver_id: receiverId,
                  receiver_type: targetType,
                },
                {
                  sender_id: receiverId,
                  sender_type: targetType,
                  receiver_id: senderId,
                  receiver_type: userType,
                },
              ],
              room_id: null,
            },
            attributes: [
              "id",
              "sender_id",
              "sender_type",
              "receiver_id",
              "receiver_type",
              "message",
              "room_id",
              "createdAt",
              "delivered",
              "seen",
            ],
            order: [["createdAt", "DESC"]],
            limit: Math.min(limit, total),
            offset: 0,
          });

          const formattedMessages = await Promise.all(
            messages.reverse().map(async (msg) => {
              const senderUserId = await mapIdToUserId(msg.sender_id, msg.sender_type);
              const receiverUserId = await mapIdToUserId(msg.receiver_id, msg.receiver_type);
              console.log(`Formatting message ${msg.id}: sender=${senderUserId}, receiver=${receiverUserId}`);
              return {
                userId: senderUserId,
                targetId: receiverUserId,
                userType: msg.sender_type,
                content: msg.message,
                timestamp: msg.createdAt.toLocaleTimeString(),
                messageId: msg.id,
                seen: msg.seen,
                delivered: msg.delivered,
              };
            })
          );

          console.log(
            `History to ${userId} for ${roomId}: ${formattedMessages.length} messages, total=${total}`
          );
          socket.emit("messageHistory", { messages: formattedMessages, total });

          await chatMessage.update(
            { delivered: true },
            {
              where: {
                receiver_id: senderId,
                receiver_type: userType,
                delivered: false,
              },
            }
          );

          formattedMessages
            .filter((msg) => msg.targetId === userId && !msg.delivered)
            .forEach((msg) => {
              io.to(roomId).emit("messageDelivered", {
                messageId: msg.messageId,
                userId,
              });
            });
        } catch (err) {
          console.error(`History error: ${err.message}`);
          socket.emit("error", { message: `Failed to load history: ${err.message}` });
        }
      }
    );

    socket.on("sendMessage", async (messageData) => {
      if (!messageData.userId || !messageData.targetId || !messageData.content) {
        socket.emit("error", { message: "Invalid message data" });
        return console.error(`Invalid messageData: ${JSON.stringify(messageData)}`);
      }
      try {
        let target, user, courseId;
        const targetType = messageData.userType === "student" ? "instructor" : "student";
        const senderId = await mapUserIdToId(messageData.userId, messageData.userType);
        const receiverId = await mapUserIdToId(messageData.targetId, targetType);
        console.log(`sendMessage: senderId=${senderId}, receiverId=${receiverId}, userType=${messageData.userType}, targetType=${targetType}`);

        if (messageData.userType === "student") {
          const enrollment = await Student_Enrollment.findOne({
            where: { id: messageData.userId },
            include: [{ model: Student, attributes: ["id", "enrollment_id", "name"] }],
            attributes: ["id", "course_id", "batch_id"],
          });
          if (!enrollment) {
            socket.emit("error", { message: "Invalid student or no enrollment found" });
            return console.error(`No enrollment for userId: ${messageData.userId}`);
          }
          console.log(`Enrollment for userId ${messageData.userId}: ${JSON.stringify(enrollment.toJSON())}`);
          if (!enrollment.course_id) {
            socket.emit("error", { message: "No course assigned to this student" });
            return console.error(`No course_id for userId: ${messageData.userId}`);
          }
          if (!enrollment.batch_id) {
            socket.emit("error", { message: "No batch assigned to this student" });
            return console.error(`No batch_id for userId: ${messageData.userId}`);
          }
          courseId = Number(enrollment.course_id);
          if (isNaN(courseId)) {
            socket.emit("error", { message: "Invalid course ID" });
            return console.error(`Invalid course_id for userId: ${messageData.userId}`);
          }
          user = enrollment.Student;
          target = await Employee.findOne({
            where: { email: messageData.targetId },
            include: [
              {
                model: emp_subj,
                attributes: [],
                required: false,
                where: { course_id: courseId },
              },
            ],
            attributes: ["id", "email", "first_name"],
          });
          if (!target) {
            socket.emit("error", { message: "Instructor not found" });
            return console.error(`No instructor found for targetId: ${messageData.targetId}`);
          }
        } else {
          user = await Employee.findOne({
            where: { email: messageData.userId },
            include: [{ model: emp_subj, attributes: [], required: false }],
            attributes: ["id", "email", "first_name"],
          });
          if (!user) {
            socket.emit("error", { message: "Instructor not found" });
            return console.error(`No instructor found for userId: ${messageData.userId}`);
          }
          const enrollment = await Student_Enrollment.findOne({
            where: { id: messageData.targetId },
            include: [{ model: Student, attributes: ["id", "enrollment_id", "name"] }],
            attributes: ["id", "course_id", "batch_id"],
          });
          if (!enrollment) {
            socket.emit("error", { message: "Invalid student or no enrollment found" });
            return console.error(`No enrollment for targetId: ${messageData.targetId}`);
          }
          if (!enrollment.batch_id) {
            socket.emit("error", { message: "No batch assigned to this student" });
            return console.error(`No batch_id for targetId: ${messageData.targetId}`);
          }
          target = enrollment.Student;
        }
        if (!target || !user) {
          socket.emit("error", { message: `Invalid ${!target ? "target" : "user"}` });
          return console.error(`Invalid ${!target ? "targetId" : "userId"}: ${!target ? messageData.targetId : messageData.userId}`);
        }

        const roomId = [messageData.userId, messageData.targetId].sort().join("_");
        let isTargetOnline = false;
        try {
          const redisStatus = await redisClient.get(`user:${messageData.targetId}:status`);
          isTargetOnline = redisStatus === "online";
          console.log(`Redis status for ${messageData.targetId}: ${redisStatus || "null"} (isTargetOnline: ${isTargetOnline})`);
        } catch (redisErr) {
          console.error(`Redis error for user:${messageData.targetId}:status: ${redisErr.message}`);
        }

        const savedMessage = await chatMessage.create({
          sender_id: senderId,
          sender_type: messageData.userType,
          receiver_id: receiverId,
          receiver_type: targetType,
          room_id: null,
          message: messageData.content,
          delivered: isTargetOnline,
          seen: false,
        });

        const formattedMessage = {
          userId: messageData.userId,
          targetId: messageData.targetId,
          userType: messageData.userType,
          content: messageData.content,
          timestamp: savedMessage.createdAt.toLocaleTimeString(),
          messageId: savedMessage.id,
          seen: savedMessage.seen,
          delivered: savedMessage.delivered,
        };

        await redisClient.lpush(`room:${roomId}:messages`, JSON.stringify(formattedMessage));
        await redisClient.ltrim(`room:${roomId}:messages`, 0, 99);

        if (messageData.userType === "student") {
          const instructorId = messageData.targetId;
          const studentId = messageData.userId;
          const conversation = await chatMessage.findOne({
            where: {
              [Op.or]: [
                {
                  sender_id: senderId,
                  receiver_id: receiverId,
                  sender_type: "student",
                  receiver_type: "instructor",
                },
                {
                  sender_id: receiverId,
                  receiver_type: "student",
                  receiver_id: senderId,
                  sender_type: "instructor",
                },
              ],
            },
            attributes: ["id"],
          });
          const redisExists = await redisClient.hexists(`conversation:${instructorId}`, studentId);
          if (!conversation && !redisExists) {
            console.log(`Notifying ${instructorId} of new student ${studentId}`);
            await redisClient.hset(`conversation:${instructorId}`, studentId, Date.now().toString());
            const instructorSockets = userSockets.get(instructorId) || new Set();
            for (const socketId of instructorSockets) {
              const instructorSocket = io.sockets.sockets.get(socketId);
              if (instructorSocket) {
                instructorSocket.join(roomId);
                await redisClient.sadd(`user:${instructorId}:rooms`, roomId);
                console.log(`Instructor ${instructorId} joined room ${roomId}`);
              }
            }
            io.to(instructorId).emit("newStudent", { studentId });
            console.log(`Emitted newStudent event to ${instructorId} for student ${studentId}`);
          }
        }

        console.log(`Broadcasting message to ${roomId}`);
        io.to(roomId).emit("receiveMessage", formattedMessage);
        if (isTargetOnline) {
          io.to(messageData.targetId).emit("messageDelivered", {
            messageId: savedMessage.id,
            userId: messageData.targetId,
          });
        }

        await broadcastUserStatus(messageData.userId, true, messageData.userType);
      } catch (err) {
        console.error(`Save error: ${err.message}`);
        socket.emit("error", { message: `Failed to send: ${err.message}` });
      }
    });

    socket.on("messageSeen", async ({ messageId, userId }) => {
      try {
        const message = await chatMessage.update(
          { seen: true },
          {
            where: {
              id: messageId,
              receiver_id: await mapUserIdToId(userId, "unknown"),
            },
          }
        );
        if (message[0]) {
          console.log(`Message ${messageId} seen by ${userId}`);
          const msg = await chatMessage.findOne({
            where: { id: messageId },
            attributes: ["id", "sender_id", "sender_type", "receiver_id", "receiver_type"],
          });
          const senderUserId = await mapIdToUserId(msg.sender_id, msg.sender_type);
          const receiverUserId = await mapIdToUserId(msg.receiver_id, msg.receiver_type);
          const roomId = [senderUserId, receiverUserId].sort().join("_");
          io.to(roomId).emit("messageSeen", { messageId, userId });
        }
      } catch (err) {
        console.error(`Seen error: ${err.message}`);
        socket.emit("error", { message: `Failed to mark seen: ${err.message}` });
      }
    });

    socket.on(
      "loadMoreMessages",
      async ({ userId, userType, targetId, offset, limit = 20 }) => {
        try {
          const targetType = userType === "student" ? "instructor" : "student";
          const senderId = await mapUserIdToId(userId, userType);
          const receiverId = await mapUserIdToId(targetId, targetType);
          const roomId = [userId, targetId].sort().join("_");

          const total = await chatMessage.count({
            where: {
              [Op.or]: [
                {
                  sender_id: senderId,
                  sender_type: userType,
                  receiver_id: receiverId,
                  receiver_type: targetType,
                },
                {
                  sender_id: receiverId,
                  sender_type: targetType,
                  receiver_id: senderId,
                  receiver_type: userType,
                },
              ],
              room_id: null,
            },
          });

          if (offset >= total) {
            console.log(`No more messages to load for ${userId}: offset=${offset}, total=${total}`);
            socket.emit("moreMessages", { messages: [], total });
            return;
          }

          const messages = await chatMessage.findAll({
            where: {
              [Op.or]: [
                {
                  sender_id: senderId,
                  sender_type: userType,
                  receiver_id: receiverId,
                  receiver_type: targetType,
                },
                {
                  sender_id: receiverId,
                  sender_type: targetType,
                  receiver_id: senderId,
                  receiver_type: userType,
                },
              ],
              room_id: null,
            },
            attributes: [
              "id",
              "sender_id",
              "sender_type",
              "receiver_id",
              "receiver_type",
              "message",
              "room_id",
              "createdAt",
              "delivered",
              "seen",
            ],
            order: [["createdAt", "DESC"]],
            offset,
            limit: Math.min(limit, total - offset),
          });

          const formattedMessages = await Promise.all(
            messages.reverse().map(async (msg) => {
              const senderUserId = await mapIdToUserId(msg.sender_id, msg.sender_type);
              const receiverUserId = await mapIdToUserId(msg.receiver_id, msg.receiver_type);
              console.log(`Formatting message ${msg.id}: sender=${senderUserId}, receiver=${receiverUserId}`);
              return {
                userId: senderUserId,
                targetId: receiverUserId,
                userType: msg.sender_type,
                content: msg.message,
                timestamp: msg.createdAt.toLocaleTimeString(),
                messageId: msg.id,
                seen: msg.seen,
                delivered: msg.delivered,
              };
            })
          );

          console.log(
            `More messages to ${userId}: ${formattedMessages.length} messages, offset=${offset}, total=${total}`
          );
          socket.emit("moreMessages", { messages: formattedMessages, total });
        } catch (err) {
          console.error(`Load more messages error: ${err.message}`);
          socket.emit("error", { message: `Failed to load more messages: ${err.message}` });
        }
      }
    );

    socket.on("disconnect", async () => {
      try {
        console.log(`Socket ${socket.id} disconnected`);
        clearInterval(heartbeatInterval);
        if (!socket.userId) {
          console.log(`No userId associated with socket ${socket.id}; likely disconnected before registration`);
          const student = await Student.findOne({
            where: { socket_id: socket.id },
            attributes: ["id", "enrollment_id"],
          });
          const employee = await Employee.findOne({
            where: { socket_id: socket.id },
            attributes: ["id", "email"],
          });
          if (!student && !employee) {
            console.log(`No user found for socket_id: ${socket.id}`);
            return;
          }
          if (student) {
            const enrollment = await Student_Enrollment.findOne({
              where: { id: student.id },
              attributes: ["id"],
            });
            socket.userId = enrollment ? String(enrollment.id) : null;
            socket.userType = "student";
          } else {
            socket.userId = employee.email;
            socket.userType = "instructor";
          }
          if (!socket.userId) {
            console.log(`No enrollment found for student with socket_id: ${socket.id}`);
            return;
          }
        }
        const userId = socket.userId;
        const userType = socket.userType;
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            console.log(`No more sockets for ${userId}, setting offline`);
            await redisClient.del(`user:${userId}:status`);
            console.log(`Redis: user:${userId}:status deleted`);
            const Model = userType === "student" ? Student : Employee;
            const where = userType === "student" ? { id: await mapUserIdToId(userId, userType) } : { email: userId };
            if (where.id || where.email) {
              await Model.update({ socket_id: null }, { where });
              console.log(`Database updated: cleared socket_id for ${userId}`);
            }
            await broadcastUserStatus(userId, false, userType);
            userSockets.delete(userId);
          } else {
            console.log(`Remaining sockets for ${userId}: ${sockets.size}`);
          }
        }
      } catch (err) {
        console.error(`Disconnect error: ${err.message}`);
      }
    });
  });
};