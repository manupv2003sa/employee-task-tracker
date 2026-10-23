
jest.mock("../../src/models", () => ({
  User: {
    findByPk: jest.fn(),
  },
}));

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const { User } = require("../../src/models");
const bcrypt = require("bcrypt");
const profileService = require("../../src/services/profile.service");

describe("Profile Service - getProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the user's profile", async () => {
    const user = {
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      role: "USER",
    };

    User.findByPk.mockResolvedValue(user);

    const result = await profileService.getProfile("user-123");

    expect(User.findByPk).toHaveBeenCalledWith("user-123", {
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "isActive",
        "profilePicture",
        "createdAt",
        "updatedAt",
      ],
    });
    expect(result).toEqual(user);
  });

  it("should throw when the user does not exist", async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(
      profileService.getProfile("missing-user")
    ).rejects.toThrow("User not found");
  });

  it("should propagate database errors", async () => {
    User.findByPk.mockRejectedValue(new Error("Database error"));

    await expect(
      profileService.getProfile("user-123")
    ).rejects.toThrow("Database error");
  });
});

describe("Profile Service - updateProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update the user's name and return the refreshed profile", async () => {
    const user = {
      id: "user-123",
      name: "Old Name",
      save: jest.fn().mockResolvedValue(true),
    };

    const updatedProfile = {
      id: "user-123",
      name: "New Name",
      email: "test@example.com",
    };

    User.findByPk
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(updatedProfile);

    const result = await profileService.updateProfile("user-123", {
      name: "  New Name  ",
    });

    expect(user.name).toBe("New Name");
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(User.findByPk).toHaveBeenCalledTimes(2);
    expect(result).toEqual(updatedProfile);
  });

  it("should throw when the user does not exist", async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(
      profileService.updateProfile("missing-user", {
        name: "New Name",
      })
    ).rejects.toThrow("User not found");
  });

  it("should propagate errors when saving the profile fails", async () => {
    const user = {
      name: "Old Name",
      save: jest.fn().mockRejectedValue(new Error("Database error")),
    };

    User.findByPk.mockResolvedValue(user);

    await expect(
      profileService.updateProfile("user-123", {
        name: "New Name",
      })
    ).rejects.toThrow("Database error");
  });
});

describe("Profile Service - changePassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should change the password when the current password is correct", async () => {
    const user = {
      id: "user-123",
      passwordHash: "old-hash",
      save: jest.fn().mockResolvedValue(true),
    };

    User.findByPk.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("new-hash");

    const result = await profileService.changePassword(
      "user-123",
      "OldPassword@123",
      "NewPassword@123"
    );

    expect(bcrypt.compare).toHaveBeenCalledWith(
      "OldPassword@123",
      "old-hash"
    );
    expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword@123", 10);
    expect(user.passwordHash).toBe("new-hash");
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it("should throw when the user does not exist", async () => {
    User.findByPk.mockResolvedValue(null);

    await expect(
      profileService.changePassword(
        "missing-user",
        "OldPassword@123",
        "NewPassword@123"
      )
    ).rejects.toThrow("User not found");

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it("should reject an incorrect current password", async () => {
    User.findByPk.mockResolvedValue({
      passwordHash: "old-hash",
      save: jest.fn(),
    });

    bcrypt.compare.mockResolvedValue(false);

    await expect(
      profileService.changePassword(
        "user-123",
        "WrongPassword@123",
        "NewPassword@123"
      )
    ).rejects.toThrow("Current password is incorrect");

    expect(bcrypt.hash).not.toHaveBeenCalled();
  });

  it("should propagate errors when saving the new password fails", async () => {
    const user = {
      passwordHash: "old-hash",
      save: jest.fn().mockRejectedValue(new Error("Database error")),
    };

    User.findByPk.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("new-hash");

    await expect(
      profileService.changePassword(
        "user-123",
        "OldPassword@123",
        "NewPassword@123"
      )
    ).rejects.toThrow("Database error");
  });
});
