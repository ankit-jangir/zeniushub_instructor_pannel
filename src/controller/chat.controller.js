// const { StatusCodes } = require("http-status-codes");
// const chatService = require("../service/chat.service");
// const { try_catch } = require("../utils/tryCatch.handle");

// const chatController = {
//   getChat: try_catch(async (req, res) => {
//     const { user1_id, user1_type, user2_id, user2_type } = req.query;

//     if (!user1_id || !user1_type || !user2_id || !user2_type) {
//       return res.status(400).json({ error: "Missing required query params" });
//     }

//     const response = await chatService.chatData(
//       user1_id,
//       user1_type,
//       user2_id,
//       user2_type
//     );
//     return res.status(StatusCodes.ACCEPTED).json({
//       success: true,
//       message: "Chat Data",
//       data: response,
//     });
//   }),

//   getChatPartners: try_catch(async (req, res) => {
//     const { userId, role } = req.query;

//     if (!userId || !role) {
//       return res
//         .status(400)
//         .json({ error: "Missing required query params: userId, role" });
//     }

//     const response = await chatService.getChatPartners(userId, role);
//     return res.status(StatusCodes.OK).json({
//       success: true,
//       message: "Chat partners fetched",
//       data: response,
//     });
//   }),

//   // New: Get messages for a room
//   getRoomMessages: try_catch(async (req, res) => {
//     const { roomId } = req.params;

//     if (!roomId) {
//       return res
//         .status(400)
//         .json({ error: "Missing required param: roomId" });
//     }

//     const response = await chatService.getRoomMessages(roomId);
//     return res.status(StatusCodes.OK).json({
//       success: true,
//       message: "Room messages fetched",
//       data: response,
//     });
//   }),

// createRoom: try_catch(async (req, res) => {
//     const { name, userId } = req.body;
//     if (!userId) {
//       return res
//         .status(400)
//         .json({ error: "Missing required body param: userId" });
//     }
//     const room = await chatService.createRoom(name, userId);
//     return res.status(StatusCodes.CREATED).json({
//       success: true,
//       message: "Room created",
//       data: room,
//     });
//   }),
// };

// module.exports = { chatController };