
const express = require("express");
const { login } = require("../controllers/auth.controller.js");
const { authenticateToken } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", login);

router.get("/protected",authenticateToken,(req,res)=>{
    res.status(200).json({
        success:true,
        message:" You are authenticated",
        user:req.user,
    });
});

module.exports = router;