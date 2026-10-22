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


    const allowedFields =["name","email","role","isActive"];

    for (const field of allowedFields){
        if (data[field]!==undefined){
            user[field]=data[field];
        }
    }

    try {
        await user.save();
    } catch (error) {
    if (
        error.name === 'SequelizeUniqueConstraintError' &&
        error.fields?.email){
            const duplicateError = new Error('Email already exists');
            duplicateError.statusCode = 409;
            throw duplicateError;
         }

        throw error;
    }

    return user;
}


async function deactivateUser(userId) {
    const user = await User.findByPk(userId)

    if(!user){
        throw new Error("User not found");
    }
    await user.destroy();
    return user;
    
}

async function getUsers(
    search,
    page=1,
    limit=10,
    sortBy="createdAt",
    sortOrder="desc",
    role='',
    status = ''
) {
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

    const allowedRoles = ["ADMIN", "MANAGER", "USER"];

    if (role) {
        const normalizedRole = role.toUpperCase();

        if (!allowedRoles.includes(normalizedRole)) {
            throw new Error("Invalid role filter");
        }

        where.role = normalizedRole;
    }
    if (status) {
        const normalizedStatus = status.toUpperCase();

        if (normalizedStatus === "ACTIVE") {
            where.isActive = true;
        } else if (normalizedStatus === "INACTIVE") {
            where.isActive = false;
        } else {
            throw new Error("Invalid status filter");
        }
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
            "profilePicture",
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