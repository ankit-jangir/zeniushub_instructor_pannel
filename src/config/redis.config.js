const { default: Redis } = require("ioredis");
const { REDIS } = require("./server.config");
const redisConfig = {
  host: REDIS.host,
  password: REDIS.password,
  port: REDIS.port,
  maxRetriesPerRequest: null,
  maxRetriesPerRequest: null,
  reconnectOnError: function (err) {
    // Reconnect on certain Redis errors
    const targetErrors = [/READONLY/, /ETIMEDOUT/];
    for (let i = 0; i < targetErrors.length; i++) {
      if (targetErrors[i].test(err.message)) {
        return true;
      }
    }
    return false;
  },
  // Optional: Increase the connection timeout and keep-alive settings
  connectTimeout: 10000, // 10 seconds
  keepAlive: 10000,
};


const client = new Redis(redisConfig);

client.on("connect", () => {
  console.log("Connected to Redis");
});

client.on("error", (err) => {
  console.error("Error connecting to Redis:", err);
  // No need to quit and create a new client here; let the library handle reconnections
});

client.on("end", () => {
  console.log("Redis connection closed");
});

module.exports = client;



// (async () => {
//   try {

//     await redisClient.connect();

//     // 🔍 Check if RediSearch index exists
//     try {
//       // await redisClient.ft.dropIndex("idx:students", true); // true = drop documents
//       // console.log("true   ", true);

//       await redisClient.ft.info("idx:students");
//       console.log("RedisSearch index 'idx:students' already exists.");
//     } catch (err) {
//       console.log("🔍 Creating RedisSearch index: idx:students...");
//       await redisClient.ft.create(
//         "idx:students",
//         {
//           "$.name": { type: "TEXT", AS: "name" },
//           "$.father_name": { type: "TEXT", AS: "father_name" },
//           "$.serial_no": { type: "TEXT", AS: "serial_no" },
//           "$.enrollment_id": { type: "TEXT", AS: "enrollment_id" },
//           "$.rt": { type: "TAG", AS: "rt" },
//           "$.session_id": { type: "TAG", AS: "session_id" },
//           "$.status": { type: "TAG", AS: "status" }, // ✅ FIXED
//         },
//         {
//           ON: "JSON",
//           PREFIX: ["student:"],
//         }
//       );

//       console.log("✅ Created RedisSearch index: idx:students");
//     }
//   } catch (err) {
//     console.error("❌ Redis connection/init error:", err.message || err);
//   }
// })();

// module.exports = client;
