const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { PORT } = require("./config/server.config");
const { router } = require("./route/index"); // Adjust path if needed
const setupSocket = require("./Socket");

// use for wrap your express App because socket.io requires direct access to the http server to attach itself for real-time communication
const http = require("http");

//imports the socket.Io library that allows real-time, bi-directional communication between clients and the server (using WebSockets under the hood)
const socketIo = require("socket.io");
const { try_catch } = require("./utils/tryCatch.handle");
const { getBlob } = require("./utils/azureUploader");
const authenticate = require("./middleware/verifyToken");

const app = express();
// console.log("production", process.env.PRODUCTION_HOST);

//this step is required because Socket.Io must attach to a raw http server , not just the express app.
const server = http.createServer(app);

// initializes a new instance of socket.io and binds it to the http server. This allows your backend to handle real-time events, like chat messages, instantly.
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5172",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://instructorv2-api-dev.intellix360.in",
    ],
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {},
});

// Middlewares
const allowedOrigins = [
  "http://localhost:5172",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://instructorv2-api-dev.intellix360.in",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(bullBoardRoutes);

// API Routes
app.use("/api", router);

//Start listening for WebSocket connections, This sets up a listener for when a client connects.
setupSocket(io);
// io.on('connection',(socket)=>{
//   console.log("New client connected",socket.id);
//   socket.on('chat message', (msg) => {
//     console.log('message: ', msg);
//   });

//   socket.on('disconnect',()=>{
//     console.log('client disconnected',socket.id)
//   })
// })

app.get(
  "/getblobsfromazure",
  try_catch(async (req, res) => {
    const { filePath } = req.query;

    const blobResponse = await getBlob(filePath);
    const readableStream = blobResponse.readableStreamBody;

    if (!readableStream) {
      console.error("readableStreamBody is undefined");
      return res
        .status(500)
        .json({ message: "Failed to get readable stream from blob." });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filePath}"`);
    readableStream.pipe(res);
  })
);

app.get(
  "/viewimagefromazure",
  try_catch(async (req, res) => {
    const { filePath } = req.query;

    const blobResponse = await getBlob(filePath);
    const readableStream = blobResponse.readableStreamBody;

    if (!readableStream) {
      console.error("readableStreamBody is undefined");

      throw new customError("Failed to get readable stream from blob.", 500);
    }

    if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
      res.setHeader("Content-Type", "image/jpeg");
    } else if (filePath.endsWith(".png")) {
      res.setHeader("Content-Type", "image/png");
    } else if (filePath.endsWith(".svg")) {
      res.setHeader("Content-Type", "image/svg+xml");
    } else if (filePath.endsWith(".webp")) {
      res.setHeader("Content-Type", "image/webp");
    } else if (filePath.endsWith(".pdf")) {
      res.setHeader("Content-Type", "application/pdf");
    } else {
      throw new customError("Unsupported file format.", 400);
    }

    readableStream.pipe(res);
  })
);

app.get("/ping", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Token is valid",
  });
});

//  Remove this
// app.listen(PORT, () => {
//   console.log(`App listening on port ${PORT}`);
// });
//  Use this instead ,  you created a custom server (using http.createServer(app)), you must use server.listen(...) instead to ensure Socket.IO works!
server.listen(PORT, () => {
  console.log(`App with socket.io listening on port ${PORT}`);
});
