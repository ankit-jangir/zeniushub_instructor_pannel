const { where, Op } = require("sequelize");
const { EmployeeTask, Admin, Employee } = require("../models/");
const { CrudRepository } = require("./crude.repo");
const { Sequelize } = require('sequelize');
class employeeTaskRepositories extends CrudRepository {
    constructor() {
        super(EmployeeTask);
    }


    async getTasksByStatus(employee_id) {
        return await EmployeeTask.findAll({
            where: { employee_id: employee_id },
            include: [
                {
                    model: Employee,
                    attributes: ['first_name']
                },
                {
                    model: Admin,
                    attributes: ['full_name']
                }
            ]
        });

    }
    async getTaskCountByStatusForEmployee(employeeId) {
        const totalTasks = await EmployeeTask.count({
            where: { employee_id: employeeId }
        });

        const statusCountsRaw = await EmployeeTask.findAll({
            where: {
                employee_id: employeeId,
                status: {
                    [Sequelize.Op.in]: ['ongoing', 'completed', 'not started', 'not completed']
                }
            },
            attributes: [
                'status',
                [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']
            ],
            group: ['status']
        });

        // Format the result to an object
        const statusCounts = {
            ongoing: 0,
            completed: 0,
            'not started': 0,
            'not completed': 0
        };

        statusCountsRaw.forEach(row => {
            const status = row.get('status');
            const count = parseInt(row.get('count'), 10);
            statusCounts[status] = count;
        });

        return { totalTasks, ...statusCounts };
    }


    async getalldata(employee_id, task_tittle, status, page = 1, limit = 10) {
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (employee_id) {
            whereClause.employee_id = employee_id.employee_id;
        }

        if (task_tittle && task_tittle.trim() !== "") {
            whereClause.task_tittle = { [Op.iLike]: `%${task_tittle}%` };
        }

        // if (status && status.trim() !== "") {
        //     whereClause.status = status;
        // }

        // 1. Get paginated data
        const data = await EmployeeTask.findAndCountAll({
            where: whereClause,
            offset,
            limit,
            include: [
                {
                    model: Admin,
                    attributes: ["full_name"]
                }
            ]
        });

        let statusCounts = {};

        if (data.count > 0) {
            // ✅ Status count based only on filtered data (no pagination)
            const statusCountsRaw = await EmployeeTask.findAll({
                attributes: [
                    'status',
                    [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']
                ],
                where: whereClause, // same filter as main query
                group: ['status']
            });

            // Format counts
            statusCounts = {
                ongoing: 0,
                completed: 0,
                'not started': 0,
                'not completed': 0
            };

            statusCountsRaw.forEach(row => {
                const s = row.status;
                statusCounts[s] = parseInt(row.getDataValue('count')) || 0;
            });
        }

        return {
            totalRecords: data.count,
            totalPages: Math.ceil(data.count / limit),
            currentPage: page,
            statusCounts,
            data: data.rows,
        };
    }


    async getalldataforemployebatch() {
        const data = await Employee.findAll();
        return data
    }



}

module.exports = { employeeTaskRepositories }
