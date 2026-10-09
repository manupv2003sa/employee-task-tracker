const request = require("supertest");
const { Op } = require("sequelize");
const app = require("../../src/app");
const User = require("../../src/models/Users");

const { hashPassword } = require("../../src/utils/password");

async function getAdminToken() {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "testadmin@example.com",
      password: "TestAdmin@123",
    });

  return loginResponse.body.data.token;
}

describe("Employee Search", () => {
  test("ADMIN should be able to search employees by name", async () => {

    await User.destroy({
      where: {
        email: {
          [Op.in]: [
            "testadmin@example.com",
            "manu.search@example.com",
            "rahul.search@example.com"
          ]
        }
      }
    });
    
    const passwordHash = await hashPassword("TestAdmin@123");

    await User.bulkCreate([
    {
        name: "Test Admin",
        email: "testadmin@example.com",
        passwordHash,
        role: "ADMIN",
        isActive: true,
    },
    {
        name: "Manu Krishna",
        email: "manu.search@example.com",
        passwordHash,
        role: "USER",
    },
    {
        name: "Rahul Kumar",
        email: "rahul.search@example.com",
        passwordHash,
        role: "USER",
        },
    ]);
        
    const token = await getAdminToken();


    const response = await request(app)
      .get("/api/users?search=Manu")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("Manu Krishna");
  });



    test("ADMIN should be able to search employees case-insensitively", async () => {
    const token = await getAdminToken();

    const response = await request(app)
        .get("/api/users?search=manu")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("Manu Krishna");
    });



    test("ADMIN should get empty result when no employee matches", async () => {
    const token = await getAdminToken();
    const response = await request(app)
        .get("/api/users?search=xyznotfound")
        .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
    });


    test("USER should not be allowed to search employees", async () => {
    await User.destroy({
        where: {
        email: "testuser@example.com",
        },
    });

    const passwordHash = await hashPassword("TestUser@123");

    await User.create({
        name: "Test User",
        email: "testuser@example.com",
        passwordHash,
        role: "USER",
        isActive: true,
    });

    const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
        email: "testuser@example.com",
        password: "TestUser@123",
        });

   const token = loginResponse.body.data.token;
   const response = await request(app)
    .get("/api/users?search=Manu")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(403);
});


  afterAll(async () => {
    await User.sequelize.close();
  });
});