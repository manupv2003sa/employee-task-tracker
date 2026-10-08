const request = require("supertest");
const app = require("../../src/app");
const User = require("../../src/models/Users");

describe("Employee Search", () => {
  afterAll(async () => {
    await User.sequelize.close();
  });

  test("ADMIN should be able to search employees by name", async () => {
    await User.bulkCreate([
      {
        name: "Manu Krishna",
        email: "manu.search@example.com",
        passwordHash: "test-password",
        role: "USER",
      },
      {
        name: "Rahul Kumar",
        email: "rahul.search@example.com",
        passwordHash: "test-password",
        role: "USER",
      },
    ]);

    const response = await request(app)
      .get("/api/users?search=Manu");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("Manu Krishna");
  });
});