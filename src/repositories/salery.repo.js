const { CrudRepository } = require("./crude.repo");
const {Salary} = require("../models/index");



class saleryRepositories extends CrudRepository {
    constructor() {
        super(Salary);
    }

    
    
}

module.exports = { saleryRepositories }