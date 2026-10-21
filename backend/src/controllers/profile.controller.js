const {getProfile,updateProfile,changePassword} = require("../services/profile.service");
const upload = require("../middlewares/upload");


const fs = require("fs/promises");
const path = require("path");
const { User } = require("../models");




async function uploadProfilePicture(req, res) {
    let oldPicturePath = null;

    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select a picture",
            });
        }

        const user = await User.findByPk(req.user.userId);

        if (!user) {
            await fs.unlink(req.file.path).catch(() => {});
            return res.status(404).json({
                message: "User not found",
            });
        }

        oldPicturePath = user.profilePicture;

        const newPicturePath =
            `/uploads/profiles/${req.file.filename}`;

        user.profilePicture = newPicturePath;
        await user.save();

        // Delete the old image only after the new path is saved.
        if (oldPicturePath) {
            const oldFilename = path.basename(oldPicturePath);
            const oldFilePath = path.join(
                process.cwd(),
                "uploads",
                "profiles",
                oldFilename
            );

            if (oldFilename !== req.file.filename) {
                await fs.unlink(oldFilePath).catch((error) => {
                    if (error.code !== "ENOENT") {
                        console.error(
                            "Failed to delete old profile picture:",
                            error
                        );
                    }
                });
            }
        }

        return res.status(200).json({
            message: "Profile picture updated successfully",
            data: {
                profilePicture: newPicturePath,
            },
        });
    } catch (error) {
        // Remove the newly uploaded file if saving fails.
        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(() => {});
        }

        console.error("Profile picture upload error:", error);

        return res.status(500).json({
            message: "Failed to update profile picture",
        });
    }
}


async function getProfileController(req,res) {
    try{
        const user= await getProfile(req.user.userId);

        return res.status(200).json({
            success:true,
            data:user
        });
    }catch(error){
        if (error.message==="User not found"){
            return res.status(404).json({
                success:true,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function updateProfileController(req,res) {
    try{
        const {name}= req.body;
        
        if(typeof name !=="string" || !name.trim()){
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }
        if (name.trim().length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name must not exceed 100 characters"
            });
        }

        const user= await updateProfile(
            req.user.userId,
            {name:name.trim()}
        );
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });

    }catch(error){
        if (error.message==="User not found"){
            return res.status(404).json({
                success:true,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message
        });   
    }
}


async function changePasswordController(req,res) {
    try{
        const{currentPassword,newPassword,confirmPassword}=req.body;

        if(!currentPassword || !newPassword || !confirmPassword){
            return res.status(400).json({
                success:false,
                message:"All password fields are required"
            });
        }
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters"
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match"
            });
        }
        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must differ from current password"
            });
        }
        await changePassword(
            req.user.userId,
            currentPassword,
            newPassword
        );
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    }catch(error){
        if (error.message==="User not found"){
            return res.status(404).json({
                success:true,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message
        });       
    }
}
module.exports={
    getProfileController,
    updateProfileController,
    changePasswordController,
    uploadProfilePicture
}
