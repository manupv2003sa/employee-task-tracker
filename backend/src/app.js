const cors = require("cors");
const express = require("express");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const taskRoutes =require("./routes/task.routes");
const profileRoutes = require("./routes/profile.routes");
const app = express();

app.use(cors({
    origin: "http://localhost:4200"
}));
app.use(express.json());


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Employee Task Tracker API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks",taskRoutes);
app.use('/api/profile',profileRoutes);
module.exports = app;