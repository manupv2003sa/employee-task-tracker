
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

jest.mock("multer", () => {
  const multer = jest.fn((options) => ({
    options,
  }));

  multer.diskStorage = jest.fn((options) => options);

  return multer;
});

const multer = require("multer");

describe("Upload middleware configuration", () => {
  let upload;

beforeAll(() => {
  upload = require("../../src/middlewares/upload");
});


  it("should configure disk storage", () => {
    expect(multer).toHaveBeenCalledWith(
      expect.objectContaining({
        storage: expect.any(Object),
        limits: {
          fileSize: 2 * 1024 * 1024,
          files: 1,
        },
        fileFilter: expect.any(Function),
      })
    );

    expect(multer.diskStorage).toHaveBeenCalledWith({
      destination: expect.any(Function),
      filename: expect.any(Function),
    });
  });

  it("should create the upload directory recursively", () => {
    const expectedDir = path.join(
      process.cwd(),
      "uploads",
      "profiles"
    );

    expect(fs.existsSync(expectedDir)).toBe(true);
  });

  describe("destination callback", () => {
    it("should use the profiles upload directory", () => {
      const storage = multer.diskStorage.mock.results[0].value;
      const cb = jest.fn();

      storage.destination({}, {}, cb);

      expect(cb).toHaveBeenCalledWith(
        null,
        path.join(process.cwd(), "uploads", "profiles")
      );
    });
  });

  describe("filename callback", () => {
    it.each([
      ["image/jpeg", ".jpg"],
      ["image/png", ".png"],
      ["image/webp", ".webp"],
    ])("should generate a unique filename for %s", (mimetype, extension) => {
      const storage = multer.diskStorage.mock.results[0].value;
      const cb = jest.fn();
      const uuidSpy = jest
        .spyOn(crypto, "randomUUID")
        .mockReturnValue("test-uuid");

      try {
        storage.filename({}, { mimetype }, cb);

        expect(cb).toHaveBeenCalledWith(
          null,
          `test-uuid${extension}`
        );
      } finally {
        uuidSpy.mockRestore();
      }
    });

    it("should reject unsupported image formats", () => {
      const storage = multer.diskStorage.mock.results[0].value;
      const cb = jest.fn();

      storage.filename({}, { mimetype: "image/gif" }, cb);

      expect(cb).toHaveBeenCalledWith(
        expect.any(Error)
      );
      expect(cb.mock.calls[0][0].message).toBe(
        "Unsupported image format"
      );
    });
  });

  describe("fileFilter", () => {
    it.each([
      "image/jpeg",
      "image/png",
      "image/webp",
    ])("should allow %s", (mimetype) => {
      const cb = jest.fn();

      upload.options.fileFilter({}, { mimetype }, cb);

      expect(cb).toHaveBeenCalledWith(null, true);
    });

    it.each([
      "image/gif",
      "text/plain",
      "application/pdf",
    ])("should reject %s", (mimetype) => {
      const cb = jest.fn();

      upload.options.fileFilter({}, { mimetype }, cb);

      expect(cb).toHaveBeenCalledWith(
        expect.any(Error)
      );
      expect(cb.mock.calls[0][0].message).toBe(
        "Only JPEG, PNG, and WebP are allowed"
      );
    });
  });
});

