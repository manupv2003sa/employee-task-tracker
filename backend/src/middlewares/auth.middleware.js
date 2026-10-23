const {verifyToken}=require("../utils/jwt.js");
const { User } = require("../models");

async function authenticateToken(req,res,next){

    const authHeader = req.headers.authorization;



    if (!authHeader){
        return res.status(401).json({
            success:false,
            message:"Authorization header is required",
        });
    }

    const [scheme, token]=authHeader.split(" ");

    if (scheme != "Bearer" || !token){
        return res.status(401).json({
            success :false,
            message:"Invalid authorization format",
        });
    }

    try{
        const decoded= verifyToken(token);

        const user=await User.findByPk(decoded.userId);

        if (!user){
            return res.status(401).json({
                success:false,
                message:"User not found",
            });
        }
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                code: "ACCOUNT_DEACTIVATED",
                message: "Your account has been deactivated",
            });
        }



        if (decoded.role !== user.role) {
            return res.status(403).json({
                success: false,
                code: "ROLE_CHANGED",
                message: "Your role has changed. Please log in again.",
            });
        }
        

        req.user={
            ...decoded,
            userId: user.id,
            role: user.role,
        };
        next();
    }catch(error){

        if(
            error.name==="TokenExpiredError" ||
            error.name==="JsonWebTokenError" ||
            error.name==="NotBeforeError"
        ){
            return res.status(401).json({
                success:false,
                message:"Invalid or expired token",
            });
        }
        return next(error);
    }
}

module.exports={
    authenticateToken,
}