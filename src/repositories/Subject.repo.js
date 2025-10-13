const { CrudRepository } = require("./crude.repo");
const { Subject } = require("../models/");


class SubjectRepositories extends CrudRepository {
    constructor() {
        super(Subject);
    }

    
    
}

module.exports = { SubjectRepositories }