const express=require("express");
const {addTask}= require("../controllers/task.controller.js");
const {authenticateToken}=require("../middlewares/auth.middleware.js");
const {authorizeRoles} =require("../middlewares/role.middleware.js");

const router=express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN","MANAGER"),
    addTask
);

module.exports=router;