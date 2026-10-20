const {createTask,  assignTask,  editTask, searchTasks, getMyTasks, updateMyTasksStatus, getAssignableUsers }= require("..//services/task.service.js");
const { validate: isUUID } = require("uuid");

async function addTask(req,res) {
    try{
        const {title, description, priority, assignedTo, dueDate}=req.body;

        if(!title || !assignedTo){
            return res.status(400).json({
                success:false,
                message: "Title and assigned employee are required",
            });

        }
        if (!isUUID(assignedTo)) {
            return res.status(404).json({
                success: false,
                message: "Assigned employee not found or inactive"
           });
        }
        const task= await createTask(
            {
                title,
                description,
                priority,
                assignedTo,
                dueDate,
            },
            req.user.userId
        );

        return res.status(201).json({
            success: true,
            data :task
        });
    }catch(error){
        if (error.message==="Assigned employee not found or inactive"){
            return res.status(404).json({
                success:false,
                message:error.message
            });
        }
        return res.status(500).json({
            success :false,
            message : error.message
        });
    }
    
}


async function updateTaskAssignee(req, res) {
    try {
        const { assignedTo } = req.body;
        const { id } = req.params;
    
         if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: "Assigned employee is required"
            });
        }
        const task= await assignTask(id,assignedTo);

        return res.status(200).json({
            success:true,
            data:task
        });
    }catch(error){
        if (error.message==="Task not found"){
            return res.status(404).json({
                success:false,
                message:error.message
            });
        }
        if (error.message === "Assigned employee not found or inactive") {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

async function updateTask(req,res) {
    try{
        const {id}= req.params;

        const task=await editTask(id,req.body);
        return res.status(200).json({
            success:true,
            data :task
        });
    }catch(error){
        if (error.message==="Task not found"){
            return res.status(404).json({
                success:false,
                message:error.message
            });
        }
        return res.status(500).json({
        success: false,
        message: error.message
        });

    }
    
}

async function getTasks(req,res) {
    try{
        const {search,status, priority, sortBy, order} = req.query;
        const tasks =await searchTasks(search,status,priority, sortBy,order);

        return res.status(200).json({
            success:true,
            data:tasks
        });
    }catch(error){
        return res.status(400).json({
            success:false,
            message:error.message
        });
    }
    
}

async function getMyTasksController(req,res) {
    try{
        const tasks = await getMyTasks(req.user.userId);

        return res.status(200).json({
            success :true,
            data:tasks,
        });

    }catch{
        return res.status(500).json({
            success:false,
            message : "Failed to retrieve your tasks",
        })
    }
}

async function updateMyTaskStatusController(req,res) {
    try{
        const {status} = req.body;

        if(!status){
            return res.status(400).json({
                success:false,
                message: "Task status is  required",
            });
        }

        const task= await updateMyTasksStatus(
            req.params.id,
            req.user.userId,
            status
        );

        return res.status(200).json({
            success: true,
            message: "Task status updated successfully",
            data: task,
        });
    }catch(error){
        console.log(error)
        if (error.message==="Task not found"){
            return res.status(404).json({
                success:false,
                message:error.message
            });
        }

        if (error.message === "You are not authorized to update this task") {
            return res.status(403).json({
                success: false,
                message: error.message
            });
        }

         if (error.message === "Invalid task status") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success:false,
            message : "Failed to update task status",
        })
    }
}



async function getAssignableUsersController(req,res){
    try{
        const user= await getAssignableUsers(req.user.userId);

         return res.status(200).json({
            success: true,
            message: "Employees loaded successfully",
            data: user,
        });

    }catch(error){
        if (error.message==="User not found"){
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to load users",
        });
    }
}
module.exports={
    addTask,
    updateTaskAssignee,
    updateTask,
    getTasks,
    getMyTasksController,
    updateMyTaskStatusController,
    getAssignableUsersController
}