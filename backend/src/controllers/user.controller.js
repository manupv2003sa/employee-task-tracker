const { Model } = require("sequelize");
const {createUser}= require("../services/user.service.js");

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


module.exports={
    addUser,
}