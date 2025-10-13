const { PaymentReceipt } = require("../models/index");
const { CrudRepository } = require("./crude.repo");

class PaymentReceiptRepositories extends CrudRepository {
    constructor() {
        super(PaymentReceipt);
    }  

}

module.exports = { PaymentReceiptRepositories }
