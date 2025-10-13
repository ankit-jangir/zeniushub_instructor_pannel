
const CategoryServices = require("../service/category");
const { try_catch } = require("../utils/tryCatch.handle");

const categoryController = {

    getallcategorycontroller: try_catch(async (req, res) => {
        const data = await CategoryServices.getcategoryservices()
        return res.status(201).json({
            status: "success",
            data: data
        });
    }),

}
module.exports = categoryController