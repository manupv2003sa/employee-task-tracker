"use strict";

const {randomUUID} =require("crypto");
const bcrypt=require("bcrypt");

module.exports={
    async up(queryInterface){
        const passwordHash= await bcrypt.hash("Admin@123",10);

        await queryInterface.bulkInsert("users",[{
            id:randomUUID(),
            name:"SA",
            email:"Admin@gmail.com",
            password_hash: passwordHash,
            role: "ADMIN",
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),

        }])
    },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: "Admin@example.com",
    });
  },
};