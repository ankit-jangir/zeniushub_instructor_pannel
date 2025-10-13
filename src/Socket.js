const setupChat = require("./Socket/index");

module.exports = (io) => {
  setupChat(io);
};