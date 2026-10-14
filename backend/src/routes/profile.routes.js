const express = require("express");
const router= express.Router();

const {authenticateToken}= require("../middlewares/auth.middleware");

const {getProfileController,updateProfileController, changePasswordController} =require("../controllers/profile.controller");

router.get(
    "/",
    authenticateToken,
    getProfileController
)

router.put(
    "/", 
    authenticateToken, 
    updateProfileController
);

router.put(
    "/change-password",
    authenticateToken,
    changePasswordController
);


module.exports=router;