
const { categoryRepositories } = require("../repositories/category.repo");


const CategoryRepositorie = new categoryRepositories();

const CategoryServices = {
  
    getcategoryservices: async () => {
        return await CategoryRepositorie.getData()
    },
  
      
}
module.exports = CategoryServices;