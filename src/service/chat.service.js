// const { chatMessage } = require("../models");
// const { Op } = require("sequelize");
// const redisClient = require("../config/redis.config");
// const { v4: uuidv4 } = require("uuid"); // For generating unique room IDs

// const chatService = {
//   chatData: async (user1_id, user1_type, user2_id, user2_type) => {
//     const messages = await chatMessage.findAll({
//       where: {
//         [Op.or]: [
//           {
//             sender_id: user1_id,
//             sender_type: user1_type,
//             receiver_id: user2_id,
//             receiver_type: user2_type,
//           },
//           {
//             sender_id: user2_id,
//             sender_type: user2_type,
//             receiver_id: user1_id,
//             receiver_type: user1_type,
//           },
//         ],
//       },
//       order: [["createdAt", "ASC"]],
//     });

//     return messages;
//   },

//   getChatPartners: async (userId, role) => {
//     const messages = await chatMessage.findAll({
//       where: {
//         [Op.or]: [
//           { sender_id: userId, sender_type: role },
//           { receiver_id: userId, receiver_type: role },
//         ],
//       },
//       attributes: ["sender_id", "sender_type", "receiver_id", "receiver_type"],
//     });

//     const partnerType = role === "instructor" ? "student" : "instructor";
//     const partnerSet = new Set();

//     messages.forEach((msg) => {
//       if (msg.sender_type === partnerType && msg.sender_id != userId) {
//         partnerSet.add(msg.sender_id);
//       }
//       if (msg.receiver_type === partnerType && msg.receiver_id != userId) {
//         partnerSet.add(msg.receiver_id);
//       }
//     });

//     const roomMessages = await chatMessage.findAll({
//       where: {
//         room_id: { [Op.ne]: null },
//         [Op.or]: [
//           { sender_id: userId, sender_type: role },
//           { receiver_id: userId, receiver_type: role },
//         ],
//       },
//       attributes: ["room_id"],
//     });

//     const roomSet = new Set(roomMessages.map((msg) => msg.room_id));
//     return {
//       users: Array.from(partnerSet),
//       rooms: Array.from(roomSet),
//     };
//   },

//   getRoomMessages: async (roomId) => {
//     const messages = await chatMessage.findAll({
//       where: {
//         room_id: roomId,
//         receiver_type: "room",
//       },
//       order: [["createdAt", "ASC"]],
//     });

//     return messages;
//   },

//   // New: Create a room
//   createRoom: async (name, userId) => {
//     try {
//       // Generate unique room ID
//       const roomId = uuidv4();

//       // Store room metadata in Redis
//       const roomData = {
//         id: roomId,
//         name: name || `Room-${roomId}`,
//         creatorId: userId,
//         createdAt: new Date().toISOString(),
//       };

//       await redisClient.hset(`room:${roomId}`, {
//         id: roomData.id,
//         name: roomData.name,
//         creatorId: roomData.creatorId,
//         createdAt: roomData.createdAt,
//       });

//       // Add creator to room's user list
//       await redisClient.sadd(`room:${roomId}:users`, userId);

//       return roomData;
//     } catch (err) {
//       console.error("Error creating room:", err);
//       throw new Error("Failed to create room");
//     }
//   },
// };

// module.exports = chatService;