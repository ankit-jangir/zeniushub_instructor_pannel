const { Employee, Department, AccessControl } = require('../models');

const checkEmployeeAccess = (requiredAccess) => {
  return async (req, res, next) => {
    try {
      const employeeId = req.user?.id;
      console.log("employeeId ........",employeeId);
      console.log("requiredAccess ........",requiredAccess);
      
      
      if (!employeeId) return res.status(401).json({ message: "Unauthorized" });

      
      const employee = await Employee.findByPk(employeeId);
      if (!employee) return res.status(404).json({ message: "Employee not found" });

      const departmentIds = employee.department || []; 
      console.log("departmentIds ........",departmentIds); 

      if (!Array.isArray(departmentIds) || departmentIds.length === 0) {
        return res.status(400).json({ message: "Employee does not belong to any department" });
      }

     
      const departments = await Department.findAll({
        where: { id: departmentIds }
      });

      
      const allAccessIds = departments.reduce((acc, dept) => {
        if (Array.isArray(dept.access_control)) {
          acc.push(...dept.access_control);
        }
        return acc;
      }, []);

      
      const uniqueAccessIds = [...new Set(allAccessIds)];

      
      const accessControls = await AccessControl.findAll({
        where: { id: uniqueAccessIds },
        attributes: ['name']
      });

      const accessNames = accessControls.map(ac => ac.name); 
      console.log("accessNames......",accessNames);

      
      const hasAccess = accessNames.some(access => access===requiredAccess);
      console.log("hasAccess......",hasAccess);
      


      if (!hasAccess) {
        return res.status(403).json({
          message: "Access Denied " 
        });
      }

      req.user=employee
      // req.employee = {
      //   id: employee.id,
      //   name: employee.first_name,
      //   departments: departments.map(d => d.name),
      //   access: accessNames
      // };

      next();
    } catch (err) {
      console.error("Access check error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
};

module.exports = checkEmployeeAccess;
