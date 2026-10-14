const {getProfile,updateProfile,changePassword} = require("../services/profile.service");

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
    changePasswordController
}
