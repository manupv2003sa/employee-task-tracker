const { Model, Error } = require("sequelize");
const {Task, User} = require("../models");
const {Op} =require("sequelize");

async function createTask(data,created_by) {
    const{title,
        description,
        priority,
        assignedTo
    }=data;

    const assignedUser= await User.findOne({
        where:{
            id:assignedTo,
            isActive:true
        }
    });

    if(!assignedUser){
        throw new Error("Assigned employee not found or inactive");
    }

    const task= await Task.create({
        title,
        description,
        priority,
        status:"TODO",
        createdBy:created_by,
        assignedTo,
    });

    return task;
    
}

async function assignTask(taskId,assignedTo) {
    const task= await Task.findByPk(taskId);

    if (!task){
        throw new Error("Task not found");
    }

    const assignedUser = await User.findOne({
        where: {
            id:assignedTo,
            isActive:true
        }
    });

    if(!assignedUser){
        throw new Error("Assigned employee not found or inactive");
    }

    task.assignedTo=assignedTo;

    await task.save();
    return task;
    
}

async function editTask(taskId,data) {
    const task= await Task.findByPk(taskId);

    if(!task){
        throw new Error("Task not found");
    }
    const {title,description,priority,status}=data;
     const allowedFields = [
        "title",
        "description",
        "priority",
        "status"
    ];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            task[field] = data[field];
        }
    }
    
    await task.save();
    return task;
}

async function searchTasks(search, status,priority) {
    const where={};

    if (search){
        where [Op.or]=[
            {
                title:{
                    [Op.iLike]:`%${search}%`
                }
            },

            {
                description:{
                    [Op.iLike]:`%${search}%`
                }
            }
        ];
    }

    const allowedStatuses = [
    "TODO",
    "IN_PROGRESS",
    "COMPLETED"
    ];

    const allowedPriorities = [
        "LOW",
        "MEDIUM",
        "HIGH"
    ];
    if (status) {
        if (!allowedStatuses.includes(status)) {
            throw new Error("Invalid status");
        }
        where.status = status;
    }

    if (priority) {
        if (!allowedPriorities.includes(priority)) {
            throw new Error("Invalid priority");
        }
        where.priority = priority;
    }

    return await Task.findAll({
        where,
        order:[["createdAt","DESC"]]
    });
    
}

module.exports={
    createTask,
    assignTask,
    editTask,
    searchTasks,
}