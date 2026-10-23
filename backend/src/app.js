const cors = require("cors");
const express = require("express");
const path = require('path');


const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const taskRoutes =require("./routes/task.routes");
const profileRoutes = require("./routes/profile.routes");
const app = express();

app.use(cors({
    origin: "http://localhost:4200"
}));
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks",taskRoutes);
app.use('/api/profile',profileRoutes);


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
module.exports = app;