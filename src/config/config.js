const serverConfig = require("./server.config");
const dotenv = require("dotenv")
// console.log(process.env,"sdff")
module.exports = {
  development: {
    username: "postgres",
    password: "1234",
    database: "intellix",
    host: "localhost",
    dialect: "postgres",
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    "username": serverConfig.LIVE_DB.user,
    "password": serverConfig.LIVE_DB.pass,
    "database": serverConfig.LIVE_DB.name,
    "host": serverConfig.LIVE_DB.host,
    "port":serverConfig.LIVE_DB.port,
    "dialect": "postgres",
    "pool": {
      max: 10,   
      min: 0, 
      acquire: 30000,
      idle: 10000
    },
    // logging:false
  },
};


