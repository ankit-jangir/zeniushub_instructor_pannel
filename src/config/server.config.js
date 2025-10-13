const dotenv = require("dotenv");

dotenv.config();
console.log("production", process.env.PRODUCTION_HOST);

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET,
  LIVE_DB: {
    host: process.env.PRODUCTION_HOST,
    user: process.env.PRODUCTION_USERNAME,
    pass: process.env.PRODUCTION_PASSWORD,
    name: process.env.PRODUCTION_DATABASE,
    port: process.env.PRODUCTION_PORT,
  },
  REDIS: {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT
},
};


