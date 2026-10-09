const {createTask}= require("..//services/task.service.js");
const { validate: isUUID } = require("uuid");

async function addTask(req,res) {
    try{
        const {title, description, priority, assignedTo}=req.body;

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
            },
            req.user.userId
        );

        return res.status(201).json({
            success: true,
            data :task
        });
    }catch(error){
        if (error.message==="Assigned employee not found or inactive"){
            return res.status(404)({
                success:false,
                message:error.message
            });
        }
        return res.status(500).json({
            succcess :false,
            message : error.message
        });
    }
    
}

module.exports={
    addTask
};