const express=require("express");
const {addTask, updateTaskAssignee, editTaskController, getTasks, getMyTasksController, updateMyTaskStatusController, getAssignableUsersController}= require("../controllers/task.controller.js");
const {authenticateToken}=require("../middlewares/auth.middleware.js");
const {authorizeRoles} =require("../middlewares/role.middleware.js");

const router=express.Router();

router.post(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN","MANAGER"),
    addTask
);



router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    editTaskController
);

router.get(
    "/",
    authenticateToken,
    authorizeRoles("ADMIN", "MANAGER"),
    getTasks
);

router.get(
    "/my",
    authenticateToken,
    authorizeRoles("USER","MANAGER"),
    getMyTasksController,
);

router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("USER","MANAGER"),
  updateMyTaskStatusController
);

router.get(
    "/assignable-users",
    authenticateToken,
    authorizeRoles("ADMIN","MANAGER"),
    getAssignableUsersController

)
module.exports=router;