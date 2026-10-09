const express=require("express");
const {addTask, updateTaskAssignee, updateTask, getTasks}= require("../controllers/task.controller.js");
const {authenticateToken}=require("../middlewares/auth.middleware.js");
const {authorizeRoles} =require("../middlewares/role.middleware.js");

const router=express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN","MANAGER"),
    addTask
);


router.post(
    "/:id/assign",
    authenticateToken,
    authorizeRoles("ADMIN","MANAGER"),
    updateTaskAssignee
);


router.patch(
    "/:id/assign",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    updateTaskAssignee
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    updateTask
);

router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    getTasks
);


module.exports=router;