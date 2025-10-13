class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    console.log('====================================xxxx');
    console.log(data);
    console.log('====================================');
    return await this.model.create(data);
  }

  async bulkCreate(dataArray, options = {}) {
    return await this.model.bulkCreate(dataArray, options);
  }

  async getData() {
    return await this.model.findAll();
  }
  async findOne(query) {
    // console.log(0);

    // console.log(this.model);
    // return

    return await this.model.findOne({ where: query });
    // Example usage: findOne({ email: "test@example.com" })
  }
  async findAndCountAll(query) {
    return await this.model.findAndCountAll(query);
  }
  async getOneData(dataToFind) {
    return await this.model.findOne({ where: dataToFind });
  }

  async getDataById(id) {
    return await this.model.findByPk(id);
  }
  
  async update(data, dataToUpdate) {
    return await this.model.update(data, { where: dataToUpdate });
    //format should be {id:id}, nd fro upadte {name:"xyz"}
  }
  async findAll(query) {
     return await this.model.findAll({ where: query ,raw: true,});
  }

  // async findAll(query) {
  //   return await this.model.findAll({ where: query });
  // }
  async insertMany(data, options = {}) {
  // agar aapne fields fix kiye hue hain to session_Id bhi include kar do
  return await this.model.bulkCreate(data, {
    ...options,
    // fields option agar use kar rahe ho to yeh likho:
    // fields: ['employee_id', 'batch_id', 'subject_id', 'course_id', 'session_Id', 'createdAt', 'updatedAt']
  });
}


  async deleteData(condition) {
    return await this.model.destroy({ where:{id:  condition} });
  }
 

  // New method to search based on given criteria
  async searchData(criteria, limit, offset) {
    return await this.model.findAndCountAll({
      where: criteria,
      limit, // Number of records per page
      offset, // Skip records for pagination
    });
  }
  async getAllWithCondition(dataToFind,attributes) {
    return await this.model.findAll({ where: dataToFind,attributes: attributes});
  }
  async aggregate(pipeline) {
    if (!this.model.aggregate) {
      throw new Error("Aggregation not supported on this model.");
    }
    return await this.model.aggregate(pipeline);
  }
  async count(data){
    return await this.model.count({ where:data})
  }
  
}

module.exports = { CrudRepository };
