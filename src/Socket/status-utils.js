// === What This File Does ===
// This file has a function to tell all relevant chat rooms when a user goes online or offline.
// It helps the chat system show who's available to chat.

// === Tools We Need ===
const { chatMessage, redisClient, Op } = require("./db-config");
const { mapUserIdToId, mapIdToUserId } = require("./user-utils");

// === Tell Chat Rooms If a User Is Online or Offline ===
// This function notifies everyone in the user's chat rooms if they're online or offline.
// Example: When student "123" logs in, their instructor gets notified they're online.
async function broadcastUserStatus(io, userId, isOnline, userType) {
  try {
    console.log(`${userId} is now ${isOnline ? "online" : "offline"} (${userType})`);

    // Step 1: Get all chat rooms the user is in from Redis
    let chatRooms = await redisClient.smembers(`user:${userId}:rooms`);

    // Step 2: Add rooms from recent messages
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
      limit: 50, // Only check the last 50 messages
    });

    // Create room IDs from messages (e.g., "123_teacher@example.com")
    const messageRooms = await Promise.all(
      messages.map(async (msg) => {
        const senderId = await mapIdToUserId(msg.sender_id, msg.sender_type);
        const receiverId = await mapIdToUserId(msg.receiver_id, msg.receiver_type);
        return [senderId, receiverId].sort().join("_");
      })
    );

    // Combine all rooms and remove duplicates
    chatRooms = [...new Set([...chatRooms, ...messageRooms])];

    // Step 3: For instructors, add rooms with students they've talked to
    if (userType === "instructor") {
      const conversationKey = `conversation:${userId}`;
      const studentIds = await redisClient.hkeys(conversationKey);
      const convRooms = studentIds.map((studentId) => [userId, studentId].sort().join("_"));
      chatRooms = [...new Set([...chatRooms, ...convRooms])];
    }

    // Step 4: Send the online/offline status to all rooms
    await Promise.all(
      chatRooms.map(async (room) => {
        console.log(`Telling room ${room} that ${userId} is ${isOnline ? "online" : "offline"}`);
        return new Promise((resolve) => {
          io.to(room).emit("userStatus", { userId, isOnline }, () => {
            console.log(`Room ${room} got status for ${userId}`);
            resolve();
          });
        });
      })
    );
  } catch (err) {
    console.error(`Error sending status for ${userId} (${userType}): ${err.message}`);
  }
}

// === Share This Function ===
module.exports = { broadcastUserStatus };
