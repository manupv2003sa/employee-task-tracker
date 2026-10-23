
const request = require("supertest");
const app = require("../../src/app");
const { User } = require("../../src/models");
const { hashPassword, comparePassword } = require("../../src/utils/password");

const TEST_USERS = {
  admin: {
    name: "Management Test Admin",
    email: "management.admin@example.com",
    password: "ManagementAdmin@123",
    role: "ADMIN",
  },
  regular: {
    name: "Management Test User",
    email: "management.user@example.com",
    password: "ManagementUser@123",
    role: "USER",
  },
};

let adminToken;
let userToken;

async function login(email, password) {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  expect(response.status).toBe(200);
  return response.body.data.token;
}

beforeEach(async () => {
  // Clean up only accounts reserved for this test file.
  await User.destroy({
    where: {
      email: [
        TEST_USERS.admin.email,
        TEST_USERS.regular.email,
        "management.newuser@example.com",
              "management.update@example.com",
              "management.deactivate@example.com",

      ],
    },
    force: true,
  });

  for (const account of Object.values(TEST_USERS)) {
    await User.create({
      name: account.name,
      email: account.email,
      passwordHash: await hashPassword(account.password),
      role: account.role,
      isActive: true,
    });
  }

  adminToken = await login(
    TEST_USERS.admin.email,
    TEST_USERS.admin.password
  );

  userToken = await login(
    TEST_USERS.regular.email,
    TEST_USERS.regular.password
  );
});

afterAll(async () => {
  await User.destroy({
    where: {
      email: [
        TEST_USERS.admin.email,
        TEST_USERS.regular.email,
        "management.newuser@example.com",
        "management.update@example.com",
        "management.deactivate@example.com",
      ],
    },
    force: true,
  });

  await User.sequelize.close();
});

describe("POST /api/users - Create User", () => {
  test("ADMIN should create a user successfully", async () => {
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "New Management User",
        email: "management.newuser@example.com",
        password: "NewUser@123",
        role: "USER",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        name: "New Management User",
        email: "management.newuser@example.com",
        role: "USER",
        isActive: true,
      })
    );

    expect(response.body.data).not.toHaveProperty("password");
    expect(response.body.data).not.toHaveProperty("passwordHash");

    const savedUser = await User.findOne({
      where: { email: "management.newuser@example.com" },
    });

    expect(savedUser).not.toBeNull();
    expect(savedUser.passwordHash).not.toBe("NewUser@123");
    expect(
      await comparePassword("NewUser@123", savedUser.passwordHash)
    ).toBe(true);
  });

  test.each([
    [{ email: "management.newuser@example.com", password: "NewUser@123", role: "USER" }],
    [{ name: "New Management User", password: "NewUser@123", role: "USER" }],
    [{ name: "New Management User", email: "management.newuser@example.com", role: "USER" }],
    [{ name: "New Management User", email: "management.newuser@example.com", password: "NewUser@123" }],
  ])("should reject creation when a required field is missing", async (body) => {
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(body);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });



  
describe("PUT /api/users/:id - Update User", () => {
  let targetUser;

  beforeEach(async () => {
    targetUser = await User.create({
      name: "User To Update",
      email: "management.update@example.com",
      passwordHash: await hashPassword("UpdateUser@123"),
      role: "USER",
      isActive: true,
    });
  });

  test("ADMIN should update a user's name successfully", async () => {
    const response = await request(app)
      .put(`/api/users/${targetUser.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Updated Management User" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        id: targetUser.id,
        name: "Updated Management User",
        email: "management.update@example.com",
        isActive: true,
      })
    );

    const updatedUser = await User.findByPk(targetUser.id);
    expect(updatedUser.name).toBe("Updated Management User");
  });

  test("should reject an update with no fields", async () => {
    const response = await request(app)
      .put(`/api/users/${targetUser.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("should return 404 when updating a nonexistent user", async () => {
    const response = await request(app)
      .put("/api/users/00000000-0000-4000-8000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Updated Name" });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test("should return 409 when updating to an existing email", async () => {
    const response = await request(app)
      .put(`/api/users/${targetUser.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email: TEST_USERS.regular.email });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  test("USER should not be allowed to update a user", async () => {
    const response = await request(app)
      .put(`/api/users/${targetUser.id}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Unauthorized Update" });

    expect(response.status).toBe(403);
  });

  test("should reject an update without authentication", async () => {
    const response = await request(app)
      .put(`/api/users/${targetUser.id}`)
      .send({ name: "Unauthenticated Update" });

    expect(response.status).toBe(401);
  });
});







describe("PATCH /api/users/:id/deactivate - Deactivate User", () => {
  let targetUser;

  beforeEach(async () => {
    targetUser = await User.create({
      name: "User To Deactivate",
      email: "management.deactivate@example.com",
      passwordHash: await hashPassword("DeactivateUser@123"),
      role: "USER",
      isActive: true,
    });
  });

  test("ADMIN should deactivate a user successfully", async () => {
    const response = await request(app)
      .patch(`/api/users/${targetUser.id}/deactivate`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(targetUser.id);

    const savedUser = await User.findByPk(targetUser.id, {
      paranoid: false,
    });

    expect(savedUser).not.toBeNull();
    expect(savedUser.deletedAt).not.toBeNull();
  });

  test("should return 404 when deactivating a nonexistent user", async () => {
    const response = await request(app)
      .patch(
        "/api/users/00000000-0000-4000-8000-000000000000/deactivate"
      )
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test("USER should not be allowed to deactivate a user", async () => {
    const response = await request(app)
      .patch(`/api/users/${targetUser.id}/deactivate`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  test("should reject deactivation without authentication", async () => {
    const response = await request(app)
      .patch(`/api/users/${targetUser.id}/deactivate`);

    expect(response.status).toBe(401);
  });
});



  test("should reject an email that already exists", async () => {
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Duplicate User",
        email: TEST_USERS.regular.email,
        password: "Duplicate@123",
        role: "USER",
      });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  test("should reject creation without authentication", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({
        name: "New Management User",
        email: "management.newuser@example.com",
        password: "NewUser@123",
        role: "USER",
      });

    expect(response.status).toBe(401);
  });

  test("USER should not be allowed to create a user", async () => {
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        name: "New Management User",
        email: "management.newuser@example.com",
        password: "NewUser@123",
        role: "USER",
      });

    expect(response.status).toBe(403);
  });
});
