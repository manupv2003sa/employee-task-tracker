const express = require("express");
const router= express.Router();
const upload = require("../middlewares/upload");
const { uploadProfilePicture } = require("../controllers/profile.controller");


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

router.post(
    "/picture",
    authenticateToken,
    upload.single("profilePicture"),
    uploadProfilePicture
);


module.exports=router;