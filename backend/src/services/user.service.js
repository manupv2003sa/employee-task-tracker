const { User } = require("../models");
const {hashPassword} =require("../utils/password.js");
const { Op } = require("sequelize");


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


async function deactivateUser(userId) {
    const user = await User.findByPk(userId)

    if(!user){
        throw new Error("User not found");
    }
    user.isActive=false;
    await user.save();
    return user;
    
}

async function getUsers(
    search,
    page=1,
    limit=10,
    sortBy="createdAt",
    sortOrder="desc") {
    const where = {};

    if (search) {
        where[Op.or] = [
            {
                name: {
                    [Op.iLike]: `%${search}%`
                }
            },
            {
                email: {
                    [Op.iLike]: `%${search}%`
                }
            }
        ];
    }

    const allowedSortField=["name","email","role","createdAt"];

    const allowedSortOrders=["asc","desc"];

    if (!allowedSortField.includes(sortBy)){
        sortBy="createdAt";
    }

    if (!allowedSortOrders.includes(sortOrder.toLowerCase())){
        sortOrder="desc";
    }


    const offset =(page-1)*limit;

    const {rows,count} = await User.findAndCountAll({
        where,
        attributes:[
            "id",
            "name",
            "email",
            "role",
            "isActive",
            "createdAt",
            "updatedAt"
        ],
        limit,
        offset,
        order:[[sortBy,sortOrder.toUpperCase()]]
    });

    return{
        users:rows,
        total:count
    };
}

 
module.exports={
    createUser,
    updateUser,
    deactivateUser,
    getUsers

}