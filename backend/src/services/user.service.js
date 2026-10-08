const { User } = require("../models");
const {hashPassword} =require("../utils/password.js");

async function createUser({name,email,password,role}) {
    const existingUser= await User.findOne({
        where:{email},
    });


    if (existingUser){
        throw new Error("Email already exists");
        
    }

    const passwordHash=await hashPassword(password);

    const user= await User.create({
        name,
        email,
        passwordHash,
        role,
    });

    return user;
}


async function updateUser(userId,data) {
    const user= await User.findByPk(userId);

    if(!user){
        throw new Error("User not found");
    }

    const allowedFields =["name","email","role"];

    for (const field of allowedFields){
        if (data[field]!==undefined){
            user[field]=data[field];
        }
    }
    await user.save
    return user;

    
}
module.exports={
    createUser,
    updateUser
}