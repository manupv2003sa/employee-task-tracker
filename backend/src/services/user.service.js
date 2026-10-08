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

module.exports={
    createUser,
}