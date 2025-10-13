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

