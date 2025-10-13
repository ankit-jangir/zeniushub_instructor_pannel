const { logger } = require("sequelize/lib/utils/logger");
const { try_catch } = require("../utils/tryCatch.handle");
const sessionService = require("../service/session");

const session = {



    getSessions: try_catch(
        async (req, res) => {



            const sessions = await sessionService.getSessions();
            return res.status(200).send({ status: "001", sessions });
        }
    ),



}
module.exports = { session }


