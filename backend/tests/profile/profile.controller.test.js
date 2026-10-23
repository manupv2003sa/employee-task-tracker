
jest.mock("../../src/services/profile.service", () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
}));

jest.mock("../../src/models", () => ({
  User: {
    findByPk: jest.fn(),
  },
}));

jest.mock("../../src/middlewares/upload", () => ({
  single: jest.fn(() => (req, res, next) => next()),
}));

const profileService = require("../../src/services/profile.service");
const { User } = require("../../src/models");

const {
  getProfileController,
  updateProfileController,
  changePasswordController,
  uploadProfilePicture,
} = require("../../src/controllers/profile.controller");

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("Profile Controller - getProfileController", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return the user's profile", async () => {
    const profile = { id: "user-1", name: "Test User" };
    profileService.getProfile.mockResolvedValue(profile);

    const req = { user: { userId: "user-1" } };
    const res = mockResponse();

    await getProfileController(req, res);

    expect(profileService.getProfile).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: profile,
    });
  });

  it("should return 404 when the user does not exist", async () => {
    profileService.getProfile.mockRejectedValue(new Error("User not found"));

    const req = { user: { userId: "missing-user" } };
    const res = mockResponse();

    await getProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User not found",
    });
  });

  it("should return 500 for unexpected errors", async () => {
    profileService.getProfile.mockRejectedValue(new Error("Database error"));

    const req = { user: { userId: "user-1" } };
    const res = mockResponse();

    await getProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Database error",
    });
  });
});

describe("Profile Controller - updateProfileController", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should update the profile successfully", async () => {
    const profile = { id: "user-1", name: "New Name" };
    profileService.updateProfile.mockResolvedValue(profile);

    const req = {
      user: { userId: "user-1" },
      body: { name: "  New Name  " },
    };
    const res = mockResponse();

    await updateProfileController(req, res);

    expect(profileService.updateProfile).toHaveBeenCalledWith("user-1", {
      name: "New Name",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  });

  it.each([
    ["missing name", undefined],
    ["empty name", ""],
    ["whitespace-only name", "   "],
    ["non-string name", 123],
  ])("should reject %s", async (_description, name) => {
    const req = { user: { userId: "user-1" }, body: { name } };
    const res = mockResponse();

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(profileService.updateProfile).not.toHaveBeenCalled();
  });

  it("should reject names longer than 100 characters", async () => {
    const req = {
      user: { userId: "user-1" },
      body: { name: "a".repeat(101) },
    };
    const res = mockResponse();

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Name must not exceed 100 characters",
    });
    expect(profileService.updateProfile).not.toHaveBeenCalled();
  });

  it("should return 404 when the user does not exist", async () => {
    profileService.updateProfile.mockRejectedValue(new Error("User not found"));

    const req = {
      user: { userId: "missing-user" },
      body: { name: "New Name" },
    };
    const res = mockResponse();

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 500 for unexpected errors", async () => {
    profileService.updateProfile.mockRejectedValue(new Error("Database error"));

    const req = {
      user: { userId: "user-1" },
      body: { name: "New Name" },
    };
    const res = mockResponse();

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("Profile Controller - changePasswordController", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should change the password successfully", async () => {
    profileService.changePassword.mockResolvedValue(true);

    const req = {
      user: { userId: "user-1" },
      body: {
        currentPassword: "OldPassword@123",
        newPassword: "NewPassword@123",
        confirmPassword: "NewPassword@123",
      },
    };
    const res = mockResponse();

    await changePasswordController(req, res);

    expect(profileService.changePassword).toHaveBeenCalledWith(
      "user-1",
      "OldPassword@123",
      "NewPassword@123"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Password changed successfully",
    });
  });

  it("should reject missing password fields", async () => {
    const req = {
      user: { userId: "user-1" },
      body: { currentPassword: "OldPassword@123" },
    };
    const res = mockResponse();

    await changePasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(profileService.changePassword).not.toHaveBeenCalled();
  });

  it("should reject a new password shorter than 8 characters", async () => {
    const req = {
      user: { userId: "user-1" },
      body: {
        currentPassword: "OldPassword@123",
        newPassword: "short",
        confirmPassword: "short",
      },
    };
    const res = mockResponse();

    await changePasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(profileService.changePassword).not.toHaveBeenCalled();
  });

  it("should reject mismatched passwords", async () => {
    const req = {
      user: { userId: "user-1" },
      body: {
        currentPassword: "OldPassword@123",
        newPassword: "NewPassword@123",
        confirmPassword: "DifferentPassword@123",
      },
    };
    const res = mockResponse();

    await changePasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(profileService.changePassword).not.toHaveBeenCalled();
  });

  it("should reject reusing the current password", async () => {
    const req = {
      user: { userId: "user-1" },
      body: {
        currentPassword: "SamePassword@123",
        newPassword: "SamePassword@123",
        confirmPassword: "SamePassword@123",
      },
    };
    const res = mockResponse();

    await changePasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(profileService.changePassword).not.toHaveBeenCalled();
  });

  it("should return 404 when the user does not exist", async () => {
    profileService.changePassword.mockRejectedValue(new Error("User not found"));

    const req = {
      user: { userId: "missing-user" },
      body: {
        currentPassword: "OldPassword@123",
        newPassword: "NewPassword@123",
        confirmPassword: "NewPassword@123",
      },
    };
    const res = mockResponse();

    await changePasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should handle an incorrect current password", async () => {
    profileService.changePassword.mockRejectedValue(
      new Error("Current password is incorrect")
    );

    const req = {
      user: { userId: "user-1" },
      body: {
        currentPassword: "OldPassword@123",
        newPassword: "NewPassword@123",
        confirmPassword: "NewPassword@123",
      },
    };
    const res = mockResponse();

    await changePasswordController(req, res);

    // This currently documents the controller's existing behavior.
    // We can improve it after running the tests.
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("should return 500 for unexpected errors", async () => {
    profileService.changePassword.mockRejectedValue(new Error("Database error"));

    const req = {
      user: { userId: "user-1" },
      body: {
        currentPassword: "OldPassword@123",
        newPassword: "NewPassword@123",
        confirmPassword: "NewPassword@123",
      },
    };
    const res = mockResponse();

    await changePasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("Profile Controller - uploadProfilePicture", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should reject a request without an uploaded file", async () => {
    const req = { user: { userId: "user-1" } };
    const res = mockResponse();

    await uploadProfilePicture(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please select a picture",
    });
    expect(User.findByPk).not.toHaveBeenCalled();
  });

  it("should return 404 if the user does not exist", async () => {
    User.findByPk.mockResolvedValue(null);

    const req = {
      user: { userId: "missing-user" },
      file: {
        path: "uploads/profiles/new.png",
        filename: "new.png",
      },
    };
    const res = mockResponse();

    await uploadProfilePicture(req, res);

    expect(User.findByPk).toHaveBeenCalledWith("missing-user");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 500 if saving the profile picture fails", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    User.findByPk.mockResolvedValue({
      profilePicture: null,
      save: jest.fn().mockRejectedValue(new Error("Database error")),
    });

    const req = {
      user: { userId: "user-1" },
      file: {
        path: "uploads/profiles/new.png",
        filename: "new.png",
      },
    };
    const res = mockResponse();

    try {
      await uploadProfilePicture(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to update profile picture",
      });
    } finally {
      errorSpy.mockRestore();
    }
  });
});
