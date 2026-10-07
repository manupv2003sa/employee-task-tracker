const express= require("express");
const app = express();

app.use(express.json());


app.get("/api/health",(req,res)=>{
    res.status(200).json({
        sucesss:true,
        message: "employee task is runnning"
    });
});
module.exports=app;