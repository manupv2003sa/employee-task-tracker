const { Model } = require("sequelize");
const {createUser, updateUser}= require("../services/user.service.js");

async function addUser(req,res) {
    try{

        const {name,email,password,role}= req.body;
        if (!name || !email || !password || !role){
            return res.status(400).json({
                success :false,
                message:"Name, email, password and role are required",
            });
        }


        const user=await createUser({
            name,
            email,
            password,
            role,
        });
   
        return res.status(201).json({
            success: true,
            message : "User successfully created",
            data:{
                id: user.id,
                name:user.name,
                email:user.email,
                role:user.role,
                isActive:user.IsActive,
            },
        });


    }catch(error){
        console.error("ADD USER ERROR:", error);

        if (error.message==="Email already exists"){
            return res.status(409).json({
                success:false,
                message: error.message,
            });
        }
    

    return res.status(500).json({
        success:false,
        message:"failed to create user",
    });
}
    
}

async function editUser(req,res) {
    try{
        const{name,email,role}=req.body;

        if (!name && !email && !role){
            return res.status(400).json({
                success :false,
                message:" At least one field is required"
            });
        }

        const user = await updateUser(req.params.id,{
            name,
            email,
            role,

        });
        return res.status(200).json({
            success: true,
            message:"User updated successfully",
            data:{
                id:user.id,
                name:user.name,
                email:user.email,
                isActive:user.isActive,

            },
        });
    }catch(error){
        if (error.message==="User not found"){
            return res.status(404).json({
                success:false,
                message : error.message,
            });
        }

        return res.status(500).json({
            success:false,
            message:"Failed to update user"
        });
    }
    
}



module.exports={
    addUser,
    editUser
}