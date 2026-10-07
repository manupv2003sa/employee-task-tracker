const Task = require("./Task.js");
const User=require("./Users.js");

User.hasMany(Task,{
    foreignKey:"createdBy",
    as:"createdTasks",
});

User.hasMany(Task,{
    foreignKey:"assignedTo",
    as:"assignedTasks",
});


Task.belongsTo(User,{
    foreignKey:"createdBy",
    as:"creator",
});

Task.belongsTo(User,{
    foreignKey:"assignedTo",
    as:"assignee",
});

module.exports={
    User,
    Task
};