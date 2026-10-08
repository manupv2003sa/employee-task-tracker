const {User} =require("../models");
const {comparePassword}= require("../utils/password.js");


async function authenticateUser(email,password) {
    const user=await User.findOne({
        where:{
            email,
            isActive:true,
        },
    });

    if (!user){
        return null;
    }

    const isPasswordValid= await comparePassword(
        password,
        user.passwordHash
    );

    if(!isPasswordValid){
        return null;
    }

    return user;
}

module.exports={
    authenticateUser,
}