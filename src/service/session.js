const { where } = require("sequelize");

const { SessionRepositories } = require("../repositories/Session.repo");

const sessionRepository = new SessionRepositories();

const sessionService = {


  getSessions: async () => {
    return await sessionRepository.getData();
  },




};

module.exports = sessionService;
