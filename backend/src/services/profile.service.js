const {User} =require("../models");
const bcrypt = require("bcrypt");

async function getProfile(userId){

    const user = await User.findByPk(userId,{
        attributes:[
            "id",
            "name",
            "email",
            "role",
            "isActive",
            "createdAt",
            "updatedAt",
        ]
    });

    if (!user){
        throw new Error("User not found");
    }

    return user;
}


async function updateProfile(userId, profileData) {
    const user = await User.findByPk(userId);
    if (!user){
        throw new Error("User not found");
    }
    user.name=profileData.name.trim();
    await user.save();

    return getProfile(userId);
}

async function changePassword(userId,currentPassword, newPassword) {
    const user =await User.findByPk(userId);
    if (!user){
        throw new Error("User not found");
    }

    const isPasswordValid=await bcrypt.compare(
        currentPassword,user.passwordHash
    );

    if (!isPasswordValid){
        throw new Error("Current password is incorrect");
    }

    const hashedPassword= await bcrypt.hash(newPassword,10);
    user.password=hashedPassword;

    await user.save();

    return true;
    
}

module.exports={
    getProfile,
    updateProfile,
    changePassword,
}

