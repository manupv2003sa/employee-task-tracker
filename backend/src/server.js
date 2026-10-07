require("dotenv").config();

const app=require("./app.js");
const sequelize = require("./config/database.js");

const PORT =process.env.PORT || 3000;


async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("Database connection successful");

    app.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server", error.message);
    process.exit(1);
}
}

startServer();