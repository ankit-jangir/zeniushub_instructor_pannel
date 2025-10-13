const { CrudRepository } = require("./crude.repo");
const {Session} = require("../models/index");



class SessionRepositories extends CrudRepository {
    constructor() {
        super(Session);
    }

    
    
}

module.exports = { SessionRepositories }