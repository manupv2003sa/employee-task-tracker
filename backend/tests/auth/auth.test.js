
const request = require("supertest");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const app = require("../../src/app");
const { User } = require("../../src/models");
const { hashPassword } = require("../../src/utils/password");

const TEST_USERS = [
  {
    name: "Auth Test Admin",
    email: "auth.admin@example.com",
    password: "AuthAdmin@123",
    role: "ADMIN",
    isActive: true,
  },
  {
    name: "Auth Test User",
    email: "auth.user@example.com",
    password: "AuthUser@123",
    role: "USER",
    isActive: true,
  },
  {
    name: "Auth Inactive User",
    email: "auth.inactive@example.com",
    password: "AuthInactive@123",
    role: "USER",
    isActive: true,
  },
];

const TEST_EMAILS = TEST_USERS.map((user) => user.email);

async function resetTestUsers() {
  // Delete only accounts reserved for this authentication test suite.
  // force: true bypasses soft deletion for these test fixtures only.
  await User.destroy({
    where: {
      email: {
        [Op.in]: TEST_EMAILS,
      },
    },
    force: true,
  });

  const users = await Promise.all(
    TEST_USERS.map(async (user) => ({
      name: user.name,
      email: user.email,
      passwordHash: await hashPassword(user.password),
      role: user.role,
      isActive: user.isActive,
    }))
  );

  await User.bulkCreate(users);
}

describe("Authentication integration tests", () => {
  beforeEach(async () => {
    await resetTestUsers();
  });

  describe("POST /api/auth/login", () => {
    test("should log in with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "auth.admin@example.com",
          password: "AuthAdmin@123",
        });

        

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful");
      expect(typeof response.body.data.token).toBe("string");
      expect(response.body.data.token.length).toBeGreaterThan(0);

      expect(response.body.data.user).toMatchObject({
        name: "Auth Test Admin",
        email: "auth.admin@example.com",
        role: "ADMIN",
      });

      expect(response.body.data.user.id).toBeDefined();
      expect(response.body.data.user).not.toHaveProperty("passwordHash");
      expect(response.body.data.user).not.toHaveProperty("password");
    });

 

    test("should reject an incorrect password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "auth.admin@example.com",
          password: "WrongPassword@123",
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid email or password",
      });
    });

    test("should reject an email that does not exist", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "missing.auth@example.com",
          password: "SomePassword@123",
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid email or password",
      });
    });

    test.each([
      [{ password: "AuthAdmin@123" }, "missing email"],
      [{ email: "auth.admin@example.com" }, "missing password"],
      [{}, "empty request body"],
    ])("should reject requests with %s", async (body) => {
      const response = await request(app)
        .post("/api/auth/login")
        .send(body);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Email and password are required"
      );
    });

    test("should reject malformed JSON", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send('{"email":');

      // Express JSON parsing should reject malformed JSON.
      expect(response.status).toBe(400);
    });

    test("should reject a deactivated account", async () => {
      await User.update(
        { isActive: false },
        { where: { email: "auth.inactive@example.com" } }
      );

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "auth.inactive@example.com",
          password: "AuthInactive@123",
        });

      expect(response.status).toBe(403);
      expect(response.body).toEqual({
        success: false,
        message:
          "Your account has been deactivated. Please contact your administrator.",
      });
    });
  });

  describe("GET /api/auth/protected", () => {
    test("should allow access with a valid JWT", async () => {
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "auth.user@example.com",
          password: "AuthUser@123",
        });

      expect(loginResponse.status).toBe(200);

      const token = loginResponse.body.data.token;

      const response = await request(app)
        .get("/api/auth/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.userId).toBe(
        loginResponse.body.data.user.id
      );
      expect(response.body.user.role).toBe("USER");
    });

    test("should reject a request without an Authorization header", async () => {
      const response = await request(app).get("/api/auth/protected");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Authorization header is required",
      });
    });

    test.each([
      ["Basic abc123", "Basic scheme"],
      ["Bearer", "missing token"],
      ["Bearer ", "empty token"],
      ["Bearer token extra", "extra header part"],
    ])("should reject malformed authorization header: %s", async (header) => {
      const response = await request(app)
        .get("/api/auth/protected")
        .set("Authorization", header);

      expect(response.status).toBe(401);
    });

    test("should reject an invalid JWT", async () => {
      const response = await request(app)
        .get("/api/auth/protected")
        .set("Authorization", "Bearer invalid.jwt.token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid or expired token",
      });
    });

    test("should reject an expired JWT", async () => {
      const expiredToken = jwt.sign(
        {
          userId: "00000000-0000-4000-8000-000000000001",
          role: "USER",
          exp: Math.floor(Date.now() / 1000) - 60,
        },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .get("/api/auth/protected")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        success: false,
        message: "Invalid or expired token",
      });
    });
  });



  
test("should reject a token after the user's account is deactivated", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "auth.user@example.com",
      password: "AuthUser@123",
    });

  expect(loginResponse.status).toBe(200);

  const token = loginResponse.body.data.token;

  await User.update(
    { isActive: false },
    { where: { email: "auth.user@example.com" } }
  );

  const response = await request(app)
    .get("/api/auth/protected")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(403);
  expect(response.body.code).toBe("ACCOUNT_DEACTIVATED");
});

test("should reject a token when the user's role has changed", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "auth.user@example.com",
      password: "AuthUser@123",
    });

  expect(loginResponse.status).toBe(200);

  const token = loginResponse.body.data.token;

  await User.update(
    { role: "MANAGER" },
    { where: { email: "auth.user@example.com" } }
  );

  const response = await request(app)
    .get("/api/auth/protected")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(403);
  expect(response.body.code).toBe("ROLE_CHANGED");
});

test("should reject a validly signed token for a nonexistent user", async () => {
  const token = jwt.sign(
    {
      userId: "00000000-0000-4000-8000-000000000001",
      role: "USER",
    },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );

  const response = await request(app)
    .get("/api/auth/protected")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(401);
  expect(response.body).toEqual({
    success: false,
    message: "User not found",
  });
});

test("should reject a token after the user is soft-deleted", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "auth.user@example.com",
      password: "AuthUser@123",
    });

  expect(loginResponse.status).toBe(200);

  const token = loginResponse.body.data.token;

  // Default paranoid behavior should soft-delete the test account.
  await User.destroy({
    where: { email: "auth.user@example.com" },
  });

  const response = await request(app)
    .get("/api/auth/protected")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(401);
  expect(response.body).toEqual({
    success: false,
    message: "User not found",
  });
});

});

afterAll(async () => {
  await User.sequelize.close();
});



