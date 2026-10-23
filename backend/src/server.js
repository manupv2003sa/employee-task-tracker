
require("dotenv").config();

const { verifyToken } = require("./utils/jwt.js");
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app.js");
const sequelize = require("./config/database.js");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://192.168.0.127:4200",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// Authenticate Socket.IO connections
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded.userId || !decoded.role) {
      return next(new Error("Invalid token payload"));
    }

    socket.data.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
});

// Make Socket.IO accessible to Express controllers
app.set("io", io);

// Handle authenticated connections
io.on("connection", (socket) => {
  const { id, role } = socket.data.user;

  console.log(`Authenticated socket connected: ${id} (${role})`);

  socket.join(`user:${id}`);

  if (role === "ADMIN" || role === "MANAGER") {
    socket.join(`role:${role}`);
  }

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${id}`);
  });
});

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("Database connection successful");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Socket.IO is ready");
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
}

startServer();
