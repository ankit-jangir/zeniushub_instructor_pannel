// === What This File Does ===
// This is the main file for the chat system in a school app. It handles users logging in,
// sending messages, joining chat rooms, and logging out. It uses Socket.io to make chats
// happen in real-time, like instant messaging.

// === Tools We Need ===
const {
  chatMessage,
  Student,
  Employee,
  Student_Enrollment,
  emp_subj,
  redisClient,
  Op,
} = require("./db-config");
const { mapUserIdToId, mapIdToUserId } = require("./user-utils");
const { broadcastUserStatus } = require("./status-utils");

// === Storage ===
// Keeps track of who's connected to the chat
const userSockets = new Map(); // Maps each user (by ID or email) to their active connections

// === Main Chat Server ===
// This sets up the chat system and handles all user actions.
// Example: When a student or instructor opens the app, this code manages their chat.
module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // Keep the user's online status updated every 30 seconds
    const heartbeatInterval = setInterval(async () => {
      if (socket.userId) {
        await redisClient.set(`user:${socket.userId}:status`, "online", "EX", 86400); // Expires in 24 hours
        console.log(`Updated status for ${socket.userId}: online`);
      }
    }, 30000);

    // --- When a User Logs In ---
    // Example: Student with ID "123" logs in and joins their own chat room.
    socket.on("registerUser", async ({ userId }) => {
      if (!userId) {
        console.error(`No user ID provided`);
        socket.emit("error", { message: "Please provide a user ID" });
        return;
      }

      // Track this connection
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId).add(socket.id);
      socket.userId = userId;
      socket.join(userId); // Join a room with their own ID
      console.log(`User ${userId} joined room ${userId} with socket ${socket.id}`);

      try {
        // Figure out if they're a student or instructor
        let userType = "unknown";
        let user;
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId); // Check if it's an email

        if (isEmail) {
          // Check for instructor
          user = await Employee.findOne({
            where: { email: userId },
            attributes: ["id", "email", "first_name"],
          });
          userType = user ? "instructor" : "unknown";
        } else {
          // Check for student
          const parsedId = parseInt(userId);
          if (isNaN(parsedId)) {
            console.error(`Invalid student ID: ${userId}`);
            socket.emit("error", { message: "Invalid student ID" });
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
          console.error(`No user found: ${userId}`);
          socket.emit("error", { message: "User not found" });
          return;
        }

        console.log(`${userType} ${userId} connected with socket ${socket.id}`);
        socket.userType = userType; // Save for later
        await redisClient.set(`user:${userId}:status`, "online", "EX", 86400);

        // Save the socket ID to the database
        const Model = userType === "student" ? Student : Employee;
        const where = userType === "student" ? { id: await mapUserIdToId(userId, userType) } : { email: userId };
        if (typeof socket.id === "string" && socket.id.trim() !== "") {
          await Model.update({ socket_id: socket.id }, { where });
          console.log(`Saved socket ID ${socket.id} for ${userId} in database`);
        } else {
          console.warn(`Invalid socket ID for ${userId}: ${socket.id}`);
        }

        // If it's an instructor, join them to rooms with students they've talked to
        if (userType === "instructor") {
          const conversationKey = `conversation:${userId}`;
          const studentIds = await redisClient.hkeys(conversationKey);
          for (const studentId of studentIds) {
            const roomId = [userId, studentId].sort().join("_");
            socket.join(roomId);
            await redisClient.sadd(`user:${userId}:rooms`, roomId);
            await redisClient.sadd(`user:${studentId}:rooms`, roomId);
            console.log(`Instructor ${userId} joined room ${roomId}`);
            socket.emit("newStudent", { studentId });
          }
        }

        await broadcastUserStatus(io, userId, true, userType);
      } catch (err) {
        console.error(`Error registering ${userId}: ${err.message}`);
        socket.emit("error", { message: `Something went wrong: ${err.message}` });
      }
    });

    // --- Check If Someone Is Online ---
    // Example: Student checks if instructor "teacher@example.com" is online.
    socket.on("getUserStatus", async ({ targetId }) => {
      try {
        const redisStatus = await redisClient.get(`user:${targetId}:status`);
        const isOnline = redisStatus === "online";
        console.log(`${targetId} is ${isOnline ? "online" : "offline"} for ${socket.userId}`);
        socket.emit("userStatus", { userId: targetId, isOnline });
      } catch (err) {
        console.error(`Error checking status for ${targetId}: ${err.message}`);
        socket.emit("error", { message: `Can't check if user is online: ${err.message}` });
      }
    });

    // --- Join a Chat Room ---
    // Example: Student "123" starts a chat with instructor "teacher@example.com".
    socket.on("joinRoom", async ({ userId, userType, targetId, offset = 0, limit = 20 }) => {
      if (!userId || !targetId) {
        console.error(`Missing user ID or target ID: userId=${userId}, targetId=${targetId}`);
        socket.emit("error", { message: "Need both user ID and target ID" });
        return;
      }

      try {
        const targetType = userType === "student" ? "instructor" : "student";
        let target, user, courseId;

        // Check if the user exists
        if (userType === "student") {
          const enrollment = await Student_Enrollment.findOne({
            where: { id: userId },
            include: [{ model: Student, attributes: ["id", "enrollment_id", "name"] }],
            attributes: ["id", "course_id", "batch_id"],
          });
          if (!enrollment) {
            console.error(`No student found with ID: ${userId}`);
            throw new Error(`No student found with ID: ${userId}`);
          }
          user = enrollment.Student;
          courseId = enrollment.course_id;
        } else {
          user = await Employee.findOne({
            where: { email: userId },
            attributes: ["id", "email", "first_name"],
          });
          if (!user) {
            console.error(`No instructor found with email: ${userId}`);
            throw new Error(`No instructor found with email: ${userId}`);
          }
        }

        // Check if the target user exists
        if (targetType === "student") {
          const enrollment = await Student_Enrollment.findOne({
            where: { id: targetId },
            include: [{ model: Student, attributes: ["id", "enrollment_id", "name"] }],
            attributes: ["id", "course_id", "batch_id"],
          });
          if (!enrollment) {
            console.error(`No student found with ID: ${targetId}`);
            throw new Error(`No student found with ID: ${targetId}`);
          }
          target = enrollment.Student;
          if (userType === "instructor") courseId = enrollment.course_id;
        } else {
          target = await Employee.findOne({
            where: { email: targetId },
            attributes: ["id", "email", "first_name"],
          });
          if (!target) {
            console.error(`No instructor found with email: ${targetId}`);
            throw new Error(`No instructor found with email: ${targetId}`);
          }
        }

        // Create a unique room ID for this chat (e.g., "123_teacher@example.com")
        const roomId = [userId, targetId].sort().join("_");
        socket.join(roomId);
        await redisClient.sadd(`user:${userId}:rooms`, roomId);
        await redisClient.sadd(`user:${targetId}:rooms`, roomId);
        console.log(`${userType} ${userId} joined room ${roomId}`);

        // Check if the target is online
        const redisStatus = await redisClient.get(`user:${targetId}:status`).catch((err) => {
          console.error(`Error checking Redis status for ${targetId}: ${err.message}`);
          return null;
        });
        const isTargetOnline = redisStatus === "online";
        socket.emit("userStatus", { userId: targetId, isOnline: isTargetOnline });

        // Load past messages for the chat
        const senderId = await mapUserIdToId(userId, userType);
        const receiverId = await mapUserIdToId(targetId, targetType);
        const total = await chatMessage.count({
          where: {
            [Op.or]: [
              { sender_id: senderId, sender_type: userType, receiver_id: receiverId, receiver_type: targetType },
              { sender_id: receiverId, sender_type: targetType, receiver_id: senderId, receiver_type: userType },
            ],
            room_id: null,
          },
        });

        const messages = await chatMessage.findAll({
          where: {
            [Op.or]: [
              { sender_id: senderId, sender_type: userType, receiver_id: receiverId, receiver_type: targetType },
              { sender_id: receiverId, sender_type: targetType, receiver_id: senderId, receiver_type: userType },
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

        // Format messages to send to the app
        const formattedMessages = await Promise.all(
          messages.reverse().map(async (msg) => {
            const senderUserId = await mapIdToUserId(msg.sender_id, msg.sender_type);
            const receiverUserId = await mapIdToUserId(msg.receiver_id, msg.receiver_type);
            console.log(`Formatting message ${msg.id}: from ${senderUserId} to ${receiverUserId}`);
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

        console.log(`Sent ${formattedMessages.length} messages to ${userId} for room ${roomId}, total=${total}`);
        socket.emit("messageHistory", { messages: formattedMessages, total });

        // Mark messages as delivered if the user is receiving them
        await chatMessage.update(
          { delivered: true },
          { where: { receiver_id: senderId, receiver_type: userType, delivered: false } }
        );

        formattedMessages
          .filter((msg) => msg.targetId === userId && !msg.delivered)
          .forEach((msg) => {
            io.to(roomId).emit("messageDelivered", { messageId: msg.messageId, userId });
          });
      } catch (err) {
        console.error(`Error joining room: ${err.message}`);
        socket.emit("error", { message: `Can't load chat messages: ${err.message}` });
      }
    });

    // --- Send a New Message ---
    // Example: Student "123" sends "Hello!" to instructor "teacher@example.com".
    socket.on("sendMessage", async (messageData) => {
      if (!messageData.userId || !messageData.targetId || !messageData.content) {
        console.error(`Missing message details: ${JSON.stringify(messageData)}`);
        socket.emit("error", { message: "Need user ID, target ID, and message text" });
        return;
      }

      try {
        const targetType = messageData.userType === "student" ? "instructor" : "student";
        const senderId = await mapUserIdToId(messageData.userId, messageData.userType);
        const receiverId = await mapUserIdToId(messageData.targetId, targetType);
        let target, user, courseId;

        // Check if sender and receiver are valid
        if (messageData.userType === "student") {
          const enrollment = await Student_Enrollment.findOne({
            where: { id: messageData.userId },
            include: [{ model: Student, attributes: ["id", "enrollment_id", "name"] }],
            attributes: ["id", "course_id", "batch_id"],
          });
          if (!enrollment) {
            console.error(`No student found with ID: ${messageData.userId}`);
            throw new Error(`No student found with ID: ${messageData.userId}`);
          }
          if (!enrollment.course_id) {
            console.error(`Student ${messageData.userId} has no course`);
            throw new Error(`Student has no course assigned`);
          }
          if (!enrollment.batch_id) {
            console.error(`Student ${messageData.userId} has no batch`);
            throw new Error(`Student has no batch assigned`);
          }
          courseId = Number(enrollment.course_id);
          if (isNaN(courseId)) {
            console.error(`Invalid course ID for student ${messageData.userId}`);
            throw new Error(`Invalid course ID`);
          }
          user = enrollment.Student;
          target = await Employee.findOne({
            where: { email: messageData.targetId },
            include: [{ model: emp_subj, attributes: [], required: false, where: { course_id: courseId } }],
            attributes: ["id", "email", "first_name"],
          });
          if (!target) {
            console.error(`No instructor found with email: ${messageData.targetId}`);
            throw new Error(`No instructor found with email: ${messageData.targetId}`);
          }
        } else {
          user = await Employee.findOne({
            where: { email: messageData.userId },
            include: [{ model: emp_subj, attributes: [], required: false }],
            attributes: ["id", "email", "first_name"],
          });
          if (!user) {
            console.error(`No instructor found with email: ${messageData.userId}`);
            throw new Error(`No instructor found with email: ${messageData.userId}`);
          }
          const enrollment = await Student_Enrollment.findOne({
            where: { id: messageData.targetId },
            include: [{ model: Student, attributes: ["id", "enrollment_id", "name"] }],
            attributes: ["id", "course_id", "batch_id"],
          });
          if (!enrollment) {
            console.error(`No student found with ID: ${messageData.targetId}`);
            throw new Error(`No student found with ID: ${messageData.targetId}`);
          }
          if (!enrollment.batch_id) {
            console.error(`Student ${messageData.targetId} has no batch`);
            throw new Error(`Student has no batch assigned`);
          }
          target = enrollment.Student;
        }

        if (!target || !user) {
          console.error(`Invalid ${!target ? "target" : "user"}`);
          throw new Error(`Invalid ${!target ? "target" : "user"}`);
        }

        // Check if the target is online
        const roomId = [messageData.userId, messageData.targetId].sort().join("_");
        const redisStatus = await redisClient.get(`user:${messageData.targetId}:status`).catch((err) => {
          console.error(`Error checking Redis status for ${messageData.targetId}: ${err.message}`);
          return null;
        });
        const isTargetOnline = redisStatus === "online";

        // Save the message to the database
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

        // Format the message for the app
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

        // Store the message in Redis (keep only the last 100 messages)
        await redisClient.lpush(`room:${roomId}:messages`, JSON.stringify(formattedMessage));
        await redisClient.ltrim(`room:${roomId}:messages`, 0, 99);

        // If a student is messaging an instructor for the first time, notify the instructor
        if (messageData.userType === "student") {
          const instructorId = messageData.targetId;
          const studentId = messageData.userId;
          const conversation = await chatMessage.findOne({
            where: {
              [Op.or]: [
                { sender_id: senderId, receiver_id: receiverId, sender_type: "student", receiver_type: "instructor" },
                { sender_id: receiverId, receiver_type: "student", receiver_id: senderId, sender_type: "instructor" },
              ],
            },
            attributes: ["id"],
          });
          const redisExists = await redisClient.hexists(`conversation:${instructorId}`, studentId);
          if (!conversation && !redisExists) {
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
            console.log(`Notified ${instructorId} about new student ${studentId}`);
          }
        }

        // Send the message to both users in the chat room
        io.to(roomId).emit("receiveMessage", formattedMessage);
        if (isTargetOnline) {
          io.to(messageData.targetId).emit("messageDelivered", {
            messageId: savedMessage.id,
            userId: messageData.targetId,
          });
        }

        await broadcastUserStatus(io, messageData.userId, true, messageData.userType);
      } catch (err) {
        console.error(`Error sending message: ${err.message}`);
        socket.emit("error", { message: `Can't send message: ${err.message}` });
      }
    });

    // --- Mark a Message as Seen ---
    // Example: Student "123" marks a message from an instructor as seen.
    socket.on("messageSeen", async ({ messageId, userId }) => {
      try {
        const message = await chatMessage.update(
          { seen: true },
          { where: { id: messageId, receiver_id: await mapUserIdToId(userId, "unknown") } }
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
        console.error(`Error marking message seen: ${err.message}`);
        socket.emit("error", { message: `Can't mark message as seen: ${err.message}` });
      }
    });

    // --- Load Older Messages ---
    // Example: Student "123" loads more messages with instructor "teacher@example.com".
    socket.on("loadMoreMessages", async ({ userId, userType, targetId, offset, limit = 20 }) => {
      try {
        const targetType = userType === "student" ? "instructor" : "student";
        const senderId = await mapUserIdToId(userId, userType);
        const receiverId = await mapUserIdToId(targetId, targetType);
        const roomId = [userId, targetId].sort().join("_");

        // Count total messages in this chat
        const total = await chatMessage.count({
          where: {
            [Op.or]: [
              { sender_id: senderId, sender_type: userType, receiver_id: receiverId, receiver_type: targetType },
              { sender_id: receiverId, sender_type: targetType, receiver_id: senderId, receiver_type: userType },
            ],
            room_id: null,
          },
        });

        if (offset >= total) {
          console.log(`No more messages for ${userId}: offset=${offset}, total=${total}`);
          socket.emit("moreMessages", { messages: [], total });
          return;
        }

        // Get the requested messages
        const messages = await chatMessage.findAll({
          where: {
            [Op.or]: [
              { sender_id: senderId, sender_type: userType, receiver_id: receiverId, receiver_type: targetType },
              { sender_id: receiverId, sender_type: targetType, receiver_id: senderId, receiver_type: userType },
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

        // Format messages for the app
        const formattedMessages = await Promise.all(
          messages.reverse().map(async (msg) => {
            const senderUserId = await mapIdToUserId(msg.sender_id, msg.sender_type);
            const receiverUserId = await mapIdToUserId(msg.receiver_id, msg.receiver_type);
            console.log(`Formatting message ${msg.id}: from ${senderUserId} to ${receiverUserId}`);
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

        console.log(`Sent ${formattedMessages.length} more messages to ${userId}, offset=${offset}, total=${total}`);
        socket.emit("moreMessages", { messages: formattedMessages, total });
      } catch (err) {
        console.error(`Error loading more messages: ${err.message}`);
        socket.emit("error", { message: `Can't load more messages: ${err.message}` });
      }
    });

    // --- User Logs Out ---
    // Example: Student "123" closes the app, so their status is set to offline.
    socket.on("disconnect", async () => {
      try {
        console.log(`Socket ${socket.id} disconnected`);
        clearInterval(heartbeatInterval);

        if (!socket.userId) {
          // If we don't know the user, check the database
          const student = await Student.findOne({
            where: { socket_id: socket.id },
            attributes: ["id", "enrollment_id"],
          });
          const employee = await Employee.findOne({
            where: { socket_id: socket.id },
            attributes: ["id", "email"],
          });
          if (!student && !employee) {
            console.log(`No user found for socket ID: ${socket.id}`);
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
            console.log(`No enrollment found for student with socket ID: ${socket.id}`);
            return;
          }
        }

        const userId = socket.userId;
        const userType = socket.userType;
        const sockets = userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            console.log(`No more connections for ${userId}, setting offline`);
            await redisClient.del(`user:${userId}:status`);
            const Model = userType === "student" ? Student : Employee;
            const where = userType === "student" ? { id: await mapUserIdToId(userId, userType) } : { email: userId };
            if (where.id || where.email) {
              await Model.update({ socket_id: null }, { where });
              console.log(`Cleared socket ID for ${userId} in database`);
            }
            await broadcastUserStatus(io, userId, false, userType);
            userSockets.delete(userId);
          } else {
            console.log(`${userId} still has ${sockets.size} active connections`);
          }
        }
      } catch (err) {
        console.error(`Error handling disconnect: ${err.message}`);
      }
    });
  });
};
