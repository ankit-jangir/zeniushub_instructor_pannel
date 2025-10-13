const { where, Sequelize } = require("sequelize");
const { EmployeeTask, Admin } = require("../models/");
const { Op, fn, col } = require('sequelize');
const { employeeTaskRepositories } = require("../repositories/employeeTask.repo");
const employeeTaskRepository = new employeeTaskRepositories(EmployeeTask);
const employeeTaskCountRepository = new employeeTaskRepositories(EmployeeTask)
const employeeTaskService = {
    getTasksByStatus: async (status) => {
        const now = new Date();

        const tasks = await employeeTaskRepository.getTasksByStatus();

        if (status === "missed") {
            return tasks.filter(
                (task) =>
                    task.status !== "completed" &&
                    task.status !== "ongoing" &&
                    new Date(task.due_date) < now
            );
        }

        return tasks.filter((task) => task.status === status);
    },

    getTaskDetails: async (taskId) => {
        const task = await EmployeeTask.findOne({
            where: { id: taskId },
            attributes: ['id', 'task_tittle', 'description', 'status', 'due_date', 'attachments'],
            include: [
                {
                    model: Admin,
                    attributes: ['id', 'full_name'],
                    as: 'Admin'
                }
            ]
        });

        if (!task) return null;

        return {
            id: task.id,
            title: task.task_tittle,
            description: task.description,
            status: task.status,
            dueDate: task.due_date,
            attachment: task.attachments,
            assignedBy: task.Admin?.full_name || 'Unknown'
        };
    },
    getTasksByStatus: async (status,employee_id) => {
        const now = new Date();
        const tasks = await employeeTaskRepository.getTasksByStatus(employee_id);
        if ( status === '') {
            return tasks;
        }
        if (status === 'missed') {
            return tasks.filter(
                (task) =>
                    task.status !== 'completed' && task.status !== 'ongoing' &&
                    new Date(task.due_date) < now
            );
        }
        return tasks.filter((task) => task.status === status);
    },


    async getTaskCountByStatusForEmployee(employeeId) {
        const now = new Date();

        // Step 1: Get total count
        const totalTasks = await EmployeeTask.count({
            where: { employee_id: employeeId },
        });

        // Step 2: Get grouped counts for statuses
        const grouped = await EmployeeTask.findAll({
            where: {
                employee_id: employeeId,
                status: {
                    [Op.in]: ['ongoing', 'completed', 'not started', 'not completed']
                }
            },
            attributes: [
                'status',
                [fn('COUNT', col('status')), 'count']
            ],
            group: ['status']
        });

        // Step 3: Format base counts
        const statusCounts = {
            ongoing: 0,
            completed: 0,
            'not started': 0,
            'not completed': 0,
            missed: 0
        };

        grouped.forEach(row => {
            const status = row.get('status');
            const count = parseInt(row.get('count'), 10);
            statusCounts[status] = count;
        });

        // Step 4: Get missed count using condition
        const missedCount = await EmployeeTask.count({
            where: {
                employee_id: employeeId,
                status: {
                    [Op.notIn]: ['completed', 'ongoing']
                },
                due_date: {
                    [Op.lt]: now
                }
            }
        });

        statusCounts.missed = missedCount;

        return {
            totalTasks,
            ...statusCounts
        };
    }
};

module.exports = employeeTaskService;
