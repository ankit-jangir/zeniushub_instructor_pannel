// const instructorRepo = require("../repositories/employee.repo")
const { Department } = require("../models/index")
const { AccessControl } = require("../models/index");
const customError = require("../utils/error.handle");
// const instructorRepositories = new instructorRepo();


const checkAccessMiddleware =  (role)=>{
    return async (req,res,next)=>{
        try {
            // console.log("heellooooo");
            
            const GetDepartMentId = req.user.department
            const getResponse = await Department.findAll({
                where:{
                    id:GetDepartMentId
                },
                attributes:['id','access_control'],
                raw:true
            })

            const allAccessControls = getResponse.flatMap((dep)=>{
                    return (
                        dep.access_control
                    )
            })


            //Remode duplicates
            const uniqueAccessControls = [...new Set(allAccessControls)]

            
            const getAccessControlledResponse = await AccessControl.findAll({
                where:{
                    id:uniqueAccessControls
                },
                attributes:['id','name']
            ,raw:true})

            
            const exists = getAccessControlledResponse.some((obj)=>{
                return obj.name===role
            }) 

            if(!exists){

               return res.send({success:false,message:"you can't access this panel "})
            }
            console.log(0);
            
            next()
           

            
        } catch (error) {
            console.log(error)
        }
    }

}


module.exports = {checkAccessMiddleware}