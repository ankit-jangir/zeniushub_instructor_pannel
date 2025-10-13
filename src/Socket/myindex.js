// socket/index.js

const userSocketMap = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    socket.on("register", ({ userId, role, instructorId }) => {
      userSocketMap.set(userId, socket.id);
      socket.data.userId = userId;
      socket.data.role = role;
      socket.data.instructorId = instructorId;

      console.log(`${role} ${userId} registered with socket ${socket.id}`);
    });

    socket.on("chat message", (msg) => {
      const from = socket.data.userId;
      const role = socket.data.role;
      const to = role === "student" ? socket.data.instructorId : msg.to;

      console.log(
        `Incoming message from ${from} (${role}) to ${to}: ${msg.message}`
      );

      // Send to recipient
      const recipientSocketId = userSocketMap.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("chat message", {
          from, // this is fine: the sender
          message: msg.message,
        });
      } else {
        console.log("Recipient not connected:", to);
      }

      // Send the message back to the sender — mark it as "me"
      socket.emit("chat message", {
        from: to, // so the student sees the correct tab (instructorId)
        message: msg.message,
        self: true,
      });
    });

    socket.on("disconnect", () => {
      const userId = socket.data.userId;
      if (userId) {
        userSocketMap.delete(userId);
      }
      console.log("Client disconnected:", socket.id);
    });
  });
};
