const { Op } = require("sequelize");
const {Course,Batches} = require("../models/index");
const {CrudRepository} = require("./crude.repo"); 

class CoursesRepositories extends CrudRepository {
    constructor() {
        super(Course);
    }
    // async searchapi(name) {   
    //     return await Course.findAll({
    //         where: {
    //             course_name: { [Op.like]: `%${name}%` }  
    //         }, 
    //     });
    // }
    async   searchapi(name, courssetype) {
        const whereCondition = {};
    
        if (name) {
            whereCondition.course_name = { [Op.like]: `%${name}%` };
        }
    
        if (courssetype) {
            whereCondition.course_type = { [Op.like]: `%${courssetype}%` };
        }
    
        return await Course.findAll({
            where: whereCondition
        });
    }
    
    // async accessdata(name) {
    //     const whereCondition = name ? { batch_id: name } : {};
    
    //     const result = await Batches.findAndCountAll({
    //         where: whereCondition,
    //         // include: [{
    //         //     model: Batches,
    //         //     attributes: ['BatchesName'], // Assuming Batches has 'BatchesName' field
    //         // }]
    //     });
    
    //     return {
    //         totalStudents: result.count,
    //         students: result.rows
    //     };
    // }
    async accessdata(id) {
        const whereCondition = id ? { course_id: id } : {};
    
        const result = await Batches.findAndCountAll({
            where: whereCondition
        });
    
        let courseType = null;
    
        if (id) {
            const course = await Course.findOne({
                where: { id },
                attributes: ['course_type']
            });
    
            courseType = course?.course_type || null;
        }
    
        return {
            TotalBatch: result.count,
            course_type: courseType,
            Batch: result.rows
        };
    }

    async getCourse(excludeId){
        const result = await Course.findAll({
            where:{
                id:{[Op.not]:excludeId},
                status:'active'
            }
        });
        return result;
    }
    
    
}

module.exports={CoursesRepositories}