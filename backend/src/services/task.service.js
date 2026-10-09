const { Model } = require("sequelize");
const {Task, User} = require("../models");

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

module.exports={
    createTask,
}