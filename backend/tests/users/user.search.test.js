
const request = require("supertest");
const { Op } = require("sequelize");
const app = require("../../src/app");
const User = require("../../src/models/Users");
const { hashPassword } = require("../../src/utils/password");

const TEST_USERS = [
  {
    name: "Test Admin",
    email: "testadmin@example.com",
    password: "TestAdmin@123",
    role: "ADMIN",
  },
  {
    name: "Manu Krishna",
    email: "manu.search@example.com",
    password: "TestAdmin@123",
    role: "USER",
  },
  {
    name: "Rahul Kumar",
    email: "rahul.search@example.com",
    password: "TestAdmin@123",
    role: "USER",
  },
  {
    name: "Test User",
    email: "testuser@example.com",
    password: "TestUser@123",
    role: "USER",
  },
];

const TEST_EMAILS = TEST_USERS.map((user) => user.email);

async function resetTestUsers() {
  try {
    // Only remove users reserved for this test suite.
    await User.destroy({
  where: {
    email: {
      [Op.in]: [
        "testadmin@example.com",
        "manu.search@example.com",
        "rahul.search@example.com",
        "testuser@example.com",
      ],
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
        isActive: true,
      }))
    );

    await User.bulkCreate(users);
  } catch (error) {
    console.error("Failed to prepare employee-search test data.");
    console.error("Error:", error.message);
    console.error("PostgreSQL error:", error.parent?.message);
    console.error("PostgreSQL code:", error.parent?.code);
    throw error;
  }
}

async function getToken(email, password) {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  if (response.status !== 200 || !response.body?.data?.token) {
    console.error("Login failed:", {
      email,
      status: response.status,
      body: response.body,
    });

    throw new Error(`Could not obtain JWT for ${email}`);
  }

  return response.body.data.token;
}

test("ADMIN should be able to get all employees", async () => {
  const token = await getToken(
    "testadmin@example.com",
    "TestAdmin@123"
  );

  const response = await request(app)
    .get("/api/users")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
const returnedEmails = response.body.data.map(
  (user) => user.email
);

for (const user of TEST_USERS) {
  expect(returnedEmails).toContain(user.email);
}
  expect(response.body.pagination).toMatchObject({
  page: 1,
  limit: 10,
  total: response.body.data.length,
  totalPages: Math.ceil(
    response.body.pagination.total /
      response.body.pagination.limit
  ),
});
});


test("should not expose passwords or password hashes", async () => {
  const token = await getToken(
    "testadmin@example.com",
    "TestAdmin@123"
  );

  const response = await request(app)
    .get("/api/users")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);

  for (const user of response.body.data) {
    expect(user).not.toHaveProperty("password");
    expect(user).not.toHaveProperty("passwordHash");
  }
});

describe("Employee Search", () => {
  beforeEach(async () => {
    await resetTestUsers();
  });

  test("ADMIN should be able to search employees by name", async () => {
    const token = await getToken(
      "testadmin@example.com",
      "TestAdmin@123"
    );

    const response = await request(app)
      .get("/api/users?search=Manu")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("Manu Krishna");
  });

  test("ADMIN should be able to search employees case-insensitively", async () => {
    const token = await getToken(
      "testadmin@example.com",
      "TestAdmin@123"
    );

    const response = await request(app)
      .get("/api/users?search=manu")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe("Manu Krishna");
  });

  test("ADMIN should get an empty result when no employee matches", async () => {
    const token = await getToken(
      "testadmin@example.com",
      "TestAdmin@123"
    );

    const response = await request(app)
      .get("/api/users?search=xyznotfound")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  test("USER should not be allowed to search employees", async () => {
    const token = await getToken(
      "testuser@example.com",
      "TestUser@123"
    );

    const response = await request(app)
      .get("/api/users?search=Manu")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });


  test("ADMIN should be able to get the second page of employees", async () => {
    const token = await getToken(
      "testadmin@example.com",
      "TestAdmin@123"
    );

    const response = await request(app)
      .get("/api/users?page=2&limit=2")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.limit).toBe(2);
    expect(response.body.data.length).toBeLessThanOrEqual(2);
  });

  test("should reject an invalid page number", async () => {
  const token = await getToken(
    "testadmin@example.com",
    "TestAdmin@123"
  );

  const response = await request(app)
    .get("/api/users?page=0")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(400);
});



test("ADMIN should be able to sort employees by name in ascending order", async () => {
  const token = await getToken(
    "testadmin@example.com",
    "TestAdmin@123"
  );

  const response = await request(app)
    .get("/api/users?sortBy=name&sortOrder=asc")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);

    const names = response.body.data.map((user) => user.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });


  test("ADMIN should be able to filter employees by role", async () => {
  const token = await getToken(
    "testadmin@example.com",
    "TestAdmin@123"
  );

  const response = await request(app)
    .get("/api/users?role=USER")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.data.length).toBeGreaterThan(0);

  for (const user of response.body.data) {
    expect(user.role).toBe("USER");
  }
});

test("ADMIN should be able to filter active employees", async () => {
  const token = await getToken(
    "testadmin@example.com",
    "TestAdmin@123"
  );

  const response = await request(app)
    .get("/api/users?status=ACTIVE")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.data.length).toBeGreaterThan(0);

  for (const user of response.body.data) {
    expect(user.isActive).toBe(true);
  }
});

test("should reject an invalid role filter", async () => {
  const token = await getToken(
    "testadmin@example.com",
    "TestAdmin@123"
  );

  const response = await request(app)
    .get("/api/users?role=INVALID")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(400);
});

});

afterAll(async () => {
  await User.sequelize.close();
});
