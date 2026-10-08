const express =require("express");
const { addUser } = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

const router=express.Router();

router.post(
    '/',
    authenticateToken,
    authorizeRoles("ADMIN"),
    addUser
);

module.exports=router;
